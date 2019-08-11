import React, { Component } from 'react';
import { Row, Col, Checkbox, Select, Form, DatePicker, Button, Radio } from 'antd';
import styles from './index.less';
import moment from 'moment';


const { Option } = Select;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;

class DateSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      radioValue: 1,
      selectPointDate: '1',
      periodCompare: '0',

    }
  }

  handleRadioChange = (e) => {
    const { value } = e.target;
    let { selectPointDate, periodCompare } = this.state;
    if (value === 1) {
      periodCompare = '0';
    }
    if (value === 2) {
      selectPointDate = '0';
    }
    this.setState({
      periodCompare,
      selectPointDate,
      radioValue: value,
    })
  }

  handlePeriodCompareChange = (periodCompare) => {
    this.setState({
      periodCompare,
    })
  }

  handlePointDateChange = (key) => {
    let startDate = moment().format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');
    switch (key) {
      case '2':
        startDate = moment().subtract(1, 'days').format('YYYY-MM-DD'); // 昨天
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case '7':
        startDate = moment().subtract(7, 'days').format('YYYY-MM-DD'); // 减7天
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case '30':
        startDate = moment().subtract(30, 'days').format('YYYY-MM-DD'); // 减30天
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case '60':
        startDate = moment().subtract(60, 'days').format('YYYY-MM-DD'); // 减60天
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case '90':
        startDate = moment().subtract(90, 'days').format('YYYY-MM-DD'); // 减90天
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case '180':
        startDate = moment().subtract(180, 'days').format('YYYY-MM-DD'); // 减180天
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      case '365':
        startDate = moment().subtract(365, 'days').format('YYYY-MM-DD'); // 减365天
        endDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
        break;
      default:
        break;
    }
    this.setState({ selectPointDate: key });
    this.props.handleDateChange(startDate, endDate);

    // this.setState({
    //   startDate,
    //   endDate,
    //   selectPointDate: key,
    // }, () => {
    //   const { AppKeys } = this.props;
    //   const { appkey } = this.state;
    //   const defaultAppkey = AppKeys.length ? AppKeys[0].appkey : '';
    //   this.props.handleDateChange(startDate, endDate, appkey || defaultAppkey);
    // })
  }

  handlePeriodDateChange = (date, formatDate) => {
    const { periodCompare } = this.state;
    let [startDate, endDate] = ['', ''];
    if (periodCompare === '1') {
      startDate = formatDate[0];
      endDate = formatDate[1];
    } else if (periodCompare === '2') {
      startDate = formatDate;
      endDate = formatDate;
    } else if (periodCompare === '3') {
      endDate = formatDate;
    } else {
      startDate = formatDate;
    }
    this.props.handleDateChange(startDate, endDate);

    // this.setState({
    //   startDate,
    //   endDate,
    // }, () => {
    //   () => {
    //     const { AppKeys } = this.props;
    //     const { appkey } = this.state;
    //     const defaultAppkey = AppKeys.length ? AppKeys[0].appkey : '';
    //     this.props.handleDateChange(startDate, endDate, appkey || defaultAppkey);
    //   }
    // })
  }

  handleClientChange = (key) => {
    // this.props.handleDateChange(key);

    // const { startDate, endDate } = this.props;
    // this.setState({
    //   appkey: key,
    // }, () => {
    //   this.props.handleDateChange(startDate, endDate, key);
    // })
    this.props.handleClientChange(key)
  }

  render() {
    const periodCompares = [
      { name: '介于', key: '1' },
      { name: '发生于', key: '2' },
      { name: '之前', key: '3' },
      { name: '之后', key: '4' },
    ];

    const pointDates = [
      { name: '今天', key: '1' },
      { name: '昨天', key: '2' },
      { name: '近7天', key: '7' },
      { name: '近30天', key: '30' },
      { name: '近60天', key: '60' },
      { name: '近90天', key: '90' },
      { name: '近180天', key: '180' },
      { name: '近365天', key: '365' },
    ];

    const { AppKeys, appkey } = this.props;
    const defaultAppkey = AppKeys.length ? AppKeys[0].appkey : '';

    console.log('AppKeys-------------------', AppKeys);

    return (
      <div className={styles.date}>
        <RadioGroup
          onChange={this.handleRadioChange}
          value={this.state.radioValue}
        >
          <Radio value={1}>选择查看的时间段:</Radio>
          <Select
            style={{ width: 120 }}
            value={this.state.selectPointDate}
            disabled={this.state.radioValue === 2}
            onChange={this.handlePointDateChange}
          >
            <Option key='point_-1' value='0'>请选择</Option>
            {
              pointDates.map((item, index) => {
                return <Option key={`point_${index}`} value={item.key}>{item.name}</Option>
              })
            }
          </Select>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Radio value={2}>自定义时间段:</Radio>
          <Select
            style={{ width: 135 }}
            value={this.state.periodCompare}
            disabled={this.state.radioValue === 1}
            onChange={this.handlePeriodCompareChange}
          >
            <Option key='period_-1' value='0'>请选择</Option>
            {
              periodCompares.map((item, index) => {
                return <Option key={`period_${index}`} value={item.key}>{item.name}</Option>
              })
            }
          </Select>
          &nbsp;&nbsp;&nbsp;
          {
            this.state.periodCompare !== '0' && this.state.periodCompare !== '1' &&
            <DatePicker
              placeholder="Select Time"
              onChange={this.handlePeriodDateChange}
            />
          }
          {
            this.state.periodCompare === '1' &&
            <RangePicker
              style={{ width: 230 }}
              placeholder={['开始时间', '结束时间']}
              onChange={this.handlePeriodDateChange}
            />
          }
        </RadioGroup>
        <span style={{ marginLeft: 20 }}> &nbsp;客户端:</span> &nbsp;&nbsp;&nbsp;
        <Select
            style={{ width: 150 }}
            value={appkey || defaultAppkey}
            onChange={this.handleClientChange}
          >
            {
              AppKeys.map((item, index) => {
                return (
                  <Option
                    key={`client_${index}`}
                    value={item.appkey}
                  >
                    {item.appkeyName}
                  </Option>
                );
              })
            }
          </Select>
        {/* <div style={{ marginTop: 15 }}>
          <span style={{ marginLeft: 20 }}> &nbsp;选择查看的客户端:</span> &nbsp;&nbsp;&nbsp;
        <Select
            style={{ width: 150 }}
            value={appkey || defaultAppkey}
            onChange={this.handleClientChange}
          >
            {
              AppKeys.map((item, index) => {
                return (
                  <Option
                    key={`client_${index}`}
                    value={item.appkey}
                  >
                    {item.appkeyName}
                  </Option>
                );
              })
            }
          </Select>
        </div> */}

      </div>
    );
  }
}


export default DateSelect;
