import React, { Component } from 'react';
import { Row, Col, Tabs } from 'antd';
import { connect } from 'dva'
import ErrorList from './ErrorList'
import ErrorTrend from './ErrorTrend'

const TabPane = Tabs.TabPane;

@connect(state => (
  {
    pagesTab: state['report/operation'].pagesTab,
  }
))
export default class UserAnalysis extends Component {
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
            <TabPane tab="错误趋势" key="errorTrend"><ErrorTrend title='错误趋势' {...this.props} /></TabPane>
            <TabPane tab="错误列表" key="errorList"><ErrorList title='错误列表' {...this.props} /></TabPane>
          </Tabs>
        </Col>
      </Row>
    )
  }
}