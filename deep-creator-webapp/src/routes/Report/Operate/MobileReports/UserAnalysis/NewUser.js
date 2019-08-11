import React, { Component } from 'react';
import { Row, Col, Radio, Table, Checkbox, Spin, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat, formatCurrentValue } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasGranularity, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

const CheckboxGroup = Checkbox.Group;

@connect(state => (
  {
    /* dateType: state['report/mobile/userAnalysis'].dateType,
    newUserData: state['report/mobile/userAnalysis'].newUserData,
    currentValue: state['report/mobile/userAnalysis'].currentValue,
    newUserDataOf: state['report/mobile/userAnalysis'].newUserDataOf,
    newUserTableData: state['report/mobile/userAnalysis'].newUserTableData, */
    newUserInfo: state['report/mobile/userAnalysis'].newUserInfo,
    newUserData: state['report/mobile/userAnalysis'].newUserData,
    newUserComData: state['report/mobile/userAnalysis'].newUserComData,
    newUserDataOf: state['report/mobile/userAnalysis'].newUserDataOf,
    newUserTableData: state['report/mobile/userAnalysis'].newUserTableData,
    Global: state.LOADING,
  }
))
export default class NewUser extends Component {
  state = {
    type: 'newCount',
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
        title: '新增用户（占比）',
        dataIndex: 'newCount',
        render: (text, record) => (
          `${record.newCount}(${(Number(record.newCountRate) * 100).toFixed(2)}%)`
        ),
      },
      {
        title: '新增账号（占比）',
        dataIndex: 'percent',
        render: (text, record) => (
          `${record.newAccountCount}(${(Number(record.newAccountRate) * 100).toFixed(2)}%)`
        ),
      },
    ],
    titleExplain: '新增用户：第一次启动应用的用户，以GID标识用户的唯一性，卸载后重新安装使用不会重复计量。<br/>新增账号：新注册的用户数。',
    dataExplain: '时段内新增用户：时段内新增用户总数。<br/>时段内新增账号：时段段内新增账号总数。',
    detailedExplain: '新增用户：第一次启动应用的用户，以GID标识用户的唯一性，卸载后重新安装使用不会重复计量。<br/>新增用户占比：当前小时、天、周、月的新增用户/时段内新增用户之和。<br/>新增账号：第一次启动应用的账号。<br>新增账号占比：当前小时、天、周、月的新增账号/时段内新增账号之和',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.newUserInfo.dateType,
      type: this.state.type,
      dimension: this.state.dimension,
      currentValue: this.props.newUserInfo.currentValue,
      comparison: this.state.comparison,
    }
    this.getChartData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, newUserInfo } = nextProps
    const params = {
      appkey,
      dateType: newUserInfo.dateType,
      type: this.state.type,
      dimension: this.state.dimension,
      currentValue: newUserInfo.currentValue,
      comparison: this.state.comparison,
    }
    if (appkey !== this.props.appkey) {
      // this.getChartData(appkey, dateType, selectedGroupData.includePreGroupConditionJson)
      this.getChartData(params)
      this.getDataOf(params)
      this.getTableData(params)
    }
  }

  getChartData = (params) => {
    const {
      appkey,
      dateType,
      type,
      dimension,
      currentValue,
      comparison,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchNewUser',
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

  getDataOf = (params) => {
    const {
      appkey,
      dateType,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchNewUserOf',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  getTableData = (params) => {
    const {
      appkey,
      dateType,
      dimension,
      currentValue,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchNewUserTableData',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        granularity: currentValue,
      },
    })
  }

  lineOption = (data = this.props.newUserData, ComLinedata = this.props.newUserComData) => {
    const { comparison, type } = this.state
    const { mappingType, newUserInfo } = this.props
    const { dateType } = newUserInfo
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
            name: `用户分析_新增用户分析_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
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
        name: mappingType[type],
        type: 'line',
        xAxisIndex: 0,
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
    const { appkey, selectedGroupData, newUserInfo } = this.props
    const { currentValue } = newUserInfo
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
    this.getChartData(params)
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, newUserInfo } = this.props
    const { dateType, currentValue } = newUserInfo
    const { type } = this.state
    const { comparison } = this.state
    if (comparison) {
      this.setState({ comparison: false })
    }
    const params = {
      appkey,
      dateType,
      type,
      dimension: val,
      currentValue,
      comparison: false,
    }
    this.setState({ dimension: val })
    this.getChartData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  handleDateChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { comparison, dimension, type } = this.state
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setDateType',
      payload: {
        type: 'newUserInfo',
        value: dateType,
      },
    })
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setCurrentValue',
      payload: {
        type: 'newUserInfo',
        value: formatCurrentValue(dateType),
      },
    })
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      currentValue: formatCurrentValue(dateType),
      comparison: false,
    }
    this.getChartData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  handleTypeChange = (e) => {
    const value = e.target.value
    const { appkey, newUserInfo, selectedGroupData } = this.props
    const { dateType, currentValue } = newUserInfo
    const { comparison, dimension } = this.state
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ type: value })

    const params = {
      appkey,
      dateType,
      type: value,
      dimension,
      currentValue,
      comparison: false,
    }

    this.getChartData(params)
  }

  handleCurrentChange = (value) => {
    const { appkey, newUserInfo, selectedGroupData } = this.props
    const { dateType } = newUserInfo
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
        type: 'newUserInfo',
        value,
      },
    })
    this.getChartData(params)
    this.getTableData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, newUserInfo } = this.props;
    const { dateType } = newUserInfo;
    let head = {};
    columns.map((item, i) => {
      head[item.dataIndex] = item.title
    })
    const { newUserTableData } = _.cloneDeep(this.props);
    newUserTableData.map((item) => {
      item.newCount = `${item.newCount}(${(Number(item.newCountRate) * 100).toFixed(2)}%)`
      item.percent = `${item.newAccountCount}(${(Number(item.newAccountRate) * 100).toFixed(2)}%)`
    })
    let data = newUserTableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { type } = this.state
    const { newUserDataOf, newUserTableData, newUserInfo, filterData, Global, newUserData } = this.props
    const { dateType, currentValue } = newUserInfo
    let { head, data, fileName } = this.downLoad()
    const loadingChart = Global.effects['report/mobile/userAnalysis/fetchNewUser']
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker dateType={dateType} {...this.props} onChange={this.handleDateChange} onComparison={this.onComparison} onComparisonChange={this.onComparisonChange} />
        <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
          <Col span={24}>
            <HeaderTitle>新增用户分析 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.titleExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={12}>
                    <Radio.Group value={type} onChange={(e) => { this.handleTypeChange(e) }}>
                      <Radio.Button value="newCount">新增用户</Radio.Button>
                      <Radio.Button value="newAccountCount">新增账号</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <MasGranularity dateType={dateType} currentValue={currentValue} onChange={this.handleCurrentChange} />
                  </Col>
                  <Col span={24}>
                    {
                      newUserData && newUserData.length !== 0
                      ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption()} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchNewUserOf']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>数据摘要 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.dataExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                时段内新增用户
              </Col>
              <Col span={12}>
                {newUserDataOf.newCount || newUserDataOf.newCount === 0 ? newUserDataOf.newCount : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                时段内新增账号
              </Col>
              <Col span={12}>
                {newUserDataOf.newAccountCount | newUserDataOf.newAccountCount === 0 ? newUserDataOf.newAccountCount : '暂无数据'}
              </Col>
            </Col>
          </Row>
        </Spin>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchNewUserTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>
                明细数据
                <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={this.state.columns} dataSource={newUserTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
