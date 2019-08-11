import React, { Component } from 'react';
import { Radio } from 'antd'
import moment from 'moment';

export default class MasGranularity extends Component {
  handleCurrentChange = (e) => {
    this.props.onChange(e.target.value)
  }

  renderGranularity = (dateType = this.props.dateType, currentValue = this.props.currentValue) => {
    let hoursFlag = true
    let dayFlag = true
    let weekFlag = true
    let monthFlag = true
    if (typeof dateType === 'object') {
      const { startTime, endTime } = dateType
      const range = moment(endTime).diff(moment(startTime), 'days')
      if (range === 0) {
        hoursFlag = false
        dayFlag = false
      }
      if (range > 0 && range <= 30) {
        dayFlag = false
      }
      if (range >= 6) {
        weekFlag = false
      }
      if (range >= 30) {
        monthFlag = false
      }
    } else if (dateType === 'today' || dateType === 'yestoday') {
      hoursFlag = false
      dayFlag = false
    } else if (dateType === '7days' || dateType === '30days') {
      dayFlag = false
      weekFlag = false
    }
    return (
      <Radio.Group value={currentValue} onChange={(e) => { this.handleCurrentChange(e) }}>
        <Radio.Button disabled={hoursFlag} value="hour">小时</Radio.Button>
        <Radio.Button disabled={dayFlag} value="day">天</Radio.Button>
        <Radio.Button disabled={weekFlag} value="week">周</Radio.Button>
        <Radio.Button disabled={monthFlag} value="month">月</Radio.Button>
      </Radio.Group>
    )
  }

  render() {
    return (
      <div>
        {this.renderGranularity()}
      </div>
    )
  }
}