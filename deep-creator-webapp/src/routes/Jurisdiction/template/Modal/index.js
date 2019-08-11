import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Modal, Checkbox, Menu, Dropdown, Icon, Radio, Button, Row, Spin, Col, Table, Input, Select, Form, Switch } from 'antd';
import Template1 from './Template1';
import Template2 from './Template2';
import Template3 from './Template3';
import TreeTransfer from '../../../../components/TreeTransfer';
import styles from './index.less'
import uuidV4 from 'uuid/v4'
import _ from 'lodash';

const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;


@connect(state => ({
  templateModal: state['template/modal'],
  templateModal1: state['template/modal/template1'],
  Global:state['LOADING']
}))
@Form.create()
class UserModal extends Component {
  constructor(props) {
    super();

  }
  componentWillUnmount() {//监测 表单没有填完 就退出
    const { templateType, form, id, isView } = this.props;
    const self = this;
    if(this.props && this.props.visible){
      this.props.form.validateFields((err, values) => {
        if (!err){
          confirm({
            title: '提示',
            content: '已经离开模板页面，是否要保存刚才的操作？',
            onOk() {
              if(id && isView=='edit'){
                values.smTemplateInfo.id = id;
              }
              console.log('Received values of form: ', values, templateType);
              // this.getTemplate1(values)
              if(templateType == 2 && isView=='edit'){
                confirm({
                  title: '提示',
                  content: '如果改变权限模板，将会导致相应岗位数据丢失/清空，是否确定进行该操作？',
                  onOk() {
                    if (templateType == 2) {
                      self.props.dispatch({
                        type: 'template/modal/template2/saveTemplate',
                        payload: values,
                        callback: () => {
                          self.props.dispatch({
                            type: 'jurisdiction/template/resetList'
                          });
                          form.resetFields();
                        }
                      })
                    } else if (templateType == 3) {
                      self.props.dispatch({
                        type: 'template/modal/template3/saveTemplate',
                        payload: values,
                        callback: () => {
                          self.props.dispatch({
                            type: 'jurisdiction/template/resetList'
                          });
                          form.resetFields();
                        }
                      })
                    }
                  },
                  onCancel() {
                    console.log('Cancel');
                  },
                });
                return
              }
              if (templateType == 1) {
                self.props.dispatch({
                  type: 'template/modal/saveResourceTemplate',
                  payload: self.getTemplate1(values),
                  callback: () => {
                    self.props.dispatch({
                      type: 'jurisdiction/template/resetList'
                    });
                    form.resetFields();
                  }
                })
              } else if (templateType == 2) {
                self.props.dispatch({
                  type: 'template/modal/template2/saveTemplate',
                  payload: values,
                  callback: () => {
                    self.props.dispatch({
                      type: 'jurisdiction/template/resetList'
                    });
                    form.resetFields();
                  }
                })
              } else if (templateType == 3) {
                self.props.dispatch({
                  type: 'template/modal/template3/saveTemplate',
                  payload: values,
                  callback: () => {
                    self.props.dispatch({
                      type: 'jurisdiction/template/resetList'
                    });
                    form.resetFields();
                  }
                })
              }
            },
            onCancel() {
              console.log('Cancel');
            },
          });
        }
      })
    }
  }

