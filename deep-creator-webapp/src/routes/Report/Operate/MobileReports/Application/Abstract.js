import React, { Component } from 'react';
import { Row, Col, Icon, Tooltip, Spin } from 'antd';
import { connect } from 'dva'
import moment from 'moment';
import { formatNumber } from '../../../../../utils/utils';
import { MasTitle } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';

@connect(state => (
  {
    absList: state['report/mobile/abstract'].absList,
    activeList: state['report/mobile/abstract'].activeList,
    Global: state.LOADING,
  }
))
export default class Abstract extends Component {
  state = {
    titleExplain: '累计用户： 截止到当前时间，使用BDI以来统计到的总用户数。<br/>沉默用户： 新增用户仅在安装日（及安装次日）启动，且在后续时段内无启动行为，则被认为是沉默用户。<br/>沉默用户占比： 累计沉默用户/截止7天前的累计用户。 <br/>近7天日均新增账号： 最近7天平均每日注册用户数。<br/>近7天日均活跃账号： 最近7天平均每日登录用户数。 ',
  }
  componentDidMount() {
    const { appkey, selectedGroupData } = this.props
    this.props.dispatch({
      type: 'report/mobile/abstract/fetchAbsList',
      payload: {
        appkey,
      },
    })
    this.props.dispatch({
      type: 'report/mobile/abstract/fetchActiveList',
      payload: {
        appkey,
        startDateStr: moment().subtract(8, 'days').format('YYYY-MM-DD'),
        endDateStr: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      },
    })
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey } = nextProps
    if (appkey !== this.props.appkey) {
      this.props.dispatch({
        type: 'report/mobile/abstract/fetchAbsList',
        payload: {
          appkey,
        },
      })
      this.props.dispatch({
        type: 'report/mobile/abstract/fetchActiveList',
        payload: {
          appkey,
        },
      })
    }
  }

  renderAst = (data) => {
    return (
      data.map((item, i) => {
        return (
          <Row key={i}>
            <Col span={12}>
              {item.name}
            </Col>
            <Col span={12}>
              {item.value}
            </Col>
          </Row>
        )
      })
    )
  }

  render() {
    const { absList, activeList, Global } = this.props
    return (
      <div>
        <Spin size='large' spinning={Global.effects['report/mobile/abstract/fetchAbsList'] || Global.effects['report/mobile/abstract/fetchActiveList']}>
          <MasTitle noTime {...this.props} />
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, height: 155 }}>
                <HeaderTitle>应用摘要</HeaderTitle>
                <Row style={{ borderBottom: '1px solid #ececec' }}>
                  <Col style={{ padding: 16 }} span={12}>累计用户</Col>
                  <Col style={{ padding: 16 }} span={12}>{!absList || !absList.addUpUserCount ? '暂无数据' : formatNumber(absList.addUpUserCount)}</Col>
                </Row>
                <Row>
                  <Col style={{ padding: 16 }} span={12}>沉默用户（比例）</Col>
                  <Col style={{ padding: 16 }} span={12}>{!absList || !absList.silentCount ? '暂无数据' : `${formatNumber(absList.silentCount)} (${(Number(absList.silentCountRate) * 100).toFixed(2)}%) ` }</Col>
                </Row>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, height: 155 }}>
                <HeaderTitle>活跃状况</HeaderTitle>
                <Row style={{ borderBottom: '1px solid #ececec' }}>
                  <Col style={{ padding: 16 }} span={12}>次日留存率均值</Col>
                  <Col style={{ padding: 16 }} span={12}>{activeList && activeList.nextDayRetentionMean ? `${(Number(activeList.nextDayRetentionMean) * 100).toFixed(2)}%` : '暂无数据' }</Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Spin>
      </div >
    )
  }
}
