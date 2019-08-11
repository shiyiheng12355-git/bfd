import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Form, Input, Select, Modal, InputNumber, TimePicker } from 'antd';
import lodash from 'lodash';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { sm: 6 },
  wrapperCol: { sm: 12 },
}
@Form.create({
  onValuesChange: (props, values) => {
    const { templateId } = values;
    if (templateId) {
      const template = props.templateList.find(t => t.id === templateId);
      if (!template) return;
      let dropList = []; // 过滤出需要获取下拉列表项的参数
      let jsonArr = template.strategyParamJson ?
        JSON.parse(template.strategyParamJson) : [];
      jsonArr.forEach((param) => {
        const list = param.parameters.filter(p => p.parameter_option === 1).map(p => p.parameter_source);
        dropList = dropList.concat(list);
      })
      dropList = lodash.uniq(dropList);
      const { currentRecomCfg: { entityId } } = props;
      if (!entityId) return;
      dropList.forEach((key) => {
        props.dispatch({
          type: 'marketing/recommendation/fetchParamSource',
          payload: { key, entityId },
        })
      })
    }
  },
})
class StrategyModal extends Component {
  componentWillMount() {
    let { form: { getFieldDecorator, setFieldsValue }, node } = this.props;
    const { value = {} } = node;
    getFieldDecorator('id'); // 注册
    getFieldDecorator('templateId');
    this.templateId = value.templateId !== 0 ? value.templateId : undefined; // 保存
    setFieldsValue({ // 赋值
      templateId: this.templateId,
      id: value.id,
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   let { form: { getFieldDecorator, setFieldsValue }, node } = nextProps;
  //   if (node && node !== this.props.node) { // 初始化
  //     const { value = {} } = node;
  //     getFieldDecorator('id'); // 注册
  //     getFieldDecorator('templateId');
  //     this.templateId = value.templateId !== 0 ? value.templateId : undefined; // 保存
  //     setFieldsValue({ // 赋值
  //       templateId: this.templateId,
  //       id: value.id,
  //     })
  //   }
  // }

  parseData = () => {
    let { templateList, form: { getFieldsValue } } = this.props;
    const { templateId } = getFieldsValue();
    const strategyTemplate = templateList.find(item => item.id === templateId) || {};
    let jsonArr = strategyTemplate.strategyParamJson ?
      JSON.parse(strategyTemplate.strategyParamJson) : [];
    jsonArr = lodash.isArray(jsonArr) ? jsonArr : [];
    return { jsonArr, strategyTemplate }
  }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const template = this.props.templateList.find(i => i.id === values.templateId);
        const valueJson = { ...values.valueJson, templateRule: template.strategyContent };
        values.valueJson = JSON.stringify(valueJson);
        this.props.dispatch({
          type: 'marketing/recommendation/updateRecomPolicy',
          payload: values,
          callback: () => {
            this.props.onOk(values);
            this.props.form.resetFields();
          },
        })
      }
    })
  }

  renderFormItems = (jsonArr, value, strategyTemplate) => {
    let { valueJson } = value;
    if (valueJson && this.templateId === strategyTemplate.id) { // 此时选择的模板ID同一开始配置模板ID的一致
      valueJson = JSON.parse(valueJson);
    } else { valueJson = {}; }
    const { paramSources = {}, form: { getFieldDecorator } } = this.props;
    return jsonArr.map((p, index) => {
      const { parameters = [] } = p;
      return (
        <div key={`p_${index}`}>
          <h4>{p.parameter_type_name}</h4>
          {
            parameters.map((subP, index1) => {
              let El = <Input />
              const option = {
                initialValue: valueJson[subP.parameter_id],
                rules: [{ required: true, message: '必填字段' }],
              }
              if (subP.parameter_option === 1) { // 下拉列表
                const list = paramSources[subP.parameter_source] || [];
                const isMultiple = subP.parameter_source === 'USER_BEHAVIOR_PARAM'; // 多选
                El = (
                  <Select mode={isMultiple ? 'multiple' : 'default'}>
                    {
                      list.map((item) => {
                        return (<Option value={item.key}
                          key={item.key}>
                          {item.label}
                        </Option>)
                      })
                    }
                  </Select>)
              } else {
                let type = subP.parameter_type;
                if (type === 'int') {
                  type = 'integer';
                  El = <InputNumber />
                } else if (type === 'float' || type === 'double') {
                  El = <InputNumber />
                  type = 'float';
                } else if (type === 'boolean') {
                  El = <Checkbox />
                  option.valuePropName = 'checked';
                } else if (type === 'date') {
                  type = 'string';
                }
                option.rules.push({
                  type,
                  message: `输入数据不是${subP.parameter_type}类型`,
                })
              }
              return (
                <FormItem
                  {...formItemLayout}
                  key={`${p.parameter_type_name}_${index1}`}
                  label={subP.parameter_name}>
                  {
                    getFieldDecorator(`valueJson.${subP.parameter_id}`, option)(El)
                  }
                </FormItem>)
            }
            )
          }
        </div>)
    })
  }

  render() {
    let { form: { getFieldDecorator }, templateList, node } = this.props;
    node = node || {};
    const { value = {} } = node;
    const { strategyTemplate, jsonArr = [] } = this.parseData();
    return (
      <Modal
        maskClosable={false}
        {...this.props}
        title={strategyTemplate.strategyName || '策略选择'}
        onOk={this.onOk}>
        <Form>
          <FormItem label='选择策略模板'>
            {
              getFieldDecorator('templateId', {
                rules: [{ required: true, message: '必填字段' }],
              })(
                <Select>{
                  templateList.map((temp) => {
                    return (<Option
                      value={temp.id}
                      key={temp.id}>
                      {temp.strategyName}
                    </Option>)
                  })
                }</Select>
              )
            }
          </FormItem>
          <h4>填充策略参数</h4>
          {
            this.renderFormItems(jsonArr, value, strategyTemplate)
          }
        </Form>
      </Modal>
    );
  }
}

StrategyModal.propTypes = {

};

export default StrategyModal;