  getFromCon(templateData) {
    const { form, templateType, templateModal, isView } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    const {
      TreeData,//资源表功能权限
      treeMap,
      TreeData2,
      tableData
    } = templateModal;

    // 功能模板++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if (templateType == 1) {
      return <Template1 data={templateData} isView={isView} form={form} />
      // 行权限模板++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    } else if (templateType == 2) {
      return <Template2 data={templateData} isView={isView} form={form} />
      // 列数据权限模板===================================================
    } else {
      return <Template3 data={templateData} isView={isView} form={form} />
    }
  }

  /**
   * 递归渲染树状节点
   * @param {} data 
   */
  renderTreeNodes(data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.name} key={item.id} value={item.id + ''} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.id} value={item.id + ''} />;
    });
  }
  // 添加中间节点
  getTemplate1(data){
    const {templateModal1} = this.props;
    let arr = data.resourceList;
    let par = {};
    const { 
        treeMap,
      } = templateModal1;
    arr.map(item=>{
      let b = {...item}
      if(treeMap.map[b.resourceKey].parentResourceKey){
        while(treeMap.map[b.resourceKey].parentResourceKey!=''){
          if(!par[treeMap.map[b.resourceKey].parentResourceKey]){
            par[treeMap.map[b.resourceKey].parentResourceKey] = 1
          }
          b = treeMap.map[treeMap.map[b.resourceKey].parentResourceKey]
        }
        // if(!par[treeMap.map[b.resourceKey].parentResourceKey]){
        //   par[treeMap.map[b.resourceKey].parentResourceKey] = 1
        // }
      }
    })
    // console.log(par);
    data.resourceList = _.uniqBy(arr.concat(Object.keys(par).map(it=>{return {resourceKey:it}})),'resourceKey')
    // console.log('中间节点',data.resourceList);
    return data
  }
  handleModal(param, type) {
    const { templateType, form, id, isView } = this.props;
    const self = this;
    if (type == "submit") {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          if(id && isView=='edit'){
            values.smTemplateInfo.id = id;
          }
          console.log('Received values of form: ', values, templateType);
          // this.getTemplate1(values)
          if(templateType == 2 && isView=='edit'){
            confirm({
              title: '提示',
              content: '如果改变权限模板，将会导致相应岗位数据丢失/清空，是否确定进行该操作？',
              onOk() {
                if (templateType == 2) {
                  self.props.dispatch({
                    type: 'template/modal/template2/saveTemplate',
                    payload: values,
                    callback: () => {
                      self.props.dispatch({
                        type: 'jurisdiction/template/resetList'
                      });
                      form.resetFields();
                    }
                  })
                } else if (templateType == 3) {
                  self.props.dispatch({
                    type: 'template/modal/template3/saveTemplate',
                    payload: values,
                    callback: () => {
                      self.props.dispatch({
                        type: 'jurisdiction/template/resetList'
                      });
                      form.resetFields();
                    }
                  })
                }
              },
              onCancel() {
                console.log('Cancel');
              },
            });
            return
          }
          if (templateType == 1) {
            
            this.props.dispatch({
              type: 'template/modal/saveResourceTemplate',
              payload: this.getTemplate1(values),
              callback: () => {
                this.props.dispatch({
                  type: 'jurisdiction/template/resetList'
                });
                form.resetFields();
              }
            })
          } else if (templateType == 2) {
            this.props.dispatch({
              type: 'template/modal/template2/saveTemplate',
              payload: values,
              callback: () => {
                this.props.dispatch({
                  type: 'jurisdiction/template/resetList'
                });
                form.resetFields();
              }
            })
          } else if (templateType == 3) {
            this.props.dispatch({
              type: 'template/modal/template3/saveTemplate',
              payload: values,
              callback: () => {
                this.props.dispatch({
                  type: 'jurisdiction/template/resetList'
                });
                form.resetFields();
              }
            })
          }


        }
      });
    } else {

      this.props.dispatch({
        type: 'jurisdiction/template/handleCloseModal',
      });
      form.resetFields();
    }
  }

  updateItem(type, index) {
    let stationData = this.props.form.getFieldValue('stationData');
    if (type == 'add') {
      stationData.push({
        stationName: "",//岗位名称
        functional: "",//功能权限
        department: "",//组织名称
        colRoot: "",
        rowRoot: "",
        orgDataState: 1,
        state: 1,
        childrenData: [],
      })
    } else if (type == 'del') {
      stationData.splice(index, 1)
    }
    this.props.dispatch({
      type: 'template/modal/updateStationData',
      payload: stationData,
    });
  }
  handleDropdownChange(rule, value, callback) {
    console.log(arguments);

    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
    callback()
  }
  render() {

    const self = this;
    const { form, visible, Global, templateModal, isView, templateData, templateType } = this.props;
    const { getFieldDecorator, setFieldsValue } = form;
    // const { resource } = this.props;

    const {
      TreeData,
      treeMap,
      tableData
    } = templateModal;

    const {
      global
    } = Global;
    let fromData = null;
    if (templateType == 1) {
      fromData = templateData;
    } else if (templateType == 2) {
      fromData = templateData;
    }else if(templateType == 3){
      fromData = templateData&&templateData.offlineList
    }
    return (
      <div className={`${styles.templateModal}`} style={{ display: visible ? 'block' : 'none' }}>
        <Spin spinning={global}>
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.handleSearch}
        >
          <div className={styles.userCon}>
            <div className={styles.userForm}>
              <FormItem label="模板名称">
                {getFieldDecorator(`smTemplateInfo.templateName`, {
                  initialValue: fromData ? fromData.templateInfo.templateName : '',
                  rules: [{
                    required: true, message: '请输入模板名称',
                  },
                  {
                    validator:(rule, value, callback)=>{
                        if(isView == 'edit' &&fromData.templateInfo &&  value == fromData.templateInfo.templateName){
                          callback()
                        }else{
                          this.props.dispatch({
                            type: 'template/modal/isExitTemplateName',
                            payload: value,
                            callback:(type)=>{
                              if(type){
                                callback('模板名字已存在，请重新输入!')
                              }else{
                                callback();
                              }
                            }
                          });
                        }
                       }
                  }],
                })(
                  <Input placeholder="请输入模板名称" disabled={isView == 'view'? true :false} />
                  )}
              </FormItem>
              <FormItem label="模板描述">
                {getFieldDecorator(`smTemplateInfo.templateDesc`, {
                  initialValue: fromData ? fromData.templateInfo.templateDesc : "",
                  rules: [{
                    // required: true, message: '请输入模板描述',
                  }],
                })(
                  <TextArea placeholder="请输入模板描述" disabled={isView == 'view'? true :false} />
                  )}
              </FormItem>
            </div>
          </div>
          {this.getFromCon(templateData)}

          <div className={styles.userCon} style={{ overflow: 'hidden', padding: '30px 24px' }}>
            {
              (isView == 'view'? true :false) ? null : <Button type="primary" style={{ fontSize: '12px' }} onClick={() => { this.handleModal({}, 'submit'); }}>确定</Button>
            }
            <Button style={{ fontSize: '12px', marginLeft: '10px' }} onClick={() => { this.handleModal({}, 'close'); }}>取消</Button>
          </div>
        </Form>
        </Spin>
      </div>
    );
  }
}

export default UserModal