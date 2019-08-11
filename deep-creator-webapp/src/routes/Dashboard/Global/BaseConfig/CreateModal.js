import React, { Component } from 'react';
import { Modal, Input, Select, Form, Checkbox } from 'antd';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

const FormItem = Form.Item;
const Option = Select.Option;
const Authorized = RenderAuthorized()

class CreateModal extends Component {
  state={
    checkType: {
      isRecommendContent: 0,
      isRecommendObject: 0,
    },
  }

  handelCheck = (e, key) => {
    const { checkType } = this.state
    const value = e.target.checked ? 1 : 0
    checkType[key] = value
    this.setState({ checkType })
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { checkType } = this.state
        values.isRecommendContent = checkType.isRecommendContent
        values.isRecommendObject = checkType.isRecommendObject
        this.props.dispatch({
          type: 'gloablConfig/basicUserConfig/fetchSaveEntity',
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
      type: 'gloablConfig/basicUserConfig/openModal',
      payload: false,
    })
    window.setTimeout(this.props.form.resetFields, 1000)
  }

  render() {
    // const { visible, type, data, level } = this.props;
    const { visible, auths } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };
    return (
      <div>
        <Modal
          title="新增实体"
          maskClosable={false}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="实体中文名称："
            >
              {
                getFieldDecorator('entityName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入实体中文名称',
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
              label="实体英文名称："
            >
              {
                getFieldDecorator('entityEnglishName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入实体英文名称',
                    },
                    {
                      max: 20,
                      message: '不超过20个字符',
                    },
                    {
                      pattern: '^[-_.A-Za-z0-9]+$',
                      message: '只能输入英文、数字、-、_、.',
                    },
                  ],
                })(
                  <Input placeholder="不超过20个字符" />
                  )
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="实体类型："
            >
              {
                getFieldDecorator('entityCategory', {
                  initialValue: auths.includes('xtgl_qjpz_stpz_cj_yhl') ? '0' : '1',
                  rules: [{ required: true, message: '请选择实体类型' }],
                })(
                  <Select >
                    {
                      Authorized.check(() => { return auths.includes('xtgl_qjpz_stpz_cj_yhl') }, <Option value='0'>用户类实体</Option>)
                    }
                    {
                      Authorized.check(() => { return auths.includes('xtgl_qjpz_stpz_cj_fyhl') }, <Option value='1'>非用户类实体</Option>)
                    }

                  </Select>
                  )
              }
            </FormItem>
            {
              Authorized.check(() => { return auths.includes('xtgl_qjpz_stpz_cj_clxxsz') },
              <FormItem
                {...formItemLayout}
                label="策略场景设置："
              >
                {
                  getFieldDecorator('checkType')(
                    <div>
                      <Checkbox onChange={(e) => { this.handelCheck(e, 'isRecommendObject') }}>作为推荐对象</Checkbox>
                      <Checkbox onChange={(e) => { this.handelCheck(e, 'isRecommendContent') }}>作为推荐内容</Checkbox>
                    </div>

                  )
                }
              </FormItem>)
            }
          </Form>
        </Modal>
      </div>
    );
  }
}
const AddBasicModal = Form.create()(CreateModal)
export default AddBasicModal