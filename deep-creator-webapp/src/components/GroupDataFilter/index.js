import React from 'react'
import moment from 'moment'
import { DatePicker, Select, Button, Radio } from 'antd'
import styles from './style.less'

const { RangePicker } = DatePicker
const Option = Select.Option

const [FD, FM, FY] = ['YYYY-MM-DD', 'YYYY-MM', 'YYYY']
const format = ({ from, to, point }) => {
  return {
    point,
    period: {
      'start-date': from,
      'end-date': to,
    },
    range: [from, to],
  }
}
const format2 = ({ from, to, point }) => {
  if (point == 'to') {
    to = from;
  } else if (point == 'before') {
    to = from;
    from = moment(to).subtract(365, 'day').format(FD);
  }

  return {
    point: '',
    period: {
      'start-date': from,
      'end-date': to,
    },
    range: [from, to],
  }
}
export default class extends React.Component {
  static defaultProps = {
    selected: 'today',
    reset: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      group: {
        normal: this.props.selected,
        ago: undefined,
        range: undefined,
        sel: undefined,
      },
    }
  }
  componentWillReceiveProps(nextprops) {
    if (nextprops.reset !== this.props.reset) {
      this.handleChange('normal')('today')
    }
  }
  handleChange = (group) => {
    return (value, formatted) => {
      let range = (group === 'normal' || group === 'ago') ? this.range(group, value.target ? value.target.value : value, formatted) : (group === 'range' ? format({ from: formatted[0], to: formatted[1], point: '' }) : format2({ from: formatted, to: '', point: this.state.group.sel || 'to' }))
      this.props.onChange && this.props.onChange(range)
      this.updateValue(group, value.target ? value.target.value : value, formatted)
    }
  }

  updateValue(group, value, formatted) {
    if (group === 'normal') {
      this.setState({
        group: {
          normal: value, ago: undefined, range: undefined, sel: undefined,
        },
      })
    } else if (group === 'ago') {
      this.setState({
        group: {
          normal: undefined, ago: value, range: undefined, sel: undefined,
        },
      })
    } else {
      this.setState({
        group: {
          ...this.state.group,
          normal: undefined,
          ago: undefined,
          range: value,
        },
      })
    }
  }

  range = (group, value, formatted) => {
    const today = moment().format(FD)
    let matchAgo = value.match(/\(\s*(\d+)\s*\)/)
    if (matchAgo) {
      value = value.substr(0, matchAgo.index).trim()
    }
    switch (value) {
      case 'yesterday': {
        let from = moment().subtract(1, 'day').format(FD)
        return format({ from, to: from, point: value })
      }
      case 'this-week': {
        let from = moment().isoWeekday(1).format(FD)
        return format({ from, to: today })
      }
      case 'this-month': {
        let from = `${moment().format(FM)}-01`
        return format({ from, to: today })
      }
      case 'this-season': {
        let tail = ['', '-01-01', '-04-01', '-07-01', '-10-01']
        let from = moment().format(FY) + tail[moment().quarter()]
        return format({ from, to: today })
      }
      case 'this-year': {
        let from = `${moment().format(FY)}-01-01`
        return format({ from, to: today })
      }
      case 'last-year': {
        let lastYear = moment().format(FY) - 1
        let from = `${lastYear}-01-01`
        let to = `${lastYear}-12-31`
        return format({ from, to })
      }
      case 'near': {
        let days = Number(matchAgo[1]) || 0
        let from = moment().subtract(days, 'day').format(FD)
        return format({ from, to: moment().subtract(1, 'day').format(FD), point: `${value}_${days}` })
      }
      case 'today':
      default: {
        let from = today
        return format({ from, to: from, point: value == 'today' ? 'today' : '' })
      }
    }
  }

  render() {
    return (
      <div className={styles['group-date-filter']}>
        <Radio.Group
          className={styles['by-range-spread']}
          value={this.state.group.normal}
          onChange={this.handleChange('normal')}
          style={{ marginTop: '0px', marginRight: '6px' }}
        >
          <Radio.Button value="today">今天</Radio.Button>
          <Radio.Button value="yesterday">昨天</Radio.Button>
        </Radio.Group>
        <Select
          placeholder="按最近"
          className={
            this.state.group.ago
              ? `${styles.selected} ${styles['by-days-ago']}` : styles['by-days-ago']
          }
          value={this.state.group.ago}
          onChange={this.handleChange('ago')}
        >
          <Option value="near(7)">近7天</Option>
          <Option value="near(30)">近30天</Option>
          <Option value="near(60)">近60天</Option>
          <Option value="near(90)">近90天</Option>
          <Option value="near(180)">近180天</Option>
          <Option value="near(365)">近365天</Option>
        </Select>

        <span
          className={
            (this.state.group.range || this.state.group.sel) ?
              `${styles.selected} ${styles['by-date-range']}` : styles['by-date-range']
          }>
          <Select
            placeholder="自定义"
            style={{ width: '100px', marginRight: '10px' }}
            value={this.state.group.sel || 'to'}
            onChange={(value) => {
              this.setState({
                group: {
                  sel: value,
                },
              })
            }}
          >
            <Option value="betweenness">介于</Option>
            <Option value="to">发生于</Option>
            <Option value="before">之前</Option>
            <Option value="after">之后</Option>
          </Select>
          {
            this.state.group.sel === 'betweenness' ? <RangePicker
              allowClear={false}
              style={{ width: '290px', float: 'right' }}
              format={FD}
              value={this.state.group.range}
              placeholder={['按自定义日期', '结束日期']}
              onChange={this.handleChange('range')}
            /> : <DatePicker
                allowClear={false}
                style={{ width: '150px', float: 'right', verticalAlign: 'top' }}
                format={FD}
                value={this.state.group.range}
                placeholder="按自定义日期"
                onChange={this.handleChange('range1')}
              />
          }
        </span>
      </div>
    )
  }
}
