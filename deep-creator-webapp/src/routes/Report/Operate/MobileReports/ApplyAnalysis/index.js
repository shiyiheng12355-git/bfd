import React, { Component } from 'react';
import { Row, Col, Tabs } from 'antd';
import { connect } from 'dva'
import UserLayout from './UserLayout';
import TimeAnalysis from './TimeAnalysis';
import AreaAnalysis from './AreaAnalysis';
import TerminalAnalysis from './TerminalAnalysis';
import OperatorAnalysis from './OperatorAnalysis'
import ChannelAnalysis from './ChannelAnalysis'
import VersionAnalysis from './VersionAnalysis'
import VisitedPages from './VisitedPages'

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
            <TabPane tab="用户忠诚度" key="loyal"><UserLayout title="用户忠诚度" {...this.props} /></TabPane>
            <TabPane tab="时段分析" key="time"><TimeAnalysis title="时段分析" {...this.props} /></TabPane>
            <TabPane tab="地区分析" key="region"><AreaAnalysis title="地区分析" {...this.props} /></TabPane>
            <TabPane tab="终端分析" key="model"><TerminalAnalysis title="终端分析" {...this.props} /></TabPane>
            <TabPane tab="运营商和网络" key="sim"><OperatorAnalysis title="运营商和网络" {...this.props} /></TabPane>
            <TabPane tab="渠道分析" key="channel"><ChannelAnalysis title='渠道分析' {...this.props} /></TabPane>
            <TabPane tab="版本分析" key="appverison"><VersionAnalysis title="版本分析" {...this.props} /></TabPane>
            <TabPane tab="访问页面" key="pages"><VisitedPages title="访问页面" {...this.props} /></TabPane>
            {/* <TabPane tab="访问路径" key="9">9</TabPane> */}
          </Tabs>
        </Col>
      </Row>
    )
  }
}
