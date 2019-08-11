import React, { Component } from 'react';
import { Row, Col, Tabs } from 'antd';
import PageVisited from './PageVisited';
import PageEntrt from './PageEntry';
import PageDr from './PageDr';

const TabPane = Tabs.TabPane;
export default class PageAnalysis extends Component {
  callback = (key) => {
    console.log(key)
  }
  render() {
    return (
      <Row>
        <Col span={24}>
          <Tabs onChange={this.callback} type="line" tabPosition='left'>
            <TabPane tab="受访页面" key="1"><PageVisited {...this.props} /></TabPane>
            <TabPane tab="入口页面" key="2"><PageEntrt {...this.props} /></TabPane>
            {/* <TabPane tab="页面医生" key="3"><PageDr {...this.props} /></TabPane> */}
          </Tabs>
        </Col>
      </Row>
    )
  }
}