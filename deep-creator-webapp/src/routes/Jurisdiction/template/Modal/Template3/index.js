import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import {  Tabs, Form, Select, Row, Col, Checkbox, Button, Table, Icon, Switch, Dropdown, Menu } from 'antd';
import TreeTransfer from '../../../../../components/TreeTransfer';
import styles from '../index.less'


const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

class UserCheckbox extends Component {
  constructor(){
    super();
    this.state={
      userData:{}
    }
  }
  render(){
    const {offlineList ,onChange,value,disabled} = this.props;
    return <Checkbox.Group style={{ width: '100%',padding: '0 10px' }} value={value?value.map(item=>(item.id+'')):[]} onChange={(value)=>{        
        onChange&&onChange(value.map(item=>{
          return this.state.userData[item]
        }))
      }}>
    <Row>
      {offlineList&&offlineList.map((item,i)=>{
        this.state.userData[item.id+''] = item;
        return <Col span={4} key={i}><Checkbox disabled={disabled} value={item.id+''} >{item.columnTitle}</Checkbox></Col>
      })}
    </Row>
  </Checkbox.Group>
  }
}
@connect(state => ({
  templateModal: state['template/modal/template3'],
  user:state['user']
}))
class Template3 extends Component {
    constructor(props){
        super();
        
        this.state = {
            TreeData:props.TreeData
          }
    }
    componentWillMount() {

        // this.props.dispatch({
        //   type: 'template/modal/fetchTreeData',
        // });
        this.props.dispatch({
            type: 'template/modal/template3/fetchQueryIdAndTagByEntityId'
        });
        this.props.dispatch({
          type: 'user/fetchAuths',
          payload: {
            parentKey: 'qxgl_mbgl_cj_lmb',
          },
        });
        // this.setState({
        //   TreeData:this.props.templateModal.TreeData
        // })
    }
    componentWillReceiveProps(nextProps) {
      let {data,templateModal} = nextProps;
      let { TreeData } = templateModal;
      if(data){
        TreeData = data.treeData;
      }
      this.setState({
        TreeData:TreeData
      })
    }
    setIdList(templateData,entityId,index){
      let { TreeData } = this.state;
      let data = TreeData[entityId]['idList'][index];
      templateData.afterExample && (data.afterExample = templateData.afterExample);
      templateData.beforeExample && (data.beforeExample = templateData.beforeExample);
      templateData.id && (data.safeTemplateId = templateData.id);
      templateData.templateName && (data.templateName = templateData.templateName);
      templateData.isDesensitize !== undefined && (data.isDesensitize = templateData.isDesensitize);
      this.setState({
        TreeData:TreeData
      })
    }
    
