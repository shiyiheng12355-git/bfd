import React, { Component, PropTypes } from 'react';
import { Form, Select, Input, Modal, Button, notification } from 'antd';
import Editor from '../Editor';

import CommonFormItems from './CommonFormItems';

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: { sm: { span: 4 } },
  wrapperCol: { sm: { span: 12 } },
}

@Form.create()
class SendEmailModal extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.dispatch({
        type: 'marketing/automation/fetchEmailGroups',
        payload: {},
      })
      this.props.dispatch({
        type: 'marketing/automation/fetchRecentMessageList',
        payload: { suiteType: 2 },
      })
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const extraInfo = values.extra_info;
        const node = {
          type: 'EMAIL',
          ...values,
        };
        const { recentMessage } = values;
        CommonFormItems.parseData(node, values);
        if (node.interval > 7 * 24 * 3600 || node.interval < 60) {
          return notification.error({ message: '转换周期应该在1分钟以上，７天以内' })
        }
        node.extra_info.header = recentMessage.content;
        if (extraInfo.template_id === 'add') {
          recentMessage.marketingSuiteType = 2;
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
    let name = '';
    if (id !== 'add') {
      const recentMessage = this.props.recentMessageList.find(msg => msg.id === id);
      if (recentMessage) {
        content = recentMessage.content;
        name = recentMessage.name;
      }
    }
    this.props.form.getFieldDecorator('recentMessage.content')
    this.props.form.getFieldDecorator('recentMessage.name')
    this.props.form.setFieldsValue({
      'recentMessage.content': content,
      'recentMessage.name': name,
    })
  }

  handleSendMsg = () => {
    const { form: { getFieldsValue } } = this.props;
    const { recentMessage, contact } = getFieldsValue();
    const param = {
      type: 1,
      message: recentMessage.content,
      contact,
    }
    this.props.dispatch({
      type: 'marketing/automation/sendMessage',
      payload: param,
    })
  }

  render() {
    let { emailGroups = [], recentMessageList = [],
      form: { getFieldDecorator } } = this.props;


    return (
      <Modal {...this.props}
        width='60%'
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label="选择Email内容">
            {
              getFieldDecorator('extra_info.template_id', {
                initialValue: 'add',
              })(<Select onChange={this.handleChangeTemplate}>
                {recentMessageList.map((tmp, index) => {
                  return <Option key={`tmp_${index}`} value={tmp.id}>{tmp.name}</Option>;
                })}
                <Option key="add" value='add'>新增邮件</Option>
              </Select>)
            }
          </FormItem>
          <FormItem label="Email标题"
            labelCol={{ sm: { span: 4 } }}
            wrapperCol={{ sm: { span: 18 } }}>
            {
              getFieldDecorator('recentMessage.name', {
              })(<Input />)
            }
          </FormItem>
          <FormItem label="Email内容"
            labelCol={{ sm: { span: 4 } }}
            wrapperCol={{ sm: { span: 18 } }}>
            {
              getFieldDecorator('recentMessage.content', {
                initialValue: '',
              })(<Editor />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='内容试发'
          >
            {getFieldDecorator('contact')(
              <Input placeholder='输入测试邮件地址,多个邮件地址用"，"分隔' />
            )
            } <Button type='primary' onClick={this.handleSendMsg}>发送</Button>
          </FormItem>
          <CommonFormItems
            messageGroupList={emailGroups}
            form={this.props.form} />
        </Form>
      </Modal>);
  }
}

SendEmailModal.propTypes = {
};

export default SendEmailModal;
