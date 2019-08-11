import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, InputNumber, Row, Col } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout'

@connect(state => (
  {
    REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT: state.reportconfig.REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT,
    REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT: state.reportconfig.REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT,
  }
))
export default class ReportConfig extends Component {
  state = {
    limit: {
      jd: null,
      sl: null,
    },
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'reportconfig/fetchVal',
    })
  }

  onChange = (value, type) => {
    const { limit } = this.state
    limit[type] = value
    this.setState({ limit })
  }

  saveLimit = () => {
    const { limit } = this.state
    let smConfigKvInfo = []
    smConfigKvInfo.push(
      {
        configKey: 'REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT',
        configValue: limit.jd || this.props.REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT,
      },
      {
        configKey: 'REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT',
        configValue: limit.sl || this.props.REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT,
      }
    )
    this.props.dispatch({
      type: 'reportconfig/fetchSaveVal',
      payload: smConfigKvInfo,
    })
    console.log(smConfigKvInfo)
  }

  resetLimit = () => {
    const { limit } = this.state
    limit.jd = null
    limit.sl = null
    this.setState({ limit })
  }

  render() {
    const { REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT, REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT } = this.props
    const { jd, sl } = this.state.limit
    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '系统管理' }, { title: '报表管理配置' }]}>
        <div style={{ background: '#fff', padding: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <label>单个漏斗层数节点上限：</label>
              {REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT !== undefined ? <InputNumber min={3} max={15} value={jd || REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT} onChange={(val) => { this.onChange(val, 'jd') }} /> : ''}
            </Col>
            <Col span={12}>
              <label>单个岗位创建漏斗数量上限：</label>
              {REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT !== undefined ? <InputNumber min={3} max={15} value={sl || REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT} onChange={(val) => { this.onChange(val, 'sl') }} /> : ''}
            </Col>
          </Row>
          <div style={{ marginTop: 16 }}>
            <Button type='primary' onClick={this.saveLimit}>保存</Button>
            <Button style={{ marginLeft: 16 }} onClick={this.resetLimit}>重置</Button>
          </div>
        </div>
      </PageHeaderLayout>
    )
  }
}