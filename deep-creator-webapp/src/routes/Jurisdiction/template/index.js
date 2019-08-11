import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, Popconfirm, Select, Button, Switch, Modal } from 'antd';
import moment from 'moment'
import Modal2 from './Modal'
import cloneDeep from 'lodash/cloneDeep';
import { Link } from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

import styles from './index.less';

const { Search, TextArea } = Input;
const InputGroup = Input.Group;
const Option = Select.Option;
const hashMap = ['', '功能权限模板', '行字段权限模板', '列字段权限模板'];
const Authorized = RenderAuthorized();
const btnAuth = {
  auth:[],
  aa:false,
  qxgl_mbgl_cj:false
}
const authHash = {
  qxgl_mbgl_cj_gnmb:"1",
  qxgl_mbgl_cj_hmb:"2",
  qxgl_mbgl_cj_lmb:"3"
}
// const Auth1 = RenderAuthorized('qxgl_mbgl_cj');
// const Auth2 = RenderAuthorized('qxgl_mbgl_cj_gnmb');
// const Auth3 = RenderAuthorized('qxgl_mbgl_cj_hmb');
// const Auth4 = RenderAuthorized('qxgl_mbgl_cj_lmb');
@connect(state => ({
  organization: state['jurisdiction/template'],
  user: state.user,
}))
export default class Resource extends Component {
  state = {
    visible: false,
    selectValue: '',
    modalType: 1,
    columns: [{
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
    },
    {
      title: '模板类型',
      dataIndex: 'templateType',
      key: 'templateType',
      render: (item) => {
        return hashMap[item];
      },
    },
    {
      title: '状态',
      dataIndex: 'enableStatus',
      key: 'enableStatus',
      render: (item, row) => {
        return (<Switch checkedChildren="开"
          unCheckedChildren="关"
          checked={item === 1}
          onChange={(type) => {
            this.stateChange(row.id, type);
          }} />)
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: 200,
      render: (row, item) => {
        return (<span>
          <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'view'); }} href="javascript:void(0);">查看</a>
          <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'copy'); }} href="javascript:void(0);">复制</a>
          <a style={{ marginRight: '10px' }} onClick={() => { this.handleModal(item, 'edit'); }} href="javascript:void(0);">编辑</a>
          <Popconfirm placement="left"
            title="是否删除该模板?"
            onConfirm={() => {
              this.deleteModal([item.id])
            }}
            okText="确定"
            cancelText="取消">
            <a style={{ marginRight: '10px' }} href="javascript:void(0);">删除</a>
          </Popconfirm>
        </span>);
      },
    }],
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'jurisdiction/template/fetchTableData',
      payload: {
        pageNum: 1,
      },
    });
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: {
        parentKey: 'qxgl_mbgl',
      }
    });
    
  }
  /**
   * [stateChange 架构状态改变回调]
   * @return {[type]} [description]
   */
  stateChange(id, type) {
    this.props.dispatch({
      type: 'jurisdiction/template/fetchChangeTempState',
      payload: id,
    });
  }
  /**
   * 弹出表单
   */
  handleModal = (item, type) => {
    let modalData = {};

    modalData.isView = type;
    modalData.id = item.id;
    modalData.templateType = item.templateType;
    this.props.dispatch({
      type: `template/modal/template${item.templateType}/fetchEditData`,
      payload: item.id,
      callback: (data) => {
        this.props.dispatch({
          type: 'jurisdiction/template/handleOpenModal',
          payload: { modalData, data },
        });
      },
    });
  }
  deleteModal = (item, callback) => {
    this.props.dispatch({
      type: 'jurisdiction/template/deleteTemplate',
      payload: item,
      callback,
    });
  }

  handeText = (e, type) => {
    const { modalData } = this.props.organization;
    modalData[type] = e.target.value;
    this.props.dispatch({
      type: 'jurisdiction/template/changeModal',
      payload: { modalData },
    });
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'jurisdiction/template/handleCloseModal',
    });
  }

  handleOk = () => {
    let { modalType } = this.state;
    let type = 'view';
    this.props.dispatch({
      type: 'jurisdiction/template/handleOpenModal',
      payload: { modalType, type },
    });
  }

  /**
   * 选择模板弹窗
   *
   * @memberof Resource
   */
  handleAlert(type) {
    this.props.dispatch({
      type: 'jurisdiction/template/setVisibleModel',
      payload: type,
    });
  }
  /**
   * 翻页
   * @param {*} page
   */
  pagination(page) {
    this.props.dispatch({
      type: 'jurisdiction/template/fetchTableData',
      payload: {
        pageNum: page,
        templateName: this.state.selectName,
        templateType: this.state.selectValue,
      },
    });
  }

  render() {
    const { columns, addInfo } = this.state;
    const { organization, user } = this.props;
    let {
      tableData,
      loading,
      modalData,
      total,
      current,
      templateData,
      visibleModel,
    } = organization;
    let { auths } = user;
    const self = this;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        self.state.selectKey = selectedRowKeys;
      },

    };
    if(!btnAuth.aa){
      btnAuth.auth = auths;
      btnAuth.aa = auths;
    }
    return (
      <PageHeaderLayout contentClassName={styles.userManage} breadcrumbList={[{ title: '首页', href: '/' }, { title: '权限管理' }, { title: '模板管理' }]}>
        <div className={styles.template} style={{ display: modalData.visible ? 'none' : 'block' }}>
          <div style={{ overflow: 'hidden', marginBottom: 15 }}>
            <label className={styles.searchTitle}>模板名称: </label>
            <InputGroup compact style={{ width: 360, float: 'left' }}>
              <Select placeholder="模板类型"
                style={{ width: '30%' }}
                onChange={(value) => {
                  this.state.selectValue = value;
                }}>
                <Option value="">全部</Option>
                <Option value={1}>功能权限模板</Option>
                <Option value={2}>行字段权限模板</Option>
                <Option value={3}>列字段权限模板</Option>
              </Select>
              <Search
                style={{ width: '50%' }}
                placeholder="请输入模板名"
                onSearch={(value) => {
                  this.state.selectName = value;
                  this.props.dispatch({
                    type: 'jurisdiction/template/fetchTableData',
                    payload: {
                      pageNum: 1,
                      templateName: this.state.selectName,
                      templateType: this.state.selectValue,
                    },
                  });
                }}
                enterButton
              />
            </InputGroup>
            <Popconfirm placement="left"
              title="是否删除选中模板?"
              onConfirm={() => {
                this.deleteModal(self.state.selectKey, () => {
                  self.state.selectKey = []
                })
              }}
              okText="确定"
              cancelText="取消">
              <Button type="primary" style={{ float: 'right', marginLeft: 20 }}>批量删除</Button>
            </Popconfirm>
            <Authorized authority={() => auths.includes('qxgl_mbgl_cj')}>
              <Button type="primary"
                onClick={() => { 
                  this.props.dispatch({
                    type: 'user/fetchAuths',
                    payload: {
                      parentKey: 'qxgl_mbgl_cj',
                    },
                    callback:(data)=>{
                      btnAuth.qxgl_mbgl_cj = true;
                      btnAuth.auth = btnAuth.aa.concat(data);
                      console.log(btnAuth.auth)
                      this.handleAlert(true);
                    }
                  });
                }}
                style={{ float: 'right' }}>新增模板</Button>
            </Authorized>
          </div>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              total,
              current,
              onChange: (page) => {
                this.pagination(page);
              },
            }}
          />
        </div>
        <Modal
          title="新增模板类型选择"
          visible={visibleModel}
          onOk={this.handleOk}
          onCancel={() => {
            this.handleAlert(false);
          }}
        >
          <label className={styles.searchTitle}>模板类型: </label>
          {btnAuth.auth.length > 1 ? <Select placeholder="模板类型"
            onChange={(value) => {
              this.state.modalType = value;
            }}
            defaultValue={authHash[btnAuth.auth[0]]}
            style={{ width: 200, marginLeft: 20 }}>
            {
              [
                btnAuth.auth.indexOf('qxgl_mbgl_cj_gnmb') != -1 && <Option key={1} value="1">功能权限模板</Option>,
                btnAuth.auth.indexOf('qxgl_mbgl_cj_hmb') != -1 && <Option key={2} value="2">行字段权限模板</Option>,
                btnAuth.auth.indexOf('qxgl_mbgl_cj_lmb') != -1 && <Option key={3} value="3">列字段权限模板</Option>
              ]
              
            }
          </Select>:null}
        </Modal>
        <Modal2
          visible={modalData.visible}
          templateType={modalData.templateType}
          isView={modalData.isView}
          id={modalData.id}
          templateData={templateData}
        />
      </PageHeaderLayout>
    );
  }
}
