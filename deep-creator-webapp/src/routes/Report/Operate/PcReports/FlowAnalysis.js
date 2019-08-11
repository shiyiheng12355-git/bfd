import React, { Component } from 'react';
import { Row, Col, Spin, Button, Table } from 'antd';
import { connect } from 'dva';
import { MasHeader, MasGranularity } from '../../../../components/MasHeader';
import HeaderTitle from '../../../../components/HeaderTitle';
import MaSelect from '../../../../components/MaSelect';
import { formatNumber, getDateFormat, formatCurrentValue, transTime } from '../../../../utils/utils'
import ReactEcharts from 'echarts-for-react';
import DownLoadBtn from '../../../../components/DownLoadBtn';
import nodata from '../../../../assets/imgs/nodata.jpg'

const hash = {
  newvisitorRate: '新访客占比',
  newvisitor: '新访客数',
  dateTime:'时间',
  pvCount: '浏览量（PV）',
  uvCount: '访客数（UV）',
  avgVisitorTime: '平均访问时长',
  bounceRate: '跳出率',
  sessionCount: '访问次数',
  avgAccessPage: '平均访问页数',
}
@connect(state => ({
  flowanalysis: state['report/flowanalysis'],
  Global: state.LOADING,
}))
export default class FlowAnalysis extends Component {
  state = {
    title: '流量分析',
    visible: false,
    dateType: 'today',
    type: false,
    contrastDay: false,
    granularity: 'hour',
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
        render: (item, row, i) => {
          return i + 1
        },
      },
      {
        title: '时间',
        dataIndex: 'dateTime',
        render: (item) => {
          return item
        },
      },
      {
        title: '浏览量（PV）',
        dataIndex: 'pvCount',
      },
      {
        title: '访客数（UV）',
        dataIndex: 'uvCount',
      },
      {
        title: '访问次数',
        dataIndex: 'sessionCount',
      },
      {
        title: '新访客数',
        dataIndex: 'newvisitor',
      },
      {
        title: '新访客占比',
        dataIndex: 'newvisitorRate',
      },
    ],
    selects: {
      label: '指标',
      value: ['pvCount'],
      limit: 2,
      checkGroup: [
        {
          label: '网站基础指标',
          checkData: [
            {
              label: '浏览量（PV）',
              value: 'pvCount',
            },
            {
              label: '访客数（UV）',
              value: 'uvCount',
            },
            {
              label: '访问次数',
              value: 'sessionCount',
            },
            {
              label: '新访客数',
              value: 'newvisitor',
            },
            {
              label: '新访客占比',
              value: 'newvisitorRate',
            },
          ],
        },
        {
          label: '流量质量指标',
          checkData: [
            {
              label: '跳出率',
              value: 'bounceRate',
            },
            {
              label: '平均访问时长',
              value: 'avgVisitorTime',
            },
            {
              label: '平均访问页数',
              value: 'avgAccessPage',
            },
          ],
        },
      ],
    },
    selectTable: {
      value: ['pvCount', 'uvCount', 'sessionCount', 'newvisitor', 'newvisitorRate'],
      limit: 6,
      checkGroup: [
        {
          label: '网站基础指标',
          checkData: [
            {
              label: '浏览量（PV）',
              value: 'pvCount',
            },
            {
              label: '访客数（UV）',
              value: 'uvCount',
            },
            {
              label: '访问次数',
              value: 'sessionCount',
            },
            {
              label: '新访客数',
              value: 'newvisitor',
            },
            {
              label: '新访客占比',
              value: 'newvisitorRate',
            },
          ],
        },
        {
          label: '流量质量指标',
          checkData: [
            {
              label: '跳出率',
              value: 'bounceRate',
            },
            {
              label: '平均访问时长',
              value: 'avgVisitorTime',
            },
            {
              label: '平均访问页数',
              value: 'avgAccessPage',
            },
          ],
        },
      ],
    },
  }
  getColumns = (selectTable) => {
    selectTable = selectTable || this.state.selectTable;
    let columns = [
      {
        title: '序号',
        dataIndex: 'index',
        render: (item, row, i) => {
          return i + 1
        },
      },
      {
        title: '时间',
        dataIndex: 'dateTime',
        render: (item) => {
          return item
        },
      },
    ];
    selectTable.value.map((item) => {
      if(item == 'avgVisitorTime'){
        columns.push({
          title: hash[item],
          dataIndex: item,
          render: (item) => {
            return transTime(item) || 0
          },
        })
      }else if(item == 'bounceRate'||item == 'newvisitorRate'){
        columns.push({
          title: hash[item],
          dataIndex: item,
          render: (ite) => {
            return `${((ite||0)*100).toFixed(2)}%`
          },
        })
      }else{
        columns.push({
          title: hash[item],
          dataIndex: item,
          render: (item) => {
            return formatNumber(item || 0)
          },
        })
      }
    })
    this.setState({
      columns,
      selectTable,
    })
  }
  /**
   * 生成图表配置
   */
  lineOption = () => {
    const { flowanalysis } = this.props;
    const { lineData, contrastData } = flowanalysis;
    const { selects,dateType } = this.state;
    const arr = []
    selects.value.map((item) => {
      arr.push({
        name: hash[item],
        type: 'line',
        areaStyle: {
          normal: {

          },
        },
        data: lineData[item] || [],
      })
      if (contrastData) {
        arr.push({
          name: `${hash[item]}对比`,
          type: 'line',
          areaStyle: {
            normal: {

            },
          },
          data: contrastData[item] || [],
        })
      }
    })
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let text = ''
          params.map((item) => {
            text += `${item.axisValue}<br />${item.seriesName}：${item.seriesName=='平均访问时长'?transTime(item.data*1):(item.seriesName=='跳出率'?(item.data*100+'%'):item.data)}<br />`
          })
          return text
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: lineData.dateTime,
        axisLine: {
          onZero: true,
        },
      },
      toolbox:{
        show:true,
        feature:{
          saveAsImage:{
            type:'png',
            name: `流量分析_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`
          
          }
        },
        right:20
      },
      grid: {
        containLabel: true,
      },
      yAxis: {
        type: 'value',
      },
      series: arr,
    }
    return option
  }
  componentWillReceiveProps=(nextProps) => {
    const {selectedGroupData,appkey} = nextProps;
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id 
      || appkey !== this.props.appkey){
      const { dateType,granularity } = this.state;
      this.updateViewData({
        endDate: getDateFormat(dateType).endDateStr,
        startDate: getDateFormat(dateType).startDateStr,
        granularity: granularity,
        appkey: appkey
      })
    }
  }
  componentDidMount() {
    // console.log(this.props)
    this.props.dispatch({
      type: 'report/flowanalysis/fetchQueryPcWebsiteTrafficTrend',
      payload: {
        appkey: this.props.appkey,
        endDate: getDateFormat("'today'").endDateStr,
        granularity: 'hour',
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        startDate: getDateFormat("'today'").startDateStr,
      },
      callback: () => {
        const { selects } = this.state
        this.props.dispatch({
          type: 'report/flowanalysis/getLineView',
          payload: selects.value,
        })
      },
    })
    this.props.dispatch({
      type: 'report/flowanalysis/fetchQueryPcWebsiteTrend',
      payload: {
        appkey: this.props.appkey,
        endDate: getDateFormat("'today'").endDateStr,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        startDate: getDateFormat("'today'").startDateStr,
      },
    })
    this.getColumns()
  }
  /**
   * 更新折线图数据
   */
  updateViewData = (date) => {
    const { type } = this.state;
    this.props.dispatch({
      type: 'report/flowanalysis/fetchQueryPcWebsiteTrafficTrend',
      payload: {
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        ...date,
        appkey: date.appkey || this.props.appkey,
      },
      callback: () => {
        const { selects } = this.state
        this.props.dispatch({
          type: 'report/flowanalysis/getLineView',
          payload: selects.value,
        })
      },
    })
    if (type) {
      const { contrastDay, granularity } = this.state;
      this.props.dispatch({
        type: 'report/flowanalysis/fetchQueryPcWebsiteTrafficTrend',
        payload: {
          appkey: this.props.appkey,
          prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
          endDate: getDateFormat(contrastDay).endDateStr,
          startDate: getDateFormat(contrastDay).startDateStr,
          granularity: date.granularity,
        },
        callback: () => {
          const { selects } = this.state
          this.props.dispatch({
            type: 'report/flowanalysis/getLineView',
            payload: selects.value,
            contrast: type,
          })
        },
      })
    }
    delete date.granularity
    this.props.dispatch({
      type: 'report/flowanalysis/fetchQueryPcWebsiteTrend',
      payload: {
        appkey: this.props.appkey,
        ...date,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
      },
    })
  }
  /**
   * 折线图条件变化
   */
  selectChange = (props) => {
    const { selects } = this.state
    selects.value = props.checked
    this.props.dispatch({
      type: 'report/flowanalysis/getLineView',
      payload: props.checked,
    })
    this.setState({ selects })
  }
  handleCurrentChange = (val) => {
    const { dateType } = this.state;
    this.setState({ granularity: val })
    this.updateViewData({
      endDate: getDateFormat(dateType).endDateStr,
      startDate: getDateFormat(dateType).startDateStr,
      granularity: val,
    })
  }
  // 下载参数处理
  downLoad = () => {
    const { columns, dateType } = this.state;
    let head = {};
    columns.map((item, i) => {
      if (i != 0) {
        head[item.dataIndex] = item.title
      }
    })
    const { flowanalysis } = this.props;
    const {
      queryPcWebsiteTrafficTrend,
    } = flowanalysis
    let data = queryPcWebsiteTrafficTrend.map(item=>{
      let b = {...item};
      b['avgVisitorTime'] = b['avgVisitorTime']?transTime(b['avgVisitorTime']):"";
      b['bounceRate'] = b['bounceRate']?`${(b['bounceRate']*100).toFixed(2)}%`:"";
      b['newvisitorRate'] = b['newvisitorRate']?`${(b['newvisitorRate']*100).toFixed(2)}%`:"";
      
      return b
    }),
    fileName = `网站趋势(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }
  selectTableChange = (props) => {
    const { selectTable } = this.state
    selectTable.value = props.checked
    this.getColumns(selectTable)
  }
  onComparison=(f) => {
    let { selects } = this.state
    selects.limit = 2;
    this.props.dispatch({
      type: 'report/flowanalysis/getLineView',
      payload: selects.value,
    })
    this.setState({ selects, type: false })
  }
  /**
   * 选择对比时间
   */
  onComparisonChange = (v) => {
    let { selects } = this.state
    selects.value = selects.value.slice(0, 1);
    selects.limit = 1;
    this.setState({ selects, type: true, contrastDay: v })
    this.props.dispatch({
      type: 'report/flowanalysis/fetchQueryPcWebsiteTrafficTrend',
      payload: {
        appkey: this.props.appkey,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        endDate: getDateFormat(v).endDateStr,
        startDate: getDateFormat(v).startDateStr,
        granularity: formatCurrentValue(v),
      },
      callback: () => {
        this.props.dispatch({
          type: 'report/flowanalysis/getLineView',
          payload: selects.value,
          contrast: true,
        })
      },
    })
  }
  /**
   * 时间修改
   */
  dateChange = (date) => {
    this.setState({
      dateType: date,
      granularity: formatCurrentValue(date),
    })
    this.updateViewData({
      endDate: getDateFormat(date).endDateStr,
      startDate: getDateFormat(date).startDateStr,
      granularity: formatCurrentValue(date),
    })
  }
  render() {
    const { columns, selects, selectTable, dateType, granularity } = this.state
    const { flowanalysis, Global } = this.props;
    const {
      dataList,
      queryPcWebsiteTrafficTrend,
      lineData,
    } = flowanalysis
    let { head, data, fileName } = this.downLoad();
    return (
      <div>
        <Spin spinning={Global.effects['report/flowanalysis/fetchQueryPcWebsiteTrafficTrend'] || Global.effects['report/flowanalysis/fetchQueryPcWebsiteTrend']}>
          <MasHeader
            dataList={dataList}
            dateType={dateType}
            {...this.props}
            onChange={this.dateChange}
            onComparison={this.onComparison}
            onComparisonChange={this.onComparisonChange}
          />
          <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
            <Col span={24}>
                <HeaderTitle>流量分析</HeaderTitle>
                <div style={{ marginTop: 16, paddingLeft: 16 }}>
                <MaSelect type="charts"
                  extra={<div style={{ float: 'right' }}><MasGranularity dateType={dateType} currentValue={granularity} onChange={this.handleCurrentChange} /></div>}
                  onChange={this.selectChange}
                  {...this.state.selects}
                />
                </div>
                {
                  lineData && Object.keys(lineData).length !== 0
                  ? <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption()} />
                  : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
                }
                
            </Col>
          </Row>
          <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
            <Col span={24}>
              <div style={{ marginTop: 16, paddingLeft: 16 }}>
                <MaSelect
                  type="table"
                  extra={<div style={{ float: 'right', color: 'green', fontSize: 20, fontWeight: 700 }} ><DownLoadBtn head={head} data={data} fileName={fileName} /></div>}
                  onChange={this.selectTableChange}
                  {...this.state.selectTable}
                />
              </div>
              <Table columns={columns} dataSource={queryPcWebsiteTrafficTrend} rowKey="index" />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}