import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Row, Col, Card, Form, Input, Select, Icon, Button, message, Modal, Tree, Table, Tabs, TreeSelect, Popconfirm, Divider } from 'antd'
import utils from '../../../utils'
import cloneDeep from 'lodash/cloneDeep'

import EditableTable from './EditableTable'

import styles from './TagConfig.less'

const Option = Select.Option;


@connect(state => ({
  tags: state['sysconfig/tags']
}))
export default class TagQudao extends React.Component {

  state = {
  }

  columns = [];
  
  componentDidMount() {
    this.init();
  }

  init(){
    const { dispatch,tags } = this.props;
    dispatch({
      type: 'sysconfig/tags/queryALLCategoryList',
      callback:(list)=>{
        this.columns = [{
          title: '页面显示字段名称',
          dataIndex: 'columnTitle',
          key: 'columnTitle',
        }, {
          title: '数据库字段名称',
          dataIndex: 'columnName',
          key: 'columnName',
        }, {
          title: '速码分类',
          dataIndex: 'rowAuthorRootCode',
          key: 'rowAuthorRootCode',
          render: (text, record, index) => {
            return (
              <Select value={text} style={{width:'160px'}} onChange={::this.selectChange(index)}>
                {
                  list.map((item, i) => <Option key={i} value={`${item.dictionaryCode}`}>{item.dictionaryLabel}</Option> )
                }
              </Select>
            )
          }
        }];
        dispatch({
          type: 'sysconfig/tags/queryInitColumnList',
          payload: {
            entityId: this.props.entityId,
            configType: 5
          }
        });
      }
    }); 
  }

  selectChange(index){
    return (value)=>{
      this.props.dispatch({
        type: 'sysconfig/tags/setColumnList',
        payload: {
          entityId: this.props.entityId,
          index,
          value
        }
      });
    }
  }

  submit(){
    const { tags, entityId } = this.props;
    const columnList = tags['columnList_' + entityId];
    let params = [];
    columnList && columnList.length > 0 && columnList.map((item)=>{
      let o = {};
      o.columnName = item.columnName;
      o.columnTitle = item.columnTitle;
      o.configType = item.configType;
      o.dbColumnType = item.dbColumnType;
      o.entityId = item.entityId;
      o.id = item.id;
      o.isColumnAuthor = item.isColumnAuthor;
      o.isRowAuthor = item.isRowAuthor;
      o.rowAuthorRootCode = item.rowAuthorRootCode;
      o.safteTemplateId = item.safteTemplateId;
      params.push(o);
    });
    this.props.dispatch({
      type:'sysconfig/tags/saveChannelInit',
      payload: params
    })
  }

  reset(){
    this.init();
  }

  render() {
    const { tags, entityId } = this.props;
    const columnList = tags['columnList_' + entityId];
    return (
      <div className={styles.ProductConfing}>
        <Table columns={this.columns} dataSource={columnList && columnList.length > 0 ? columnList : []} pagination={false} rowKey="id"/>
        <div className={styles.btnGroups}>
          <Button onClick={::this.reset}>取消</Button>
          <Button type="primary" onClick={::this.submit}>确定</Button>
        </div>
      </div>
    )
  }
}