    getColumns(entityId,ii){
      const self = this;
      return [{
        title: 'ID名字',
        dataIndex: 'columnTitle',
        key: 'columnTitle',
        width:120,
      },{
        title: '脱敏规则',
        dataIndex: 'templateName',
        key: 'templateName',
        width:120,
        
      },
      {
        title: '脱敏前示例',
        dataIndex: 'beforeExample',
        key: 'beforeExample',
        width:120,
      },
      {
        title: '脱敏后示例',
        dataIndex: 'afterExample',
        key: 'afterExample',
        width:120,
        
      },
      {
        title: '是否可见',
        dataIndex: 'isVisual',
        key: 'isVisual',
        width:100,
        render:(item,row,index)=>{
          const { userManageModal, form, isView } = self.props;
          const {getFieldDecorator} = form;
          return <FormItem style={{margin:0}}>
            {getFieldDecorator(`idList[${ii}][${index}].isVisual`, {
              initialValue:item===undefined?1:item,
              getValueFromEvent:(value)=>{
                
                return value?1:0
              },
            })(
              <Switch disabled={(isView == 'view'? true :false)} checkedChildren="开" unCheckedChildren="关" defaultChecked={item===undefined?true:(item==1)}  />
            )}
          </FormItem>
        }
      },
      {
        title: '是否脱敏',
        dataIndex: 'isDesensitize',
        key: 'isDesensitize',
        width:100,
        render: (item,row,index) => {
          const { form, isView } = self.props;
          const {getFieldDecorator, setFieldsValue} = form;
          
          return <FormItem style={{margin:0}}>
            {getFieldDecorator(`idList[${ii}][${index}].isDesensitize`,{
              initialValue:item===undefined?1:item,
              getValueFromEvent:(value)=>{
                
                return value?1:0
              },
            })(
              <Switch disabled={(isView == 'view'? true :false)} checkedChildren="开" unCheckedChildren="关" defaultChecked={item===undefined?true:(item==1)} onChange={(value)=>{
                self.setIdList({
                    isDesensitize:value
                  },entityId,index)
                }} />
            )}
          </FormItem>
        },
      },
      {
        title: '操作',
        key: 'templateList',
        dataIndex:'templateList',
        width:120,
        // fixed: 'right',
        render: (item,row,index) => {
          const { form, isView } = self.props;
          const {getFieldDecorator, setFieldsValue,getFieldValue} = form;
          self.setFromData({
            [`idList[${ii}][${index}].entityId`]:entityId,
            [`idList[${ii}][${index}].initColumnId`]:row.initColumnId,
            [`idList[${ii}][${index}].safeTemplateId`]:row.safeTemplateId
          })
          let disabled = false
          if(isView == 'view'){
            disabled = true
          }else{
            disabled = row.isDesensitize===undefined?false:(!row.isDesensitize==1);
          }
          return (<Dropdown disabled={disabled} overlay={
            <Menu onClick={(e)=>{
                setFieldsValue({
                  [`idList[${ii}][${index}].safeTemplateId`]:e.item.props.dataRef.id
                });
                self.setIdList(e.item.props.dataRef,entityId,index);
                
              }}>
              {item&&item.map((ite,i)=>{
                return <Menu.Item key={ite.id} dataRef={ite}>
                    {ite.templateName}
                  </Menu.Item>}
              )}
            </Menu>}>
            <a className="ant-dropdown-link" href="javascript:;">
            替换脱敏规则<Icon type="down" />
            </a>
          </Dropdown>);
        },
      }]
    }
    /**
     * 设置表单数据
     */
    setFromData(key,value){
      const { form, isView } = this.props;
      const {getFieldDecorator, setFieldsValue,setFields} = form;
      if(Object.prototype.toString.call(key)==='[object Object]'){
        Object.keys(key).map(item=>{
          getFieldDecorator(item,{
            initialValue:key[item]
          })
        })
      }else{
        getFieldDecorator(key,{
          initialValue:value
        })
      }
    }
    /**
     * 行权限模板格式化数据
     * @param {*} value 
     * @param {*} e 
     */
    formatCallback2=(value,e,_,data)=>{
      // console.log(e);
      // console.log(data)
        let nodes = e.checkedNodes;
        let arr = [];
        nodes.map(item=>{
          if(!item.props.dataRef.categoryEnglishName){
              arr.push({
                tagEnglishName:item.props.dataRef.tagEnglishName,
                tagId:item.props.dataRef.id,
                entityId:item.props.dataRef.entityId,
                tagType: 1,
              })
          }else{
            arr.push({
              tagEnglishName:item.props.dataRef.categoryEnglishName,
              tagId:item.props.dataRef.id,
              entityId:item.props.dataRef.entityId,
              tagType: 0,
            })
          }
        })

        let halfCheckedKeys = e.halfCheckedKeys
        if(halfCheckedKeys.length > 0){
          halfCheckedKeys.map(v => {
            let dataRef = this.findDataRef(v, data)
            arr.push({
              tagEnglishName: dataRef.categoryEnglishName,
              tagId: dataRef.id,
              entityId: dataRef.entityId,
              tagType: 0,
              selection: 'halfChecked',
            })
          })
        }
        // console.log(arr);
        return arr
    }

