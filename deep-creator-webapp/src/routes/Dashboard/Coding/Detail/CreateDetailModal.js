import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Modal, Form } from 'antd';


const FormItem = Form.Item;
const { TextArea } = Input;

@connect(state => ({
  coding: state.coding,
}))

class CreateDetailModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.categoryCode = this.props.categoryCode
        this.props.dispatch({
          type: 'coding/fetchSaveDetailCategory',
          payload: values,
          callback: () => {
            this.props.form.resetFields()
            this.props.isSaved(true)
          },
        })
      }
    });
  }

  handleCancel = () => {
    this.props.form.resetFields()
    this.props.dispatch({
      type: 'coding/handleCloseModal',
    });
  }

  render() {
    const { visible, addInfo } = this.props.coding
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 18,
      },
    };
    return (
      <Modal
        title="新增速码"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label="速码名称"
          >
            {
              getFieldDecorator('codeValueCode', {
                rules: [
                  {
                    required: true,
                    message: '请输入速码名称',
                  },
                  {
                    max: 20,
                    message: '不超过20个字符',
                  },
                  {
                    pattern: '^[-_.A-Za-z0-9\u4e00-\u9fa5]+$',
                    message: '只能输入中文、英文、数字、-、_、.',
                  },
                ],
              })(
                <Input placeholder="不超过20个字符" />
                )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="页面显示名称"
          >
            {
              getFieldDecorator('codeValueLabe', {
                rules: [
                  {
                    required: true,
                    message: '请输入页面显示名称',
                  },
                  {
                    max: 20,
                    message: '不超过20个字符',
                  },
                  {
                    pattern: '^[-_.A-Za-z0-9\u4e00-\u9fa5]+$',
                    message: '只能输入中文、英文、数字、-、_、.',
                  },
                ],
              })(
                <Input placeholder="不超过20个字符" />
                )
            }
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
const CreateDetailCategory = Form.create()(CreateDetailModal);
export default CreateDetailCategory