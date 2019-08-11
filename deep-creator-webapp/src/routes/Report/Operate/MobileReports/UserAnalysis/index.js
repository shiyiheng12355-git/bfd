import React, { Component } from 'react';
import { Row, Col, Tabs } from 'antd';
import LifeRange from './LifeRange'
import NewUser from './NewUser'
import LivedUser from './LivedUser'
import ActiveUser from './ActiveUser'
import SilentUser from './SilentUser'
import LostUser from './LostUser'
import BackUser from './BackUser'

const TabPane = Tabs.TabPane;
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
          <Tabs onChange={this.callback} type="line" tabPosition='left'>
            <TabPane tab="用户生命周期" key="lifeRange"><LifeRange title='用户生命周期' {...this.props} /></TabPane>
            <TabPane tab="新增用户" key="2"><NewUser title='新增用户' {...this.props} /></TabPane>
            <TabPane tab="留存用户" key="3"><LivedUser title='留存用户' {...this.props} /></TabPane>
            <TabPane tab="活跃用户" key="4"><ActiveUser title='活跃用户' {...this.props} /></TabPane>
            <TabPane tab="沉默用户" key="5"><SilentUser title='沉默用户' {...this.props} /></TabPane>
            <TabPane tab="流失用户" key="6"><LostUser title='流失用户' {...this.props} /></TabPane>
            <TabPane tab="回访用户" key="7"><BackUser title='回访用户' {...this.props} /></TabPane>
          </Tabs>
        </Col>
      </Row>
    )
  }
}