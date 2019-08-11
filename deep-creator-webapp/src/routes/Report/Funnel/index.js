import React, {
  Component,
} from 'react'
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Switch, Pagination, Popconfirm, Modal, Spin, Button, notification,Icon } from 'antd'
// import { browserHistory } from 'react-router'
import uuidV4 from 'uuid/v4'
import AddModal from './Add'
import FunnelView from '../../../components/FunnelView';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';


import styles from './index.less'


@connect(state => ({
  funnelModel: state['report/funnel'],
}))
class Funnel extends Component {
  state = {
    ifloading: true, // 是否加载动画
    switchdis: false, // 是否禁用切换状态
    funneldom: [], // 首页漏斗DOM
    data: [], // 存放接口数据
    totalCounts: null, // 漏斗数据总数
    pageSize: 10, // 页面显示数量
    currentPage: 1, // 当前页
    showAddModal: false, // 显示新增漏斗弹层
    AddModalKey: uuidV4(), // 新增漏斗弹层key
  }

  // 初始化数据
  componentDidMount() {
    // this.getFunnelList()
    this.props.dispatch({
      type: 'report/funnel/fetchFunnelaList',
      payload: 1,
    })
  }


  // // 删除漏斗
  deleteFunel=(data)=>{
    console.log('删除', data);
    this.props.dispatch({
      type:'report/funnel/fetchFunnelCollection',
      payload:data.id,
      callback:(data2)=>{
        if(data2){
          notification.open({
            message: '提示',
            description: '该漏斗已收藏，请先删除收藏！',
            icon:  <Icon type="exclamation-circle" style={{ color: 'red' }} />,
          });
        }else{

          this.props.dispatch({
            type: 'report/funnel/fetchDelById',
            payload: data.id,
          })
        }
      }
    })
  }

  // 切换状态
  handleChangeStatus=(data)=>{
    this.props.dispatch({
      type: 'report/funnel/fetchMonitor',
      payload: {
        funnelId: data.id,
        isMonitor: !data.isMonitor,
      },
    })
  }

  // 跳转路由显示具体数据
  showDetail=(data)=>{
    console.log('跳转', data);
    // browserHistory.push(common.rebuildUrl('/analysis/funnel/detail?id=' + data.funnel_id))
    const { history } = this.props;
    history.push({
      pathname: '/report/funnel/detail',
      search: `?id=${data.id}`,
    })
    // this.props.dispatch( routerRedux.push({
    //   pathname:'/report/funnel/detail?id='+data.id
    // }));
  }

  // 重置弹层key，丢弃原有数据
  resetModalKey= () => {
    this.state.addModalKey = uuidV4();
    // this.getFunnelList()
  }

  // 关闭弹层
  handleModalClose = () => {
    this.props.dispatch({
      type: 'report/funnel/handleCloseModal',
    })
    // this.getFunnelList()
  }

  render() {
    const { funnelModel } = this.props;
    const {
      ifloading,
      funnelaList,
      totalCounts,
      currentPage,
      visible,
    } = funnelModel;
    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '报表管理' }, { title: '实时行为漏斗' }]}>
        <div className={styles.funnel}>
          <div className={styles.bt}>
            <h2>实时行为漏斗</h2>
            <div className={styles['main-mid-head']}>
              <Button type="primary"
                onClick={() => {
                  this.props.dispatch({
                    type: 'report/funnel/handleOpenModal',
                  })
                }}><i className={`${styles.fa} ${styles['fa-plus']}`} />新增漏斗</Button>
            </div>
          </div>
          <Spin size="large" spinning={ifloading}>
            <div className={styles.padding20}>{
              funnelaList.length > 0 ? funnelaList.map((item, i) => {
                return (<FunnelView key={i}
                  ondel={this.deleteFunel}
                  onClick={this.showDetail}
                  onState={this.handleChangeStatus}
                  data={item} />)
              }) : null
            }</div>
            {funnelaList.length > 0 ?
              <div className={styles['page-new']}>
                <Pagination
                  current={currentPage * 1}
                  total={totalCounts}
                  pageSize={10}
                  onChange={(page) => {
                    this.props.dispatch({
                      type: 'report/funnel/fetchFunnelaList',
                      payload: page,
                    })
                  }} >
                </Pagination>
              </div> : <div className={styles.nodata}>暂无数据</div>}
          </Spin>
          <Modal maskClosable={false}
            width={900}
            title="新增转化漏斗"
            afterClose={() => { this.resetModalKey() }}
            footer={null}
            visible={visible}
            key={this.state.addModalKey}
            onCancel={this.handleModalClose}>
            <AddModal isList onCancel={this.handleModalClose} />
          </Modal>
        </div>
      </PageHeaderLayout >
    )
  }
}

export default Funnel