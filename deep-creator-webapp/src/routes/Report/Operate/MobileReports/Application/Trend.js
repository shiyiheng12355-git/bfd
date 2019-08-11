import React, { Component } from 'react';
import { Row, Col, Button, Radio, Table, Spin, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat } from '../../../../../utils/utils'
import { MasHeader } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => (
  {
    dataList: state['report/mobile/trend'].dataList,
    dateType: state['report/mobile/trend'].dateType,
    chartData: state['report/mobile/trend'].chartData,
    Global: state.LOADING,
  }
))
export default class Trend extends Component {
  state = {
    type: 'newCount',
    titleExplain: '新增用户： 第一次启动应用的用户。<br/>活跃用户： 启动过应用的用户(去重)，启动过一次的用户即被视为活跃用户，包括新用户和老用户。<br/>DAU/MAU： DAU即日活跃用户数，MAU即月活跃用户数（排重）。DAU/MAU是社交游戏类和在线类应用常用的一项评估指标，用于分析用户粘度。比值一般在0.03到1之间。比值越趋近于1表明用户活跃度越高。行业中也常用DAU/MAU乘以30来计算每月用户平均活跃天数。<br/>流失用户： 距离上一次使用，大于等于7天没有使用过应用的用户，将被视为流失。<br/>回流用户： 流失用户在某日再次使用应用，将视为当日的一个回流。<br/>启动次数： 打开应用视为启动,退往后台超过30S或者完全退出视为启动结束。<br/>人均启动次数： 启动次数/启动人数。<br/>平均单次使用时长： 平均每次启动应用的使用时长。 ',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      type: this.state.type,
    }
    this.getChartData(params)
    this.getDataList(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps
    const params = {
      appkey,
      dateType: dateType || this.props.dateType,
      type: this.state.type,
    }
    if (appkey !== this.props.appkey) {
      this.getDataList(params)
      this.getChartData(params)
    }
  }

  lineOption = (data = this.props.chartData) => {
    const { type } = this.state
    const { mappingType, dateType } = this.props
    const xAxisData = []
    const seriesData = []
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
      toolbox: {
        feature: {
          saveAsImage: {
            name: `应用概况_数据趋势_${mappingType[type]}_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {
        bottom: 0,
        data: [mappingType[type]],
      },
      grid: {
        left: '5%',
        top: '5%',
        right: '5%',
        bottom: '5%',
        containLabel: true,
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

  getChartData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      type,
    } = params

    this.props.dispatch({
      type: 'report/mobile/trend/fetchTrendChart',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        index: type,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }


  getDataList = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
    } = params

    this.props.dispatch({
      type: 'report/mobile/trend/fetchApplicationList',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  handleDateChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { type } = this.state
    const params = {
      appkey,
      dateType,
      type,
    }

    this.props.dispatch({
      type: 'report/mobile/trend/setDateType',
      payload: dateType,
    })

    this.getDataList(params)
    this.getChartData(params)
  }

  handleParamChange = (e) => {
    const type = e.target.value
    const { appkey, selectedGroupData, dateType } = this.props
    const params = {
      appkey,
      dateType,
      type,
    }
    this.setState({ type })
    this.getChartData(params)
  }

  render() {
    const { type } = this.state
    const { Global, chartData } = this.props
    return (
      <div>
        <Spin size="large" spinning={Global.effects['report/mobile/trend/fetchApplicationList'] || Global.effects['report/mobile/trend/fetchTrendChart']}>
          <MasHeader {...this.props} onChange={this.handleDateChange} hideRange hideComparison />
          <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
            <Col span={24}>
              <HeaderTitle>数据趋势</HeaderTitle>
            </Col>
            <Col span={24} style={{ marginTop: 16 }}>
              <Radio.Group value={type} onChange={this.handleParamChange}>
                <Radio.Button value="newCount">新增用户</Radio.Button>
                <Radio.Button value="activeCount">活跃用户</Radio.Button>
                <Radio.Button value="dauAndMau">DAU/MAU</Radio.Button>
                <Radio.Button value="wastageCount">流失用户</Radio.Button>
                <Radio.Button value="backflowCount">回流用户</Radio.Button>
                <Radio.Button value="startupCount">启动次数</Radio.Button>
                <Radio.Button value="startupPerUser">人均启动次数</Radio.Button>
                <Radio.Button value="avgTimePerStartup">平均单次使用时长</Radio.Button>
              </Radio.Group>
            </Col>
            <Col span={24}>
              {
                !chartData || chartData.length === 0
                  ? <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                  : <ReactEcharts style={{ height: 400 }} option={this.lineOption()} />
              }

            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
