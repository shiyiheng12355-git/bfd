import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Button, Switch, Popconfirm } from 'antd';
import moment from 'moment'
import Modal from './Modal'
import cloneDeep from 'lodash/cloneDeep';
import { Link } from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

const { Search, TextArea } = Input;

@connect(state => ({
  organization: state.userManage,
}))
export default class Resource extends Component {
  state = {
    visible: false,
    selectedRowKeys: [],
    columns: [{
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '真实姓名',
      dataIndex: 'userFullname',
      key: 'userFullname',

    },
    {
      title: '状态',
      dataIndex: 'enableStatus',
      key: 'enableStatus',
      render: (item, row) => {
        return <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={item == 1} onChange={(type) => {
          this.stateChange(row.id, type);
        }} />
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: 200,
      render: (row, item) => {
        return (<span>
          <a style={{ marginRight: '10px' }} onClick={() => {
            this.handleModal({
              isView: true,
              id: item.id
            }, 'view');
          }} href="javascript:void(0);">查看</a>
          <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'edit'); }} href="javascript:void(0);">编辑</a>
          <Popconfirm placement="left" title="是否删除该用户?" onConfirm={() => {
            this.deleteModal([item.id])
          }} okText="确定" cancelText="取消">
            <a style={{ marginRight: '10px' }} href="javascript:void(0);">删除</a>
          </Popconfirm>
        </span>);
      },
    }],
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'userManage/fetchTableData',
      payload: {
        pageNum: this.props.organization.current
      }
    });
    this.props.dispatch({
      type: 'userManage/fetchGetFormData'
    });
  }
  /**
   * [stateChange 架构状态改变回调]
   * @return {[type]} [description]
   */
  stateChange(id, type) {
    this.props.dispatch({
      type: 'userManage/fetchChangeUserState',
      payload: id
    });
  }
  handleModal = (item, type) => {
    const modalData = cloneDeep(item);
    const self = this;
    if (type === 'createFirst') {
      this.props.dispatch({
        type: 'userManage/modal/resetFormData',
      });
      this.props.dispatch({
        type: 'userManage/handleOpenModal',
        payload: { modalData, type },
      });
    } else {
      this.props.dispatch({
        type: 'userManage/fetchGetDataById',
        payload: item.id,
        callback: (data) => {
          modalData.data = data;
          self.props.dispatch({
            type: 'userManage/handleOpenModal',
            payload: { modalData, type },
          });
        }
      })
    }
  }
  deleteModal = (item, type) => {
    this.props.dispatch({
      type: 'userManage/fetchDelUser',
      payload: item,
      callback: () => {
        this.state.selectedRowKeys = []
      }
    });
  }



  pagination(page) {
    this.props.dispatch({
      type: 'userManage/fetchTableData',
      payload: {
        pageNum: page
      }
    });
  }
  render() {
    const { columns, addInfo } = this.state;
    const { organization } = this.props;
    const {
      tableData,
      loading,
      modalData,
      visible,
      total,
      current,
      controlType
    } = organization;

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.state.selectedRowKeys = selectedRowKeys;

      },

    };

    return (
      <PageHeaderLayout contentClassName={styles.userManage} breadcrumbList={[{ title: '首页', href: '/' }, { title: '权限管理' }, { title: '用户管理' }]}>
        <div style={{ display: visible ? 'none' : 'block' }}>
          <div style={{ overflow: 'hidden', marginBottom: 15 }}>
            <label>用户名称: </label>
            <Search
              style={{ width: 240 }}
              placeholder="请输入用户名"
              onSearch={value => {
                this.props.dispatch({
                  type: 'userManage/fetchTableData',
                  payload: {
                    pageNum: 1,
                    userName: value
                  }
                });
              }}
              enterButton
            />
            <Popconfirm placement="left" title="是否删除该用户?" onConfirm={() => {
              this.deleteModal(this.state.selectedRowKeys)
            }} okText="确定" cancelText="取消">
              <Button type="primary" style={{ float: 'right', marginLeft: 20 }}>批量删除</Button>
            </Popconfirm>
            <Button type="primary" onClick={() => {
              this.handleModal({
                isView: false
              }, 'createFirst');
            }} style={{ float: 'right' }}>新增用户</Button>
          </div>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              total: total,
              current: current,
              onChange: (page) => {
                this.pagination(page);
              }
            }}
            rowSelection={rowSelection}
          />
        </div>
        <Modal visible={visible} isView={modalData.isView} controlType={controlType} data={modalData.data} id={modalData.id} />
      </PageHeaderLayout>
    );
  }
}
