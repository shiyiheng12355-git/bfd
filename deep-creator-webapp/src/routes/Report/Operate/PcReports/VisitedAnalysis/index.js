import React, { Component } from 'react';
import { Row, Col, Tabs, Select } from 'antd';
import ONVisited from './ONVisited';
import SysCon from './SysCon';
import Loyal from './Loyal';
import Area from './Area';

const TabPane = Tabs.TabPane;
export default class VisitedAnalysis extends Component {
  callback = (key) => {
    console.log(key)
  }
  render() {
    return (
      <Row>
        <Col span={24}>
          <Tabs onChange={this.callback} type="line" tabPosition='left'>
            <TabPane tab="新老访客" key="1"><ONVisited /></TabPane>
            <TabPane tab="用户地域" key="2"><Area /></TabPane>
            <TabPane tab="系统环境" key="3"><SysCon /></TabPane>
            <TabPane tab="忠诚度" key="4"><Loyal /></TabPane>
          </Tabs>
        </Col>
      </Row>
    )
  }
}