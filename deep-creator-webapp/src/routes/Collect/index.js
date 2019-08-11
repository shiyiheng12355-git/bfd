import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Icon, Popconfirm, Spin } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FunnelView from '../../components/FunnelView';
import LineChart from '../Report/EventReport/LineChart';

@connect(state => ({
  collect: state['collect/collect'],
  loading: state.LOADING,
}))
export default class Collect extends PureComponent {
  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.init(nextProps);
    }
  }

  init(props) {
    const { dispatch, match } = props;
    dispatch({
      type: 'collect/collect/clear',
    });

    dispatch({
      type: 'collect/collect/queryList',
      payload: {
        menuId: match.params.id,
      },
      callback: (list) => {
        list && list.length > 0 && list.map((item, i) => {
          // 报表
          if (item.collectionType == 1) {
            dispatch({
              type: 'collect/collect/fetchReport',
              payload: item,
            })
          }
          // 漏斗
          if (item.collectionType == 2) {
            dispatch({
              type: 'collect/collect/fetchFunnel',
              payload: item,
            })
          }
        });
      },
    });
  }

  del(data) {
    this.props.dispatch({
      type: 'collect/collect/delFunnelById',
      payload: {
        id: data.id,
      },
      callback: () => {
        this.init(this.props);
      },
    })
  }

  // 跳转路由显示具体数据
  showDetail = (data) => {
    const { history } = this.props;
    history.push({
      pathname: '/report/funnel/detail',
      search: `?id=${JSON.parse(data.contentJson).funnelId}`,
    })
  }

  render() {
    const { collect, loading } = this.props;
    return (
      <div>
        <div style={{ margin: '0 10px' }}><PageHeaderLayout /></div>
        {
          collect.report &&
          collect.report.length > 0 ?
          collect.report.map((item, i) => (<div key={i} style={{ background: '#fff', margin: '10px', padding: '12px 20px', position: 'relative' }}>
            <h5>{item.collectionName}</h5>
            <LineChart chartData={item.data} isCollect entityId={item.entityId} reportParams={JSON.parse(item.contentJson)} {...this.props}/>
            <Popconfirm title="确认删除吗?" onConfirm={()=>this.del(item)}  okText="确定" cancelText="取消">
              <Icon type="close" style={{ position: 'absolute', top: '10px', right: '10px' }} />
            </Popconfirm>
            </div>)) : loading.effects['collect/collect/fetchReport'] ? <div style={{ textAlign: 'center', minHeight: '400px', lineHeight: '400px' }}><Spin size="large" /></div> : null
        }
        {
          collect.funnel &&
          collect.funnel.length > 0 ?
            (collect.funnel.map((item, i) => <FunnelView counts={item.counts} hideBtn ondel={data => this.del(item)} onClick={data => this.showDetail(item)} data={item.data} key={i} />)) :
          loading.effects['collect/collect/fetchFunnel'] ? <div style={{ textAlign: 'center', minHeight: '400px', lineHeight: '400px' }}><Spin size="large" /></div>: null
        }
      </div>
    );
  }
}