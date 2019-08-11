import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Modal,message } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import Modals from './Modal';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { searchTree } from '../../../utils/utils'
import './index.less';

const { Search } = Input;
const confirm = Modal.confirm;

@connect(state => ({
  resource: state.resource,
}))
export default class Resource extends Component {
  state = {
    columns: [
      {
        title: '资源名称',
        dataIndex: 'resourceTitle',
        width: '15%',
      },
      {
        title: '资源类型',
        dataIndex: 'resourceType',
        width: '15%',
        render: (val) => {
          switch (val) {
            case 1:
              return '一级菜单';
              break;
            case 2:
              return '二级菜单';
              break;
            case 3:
              return '区块';
              break;
            case 4:
              return '按钮';
              break;
            default:
              return '';
          }
        },
      },
      {
        title: '描述',
        dataIndex: 'resourceDesc',
        width: '15%',
      },
      {
        title: '连接URL',
        dataIndex: 'resourceUrl',
        width: '15%',
      },
      {
        title: '类型',
        dataIndex: 'resourceSign',
        width: '10%',
        render: (val) => {
          switch (val) {
            case 1:
              return '系统内置';
              break;
            case 2:
              return '用户扩展';
              break;
            default:
              return '';
          }
        },
      },
      {
        title: 'key',
        dataIndex: 'resourceKey',
        width: '15%',
      },
      {
        title: '操作',
        key: 'operation',
        width: '15%',
        render: (item) => {
          return (<span>

            <a style={{ marginRight: 8 }} onClick={() => { this.handleModal(item, 'view'); }} href="javascript:;">查看</a>
            <a style={{ marginRight: 8 }} onClick={() => { this.handleModal(item, 'edit'); }} href="javascript:;">编辑</a>
            {
              item.resourceSign === 2 ? <a style={{ marginRight: 8 }} onClick={() => { this.handleModal(item, 'delete'); }} href="javascript:;">删除</a> : ''
            }
            <a style={{ marginRight: 8 }} onClick={() => { this.handleModal(item, 'createNext'); }} href="javascript:;">新增</a>
          </span>);
        },
      },
    ],
    searchData: null,
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'resource/fetchTableData',
    });
  }

  handleSearch = (val) => {
    /* this.props.dispatch({
      type: 'resource/fetchTableData',
      resourceTitle: val,
    }); */
    const result = searchTree(this.props.resource.defaultData, 'resourceKey', 'parentResourceKey', 'resourceTitle', val)
    console.log(result)
    !result ? this.setState({ searchData: null }) : this.setState({ searchData: result })
  }

  handleModal = (item, type) => {
    const modalData = cloneDeep(item);
    if (type === 'createFirst') {
      modalData.resourceTitle = '';
      modalData.resourceDesc = '';
      modalData.resourceTypeName = '';
      modalData.resourceType = '';
      modalData.resourceKey = '';
      this.props.dispatch({
        type: 'resource/handleOpenModal',
        payload: { modalData, type },
      });
    } else if (type === 'createNext') {
      modalData.resourceTitle = '';
      modalData.resourceDesc = '';
      modalData.parentResourceKey = modalData.resourceKey
      modalData.resourceKey = '';
      modalData.resourceUrl = '';
      modalData.isCascadeAdd = false
      this.props.dispatch({
        type: 'resource/handleOpenModal',
        payload: { modalData, type },
      });
    } else if (type === 'delete') {
      confirm({
        content: '是否删除该条数据？',
        onOk: () => {
          if(item.children && item.children.length >0 ){
            message.error('请先删除二级菜单，再删除一级菜单！');
            return ;
          }
          this.props.dispatch({
            type: 'resource/fetchDelItem',
            payload: item.id,
          })
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } else {
      this.props.dispatch({
        type: 'resource/handleOpenModal',
        payload: { modalData, type },
      });
    }
  }


  render() {
    const { columns, searchData } = this.state;
    const { resource } = this.props;
    const {
      tableData,
      loading,
    } = resource;
    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '系统管理' }, { title: '资源管理' }]}>
        <div style={{ overflow: 'hidden', marginBottom: 15 }}>
          <label>资源名称: </label>
          <Search
            style={{ width: 240 }}
            onSearch={this.handleSearch}
            enterButton
          />
          <Button type="primary" onClick={() => { this.handleModal({}, 'createFirst'); }} style={{ float: 'right' }}>新增一级菜单</Button>
        </div>
        <Table
          bordered
          columns={columns}
          dataSource={searchData || tableData}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
        <Modals />
      </PageHeaderLayout>
    );
  }
}
