import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Form, Input, Col, Icon, Radio, Select, notification, Button,
} from 'antd';
import uuid from 'uuid';
import lodash from 'lodash';
import config from '../../../../../utils';
import styles from './EditPolicyTemplateModal.less';

const VALUE_TYPE = [
  { title: 'int', value: 'int' },
  { title: 'float', value: 'float' },
  { title: 'double', value: 'double' },
  { title: 'boolean', value: 'boolean' },
  { title: 'string', value: 'string' },
  { title: '时间', value: 'date' },
]
const RadioGroup = Radio.Group;
const { Option } = Select;
const FormItem = Form.Item;

const { TextArea } = Input;

const formItemLayout = {
  labelCol: { sm: { span: 4 }, offset: 3 },
  wrapperCol: { sm: { span: 8 } },
}

@Form.create()
export default class EditPolicyTemplateModal extends PureComponent {
  componentDidMount() {
    const { form: { getFieldDecorator, setFieldsValue, getFieldsValue }, editTemplate } = this.props;
    getFieldDecorator('paramGroups');
    const fields = getFieldsValue();
    const hasInit = !!fields.paramGroups;
    if (editTemplate) { // 编辑
      const json = JSON.parse(editTemplate.strategyParamJson);
      const paramGroups = [];
      json.forEach((group) => {
        const key = uuid.v1();
        paramGroups.push(key);
        const parameters = {}; // 编辑时回填数据
        getFieldDecorator(`parameter_type.${key}.parameter_type_name`,
          { initialValue: group.parameter_type_name });
        group.parameters.map((parameter) => {
          const param = uuid.v1();
          getFieldDecorator(`parameter_type.${key}.parameters.${param}.parameter_option`,
            { initialValue: parameter.parameter_option });
          getFieldDecorator(`parameter_type.${key}.parameters.${param}.parameter_type`,
            { initialValue: parameter.parameter_type });
          getFieldDecorator(`parameter_type.${key}.parameters.${param}.parameter_id`,
            { initialValue: parameter.parameter_id });
          getFieldDecorator(`parameter_type.${key}.parameters.${param}.parameter_name`,
            { initialValue: parameter.parameter_name });
          getFieldDecorator(`parameter_type.${key}.parameters.${param}.parameter_source`,
            { initialValue: parameter.parameter_source });
          parameters[param] = parameter;
        })
        getFieldDecorator(`parameter_type.${key}.paramKeys`,
          { initialValue: Object.keys(parameters) });
      });
      setFieldsValue({ paramGroups });
    }

    if (!editTemplate && !hasInit) { // 新建
      const key = uuid.v1();
      getFieldDecorator(`parameter_type.${key}.paramKeys`);
      const param = uuid.v1();
      setFieldsValue({ paramGroups: [key], [`parameter_type.${key}.paramKeys`]: [param] });
    }
  }

  addParamGroup = (key) => {
    const { getFieldsValue, setFieldsValue, getFieldDecorator } = this.props.form;
    const { paramGroups = [] } = getFieldsValue();
    const index = paramGroups.indexOf(key);
    if (index < 0) return;

    const newKey = uuid.v1();
    getFieldDecorator(`parameter_type.${newKey}.paramKeys`);
    const param = uuid.v1();
    paramGroups.splice(index + 1, 0, newKey);
    setFieldsValue({
      paramGroups: [...paramGroups],
      [`parameter_type.${newKey}.paramKeys`]: [param],
    });
  }

  removeParamGroup = (key) => {
    const { getFieldsValue, setFieldsValue } = this.props.form;
    const { paramGroups = [] } = getFieldsValue();
    setFieldsValue({
      paramGroups: paramGroups.filter(item => item !== key),
      [`parameter_type.${key}.paramKeys`]: undefined,
    });
  }

