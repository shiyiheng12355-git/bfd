import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash'
import chart from '../../../../mock/chart';

export default class LineChart extends Component {
  setRandomNum = () => {
    const arr = []
    for (let i = 0; i < 7; i++) {
      arr.push({ name: Math.floor(Math.random() * 100), value: Math.floor(Math.random() * 100) })
    }
    return arr
  }

  handleClick = (params) => {
    if (params.seriesName === '事件触发用户数') {
      const { history, entityId, isCollect } = this.props;
      const { reportParams, date } = _.cloneDeep(this.props)
      let radioVal
      if (!isCollect) {
        reportParams.groupExpression = JSON.parse(reportParams.groupExpression)

        if (date.point === '') {
          delete reportParams.groupExpression.action.date
          reportParams.groupExpression.action.date = { period: date.period }
        } else {
          delete reportParams.groupExpression.action.date
          reportParams.groupExpression.action.date = { point: date.point }
        }
      }
      reportParams.entityId = entityId
      radioVal = reportParams.groupExpression.dimension
      delete reportParams.groupExpression.dimension
      if (radioVal === 'l_date') {
        reportParams.groupExpression.dimension = { name: radioVal, value: params.dataIndex }
      } else {
        reportParams.groupExpression.dimension = { name: radioVal, value: params.name }
      }

      reportParams.groupExpression.index = reportParams.groupExpression.index.join(',')
      history.push({
        pathname: `/groups/${entityId}/temp`,
        state: {
          TGItype: 'REPORT',
          TGIParams: reportParams,
          personNumber: params.value,
        },
      })
    }
  }

  lineOption = (data) => {
    console.log(this.props)
    const { auths } = this.props
    const colors = ['#F7A700', '#6EC3FF']
    const mapping = {
      newUserNum: '新增用户数',
      userNum: '事件触发用户数',
      actionNum: '事件触发总次数',
    }
    if (!data || data.length === 0) {
      data = [
        {
          userNum: 221,
          actionNum: 331,
          dimension: 'gun',
        },
        {
          userNum: 124,
          actionNum: 126,
          dimension: 'sun',
        },
        {
          userNum: 44,
          actionNum: 236,
          dimension: 'qwe',
        },
        {
          userNum: 311,
          actionNum: 122,
          dimension: 'aqw',
        },
        {
          userNum: 123,
          actionNum: 92,
          dimension: 'qun',
        },
        {
          userNum: 134,
          actionNum: 126,
          dimension: 'tun',
        },
      ]
    }
    let xData = []
    let data1 = []
    let data2 = []
    let downloadFlag = false
    auths && auths.includes('bbgl_zxsjbb_xz') ? downloadFlag = true : downloadFlag = false
    data.map((item, index) => {
      xData.push(item.dimension)
      for (let i in item) {
        if (i === 'actionNum') {
          data1.push(item[i])
        } else if (i === 'userNum') {
          data2.push(item[i])
        }
      }
    })
    const option = {
      color: colors,
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xData,
        // data: ['2018-01-01', '2018-01-02', '2018-01-03', '2018-01-04', '2018-01-05', '2018-01-06', '2018-01-07'],
        axisLine: {
          onZero: true,
        },
      },
      grid: {
        left: '5%',
        top: '5%',
        right: '10%',
        bottom: '0',
        containLabel: true,
      },
      yAxis: {
        type: 'value',
      },
      toolbox: {
        feature: {
          saveAsImage: {
            show: downloadFlag,
            name: this.props.downloadName || '在线事件报表',
          },
          /* magicType: {
            show: true,
            type: ['line', 'bar'],
          }, */
        },

      },
      series: [
        {
          name: '事件触发总次数',
          type: 'line',
          areaStyle: {
            normal: {
              color: colors[0],
              opacity: 0.2,
            },
          },
          data: data1,
        },
        {
          name: '事件触发用户数',
          type: 'line',
          areaStyle: {
            normal: {
              color: colors[1],
              opacity: 0.2,
            },
          },
          data: data2,
        },
      ],
    }
    return option
  }
  render() {
    const { chartData } = this.props
    return (
      <div>
        {
          !chartData || chartData.length === 0 ? <div style={{ textAlign: 'center', height: '300px', lineHeight: '300px' }}>暂无数据</div> : <ReactEcharts
            style={{ height: 400 }}
            notMerge
            option={this.lineOption(chartData)}
            onEvents={
              { click: this.handleClick }
            }
          />
        }
      </div>
    )
  }
}