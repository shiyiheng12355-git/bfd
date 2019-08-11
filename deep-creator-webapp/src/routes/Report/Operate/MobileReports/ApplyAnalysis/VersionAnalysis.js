import React, { Component } from 'react';
import { Row, Col, Radio, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat } from '../../../../../utils/utils'
import MaSelect from '../../../../../components/MaSelect'
import { MasTitle, MasDatePicker, MasGranularity, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    dateType: state['report/mobile/versionAnalysis'].dateType,
    tableData: state['report/mobile/versionAnalysis'].tableData,
    chartData: state['report/mobile/versionAnalysis'].chartData,
    versionData: state['report/mobile/versionAnalysis'].versionData,
    abstractList: state['report/mobile/versionAnalysis'].abstractList,
    Global: state.LOADING,
  }
))

export default class VersionAnalysis extends Component {
  state = {
    type: 'newCount',
    version: [],
    versionSelect: {},
    dimension: {
      province: [],
      channel: [],
    },
    columns: [
      {
        title: '版本号',
        dataIndex: 'version',
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
        title: '升级用户（占比）',
        dataIndex: 'upgradeCount',
        render: (text, record) => (
          `${record.upgradeCount}(${(Number(record.upgradeCountRate) * 100).toFixed(2)}%)`
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
    dataExplain: '<span>新增用户： 该版本下首次启动应用的用户。<br/>新增用户占比： 该版本下新增用户/所有版本下的新增用户之和。<br/>活跃用户： 在该版本下启动过应用的用户。<br/>活跃用户占比： 该版本下的活跃用户/所有版本下的活跃用户。<br/>升级用户： 某日升级到此版本的老用户。<br/>升级用户占比： 该版本下的升级用户/所有版本下的升级用户之和。<br/>启动次数： 该版本下用户启动次数之和。<br/>启动次数占比： 该版本下的用户启动次数之和/所有版本下的用户启动次数之和。 ',
    chartExplain: '<span>新增用户： 第一次启动应用的用户。<br/>活跃用户： 启动过应用的用户(去重)，启动过一次的用户即被视为活跃用户，包括新用户和老用户。<br/>升级用户： 某日升级到此版本的老用户。<br/>启动次数： 打开应用视为启动,退往后台超过30S或者完全退出视为启动结束。 ',
    detailedExplain: '<span>活跃度： 某版本活跃用户/某版本的累计用户。<br/>7日留存率： 某版本7日留存用户/某版本时段新增用户。 ',
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
      // this.getChartData(appkey, dateType, this.state.type, selectedGroupData.includePreGroupConditionJson)
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
      version,
    } = params
    this.props.dispatch({
      type: 'report/mobile/versionAnalysis/fetchChartData',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        index: type,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        dimension: JSON.stringify(dimension),
        version: version.join(','),
      },

    })
  }
  getTableData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      type,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/versionAnalysis/fetchTableData',
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
      callback: (versionData) => {
        this.setState({ version: versionData.slice(0, 5) })
        params.version = versionData.slice(0, 5)
        this.getChartData(params)
        this.versionSelect(versionData)
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
      type: 'report/mobile/versionAnalysis/fetchAbstractList',
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
          legendData.push(item.appversion)
          seriesData.push({
            name: item.appversion,
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
        bottom: '5% ',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `使用分析_版本趋势对比_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
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
    const { dimension, version } = this.state
    this.setState({ type: value })
    const params = {
      appkey,
      dateType,
      type: value,
      includePreGroupConditionJson,
      dimension,
      version,
    }
    // this.getChartData(params)
    this.getTableData(params)
  }
  handleDateChange = (dateType) => {
    this.props.dispatch({
      type: 'report/mobile/versionAnalysis/setDateType',
      payload: dateType,
    })
    const { appkey, selectedGroupData } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension, version, type } = this.state
    const params = {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension,
      version,
    }
    // this.getChartData(params)
    this.getTableData(params)
    this.getAbstractList(params)
  }
  setDimension = (val) => {
    const { appkey, selectedGroupData, dateType } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { version, type } = this.state
    const params = {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension: val,
      version,
    }
    this.setState({ dimension: val })
    // this.getChartData(params)
    this.getTableData(params)
    this.getAbstractList(params)
  }

  changeVersion = (val) => {
    const { checked } = val

    const { appkey, selectedGroupData, dateType } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { type, dimension, versionSelect } = this.state
    const params = {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension,
      version: checked,
    }
    versionSelect.value = checked
    this.setState({ version: checked, versionSelect })
    this.getChartData(params)
  }

  versionSelect = (versionData) => {
    const { versionSelect } = this.state
    versionSelect.limit = 5
    versionSelect.value = versionData.slice(0, versionSelect.limit)
    const checkData = []
    versionData.map((item) => {
      checkData.push({
        label: item,
        value: item,
      })
    })
    versionSelect.checkGroup = [{ label: '版本选择', checkData }]
    this.setState({ versionSelect })
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
      item.upgradeCount = `${item.upgradeCount}(${(Number(item.upgradeCount) * 100).toFixed(2)}%)`
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
    const { tableData, abstractList, filterData, versionData, Global, chartData } = this.props
    const { versionSelect } = this.state
    const loadingTable = Global.effects['report/mobile/versionAnalysis/fetchTableData']
    const loadingChart = Global.effects['report/mobile/versionAnalysis/fetchChartData']
    let absAcitve = null
    let absSevenDay = null
    if (abstractList && abstractList.length !== 0) {
      absAcitve = abstractList.find((item) => {
        return item.type === 'active'
      })
      absSevenDay = abstractList.find((item) => {
        return item.type === 'sevenDayReturn'
      })
    }
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker hideComparison {...this.props} onChange={this.handleDateChange} />
        <MasFilterParams hideAppversion filterData={filterData} onChange={this.setDimension} />
        <Spin size='large' spinning={Global.effects['report/mobile/versionAnalysis/fetchTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>
                版本分布
                <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.dataExplain }}></div>}>
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
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>
              版本趋势对比
              <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.chartExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip>
              <MaSelect
                style={{ width: 'auto', marginBottom: 0, marginLeft: 24 }}
                type="filter"
                showName='版本选择'
                onChange={this.changeVersion}
                {...this.state.versionSelect}
              />
            </HeaderTitle>
          </Col>
          {
            loadingTable || loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row style={{ marginTop: 60 }}>
                  <Col span={24}>
                    <Radio.Group value={this.state.type} onChange={(e) => { this.handleSizeChange(e) }}>
                      <Radio.Button value="newCount">新增用户</Radio.Button>
                      <Radio.Button value="activeCount">活跃用户</Radio.Button>
                      <Radio.Button value="upgradeCount">升级用户</Radio.Button>
                      <Radio.Button value="startupCount">启动次数</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    {
                      chartData && chartData.length !== 0
                        ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOptionTrend()} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/versionAnalysis/fetchAbstractList']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>数据摘要 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                活跃度最高(活跃度|版本号)
              </Col>
              <Col span={12}>
                {absAcitve ? `${(Number(absAcitve.rate) * 100).toFixed(2)}% | ${absAcitve.version}` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                7日留存率最高(留存率|版本号)
              </Col>
              <Col span={12}>
                {absSevenDay ? `${(Number(absSevenDay.rate) * 100).toFixed(2)}% | ${absSevenDay.version}` : '暂无数据'}
              </Col>
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
