import React, { Component } from 'react';
import { Row, Col, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'

import { getDateFormat } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    dateType: state['report/mobile/timeAnalysis'].dateType,
    chartData: state['report/mobile/timeAnalysis'].chartData,
    chartComData: state['report/mobile/timeAnalysis'].chartComData,
    abstractList: state['report/mobile/timeAnalysis'].abstractList,
    tableData: state['report/mobile/timeAnalysis'].tableData,
    Global: state.LOADING,
  }
))

export default class TimeAnalysis extends Component {
  state = {
    comparison: false,
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    columns: [
      {
        title: '时段',
        dataIndex: 'dateTime',
      },
      {
        title: '启动次数',
        dataIndex: 'startupCount',
      },
      {
        title: '启动占比',
        dataIndex: 'startupCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
    ],
    titleExplain: '时段分析统计的是在1天的24小时内，用户使用应用的繁忙时段和低谷时段。 ',
    detailedExplain: '启动次数： 打开应用视为启动,退往后台超过30S或者完全退出视为启动结束。<br/>启动次数占比： 某小时启动次数/整日启动次数。 ',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      dimension: this.state.dimension,
      comparison: this.state.comparison,
    }
    this.getChartData(params)
    this.getAbstractList(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps
    const params = {
      appkey,
      dateType,
      dimension: this.state.dimension,
      comparison: this.state.comparison,
    }
    if (appkey !== this.props.appkey) {
      this.getChartData(params)
      this.getAbstractList(params)
      this.getTableData(params)
    }
  }

  lineOption = (data = this.props.chartData, ComLinedata = this.props.chartComData) => {
    const { comparison } = this.state
    const { dateType } = this.props
    const axisData = []
    const axisComData = []
    const seriesData = []
    const comparisonData = []
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let text = ''
          params.map((item) => {
            text += `${item.axisValue}<br />${item.seriesName}：${item.data}<br />`
          })
          return text
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '5%',
        top: '5%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `使用分析_时段分析_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {
        bottom: 0,
        data: [],
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLine: {
            onZero: true,
          },
        },
        {
          type: 'category',
          show: false,
          boundaryGap: false,
          data: [],
          axisLine: {
            onZero: true,
          },
        },
      ],
      yAxis: {
        type: 'value',
      },
      series: [],
    }
    data && data.map((item) => {
      axisData.push(item.dateTime)
      seriesData.push(item.num)
    })

    if (ComLinedata && ComLinedata.length !== 0) {
      ComLinedata.map((item) => {
        axisComData.push(item.dateTime)
        comparisonData.push(item.num)
      })
    } else {
      for (let i = 0; i < seriesData.length; i++) {
        comparisonData.push(0)
      }
    }
    option.xAxis[0].data = axisData
    if (!comparison) {
      option.series.length = 1
      option.series[0] = {
        name: '启动次数',
        type: 'line',
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      option.legend.data = ['启动次数']
    } else {
      option.series[0] = {
        name: '启动次数',
        type: 'line',
        xAxisIndex: 0,
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      option.series[1] = {
        name: '启动次数对比',
        type: 'line',
        xAxisIndex: 1,
        areaStyle: {
          normal: {
          },
        },
        data: comparisonData,
      }
      option.xAxis[1].data = axisComData
      option.legend.data = ['启动次数', '启动次数对比']
    }
    return option
  }
  getChartData = (params) => {
    const {
      appkey,
      dateType,
      dimension,
      comparison,
    } = params
    this.props.dispatch({
      type: 'report/mobile/timeAnalysis/fetchTimeIntervalChart',
      payload: {
        params: {
          appkey,
          startDateStr: getDateFormat(dateType).startDateStr,
          endDateStr: getDateFormat(dateType).endDateStr,
          dimension: JSON.stringify(dimension),
        },
        comparison,
      },
    })
  }
  getAbstractList = (params) => {
    const {
      appkey,
      dateType,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/timeAnalysis/fetchAbstractList',
      payload: {
        appkey,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        dimension: JSON.stringify(dimension),
      },
    })
  }
  getTableData = (params) => {
    const {
      appkey,
      dateType,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/timeAnalysis/fetchTableData',
      payload: {
        appkey,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        dimension: JSON.stringify(dimension),
      },
    })
  }

  //  是否选中对比时间
  onComparison = (flag) => {
    this.setState({ comparison: flag })
  }

  // 对比时间回调
  onComparisonChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      dimension,
      comparison: true,
    }
    this.setState({ comparison: true })
    this.getChartData(params)
  }

  handleDateChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      dimension,
      comparison: false,
    }
    this.props.dispatch({
      type: 'report/mobile/timeAnalysis/setDateType',
      payload: dateType,
    })
    this.getChartData(params)
    this.getAbstractList(params)
    this.getTableData(params)
    this.setState({ comparison: false })
  }
  setDimension = (val) => {
    const { appkey, selectedGroupData, dateType } = this.props
    const params = {
      appkey,
      dateType,
      dimension: val,
      comparison: false,
    }
    this.setState({ comparison: false, dimension: val })
    this.getChartData(params)
    this.getAbstractList(params)
    this.getTableData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, dateType } = this.props
    let head = {};
    columns.map((item, i) => {
      if (item.children) {
        head[item.dataIndex] = item.title
        item.children.map((citem) => {
          head[citem.dataIndex] = citem.title
        })
      } else {
        head[item.dataIndex] = item.title
      }
    })
    const { tableData } = _.cloneDeep(this.props);
    tableData && tableData.map((item) => {
      item.startupCountRate = `${(Number(item.startupCountRate) * 100).toFixed(2)}%`
    })
    let data = tableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { abstractList, tableData, filterData, Global, chartData } = this.props
    const loadingChart = Global.effects['report/mobile/timeAnalysis/fetchTimeIntervalChart']
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker {...this.props} onChange={this.handleDateChange} onComparison={this.onComparison} onComparisonChange={this.onComparisonChange} />
        <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>
              时段分析
              <Tooltip
                title={<div dangerouslySetInnerHTML={{ __html: this.state.titleExplain }}></div>}>
                <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
              </Tooltip>
            </HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Col span={24}>
                  {
                    chartData && chartData.length !== 0
                      ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption()} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }
                </Col>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/timeAnalysis/fetchAbstractList']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>数据摘要</HeaderTitle>
            </Col>
            <Col span={12}>
              <Col span={12}>
                高峰时段:{abstractList && abstractList.maxPeriod || abstractList.maxPeriod === 0 ? abstractList.maxPeriod : '暂无数据'}
              </Col>
              <Col span={12}>
                启动占比:{abstractList && abstractList.maxPeriodStartUpCountRate || abstractList.maxPeriodStartUpCountRate === 0 ? `${(Number(abstractList.maxPeriodStartUpCountRate) * 100).toFixed(2)}%` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12}>
              <Col span={12}>
                低谷时段:{abstractList && abstractList.minPeriod || abstractList.minPeriod === 0 ? abstractList.minPeriod : '暂无数据'}
              </Col>
              <Col span={12}>
                启动占比:{abstractList && abstractList.minPeriodStartUpCountRate || abstractList.minPeriodStartUpCountRate === 0 ? `${(Number(abstractList.minPeriodStartUpCountRate) * 100).toFixed(2)}%` : '暂无数据'}
              </Col>
            </Col>
          </Row>
        </Spin>
        <Spin size='large' spinning={Global.effects['report/mobile/timeAnalysis/fetchTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>
                明细数据
                <Tooltip title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={this.state.columns} dataSource={tableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
