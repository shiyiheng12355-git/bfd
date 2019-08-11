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

const columnTitle = {
  newKeep: '新增用户数',
  activeKeep: '活跃用户数',
}

@connect(state => (
  {
    keepUserInfo: state['report/mobile/userAnalysis'].keepUserInfo,
    keepChartData: state['report/mobile/userAnalysis'].keepChartData,
    keepTableData: state['report/mobile/userAnalysis'].keepTableData,
    Global: state.LOADING,
    /* newUserData: state['report/mobile/userAnalysis'].newUserData,
    newUserDataOf: state['report/mobile/userAnalysis'].newUserDataOf,
    newUserTableData: state['report/mobile/userAnalysis'].newUserTableData, */
  }
))
export default class LivedUser extends Component {
  state = {
    type: 'newKeep',
    columns: [
      {
        title: '日期',
        dataIndex: 'date',
      },
      {
        title: '新增用户数',
        dataIndex: 'newCount',
      },
      {
        title: '留存率',
        children: [
          {
            title: '1日后',
            dataIndex: '1day',
            render: (item) => {
              return !item ? '--' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '2日后',
            dataIndex: '2day',
            render: (item) => {
              return !item ? '--' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '3日后',
            dataIndex: '3day',
            render: (item) => {
              return !item ? '--' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '4日后',
            dataIndex: '4day',
            render: (item) => {
              return !item ? '--' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '5日后',
            dataIndex: '5day',
            render: (item) => {
              return !item ? '-' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '6日后',
            dataIndex: '6day',
            render: (item) => {
              return !item ? '-' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '7日后',
            dataIndex: '7day',
            render: (item) => {
              return !item ? '-' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '14日后',
            dataIndex: '14day',
            render: (item) => {
              return !item ? '-' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
          {
            title: '30日后',
            dataIndex: '30day',
            render: (item) => {
              return !item ? '-' : `${(Number(item) * 100).toFixed(2)}%`
            },
          },
        ],
      },
    ],
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    detailedExplain: '新增留存：某段时间内的新增用户，经过一段时间后，仍然继续使用被认作是留存；这部分用户就是那个时间段的新增留存。<br/>活跃留存：某段时间内的活跃用户，经过一段时间后，仍然继续使用被认作是留存；这部分用户就是那个时间段的活跃留存。<br/>新增留存率：留存用户占某时段新增用户的比例。<br/>活跃留存率：留存用户占某时段活跃用户的比例。</p>',
    chartExplain: 'N日留存率：某日新增用户在新增后第N日使用过应用的用户比例。',
  }

  lineOption = (data = this.props.keepChartData) => {
    const { type } = this.state
    const { mappingType, keepUserInfo } = this.props
    const { dateType } = keepUserInfo
    const xAxisData = []
    const data1day = []
    const data7day = []
    const data14day = []
    const data30day = []
    if (data) {
      data.length !== 0 && data.forEach((item) => {
        xAxisData.push(item.date)
        for (let i in item) {
          if (i === '1day') {
            data1day.push(item[i])
          } else if (i === '7day') {
            data7day.push(item[i])
          } else if (i === '14day') {
            data14day.push(item[i])
          } else if (i === '30day') {
            data30day.push(item[i])
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
      grid: {
        left: '5%',
        top: '5%',
        right: '5%',
        bottom: '5%',
        containLabel: true,
      },
      legend: {
        bottom: 0,
        data: ['次日留存率', '7日留存率', '14日留存率', '30日留存率'],
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `用户分析_留存趋势_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '次日留存率',
          type: 'line',
          data: data1day,
        },
        {
          name: '7日留存率',
          type: 'line',
          data: data7day,
        },
        {
          name: '14日留存率',
          type: 'line',
          data: data14day,
        },
        {
          name: '30日留存率',
          type: 'line',
          data: data30day,
        },
      ],
    }
    return option
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.keepUserInfo.dateType,
      type: this.state.type,
      dimension: this.state.dimension,
    }
    this.getChartData(params)
    // this.getDataOf()
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, keepUserInfo } = nextProps
    const { dateType } = keepUserInfo
    const params = {
      appkey,
      dateType,
      type: this.state.type,
      dimension: this.state.dimension,
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
      type: 'report/mobile/userAnalysis/fetchKeepChartData',
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
      type,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchKeepDetailData',
      payload: {
        appkey,
        index: type,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, keepUserInfo } = this.props
    const { dateType } = keepUserInfo
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
        type: 'keepUserInfo',
        value: dateType,
      },
    })
    this.getChartData(params)
    this.getTableData(params)
  }

  handleCurrentChange = (currentValue) => {
    const { appkey, keepUserInfo } = this.props
    const { dateType } = keepUserInfo
    const { type } = this.state
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/setCurrentValue',
      payload: {
        type: 'keepUserInfo',
        value: currentValue,
      },
    })
    // this.getChartData(appkey, dateType, type)
    this.getTableData(appkey, dateType, type, currentValue)
  }

  handleSizeChange = (e) => {
    const value = e.target.value
    const { appkey, keepUserInfo, selectedGroupData } = this.props
    const { dateType } = keepUserInfo
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      type: value,
      dimension,
    }
    this.setState({ type: value })

    this.getChartData(params)
    this.getTableData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, keepUserInfo } = this.props
    const { dateType } = keepUserInfo;
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
    const { keepTableData } = _.cloneDeep(this.props);
    let data = keepTableData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { keepUserInfo, keepTableData, filterData, Global, keepChartData } = this.props
    const { type, columns } = this.state
    const { dateType } = keepUserInfo
    const loadingChart = Global.effects['report/mobile/userAnalysis/fetchKeepChartData']
    columns[1].title = columnTitle[type]
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.state} />
        <MasDatePicker dateType={dateType} hideList hideComparison {...this.state} onChange={this.handleDateChange} />
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Radio.Group value={this.state.type} onChange={this.handleSizeChange}>
              <Radio.Button value="newKeep">新增留存</Radio.Button>
              <Radio.Button value="activeKeep">活跃留存</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        <Row>
          <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchKeepDetailData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>
                明细数据
                <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            {/* <Col span={12} style={{ textAlign: 'right' }}>
              <MasGranularity dateType={dateType} currentValue={currentValue} onChange={this.handleCurrentChange} />
            </Col> */}
            <Col span={24}>
              <Table bordered columns={this.state.columns} dataSource={keepTableData} />
            </Col>
          </Row>
        </Spin>
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
          <Col span={24}>
            <HeaderTitle>
              留存趋势图
              <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.chartExplain }}></div>}>
                <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
              </Tooltip>
            </HeaderTitle>
          </Col>
          {
            loadingChart
              ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
              : <Col span={24}>
                {
                  keepChartData && keepChartData.length !== 0
                    ? <ReactEcharts style={{ height: 400 }} option={this.lineOption()} />
                    : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                }
                </Col>
          }
        </Row>
      </div>
    )
  }
}
