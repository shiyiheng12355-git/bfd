import React from 'react';
import { connect } from 'dva';
import { Button, Table, Divider, Modal } from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis'
import { routerRedux } from 'dva/router'
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const confirm = Modal.confirm;

@connect(state => ({
  postManage: state['jurisdiction/postManage'],
  loading: state.LOADING,
}))

class PostManage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      pageNum: 1,
      total: 0,
    }
    this.columns = [
      { 
        title: '岗位名称', 
        dataIndex: 'roleName', 
        key: 'roleName', 
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      },{
        title: '功能模版',
        dataIndex: 'operTemplateName',
        key: 'operTemplateName',
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      }, {
        title: '行权限模版',
        dataIndex: 'rowTemplateName',
        key: 'rowTemplateName',
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      }, {
        title: '列权限模版',
        dataIndex: 'columnTemplateName',
        key: 'columnTemplateName',
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      }, {
        title: '岗位人数',
        dataIndex: 'countNumber',
        key: 'countNumber',
        align: 'center',
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <span>
            <a onClick={() => { this.goToSeeOrEditPost(record, 'see') }}>查看</a>
            <Divider type="vertical" />
            <a onClick={() => { this.goToSeeOrEditPost(record, 'edit') }}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => { this.onDelete(record) }}>删除</a>
          </span>
         ),
      },
    ]
  }

  componentDidMount() {
    this.queryPostList(1)
  }

  queryPostList = (pageNum) => {
    this.props.dispatch({
      type: 'jurisdiction/postManage/queryPostList',
      payload: {
        pageNum,
        pageSize: 10,
      },
      callback: (res) => {
        this.setState({ total: res.total })
      }
    })
  }

  goToAddPost = () => {
    this.props.dispatch(routerRedux.push({
      pathname: `/jurisdiction/postManage/add`,
    }))
  }

  goToSeeOrEditPost = (record, type) => {
    this.props.dispatch(routerRedux.push({
      pathname: `/jurisdiction/postManage/postDetail/${type}/${JSON.stringify(record)}`,
    }))
  }

  onDelete = (record) => {
    let that = this
    confirm({
      className: 'bfd-delete',
      title: `确定删除${record.roleName}？`,
      content: '',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        that.props.dispatch({
          type: 'jurisdiction/postManage/deletePost',
          payload: record.id,
          callback: () => {
            that.queryPostList(that.state.pageNum)
          }
        })
      },
    })
  }

  render() {
    const { total, pageNum } = this.state
    const { postManage, loading } = this.props
    const { postList } = postManage

    return ( 
      <div className={styles.PostManage}>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '权限管理' }, { title: '岗位管理' }]} />

        <div className={styles.content}>
          <div className={styles['table-title']}>
            <strong>岗位信息</strong>
            <Button type="primary" onClick={::this.goToAddPost}>新增岗位</Button>
          </div>
          <Table
            bordered
            dataSource={postList}
            columns={this.columns}
            pagination={{
              total,
              current: pageNum,
              pageSize: 10,
              onChange: (page) => {
                this.setState({ pageNum: page })
                this.queryPostList(page)
              }
            }}
            loading={loading.effects['jurisdiction/postManage/queryPostList'] || false}
          />
        </div>
      </div>
    )
  }
}

export default PostManage
