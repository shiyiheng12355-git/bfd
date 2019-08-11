import React, { Component } from 'react';
import { Row, Col, Radio, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat, formatCurrentValue } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasGranularity, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    activeUserInfo: state['report/mobile/userAnalysis'].activeUserInfo,
    activeUserTrendData: state['report/mobile/userAnalysis'].activeUserTrendData,
    activeUserComTrendData: state['report/mobile/userAnalysis'].activeUserComTrendData,
    activeUserONData: state['report/mobile/userAnalysis'].activeUserONData,
    activeUserDataOf: state['report/mobile/userAnalysis'].activeUserDataOf,
    activeUserTableData: state['report/mobile/userAnalysis'].activeUserTableData,
    Global: state.LOADING,
  }
))
export default class ActiveUser extends Component {
  state = {
    type: 'activeCount',
    comparison: false,
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    columns: [
      {
        title: '日期',
        dataIndex: 'dateTime',
      },
      {
        title: '日活跃用户',
        dataIndex: 'activeCount',
      },
      {
        title: '日活跃度',
        dataIndex: 'actvie',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
      {
        title: 'DAU/MAU',
        dataIndex: 'dauDivideMau',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
      {
        title: '活跃账号',
        dataIndex: 'activeAccount',
      },
      {
        title: '活跃账号/活跃用户',
        dataIndex: 'activeAccountDivideActiveCount',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
    ],
    titleExplain: '活跃用户： 启动过应用的用户（去重），启动过一次的用户即视为活跃用户，包括新用户与老用户。<br/>活跃账号： 启动过应用的账号（按账号去重）。',
    chartExplain: '新用户： 即新增用户，第一次启动应用的用户，以GID标识用户的唯一性，卸载后重新安装使用不会重复计量。</br>老用户： 活跃用户-新增用户。 ',
    dataExplain: 'DAU/MAU：  DAU即日活跃用户数，MAU即月活跃用户数（排重）。DAU/MAU是社交游戏类和在线类应用常用的一项评估指标，用于分析用户粘度。比值一般在0.03到1之间。比值越趋近于1表明用户活跃度越高。行业中也常用DAU/MAU乘以30来计算每月用户平均活跃天数。</br>用户平均每月活跃： DAU/MAU *30。</br>活跃账号/活跃用户： 活跃账号占活跃用户的百分比。</br>新老用户百分比： 新用户：老用户。 ',
    detailedExplain: '日活跃用户（DAU）： 当日的活跃用户数(去重)。</br>日活跃度： 当日活跃用户/累计用户。</br>周活跃用户（WAU）： 当周的活跃用户数(去重)。</br>周活跃度： 当周活跃用户/累计用户。</br>月活跃用户（MAU）： 当月的活跃用户数(去重)。</br>月活跃度： 当月活跃用户/累计用户。</br>DAU/MAU： 当日的活跃用户数与最近一月活跃用户数的比值，比值越趋近于1表明用户活跃度越高。</br>活跃账号： 启动过应用的账号（按账号去重）。 ',

  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.activeUserInfo.dateType,
      type: this.state.type,
      dimension: this.state.dimension,
      currentValue: this.props.activeUserInfo.currentValue,
      comparison: this.state.comparison,
    }
    this.getTrendChartData(params)
    this.getONChartData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, activeUserInfo } = nextProps
    const { dateType, currentValue } = activeUserInfo
    const { type, dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      currentValue,
      type,
      dimension,
      comparison,
    }
    if (appkey !== this.props.appkey) {
      this.getTrendChartData(params)
      this.getONChartData(params)
      this.getDataOf(params)
      this.getTableData(params)
    }
  }

  getTrendChartData = (params) => {
    const {
      appkey,
      dateType,
      currentValue,
      type,
      dimension,
      comparison,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchActiveUserTrend',
      payload: {
        params: {
          appkey,
          index: type,
          dimension: JSON.stringify(dimension),
          startDateStr: getDateFormat(dateType).startDateStr,
          endDateStr: getDateFormat(dateType).endDateStr,
          granularity: currentValue,
        },
        comparison,
      },
    })
  }

