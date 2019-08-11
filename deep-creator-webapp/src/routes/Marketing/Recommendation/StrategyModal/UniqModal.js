import React, { Component, PropTypes } from 'react';
import { Form, Input, Select, Radio, Col, Modal, InputNumber } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;

const RadioGroup = Radio.Group;
const TimeEnum = [
  { name: '秒', value: 1000 },
  { name: '分钟', value: 60 * 1000 },
  { name: '小时', value: 60 * 60 * 1000 },
  { name: '天', value: 24 * 60 * 60 * 1000 },
  { name: '周', value: 7 * 24 * 60 * 60 * 1000 },
  { name: '月', value: 30 * 24 * 60 * 60 * 1000 },
  { name: '年', value: 365 * 24 * 60 * 60 * 1000 },
];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
@Form.create()
class UniqModal extends Component {
  componentWillMount() {
    let { form: { getFieldDecorator, setFieldsValue }, node, currentRecomCfg } = this.props;
    const { entityId } = currentRecomCfg;
    if (!entityId) return
    this.props.dispatch({
      type: 'marketing/recommendation/fetchParamSource',
      payload: { key: 'RECOM_ID_ATTRIBUTE', entityId },
    })
    const deduplication = node && node.value && node.value.deduplication;
    const _deduplication = deduplication ? JSON.parse(deduplication) : {};
    getFieldDecorator('enable');
    getFieldDecorator('id'); // 注册
    getFieldDecorator('field');
    setFieldsValue({
      enable: deduplication ? '1' : '0',
      id: node.value.id,
      field: _deduplication.field,
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.visible && nextProps.visible !== this.props.visible) {
  //     const entityId = nextProps.currentRecomCfg.entityId;
  //     if (!entityId) return
  //     this.props.dispatch({
  //       type: 'marketing/recommendation/fetchParamSource',
  //       payload: { key: 'RECOM_ID_ATTRIBUTE', entityId },
  //     })
  //   }
  //   let { form: { getFieldDecorator, setFieldsValue }, node } = nextProps;
  //   if (node && node !== this.props.node) { // 编辑
  //     const { value = {} } = node;
  //     const { deduplication } = value;
  //     const _deduplication = deduplication ? JSON.parse(deduplication) : {};
  //     getFieldDecorator('enable');
  //     getFieldDecorator('id'); // 注册
  //     getFieldDecorator('field');
  //     setFieldsValue({
  //       enable: deduplication ? '1' : '0',
  //       id: value.id,
  //       field: _deduplication.field,
  //     })
  //   }
  // }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { field, enable } = values;
        values.deduplication = JSON.stringify({ field });
        if (enable === '0') values.deduplication = '';
        this.props.dispatch({
          type: 'marketing/recommendation/updateRecomPolicy',
          payload: values,
        })
        this.props.onOk(values);
        this.props.form.resetFields();
      }
    });
  }

  render() {
    let { form: { getFieldDecorator, getFieldsValue }, paramSources } = this.props;
    const { enable } = getFieldsValue();

    return (
      <Modal
        maskClosable={false}
        title='是否去重'
        {...this.props}
        onOk={this.onOk}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label='是否去重'
          >{
              getFieldDecorator('enable', {
              })(
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )
            }
          </FormItem>
          {
            enable === '1' &&
            <FormItem
              {...formItemLayout}
              label="按属性去重"
            >{
                getFieldDecorator('field', {
                })(
                  <Select>
                    {
                      (paramSources.RECOM_ID_ATTRIBUTE || []).map((param) => {
                        return (<Option
                          value={param.key}
                          key={param.key}>
                          {param.label}
                        </Option>)
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
          }
        </Form>
      </Modal >);
  }
}

UniqModal.propTypes = {
};

export default UniqModal;
