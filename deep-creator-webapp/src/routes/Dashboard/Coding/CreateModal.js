import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Modal, Form } from 'antd';

const FormItem = Form.Item;
const { TextArea } = Input;

@connect(state => ({
  coding: state.coding,
}))

class CreateModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'coding/fetchSaveCategory',
          payload: values,
          callback: () => {
            this.props.form.resetFields()
          },
        })
      }
    });
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'coding/handleCloseModal',
    });
    this.props.form.resetFields()
  }

  render() {
    const { visible, addInfo } = this.props.coding
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 16,
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
         {/*  <FormItem
            {...formItemLayout}
            label="速码类别"
          >
            {
              getFieldDecorator('categoryCode', {
                rules: [{ required: true, message: '请输入速码类别' }],
              })(
                <Input placeholder="不超过10个字符" />
              )
            }
          </FormItem> */}
          <FormItem
            {...formItemLayout}
            label="速码类别"
          >
            {
              getFieldDecorator('categoryLabel', {
                rules: [
                  {
                    required: true,
                    message: '请输入速码类别',
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
            label="速码描述"
          >
            {
              getFieldDecorator('categoryDesc', {
                rules: [
                  {
                    required: true,
                    message: '请输入速码描述',
                  },
                  {
                    max: 200,
                    message: '不超过200个字符',
                  },
               /*    {
                    pattern: '^[A-Za-z0-9\u4e00-\u9fa5]+$',
                    message: '只输入中文、英文、数字',
                  }, */
                ],
              })(
                <TextArea rows={4} placeholder="不超过200个字符" />
                )
            }
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
const CreateCategory = Form.create()(CreateModal);
export default CreateCategory