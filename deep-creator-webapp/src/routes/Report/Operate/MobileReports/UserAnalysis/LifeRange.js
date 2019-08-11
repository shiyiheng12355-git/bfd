import React, { Component } from 'react';
import { Row, Col, Table, Icon, Tooltip, Spin } from 'antd';
import { connect } from 'dva'
import { transTime } from '../../../../../utils/utils'
import { MasTitle, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    rangeData: state['report/mobile/userAnalysis'].rangeData,
    rangeDataOf: state['report/mobile/userAnalysis'].rangeDataOf,
    rangeTableData: state['report/mobile/userAnalysis'].rangeTableData,
    rangeDateType: state['report/mobile/userAnalysis'].rangeDateType,
    Global: state.LOADING,
  }
))
export default class LifeRange extends Component {
  state = {
    title: '用户生命周期',
    columns: [
      {
        title: '用户生命周期',
        dataIndex: 'lifeTime',
      },
      {
        title: '用户数',
        dataIndex: 'userCount',
      },
      {
        title: '用户占比',
        dataIndex: 'userOf',
        render: item => (
          `${(Number(item) * 100).toFixed(2)}%`
        ),
      },
      {
        title: '平均每天启动次数',
        dataIndex: 'perDayStartupTimes',
        render: item => (
          Math.ceil(item)
        ),
      },
      {
        title: '平均每次使用时间',
        dataIndex: 'perTimesUsage',
        render: item => (
          transTime(item)
        ),
      },
      {
        title: '人均贡献',
        dataIndex: 'kda',
        render: (item, record) => {
          return `${record.perCapitaStartupTimes}次启动/人 | ${transTime(record.perCapitaUsage)}使用时间/人`
        },
      },
    ],
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    titleExplain: '用户生命周期：生命周期描述的是应用自添加APPKey以来到当前时间全部用户的生命长度。通常在应用发展初期，生命周期比较短，随着市场趋于稳健增长，生命周期延长。',
    dataExplain: '人均生命周期：每个用户生命周期之和/用户数。<br/>人均生命周期贡献：人均启动次数贡献和人均使用时长贡献。',
    detailedExplain: '用户数：某生命期的用户总数。<br/>用户占比：该生命周期内的用户占总生命周期内用户的比例。<br/>平均每天启动次数：单个用户平均每天启动次数之和/该生命期内所有用户。<br/>平均单次使用时长：单次使用时长之和/启动次数。<br/>人均贡献：人均启动次数贡献和人均使用时长贡献。',
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchStartDate',
    })
    const params = {
      appkey: this.props.appkey,
      dimension: this.state.dimension,
    }
    this.getData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey } = nextProps
    const { dimension } = this.state
    const params = {
      appkey,
      dimension,
    }
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      this.getData(params)
      this.getDataOf(params)
      this.getTableData(params)
    }
  }

  getData = (params) => {
    const {
      appkey,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchChartData',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
      },
    })
  }

  getDataOf = (params) => {
    const {
      appkey,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchChartDataOf',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
      },
    })
  }

  getTableData = (params) => {
    const {
      appkey,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/userAnalysis/fetchTableData',
      payload: {
        appkey,
        dimension: JSON.stringify(dimension),
      },
    })
  }

  renderChart = (data = this.props.rangeData) => {
    const { rangeDateType } = this.props
    const colorGroup = ['#f44336', '#f9ce1d', '#cddc39', '#20b6e5', '#37474f', '#FF4A99', '#9B76CE', '#00FF7F', '#FF4500']
    let i = 0
    const xAxisData = []
    const seriesData = []
    data && data.map((item, i) => {
      xAxisData.push(item.date)
      seriesData.push(
        {
          value: (Number(item.userRate) * 100).toFixed(2),
          itemStyle: {
            normal: {
              color: colorGroup[i],
            },
          },
        }
      )
    })

    const option = {
      grid: {
        left: '5%',
        right: '5%',
        bottom: '5%',
        top: '5%',
        containLabel: true,
      },
      tooltip: {
        formatter: '{b}<br />{a}：{c}%',
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `用户分析_用户生命周期_${rangeDateType.startTime}_${rangeDateType.endTime}`,
          },
        },
        right: 20,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          type: 'bar',
          name: '用户占比',
          data: seriesData,
        },
      ],
    }
    return option
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData } = this.props
    this.setState({ dimension: val })
    const params = {
      appkey,
      dimension: val,
    }
    this.getData(params)
    this.getDataOf(params)
    this.getTableData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, rangeDateType } = this.props
    let head = {};
    columns.map((item, i) => {
       head[item.dataIndex] = item.title
    })
    const { rangeTableData } = _.cloneDeep(this.props);
    rangeTableData && rangeTableData.map((item) => {
      item.userOf = `${(Number(item.userOf) * 100).toFixed(2)}%`
      item.perTimesUsage = transTime(item.perTimesUsage)
      item.perDayStartupTimes = parseInt(item.perDayStartupTimes, 10)
      item.kda = `${item.perCapitaStartupTimes}次启动/人 | ${transTime(item.perCapitaUsage)}使用时间/人`
    })
    let data = rangeTableData
    let fileName = `${title}明细数据(${rangeDateType.startTime}至${rangeDateType.endTime})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { rangeTableData, rangeDataOf, rangeDateType, Global, filterData, rangeData } = this.props
    const { dataExplain } = this.state
    let { head, data, fileName } = this.downLoad()
    const loadingChart = Global.effects['report/mobile/userAnalysis/fetchChartData']
    return (
      <div>
        <MasTitle {...this.props} dateType={rangeDateType} />
        <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8 }}>
          <Col span={24}>
            <HeaderTitle>用户生命周期 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.titleExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
            {
              loadingChart
                ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin size='large' /></div>
                : <div>
                    {
                      rangeData && rangeData.length !== 0
                      ? <ReactEcharts notMerge style={{ height: 400 }} option={this.renderChart()} />
                      : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                    }
                  </div>
            }
          </Col>
        </Row>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchChartDataOf']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, marginTop: 16, padding: 8 }}>
            <Col span={24}>
              <HeaderTitle>数据摘要 <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.dataExplain }}></div>}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></HeaderTitle>
            </Col>
            <Col span={12} style={{ padding: 8 }}>
              <Col span={12}>
                人均生命周期
              </Col>
              <Col span={12}>
                {rangeDataOf.perCapitaLifeCycle || rangeDataOf.perCapitaLifeCycle === 0 ? `${Number(rangeDataOf.perCapitaLifeCycle).toFixed(2)}天` : '暂无数据'}
              </Col>
            </Col>
            <Col span={12} style={{ padding: 8 }}>
              <Col span={12}>
                人均生命周期贡献
              </Col>
              <Col span={12}>
                {rangeDataOf.perCapitaLifeCycle || rangeDataOf.perCapitaLifeCycle === 0 ? `${Number(rangeDataOf.perCapitaStartupTimes).toFixed(2)}次启动/人|${transTime(rangeDataOf.perCapitaUsage)}使用时间/人` : '暂无数据'}
              </Col>
            </Col>
          </Row>
        </Spin>
        <Spin size='large' spinning={Global.effects['report/mobile/userAnalysis/fetchTableData']}>
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
              <Table columns={this.state.columns} dataSource={rangeTableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
