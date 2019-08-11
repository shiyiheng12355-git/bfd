import React, { PureComponent } from 'react'
import { Row, Col, Icon, Button, Modal, Input, Select, Form } from 'antd'
import { getPercent, formatMoment } from '../../../utils'
import { connect } from 'dva'

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  tags: state['tags/tags']
}))
export default class EditCateModal extends PureComponent {

  state = {
    open: false
  }

  componentDidMount() {
    const { dispatch } = this.props
  }

  componentWillReceiveProps(nextProps) {
    const { open } = nextProps
    if (this.state.open != open) {
      this.setState({ open })
      !open && this.props.form.resetFields();
    }
  }

  cancel() {
    this.props.onChange(false)
  }

  onOkClick(){
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onCommit && this.props.onCommit(values);
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { tagCateData } = this.props.tags
    if (!tagCateData) return null
    return (
      <Modal title="修改分类" visible={this.state.open} onOk={::this.onOkClick} onCancel={::this.cancel} maskClosable = {false}>
        <Form>
          <FormItem
            label="原分类名称"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}>
            <span>{tagCateData.categoryName}</span>
          </FormItem>
          <FormItem
            label="新分类名称"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}>
            {
              getFieldDecorator('name', {
              rules: [{ required: true, message: '请填写新分类名称' }, { max: 20, message: '最长不超过20个字符' }]
              })(<Input placeholder="最长不超过20个字符" maxLength={20} />)
            }
          </FormItem>
          <FormItem
            label="分类ID"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}>
          <span>{tagCateData.categoryEnglishName}</span>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
