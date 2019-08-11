import React, { Component } from 'react';
import { Row, Col, Button, Radio, DatePicker, Checkbox, Card, Icon } from 'antd';
import moment from 'moment';
import { getDateFormat } from '../../utils/utils'
import styles from './index.less';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
export default class MasDatePicker extends Component {
  constructor(props) {
    super(props)
    const { startDateStr, endDateStr } = getDateFormat(this.props.dateType)
    const range = moment(endDateStr).diff(moment(startDateStr), 'days')
    this.state = {
      comparison: false,
      dateRange: range,
      dateType: this.props.dateType,
      selectData: '',
    }
  }

  handeleChange = (e) => {
    const value = e.target.value
    const { comparison } = this.state
    const { startDateStr, endDateStr } = getDateFormat(value)
    const dateRange = moment(endDateStr).diff(moment(startDateStr), 'days')
    this.setState({
      dateType: value,
      dateRange,
    })
    this.props.onChange(value)
    if (comparison) {
      this.setState({ comparison: false, comparisonDate: null })
    }
  }

  handleRangerTime = (dates, dateStrings) => {
    let startTime = moment(dateStrings[0])
    let endTime = moment(dateStrings[1])
    const dateRange = endTime.diff(startTime, 'days')
    let { dateType, comparison } = this.state
    dateType = {}
    dateType.startTime = moment(startTime).format(dateFormat)
    dateType.endTime = moment(endTime).format(dateFormat)
    this.setState({ dateRange, dateType, comparison: false })
    this.props.onChange({ startTime: moment(startTime).format(dateFormat), endTime: moment(endTime).format(dateFormat) })
    if (comparison) {
      this.setState({ comparison: false, comparisonDate: null })
    }
  }

  handleComparison = (e) => {
    const comparison = e.target.checked
    this.setState({ comparison })
    if (!comparison) {
      this.props.onComparison(comparison)
      this.setState({ comparisonDate: null })
    }
  }

  handleComparisonTime = (date) => {
    const { dateRange } = this.state

    const startDateStr = moment(date).subtract(dateRange, 'days').format(dateFormat)
    const endDateStr = moment(date).format(dateFormat)
    this.setState({ comparisonDate: startDateStr })
    this.props.onComparisonChange({ startTime: startDateStr, endTime: endDateStr })
  }

  disabledDate = (currentValue) => {
    return currentValue && currentValue > moment().endOf('day') || currentValue <= moment().subtract(366, 'days');
  }

  dateList = (val) => {
    const { dateDemision } = this.props
    return (
      <Radio.Group style={{ marginRight: 10 }} value={val} onChange={(e) => { this.handeleChange(e) }}>
        {!dateDemision || dateDemision.includes('today') ? <Radio.Button value="today">今天</Radio.Button> : null}
        {!dateDemision || dateDemision.includes('yestoday') ? <Radio.Button value="yestoday">昨天</Radio.Button> : null}
        {!dateDemision || dateDemision.includes('7days') ? <Radio.Button value="7days">近7天</Radio.Button> : null}
        {!dateDemision || dateDemision.includes('30days') ? <Radio.Button value="30days">近30天</Radio.Button> : null}
      </Radio.Group>
    )
  }

  render() {
    const { comparison, dateType, comparisonDate } = this.state
    // const { dateType } = this.props
    return (
      <Row>
        <Col span={24}>
          { !this.props.hideList ? this.dateList(dateType) : ''}
          {
            !this.props.hideRange ? <RangePicker
              allowClear={false}
              value={[moment(getDateFormat(dateType).startDateStr), moment(getDateFormat(dateType).endDateStr)]}
              className={styles.MasDateBtn}
              format={dateFormat}
              onChange={this.handleRangerTime}
              disabledDate={this.disabledDate}
            /> : ''
          }
          {
            !this.props.hideComparison ?
              <div style={{ display: 'inline-block', marginLeft: 16 }}>
                <Checkbox className={styles.MasDateBtn} checked={comparison} onChange={this.handleComparison}></Checkbox>
                {
                  !comparison
                    ?
                      <span>与其他时间段对比</span>
                    :
                      <span>
                        {
                          comparisonDate ? `${comparisonDate} 至 ` : ''
                        }
                        <div style={{ display: 'inline-block' }}>
                          <DatePicker
                            allowClear={false}
                            format={dateFormat}
                            onChange={this.handleComparisonTime}
                            disabledDate={this.disabledDate}
                          />
                        </div>
                      </span>
                }</div> : ''
          }
        </Col>
      </Row>
    )
  }
}