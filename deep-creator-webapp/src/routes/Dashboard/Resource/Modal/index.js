import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Input, Select, Form, Checkbox, message, Button } from 'antd';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

@connect(state => ({
  resource: state.resource,
}))

class ControlModal extends Component {
  state = {
    data: {},
    loading: false,
    checkedAdd: false,
  }

  handleOk = () => {
    const { modalData } = this.props.resource;
    const { controlType } = this.props.resource
    this.setState({ loading: true })
    if (controlType === 'createFirst' || controlType === 'createNext') {
      switch (modalData.resourceType) {
        case 1:
          this.props.form.validateFields((err, values) => {
            if (!err) {
              this.props.dispatch({
                type: 'resource/fetchCheckTitle',
                payload: values,
                callback: (titleResult) => {
                  if (titleResult) {
                    message.warning('资源名称不能重复')
                    this.setState({ loading: false })
                  } else {
                    this.props.dispatch({
                      type: 'resource/fetchCheckKey',
                      payload: values,
                      callback: (keyResult) => {
                        if (keyResult) {
                          message.warning('KEY不能重复')
                          this.setState({ loading: false })
                        } else {
                          this.props.dispatch({
                            type: 'resource/fetchAddOneLevel',
                            payload: values,
                            callback: (addResult) => {
                              if (addResult) {
                                this.props.form.resetFields()
                                this.setState({ loading: false })
                              }
                            },
                          })
                        }
                      },
                    })
                  }
                },
              })
            }
          });
          break;
        case 2:
          this.props.form.validateFields((err, values) => {
            values.parentResourceKey = modalData.parentResourceKey
            if (!err) {
              this.props.dispatch({
                type: 'resource/fetchCheckTitle',
                payload: values,
                callback: (titleResult) => {
                  if (titleResult) {
                    message.warning('资源名称不能重复')
                    this.setState({ loading: false })
                  } else {
                    this.props.dispatch({
                      type: 'resource/fetchCheckKey',
                      payload: values,
                      callback: (keyResult) => {
                        if (keyResult) {
                          message.warning('KEY不能重复')
                          this.setState({ loading: false })
                        } else {
                          this.props.dispatch({
                            type: 'resource/fetchAddTwoLevel',
                            payload: values,
                            callback: (addResult) => {
                              if (addResult) {
                                this.props.form.resetFields()
                                this.setState({ loading: false })
                              }
                            },
                          })
                        }
                      },
                    })
                  }
                },
              })
            }
          });
          break;
        default:
          this.props.form.validateFields((err, values) => {
            values.parentResourceKey = modalData.parentResourceKey
            if (!err) {
              this.props.dispatch({
                type: 'resource/fetchCheckTitle',
                payload: values,
                callback: (titleResult) => {
                  if (titleResult) {
                    message.warning('资源名称不能重复')
                    this.setState({ loading: false })
                  } else {
                    this.props.dispatch({
                      type: 'resource/fetchCheckKey',
                      payload: values,
                      callback: (keyResult) => {
                        if (keyResult) {
                          message.warning('KEY不能重复')
                          this.setState({ loading: false })
                        } else {
                          this.props.dispatch({
                            type: 'resource/fetchAddThreeLevel',
                            payload: values,
                            callback: (addResult) => {
                              if (addResult) {
                                this.props.form.resetFields()
                                this.setState({ loading: false })
                              }
                            },
                          })
                        }
                      },
                    })
                  }
                },
              })
            }
          });
      }
    } else if (controlType === 'edit') {
      this.props.form.validateFields((err, values) => {
        values.parentResourceKey = modalData.parentResourceKey
        values.id = modalData.id
        if (!err) {
          this.props.dispatch({
            type: 'resource/fetchCheckTitle',
            payload: values,
            callback: (titleResult) => {
              if (titleResult) {
                message.warning('资源名称不能重复')
                this.setState({ loading: false })
              } else {
                this.props.dispatch({
                  type: 'resource/fetchUpdate',
                  payload: values,
                  callback: (addResult) => {
                    if (addResult) {
                      this.props.form.resetFields()
                      this.setState({ loading: false })
                    }
                  },
                })
              }
            },
          })
        }
      });
    } else {
      this.props.dispatch({
        type: 'resource/handleCloseModal',
      });
    }
    this.setState({ checkedAdd: false })
  }
  handleCancel = () => {
    this.props.dispatch({
      type: 'resource/handleCloseModal',
    });
    this.setState({ checkedAdd: false })
    this.props.form.resetFields()
  }

