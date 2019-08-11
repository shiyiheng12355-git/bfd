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
    silentUserInfo: state['report/mobile/userAnalysis'].silentUserInfo,
    silentUserTrendData: state['report/mobile/userAnalysis'].silentUserTrendData,
    silentUserComTrendData: state['report/mobile/userAnalysis'].silentUserComTrendData,
    silentUserSNdData: state['report/mobile/userAnalysis'].silentUserSNdData,
    silentUserTableData: state['report/mobile/userAnalysis'].silentUserTableData,
    Global: state.LOADING,
  }
))
export default class SilentUser extends Component {
  state = {
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
        title: '新增用户数',
        dataIndex: 'newCount',
      },
      {
        title: '沉默用户数',
        dataIndex: 'silentCount',
      },
      {
        title: '沉默用户占比',
        dataIndex: 'silentCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
    ],
    titleExplain: '沉默用户：用户仅在安装日（及安装次日）启动，且在后续时间内无启动行为，则被认为是沉默用户。',
    chartExplain: '沉默用户占新增用户的比例越小，说明新增用户的质量越好。',
    detailedExplain: '新增用户数： 当日第一次启动应用的用户。</br>沉默用户数： 新增当天（及次日）启动，后续时间内无启动行为的用户。</br>沉默用户比例： 沉默用户数/新增用户数。 ',

  }
  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.silentUserInfo.dateType,
      dimension: this.state.dimension,
      comparison: this.state.comparison,
    }
    this.getTrendChartData(params)
    this.getSNChartData(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, silentUserInfo } = nextProps
    const { dateType } = silentUserInfo
    const { dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      dimension,
      comparison,
    }
    if (appkey !== this.props.appkey) {
      this.getTrendChartData(params)
      this.getSNChartData(params)
      this.getTableData(params)
    }
  }

  getTrendChartData = (params) => {
    const {
      appkey,
      dateType,
      dimension,
      comparison,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchSilentUserTrendData',
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
  }

  getSNChartData = (params) => {
    const {
      appkey,
      dateType,
      dimension,
    } = params

    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchSilentUserSNData',
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
    } = params

    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchSilentUserTableData',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  lineOptionTrend = (data = this.props.silentUserSNdData) => {
    const { dateType } = this.props.silentUserInfo
    const xAxisData = []
    const silentData = []
    const newData = []
    if (data) {
      data.length !== 0 && data.forEach((item) => {
        xAxisData.push(item.dateTime)
        for (let i in item) {
          if (i === 'silentCount') {
            silentData.push(item[i])
          } else if (i === 'newCount') {
            newData.push(item[i])
          }
        }
      });
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        bottom: 0,
        data: ['新增用户数', '沉默用户数'],
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          onZero: true,
        },
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
            name: `用户分析_沉默新增趋势对比_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '新增用户数',
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: newData,
        },
        {
          name: '沉默用户数',
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: silentData,
        },
      ],
    }
    return option
  }

  lineOption = (data = this.props.silentUserTrendData, ComLinedata = this.props.silentUserComTrendData) => {
    const { comparison } = this.state
    const { dateType } = this.props.silentUserInfo
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
            name: `用户分析_沉默用户趋势图_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
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
        name: '沉默用户数',
        type: 'line',
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
    } else {
      option.series[0] = {
        name: '沉默用户数',
        type: 'line',
        xAxisIndex: 0,
        areaStyle: {
          normal: {
          },
        },
        data: seriesData,
      }
      option.series[1] = {
        name: '沉默用户数对比',
        type: 'line',
        xAxisIndex: 1,
        areaStyle: {
          normal: {
          },
        },
        data: comparisonData,
      }
      option.xAxis[1].data = axisComData
    }
    return option
  }

  //  是否选中对比时间
  onComparison = (flag) => {
    this.setState({ comparison: flag })
  }

  // 对比时间回调
  onComparisonChange = (dateType) => {
    const { selectedGroupData, appkey } = this.props
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      dimension,
      comparison: true,
    }
    this.setState({ comparison: true })
    this.getTrendChartData(params)
  }

  setDimension = (val) => {
    const { selectedGroupData, appkey, silentUserInfo } = this.props
    const { dateType } = silentUserInfo
    const params = {
      appkey,
      dateType,
      dimension: val,
      comparison: false,
    }
    this.setState({ dimension: val })
    this.getTrendChartData(params)
    this.getSNChartData(params)
    this.getTableData(params)
  }

  handleDateChange = (dateType) => {
    const { selectedGroupData, appkey } = this.props
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      dimension,
      comparison: false,
    }
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setDateType',
      payload: {
        type: 'silentUserInfo',
        value: dateType,
      },
    })
    const { comparison } = this.state
    if (comparison) {
      this.setState({ comparison: false })
    }
    this.getTrendChartData(params)
    this.getSNChartData(params)
    this.getTableData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, silentUserInfo } = this.props
    const { dateType } = silentUserInfo;
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
    const { silentUserTableData } = _.cloneDeep(this.props);
    silentUserTableData && silentUserTableData.map((item) => {
      item.silentCountRate = `${(Number(item.silentCountRate) * 100).toFixed(2)}%`
    })
    let data = silentUserTableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { silentUserInfo, filterData, silentUserTableData, Global, silentUserTrendData, silentUserSNdData } = this.props
    const { dateType } = silentUserInfo
    const loadingChart = Global.effects['report/mobile/userAnalysis/fetchSilentUserTrendData']
    const loadingTrendChart = Global.effects['report/mobile/userAnalysis/fetchSilentUserSNData']
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker hideList dateType={dateType} {...this.props} onChange={this.handleDateChange} onComparison={this.onComparison} onComparisonChange={this.onComparisonChange} />
        <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
          <Col span={24}>
            <HeaderTitle>沉默用户趋势图 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.titleExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Col span={24}>
                {
                  silentUserTrendData && silentUserTrendData.length !== 0
                    ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption()} />
                    : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                }
                </Col>
          }

        </Row>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
          <Col span={24}>
            <HeaderTitle>沉默与新增对比趋势图 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.chartExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingTrendChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Col span={24}>
                {
                  silentUserSNdData && silentUserSNdData.length !== 0
                    ? <ReactEcharts style={{ height: 400 }} option={this.lineOptionTrend()} />
                    : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                }
                </Col>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchSilentUserTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>明细数据
                <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={this.state.columns} dataSource={silentUserTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
