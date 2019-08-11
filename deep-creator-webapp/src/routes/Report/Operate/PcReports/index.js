import React, { Component } from 'react';
import { Row, Col, Tabs, Select } from 'antd';
import FlowAnalysis from './FlowAnalysis';
import PageAnalysis from './PageAnalysis';
import VisitedAnalsis from './VisitedAnalysis';
import styles from './index.less';

const TabPane = Tabs.TabPane;
export default class PcReports extends Component {
  callback = (key) => {
    console.log(key)
  }
  render() {
    return (
      <Row>
        <Col span={24}>
          <Tabs onChange={this.callback} type="line" tabPosition='top'>
            <TabPane tab="流量分析" key="1"><FlowAnalysis {...this.props} /></TabPane>
            <TabPane tab="页面分析" key="2"><PageAnalysis {...this.props} /></TabPane>
            <TabPane tab="访客分析" key="3"><VisitedAnalsis /></TabPane>
          </Tabs>
        </Col>
      </Row>
    )
  }
}