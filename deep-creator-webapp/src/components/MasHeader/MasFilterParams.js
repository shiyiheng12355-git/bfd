import React, { Component } from 'react';
import { Row, Col, Radio, Button, Table, Checkbox, Switch } from 'antd';

const CheckboxGroup = Checkbox.Group;

export default class MasFilterParams extends Component {
  state = {
    showFilter: false,
    checkedList: {
      province: [],
      channel: [],
      appversion: [],
    },
    indeterminate: {
      province: false,
      channel: false,
      appversion: false,
    },
    checkedAllList: {
      province: false,
      channel: false,
      appversion: false,
    },
  }

  onChange = (val, type) => {
    const { checkedList, indeterminate, checkedAllList } = this.state
    const { filterData } = this.props
    checkedList[type] = val
    indeterminate[type] = !!checkedList[type].length && (checkedList[type].length < filterData[type].length)
    checkedAllList[type] = checkedList[type].length === filterData[type].length
    this.setState({
      checkedList,
      indeterminate,
      checkedAllList,
    })
    this.props.onChange(checkedList)
  }

  onCheckAllChange = (e, type) => {
    const { checkedList, indeterminate, checkedAllList } = this.state
    const { filterData } = this.props
    let arr = []
    e.target.checked ? filterData[type].map((item) => { arr.push(item.value) }) : ''
    checkedList[type] = arr
    indeterminate[type] = false
    checkedAllList[type] = e.target.checked
    this.setState({
      checkedList,
      indeterminate,
      checkedAllList,
    });
    this.props.onChange(checkedList)
  }

  handleOpenFilter = (checked) => {
    this.setState({ showFilter: checked })
  }

  renderFilter = (filterData = this.props.filterData) => {
    const { province, channel, appversion } = filterData
    const { checkedList, checkedAllList, indeterminate } = this.state
    const { hideProvince, hideChannel, hideAppversion } = this.props
    let provinceGroup
    let channelGroup
    let appversionGroup
    if (province && !hideProvince) {
      provinceGroup = (<div style={{ marginBottom: 8 }}>
        <div style={{ borderBottom: '1px solid #e9e9e9', marginBottom: 4, paddingBottom: 4 }}>
          <Checkbox
            indeterminate={indeterminate.province}
            onChange={(e) => { this.onCheckAllChange(e, 'province') }}
            checked={checkedAllList.province}
          >
            全部地区
          </Checkbox>
        </div>
        <div>
          <CheckboxGroup options={province} value={checkedList.province} onChange={(e) => { this.onChange(e, 'province') }} />
        </div>
      </div>)
    }
    if (channel && !hideChannel) {
      channelGroup = (<div style={{ marginBottom: 8 }}>
        <div style={{ borderBottom: '1px solid #e9e9e9', marginBottom: 4, paddingBottom: 4 }}>
          <Checkbox
            indeterminate={indeterminate.channel}
            onChange={(e) => { this.onCheckAllChange(e, 'channel') }}
            checked={checkedAllList.channel}
          >
            全部渠道
          </Checkbox>
        </div>
        <div>
          <CheckboxGroup options={channel} value={checkedList.channel} onChange={(e) => { this.onChange(e, 'channel') }} />
        </div>
      </div>)
    }
    if (appversion && !hideAppversion) {
      appversionGroup = (<div>
        <div style={{ borderBottom: '1px solid #e9e9e9', marginBottom: 4, paddingBottom: 4 }}>
          <Checkbox
            indeterminate={indeterminate.appversion}
            onChange={(e) => { this.onCheckAllChange(e, 'appversion') }}
            checked={checkedAllList.appversion}
          >
            全部版本
          </Checkbox>
        </div>
        <div>
          <CheckboxGroup options={appversion} value={checkedList.appversion} onChange={(e) => { this.onChange(e, 'appversion') }} />
        </div>
      </div>)
    }
    return (<div>
      {provinceGroup}
      {channelGroup}
      {appversionGroup}
    </div>)
  }

  render() {
    const { showFilter } = this.state
    const { filterLabel } = this.props
    return (
      <Row style={{ margin: '16px 0' }}>
        <Col span={24}>
          <label> { filterLabel ? `${filterLabel}：` : '筛选条件：' }</label>
          <Switch checkedChildren="开" unCheckedChildren="关" onChange={this.handleOpenFilter} />
        </Col>
        <Col span={24}>
          {showFilter ? this.renderFilter() : ''}
        </Col>
      </Row>
    )
  }
}