import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Input, Select, Form } from 'antd';

const { TextArea } = Input;
const Option = Select.Option;
const FormItem = Form.Item;

@connect(state => ({
  resource: state['organization'],
}))
@Form.create()
export default class ControlModal extends Component {
  state = {
    data: {},
  }


  componentWillReceiveProps(nextProps) {
    const data = this.state.data;
    const { modalData, controlType } = nextProps.resource;

    this.setState({ data: nextProps.resource.modalData });
  }



  handleChange = (val) => {
    let data = this.state.data;
    data.type = val.label;
    data.nodeType = val.key;
    console.log(val);
    this.setState({ data });
  }

  handleOk = () => {

    const data = this.state.data;
    const { controlType, form } = this.props;
    let modalData = {};
    if(controlType == 'view'){
      this.props.dispatch({
        type: 'organization/handleCloseModal'
      });
      form.resetFields()
      return 
    }
    form.validateFields((err, values) => {
      if (!err) {
        modalData = { ...values };
        modalData.parentOrgCode = data.parentOrgCode;
        if (controlType == 'edit') {
          modalData.id = data.id;
          this.props.dispatch({
            type: 'organization/fetchUpData',
            payload: modalData,
            callback: () => {
              form.resetFields()
            }
          });
        } else if (controlType == 'createNext' || controlType == 'createFirst') {
          this.props.dispatch({
            type: 'organization/fetchAddData',
            payload: modalData,
            callback: () => {
              form.resetFields()
            }
          });
        } else {
          this.props.dispatch({
            type: 'organization/handleCloseModal'
          });
          form.resetFields()
        }

      }
    })
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'organization/handleCloseModal',
    });
  }

  render() {

    const { data } = this.state;
    const { resource, form } = this.props;
    const {
      modalData,
      visible,
      controlType
    } = resource;
    const { getFieldDecorator, setFieldsValue } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };


    return (
      <div>
        <Modal
          title={controlType === 'view'?"查看组织架构":(controlType === 'edit'?"编辑组织架构":"新增组织架构")}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem label="组织名称" {...formItemLayout} >
              {getFieldDecorator(`orgName`, {
                initialValue: data.orgName || '',
                rules: [{
                  required: true, message: '请输入组织名称'
                },{
                  max:10, message: '组织名称不超过10个字符'
                }],
              })(
                <Input placeholder="不超过10个字符" disabled={controlType === 'view'} />
                )}
            </FormItem>
            <FormItem label="组织代码" {...formItemLayout} >
              {getFieldDecorator(`orgCode`, {
                initialValue: data.orgCode || '',
                rules: [{
                  required: true, message: '请输入组织代码',
                }, {
                  validator: (rule, value, callback) => {
                    value = value.replace(/(^\s*)|(\s*$)/g, "");
                    if (controlType == 'edit' && value == data.orgCode || !value) {
                      callback()
                    } else {
                      this.props.dispatch({
                        type: 'organization/isExitOrgCode',
                        payload: value,
                        callback: (type) => {
                          if (type) {
                            callback('组织代码已存在，请重新输入!')
                          } else {
                            callback();
                          }
                        }
                      });
                    }
                  }
                },{
                  max:10, message: '组织代码不超过10个字符'
                }],
              })(
                <Input placeholder="不超过10个字符" disabled={controlType === 'view' || controlType === 'edit'} />
                )}
            </FormItem>
            <FormItem label="组织描述" {...formItemLayout} >
              {getFieldDecorator(`orgDesc`, {
                initialValue: data.orgDesc || '',
                rules: [{
                  required: true, message: '请输入组织描述',
                },{
                  max:200, message: '组织描述不超过200个字符'
                }],
              })(
                <TextArea rows={4} placeholder="不超过200个字符" style={{ width: '240px' }} disabled={controlType === 'view'} />
                )}
            </FormItem>
            {/* <div style={{ marginBottom: '20px' }}>
            <label style={{ width: '80px', display: 'inline-block' }}>选择分类：</label>
            <Select placeholder="选择所属类型" getPopupContainer={triggerNode => triggerNode.parentNode}  value={data.categoryId}  style={{ width: 240 }} onChange={::this.handleChange} disabled={controlType === 'view'}>
              {
                classificationData.map((item, i) => {
                  return <Option key={i} value={item.dictionaryCode} >{item.dictionaryLabel}</Option>;
                })
              }
            </Select>
          </div> */}
          </Form>
        </Modal>
      </div>
    );
  }
}