  addParam = (key, paramKey) => {
    const { getFieldsValue, setFieldsValue } = this.props.form;
    const paramKeys = getFieldsValue().parameter_type[key].paramKeys || [];
    const index = paramKeys.indexOf(paramKey);
    if (index < 0) return;
    paramKeys.splice(index + 1, 0, uuid.v1());
    setFieldsValue({ [`parameter_type.${key}.paramKeys`]: [...paramKeys] });
  }

  removeParam = (key, paramKey) => {
    const { getFieldsValue, setFieldsValue } = this.props.form;
    const paramKeys = getFieldsValue().parameter_type[key].paramKeys || [];
    setFieldsValue({ [`parameter_type.${key}.paramKeys`]: paramKeys.filter(item => item !== paramKey) });
  }
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err && values) {
        const { paramGroups } = values;
        const param = {
          strategyParamJson: '',
          strategyContent: values.strategyContent,
          strategyName: values.strategyName,
          id: values.id,
        }
        // console.log(values);
        const parameterType = Object.values(lodash.pick(values.parameter_type, paramGroups))
          .map((paramGroup) => {
            return {
              parameters: Object.values(lodash.pick(paramGroup.parameters, paramGroup.paramKeys)),
              parameter_type_name: paramGroup.parameter_type_name,
            }
          })

        let compiled = lodash.template(param.strategyContent); // 验证模板和声明的变量是否配置
        try {
          const allParameters = {}; // 所有的可配置参数
          parameterType.forEach(({ parameters }) => {
            parameters.forEach((p) => {
              allParameters[p.parameter_id] = true
            })
          })
          compiled(allParameters);
          param.strategyParamJson = JSON.stringify(parameterType);

          const { editTemplate, dispatch, form: { resetFields } } = this.props;
          editTemplate ?
            dispatch({
              type: 'sysconfig/marketing/editTemplate',
              payload: param,
              callback: () => dispatch({
                type: 'sysconfig/marketing/fetchTemplateList',
                payload: {},
              }),
            }) :
            dispatch({
              type: 'sysconfig/marketing/addTemplate',
              payload: param,
              callback: () => dispatch({
                type: 'sysconfig/marketing/fetchTemplateList',
                payload: {},
              }),
            });
          resetFields();
          this.props.onOk(values);
          this.setState({ visible: false })
        } catch (e) {
          notification.error({ message: '模板声明的变量没有配置参数ID', description: e.message });
        }
      }
    })
  }

  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onCancel();
  }
  handleDebugRule = () => {
    const { form: { getFieldsValue }, dispatch } = this.props;
    const { strategyContent } = getFieldsValue();
    if (!strategyContent) return notification.error({ message: '请填写策略规则后再调试' })
    dispatch({
      type: 'sysconfig/marketing/debugRule',
      payload: { regular: strategyContent },
    })
  }

  renderParamGroups = () => {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { paramGroups = [] } = getFieldsValue();
    return paramGroups.map((key, index) => {
      const num = index + 1;
      const fields = getFieldsValue();
      const parameters = (fields.parameter_type || {})[key] || { parameters: {} };
      const paramKeys = parameters.paramKeys;
      return (
        <div key={key} className={styles.paramRow}>
          <FormItem
            labelCol={{ sm: { span: 3 } }}
            label={`参数分类${num}`}>
            <Col span={8}>
              {
                getFieldDecorator(`parameter_type.${key}.parameter_type_name`, {
                  rules: [{ required: true, message: '必填字段' }],
                })(<Input />)
              }
            </Col>
            <div className={styles.btns}>
              <span>
                <Icon type='plus-circle-o' style={{ marginRight: '6px' }} onClick={this.addParamGroup.bind(this, key)} />
                {paramGroups.length > 1 &&
                  <Icon type='minus-circle-o' onClick={this.removeParamGroup.bind(this, key)} />}
              </span>
            </div>
          </FormItem>
          <FormItem>
            <Col span={4}>参数id</Col>
            <Col span={4}>参数名称</Col>
            <Col span={8}>配置形式</Col>
          </FormItem>
          {
            paramKeys.map((paramKey, _index) => {
              const _num = _index + 1;
              const prefix = `parameter_type.${key}.parameters.${paramKey}`;

              const paramOption = ((parameters.parameters || {})[paramKey] || {}).parameter_option || 0;

              return (<div key={paramKey}>
                <FormItem>
                  <Col span={4} style={{ padding: '0 2px' }}>
                    <FormItem>
                      {getFieldDecorator(`${prefix}.parameter_id`, {
                        rules: [{ required: true, message: '必填字段' }],
                      })(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={4} style={{ padding: '0 2px' }}>
                    <FormItem>
                      {getFieldDecorator(`${prefix}.parameter_name`, {
                        rules: [{ required: true, message: '必填字段' }],
                      })(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8} style={{ padding: '0 2px' }}>
                    <FormItem>
                      {getFieldDecorator(`${prefix}.parameter_option`, {
                        initialValue: paramOption,
                        rules: [{ required: true, message: '必填字段' }],
                      })(
                        <RadioGroup>
                          <Radio value={0}>输入框</Radio>
                          <Radio value={1}>下拉备选菜单</Radio>
                        </RadioGroup>)}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    {
                      paramOption === 0 &&
                      <FormItem>
                        {getFieldDecorator(`${prefix}.parameter_type`, {
                          rules: [{ required: true, message: '必填字段' }],
                        })(
                          <Select dropdownStyle={{ height: '120px', overflow: 'auto' }}>
                            {
                              VALUE_TYPE.map((type, index2) => {
                                return (<Option key={`type_${index2}`}
                                  value={type.value}
                                >
                                  {type.title}</Option>)
                              })
                            }
                          </Select>
                        )}
                      </FormItem>
                    }
                    {
                      paramOption === 1 &&
                      <FormItem>
                        {getFieldDecorator(`${prefix}.parameter_source`, {
                          rules: [{ required: true, message: '必填字段' }],
                        })(
                          <Select dropdownStyle={{ height: '120px', overflow: 'auto' }}>
                            {
                              config.CODE_KEYS.map((source) => {
                                return (
                                  <Option key={source.key}
                                    value={source.key}>
                                    {source.name}
                                  </Option>)
                              })
                            }
                          </Select>)}
                      </FormItem>
                    }
                  </Col>
                  <Col span={2} style={{ textAlign: 'center' }}>
                    <span>
                      <Icon type='plus-circle-o'
                        onClick={this.addParam.bind(this, key, paramKey)}
                        style={{ marginRight: '4px' }} />
                      {
                        paramKeys.length > 1 &&
                        <Icon type='minus-circle-o'
                          onClick={this.removeParam.bind(this, key, paramKey)} />}
                    </span>
                  </Col>
                </FormItem>
              </div>)
            })
          }
        </div>)
    })
  }

  render() {
    let { form: { getFieldDecorator }, editTemplate } = this.props;
    editTemplate = editTemplate || {};
    getFieldDecorator('id', { initialValue: editTemplate.id });

    return (
      <Modal
        maskClosable={false}
        {...this.props}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label='策略模板名称'>
            {
              getFieldDecorator('strategyName', {
                initialValue: editTemplate.strategyName,
                rules: [{ required: true, message: '必填字段' }, {
                  max: 20, message: '最长不超过20个字符',
                }],
              })(
                <Input />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='策略模板内容'>
            {
              getFieldDecorator('strategyContent', {
                initialValue: editTemplate.strategyContent,
                rules: [{ required: true, message: '必填字段' }],
              })(
                <TextArea placeholder='请输入策略模板' rows={5} />)
            }
          </FormItem>
          <FormItem>
            <Button type='primary' onClick={this.handleDebugRule}>调试</Button>
          </FormItem>
          <h4>可配置参数:</h4>
          {
            this.renderParamGroups()
          }
        </Form>
      </Modal >
    );
  }
}

EditPolicyTemplateModal.propTypes = {

};