  handleCheckAdd = (e) => {
    this.setState({ checkedAdd: e.target.checked })
  }

  render() {
    // const { visible, type, data, level } = this.props;
    const { checkedAdd, loading } = this.state;
    const { resource } = this.props;
    const {
      modalData,
      visible,
      controlType,
      selectData,
    } = resource;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 16,
      },
    };
    // console.log(modalData)
    return (
      <div>
        <Modal
          title="基本信息"
          maskClosable={false}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={
            controlType === 'view' ? null
              : [
                <Button key="back" onClick={this.handleCancel}>取消</Button>,
                <Button key="submit" loading={loading} type="primary" onClick={this.handleOk}>确定</Button>,
              ]
          }
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="资源名称："
            >
              {
                getFieldDecorator('resourceTitle', {
                  initialValue: modalData.resourceTitle,
                  rules: [
                    {
                      required: true, message: '请输入资源名称',
                    },
                    {
                      max: 10, message: '不超过10个字符',
                    },
                    {
                      pattern: '^[A-Za-z0-9\u4e00-\u9fa5]+$', message: '只能输入中文、英文、数字',
                    },
                  ],
                })(
                  <Input placeholder="不超过10个字符" disabled={controlType === 'view'} />
                  )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="资源类型："
            >
              {
                getFieldDecorator('resourceType', {
                  initialValue: modalData.resourceType,
                  rules: [{ required: true, message: '请输入资源名称' }],
                })(
                    <Select disabled={controlType === 'view' || controlType === 'edit'}>
                      {
                        selectData.map((item, i) => {
                          return <Option key={i} value={item.value} >{item.name}</Option>;
                        })
                      }
                    </Select>
                  )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="KEY："
            >
              {
                getFieldDecorator('resourceKey', {
                  initialValue: modalData.resourceKey,
                  rules: [
                    {
                      required: true, message: '请输入KEY',
                    },
                    {
                      max: 20, message: '不超过20个字符',
                    },
                    {
                      pattern: '^[A-Za-z0-9_]+$', message: '只能输入英文、数字、下划线',
                    },
                  ],
                })(
                  <Input placeholder="不超过20个字符" disabled={controlType === 'view' || controlType === 'edit'} />
                  )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="描述："
            >
              {
                getFieldDecorator('resourceDesc', {
                  initialValue: modalData.resourceDesc,
                  rules: [
                    {
                      max: 200, message: '不超过200个字符',
                    },
                  ],
                })(
                  <TextArea rows={4} placeholder="不超过200个字符" disabled={controlType === 'view'} />
                  )
              }
            </FormItem>
            {
              modalData.resourceType !== 1 && modalData.resourceType !== ''
                ? <FormItem
                  {...formItemLayout}
                  label="连接URL："
                >
                  {
                    getFieldDecorator('resourceUrl', {
                      initialValue: modalData.resourceUrl,
                      rules: [
                        {
                          pattern: '^[A-Za-z0-9_:./]+$', message: '只能输入字母、数字、下划线、冒号、/和.',
                        },
                      ],
                    })(
                      <Input placeholder="字母、数字、下划线、冒号" disabled={controlType === 'view'} />
                      )
                  }
                </FormItem> : ''
            }
            {
              modalData.resourceType !== 1 && modalData.resourceType !== '' && controlType !== 'view' && controlType !== 'edit'
                ? <FormItem
                  {...formItemLayout}
                  label="功能模板是否选中："
                >
                  {
                    getFieldDecorator('isCascadeAdd', {
                      initialValue: modalData.isCascadeAdd,
                    })(
                      <Checkbox checked={checkedAdd} onChange={this.handleCheckAdd}></Checkbox>
                    )
                  }
                </FormItem> : ''
            }
          </Form>
        </Modal>
      </div>
    );
  }
}
const CreateCategory = Form.create()(ControlModal)
export default CreateCategory