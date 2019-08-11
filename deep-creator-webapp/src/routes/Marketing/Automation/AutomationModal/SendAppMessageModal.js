import React, { Component, PropTypes } from 'react';
import { Form, Select, Input, Modal, notification } from 'antd';
import CommonFormItems from './CommonFormItems';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: { sm: { span: 6 } },
  wrapperCol: { sm: { span: 16 } },
}

@Form.create()
class SendAppMessageModal extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.dispatch({
        type: 'marketing/automation/fetchRecentMessageList',
        payload: { suiteType: 1 },
      })
      const { form: { setFieldsValue }, node } = this.props;
      if (node && node.extra_info) {
        setFieldsValue({ extra_info: node.extra_info })
      } else {
        setFieldsValue({ extra_info: {} })
      }
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { recentMessage } = values;
        const extraInfo = values.extra_info;
        const node = {
          type: 'PUSH',
          ...values,
        };
        CommonFormItems.parseData(node, values);
        if (node.interval > 7 * 24 * 3600 || node.interval < 60) {
          return notification.error({ message: '转换周期应该在1分钟以上，７天以内' })
        }
        const header = recentMessage.content.substr(0, 10);
        node.extra_info.header = recentMessage.content;
        if (extraInfo.template_id === 'add') {
          recentMessage.marketingSuiteType = 1;
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
    let name = '';
    if (id !== 'add') {
      const recentMessage = this.props.recentMessageList.find(msg => msg.id === id);
      content = recentMessage.content;
      name = recentMessage.name;
    }
    this.props.form.getFieldDecorator('recentMessage.name') // 注册
    this.props.form.setFieldsValue({
      'recentMessage.content': content,
      'recentMessage.name': name,
    })
  }

  render() {
    let { recentMessageList = [],
      form: { getFieldDecorator, getFieldsValue }, node } = this.props;
    const values = getFieldsValue();
    const extraInfo = values.extra_info || {};
    // const templateId = extraInfo.template_id;
    // const recentMessage = recentMessageList.find(msg => msg.id === templateId) || {};
    // const firstMsg = lodash.first(recentMessageList);

    return (
      <Modal {...this.props}
        width='50%'
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        maskClosable={false}
        >
        <Form>
          <FormItem label="选择应用消息内容"
            {...formItemLayout}
          >
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
                <Option key="add" value='add'>新增应用消息</Option>
              </Select>)
            }
          </FormItem>
          {
            extraInfo.template_id === 'add' &&
            <FormItem label='应用消息标题'
              {...formItemLayout}>
              {
                getFieldDecorator('recentMessage.name', {
                })(<Input />)
              }
            </FormItem>
          }
          <FormItem label="应用消息内容"
            {...formItemLayout}>
            {
              getFieldDecorator('recentMessage.content', {
                rules: [{ required: true, message: '必填字段' }],
              })(
                <TextArea rows={5} />
              )
            }
          </FormItem>
          <FormItem label='内容链接页面'
            {...formItemLayout}>
            {
              getFieldDecorator('content_url', {})(
                <Select>
                  <Option value='a' >客户现场-待开发</Option>
                </Select>
              )
            }
          </FormItem>
          <CommonFormItems
            messageGroupDisabled
            form={this.props.form}
            node={node} />
        </Form>
      </Modal>);
  }
}

SendAppMessageModal.propTypes = {
};

export default SendAppMessageModal;
