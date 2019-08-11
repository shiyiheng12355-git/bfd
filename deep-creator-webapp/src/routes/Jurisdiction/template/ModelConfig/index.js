import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Select, Modal, Button,Popconfirm, Switch, Menu, Dropdown, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import Modal2 from './Modal';
import styles from './index.less'
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';

const confirm = Modal.confirm;
const Option = Select.Option;
const { Search } = Input;
const InputGroup = Input.Group;

@connect(state => ({
  resource: state['jurisdiction/modelConfig'],
}))
export default class Resource extends Component {
  state = {
    selectValue:'',
    selectKey:[],
    columns: [{
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
    }, {
      title: '模板类型',
      dataIndex: 'templateType',
      key: 'templateType',
      render:(item)=>{
        return item==1?'系统模板':'自定义模板'
      }
    }, {
      title: '状态',
      dataIndex: 'enableStatus',
      key: 'enableStatus',
      render: (item,row) => {
        return <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={item==1} onChange={(type)=>{
          this.stateChange(row.id,type);
        }} />
      },
    }, {
      title: '操作',
      key: 'operation',
      width:250,
      render: (row,item) => {
        if(row.templateType === 1){
          return (<span>
            <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'view'); }} href="javascipt:;">查看</a>
            </span>);
        }else{
          return (<span>
              <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'view'); }} href="javascipt:;">查看</a>
              <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'edit'); }} href="javascipt:;">编辑</a>
              <Popconfirm placement="left" title="是否删除该模板?" onConfirm={()=>{
                this.deleteModal([item.id])
              }}  okText="确定" cancelText="取消">
                <a style={{ marginRight: '10px' }} onClick={this.showDeleteConfirm} href="javascipt:;">删除</a>
              </Popconfirm> 
            </span>);
        }
      },
    }],
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'jurisdiction/modelConfig/fetchTableData',
      payload:{
        pageNum:1
      }
    });


    // this.props.dispatch({
    //   type: 'jurisdiction/modelConfig/fetchClassification',
    // });
  }
  /**
   * [getMenu 原新增节点需要区分部门组织 目前弃用]
   * @param  {[type]} item [description]
   * @return {[type]}      [description]
   */
  // getMenu(item){
  //   return (<Menu>
  //         <Menu.Item>
  //           <a onClick={() => { this.handleModal(item, 'createNext'); }} href="javascript:;">新增组织</a>
  //         </Menu.Item>
  //         <Menu.Item>
  //           <a onClick={() => { this.handleModal(item, 'createNext'); }} href="javascript:;">新增部门</a>
  //         </Menu.Item>
  //       </Menu>)
  // }
  /**
   * [stateChange 架构状态改变回调]
   * @return {[type]} [description]
   */
  stateChange(id,type){
    this.props.dispatch({
      type: 'jurisdiction/modelConfig/fetchChangeState',
      payload:id
    });
  }
  handleModal = (item, type) => {
    const modalData = cloneDeep(item);


    this.props.dispatch({
      type: 'jurisdiction/modelConfig/handleOpenModal',
      payload: { modalData, type },
    });
  }
  /**
   * [showDeleteConfirm 删除节点函数]
   * @param  {[type]} id [string|Array]
   * @return {[type]}    [description]
   */
  deleteModal = (item ,callback) => {
    
    this.props.dispatch({
      type: 'jurisdiction/modelConfig/fetchDelTemplate',
      payload: item,
      callback:callback
    });
  }

  /**
   * 翻页
   * @param {*} page 
   */
  pagination(page){
    this.props.dispatch({
      type: 'jurisdiction/modelConfig/fetchTableData',
      payload:{
        pageNum:page,
        templateName:this.state.selectName,
        templateType:this.state.selectValue
      }
    });
  }
  render() {
    const { columns } = this.state;
    const { resource } = this.props;
    const self = this;
    const {
      tableData,
      loading,
      controlType,
      organizationType,
    } = resource;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        self.state.selectKey = selectedRowKeys;
      },
      getCheckboxProps: record => ({
        disabled: record.templateType == 1, // Column configuration not to be checked
      }),
    };
    return (
      <PageHeaderLayout>
        <div className={styles.modelConfig} style={{ overflow: 'hidden', marginBottom: 15 }}>
          
          <label className={styles.searchTitle}>模板名称: </label>
          <InputGroup compact style={{width:360,float:'left'}}>
            <Select placeholder="模板类型" style={{ width: '30%' }} onChange={(value)=>{
                this.state.selectValue = value;
              }}>
              <Option value={""}>全部</Option>
              <Option value={1}>系统模板</Option>
              <Option value={2}>自定义模板</Option>
            </Select>
            <Search
              style={{ width: '50%' }}
              placeholder="请输入模板名"
              onSearch={value => {
                this.state.selectName = value;
                this.props.dispatch({
                  type: 'jurisdiction/modelConfig/fetchTableData',
                  payload:{
                    pageNum:1,
                    templateName:this.state.selectName,
                    templateType:this.state.selectValue
                  }
                });
              }}
              enterButton
            />
          </InputGroup>
          <Popconfirm placement="left" title="是否删除选中模板?" onConfirm={()=>{
              this.deleteModal(self.state.selectKey,()=>{
                self.state.selectKey = []
              })
              }}  okText="确定" cancelText="取消">
          <Button type="primary" onClick={this.showDeleteConfirm} style={{ float: 'right' }}>批量删除</Button>
          </Popconfirm>
          <Button type="primary" onClick={() => { this.handleModal({}, 'createFirst'); }} style={{ float: 'right',marginRight:20 }}>新增模板</Button>
        </div>
        <Table className={styles.modelConfig} columns={columns} rowSelection={rowSelection} dataSource={tableData} rowKey="id" loading={loading} />
        <Modal2 controlType={controlType} />
      </PageHeaderLayout>
    );
  }
}
