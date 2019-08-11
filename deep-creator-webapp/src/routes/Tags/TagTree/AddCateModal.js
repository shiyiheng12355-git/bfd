import React, { PureComponent } from 'react'
import { Modal, Input, Select, Form } from 'antd'
import { connect } from 'dva'

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  tags: state['tags/tags'],
}))
export default class AddCateModal extends PureComponent {
  state = {
    open: false,
  }

  componentWillReceiveProps(nextProps) {
    const { open } = nextProps
    if (this.state.open !== open) {
      this.setState({ open })
      !open && this.props.form.resetFields();
    }
  }

  cancel = () => {
    // close modal
    this.props.onChange && this.props.onChange(false);
  }

  onOkClick = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onCommit && this.props.onCommit(values);
      }
    });
  }

  render() {
    const { isAddRootTag } = this.props.tags;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Modal
        title={isAddRootTag ? '新增一级分类' : '新增分类选择'}
        visible={this.state.open}
        onCancel={this.cancel}
        onOk={this.onOkClick}
        maskClosable={false}>
        <Form>
          {
            isAddRootTag ? null : (
              <FormItem
                label="新增类型"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}>
                {
                  getFieldDecorator('type', {
                    initialValue: 1,
                  })(
                    <Select>
                      <Select.Option value={1}>标签分类</Select.Option>
                      <Select.Option value={2}>标签名称</Select.Option>
                    </Select>
                  )
                }
              </FormItem>
            )
          }
          <FormItem
            label={isAddRootTag ? '一级分类名称' : '名称'}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}>
            {
              getFieldDecorator('name', {
                rules: [{ 
                  required: true, message: `请填写${isAddRootTag ? '一级分类名称' : '名称'}` 
                }, { 
                  max: 20, message: '最长不超过20个字符' 
                }],
              })(<Input placeholder="最长不超过20个字符" maxLength={20} />)
            }
          </FormItem>
          <FormItem
            label={isAddRootTag ? '一级分类ID' : 'ID'}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}>
            {
              getFieldDecorator('id', {
                rules: [{
                  required: true, message: `请填写${isAddRootTag ? '一级分类ID' : 'ID'}`,
                }, {
                  max: 20, message: '最长不超过20个字符',
                }, {
                  validator: (rule, value, callback) => {
                    const reg = /^[a-z_]+[a-z0-9_]*$/;
                    if (!reg.test(value)) {
                      callback('小写字母，下划线，数字组合，且数字不能为首位');
                      return;
                    }
                    callback();
                  },
                }],
              })(<Input placeholder="最长不超过20个字符" maxLength={20} />)
            }
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
