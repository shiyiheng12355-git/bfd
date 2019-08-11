import React, { Component } from 'react';
import { Form, Select, Modal } from 'antd';
import lodash from 'lodash';
import uuid from 'uuid';

const formItemLayout = {
  labelCol: { sm: { span: 6 } },
  wrapperCol: { sm: { span: 12 } },
}

@Form.create()
class ConcurrentActionModal extends Component {
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const node = { type: 'PARALLEL', interval: 0, extra_info: {}, deletable: true }
        const { parallel } = values;
        node.branch_list = lodash.range(0, parallel).map((count) => {
          return { condition: '', child_id: uuid.v1() }
        })
        this.props.onOk(node);
        this.props.form.resetFields();
      }
    })
  }


  handleCancel = () => {
    this.props.onCancel();
    this.props.form.resetFields();
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (<Modal
      {...this.props}
      onOk={this.handleOk}
      onCancel={this.handleCancel}
      maskClosable={false}
    >
      <Form.Item label='选择并发条数'
      {...formItemLayout}>
        {
          getFieldDecorator('parallel', {
            initialValue: 2,
          })(
            <Select>
              {
                lodash.range(2, 5).map((num) => {
                  return (<Select.Option
                    value={num}
                    key={num}>
                    {num}
                  </Select.Option>)
                })
              }
            </Select>
            )
        }
      </Form.Item>
    </Modal>);
  }
}

ConcurrentActionModal.propTypes = {
}

export default ConcurrentActionModal;