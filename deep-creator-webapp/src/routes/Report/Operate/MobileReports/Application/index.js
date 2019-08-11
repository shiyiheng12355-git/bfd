import React, { Component } from 'react';
import { Row, Col, Tabs } from 'antd';
import { connect } from 'dva'
import Trend from './Trend'
import Abstract from './Abstract'
import Top from './Top'


const TabPane = Tabs.TabPane;

@connect(state => (
  {
    pagesTab: state['report/operation'].pagesTab,
  }
))
export default class Application extends Component {
  callback = (key) => {
    this.props.dispatch({
      type: 'report/operation/setPagesTab',
      payload: key,
    })
  }
  render() {
    return (
      <Row>
        <Col span={24}>
          <Tabs activeKey={this.props.pagesTab} onChange={this.callback} type="line" tabPosition='left'>
            <TabPane tab="流量与趋势" key="trend"><Trend title="数据趋势" {...this.props} /></TabPane>
            <TabPane tab="应用摘要" key="abstract"><Abstract title="应用摘要" {...this.props} /></TabPane>
            <TabPane tab="TOP分析" key="top"><Top title="TOP10" {...this.props} /></TabPane>
          </Tabs>
        </Col>
      </Row>
    )
  }
}