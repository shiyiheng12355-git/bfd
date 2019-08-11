import React, { Component, PropTypes } from 'react';
import { Form, Select, Modal } from 'antd';
import ReactEcharts from 'echarts-for-react';
import Moment from 'moment';
import _ from 'lodash';
import { extendMoment } from 'moment-range';
import { TIME_FORMAT } from '../../../utils/utils';

const SHORT_DATE = 'YYYY-MM-DD';
const moment = extendMoment(Moment)

const FormItem = Form.Item;
const { Option } = Select;

const columns = [
  { key: 'show_pv', name: '曝光' },
  { key: 'click_pv', name: '点击' },
  { key: 'order_num', name: '转化' },
  { key: 'real', name: '实时率' },
  { key: 'coverage', name: '覆盖率' },
];

class TrendModel extends Component {
  state = {
    column: 'show_pv',
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      if (nextProps.rec) this.handleFetchData(nextProps.rec)
    }
  }

  handleFetchData = ({ policyId }) => {
    const { startTime, endTime } = this.props;
    let { column } = this.state;
    if (column === 'real' || column === 'coverage') {
      column = 'item_total,item_day,item_new';
    }
    this.props.dispatch({
      type: 'marketing/recommendation/fetchTrend',
      payload: { policyId, startTime, endTime, columns: column },
    })
  }

  handleChange = (key) => {
    this.setState({ column: key }, () => {
      this.handleFetchData({ ...this.props.rec });
    })
  }

  resetState = () => {
    this.setState({ column: 'show_pv' })
  }

  handleOk = () => {
    this.props.onOk();
    this.resetState();
  }

  handleCancel = () => {
    this.props.onCancel();
    this.resetState();
  }

  render() {
    const { currentTrend, startTime, endTime } = this.props;
    const { column } = this.state;
    let curData = [];
    if (['show_pv', 'click_pv', 'order_num'].includes(column)) {
      curData = currentTrend[column];
    } else if (column === 'real') {
      curData = currentTrend.realTime;
    } else if (column === 'coverage') {
      curData = currentTrend.coverage;
    }
    curData = curData || [];
    const record = (currentTrend.record || []).map((i) => {
      return {
        ...i,
        date: moment(i.updateTime).format(SHORT_DATE),
      }
    })
    let columnData = []; // 指标数据
    let recordData = [] // 数据变更记录数据

    const columGroup = _.groupBy(curData, 'date'); // 用日期分组
    const recordGroup = _.groupBy(record, 'date'); // 用日期分组

    const days = Array.from(moment.range(moment(startTime),
      moment(endTime)).by('days')).map(day => day.format(SHORT_DATE)); // 开始到结束的所有日期
    days.forEach((shortDate) => {
      if (columGroup[shortDate]) {
        const count = columGroup[shortDate][0].count;
        columnData.push(count);
      } else {
        columnData.push(null);
      }
      if (recordGroup[shortDate]) {
        recordData.push(0)
      } else {
        recordData.push(null)
      }
    })
    const columnName = columns.find(c => c.key === column).name;

    return (
      <Modal {...this.props}
        maskClosable={false}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label='数据指标'
            labelCol={{ sm: { span: 4 } }}
            wrapperCol={{ sm: { span: 16 } }}
          >
            <Select onChange={this.handleChange} value={column}>
              {
                columns.map((col) => {
                  return (<Option value={col.key}
                    key={col.key}>{col.name}</Option>)
                })
              }
            </Select>
          </FormItem>
        </Form>
        <ReactEcharts
          // echarts={echarts}
          notMerge
          option={{
            tooltip: {
              trigger: 'axis',
              formatter: (param) => {
                let tooltip = '';
                param.forEach((p) => {
                  const { value } = p;
                  let str = '';
                  if (p.name && value !== undefined) {
                    str = `${p.name}<br/>${value}<br/>`;
                    if (['real', 'coverage'].includes(column)) {
                      str = `${p.name}<br/>${value}%<br/>`;
                    }
                  }
                  if (p.seriesName === 'RECORD' && value === 0) {
                    const info = _.last(recordGroup[p.name]);
                    str = `修改人:${info.updateUser}<br/>修改时间:${moment(info.updateTime).format(TIME_FORMAT)}<br/>`;
                  }
                  tooltip += str;
                })
                return tooltip;
              },
            },
            title: {
              text: `${columnName}指标趋势图`,
            },
            toolbox: {
              feature: {
                dataZoom: {
                  yAxisIndex: 'none',
                },
                restore: {},
                saveAsImage: {},
              },
              right: 20,
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: days,
            },
            yAxis: {
              type: 'value',
              boundaryGap: [0, '100%'],
            },
            // dataZoom: [{
            //   type: 'inside',
            //   start: 0,
            //   end: 100,
            // }, {
            //   start: 0,
            //   end: 10,
            //   handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            //   handleSize: '80%',
            //   handleStyle: {
            //     color: '#fff',
            //     shadowBlur: 3,
            //     shadowColor: `${theme['primary-color']}`,
            //     shadowOffsetX: 2,
            //     shadowOffsetY: 2,
            //   },
            // }],
            series: [
              {
                type: 'line',
                smooth: true,
                areaStyle: {
                  // normal: {
                  //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  //     offset: 0,
                  //     color: `${theme['primary-color']}`,
                  //   }, {
                  //     offset: 1,
                  //     color: `${theme['primary-color']}`,
                  //   }]),
                  // },
                },
                data: columnData.map((f) => {
                  if (['real', 'coverage'].includes(column)) {
                    return Number((parseFloat(f) * 100).toFixed(2));
                  } else {
                    return parseInt(f, 10);
                  }
                }),
              },
              {
                type: 'line',
                data: recordData,
                name: 'RECORD',
              },
            ],
          }}
          lazyUpdate
          style={{ height: '300px', width: '100%' }}
          theme="theme_name"
        />

      </Modal>)
  }
}

TrendModel.propTypes = {
};

export default TrendModel;
