import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import {  Tabs, Form, Select, Row, Col  } from 'antd';
import TreeTransfer from '../../../../../components/TreeTransfer';
import styles from '../index.less'


const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@connect(state => ({
  templateModal: state['template/modal/template2'],
}))
class Template2 extends Component {
    componentWillMount() {

        // this.props.dispatch({
        //   type: 'template/modal/fetchTreeData',
        // });
        this.props.dispatch({
            type: 'template/modal/template2/fetchQueryEntityAttribute'
        });
    }
    /**
     * 行权限模板格式化数据
     * @param {*} value 
     * @param {*} e 
     */
    formatCallback2(value,e){
        let nodes = e.checkedNodes;
        let arr = [];
        nodes.map(item=>{
        if(!item.props.dataRef.codeValueList){
            arr.push({
              initColumnId:item.props.dataRef.initColumnId,
              cellCode:item.props.dataRef.dictionaryCode
            })
        }
        
        })
        return arr
    }
    /**
     * 行权限模板格式化数据
     * @param {*} value
     */
    formatValue2(value){
        value = value||[];
        return value.map(item=>item.cellCode||item.dictionaryCode)
    }
    render(){
        let { form,templateModal,data,isView} = this.props;
        const { getFieldDecorator,setFieldsValue } = form;
        const {
            TreeData,//资源表功能权限
            treeMap,
            entityData,
        } = templateModal;
        if(Object.keys(TreeData).length == 0){
            // yield put({
            //     type:'fetchQueryEntityAttribute'
            // })
          data = null
        }
        return (
        <div>
          <h2>行字段控制</h2>
          <h3>实体属性表行权限控制</h3>
          {entityData.length > 0 ?
            <Tabs>
              { entityData.map((item,index) => {
                return <TabPane tab={item.entityName} key={index}>
                  <div className={styles.userCon} style={{ overflow: 'hidden',padding:"0 70px", margin: '20px 0' }}>            
                    <FormItem>
                        {getFieldDecorator(`entityAttributeInfo[${item.id}]`, {
                          initialValue:data?data[`fun${item.id}`]:[],
                          rules: [{
                            validator:(rule, value, callback)=>{
                              
                              //if (value.length == 0) {
                                // callback('请选择功能点！')
                              //}

                              // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                              callback()
                            }
                          }],
                        })(
                          <TreeTransfer 
                            data={TreeData[`fun${item.id}`]?(TreeData[`fun${item.id}`].treeList||[]):[]}
                            treeMap={TreeData[`fun${item.id}`]?(TreeData[`fun${item.id}`].map||{}):{}}
                            disabled={isView == 'view'? true :false}
                            childrenKey="codeValueList" 
                            titleKey="dictionaryLabel"
                            rowKey="dictionaryCode"
                            parentId="initColumnId"
                            formatValue={::this.formatValue2}
                            formatData={::this.formatCallback2}
                          />
                        )}
                      </FormItem>
                  </div>
                </TabPane>
              })}
            </Tabs>:null
          }
        
          <h3 style={{borderTop:'1px solid #E9E9E9'}}>实体标签体系渠道</h3>
          {entityData.length > 0 ?<Tabs>
            { entityData.map((item,index) => {
              return <TabPane tab={item.entityName} key={index}>
                <div className={styles.userCon} style={{ overflow: 'hidden',padding:"0 70px", margin: '20px 0' }}>
                  <FormItem>
                    {getFieldDecorator(`entityTagInfo[${item.id}]`, {
                      initialValue:data?data[`cha${item.id}`]:[],
                      rules: [{
                        validator:(rule, value, callback)=>{
                          // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                          callback()
                        }
                      }],
                    })(
                      <TreeTransfer 
                          data={TreeData[`cha${item.id}`]?(TreeData[`cha${item.id}`].treeList||[]):[]}
                          treeMap={TreeData[`cha${item.id}`]?(TreeData[`cha${item.id}`].map||{}):{}}
                          childrenKey="codeValueList" 
                          disabled={isView == 'view'? true :false}
                          titleKey="dictionaryLabel"
                          rowKey="dictionaryCode"
                          parentId="initColumnId"
                          formatValue={::this.formatValue2}
                          formatData={::this.formatCallback2}
                        />
                    )}
                  </FormItem>
                </div>
              </TabPane>
            })}
          </Tabs>:null}
          <h2>明细字段行权限控制</h2>
          <h3>客户端明细</h3>
          <div className={styles.userCon} style={{ overflow: 'hidden',padding:"0 70px", margin: '20px 0' }}>
              <FormItem>
                {getFieldDecorator(`appKey`, {
                  initialValue:data?data[`appKeyInfo`].map(item=>item.appkey):[],
                  rules: [{
                    validator:(rule, value, callback)=>{
                      // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                      callback()
                    }
                  }],
                })(
                  <TreeTransfer 
                      data={TreeData['7']?(TreeData['7'].treeList||[]):[]}
                      treeMap={TreeData['7']?(TreeData['7'].map||{}):{}}
                      disabled={isView == 'view'? true :false}
                      childrenKey="codeValueList" 
                      titleKey="appkeyName"
                      rowKey="appkey"
                    />
                )}
              </FormItem>
            </div>
          <h3>线下交易明细</h3>
          <div className={styles.userCon} style={{ overflow: 'hidden',padding:"0 70px", margin: '20px 0' }}>            
            <FormItem>
                {getFieldDecorator(`offlineTransactionInfo`, {
                  initialValue:data?data[`offlineTransactionInfo`]:[],
                  rules: [{
                    validator:(rule, value, callback)=>{
                      //暂不校验
                      //if (value.length == 0) {
                      //    callback('请选择功能点！')
                      //}

                      // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                      callback()
                    }
                  }],
                })(
                  <TreeTransfer 
                      data={TreeData['8']?(TreeData['8'].treeList||[]):[]}
                      childrenKey="codeValueList" 
                      titleKey="dictionaryLabel"
                      rowKey="dictionaryCode"
                      disabled={isView == 'view'? true :false}
                      parentId="initColumnId"
                      treeMap={TreeData['8']?(TreeData['8'].map||{}):{}}
                      formatValue={::this.formatValue2}
                      formatData={::this.formatCallback2}
                    />
                )}
              </FormItem>
          </div>
        </div>
      )
    }
}
export default Template2