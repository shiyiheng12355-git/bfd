import React, { Component } from 'react';
import { Row, Col, Radio, Spin, Table, Tabs, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat, formatCurrentValue, transTime } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

const TabPane = Tabs.TabPane;

@connect(state => (
  {
    dateType: state['report/mobile/userLoyal'].dateType,
    loyalData: state['report/mobile/userLoyal'],
    Global: state.LOADING,
  }
))
export default class UserLayout extends Component {
  state = {
    tabsStatus: 'freq',
    comparison: false,
    type: {
      freq: 'startupCount',
      time: 'avgTimePerStartup',
      pages: 'startupCount',
    },
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    freqColumns: [
      {
        title: '日期',
        dataIndex: 'dateTime',
      },
      {
        title: '启动次数',
        dataIndex: 'startupCount',
      },
      {
        title: '启动人数',
        dataIndex: 'startupUser',
      },
      {
        title: '人均启动次数',
        dataIndex: 'startupPerUser',
      },
    ],
    timeColumns: [
      {
        title: '日期',
        dataIndex: 'dateTime',
      },
      {
        title: '平均单次使用时长',
        dataIndex: 'avgTimePerStartup',
        render: item => (
          transTime(item)
        ),
      },
      {
        title: '每日人均使用时长',
        dataIndex: 'avgTimePerUser',
        render: item => (
          transTime(item)
        ),
      },
    ],
    pagesColumns: [
      {
        title: '访问页数',
        dataIndex: 'fieldName',
      },
      {
        title: '启动次数',
        dataIndex: 'pageSessionCount',
      },
      {
        title: '启动次数占比',
        dataIndex: 'pageSessionCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
      {
        title: '启动人数',
        dataIndex: 'pageUserCount',
      },
      {
        title: '启动人数占比',
        dataIndex: 'pageUserCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
    ],
    intColumns: [
      {
        title: '使用间隔',
        dataIndex: 'date',
      },
      {
        title: '启动次数',
        dataIndex: 'intervalStartupCount',
      },
      {
        title: '启动次数占比',
        dataIndex: 'intervalStartupCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
    ],
    titleExplain: '时段内，所有人使用应用的频率，启动次数越高，说明应用内容越吸引用户。 ',
    chartExplain: '启动次数： 打开应用视为启动,退往后台超过30S或者完全退出视为启动结束。<br/>启动人数： 独立UV。<br/>人均启动次数： 启动次数/启动人数。 ',
    detailedExplain: '启动次数： 打开应用视为启动,退往后台超过30S或者完全退出视为启动结束。<br/>启动人数： 独立UV。<br/>人均启动次数： 启动次数/启动人数。 ',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      dimension: this.state.dimension,
      type: this.state.type.freq,
      tabType: 'freq',
    }
    this.getBarData(params)
    this.getLineData(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps
    const params = {
      appkey,
      dateType,
      dimension: this.state.dimension,
      type: this.state.type[this.state.tabsStatus],
      tabType: this.state.tabsStatus,
    }
    if (appkey !== this.props.appkey) {
      this.getBarData(params)
      this.getLineData(params)
      this.getTableData(params)
    }
  }

  /**
   *
   * @param {appkey} appkey
   * @param {时间} dateType
   * @param {用户群表达式} expression
   * @param {筛选条件} dimension
   * @param {查看条件} type
   * @param {标签type} tabType
 */
  getBarData = (params) => {
    const { appkey, dateType, type, expression, dimension, tabType, comparison } = params
    switch (tabType) {
      case 'freq':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchFreqBarData',
          payload: {
            params: {
              appkey,
              dimension: JSON.stringify(dimension),
              startDateStr: getDateFormat(dateType).startDateStr,
              endDateStr: getDateFormat(dateType).endDateStr,
            },
            comparison,
          },
        })
        break;
      case 'time':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchTimeBarData',
          payload: {
            params: {
              appkey,
              dimension: JSON.stringify(dimension),
              startDateStr: getDateFormat(dateType).startDateStr,
              endDateStr: getDateFormat(dateType).endDateStr,
            },
            comparison,
          },
        })
        break;
      case 'pages':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchPagesBarData',
          payload: {
            params: {
              appkey,
              index: type,
              dimension: JSON.stringify(dimension),
              startDateStr: getDateFormat(dateType).startDateStr,
              endDateStr: getDateFormat(dateType).endDateStr,
            },
            comparison,
          },
        })
        break;
      case 'interval':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchIntBarData',
          payload: {
            appkey,
            dimension: JSON.stringify(dimension),
            startDateStr: getDateFormat(dateType).startDateStr,
            endDateStr: getDateFormat(dateType).endDateStr,
          },
        })
        break;
      default:
        break;
    }
  }

  getLineData = (params) => {
    const { appkey, dateType, type, expression, dimension, tabType, comparison } = params
    switch (tabType) {
      case 'freq':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchFreqTrendData',
          payload: {
            params: {
              appkey,
              index: type,
              dimension: JSON.stringify(dimension),
              startDateStr: getDateFormat(dateType).startDateStr,
              endDateStr: getDateFormat(dateType).endDateStr,
              granularity: formatCurrentValue(dateType),
            },
            comparison,
          },
        })
        break;
      case 'time':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchTimeTrendData',
          payload: {
            params: {
              appkey,
              index: type,
              dimension: JSON.stringify(dimension),
              startDateStr: getDateFormat(dateType).startDateStr,
              endDateStr: getDateFormat(dateType).endDateStr,
            },
            comparison,
          },
        })
        break;
      default:
        break;
    }
  }

  getTableData = (params) => {
    const { appkey, dateType, type, expression, dimension, tabType } = params
    switch (tabType) {
      case 'freq':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchFreqTableData',
          payload: {
            appkey,
            dimension: JSON.stringify(dimension),
            startDateStr: getDateFormat(dateType).startDateStr,
            endDateStr: getDateFormat(dateType).endDateStr,
            granularity: formatCurrentValue(dateType),
          },
        })
        break;
      case 'time':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchTimeTableData',
          payload: {
            appkey,
            dimension: JSON.stringify(dimension),
            startDateStr: getDateFormat(dateType).startDateStr,
            endDateStr: getDateFormat(dateType).endDateStr,
          },
        })
        break;
      case 'pages':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchPagesTableData',
          payload: {
            appkey,
            dimension: JSON.stringify(dimension),
            startDateStr: getDateFormat(dateType).startDateStr,
            endDateStr: getDateFormat(dateType).endDateStr,
          },
        })
        break;
      case 'interval':
        this.props.dispatch({
          type: 'report/mobile/userLoyal/fetchIntTableData',
          payload: {
            appkey,
            dimension: JSON.stringify(dimension),
            startDateStr: getDateFormat(dateType).startDateStr,
            endDateStr: getDateFormat(dateType).endDateStr,
          },
        })
        break;
      default:
        break;
    }
  }

  //  渲染柱状图和折线图
  barOption = (data, ComBardata, typeName) => {
    const { comparison, type } = this.state
    const { mappingType, dateType } = this.props
    const axisData = []
    const seriesData = []
    const comparisonData = []
    let name = ''
    let downname = ''
    let downtype = ''
    if (typeName === 'pages') {
      name = mappingType[type[typeName]]
      downname = '访问页数分布'
      downtype = mappingType[type[typeName]]
    } else if (typeName === 'time') {
      name = '启动次数'
      downname = '单次使用时长分布'
      downtype = ''
    } else if (typeName === 'freq') {
      name = '启动人数'
      downname = '启动次数分布'
      downtype = ''
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '5%',
        top: '5%',
        containLabel: true,
      },
      legend: {
        bottom: 0,
        data: [],
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `使用分析_${downname}_${downtype}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: [],
      },
      series: [],
    }
    data && data.map((item) => {
      axisData.push(item.fieldName)
      seriesData.push(item.num)
    })
    if (ComBardata && ComBardata.length !== 0) {
      ComBardata.map((item) => {
        comparisonData.push(item.num)
      })
    } else {
      for (let i = 0; i < seriesData.length; i++) {
        comparisonData.push(0)
      }
    }
    option.yAxis.data = axisData
    if (!comparison) {
      option.series.length = 1
      option.series[0] = {
        name,
        type: 'bar',
        data: seriesData,
      }
      option.legend.data = [name]
    } else {
      option.series[0] = {
        name,
        type: 'bar',
        data: seriesData,
      }
      option.series[1] = {
        name: `${name}对比`,
        type: 'bar',
        data: comparisonData,
      }
      option.legend.data = [name, `${name}对比`]
    }
    return option
  }

  lineOption = (data, ComLinedata, typeName) => {
    const { comparison, type } = this.state
    const { mappingType, dateType } = this.props
    const axisData = []
    const axisComData = []
    const seriesData = []
    const comparisonData = []
    let downname = ''

    if (typeName === 'freq') {
      downname = '启动次数趋势'
    } else if (typeName === 'time') {
      downname = '使用时长趋势'
    }
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
            name: `使用分析_${downname}_${mappingType[type[typeName]]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
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
        name: mappingType[type[typeName]],
        type: 'line',
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      option.legend.data = [mappingType[type[typeName]]]
    } else {
      option.series[0] = {
        name: mappingType[type[typeName]],
        type: 'line',
        xAxisIndex: 0,
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      option.series[1] = {
        name: mappingType[type[typeName]],
        type: 'line',
        xAxisIndex: 1,
        areaStyle: {
          normal: {
          },
        },
        data: comparisonData,
      }
      option.xAxis[1].data = axisComData
      option.legend.data = [mappingType[type[typeName]], `${mappingType[type[typeName]]}对比`]
    }
    return option
  }

  //  切换标签页
  changeActiveTab = (tabsStatus) => {
    this.setState({ tabsStatus, comparison: false })

    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      dimension: this.state.dimension,
      type: this.state.type[tabsStatus],
      tabType: tabsStatus,
    }
    this.getBarData(params)
    if (tabsStatus !== 'pages' && tabsStatus !== 'interval') this.getLineData(params)
    this.getTableData(params)
  }

  //  切换类型
  handleTypeChange = (e, indexType) => {
    const { type, tabsStatus, comparison } = this.state
    type[indexType] = e.target.value
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ type })
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      dimension: this.state.dimension,
      type: e.target.value,
      tabType: tabsStatus,
    }
    switch (tabsStatus) {
      case 'freq':
        this.getLineData(params)
        break;
      case 'time':
        this.getLineData(params)
        break;
      case 'pages':
        this.getBarData(params)
        break;
      default:
        break;
    }
  }

  //  切换筛选条件
  setDimension = (val) => {
    const { comparison } = this.state
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ dimension: val })
    const { tabsStatus } = this.state
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      dimension: val,
      type: this.state.type[tabsStatus],
      tabType: tabsStatus,
    }
    this.getBarData(params)
    if (tabsStatus !== 'pages' && tabsStatus !== 'interval') this.getLineData(params)
    this.getTableData(params)
  }

  //  切换时间
  handleDateChange = (dateType) => {
    const { comparison } = this.state
    if (comparison) {
      this.setState({ comparison: false })
    }

    this.props.dispatch({
      type: 'report/mobile/userLoyal/setDateType',
      payload: dateType,
    })

    const { tabsStatus } = this.state
    const params = {
      appkey: this.props.appkey,
      dateType,
      dimension: this.state.dimension,
      type: this.state.type[tabsStatus],
      tabType: tabsStatus,
    }

    this.getBarData(params)
    if (tabsStatus !== 'pages' && tabsStatus !== 'interval') this.getLineData(params)
    this.getTableData(params)
  }

  //  是否选中对比时间
  onComparison = (flag) => {
    this.setState({ comparison: flag })
  }

  // 对比时间回调
  onComparisonChange = (dateType) => {
    const { tabsStatus } = this.state
    const params = {
      appkey: this.props.appkey,
      dateType,
      dimension: this.state.dimension,
      type: this.state.type[tabsStatus],
      tabType: tabsStatus,
      comparison: true,
    }
    this.setState({ comparison: true })
    this.getBarData(params)
    if (tabsStatus !== 'pages' && tabsStatus !== 'interval') this.getLineData(params)
  }

  // 下载参数处理
  downLoad = (type) => {
    let columns = []
    const { title, dateType } = this.props
    let head = {};
    let tableData
    switch (type) {
      case 'freq':
        columns = this.state.freqColumns
        tableData = _.cloneDeep(this.props.loyalData.freqTableData)
        break;
      case 'time':
        columns = this.state.timeColumns
        tableData = _.cloneDeep(this.props.loyalData.timeTableData)
        tableData && tableData.map((item) => {
          item.avgTimePerStartup = transTime(item.avgTimePerStartup)
          item.avgTimePerUser = transTime(item.avgTimePerUser)
        })
        break;
      case 'pages':
        columns = this.state.pagesColumns
        tableData = _.cloneDeep(this.props.loyalData.pagesTableData)
        tableData && tableData.map((item) => {
          item.pageSessionCountRate = `${(Number(item.pageSessionCountRate) * 100).toFixed(2)}%`
          item.pageUserCountRate = `${(Number(item.pageUserCountRate) * 100).toFixed(2)}%`
        })
      break;
      default:
        break;
    }
    columns.map((item, i) => {
      head[item.dataIndex] = item.title
    })
    let data = tableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  //  渲染标签页
  renderFreq = () => {
    const { loyalData, Global } = this.props
    const { freqBarData, freqComBardata, freqTrendData, freqComTrendData, freqTableData } = loyalData
    const { type, freqColumns } = this.state
    const loadingChart = Global.effects['report/mobile/userLoyal/fetchFreqBarData']
    const loadingTrendChart = Global.effects['report/mobile/userLoyal/fetchFreqTrendData']
    let { head, data, fileName } = this.downLoad('freq')
    return (
      <div>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>启动次数分布 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.titleExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Col span={24}>
                  {
                    freqBarData && freqBarData.length
                      ? <ReactEcharts style={{ height: 400 }} notMerge option={this.barOption(freqBarData, freqComBardata, 'freq')} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }
                </Col>
          }
        </Row>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>启动次数趋势 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.chartExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingTrendChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={24}>
                    <Radio.Group value={type.freq} onChange={(e) => { this.handleTypeChange(e, 'freq') }}>
                      <Radio.Button value="startupCount">启动次数</Radio.Button>
                      <Radio.Button value="startupUser">启动人数</Radio.Button>
                      <Radio.Button value="startupPerUser">人均启动次数</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                  {
                    freqTrendData && freqTrendData.length !== 0
                      ? <ReactEcharts style={{ height: 400 }} notMerge option={this.lineOption(freqTrendData, freqComTrendData, 'freq')} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }

                  </Col>
                </Row>
          }

        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userLoyal/fetchFreqTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>明细数据
                <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={freqColumns} dataSource={freqTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }

  renderUserTime = () => {
    const { loyalData, Global } = this.props
    const { timeBarData, timeComBarData, timeTrendData, timeComTrendData, timeTableData } = loyalData
    const { type, timeColumns } = this.state
    const loadingChart = Global.effects['report/mobile/userLoyal/fetchTimeBarData']
    const loadingTrendChart = Global.effects['report/mobile/userLoyal/fetchTimeTrendData']
    let { head, data, fileName } = this.downLoad('time')
    return (
      <div>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>单次使用时长分布</HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Col span={24}>
                {
                  timeBarData && timeBarData.length !== 0
                    ? <ReactEcharts style={{ height: 400 }} notMerge option={this.barOption(timeBarData, timeComBarData, 'time')} />
                    : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                }
                </Col>
          }
        </Row>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>使用时长趋势</HeaderTitle>
          </Col>
          {
            loadingTrendChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={24}>
                    <Radio.Group value={type.time} onChange={(e) => { this.handleTypeChange(e, 'time') }}>
                      <Radio.Button value="avgTimePerStartup">平均单次使用时长</Radio.Button>
                      <Radio.Button value="avgTimePerUser">每日人均使用时长</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                  {
                    timeTrendData && timeTrendData.length !== 0
                      ? <ReactEcharts style={{ height: 400 }} notMerge option={this.lineOption(timeTrendData, timeComTrendData, 'time')} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }
                  </Col>
                </Row>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userLoyal/fetchTimeTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>
                明细数据
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={timeColumns} dataSource={timeTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }

  renderPages = () => {
    const { loyalData, Global } = this.props
    const { pagesBarData, pagesComBarData, pagesTableData } = loyalData
    const { type, pagesColumns } = this.state
    const loadingChart = Global.effects['report/mobile/userLoyal/fetchPagesBarData']
    let { head, data, fileName } = this.downLoad('pages')
    return (
      <div>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>访问页数分布</HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={24}>
                    <Radio.Group value={type.pages} onChange={(e) => { this.handleTypeChange(e, 'pages') }}>
                      <Radio.Button value="startupCount">启动次数</Radio.Button>
                      <Radio.Button value="startupUser">启动人数</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    {
                        pagesBarData && pagesBarData.length !== 0
                          ? <ReactEcharts style={{ height: 400 }} notMerge option={this.barOption(pagesBarData, pagesComBarData, 'pages')} />
                          : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userLoyal/fetchPagesTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>
                明细数据
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={pagesColumns} dataSource={pagesTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }

  renderInterval = () => {
    const { loyalData } = this.props
    const { intBarData, intTableData } = loyalData
    const { intColumns } = this.state
    return (
      <div>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>使用间隔分布</HeaderTitle>
          </Col>
          <Col span={24}>
            <ReactEcharts style={{ height: 400 }} option={this.barOption(intBarData)} />
          </Col>
        </Row>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>明细数据</HeaderTitle>
          </Col>
          <Col span={24}>
            <Table columns={intColumns} dataSource={intTableData} />
          </Col>
        </Row>
      </div>
    )
  }

  render() {
    const { dateType, filterData } = this.props
    const { tabsStatus } = this.state
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker {...this.props} dateType={dateType} onChange={this.handleDateChange} onComparison={this.onComparison} onComparisonChange={this.onComparisonChange} />
        <MasFilterParams style={{ marginTop: 16 }} filterData={filterData} onChange={this.setDimension} />
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Tabs activeKey={tabsStatus} onChange={this.changeActiveTab} type="line" >
              <TabPane tab="使用频率" key="freq">{ tabsStatus === 'freq' ? this.renderFreq() : ''}</TabPane>
              <TabPane tab="使用时长" key="time">{ tabsStatus === 'time' ? this.renderUserTime() : ''}</TabPane>
              <TabPane tab="访问页数" key="pages">{ tabsStatus === 'pages' ? this.renderPages() : ''}</TabPane>
              {/* <TabPane tab="使用间隔" key="interval">{ tabsStatus === 'interval' ? this.renderInterval() : ''}</TabPane> */}
            </Tabs>
          </Col>
        </Row>

      </div>
    )
  }
}
