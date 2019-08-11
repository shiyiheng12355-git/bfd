import React, { Component } from 'react';
import { Row, Col, Button, Radio, Table, Spin, Icon, Tooltip } from 'antd';
import { connect } from 'dva';
import { getDateFormat, transTime } from '../../../../../utils/utils';
import { MasTitle, MasDatePicker, MasList } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import MaSelect from '../../../../../components/MaSelect';
import ReactEcharts from 'echarts-for-react';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import cloneDeep from 'lodash/cloneDeep'

@connect(state => ({
  operation: state['report/operation'],
  guest: state['report/PC/guest'],
  loading: state.LOADING,
}))
export default class SysCon extends Component {
  compareData = null

  state = {// current, pageSize
    current: 1,
    pageSize: 10,
    title: '系统环境',
    dateType: 'today',
    tabValue: 'bt',
    isCompare: false,
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
      value: ['pvCount'],
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

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps.operation;
    if (selectedGroupData && selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.operation.selectedGroupData.id || appkey !== this.props.operation.appkey) {
      this.init(nextProps);
    }
  }

  // init
  init(props) {
    this.getDataFromApi(props, 'queryPcSystemEnvironmentBrowser');
    this.getPcSyfstemEnvironmentBrowserDistributionOverview(props);
  }

  // 获取数据
  getDataFromApi(props, url) {
    const { operation, dispatch } = props;
    const obj = {
      appkey: operation.appkey,
      prevGroupExpression: operation.selectedGroupData.includePreGroupConditionJson,
      startDate: getDateFormat(this.state.dateType).startDateStr,
      endDate: getDateFormat(this.state.dateType).endDateStr,
    }
    dispatch({
      type: `report/PC/guest/${url}`,
      payload: obj,
    })
  }

  getPcSyfstemEnvironmentBrowserDistributionOverview(props) {
    const { operation, dispatch } = props;
    const obj = {
      appkey: operation.appkey,
      prevGroupExpression: operation.selectedGroupData.includePreGroupConditionJson,
      startDate: getDateFormat(this.state.dateType).startDateStr,
      endDate: getDateFormat(this.state.dateType).endDateStr,
      system: this.state.tabValue,
    }
    dispatch({
      type: 'report/PC/guest/queryPcSyfstemEnvironmentBrowserDistributionOverview',
      payload: obj,
    })
  }

