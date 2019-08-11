import React, { Component } from 'react';
import { Row, Col, Spin, Radio, Icon } from 'antd';
import { connect } from 'dva';
import { getDateFormat } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    regionData: state['report/mobile/top'].regionData,
    channelData: state['report/mobile/top'].channelData,
    modelData: state['report/mobile/top'].modelData,
    eventData: state['report/mobile/top'].eventData,
    accessPagesData: state['report/mobile/top'].accessPagesData,
    jumpPagesData: state['report/mobile/top'].jumpPagesData,
    dateType: state['report/mobile/top'].dateType,
    Global: state.LOADING,
  }
))
export default class Top extends Component {
  state={
    title: '应用概括',
    type: {
      region: 'newCount',
      channel: 'newCount',
      model: 'newCount',
      event: 'newCount',
      accessPages: 'newCount',
      jumpPages: 'newCount',
    },
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      type: this.state.type,
    }
    this.getRegionData(params)
    this.getChannelData(params)
    this.getModelData(params)
    // this.getEventData()
    this.getAccessPagesData(params)
    // this.getJumpPagesData()
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps
    const { type } = this.state
    const params = {
      appkey,
      dateType,
      type,
    }
    if (appkey !== this.props.appkey) {
      this.getRegionData(params)
      this.getChannelData(params)
      this.getModelData(params)
      // this.getEventData(appkey, dateType, this.state.type.event, selectedGroupData.includePreGroupConditionJson)
      this.getAccessPagesData(params)
      // this.getJumpPagesData(appkey, dateType, this.state.type.jumpPages, selectedGroupData.includePreGroupConditionJson)
    }
  }

  getRegionData = (params) => {
    const {
      appkey,
      dateType,
      type,
    } = params
    this.props.dispatch({
      type: 'report/mobile/top/fetchTopRegionChart',
      payload: {
        appkey,
        index: type.region,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  getChannelData = (params) => {
    const {
      appkey,
      dateType,
      type,
    } = params
    this.props.dispatch({
      type: 'report/mobile/top/fetchTopChannelChart',
      payload: {
        appkey,
        index: type.channel,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  getModelData = (params) => {
    const {
      appkey,
      dateType,
      type,
    } = params

    this.props.dispatch({
      type: 'report/mobile/top/fetchTopModelChart',
      payload: {
        appkey,
        index: type.model,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  getEventData = (appkey = this.props.appkey, dateType = this.props.dateType, type = this.state.type.event) => {
    this.props.dispatch({
      type: 'report/mobile/top/fetchTopEventChart',
      payload: {
        appkey,
        index: type,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  getAccessPagesData = (params) => {
    const {
      appkey,
      dateType,
    } = params
    this.props.dispatch({
      type: 'report/mobile/top/fetchTopAccessPagesChart',
      payload: {
        appkey,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }
  getJumpPagesData = (appkey = this.props.appkey, dateType = this.props.dateType, type = this.state.type.jumpPages) => {
    this.props.dispatch({
      type: 'report/mobile/top/fetchTopJumpPagesChart',
      payload: {
        appkey,
        index: type,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }
  handleDateChange = (dateType) => {
    const params = {
      appkey: this.props.appkey,
      dateType,
      type: this.state.type,
    }
    this.getRegionData(params)
    this.getChannelData(params)
    this.getModelData(params)
    // this.getEventData(this.props.appkey, val, type.event)
    this.getAccessPagesData(params)
    // this.getJumpPagesData(this.props.appkey, val, type.jumpPages)
    this.props.dispatch({
      type: 'report/mobile/top/setDateType',
      payload: dateType,
    })
  }

  handleParamChange = (e, chooseType) => {
    const value = e.target.value
    const { dateType } = this.props
    const { type } = this.state
    type[chooseType] = value
    this.setState({ type })
    const params = {
      appkey: this.props.appkey,
      dateType,
      type,
    }
    switch (chooseType) {
      case 'region':
        this.getRegionData(params)
        break;
      case 'channel':
        this.getChannelData(params)
        break
      case 'model':
        this.getModelData(params)
        break;
      case 'event':
        // this.getEventData(this.props.appkey, dateType, value)
        break;
      case 'accessPages':
        this.getAccessPagesData(params)
        break;
      default:
        // this.getJumpPagesData(this.props.appkey, dateType, value)
        break;
    }
  }

  entryDetail = (navTab, pagesTab) => {
    this.props.dispatch({
      type: 'report/operation/setPagesTab',
      payload: pagesTab,
    })
    this.props.dispatch({
      type: 'report/operation/setNavTab',
      payload: navTab,
    })
  }

  renderChart = (data, nameType) => {
    const { type } = this.state
    const { mappingType, dateType } = this.props
    const xAxisData = []
    const seriesData = []
    const mappingName = { region: 'Top10地区', channel: 'Top10渠道', model: 'Top10机型', accessPages: 'Top10访问页面' }
   if (data) {
      data.length !== 0 && data.forEach((item) => {
        xAxisData.push(item.name)
        seriesData.push(item.num)
      });
    }
    const option = {
      tooltip: {
        formatter: '名称：{b}<br />{a}：{c}',
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `应用概况_${mappingName[nameType]}_${mappingType[type[nameType]]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {
        bottom: 0,
        data: [mappingType[type[nameType]]],
      },
      grid: {
        left: '5%',
        top: '5%',
        right: '5%',
        bottom: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: xAxisData,
        inverse: true,
        axisLabel: {
          formatter: (value) => {
            if (value.length > 6) {
              return `${value.substring(0, 6)}...`;
            } else {
              return value;
            }
          },
        },
      },
      series: [
        {
          type: 'bar',
          name: nameType === 'accessPages' ? '访问次数' : mappingType[type[nameType]],
          data: seriesData,
        },
      ],
    }
    return option
  }

  render() {
    const { type } = this.state
    const {
      regionData,
      channelData,
      modelData,
      accessPagesData,
      Global,
    } = this.props
    const loadingRegion = Global.effects['report/mobile/top/fetchTopRegionChart']
    const loadingChannel = Global.effects['report/mobile/top/fetchTopChannelChart']
    const loadingModel = Global.effects['report/mobile/top/fetchTopModelChart']
    const loadingAccess = Global.effects['report/mobile/top/fetchTopAccessPagesChart']
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker {...this.props} onChange={this.handleDateChange} hideRange hideComparison />
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
              <HeaderTitle>Top10地区<Icon style={{ float: 'right' }} type='right' onClick={() => { this.entryDetail('used', 'region') }} /></HeaderTitle>
              {
                loadingRegion
                  ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
                  : <div>
                      <Radio.Group value={type.region} onChange={(value) => { this.handleParamChange(value, 'region') }}>
                        <Radio.Button value="newCount">新增用户</Radio.Button>
                        <Radio.Button value="activeCount">活跃用户</Radio.Button>
                        <Radio.Button value="addupUserCount">累积用户</Radio.Button>
                      </Radio.Group>
                      {
                        regionData && regionData.length !== 0
                        ? <ReactEcharts notMerge style={{ height: 400 }} option={this.renderChart(regionData, 'region')} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                      }
                    </div>
              }
            </div>
          </Col>
          <Col span={12}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
              <HeaderTitle>TOP10渠道<Icon style={{ float: 'right' }} type='right' onClick={() => { this.entryDetail('used', 'channel') }} /></HeaderTitle>
              {
                loadingChannel
                  ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
                  : <div>
                      <Radio.Group value={type.channel} onChange={(value) => { this.handleParamChange(value, 'channel') }}>
                        <Radio.Button value="newCount">新增用户</Radio.Button>
                        <Radio.Button value="activeCount">活跃用户</Radio.Button>
                        <Radio.Button value="addupUserCount">累积用户</Radio.Button>
                      </Radio.Group>
                      {
                        channelData && channelData.length !== 0 ? <ReactEcharts notMerge style={{ height: 400 }} option={this.renderChart(channelData, 'channel')} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                      }

                    </div>
              }
            </div>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
              <HeaderTitle>Top10机型<Icon style={{ float: 'right' }} type='right' onClick={() => { this.entryDetail('used', 'model') }} /></HeaderTitle>
              {
                loadingModel
                  ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
                  : <div>
                      <Radio.Group value={type.model} onChange={(value) => { this.handleParamChange(value, 'model') }}>
                        <Radio.Button value="newCount">新增用户</Radio.Button>
                        <Radio.Button value="activeCount">活跃用户</Radio.Button>
                        <Radio.Button value="addupUserCount">累积用户</Radio.Button>
                      </Radio.Group>
                      {
                        modelData && modelData.length !== 0
                        ? <ReactEcharts notMerge style={{ height: 400 }} option={this.renderChart(modelData, 'model')} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                      }

                    </div>
              }
            </div>
          </Col>
          <Col span={12}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
              <HeaderTitle>Top10访问页面<Icon style={{ float: 'right' }} type='right' onClick={() => { this.entryDetail('used', 'pages') }} /></HeaderTitle>
              {
                loadingAccess
                  ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
                  : <div>
                    {
                      accessPagesData && accessPagesData.length !== 0
                        ? <ReactEcharts notMerge style={{ height: 400, marginTop: 32 }} option={this.renderChart(accessPagesData, 'accessPages')} />
                        : <div style={{ textAlign: 'center', height: '400px', marginTop: 32 }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </div>
              }
            </div>
          </Col>
          {/* <Col span={12}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
              <HeaderTitle>TOP10自定义事件</HeaderTitle>
              <Radio.Group value={type.event} onChange={(value) => { this.handleParamChange(value, 'event') }}>
                <Radio.Button value="newCount">新增用户</Radio.Button>
                <Radio.Button value="activeCount">活跃用户</Radio.Button>
                <Radio.Button value="addupUserCount">累积用户</Radio.Button>
              </Radio.Group>
              <ReactEcharts style={{ height: 400 }} option={this.renderChart(eventData)} />
            </div>
          </Col> */}
        </Row>
        {/* <Row gutter={16}>
          <Col span={12}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
              <HeaderTitle>Top10访问页面<Icon style={{ float: 'right' }} type='right' onClick={() => { this.entryDetail('used', 'pages') }} /></HeaderTitle>
              <Radio.Group value={type.accessPages} onChange={(value) => { this.handleParamChange(value, 'accessPages') }}>
                <Radio.Button value="newCount">新增用户</Radio.Button>
                <Radio.Button value="activeCount">活跃用户</Radio.Button>
                <Radio.Button value="addupUserCount">累积用户</Radio.Button>
              </Radio.Group>
              <ReactEcharts style={{ height: 400 }} option={this.renderChart(accessPagesData)} />
            </div>
          </Col>
          {<Col span={12}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
              <HeaderTitle>TOP10跳出页面<Icon style={{ float: 'right' }} type='right' onClick={() => { this.entryDetail('used', 'pages') }} /></HeaderTitle>
              <Radio.Group value={type.jumpPages} onChange={(value) => { this.handleParamChange(value, 'jumpPages') }}>
                <Radio.Button value="newCount">新增用户</Radio.Button>
                <Radio.Button value="activeCount">活跃用户</Radio.Button>
                <Radio.Button value="addupUserCount">累积用户</Radio.Button>
              </Radio.Group>
              <ReactEcharts style={{ height: 400 }} option={this.renderChart(jumpPagesData)} />
            </div>
          </Col>}
        </Row> */}
      </div >
    )
  }
}