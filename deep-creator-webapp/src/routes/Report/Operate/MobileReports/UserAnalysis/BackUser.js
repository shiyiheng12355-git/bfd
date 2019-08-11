import React, { Component } from 'react';
import { Row, Col, Radio, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import { getDateFormat } from '../../../../../utils/utils'
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    returnUserInfo: state['report/mobile/userAnalysis'].returnUserInfo,
    returnUserData: state['report/mobile/userAnalysis'].returnUserData,
    returnUserTableData: state['report/mobile/userAnalysis'].returnUserTableData,
    Global: state.LOADING,
  }
))
export default class LostUser extends Component {
  state = {
    type: 'returnCount',
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    columns1: [
      {
        title: '月份',
        dataIndex: 'range',
      },
      {
        title: '7日回访用户比例',
        dataIndex: 'count',
      },
      {
        title: '7日回访率',
        dataIndex: 'percent',
      },
    ],
    columns: [
      {
        title: '日期',
        dataIndex: 'dateTime',
      },
      {
        title: '新增用户',
        dataIndex: 'newCount',
      },
      {
        title: '7日回访用户',
        dataIndex: 'returnCount',
      },
      {
        title: '7日回访率',
        dataIndex: 'returnRate',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
    ],
    chartExplain: '7日回访用户： 某日的新增用户中，在最近7日中还有使用的用户数。</br>7日回访率： 某日新增用户中的7日回访用户数/该日的新增用户。 ',
    dataExplain: '最近12个月中，每月的近7日回访用户比例。。 ',
    detailedExplain: '新增用户： 当天第一次启动应用的用户。</br>7日回访用户： 当天的新增用户中，在最近7日中还有使用的用户数。</br>7日回访率： 7日回访用户/新增用户。 ',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.returnUserInfo.dateType,
      type: this.state.type,
      dimension: this.state.dimension,
    }
    this.getChartData(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, returnUserInfo } = nextProps
    const { dateType } = returnUserInfo
    const { type, dimension } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
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
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchReturnUserData',
      payload: {
        appkey,
        index: type,
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
      type: 'report/mobile/userAnalysis/fetchReturnUserTableData',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  lineOption = (data = this.props.returnUserData) => {
    const { type } = this.state
    const { mappingType, returnUserInfo } = this.props
    const { dateType } = returnUserInfo
    const xAxisData = []
    const returnData = []
    const newData = []
    const seriesData = []
    if (data) {
      data.length !== 0 && data.forEach((item) => {
        xAxisData.push(item.dateTime)
        if (type === 'returnCount') {
          returnData.push(item.returnCount)
          newData.push(item.newCount)
        } else {
          seriesData.push((Number(item.num) * 100).toFixed(2))
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
        data: [],
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
            name: `用户分析_回访用户分析_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      yAxis: {
        type: 'value',
      },
      series: [],

    }
    if (type === 'returnCount') {
      option.legend.data = ['新增用户数', '7日回访用户数']
      option.series = [
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
          name: '7日回访用户数',
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: returnData,
        },
      ]
    } else {
      option.legend.data = ['7日回访率']
      option.tooltip.formatter = '{b}<br />{a}：{c}%'
      option.series = [
        {
          name: '7日回访率',
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: seriesData,
        },
      ]
    }

    return option
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, returnUserInfo } = this.props
    const { dateType } = returnUserInfo
    const { type } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension: val,
    }
    this.setState({ dimension: val })
    this.getChartData(params)
    this.getTableData(params)
  }

  handleDateChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { type, dimension } = this.state
    const params = {
      appkey,
      dateType,
      type,
      dimension,
    }
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setDateType',
      payload: {
        type: 'returnUserInfo',
        value: dateType,
      },
    })
    this.getChartData(params)
    this.getTableData(params)
  }

  handleSizeChange = (e) => {
    const value = e.target.value
    const { appkey, selectedGroupData, returnUserInfo } = this.props
    const { dateType } = returnUserInfo
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      type: value,
      dimension,
    }
    this.setState({ type: value })
    this.getChartData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, returnUserInfo } = this.props
    const { dateType } = returnUserInfo;
    let head = {};
    columns.map((item, i) => {
      head[item.dataIndex] = item.title
    })
    const { returnUserTableData } = _.cloneDeep(this.props);
    returnUserTableData && returnUserTableData.map((item) => {
      item.returnRate = `${(Number(item.returnRate) * 100).toFixed(2)}%`
    })
    let data = returnUserTableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { type, columns } = this.state
    const { returnUserInfo, returnUserTableData, filterData, Global, returnUserData } = this.props
    const { dateType } = returnUserInfo
    const loadingChart = Global.effects['report/mobile/userAnalysis/fetchReturnUserData']
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker hideList hideComparison {...this.props} dateType={dateType} onChange={this.handleDateChange} />
        <MasFilterParams style={{ margin: '16px 0' }} filterData={filterData} onChange={this.setDimension} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>回访用户分析 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.chartExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Row>
                  <Col span={24}>
                    <Radio.Group value={type} onChange={this.handleSizeChange}>
                      <Radio.Button value="returnCount">7日回访用户</Radio.Button>
                      <Radio.Button value="returnRate">7日回访率</Radio.Button>
                    </Radio.Group>
                  </Col>
                  <Col span={24}>
                    {
                      returnUserData && returnUserData.length !== 0
                        ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption()} />
                        : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </Col>
                </Row>
          }
        </Row>
        {/* <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>回访用户月分布</HeaderTitle>
          </Col>
          <Col span={24}>
            <Table columns={columns1} dataSource={this.state.tableData} />
          </Col>
        </Row> */}
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchReturnUserTableData']}>
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
              <Table columns={columns} dataSource={returnUserTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