    findDataRef = (name, data) => {
      let dataRef 
      data.forEach(v => {
        if(v.categoryEnglishName === name){
          dataRef = v
        }else if(v.children){
          if(this.findDataRef(name, v.children)){
            dataRef = this.findDataRef(name, v.children)
          }
        }
      })

      return dataRef
    }

    /**
     * 行权限模板格式化数据
     * @param {*} value
     */
    formatValue2=(value)=>{
        // console.log('开发',value)
        value = value||[];
        value = value.filter(v => v.selection !== 'halfChecked')
        return value.map(item=>item.tagEnglishName)
    }
    render(){
        let {TreeData} = this.state;
        const { form,templateModal,isView,data,user} = this.props;
        const { getFieldDecorator,setFieldsValue } = form;
        let {
          
            treeMap,
            tableData,
            entityData,
            offlineList,
            
        } = templateModal;
        let { auths } = user;
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            'margin':0
        };
        TreeData = TreeData||(data?data.treeData:templateModal.TreeData);
        return (
        <div>
          <h2>实体相关列权限字段</h2>
          <h3>ID信息配置: <Button style={{float:'right'}} onClick={()=>{
            console.log(routerRedux);
            this.props.dispatch( routerRedux.push({
              pathname:'/jurisdiction/template/modelConfig'
            }));
           
          }} type="primary">脱敏模板</Button></h3>
          {entityData.length > 0?
            <Tabs>
              { entityData.map((item,index) => {
                
                return <TabPane tab={item.entityName} key={index}>
                  <div className={styles.userCon}>
                    <Table
                      columns={this.getColumns(item.id,index)}
                      dataSource={TreeData[item.id + '']?TreeData[item.id + ''].idList:[]}
                      loading={false}
                      rowKey="initColumnId"
                      scroll={{ x: 1000 }}
                    />
                  </div>
                  {auths.indexOf('qxgl_mbgl_cj_lmb_bqjhpz') != -1?<div>
                    <h3>标签集合配置</h3>
                    <div className={styles.userCon} style={{ overflow: 'hidden',padding:"0 70px", margin: '20px 0' }}>            
                      <FormItem>
                          {getFieldDecorator(`tagList[${index}]`, {
                            initialValue:data?TreeData[item.id + ''].tagList:[],
                            rules: [{
                              validator:(rule, value, callback)=>{
                              
                              
                                callback()
                              }
                            }],
                          })(
                            <TreeTransfer 
                              disabled={isView == 'view'? true :false}
                              data={TreeData[item.id + '']?(TreeData[item.id + ''].treeList||[]):[]} 
                              titleKey="tagName"
                              rowKey = "tagEnglishName"
                              treeMap={TreeData[item.id + '']?(TreeData[item.id + ''].map||{}):{}}
                              formatValue={this.formatValue2}
                              formatData={this.formatCallback2}
                            />
                          )}
                        </FormItem>
                    </div>
                  </div>:null}
                </TabPane>
              })}
            </Tabs>:null
          }
          
          {auths.indexOf('qxgl_mbgl_cj_lmb_mxzdkz') != -1?<div>
            <h2>明细字段控制</h2>
            <h3>离线交易明细</h3>
            <div className={styles.templateMessage}>
              <Icon type="exclamation-circle"  className={styles.templateMessageIcon} />
              选中字段不可见
            </div>
            <div className={styles.userCon} style={{ overflow: 'hidden', padding: '30px 24px' }}>
              <FormItem>
                  {getFieldDecorator(`offlineList`, {
                    initialValue:data?data.offlineList.offlineList.filter(item=>item.id).map(item=>{return {id:item.initColumnId}}):[],
                    rules: [
                      { validator:(rule, value, callback)=>{
                            
                            {/* if (value.length == 0) {
                                callback('请选择功能点！')
                            } */}

                            // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                            callback()
                          } },
                    ],
                  })(
                    <UserCheckbox offlineList={offlineList} disabled={isView == 'view'? true :false} />
                )}
              </FormItem>
            </div>
          </div>:null}
        </div>
      )
    }
}
export default Template3