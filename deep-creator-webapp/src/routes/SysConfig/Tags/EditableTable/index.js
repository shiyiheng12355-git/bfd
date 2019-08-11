import React from 'react'
import { connect } from 'dva'
import { Row, Col, Input, Select, Icon, Button, Table, Popconfirm } from 'antd'
import cloneDeep from 'lodash/cloneDeep'
import EditableCell from './EditableCell'
import utils from '../../../../utils'
import styles from './index.less'

export default class EditableTable extends React.Component {
  
  state = {
    data: [],
    flag: false
  }

  componentDidMount(){
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }

  init(props){
    let { data, columns } = props.config;
    this.setState({ data });
    columns.map((item, i) => {
      if (!item.hasOwnProperty('render')){
        item.render = (text, record, index) => {
          if (i==5 && !record.add){
            return text;
          }
          if (i==4){
            if (record.param_type == 'int' || record.param_type == 'float'){
              return this.renderColumns(this.state.data, index, item.dataIndex, text, item.type, item.data, 'int');
            }
            if (record.param_type == 'boolean' ){
              return this.renderColumns(this.state.data, index, item.dataIndex, text, item.type, item.data, 'boolean');
            }
          }
          return this.renderColumns(this.state.data, index, item.dataIndex, text, item.type, item.data, 'string');
        } 
      }
    })
    const operation = {
      title: '操作',
      dataIndex: 'operation',
      width: '10%',
      render: (text, record, index) => {
        const { editable } = this.state.data[index]
        return (
          <div className="editable-row-operations">
            { editable? <span><a onClick={() => this.editDone(index, 'save')}>保存</a></span>: <span><a onClick={() => this.edit(index)}>编辑</a></span> }
            {this.state.data && this.state.data.length > 0 ? (
              <Popconfirm
                placement="top"
                title="确认删除吗？"
                onConfirm={() => this.del(index)}
                okText="确定"
                cancelText="取消">
                <a>删除</a>
              </Popconfirm>
            ): <a>删除</a>}
          </div>
        );
      }
    }
    if (columns[columns.length - 1].dataIndex == 'operation'){
      columns.splice(columns.length - 1,1);
    }
    columns.push(operation);
    this.columns = columns
  }
  
  renderColumns(data, index, key, text,itemType,itemData,flag) {
    let { editable, status } = data[index];
    if (typeof editable === 'undefined') {
      editable = false;
    }
    return (
      <EditableCell
        editable={editable}
        value={text}
        onChange={value => this.handleChange(key, index, value)}
        status={status}
        itemType={itemType}
        itemData={itemData}
        tz={flag}
        onSelectChange={() => this.onSelectChange(key,index)}
      />)
  }

  handleChange(key, index, value) {
    const { data } = this.state
    data[index][key] = value
    this.setState({ data });
  }

  onSelectChange(key,index){
    const { data } = this.state;
    data[index]['value'] = '';
    this.setState({ data });
  }

  del(index){
    let { data } = this.state;
    if(data && data.length>0){
      data.splice(index,1);
      this.setState({ data },()=>{
        this.props.onChange && this.props.onChange(data);
      });
    }
  }


  edit(index) {
    const { data } = this.state;
    if (data[index]) {
      data[index].editable = true
    }
    this.setState({ data },()=>{
      this.props.onChange && this.props.onChange(data);
    });
  }

  editDone(index, type) {
    const { data } = this.state
    if (data[index] && typeof data[index].editable !== 'undefined') {
      data[index].editable = false
      data[index].status = type
    }
    this.setState({ data }, () => {
      if (data[index] && typeof data[index].editable !== 'undefined') {
        delete data[index].status;
      }
      this.editParamsConfig(data, type)
    })
  }

  editParamsConfig(data, type) {
    if(type == 'save'){
      this.props.onChange && this.props.onChange(data);
    }
  }

  //加一列
  addParams() {
    let data = cloneDeep(this.state.data);
    let flag = false;
    data.map((item)=>{
      if (item.editable) flag = true;
    });
    if(flag) return;
    let obj = cloneDeep(this.props.add);
    data.push(obj);
    this.setState({ data },()=>{
      this.props.onChange && this.props.onChange(data);
    });
  }

  render() {
    return (
      <div className={styles.editTable}>
        <div className={styles.title}>{this.props.title}：</div>
        {this.props.isload ? (<div className={styles.addBtn} onClick={::this.addParams}>+ {this.props.btnText}</div>):null}
        <Table
          dataSource={this.state.data ||[]}
          columns={this.columns}
          pagination={false}
          rowKey={(record,index) => index }
          />
      </div>
    )
  }
}
