import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Button, Radio, notification } from 'antd';
import uuid from 'uuid';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
}
const AutoTagModal = Form.create()((props) => {
  const { form: { getFieldDecorator }, groupNode } = props;

  const handleOk = () => {
    const entityId = groupNode.extra_info.entity_id;
    props.form.validateFields((err, values) => {
      if (!err) {
        props.dispatch({
          type: 'marketing/automation/addAutoTag',
          payload: { ...values, entityId },
          callback: () => {
            props.onOk();
            props.form.resetFields();
          },
        })
      }
    })
  }

  const handleCancel = () => {
    props.onCancel();
    props.form.resetFields();
  }

  return (
    <Modal
      title='添加自动标签'
      {...props}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
    >
      <Form>
        <Form.Item {...formItemLayout} label='标签名称'>
          {
            getFieldDecorator('tagValueTitle', {
              rules: [{ required: true, message: '必填字段' }],
            })(<Input />)
          }
        </Form.Item>
      </Form>
    </Modal>)
})

@Form.create()
class AutomationTagModal extends Component {
  state = {
    showModal: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      const { groupNode, dispatch } = nextProps;
      if (!groupNode || !groupNode.extra_info || !groupNode.extra_info.entity_id) {
        return notification.warn({ message: '请先选择一个群组' })
      }
      dispatch({
        type: 'marketing/automation/fetchAutoTagList',
        payload: { entityId: groupNode.extra_info.entity_id },
      })
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const node = {
          type: 'AUTOTAG',
          interval: 0,
          deletable: true,
          branch_list: [{ condition: '', child_id: uuid.v1() }],
        }
        node.extra_info = {
          tag_name: 'automatic_tag',
          tag_value: values.extra_info,
        };
        this.props.onOk(node);
      }
    })
  }

  handleToggleModal = () => {
    this.setState({ showModal: true });
  }

  render() {
    const { groupNode, autoTagList = [], form: { getFieldDecorator }, dispatch } = this.props;
    if (!groupNode) return false;
    const entityId = groupNode.extra_info.entity_id;

    const modalProps = {
      visible: this.state.showModal,
      dispatch,
      groupNode,
      onOk: () => {
        this.props.dispatch({
          type: 'marketing/automation/fetchAutoTagList',
          payload: { entityId },
        })
        this.setState({ showModal: false });
      },
      onCancel: () => this.setState({ showModal: false }),
    }
    return (
      <Modal
        {...this.props}
        onOk={this.handleOk}>
        <Form>
          <Button onClick={this.handleToggleModal} type='primary'>
            添加自动标签</Button>
          <Form.Item label='选择自动标签'>
            {
              getFieldDecorator('extra_info', {
                rule: [{ required: true, message: '必填字段' }],
              })(
                <Radio.Group>

                  {
                    autoTagList.map((tag) => {
                      return (
                        <Radio key={tag.tagValueTitle} value={tag.tagValueTitle}>
                          {tag.tagValueTitle}
                        </Radio>)
                    })
                  }
                </Radio.Group>
              )
            }
          </Form.Item>
          <AutoTagModal {...modalProps} />
        </Form>
      </Modal>
    );
  }
}

AutomationTagModal.propTypes = {

};

export default AutomationTagModal;