import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import {  Form  } from 'antd';
import TreeTransfer from '../../../../../components/TreeTransfer';
import styles from '../index.less'


const FormItem = Form.Item;



@connect(state => ({
  templateModal: state['template/modal/template1'],
}))
class Template1 extends Component {
    componentWillMount() {

        // this.props.dispatch({
        //   type: 'template/modal/fetchTreeData',
        // });
        this.props.dispatch({
            type: 'template/modal/template1/fetchTreeData'
        });
    }
      /**
   * 功能模板格式化数据
   * @param {*} value 
   * @param {*} e 
   */
    formatCallback=(value,e,sel)=>{
        let {data} = this.props;
        let arr = [];
        // value = sel(value)
        // e.checkedNodes.map(item=>{
            // if(!item.props.dataRef.resourceSet){
                // arr.push({
                    // resourceKey:item.props.dataRef.resourceKey+''
                // })
            // }
        // })
        value.map(item=>{
            // if(!item.props.dataRef.resourceSet){
                arr.push({
                    resourceKey:item
                })
            // }
        })
        return arr
    }
    /**
     * 功能模板格式化数据
     * @param {*} value
     */
    formatValue=(value)=>{
        return value.map(item=>item.resourceKey+'')
    }
    /**过滤中间层 */
    filterMiddle=(data)=>{
        const { templateModal} = this.props;
        const {
            
            treeMap,
        } = templateModal;
        console.log(treeMap);
        let arr = []
        data.map(item=>{
            if (treeMap.map[item.resourceKey] && !treeMap.map[item.resourceKey].resourceSet){
                arr.push(item)
            }
        })
        console.log('filterMiddle',arr);
        return arr
    }
    render(){
        const { form,templateModal,data,isView} = this.props;
        const { getFieldDecorator,setFieldsValue } = form;
        const {
            TreeData,//资源表功能权限
            treeMap,
        } = templateModal;
        // data && this.filterMiddle(data.resourceList);
        return (
            <div>
            <h2>功能集合筛选</h2>
            <div className={styles.userCon} style={{ overflow: 'hidden',padding:"0 70px", margin: '20px 0' }}>            
              <FormItem>
                  {getFieldDecorator(`resourceList`, {
                    initialValue:data?this.filterMiddle(data.resourceList):[],
                    rules: [{
                      validator:(rule, value, callback)=>{
                        
                       // if (value.length == 0) {
                         //   callback('请选择功能点！')
                        //}
    
                        // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                        callback()
                      }
                    }],
                  })(
                    <TreeTransfer 
                        disabled={isView == 'view'? true :false}
                        data={TreeData}
                        treeMap={treeMap}
                        
                        childrenKey="resourceSet" 
                        titleKey="resourceTitle"
                        rowKey="resourceKey"
                        formatValue={::this.formatValue}
                        formatData={::this.formatCallback}
                     />
                  )}
                </FormItem>
            </div>
            </div>
          )
    }
}
export default Template1