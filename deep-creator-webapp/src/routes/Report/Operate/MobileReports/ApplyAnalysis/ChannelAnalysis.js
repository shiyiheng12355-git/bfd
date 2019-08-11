import React, { Component } from 'react';
import { Row, Col, Radio, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import _ from 'lodash'
import { getDateFormat } from '../../../../../utils/utils'
import MaSelect from '../../../../../components/MaSelect'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    dateType: state['report/mobile/channelAnalysis'].dateType,
    tableData: state['report/mobile/channelAnalysis'].tableData,
    chartData: state['report/mobile/channelAnalysis'].chartData,
    channelData: state['report/mobile/channelAnalysis'].channelData,
    abstractList: state['report/mobile/channelAnalysis'].abstractList,
    Global: state.LOADING,
  }
))

export default class ChannelAnalysis extends Component {
  state = {
    type: 'newCount',
    dimension: {
      province: [],
      appversion: [],
    },
    channel: [],
    columns: [
      {
        title: '渠道名称',
        dataIndex: 'channel',
      },
      {
        title: '累计用户（占比）',
        dataIndex: 'addupUserCount',
        render: (text, record) => (
          `${record.addupUserCount}(${(Number(record.addupUserCountRate) * 100).toFixed(2)}%)`
        ),
      },
      {
        title: '新增用户（占比）',
        dataIndex: 'newCount',
        render: (text, record) => (
          `${record.newCount}(${(Number(record.newCountRate) * 100).toFixed(2)}%)`
        ),
      },
      {
        title: '活跃用户（占比）',
        dataIndex: 'activeCount',
        render: (text, record) => (
          `${record.activeCount}(${(Number(record.activeCountRate) * 100).toFixed(2)}%)`
        ),
      },
      {
        title: '启动次数（占比）',
        dataIndex: 'startupCount',
        render: (text, record) => (
          `${record.startupCount}(${(Number(record.startupCountRate) * 100).toFixed(2)}%)`
        ),
      },
    ],
    channelSelect: {},
    dataExplain: '累计用户： 该渠道自上线以来的累计独立用户数。<br/>累计用户占比： 该渠道的累计用户/所有渠道的累计用户。<br/>新增用户： 该渠道下首次启动应用的用户。<br/>新增用户占比： 该渠道下新增用户/所有渠道下的新增用户之和。<br/>活跃用户： 在该渠道下启动过应用的用户。<br/>活跃用户占比： 该渠道下的活跃用户/所有渠道下的活跃用户之和。<br/>启动次数： 该渠道下用户启动次数之和。<br/>启动次数占比： 该渠道下的用户启动次数之和/所有渠道下的用户启动次数之和。',
    chartExplain: '新增用户： 第一次启动应用的用户。<br/>活跃用户： 启动过应用的用户(去重)，启动过一次的用户即被视为活跃用户，包括新用户和老用户。<br/>启动次数： 打开应用视为启动,退往后台超过30S或者完全退出视为启动结束。<br/>次日留存率： 次日留存率是指某日的新增用户中，第二日有使用过应用的用户比例。 ',
    detailedExplain: '活跃度： 某渠道活跃用户/某渠道累计用户。<br/>新增用户占比： 某渠道新增用户/所有渠道新增用户。<br/>沉默用户比例： 某渠道沉默用户/某渠道新增用户。<br/>近7日回访率： 某渠道7日回访用户/某渠道新增用户。 ',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      type: this.state.type,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
    }
    // this.getChartData(params)
    this.getTableData(params)
    this.getAbstractList(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension, type } = this.state
    const params = {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension,
    }
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      // this.getChartData(params)
      this.getTableData(params)
      this.getAbstractList(params)
    }
  }
  getChartData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      type,
      dimension,
      channel,
    } = params
    this.props.dispatch({
      type: 'report/mobile/channelAnalysis/fetchChartData',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        index: type,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        dimension: JSON.stringify(dimension),
        channel: channel.join(','),
      },

    })
  }
  getTableData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
      type,
    } = params
    this.props.dispatch({
      type: 'report/mobile/channelAnalysis/fetchTableData',
      payload: {
        params: {
          appkey,
          prevGroupExpression: includePreGroupConditionJson,
          startDateStr: getDateFormat(dateType).startDateStr,
          endDateStr: getDateFormat(dateType).endDateStr,
          dimension: JSON.stringify(dimension),
        },
        type,
      },
      callback: (channelData) => {
        this.setState({ channel: channelData.slice(0, 5) })
        params.channel = channelData.slice(0, 5)
        this.getChartData(params)
        this.channelSelect(channelData)
      },
    })
  }
  getAbstractList = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/channelAnalysis/fetchAbstractList',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        dimension: JSON.stringify(dimension),
      },
    })
  }
  lineOptionTrend = (data = this.props.chartData) => {
    const { type } = this.state
    const { mappingType, dateType } = this.props
    let xAxisData = []
    const seriesData = []
    const legendData = []
    if (data && data !== {}) {
      xAxisData = data.date
      if (data.list !== undefined) {
        data.list.map((item) => {
          legendData.push(item.channel)
          seriesData.push({
            name: item.channel,
            data: item.date,
            type: 'line',
          })
        })
      }
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
            name: `使用分析_渠道趋势对比_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {
        bottom: 0,
        data: legendData,
      },
      yAxis: {
        type: 'value',
      },
      series: seriesData,
    }
    return option
  }
  handleSizeChange = (e) => {
    const value = e.target.value
    const { appkey, dateType, selectedGroupData } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension, channel } = this.state
    this.setState({ type: value })
    const params = {
      appkey,
      dateType,
      type: value,
      includePreGroupConditionJson,
      dimension,
      channel,
    }
    // this.getChartData(params)
    this.getTableData(params)
  }
  handleDateChange = (dateType) => {
    this.props.dispatch({
      type: 'report/mobile/channelAnalysis/setDateType',
      payload: dateType,
    })
    const { appkey, selectedGroupData } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension, channel, type } = this.state
    const params = {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension,
      channel,
    }
    // this.getChartData(params)
    this.getTableData(params)
    this.getAbstractList(params)
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, dateType } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { channel, type } = this.state
    const params = {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension: val,
      channel,
    }
    this.setState({ dimension: val })
    // this.getChartData(params)
    this.getTableData(params)
    this.getAbstractList(params)
  }

  changeChannel = (val) => {
    const { checked } = val

    const { appkey, selectedGroupData, dateType } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { type, dimension, channelSelect } = this.state
    const params = {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension,
      channel: checked,
    }
    channelSelect.value = checked
    this.setState({ channel: checked, channelSelect })
    this.getChartData(params)
  }

  channelSelect = (channelData) => {
    const { channelSelect } = this.state
    channelSelect.limit = 5
    channelSelect.value = channelData.slice(0, channelSelect.limit)
    const checkData = []
    channelData.map((item) => {
      checkData.push({
        label: item,
        value: item,
      })
    })
    channelSelect.checkGroup = [{ label: '渠道选择', checkData }]
    this.setState(channelSelect)
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
      item.newCount = `${item.newCount}(${(Number(item.newCountRate) * 100).toFixed(2)}%)`
      item.addupUserCount = `${item.addupUserCount}(${(Number(item.addupUserCountRate) * 100).toFixed(2)}%)`
      item.activeCount = `${item.activeCount}(${(Number(item.activeCountRate) * 100).toFixed(2)}%)`
      item.startupCount = `${item.startupCount}(${(Number(item.startupCountRate) * 100).toFixed(2)}%)`
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
    const { tableData, abstractList, filterData, dateType, channelData, Global, chartData } = this.props
    const { type, columns, channelSelect } = this.state
    const loadingTable = Global.effects['report/mobile/channelAnalysis/fetchTableData']
    const loadingChart = Global.effects['report/mobile/channelAnalysis/fetchChartData']
    let absAcitve = null
    let absSilent = null
    let absNewCount = null
    let absSevenDay = null
    if (abstractList && abstractList.length !== 0) {
      absAcitve = abstractList.find((item) => {
        return item.type === 'active'
      })
      absSilent = abstractList.find((item) => {
        return item.type === 'silent'
      })
      absNewCount = abstractList.find((item) => {
        return item.type === 'newCount'
      })
      absSevenDay = abstractList.find((item) => {
        return item.type === 'sevenDayReturn'
      })
    }
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker hideComparison dateType={dateType} {...this.ptops} onChange={this.handleDateChange} />
        <MasFilterParams hideChannel filterData={filterData} onChange={this.setDimension} />
        <Spin size='large' spinning={Global.effects['report/mobile/channelAnalysis/fetchTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>
                渠道分布
                <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.dataExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={columns} dataSource={tableData} />
            </Col>
          </Row>
        </Spin>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>
              渠道趋势对比
              <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.chartExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip>
              <MaSelect
                style={{ width: 'auto', marginBottom: 0, marginLeft: 24 }}
                type="filter"
                showName='渠道选择'
                onChange={this.changeChannel}
                {...this.state.channelSelect}
              />
            </HeaderTitle>
          </Col>
          {
            loadingTable || loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row style={{ marginTop: 60 }}>
                  <Col span={24}>
                    <Radio.Group value={type} onChange={(e) => { this.handleSizeChange(e) }}>
                      <Radio.Button value="newCount">新增用户</Radio.Button>
                      <Radio.Button value="activeCount">活跃用户</Radio.Button>
                      <Radio.Button value="startupCount">启动次数</Radio.Button>
                      <Radio.Button value="1day">次日留存率</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    {
                      chartData && chartData.length !== 0
                        ? <ReactEcharts style={{ height: 400 }} option={this.lineOptionTrend()} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/channelAnalysis/fetchAbstractList']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>数据摘要 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                活跃用户最高(活跃度|渠道)
              </Col>
              <Col span={12}>
                {absAcitve ? `${(Number(absAcitve.rate) * 100).toFixed(2)}% | ${absAcitve.channel}` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                沉默用户最多(沉默比例|渠道)
              </Col>
              <Col span={12}>
                {absSilent ? `${(Number(absSilent.rate) * 100).toFixed(2)}% | ${absSilent.channel}` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                新增用户最多(新增占比|渠道)
              </Col>
              <Col span={12}>
                {absNewCount ? `${(Number(absNewCount.rate) * 100).toFixed(2)}% | ${absNewCount.channel}` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                近7日回访率最高(回访率|渠道)
              </Col>
              <Col span={12}>
                {absSevenDay ? `${(Number(absSevenDay.rate) * 100).toFixed(2)}% | ${absSevenDay.channel}` : '暂无数据'}
              </Col>
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
