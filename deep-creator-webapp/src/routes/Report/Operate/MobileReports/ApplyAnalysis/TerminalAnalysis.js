import React, { Component } from 'react';
import { Row, Col, Radio, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasGranularity, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

const titleName = {
  model: '终端型号',
  osversion: '操作系统',
  resolution: '分辨率',
}

const sortData = (a, b) => {
  return b.num - a.num
}

@connect(state => (
  {
    dateType: state['report/mobile/terminalAnalysis'].dateType,
    chartData: state['report/mobile/terminalAnalysis'].chartData,
    chartComData: state['report/mobile/terminalAnalysis'].chartComData,
    abstractList: state['report/mobile/terminalAnalysis'].abstractList,
    tableData: state['report/mobile/terminalAnalysis'].tableData,
    Global: state.LOADING,
  }
))

export default class TerminalAnalysis extends Component {
  state = {
    comparison: false,
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    type: 'newCount',
    terminal: 'model',
    columns: [
      {
        title: '终端型号',
        dataIndex: 'name',
      },
      {
        title: '新增用户',
        dataIndex: 'newCount',
      },
      {
        title: '新增用户占比',
        dataIndex: 'newCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
      {
        title: '活跃用户',
        dataIndex: 'activeCount',
      },
      {
        title: '活跃用户占比',
        dataIndex: 'activeCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
      {
        title: '启动次数',
        dataIndex: 'startupCount',
      },
      {
        title: '启动次数占比',
        dataIndex: 'startupCountRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
    ],
    detailedExplain: '新增用户： 该型号下首次启动应用的用户。<br/>新增用户占比： 该型号的新增用户/所有型号的新增用户之和。<br/>活跃用户： 在该型号下启动过应用的用户。<br/>活跃用户占比： 该型号的活跃用户/所有型号的活跃用户之和。<br/>启动次数： 该型号下用户启动次数之和。<br/>启动次数占比： 该型号的用户启动次数之和/所有型号的用户启动次数之和。 ',

  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      type: this.state.type,
      terminal: this.state.terminal,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
      comparison: this.state.comparison,
    }
    this.getChartData(params)
    this.getTableData(params)
    this.getDataOf(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps
    const { includePreGroupConditionJson } = selectedGroupData
    const { type, terminal, dimension, comparison } = this.state
    const params = {
      appkey,
      dateType,
      type,
      terminal,
      includePreGroupConditionJson,
      dimension,
      comparison,
    }
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      this.getChartData(params)
      this.getTableData(params)
      this.getDataOf(params)
    }
  }

  getChartData = (params) => {
    const {
      appkey,
      dateType,
      type,
      terminal,
      includePreGroupConditionJson,
      dimension,
      comparison,
    } = params
    this.props.dispatch({
      type: 'report/mobile/terminalAnalysis/fetchChartData',
      payload: {
        params: {
          appkey,
          prevGroupExpression: includePreGroupConditionJson,
          index: type,
          startDateStr: getDateFormat(dateType).startDateStr,
          endDateStr: getDateFormat(dateType).endDateStr,
          dimension: JSON.stringify(dimension),
        },
        comparison,
        terminal,
      },

    })
  }

  getDataOf = (params) => {
    const {
      appkey,
      dateType,
      type,
      includePreGroupConditionJson,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/terminalAnalysis/fetchAbstractList',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
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
      terminal,
      includePreGroupConditionJson,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/terminalAnalysis/fetchTableData',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        index: terminal,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        dimension: JSON.stringify(dimension),
      },
    })
  }

  lineOption = (data = this.props.chartData, ComLinedata = this.props.chartComData) => {
    const { comparison, type, terminal } = this.state
    const { mappingType, dateType } = this.props
    const axisData = []
    const seriesData = []
    const comparisonData = []
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
      toolbox: {
        feature: {
          saveAsImage: {
            name: `使用分析_${titleName[terminal]}_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {
        bottom: 0,
        data: [],
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: [],
        inverse: true,
      },
      series: [],
    }
    if (data && data.length > 10) {
      const delIndex = data.findIndex((item) => {
        return item.name === '未知'
      })
      data.splice(delIndex, 1)
      data.sort(sortData).map((item, i) => {
        if (i < 10) {
          axisData.push(item.name)
          seriesData.push(item.num)
        }
      })
    } else {
      data && data.sort(sortData).map((item) => {
        axisData.push(item.name)
        seriesData.push(item.num)
      })
    }
    if (ComLinedata && ComLinedata.length !== 0) {
      ComLinedata.map((item, i) => {
        const index = axisData.findIndex((x) => {
          return x === item.location
        })
        comparisonData[index] = item.num
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
        name: mappingType[type],
        type: 'bar',
        data: seriesData,
      }
      option.legend.data = [mappingType[type]]
    } else {
      option.series[0] = {
        name: mappingType[type],
        type: 'bar',
        data: seriesData,
      }
      option.series[1] = {
        name: `${mappingType[type]}对比`,
        type: 'bar',
        data: comparisonData,
      }
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
    const params = {
      appkey: this.props.appkey,
      dateType,
      type: this.state.type,
      terminal: this.state.terminal,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
      comparison: true,
    }
    this.setState({ comparison: true })
    this.getChartData(params)
  }

  handleSizeChange = (e, typess) => {
    const value = e.target.value
    if (typess === 'terminal') {
      const params = {
        appkey: this.props.appkey,
        dateType: this.props.dateType,
        type: this.state.type,
        terminal: value,
        includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
        dimension: this.state.dimension,
        comparison: false,
      }

      this.setState({ terminal: value, comparison: false })
      this.getChartData(params)
      this.getTableData(params)
    } else {
      const params = {
        appkey: this.props.appkey,
        dateType: this.props.dateType,
        type: value,
        terminal: this.state.terminal,
        includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
        dimension: this.state.dimension,
        comparison: false,
      }

      this.setState({ type: value, comparison: false })
      this.getChartData(params)
    }
  }

  handleDateChange = (val) => {
    this.props.dispatch({
      type: 'report/mobile/terminalAnalysis/setDateType',
      payload: val,
    })

    const params = {
      appkey: this.props.appkey,
      dateType: val,
      type: this.state.type,
      terminal: this.state.terminal,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
      comparison: this.state.comparison,
    }
    this.setState({ comparison: false })
    this.getChartData(params)
    this.getTableData(params)
    this.getDataOf(params)
  }

  setDimension = (val) => {
    const params = {
      appkey: this.props.appkey,
      dateType: val,
      type: this.state.type,
      terminal: this.state.terminal,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: val,
      comparison: true,
    }

    this.setState({ dimension: val, comparison: false })
    this.getChartData(params)
    this.getTableData(params)
    this.getDataOf(params)
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
      item.newCountRate = `${(Number(item.newCountRate) * 100).toFixed(2)}%`
      item.activeCountRate = `${(Number(item.activeCountRate) * 100).toFixed(2)}%`
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
    const { tableData, filterData, Global, abstractList, chartData } = this.props
    const { type, terminal, columns } = this.state
    const loadingChart = Global.effects['report/mobile/terminalAnalysis/fetchChartData']
    columns[0].title = titleName[terminal]
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker {...this.props} onChange={this.handleDateChange} onComparisonChange={this.onComparisonChange} onComparison={this.onComparison} />
        <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        {
          loadingChart
            ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
            : <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
                <Col span={24}>
                  <HeaderTitle>
                    <Radio.Group value={terminal} onChange={(e) => { this.handleSizeChange(e, 'terminal') }}>
                      <Radio.Button value="model">终端型号</Radio.Button>
                      <Radio.Button value="osversion">操作系统</Radio.Button>
                      <Radio.Button value="resolution">分辨率</Radio.Button>
                    </Radio.Group>
                  </HeaderTitle>
                </Col>
                <Col span={24}>
                  <Radio.Group value={type} onChange={(e) => { this.handleSizeChange(e, 'type') }}>
                    <Radio.Button value="newCount">新增用户</Radio.Button>
                    <Radio.Button value="activeCount">活跃用户</Radio.Button>
                    <Radio.Button value="startupCount">启动次数</Radio.Button>
                  </Radio.Group>
                </Col>
                <Col span={24}>
                  {
                    chartData && chartData.length !== 0
                      ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption()} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  }
                </Col>
              </Row>
        }
        <Spin size='large' spinning={Global.effects['report/mobile/terminalAnalysis/fetchAbstractList']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>数据摘要</HeaderTitle>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
               最热品牌
              </Col>
              <Col span={12}>
                {abstractList && abstractList.brand ? abstractList.brand : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                最热操作系统
              </Col>
              <Col span={12}>
                {abstractList && abstractList.osversion ? abstractList.osversion : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                最热型号
              </Col>
              <Col span={12}>
                {abstractList && abstractList.model ? abstractList.model : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 16 }}>
              <Col span={12}>
                最热分辨率
              </Col>
              <Col span={12}>
                {abstractList && abstractList.resolution ? abstractList.resolution : '暂无数据'}
              </Col>
            </Col>
          </Row>
        </Spin>
        <Spin size='large' spinning={Global.effects['report/mobile/terminalAnalysis/fetchTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
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
              <Table columns={columns} dataSource={tableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
