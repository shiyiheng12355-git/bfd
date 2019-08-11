import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Select, Modal, Button, Switch, Menu, Dropdown, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import Modal2 from './Modal';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

const confirm = Modal.confirm;
const Option = Select.Option;
const { Search } = Input;

@connect(state => ({
  resource: state.organization,
}))
export default class Resource extends Component {
  state = {
    selectedRowKeys: [],
    columns: [{
      title: '组织名称',
      dataIndex: 'orgName',
      key: 'orgName',
    }, {
      title: '组织代码',
      dataIndex: 'orgCode',
      key: 'orgCode',
    }, {
      title: '状态',
      dataIndex: 'enableStatus',
      key: 'enableStatus',
      render: (item, row) => {
        return (<Switch checkedChildren="开"
          unCheckedChildren="关"
          checked={item==1}
          onChange={(type)=>{
          this.stateChange(row.id,type);
        }} />)
      },
    }, {
      title: '操作',
      key: 'operation',
      width: 250,
      render: (row, item) => {
        return (<span>
          <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'view'); }} href="javascript:void(0);">查看</a>
          <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'edit'); }} href="javascript:void(0);">编辑</a>
          <a style={{ marginRight: '10px' }}
            onClick={()=>{
              this.showDeleteConfirm([item.id]);
            }}
            href="javascript:void(0);">删除</a>
          <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal({ parentOrgCode: item.orgCode }, 'createNext'); }} href="javascript:void(0);">新增子节点</a>
          {/* item.isp?<Dropdown overlay={((item)=>{
            return this.getMenu(item)
          })(item)}>
              <a className="ant-dropdown-link" href="#">
                新增子节点<Icon type="down" />
              </a>
            </Dropdown>:<a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'createNext'); }} href="javascript:void(0);">新增子节点</a>*/}
        </span>);
      },
    }],
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'organization/fetchTableData',
    });
  }
  /**
   * [getMenu 原新增节点需要区分部门组织 目前弃用]
   * @param  {[type]} item [description]
   * @return {[type]}      [description]
   */
  getMenu(item) {
    return (<Menu>
          <Menu.Item>
            <a onClick={() => { this.handleModal(item, 'createNext'); }} href="javascript:;">新增组织</a>
          </Menu.Item>
          <Menu.Item>
            <a onClick={() => { this.handleModal(item, 'createNext'); }} href="javascript:;">新增部门</a>
          </Menu.Item>
        </Menu>)
  }
  /**
   * [stateChange 架构状态改变回调]
   * @return {[type]} [description]
   */
  stateChange(id, type) {
    this.props.dispatch({
      type: 'organization/fetchChangeStatusById',
      payload: {id,enableStatus:type?1:0}
    })
  }
  handleModal = (item, type) => {
    const modalData = cloneDeep(item);

    if (type === 'createFirst') {
      modalData.orgName = '';
      modalData.orgDesc = '';
      modalData.orgCode = '';
      modalData.parentOrgCode = 'root';
      this.props.dispatch({
        type: 'organization/handleOpenModal',
        payload: { modalData, type },
      });
    } else if (type === 'createNext') {
      modalData.orgName = '';
      modalData.orgDesc = '';
      modalData.orgCode = '';
      this.props.dispatch({
        type: 'organization/handleOpenModal',
        payload: { modalData, type },
      });
    } else {
      this.props.dispatch({
        type: 'organization/handleOpenModal',
        payload: { modalData, type },
      });
    }
  }
  /**
   * [showDeleteConfirm 删除节点函数]
   * @param  {[type]} id [string|Array]
   * @return {[type]}    [description]
   */
  showDeleteConfirm(id,callback) {
    let self = this;
    confirm({
      title: '提示',
      content: '确定删除该节点?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        self.props.dispatch({
          type: 'organization/fetchDelByID',
          payload: id,
          callback:callback
        })
      },
    })
  }


  render() {
    const { columns } = this.state;
    const { resource } = this.props;
    const {
      tableData,
      loading,
      searchData,
      controlType,
      organizationType,
    } = resource;
    let dataTable = [];
    const self = this;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('666',selectedRowKeys,selectedRows)
        // self.state.selectedRowKeys = selectedRowKeys;
        self.state.selectedRowKeys = selectedRows.map(item=>{
          return item.id
        })
      },

    };
    if(searchData){
      dataTable = searchData
    }else{
      dataTable = tableData
    }
    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '权限管理' }, { title: '组织架构管理' }]}>
        <div style={{ overflow: 'hidden', marginBottom: 15 }}>
          <label>组织名称: </label>
          <Search
            placeholder="输入组织名称"
            style={{ width: 240 }}
            onSearch={value => {
              this.props.dispatch({
                type:'organization/getSearchData',
                payload:value
              })
            }}
            enterButton
          />
          <Button type="primary"
            onClick={() => {
              this.showDeleteConfirm(self.state.selectedRowKeys,()=>{
                {/* console.log(11111,self.state.selectedRowKeys) */}
                {/* self.state.selectedRowKeys = [] */}
              });
            }}
            style={{ float: 'right' }}>批量删除</Button>
          <Button type="primary" onClick={() => { this.handleModal({}, 'createFirst'); }} style={{ float: 'right', marginRight: 20 }}>新增组织</Button>
        </div>
        <Table className={styles.organization} columns={columns} rowSelection={rowSelection} dataSource={dataTable} rowKey="id" loading={loading} />
        <Modal2 controlType={controlType} />
      </PageHeaderLayout>
    );
  }
}
