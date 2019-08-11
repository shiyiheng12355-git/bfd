import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Row, Col, Card, Form, Input, Select, Icon, Button, message, Modal, Tree, Table, Tabs, TreeSelect, Popconfirm } from 'antd'
import utils from '../../../utils'
import cloneDeep from 'lodash/cloneDeep'

import EditableTable from './EditableTable'

import styles from './TagConfig.less'


const TabPane = Tabs.TabPane
//下拉树选择
const TreeNode = TreeSelect.TreeNode

@connect(state => ({
  tags: state['sysconfig/tags']
}))
export default class TagConfing extends React.Component {
  
  state = {
    globalStatus: false,
    tagsStatus: false,
    isload:false
  }

  tagEnglishName = '';
  
  getColumns(zyfw){
    return [{
      title: '参数名称',
      dataIndex: 'param_cn',
      width: '15%'
    },{
      title: '参数英文名',
      dataIndex: 'param_en',
      width: '15%'
    },{
      title: '作用范围',
      dataIndex: 'zyfw',
      width: '15%',
      render: (text, record) => zyfw
    }, {
      title: '参数类型',
      dataIndex: 'param_type',
      width: '15%',
      type: 'select',
      data: [{
        value: 'int',
        option: 'int'
      }, {
        value: 'float',
        option: 'float'
      }, {
        value: 'boolean',
        option: 'boolean'
      }, {
        value: 'string',
        option: 'string'
      }, {
        value: '枚举',
        option: '枚举'
      }]
    }, {
      title: '调整范围',
      dataIndex: 'value',
      width: '15%'
    }, {
      title: '参数说明',
      dataIndex: 'param_explain',
      width: '15%'
    }];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sysconfig/tags/querySelectTree',
      payload: {
        entityId: this.props.entityId
      }
    });
  }

  treeSelectChange(value) { 
    const { dispatch, entityId } = this.props;
    this.tagEnglishName = value;
    dispatch({
      type: 'sysconfig/tags/querytagInfoExceptCover',
      payload: {
        entityId: this.props.entityId,
        tagEnglishName: value
      }, 
      callback: (data) => {
        const formatData = this.formatToValue(data);
        this.setState({
          ['paramConstraintJson_' + entityId]: formatData,
          isload: true
        });
      }
    });
  }

  // format data of paramConstraintJson
  formatToValue(_data){
    let data = cloneDeep(_data);
    data && data.global && data.global.length > 0 && data.global.map((item)=>{
      if(item.type == 'range'){
        item.value = item.range.gte + '~' + item.range.lte;
      }
    });
    data && data.tags && data.tags.length > 0 && data.tags.map((item) => {
      if (item.type == 'range') {
        item.value = item.range.gte + '~' + item.range.lte;
      }
    });
    return data;
  }
  
  loop(data){
    return data.map((item, i) => {
      const treeNodeKey = !!item.tagEnglishName ? item.tagEnglishName : item.categoryEnglishName
      if (item.children) {
        return <TreeNode title={item.categoryName || item.tagName} value={treeNodeKey} key={treeNodeKey} className="noneEvent">{this.loop(item.children)}</TreeNode>
      }
      return <TreeNode title={item.categoryName || item.tagName} value={treeNodeKey} key={treeNodeKey} />
    })
  }

  submit() {
    const { dispatch, entityId } = this.props;
    const data = this.state['paramConstraintJson_' + entityId];
    const params = this.getParams(data);
    if (this.tagEnglishName) {
      dispatch({
        type: 'sysconfig/tags/updateTagConstraint',
        payload: {
          tagEnglishName: this.tagEnglishName,
          entityId,
          paramJson: JSON.stringify(params)
        }
      });
    } 
  }

  getParams(data){
    return {
      global: this.formatParamConstraintJson(data['global']),
      tags: this.formatParamConstraintJson(data['tags'])
    }
  }

  formatParamConstraintJson(_list){
    const list = cloneDeep(_list);
    let a = [];
    list && list.length > 0 && list.map((item)=>{
      let obj = {};
      obj.param_cn = item.param_cn;
      obj.param_en = item.param_en;
      obj.param_explain = item.param_explain;
      obj.param_type = item.param_type;
      if (item.param_type == 'int' || item.param_type == 'float'){
        obj.type = 'range';
        const range = item.value && item.value.split('~');
        obj.range = {
          gte: Number(range[0]),
          lte: Number(range[1])
        }
      } else if (item.param_type == 'boolean'){
        obj.type = 'value';
        obj.value = !!item.value?item.value:'false'
      }else{
        obj.type = 'value';
        obj.value = item.value;
      }
      a.push(obj);
    });
    return a;
  }

  changeTableData(list, type){
    const { entityId } = this.props;
    let paramConstraintJson = cloneDeep(this.state['paramConstraintJson_' + entityId])||{};
    let flag = false;
    list && list.length > 0 && list.map((item)=>{
      if (item.hasOwnProperty('editable') && item.editable) {
        flag = true;
      }
    });
    if (type == 'global') {
      paramConstraintJson.global = list;
      this.setState({ globalStatus: flag });
    }
    if (type == 'tags') { 
      paramConstraintJson.tags = list;
      this.setState({ tagsStatus: flag });
    }
    this.setState({
      ['paramConstraintJson_' + entityId]: paramConstraintJson
    });
  }

  reset(){
    if (!!this.tagEnglishName){
      this.treeSelectChange(this.tagEnglishName);
      this.setState({
        globalStatus: false,
        tagsStatus: false
      });
    }
  }
  
  render() {
    const { tags, entityId } = this.props;
    const paramConstraintJson = this.state['paramConstraintJson_' + entityId];
    return (
      <div className={styles.ProductConfing}>
        
        <div className={styles.tagRow}>
          <TreeSelect
            style={{ width: 200 }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeDefaultExpandAll
            onChange={::this.treeSelectChange}
            placeholder="标签名称选择">
            {this.loop(tags['treeList_' + entityId]||[])}
          </TreeSelect>
        </div>

        <EditableTable 
          add={{
            editable: true,
            add: true,
            param_cn: '',
            param_en: '',
            zyfw: '全局参数',
            param_type: 'string',
            value: '',
            type: 'value',
            param_explain: ''
          }}
          config={{
            data: paramConstraintJson  && paramConstraintJson['global'] ||[],
            columns: this.getColumns('全局参数')
          }}
          onChange={(data) => {
            this.changeTableData(data,'global')
          }}
          isload={this.state.isload}
          title="全局参数配置"
          btnText="新增全局参数" />

          <EditableTable
            add={{
              editable: true,
              add: true,
              param_cn: '',
              param_en: '',
              zyfw: '标签值参数',
              param_type: 'string',
              value: '',
              type: 'value',
              param_explain: ''
            }}
            config={{
              data: paramConstraintJson && paramConstraintJson['tags'] || [],
              columns: this.getColumns('标签值参数')
            }}
            onChange={(data) => {
              this.changeTableData(data, 'tags')
            }}
            isload={this.state.isload}
            title="标签值参数配置"
            btnText="新增标签值参数" />

        <div className={styles.btnGroups}>
          <Button onClick={::this.reset}>取消</Button>
          {this.state.globalStatus || this.state.tagsStatus ? 
            (<Button type="primary" onClick={::this.submit} disabled>确定</Button>) : 
            (<Button type="primary" onClick={::this.submit}>确定</Button>)}
        </div>
      </div>
    )
  }
}
