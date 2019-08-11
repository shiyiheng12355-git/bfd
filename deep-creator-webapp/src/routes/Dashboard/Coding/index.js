import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Modal } from 'antd';
import { Link } from 'dva/router';
import CreateCategory from './CreateModal'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
// import './index.less';

const { Search } = Input;
const confirm = Modal.confirm;

@connect(state => ({
  coding: state.coding,
}))
export default class Coding extends Component {
  state = {
    columns: [
    /* {
      title: '速码类别',
      dataIndex: 'dictionaryCode',
    }, */
    {
      title: '速码类别',
      dataIndex: 'dictionaryLabel',
    },
    {
      title: '速码描述',
      dataIndex: 'dictionaryDesc',
    },
    {
      title: '状态',
      dataIndex: 'enableFlag',
      render: item => (
        item === 0 ? '系统预置' : '自定义'
      ),
    },
    {
      title: '操作',
      key: 'operation',
      render: (item) => {
        return (<span>
          <Link style={{ marginRight: '8px' }} to={`/config/coding/${item.dictionaryCode}`}>进入码表</Link>
          {item.enableFlag === 1 ? <a onClick={() => { this.deleteModal(item, 'del'); }} href="javascript:;">删除</a> : '' }
        </span>);
      },
    }],
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'coding/fetchTableData',
    });
  }

  deleteModal = (item, type) => {
    const dictionaryCode = type === 'del' ? item.dictionaryCode : item;
    confirm({
      title: '确认删除',
      content: '是否删除所选数据？',
      onOk: () => {
        this.props.dispatch({
          type: 'coding/fetchDelCategory',
          payload: dictionaryCode,
        });
      },
      onCancel() { },
    });
  }

  handleOpenModal = () => {
    this.props.dispatch({
      type: 'coding/openModal',
    })
  }

  handleSearch = (value) => {
    this.props.dispatch({
      type: 'coding/fetchTableData',
      payload: { label: value },
    })
  }

  render() {
    const { columns } = this.state;
    const { coding } = this.props;
    const {
      tableData,
      loading,
      addInfo,
      visible,
    } = coding;
    const pagination = {
      total: tableData.total,
      pageSize: tableData.pageSize,
      current: tableData.pageNum,
      onChange: (paginations) => {
        this.props.dispatch({
          type: 'coding/fetchTableData',
          payload: { pageNum: paginations },
        })
      },
    }
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys })
      },
      getCheckboxProps: record => ({
        disabled: record.enableFlag === 0,
      }),
    };

    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '系统管理' }, { title: '快速编码' }]}>
        <div style={{ overflow: 'hidden', marginBottom: 15 }}>
          <label>速码类别: </label>
          <Search
            style={{ width: 240 }}
            onSearch={this.handleSearch}
            enterButton
          />
          <Button type="primary" onClick={() => { this.deleteModal(this.state.selectedRowKeys, 'bathdel'); }} style={{ float: 'right', marginLeft: 20 }}>选中删除</Button>
          <Button type="primary" onClick={this.handleOpenModal} style={{ float: 'right' }}>新增</Button>
        </div>
        <Table
          columns={columns}
          dataSource={tableData.list}
          loading={loading}
          rowKey="dictionaryCode"
          rowSelection={rowSelection}
          pagination={pagination}
        />
        <CreateCategory />
      </PageHeaderLayout>
    );
  }
}
