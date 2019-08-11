import React, { PureComponent } from 'react';
import { Modal, Button, Form, Input, Select, Checkbox, Row, Col, Upload, Icon, List, Tag } from 'antd';
import _ from 'lodash';
import moment from 'moment';


const FormItem = Form.Item;
const ListItem = List.Item
const { TextArea } = Input;
const { Option } = Select;
class GroupSave extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: 0,
      isResetTagPickerForm: false,
      conditionDescVisible: false,
      modalConditionVisible: false, // 控制条件选择Modal的显示隐藏
      condition: {},
      conditionCn: {},
    };
  }


  handleOk = (e) => {
    e.preventDefault();
    let arr = ['groupName', 'groupDesc', 'groupCategoryId'];
    if (this.state.selectValue === 0) {
      arr.push('groupCategory')
    }
    let { entityId, checkNameIsRepeat } = this.props;
    this.props.form.validateFields(arr, {}, (err, values) => {
      if (!err) {
        const { groupName, groupDesc, groupCategoryId, groupCategory, condition } = values;

        const bizGroupInfo = {
          groupDesc,
          groupName,
          groupCategoryId,
          isAddReport: 0,
        }
        if (groupCategory) {
          bizGroupInfo.groupCategory = groupCategory;
        }
        checkNameIsRepeat({ entityId, groupName }, (type) => {
          if (!type) {
            this.props.handleGroupSave(bizGroupInfo, () => {
              this.setState({
                selectValue: 0,
                conditionDescVisible: false,
              })
            });
          } else {
            this.props.form.setFields({
              groupName: {
                value: groupName,
                errors: [new Error('用户群名称重复')],
              },
            });
          }
        })
      }
    });
  }


  handleSelectChange = (selectValue) => {
    this.setState({
      selectValue,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { entityId, entityName, groupSaveModalVisible, groupCategory = [] } = this.props;
    // console.log('groupCategory', groupCategory)
    return (
      <div >
        <Modal
          title={entityName ? `保存${entityName || ''}群` : '保存用户群'}
          width="700px"
          visible={groupSaveModalVisible}
          onOk={this.handleOk}
          onCancel={this.props.handleGroupSaveModalCancel}
        >
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
            label={`${entityName || ''}群名称`}
            style={{ marginBottom: 10 }}
          >
            {getFieldDecorator('groupName', {
              initialValue: '',
              rules: [
                { required: true, message: `${entityName || ''}群名不能为空` },
                { max: 15, message: '15个字符以内' },
                {
                  validator: (rule, value, callback) => {
                    if (value.indexOf(' ') !== -1) {
                      callback('不能输入空格');
                      return false;
                    }
                    callback();
                  },
                },
              ],
            })(
              <Input placeholder="15个字符以内" />
              )}
          </FormItem>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
            label={`${entityName || ''}群描述`}
            style={{ marginBottom: 10 }}
          >
            {getFieldDecorator('groupDesc', {
              initialValue: '',
              rules: [
                { max: 50, message: '50个字符以内' },
                {
                  validator: (rule, value, callback) => {
                    if (value.indexOf(' ') !== -1) {
                      callback('不能输入空格');
                      return false;
                    }
                    callback();
                  },
                },
              ],
            })(
              <TextArea placeholder="50个字符以内" />
              )}
          </FormItem>

          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            required
            label={`${entityName || ''}群分类`}
            style={{ marginBottom: 10 }}
          >
            <Col span={6} >
              <FormItem>
                {getFieldDecorator('groupCategoryId', {
                  initialValue: this.state.selectValue,
                  rules: [
                    { required: true, message: '请选择分类' },
                  ],
                })(
                  <Select
                    style={{ width: 200 }}
                    onChange={this.handleSelectChange}
                  >
                    <Option key="-1" value={0}>新增分类</Option>
                    {
                      groupCategory.map((item, index) => {
                        return <Option key={item.id} value={item.id}>{item.categoryName}</Option>;
                      })
                    }
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col span={10} offset={6}>
              {
                this.state.selectValue === 0
                  ? <FormItem >
                    {
                      getFieldDecorator('groupCategory', {
                        initialValue: '',
                        rules: [
                          { required: true, message: '新增分类不能为空' },
                          { max: 10, message: '10个字符以内' },
                          {
                            validator: (rule, value, callback) => {
                              if (value.indexOf(' ') !== -1) {
                                callback('不能输入空格');
                                return false;
                              }
                              callback();
                            },
                          },
                        ],
                      })(<Input placeholder="10个字符以内" />)
                    }
                  </FormItem>
                  : ''
              }
            </Col>
          </FormItem>

        </Modal>
      </div >
    );
  }
}


export default Form.create()(GroupSave);
