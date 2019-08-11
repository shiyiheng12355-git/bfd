import React, { Component, PropTypes } from 'react';
import {
  Form, Select, Input, Modal,
  Button, message, notification,
} from 'antd';

import CommonFormItems from './CommonFormItems';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: { sm: { span: 5 } },
  wrapperCol: { sm: { span: 15 } },
}

@Form.create()
class SendSmsModal extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.dispatch({
        type: 'marketing/automation/fetchSmsGroups',
        payload: {},
      })
      this.props.dispatch({
        type: 'marketing/automation/fetchRecentMessageList',
        payload: { suiteType: 0 },
      })
      const { form: { setFieldsValue }, node } = this.props;
      if (node && node.extra_info) {
        setFieldsValue({ extra_info: node.extra_info })
      } else {
        setFieldsValue({ extra_info: {} })
      }
    }
  }

  handleSendMsg = () => {
    const { form: { getFieldsValue } } = this.props;
    const { recentMessage, contact } = getFieldsValue();
    const param = {
      type: 0,
      message: recentMessage.content,
      contact,
    }
    this.props.dispatch({
      type: 'marketing/automation/sendMessage',
      payload: param,
    })
  }

  handelOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const extraInfo = values.extra_info;
        const { recentMessage } = values;
        const header = recentMessage.content.substr(0, 10); // 截取内容前十个字符作为header
        const node = {
          type: 'SMS',
          ...values,
        };
        CommonFormItems.parseData(node, values);
        if (node.interval > 7 * 24 * 3600 || node.interval < 60) {
          return notification.error({ message: '转换周期应该在1分钟以上，７天以内' })
        }
        node.extra_info.header = recentMessage.content;

        if (extraInfo.template_id === 'add') {
          recentMessage.marketingSuiteType = 0;
          recentMessage.name = header;
          this.props.dispatch({
            type: 'marketing/automation/saveRecentMessage',
            payload: recentMessage,
            callback: (err, id) => {
              node.extra_info.template_id = id;
              if (this.props.onOk) {
                this.props.onOk(node);
                this.props.form.resetFields();
              }
            },
          })
        } else if (this.props.onOk) {
          this.props.onOk(node);
          this.props.form.resetFields();
        }
      }
    })
  }

  handleCancel = () => {
    this.props.onCancel();
    this.props.form.resetFields();
  }

  handleChangeTemplate = (id) => {
    let content = '';
    if (id !== 'add') {
      const recentMessage = this.props.recentMessageList.find(msg => msg.id === id);
      content = recentMessage.content;
    }
    this.props.form.setFieldsValue({
      'recentMessage.content': content,
    })
  }
  render() {
    let { smsGroups = [], recentMessageList = [],
      form: { getFieldDecorator } } = this.props;
    // const firstMsg = lodash.first(recentMessageList);

    return (
      <Modal {...this.props}
        onOk={this.handelOk}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label="选择短信内容">
            {
              getFieldDecorator('extra_info.template_id', {
                initialValue: 'add',
                rules: [{ required: true, message: '必填字段' }],
              })(<Select onChange={this.handleChangeTemplate}>
                {
                  recentMessageList.map((tmp, index) => {
                    return <Option key={`tmp_${index}`} value={tmp.id}>{tmp.name}</Option>;
                  })
                }
                <Option key="add" value='add'>新增短信</Option>
              </Select>)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="内容预览">
            {
              getFieldDecorator('recentMessage.content', {
                rules: [{ required: true, message: '必填字段' }],
              })(<TextArea rows={5} />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='内容试发'
          >
            {
              getFieldDecorator('contact')(
                <Input placeholder='输入测试手机号码' />
              )
            } <Button type='primary' onClick={this.handleSendMsg}>发送</Button>
          </FormItem>
          <CommonFormItems
            form={this.props.form}
            messageGroupList={smsGroups}
            formItemLayout={formItemLayout} />
        </Form >
      </Modal >);
  }
}

SendSmsModal.propTypes = {
};

export default SendSmsModal;
