import React, { Component } from 'react';
import { Row, Col, Button, Table, Spin, Input } from 'antd';
import { MasHeader, MasGranularity } from '../../../../../components/MasHeader';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import MaSelect from '../../../../../components/MaSelect';
import HeaderTitle from '../../../../../components/HeaderTitle';
import { getDateFormat, formatCurrentValue, download, transTime, formatNumber } from '../../../../../utils/utils'
import ReactEcharts from 'echarts-for-react';
import { connect } from 'dva';
import nodata from '../../../../../assets/imgs/nodata.jpg'

const { Search } = Input;
const hash = {
  newvisitorRate: '新访客占比',
  newvisitor: '新访客数',
  pageCount: '贡献浏览量',
  uvCount: '访客数（UV）',
  bounceCount: '跳出次数',
  bounceRate: '跳出率',
  sessionCount: '访问次数',
  avgVisitorTime: '平均访问时长',
  avgAccessPage: '平均访问页数',
}
@connect(state => ({
  pageEntry: state['report/pageEntry'],
  Global: state.LOADING,
}))
export default class PageEntry extends Component {
  state = {
    title: '入口页面',
    visible: false,
    hideComparison: true,
    dateType: 'today',
    granularity: 'hour',
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
        render: (it, r, i) => {
          return i + 1
        },
      },
      {
        title: '页面标题',
        dataIndex: 'p_s',
        width: 160,
        render: (item) => {
          return <div title={item} style={{ width: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item && (item.length > 6 ? (`${item.substring(0, 6)}...`) : item)}</div>
        },
      },
      {
        title: '浏览量（PV）',
        dataIndex: 'pv',
      },
      {
        title: '访客数（UV）',
        dataIndex: 'uv',
      },
      {
        title: '贡献下游浏览量',
        dataIndex: 'npv',
      },
      {
        title: '平均停留时长',
        dataIndex: 'new',
      },
      {
        title: '退出率',
        dataIndex: 'quitl',
      },
    ],
    selects: {
      label: '指标',
      value: ['uvCount'],
      limit: 1,
      checkGroup: [
        {
          label: '网站基础指标',
          checkData: [
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

          ],
        },
        {
          label: '流量质量指标',
          checkData: [
            {
              label: '贡献浏览量',
              value: 'pageCount',
            },
          ],
        },
      ],
    },
    selectTable: {
      value: ['sessionCount', 'uvCount', 'newvisitor', 'newvisitorRate', 'pageCount', 'bounceRate'],
      limit: 6,
      checkGroup: [
        {
          label: '网站基础指标',
          checkData: [
            {
              label: '访问次数',
              value: 'sessionCount',
            },
            {
              label: '访客数（UV）',
              value: 'uvCount',
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
              label: '贡献浏览量',
              value: 'pageCount',
            },
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
  componentWillReceiveProps=(nextProps) => {
     const { selectedGroupData, appkey } = nextProps;
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      const { dateType, granularity } = this.state;
      this.updateViewData({
        endDate: getDateFormat(dateType).endDateStr,
        startDate: getDateFormat(dateType).startDateStr,
        granularity,
        appkey: appkey,
      })
    }
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'report/pageEntry/fetchQueryPcEntryPage',
      payload: {
        appkey: this.props.appkey,
        endDate: getDateFormat("'today'").endDateStr,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        startDate: getDateFormat("'today'").startDateStr,
      },

    })
    this.props.dispatch({
      type: 'report/pageEntry/fetchQueryPcEntryPageCustomerIndex',
      payload: {
        appkey: this.props.appkey,
        endDate: getDateFormat("'today'").endDateStr,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        startDate: getDateFormat("'today'").startDateStr,
      },
    })
    this.props.dispatch({
      type: 'report/pageEntry/fetchQueryPcEntryPageFlowOverview',
      payload: {
        appkey: this.props.appkey,
        granularity: 'hour',
        index: this.state.selects.value[0],
        endDate: getDateFormat("'today'").endDateStr,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        startDate: getDateFormat("'today'").startDateStr,
      },
      callback: () => {
        const { selects } = this.state
        this.props.dispatch({
          type: 'report/pageEntry/getLineView',
          payload: selects.value,
        })
      },
    })
    this.getColumns()
  }
  downLoad = () => {
    const { columns, dateType } = this.state;
    let head = {};
    columns.map((item, i) => {
      if (i != 0) {
        head[item.dataIndex] = item.title
      }
    })
    const { pageEntry } = this.props;
    const {
      pcEntryPageCustomerIndex,
    } = pageEntry
    let data = pcEntryPageCustomerIndex.map((item) => {
      let b = { ...item }
      b.avgVisitorTime = b.avgVisitorTime ? transTime(b.avgVisitorTime) : 0;
      b.bounceRate = b.bounceRate ? `${(b.bounceRate * 100).toFixed(2)}%` : 0;
      b.newvisitorRate = b.newvisitorRate ? `${(b.newvisitorRate * 100).toFixed(2)}%` : 0;

      return b
    }),
    fileName = `入口页面(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }
  getColumns = (selectTable) => {
    selectTable = selectTable || this.state.selectTable;
    let columns = [
      {
        title: '序号',
        dataIndex: 'index',
        render: (it, r, i) => {
          return i + 1
        },
      },
      {
        title: '页面标题',
        dataIndex: 'p_s',
        width: 160,
        render: (item) => {
          return <div title={item} style={{ width: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item && (item.length > 6 ? (`${item.substring(0, 6)}...`) : item)}</div>
        },
      },
    ];
    selectTable.value.map((item) => {
      if (item === 'bounceRate' || item === 'newvisitorRate') {
        columns.push({
          title: hash[item],
          dataIndex: item,
          render: (ite) => {
            return `${(ite * 100).toFixed(2)}%`
          },
        })
      } else if (item === 'avgVisitorTime') {
        columns.push({
          title: hash[item],
          dataIndex: item,
          render: (item) => {
            return transTime(item) || 0
          },
        })
      } else {
        columns.push({
          title: hash[item],
          dataIndex: item,
          render: (item) => {
            return formatNumber(item)
          },
        })
      }
    })
    this.setState({
      columns,
      selectTable,
    })
  }
  // 请求图数据
  selectChange = (props) => {
    console.log(props)
    const { selects, dateType, granularity } = this.state
    selects.value = props.checked
    this.props.dispatch({
      type: 'report/pageEntry/fetchQueryPcEntryPageFlowOverview',
      payload: {
        appkey: this.props.appkey,
        granularity,
        index: props.checked[0],
        endDate: getDateFormat(dateType).endDateStr,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        startDate: getDateFormat(dateType).startDateStr,
      },
      callback: () => {
        const { selects } = this.state
        this.props.dispatch({
          type: 'report/pageEntry/getLineView',
          payload: selects.value,
        })
      },
    })
  }

  selectTableChange = (props) => {
    const { selectTable } = this.state
    selectTable.value = props.checked
    this.getColumns(selectTable)
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
  renderLine = () => {
    const { pageEntry } = this.props;
    const { lineData, pcEntryPageFlowOverview } = pageEntry;
    const { selects, dateType } = this.state;
    const arr = [];
    let titList = [];
    let dataList = {};
    let aList = [];
    pcEntryPageFlowOverview.topThreeList && pcEntryPageFlowOverview.topThreeList.map((item, i) => {
      titList.push(item.key);
      pcEntryPageFlowOverview.detailList[item.key].map((itm) => {
        if (i === 0) {
          aList.push(itm.dateTime);
        }
        (dataList[item.key] || (dataList[item.key] = [])).push(itm[selects.value] || 0);
      })
    })
    Object.keys(dataList).map((item) => {
      arr.push({
        name: item,
        type: 'line',
        areaStyle: {
          normal: {

          },
        },
        data: dataList[item],
      })
    })
    const option = {
      tooltip: {
        trigger: 'axis',
        confine: true,
        // formatter: (params) => {
        //   let text = ''
        //   params.map((item) => {
        //     text += `${item.axisValue}<br />${item.seriesName}：${item.data}<br />`
        //   })
        //   return text
        // },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: aList,
        axisLine: {
          onZero: true,
        },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            type: 'png',
            name: `页面分析_入口页面_入口页流量概览_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      legend: {

        data: titList,
        orient: 'horizontal',
        x: 'center',
        y: 'bottom',
        formatter(name) {
          if (name.length > 15) {
            return `${name.substring(0, 15)}..`;
          } else {
            return name;
          }
        },
      },
      grid: {
        containLabel: true,
        x: 70,
        y: 20,
        x2: 30,
        y2: 80,
      },
      yAxis: {
        type: 'value',
      },
      series: arr,
    }
    return option
  }