  lineOption = (x, y) => {
    const { dateType } = this.state;
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let text = `${params[0].axisValue}<br />`
          params.map((item) => {
            if (item.seriesName == '平均访问时长') {
              text += `${item.seriesName}：${transTime(item.data)}<br />`
            } else if (item.seriesName == '新访客占比' || item.seriesName == '跳出率') {
              const aaa = Number(item.data) > 0 ? (`${(Number(item.data) * 100).toFixed(2)}%`) : '0';
              text += `${item.seriesName}：${aaa}<br />`
            } else {
              text += `${item.seriesName}：${item.data}<br />`
            }
          })
          return text
        },
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `访客分析_系统环境_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`,
          },
        },
        right: 20,
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: x.splice(0, 10),
        axisLine: {
          onZero: true,
        },
        axisLabel: {
          rotate: 70,
          interval: 0,
        },
      },
      grid: {
        containLabel: true,
      },
      yAxis: {
        type: 'value',
      },
      series: y,
    }
    return option
  }

  selectChange = (props) => {
    const { selects } = this.state
    selects.value = props.checked
    this.setState({ selects })
  }

  selectTableChange = (props) => {
    const { selectTable } = this.state
    selectTable.value = props.checked
    this.setState({ selectTable })
  }

  masDatePickerChange(value) {
    const selects = this.state.selects;
    selects.value = [selects.value[0]];
    this.setState({
      dateType: value,
      isCompare: false,
      selects,
    }, () => {
      this.init(this.props);
    });
  }

  handleSizeChange(target) {
    this.setState({ tabValue: target.value }, () => {
      this.getPcSyfstemEnvironmentBrowserDistributionOverview(this.props);
      if (this.compareData !== null) this.queryComparePcSyfstemEnvironmentBrowserDistributionOverview(this.compareData);
    });
  }

  formatList(list) {
    let arr = [],
obj;
    if (list) {
      const { pvCount, uvCount, newvisitor, avgVisitorTime, bounceRate } = list;
      obj = { pvCount, uvCount, newvisitor, avgVisitorTime, bounceRate };
    } else {
      obj = { pvCount: 0, uvCount: 0, newvisitor: 0, avgVisitorTime: 0, bounceRate: 0 }
    }
    for (let i in obj) {
      arr.push({ title: i, value: obj[i] })
    }
    return arr
  }

  getTitle(value) {
    let str = '';
      switch (value) {
        case 'bt':
          str = '浏览器分布概况';
          break;
        case 'ot':
          str = '操作系统分布概况';
          break;
        case 'rs':
          str = '屏幕分辨率分布概况';
          break;
        case 'cb':
          str = '屏幕颜色分布概况';
          break;
        case 'ct':
          str = '网页字符集分布概况';
          break;
        case 'fv':
          str = 'FLASH版本分布概况';
          break;
        case 'ja':
          str = '是否支持java分布概况';
          break;
        case 'oc':
          str = '语言环境分布概况';
          break;
        case 'cookieSupport':
          str = '是否支持Cookie分布概况';
          break;
        default:
          break;
      }
    return str;
  }

  getXAxis(list, key) {
    let a = [];
    list.length > 0 && list.map((m) => {
      a.push(m[key] || m.system || '未知');
    })
    return a;
  }

  getChartName(value) {
    const array = [{
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
    }];
   let str = '';
    array.map((m) => {
      if (m.value == value) {
        str = m.label;
      }
    })
    return str;
  }


  getSeries(list, selects) {
    let a = [];
    selects && selects.value && selects.value.length > 0 && selects.value.map((item, i) => {
      let obj = {
        name: this.getChartName(item),
        type: 'bar',
        areaStyle: {
          normal: {},
        },
        data: [],
      }
      list.length > 0 && list.map((m) => {
        obj.data.push(m[item]);
      });
      obj.data = obj.data.splice(0, 10);
      a.push(obj);
    });
    return a;
  }

  getCompareSeries(list, compareList, selects) {
    let a = [];
    if (selects && selects.value && selects.value.length > 0) {
      const item = selects.value[0];
      let obj = {
        name: this.getChartName(item),
        type: 'bar',
        areaStyle: {
          normal: {},
        },
        data: [],
      }
      list.length > 0 && list.map((m) => {
        obj.data.push(m[item]);
      });
      let compareObj = {
        name: `对比${this.getChartName(item)}`,
        type: 'bar',
        areaStyle: {
          normal: {},
        },
        data: [],
      }
      compareList.length > 0 && compareList.map((m) => {
        compareObj.data.push(m[item]);
      });
      obj.data = obj.data.splice(0, 10);
      compareObj.data = compareObj.data.splice(0, 10);
      a.push(obj);
      a.push(compareObj);
    }
    return a;
  }

  getColumns(value) {
    let a = [{
      title: '序号',
      dataIndex: 'index',
      render: (text, record, index) => {
        return <div>{(this.state.current - 1) * this.state.pageSize + index + 1}</div>
      },
    }, {
      title: this.getTitle(this.state.tabValue).replace('分布概况', ''),
      dataIndex: this.state.tabValue,
      render: (text, record) => {
        return text || record.system || '未知';
      },
    }]
    value && value.length > 0 && value.map((m) => {
      if (m == 'newvisitorRate' || m == 'bounceRate') {
        a.push({
          title: this.getChartName(m),
          dataIndex: m,
          render: text => (Number(text) > 0 ? (`${Number(text) * 100}%`) : '0'),
        })
      } else if (m == 'avgVisitorTime') {
        a.push({
          title: this.getChartName(m),
          dataIndex: m,
          render: (text,record) => {
            //console.log(text,record,'hahaha...')
            return transTime(text)
          },
        })
      } else {
        a.push({
          title: this.getChartName(m),
          dataIndex: m,
        })
      }
    })
    return a;
  }

  queryComparePcSyfstemEnvironmentBrowserDistributionOverview(data) {
    const { operation, dispatch } = this.props;
    const obj = {
      appkey: operation.appkey,
      prevGroupExpression: operation.selectedGroupData.includePreGroupConditionJson,
      startDate: getDateFormat(data).startDateStr,
      endDate: getDateFormat(data).endDateStr,
      system: this.state.tabValue,
    }
    dispatch({
      type: 'report/PC/guest/queryComparePcSyfstemEnvironmentBrowserDistributionOverview',
      payload: obj,
    });
  }

  onComparisonChange(data) {
    const selects = this.state.selects;
    selects.value = [selects.value[0]];
    this.setState({ isCompare: true, selects }, () => {
      this.queryComparePcSyfstemEnvironmentBrowserDistributionOverview(data);
      this.compareData = data;
    });
  }

  onComparison(data) {
    this.setState({ isCompare: false });
  }

  // 下载参数处理
  downLoad = () => {
    const { dateType } = this.state;
    const columns = this.getColumns(this.state.selectTable.value);
    const guest = cloneDeep(this.props.guest);
    let head = {};
    columns.map((item, i) => {
      if (i != 0) {
        head[item.dataIndex] = item.title
      }
    });
    const data = guest && guest.psEnvironmentBrowserOverview && guest.psEnvironmentBrowserOverview.length > 0 ? guest.psEnvironmentBrowserOverview.map((item) => {
      let obj = item;
      obj.bounceRate = Number(obj.bounceRate) > 0 ? (`${(Number(obj.bounceRate) * 100).toFixed(2)}%`) : '0';
      obj.newvisitorRate = Number(obj.newvisitorRate) > 0 ? (`${(Number(obj.newvisitorRate) * 100).toFixed(2)}%`) : '0';
      obj.avgVisitorTime = transTime(obj.avgVisitorTime);
      if (!obj.hasOwnProperty(this.state.tabValue)) obj[this.state.tabValue] = obj.system || '未知';
      if (obj.hasOwnProperty('ja')) {
        if (obj.ja == '1') obj.ja = '不支持';
        if (obj.ja == '0') obj.ja = '支持';
      }
      if (obj.hasOwnProperty('cookieSupport')) {
        if (obj.cookieSupport == '1') obj.cookieSupport = '不支持';
        if (obj.cookieSupport == '0') obj.cookieSupport = '支持';
      }
      return obj;
    }) : [],
      fileName = `系统环境(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { loading } = this.props;
    const guest = cloneDeep(this.props.guest);
    const psEnvironmentBrowser = guest && guest.psEnvironmentBrowser && guest.psEnvironmentBrowser.length > 0 ? guest.psEnvironmentBrowser[0] : null;
    const psEnvironmentBrowserOverview = guest && guest.psEnvironmentBrowserOverview && guest.psEnvironmentBrowserOverview.length > 0 ? guest.psEnvironmentBrowserOverview.map((item)=>{
      let obj = item;
      if(item.hasOwnProperty('ja')){
        if(obj.ja == '1') obj.ja = '不支持';
        if(obj.ja == '0') obj.ja = '支持';
      }
      if (item.hasOwnProperty('cookieSupport')) {
        if (obj.cookieSupport == '1') obj.cookieSupport = '不支持';
        if (obj.cookieSupport == '0') obj.cookieSupport = '支持';
      }
      return obj;
    }) : [];
    const psCompareEnvironmentBrowserOverview = guest && guest.psCompareEnvironmentBrowserOverview && guest.psCompareEnvironmentBrowserOverview.length > 0 ? guest.psCompareEnvironmentBrowserOverview.map((item)=>{
      let obj = item;
      if (item.hasOwnProperty('ja')) {
        if (obj.ja == '1') obj.ja = '不支持';
        if (obj.ja == '0') obj.ja = '支持';
      }
      if (item.hasOwnProperty('cookieSupport')) {
        if (obj.cookieSupport == '1') obj.cookieSupport = '不支持';
        if (obj.cookieSupport == '0') obj.cookieSupport = '支持';
      }
      return obj;
    }) : [];
    const xAxis = this.getXAxis(psEnvironmentBrowserOverview, this.state.tabValue);
    let series;
    if (this.state.isCompare) {
      series = this.getCompareSeries(psEnvironmentBrowserOverview, psCompareEnvironmentBrowserOverview, this.state.selects);
    } else {
      series = this.getSeries(psEnvironmentBrowserOverview, this.state.selects);
    }
    let isNoData = true;
    series.map((item) => {
      if (item.data && item.data.length > 0) isNoData = false;
    });
    const _loading = loading.effects['report/PC/guest/queryPcSyfstemEnvironmentBrowserDistributionOverview'] || loading.effects['report/PC/guest/queryComparePcSyfstemEnvironmentBrowserDistributionOverview'];
    return (
      <div>
        <MasTitle {...this.state} />
        <MasDatePicker
          comparison
          onComparison={data => this.onComparison(data)}
          dateType={this.state.dateType}
          onComparisonChange={data => this.onComparisonChange(data)}
          onChange={data => this.masDatePickerChange(data)}
          />
        <Radio.Group value={this.state.tabValue} onChange={({ target }) => this.handleSizeChange(target)} style={{ margin: '10px 0' }}>
          <Radio.Button value="bt"><Tooltip title="访客浏览您网站时使用的浏览器名称和版本信息。">浏览器</Tooltip></Radio.Button>
          <Radio.Button value="ot"><Tooltip title="访客浏览您网站时使用操作系统名称和版本信息。">操作系统</Tooltip></Radio.Button>
          <Radio.Button value="rs"><Tooltip title="访客浏览您网站时的屏幕分辨率。">屏幕分辨率</Tooltip></Radio.Button>
          <Radio.Button value="cb"><Tooltip title="访客浏览您网站时的屏幕颜色。">屏幕颜色</Tooltip></Radio.Button>
          <Radio.Button value="ct"><Tooltip title="访客浏览您网站时的网页字符集。">网页字符集</Tooltip></Radio.Button>
          <Radio.Button value="fv"><Tooltip title="访客浏览器程序中安装的 Flash 版本。">FLASH版本</Tooltip></Radio.Button>
          <Radio.Button value="ja"><Tooltip title="访客浏览器是否支持JAVA程序的运行。">是否支持java</Tooltip></Radio.Button>
          <Radio.Button value="oc"><Tooltip title="访客浏览您网站时使用的语言环境。">语言环境</Tooltip></Radio.Button>
          <Radio.Button value="cookieSupport"><Tooltip title="访客浏览器是否支持cookie。">是否支持Cookie</Tooltip></Radio.Button>
        </Radio.Group>
        <MasList {...this.props.operation} dataList={this.formatList(psEnvironmentBrowser)} />
        <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4 }}>
          <Col span={24}>
            <HeaderTitle>{this.getTitle(this.state.tabValue)}</HeaderTitle>
            <div style={{ marginTop: 16, paddingLeft: 16 }}>
              <MaSelect type="charts" onChange={this.selectChange} {...this.state.selects} />
            </div>
            {
              _loading ?
              <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin /></div> :
                (isNoData ? 
                (<img style={{ margin: '40px auto', display: 'block' }}src={require('../../../../../assets/imgs/nodata.jpg')} alt='暂无数据' />) : 
                <ReactEcharts notMerge style={{ height: 400 }} option={this.lineOption(xAxis, series)} />)
            }
          </Col>
        </Row>
        <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: '0 10px' }}>
          <Col span={24}>
            <div style={{ marginTop: 16, paddingLeft: 16, marginBottom: 16 }}>
              <MaSelect type="table"
                onChange={this.selectTableChange}
                extra={<div style={{ float: 'right', color: 'green', fontSize: 20, fontWeight: 700 }} ><DownLoadBtn {...this.downLoad()} /></div>}
                {...this.state.selectTable} />
            </div>
            {
              _loading ?
                <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin /></div> :
                <Table
                pagination={{ onChange: (current, pageSize) => { this.setState({ current, pageSize }) } }}
                columns={this.getColumns(this.state.selectTable.value)}
                dataSource={psEnvironmentBrowserOverview}
                rowKey={(record, index) => index} />
            }
          </Col>
        </Row>
      </div>
    )
  }
}
