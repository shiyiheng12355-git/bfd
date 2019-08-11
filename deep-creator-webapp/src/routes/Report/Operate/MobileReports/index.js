import React, { Component } from 'react';
import { Row, Col, Tabs, Select } from 'antd';
import { connect } from 'dva'
import Application from './Application'
import UserAnalysis from './UserAnalysis'
import ApplyAnalysisi from './ApplyAnalysis'
import ErrorAnalysis from './ErrorAnalysis'

const TabPane = Tabs.TabPane;

@connect(state => (
  {
    navTab: state['report/operation'].navTab,
  }
))
export default class MobileReports extends Component {
  callback = (key) => {
    let pagesTab = ''
    this.props.dispatch({
      type: 'report/operation/setNavTab',
      payload: key,
    })
    switch (key) {
      case 'app':
        pagesTab = 'trend'
        break;
      case 'user':
        pagesTab = 'lifeRange'
        break;
      case 'used':
        pagesTab = 'loyal'
        break;
      case 'error':
        pagesTab = 'errorTrend'
        break;
      default:
        break;
    }
    this.props.dispatch({
      type: 'report/operation/setPagesTab',
      payload: pagesTab,
    })
  }
  render() {
    return (
      <Row>
        <Col span={24}>
          <Tabs activeKey={this.props.navTab} onChange={this.callback} type="line" tabPosition='top'>
            <TabPane tab="应用概况" key="app"><Application {...this.props} /></TabPane>
            <TabPane tab="用户分析" key="user"><UserAnalysis {...this.props} /></TabPane>
            <TabPane tab="使用分析" key="used"><ApplyAnalysisi {...this.props} /></TabPane>
            <TabPane tab="错误分析" key="error"><ErrorAnalysis {...this.props} /></TabPane>
          </Tabs>
        </Col>
      </Row>
    )
  }
}
