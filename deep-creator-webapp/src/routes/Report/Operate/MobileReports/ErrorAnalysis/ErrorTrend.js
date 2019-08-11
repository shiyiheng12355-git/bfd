import React, { Component } from 'react';
import { Row, Col, Button, Radio, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    errorTrendInfo: state['report/mobile/errorAnalysis'].errorTrendInfo,
    errorTrendData: state['report/mobile/errorAnalysis'].errorTrendData,
    versionData: state['report/mobile/errorAnalysis'].versionData,
    systemData: state['report/mobile/errorAnalysis'].systemData,
    modelData: state['report/mobile/errorAnalysis'].modelData,
    channelData: state['report/mobile/errorAnalysis'].channelData,
    Global: state.LOADING,
  }
))
export default class ErrorAnalysi extends Component {
  state = {
    type: 'errorCount',
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    titleExplain: '错误次数：错误发生总次数。<br/>错误率：错误次数/启动次数。',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.errorTrendInfo.dateType,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      type: this.state.type,
      dimension: this.state.dimension,
    }
    this.getData(params)
    this.getTopData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, errorTrendInfo } = nextProps
    const { dateType } = errorTrendInfo
    const { includePreGroupConditionJson } = selectedGroupData
    const { type, dimension } = this.state
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson,
      type,
      dimension,
    }
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      this.getData(params)
      this.getTopData(params)
    }
  }

  getData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      type,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/errorAnalysis/fetchErrorTrendData',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        index: type,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  getTopData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
    } = params
    this.props.dispatch({
      type: 'report/mobile/errorAnalysis/fetchErrorTrendTopData',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  lineOption = (data = this.props.errorTrendData) => {
    const xAxisData = []
    const seriesData = []
    const { mappingType, errorTrendInfo } = this.props
    const { dateType } = errorTrendInfo
    const { type } = this.state
    if (data) {
      data.length !== 0 && data.forEach((item) => {
        xAxisData.push(item.dateTime)
        seriesData.push(item.num)
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
            name: `错误分析_错误趋势_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {
        bottom: 0,
        data: [mappingType[type]],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: mappingType[type],
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: seriesData,
        },
      ],
    }
    return option
  }

  topOption = (data, type) => {
    const xAxisData = []
    const seriesData = []
    const { dateType } = this.props.errorTrendInfo
    const downname = {
      channel: 'TOP10渠道错误分析',
      version: 'Top10版本错误分析',
      system: 'TOP10操作系统错误分析',
      modal: 'Top10设备错误分析',
    }
    if (data) {
      data.length !== 0 && data.forEach((item) => {
        xAxisData.push(item.name)
        seriesData.push(item.num)
      });
    }
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'value',

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
            name: `错误分析_${downname[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      yAxis: {
        type: 'category',
        data: xAxisData,
        inverse: true,
      },
      series: [
        {
          name: '错误次数',
          type: 'bar',
          data: seriesData,
        },
      ],
    }
    return option
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, errorTrendInfo } = this.props
    const { dateType } = errorTrendInfo
    const { includePreGroupConditionJson } = selectedGroupData
    const { type } = this.state
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson,
      type,
      dimension: val,
    }
    this.setState({ dimension: val })
    this.getData(params)
  }

  handleDateChange = (dateType) => {
    const { appkey } = this.props
    this.props.dispatch({
      type: 'report/mobile/errorAnalysis/setDateType',
      payload: {
        type: 'errorTrendInfo',
        value: dateType,
      },
    })
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
      type: this.state.type,
    }
    this.getData(params)
    this.getTopData(params)
  }

  handleSizeChange = (e) => {
    const { appkey, errorTrendInfo, selectedGroupData } = this.props
    const { dateType } = errorTrendInfo
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
      type: e.target.value,
    }
    this.setState({ type: e.target.value })
    this.getData(params)
  }

  render() {
    const { errorTrendInfo, filterData, Global, versionData, channelData, modelData, systemData, errorTrendData } = this.props
    const { dateType } = errorTrendInfo
    const { type } = this.state
    const loadingChart = Global.effects['report/mobile/errorAnalysis/fetchErrorTrendData']
    const loadingTop = Global.effects['report/mobile/errorAnalysis/fetchErrorTrendTopData']
    return (
      <div>
        <MasTitle {...this.props} dateType={dateType} />
        <MasDatePicker {...this.props} dateType={dateType} hideComparison onChange={this.handleDateChange} />
        <MasFilterParams style={{ margin: '16px 0' }} filterData={filterData} onChange={this.setDimension} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>错误趋势</HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={24}>
                    <Radio.Group value={type} onChange={this.handleSizeChange}>
                      <Radio.Button value="errorCount">错误数</Radio.Button>
                      <Radio.Button value="errorRate">错误率</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    {
                      errorTrendData && errorTrendData.length !== 0
                        ? <ReactEcharts style={{ height: 400 }} option={this.lineOption()} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        {
          loadingTop
            ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
            : <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
                    <HeaderTitle>Top10版本错误分析</HeaderTitle>
                    {
                      versionData && versionData.length !== 0
                        ? <ReactEcharts style={{ height: 400 }} option={this.topOption(versionData, 'version')} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
                    <HeaderTitle>TOP10操作系统错误分析</HeaderTitle>
                    {
                      systemData && systemData.length !== 0
                        ? <ReactEcharts style={{ height: 400 }} option={this.topOption(systemData, 'system')} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </div>
                </Col>
              </Row>
        }
        {
          loadingTop
            ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
            : <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
                  <HeaderTitle>Top10设备错误分析</HeaderTitle>
                  {
                    modelData && modelData.length !== 0
                      ? <ReactEcharts style={{ height: 400 }} option={this.topOption(modelData, 'modal')} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }
                </div>
              </Col>
              <Col span={12}>
                <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
                  <HeaderTitle>TOP10渠道错误分析</HeaderTitle>
                  {
                    channelData && channelData.length !== 0
                      ? <ReactEcharts style={{ height: 400 }} option={this.topOption(channelData, 'channel')} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }
                </div>
              </Col>
            </Row>
        }
      </div >
    )
  }
}