  renderPie = () => {
    const { pageEntry } = this.props;
    const { pcEntryPageFlowOverview, lineData } = pageEntry;
    const { selects, dateType } = this.state;
    let arr = []

    let titList = [];
    let dataList = {};
    titList = pcEntryPageFlowOverview.topThreeList ? pcEntryPageFlowOverview.topThreeList.map(item => item.key) : [];
    pcEntryPageFlowOverview.topTenList && pcEntryPageFlowOverview.topTenList.map((item, i) => {
      arr.push({ value: item.value, name: item.key })
    })

    const option = {
      tooltip: {
        confine: true,
        formatter (params) {
          let tooltip = `${params.name.length > 20 ? params.name.substring(0, 20) : params.name}<br/>${params.value}(${params.percent}%)`;
          return tooltip;
        },
      },
      legend: {
        orient: 'horizontal',
        // bottom: 'bottom',
        x: 'center',
        y: 'bottom',
        data: titList,
        formatter: (name) => {
          if (window.innerWidth > 1300) {
            if (name.length > 15) {
              return `${name.substring(0, 15)}..`;
            } else {
              return name;
            }
          } else if (name.length > 8) {
              return `${name.substring(0, 8)}..`;
            } else {
              return name;
            }
        },
      },
      grid: {
        containLabel: true,
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            type: 'png',
            name: `页面分析_入口页面_入口页流量概览_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      series: [
        {
          type: 'pie',
          radius: ['20%', '50%'],
				  center: ['50%', '45%'],
          data: arr,
          itemStyle: {
            normal: {
              label: {
                formatter(param) {
                  return `${param.name.length > 10 ? `${param.name.substring(0, 10)}..` : param.name}(${param.percent}%)`;
                },
              },
              labelLine: {
                show: true,
                length: 10,
              },
            },
          },

        },
      ],
    }
    return option
  }
  /**
   * 更新图数据
   */
  updateViewData = (date) => {
    this.props.dispatch({
      type: 'report/pageEntry/fetchQueryPcEntryPageFlowOverview',
      payload: {
        index: this.state.selects.value[0],
        ...date,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
        appkey: date.appkey || this.props.appkey,
      },
      callback: () => {
        const { selects } = this.state
        this.props.dispatch({
          type: 'report/pageEntry/getLineView',
          payload: selects.value,
        })
      },
    })
    delete date.granularity;
    this.props.dispatch({
      type: 'report/pageEntry/fetchQueryPcEntryPage',
      payload: {
        appkey: this.props.appkey,
        ...date,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,

      },

    })
    this.props.dispatch({
      type: 'report/pageEntry/fetchQueryPcEntryPageCustomerIndex',
      payload: {
        appkey: this.props.appkey,
        ...date,
        prevGroupExpression: this.props.selectedGroupData.includePreGroupConditionJson,
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
    const { selectTable, columns, dateType, granularity, selects } = this.state
    const { pageEntry, Global } = this.props;
    const {
      dataList,
      pcEntryPageCustomerIndex,
      pcEntryPageFlowOverview,
      searchList,
      lineData,
    } = pageEntry
    console.log(lineData)
    let { head, data, fileName } = this.downLoad();
    return (
      <div>
      <Spin spinning={Global.effects['report/pageEntry/fetchQueryPcEntryPageFlowOverview'] || Global.effects['report/pageEntry/fetchQueryPcEntryPageCustomerIndex']}>
        <MasHeader
          dataList={dataList}
          dateType={dateType}
          {...this.props}
          hideComparison
          onChange={this.dateChange}
        />
        <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
          <Col span={24}>
            <HeaderTitle>入口页流量概览</HeaderTitle>
            <div style={{ marginTop: 16, paddingLeft: 16 }}>
              <MaSelect
                type="charts"
                extra={<div style={{ float: 'right' }}><MasGranularity dateType={dateType} currentValue={granularity} onChange={this.handleCurrentChange} /></div>}
                onChange={this.selectChange}
                {...selects}
              />
            </div>
            <Col span={24} >
              {
                  pcEntryPageFlowOverview.topTenList && pcEntryPageFlowOverview.topTenList.length !== 0
                    ? <ReactEcharts notMerge style={{ height: 400 }} option={this.renderPie()} />
                    : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
              }

            </Col>
            <Col span={24} >
              {
                pcEntryPageFlowOverview.topTenList && pcEntryPageFlowOverview.topTenList.length !== 0
                    ? <ReactEcharts notMerge style={{ height: 400 }} option={this.renderLine()} />
                    : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>
              }

            </Col>
          </Col>
        </Row>
        <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
          <Col span={24}>
            <MaSelect
              type="table"
              extra={
                <div style={{ float: 'right' }} >
                  <Search
                    style={{ width: 240, marginRight: 20 }}
                    placeholder="输入页面标题或URL搜索"
                    onSearch={(value) => {
                      this.props.dispatch({
                        type: 'report/pageEntry/getSearch',
                        payload: value,
                      });
                    }}
                    enterButton
                  />
                  <span
                    style={{ lineHeight: '32px', marginRight: 20, cursor: 'pointer' }}
                    onClick={() => {
                      this.props.dispatch({
                        type: 'report/pageEntry/getSearch',
                        payload: '',
                      });
                    }}
                  >返回</span>
                  <div style={{ float: 'right', color: 'green', fontSize: 20, fontWeight: 700 }} ><DownLoadBtn head={head} data={data} fileName={fileName} /></div>
                </div>}
              onChange={this.selectTableChange}
              {...selectTable}
            />
            <Table rowKey="dateTime" columns={columns} dataSource={searchList || pcEntryPageCustomerIndex} />
          </Col>
        </Row>
        </Spin>
      </div>
    )
  }
}