import React, { Component } from 'react';
import { Row, Col, Radio, Spin, Table, Select, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import moment from 'moment';
import { getDateFormat } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

const Option = Select.Option;

@connect(state => (
  {
    lostUserInfo: state['report/mobile/userAnalysis'].lostUserInfo,
    lostUserData: state['report/mobile/userAnalysis'].lostUserData,
    lostUserComData: state['report/mobile/userAnalysis'].lostUserComData,
    lostUserTableData: state['report/mobile/userAnalysis'].lostUserTableData,
    Global: state.LOADING,
  }
))
export default class ActiveUser extends Component {
  state = {
    type: 'wastageCount',
    comparison: false,
    columns: [
      {
        title: '日期',
        dataIndex: 'dateTime',
      },
      {
        title: '流失用户',
        dataIndex: 'wastageCount',
      },
      {
        title: '回流用户',
        dataIndex: 'backflowCount',
      },
    ],
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    granularity: '7',
    titleExplain: '流失用户：截止某日，用户刚好连续7/14/30天没有使用过应用，将被视为当日的一个流失。</br>回流用户： 流失用户在某日再次使用应用，将视为当日的一个回流。 ',
    detailedExplain: '流失用户： 当天流失用户数。</br>回流用户： 当天回流用户数。 ',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.lostUserInfo.dateType,
      type: this.state.type,
      dimension: this.state.dimension,
      comparison: this.state.comparison,
      granularity: this.state.granularity,
    }
    this.getChartData(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, lostUserInfo } = nextProps
    const { dateType } = lostUserInfo
    const { type, dimension, comparison, granularity } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      comparison,
      granularity,
    }
    if (appkey !== this.props.appkey) {
      this.getChartData(params)
      this.getTableData(params)
    }
  }

  getChartData = (params) => {
    const {
      appkey,
      dateType,
      type,
      dimension,
      comparison,
      granularity,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchLostUserData',
      payload: {
        params: {
          appkey,
          index: type,
          dimension: JSON.stringify(dimension),
          startDateStr: getDateFormat(dateType).startDateStr,
          endDateStr: getDateFormat(dateType).endDateStr,
          granularity,
        },
        comparison,
      },
    })
  }

  getTableData = (params) => {
    const {
      appkey,
      dateType,
      dimension,
      granularity,
    } = params

    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchLostUserTableData',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        granularity,
      },
    })
  }

  lineOption = (data, ComLinedata = this.props.lostUserComData) => {
    const { comparison, type } = this.state
    const { mappingType, lostUserInfo } = this.props
    const { dateType } = lostUserInfo
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
            name: `用户分析_流失用户分析_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
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
        comparisonData.push(item.num)
        axisComData.push(item.dateTime)
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
      option.legend.data = [mappingType[type]]
    } else {
      option.series[0] = {
        name: mappingType[type],
        type: 'line',
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      option.series[1] = {
        name: `${mappingType[type]}对比`,
        type: 'line',
        areaStyle: {
          normal: {
          },
        },
        data: comparisonData,
      }
    }
    option.legend.data = [mappingType[type], `${mappingType[type]}对比`]
    return option
  }

  //  是否选中对比时间
  onComparison = (flag) => {
    this.setState({ comparison: flag })
  }

  // 对比时间回调
  onComparisonChange = (dateType) => {
    const { selectedGroupData, appkey } = this.props
    const { type, dimension, granularity } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      granularity,
      comparison: true,
    }
    this.setState({ comparison: true })
    this.getChartData(params)
  }

  handleGranularityChange = (val) => {
    const { appkey, selectedGroupData, lostUserInfo } = this.props
    const { dateType } = lostUserInfo
    const { type, dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      granularity: val,
      comparison: false,
    }
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ granularity: val })
    this.getChartData(params)
    this.getTableData(params)
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, lostUserInfo } = this.props
    const { dateType } = lostUserInfo
    const { type, granularity, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension: val,
      granularity,
      comparison: false,
    }
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ dimension: val })
    this.getChartData(params)
    this.getTableData(params)
  }

  handleTypeChange = (e) => {
    const value = e.target.value
    const { appkey, selectedGroupData, lostUserInfo } = this.props
    const { dateType } = lostUserInfo
    const { granularity, dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type: value,
      dimension,
      granularity,
      comparison: false,
    }
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.setState({ type: value })
    this.getChartData(params)
  }

  handleDateChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { type, granularity, dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
      granularity,
      comparison: false,
    }

    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setDateType',
      payload: {
        type: 'lostUserInfo',
        value: dateType,
      },
    })
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.getChartData(params)
    this.getTableData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, lostUserInfo } = this.props;
    const { dateType } = lostUserInfo;
    let head = {};
    columns.map((item, i) => {
      head[item.dataIndex] = item.title
    })
    const { lostUserTableData } = _.cloneDeep(this.props);
    let data = lostUserTableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { type } = this.state
    const { lostUserData, lostUserInfo, filterData, lostUserTableData, Global } = this.props
    const { dateType } = lostUserInfo
    const loadingChart = Global.effects['report/mobile/userAnalysis/fetchLostUserData']
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker dateType={dateType} {...this.props} onChange={this.handleDateChange} onComparison={this.onComparison} onComparisonChange={this.onComparisonChange} />
        <Select style={{ marginTop: 16 }} defaultValue='7' onChange={this.handleGranularityChange}>
          <Option value='7'>连续7天不开启应用</Option>
          <Option value='14'>连续14天不开启应用</Option>
          <Option value='30'>连续30天不开启应用</Option>
        </Select>
        <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
          <Col span={24}>
            <HeaderTitle>流失用户分析 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.titleExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={12}>
                    <Radio.Group value={type} onChange={(e) => { this.handleTypeChange(e) }}>
                      <Radio.Button value="wastageCount">流失用户</Radio.Button>
                      <Radio.Button value="backflowCount">回流用户</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    {
                      lostUserData && lostUserData.lengt !== 0
                        ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption(lostUserData)} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchLostUserTableData']}>
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
              <Table columns={this.state.columns} dataSource={lostUserTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