  getONChartData = (params) => {
    const {
      appkey,
      dateType,
      currentValue,
      dimension,
    } = params

    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchActiveUserON',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        granularity: currentValue,
      },
    })
  }

  getDataOf = (params) => {
    const {
      appkey,
      dateType,
      currentValue,
      dimension,
    } = params

    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchActiveUserOf',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        granularity: currentValue,
      },
    })
  }

  getTableData = (params) => {
    const {
      appkey,
      dateType,
      currentValue,
      dimension,
    } = params

    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchActiveUserTableData',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        granularity: currentValue,
      },
    })
  }

  lineOptionTrend = (data = this.props.activeUserONData) => {
    const { dateType } = this.props.activeUserInfo
    const xAxisData = []
    const oldData = []
    const newData = []
    if (data) {
      data.length !== 0 && data.forEach((item) => {
        xAxisData.push(item.dateTime)
        for (let i in item) {
          if (i === 'oldActiveCount') {
            oldData.push(item[i])
          } else if (i === 'newActiveCount') {
            newData.push(item[i])
          }
        }
      });
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          onZero: true,
        },
      },
      legend: {
        bottom: 0,
        data: ['新用户数', '老用户数'],
      },
      grid: {
        left: '5%',
        top: '5%',
        right: '5%',
        bottom: '5%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `用户分析_新老用户趋势对比_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '新用户数',
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: newData,
        },
        {
          name: '老用户数',
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: oldData,
        },
      ],
    }
    return option
  }

  lineOption = (data = this.props.activeUserTrendData, ComLinedata = this.props.activeUserComTrendData) => {
    const { comparison, type } = this.state
    const { mappingType, activeUserInfo } = this.props
    const { dateType } = activeUserInfo
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
            name: `用户分析_活跃用户趋势_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {
        bottom: 0,
        data: [],
      },
      xAxis: [{
        type: 'category',
        boundaryGap: false,
        data: [],
        axisLine: {
          onZero: true,
        },
      }, {
          type: 'category',
          show: false,
          boundaryGap: false,
          data: [],
          axisLine: {
            onZero: true,
          },
      }],
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
        name: mappingType[type],
        type: 'line',
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      // option.tooltip.formatter = '{b0}<br />{a0}：{c0}'
      option.legend.data = [mappingType[type]]
    } else {
      option.xAxis[1].data = axisComData
      option.series[0] = {
        name: mappingType[type],
        type: 'line',
        xAxisIndex: 0,
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      option.series[1] = {
        name: `${mappingType[type]}对比`,
        type: 'line',
        xAxisIndex: 1,
        areaStyle: {
          normal: {
          },
        },
        data: comparisonData,
      }
      // option.tooltip.formatter = '{b0}<br />{a0}：{c0}<br />{b1}<br />{a1}：{c1}'
      option.legend.data = [mappingType[type], `${mappingType[type]}对比`]
    }
    return option
  }

  //  是否选中对比时间
  onComparison = (flag) => {
    this.setState({ comparison: flag })
  }

  // 对比时间回调
  onComparisonChange = (dateType) => {
    const { appkey, selectedGroupData, activeUserInfo } = this.props
    const { currentValue } = activeUserInfo
    const { type, dimension } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      currentValue,
      comparison: true,
    }

    this.setState({ comparison: true })
    this.getTrendChartData(params)
  }

  handleDateChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { type, dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      currentValue: formatCurrentValue(dateType),
      comparison: false,
    }
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setDateType',
      payload: {
        type: 'activeUserInfo',
        value: dateType,
      },
    })
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setCurrentValue',
      payload: {
        type: 'activeUserInfo',
        value: formatCurrentValue(dateType),
      },
    })
    this.getTrendChartData(params)
    this.getONChartData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  handleTypeChange = (e) => {
    const value = e.target.value
    const { appkey, selectedGroupData, activeUserInfo } = this.props
    const { dateType, currentValue } = activeUserInfo
    const { dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type: value,
      dimension,
      currentValue,
      comparison: false,
    }
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ type: value })
    this.getTrendChartData(params)
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, activeUserInfo } = this.props
    const { dateType, currentValue } = activeUserInfo
    const { type, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension: val,
      currentValue,
      comparison: false,
    }
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ dimension: val })
    this.getTrendChartData(params)
    this.getONChartData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  handleCurrentChange = (value) => {
    const { appkey, selectedGroupData, activeUserInfo } = this.props
    const { dateType } = activeUserInfo
    const { type, dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      currentValue: value,
      comparison: false,
    }
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setCurrentValue',
      payload: {
        type: 'activeUserInfo',
        value,
      },
    })
    this.getTrendChartData(params)
    this.getONChartData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, activeUserInfo } = this.props
    const { dateType } = activeUserInfo;
    let head = {};
    columns.map((item, i) => {
      head[item.dataIndex] = item.title
    })
    const { activeUserTableData } = _.cloneDeep(this.props);
    activeUserTableData && activeUserTableData.map((item) => {
      item.actvie = `${(Number(item.actvie) * 100).toFixed(2)}%`
      item.dauDivideMau = `${(Number(item.dauDivideMau) * 100).toFixed(2)}`
      item.activeAccountDivideActiveCount = `${(Number(item.activeAccountDivideActiveCount) * 100).toFixed(2)}%`
    })
    let data = activeUserTableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  renderColumns = () => {
    const { currentValue } = this.props.activeUserInfo
    let columns
    switch (currentValue) {
      case 'hour':
        columns = [
          {
            title: '日期',
            dataIndex: 'dateTime',
          },
          {
            title: '小时活跃用户',
            dataIndex: 'activeCount',
          },
          {
            title: '活跃账号',
            dataIndex: 'activeAccount',
          },
          {
            title: '活跃账号/活跃用户',
            dataIndex: 'activeAccountDivideActiveCount',
            render: item => (
              `${(Number(item) * 100).toFixed(2)}%`
            ),
          },
        ]
        break;
      case 'day':
        columns = [
          {
            title: '日期',
            dataIndex: 'dateTime',
          },
          {
            title: '日活跃用户',
            dataIndex: 'activeCount',
          },
          {
            title: '日活跃度',
            dataIndex: 'active',
            render: (item) => {
              return `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: 'DAU/MAU',
            dataIndex: 'dauDivideMau',
            render: item => (
              `${(Number(item) * 100).toFixed(2)}%`
            ),
          },
          {
            title: '活跃账号',
            dataIndex: 'activeAccount',
          },
          {
            title: '活跃账号/活跃用户',
            dataIndex: 'activeAccountDivideActiveCount',
            render: (item) => {
              return `${(Number(item) * 100).toFixed(2)}%`
            },
          },
        ]
        break;
      case 'week':
        columns = [
          {
            title: '日期',
            dataIndex: 'dateTime',
          },
          {
            title: '周活跃用户',
            dataIndex: 'activeCount',
          },
          {
            title: '周活跃度',
            dataIndex: 'active',
            render: item => (
              `${(Number(item) * 100).toFixed(2)}%`
            ),
          },
          {
            title: '活跃账号',
            dataIndex: 'activeAccount',
          },
          {
            title: '活跃账号/活跃用户',
            dataIndex: 'activeAccountDivideActiveCount',
            render: item => (
              `${(Number(item) * 100).toFixed(2)}%`
            ),
          },
        ]
        break;
      case 'month':
        columns = [
          {
            title: '日期',
            dataIndex: 'dateTime',
          },
          {
            title: '月活跃用户',
            dataIndex: 'activeCount',
          },
          {
            title: '月活跃度',
            dataIndex: 'active',
            render: item => (
              `${(Number(item) * 100).toFixed(2)}%`
            ),
          },
          {
            title: '活跃账号',
            dataIndex: 'activeAccount',
          },
          {
            title: '活跃账号/活跃用户',
            dataIndex: 'activeAccountDivideActiveCount',
            render: item => (
              `${(Number(item) * 100).toFixed(2)}%`
            ),
          },
        ]
        break;
      default:
        break;
    }
    return columns
  }

  render() {
    const { type } = this.state
    const { activeUserDataOf, activeUserTableData, activeUserInfo, filterData, Global, activeUserTrendData, activeUserONData } = this.props
    const { dateType, currentValue } = activeUserInfo
    let { head, data, fileName } = this.downLoad()
    const columns = this.renderColumns()
    const loadingChart = Global.effects['report/mobile/userAnalysis/fetchActiveUserTrend']
    const loadingTrendChart = Global.effects['report/mobile/userAnalysis/fetchActiveUserON']
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker dateType={dateType} {...this.props} onChange={this.handleDateChange} onComparison={this.onComparison} onComparisonChange={this.onComparisonChange} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
          <Col span={24}>
            <HeaderTitle>活跃用户趋势 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.titleExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={24} style={{ marginTop: 16 }}>
                    <MasFilterParams filterData={filterData} onChange={this.setDimension} />
                  </Col>
                  <Col span={12}>
                    <Radio.Group value={type} onChange={(e) => { this.handleTypeChange(e) }}>
                      <Radio.Button value="activeCount">活跃用户</Radio.Button>
                      <Radio.Button value="activeAccount">活跃账号</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <MasGranularity dateType={dateType} currentValue={currentValue} onChange={this.handleCurrentChange} />
                  </Col>
                  <Col span={24}>
                    {
                      activeUserTrendData && activeUserTrendData.length !== 0
                        ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption()} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
          <Col span={24}>
            <HeaderTitle>新老用户趋势对比 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.chartExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingTrendChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Col span={24}>
                  {
                    activeUserONData && activeUserONData.length !== 0
                    ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOptionTrend()} />
                    : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }
                </Col>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchActiveUserOf']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>数据摘要 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.dataExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                DAU/MAU
              </Col>
              <Col span={12}>
                {activeUserDataOf.dauDivideMau ? activeUserDataOf.dauDivideMau : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                活跃账号/活跃用户
              </Col>
              <Col span={12}>
                {activeUserDataOf.activeCountDivideActiveAccount || activeUserDataOf.activeCountDivideActiveAccount === 0 ? `${(Number(activeUserDataOf.activeCountDivideActiveAccount) * 100).toFixed(2)}%` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                用户平均每月活跃
              </Col>
              <Col span={12}>
                {activeUserDataOf.userActiveTime || activeUserDataOf.userActiveTime === 0 ? `${(activeUserDataOf.userActiveTime).toFixed(2)}天` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                新用户：老用户
              </Col>
              <Col span={12}>
                {/* {`${activeUserDataOf.newCountRate * 100}%：${activeUserDataOf.oldCountRate * 100}%`} */
                  activeUserDataOf.newCountRate || activeUserDataOf.newCountRate === 0 && activeUserDataOf.oldCountRate || activeUserDataOf.oldCountRate === 0 ?
                    `${(activeUserDataOf.newCountRate * 100).toFixed(2)}% ：${(activeUserDataOf.oldCountRate * 100).toFixed(2)}%` : '暂无数据'
                }
              </Col>
            </Col>
          </Row>
        </Spin>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchActiveUserTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>
                明细数据
                <Tooltip placement='right'
                  title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={columns} dataSource={activeUserTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
