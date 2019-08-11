import React, { Component } from 'react';
import { Row, Col, Button, Radio, Table, Spin, Icon } from 'antd';
import { connect } from 'dva';
import { getDateFormat } from '../../../../../utils/utils';
import { MasHeader } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import MaSelect from '../../../../../components/MaSelect';
import ReactEcharts from 'echarts-for-react';
import cloneDeep from 'lodash/cloneDeep'
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import nodata from '../../../../../assets/imgs/nodata.jpg'

require('echarts/map/js/china.js');

@connect(state => ({
  operation: state['report/operation'],
  guest: state['report/PC/guest'],
  loading: state['LOADING'],
}))
export default class Area extends Component {

  areaColumns = [
    {
      title: '地区',
      dataIndex: 'province'
    },
    {
      title: '占比',
      dataIndex: 'rate',
      render: (text,record)=>{
        return (Number(text) * 100).toFixed(2) + '%'
      } 
    }
  ]

  columns = [{
    title: '序号',
    dataIndex: 'index',
    render: (text, record, index) => {
      return <div>{(this.state.current - 1) * this.state.pageSize + index + 1}</div>
    }
  },
  {
    title: '地区',
    dataIndex: 'province',
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
  }]

  state = {
    current: 1,
    pageSize: 10,
    title: '用户地域',
    dateType:'today',
    columns: this.getColumns(['pvCount', 'uvCount']),
    selectTable: {
      value: ['pvCount', 'uvCount'],
      limit: 4,
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
            }
          ],
        }
      ]
    }
  }

  getColumns(array){
    let a = this.columns, b = [];
    a.map((m,n)=>{
      if (m.dataIndex == 'index' || m.dataIndex == 'province'){
        b.push(m)
      }
      array.map((p)=>{
        if(p == m.dataIndex){
          b.push(m);
        }
      })
    })
    return b;
  }

  areaOption = (gphDistribution) => {
    let arr = [];
    const { dateType } = this.state;
    gphDistribution.map((m,n)=>{
      arr.push({
        name: m.province, 
        value: m.uvCount 
      })
    });
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
      toolbox: {
        feature: {
          saveAsImage: {
            name: `访客分析_用户地域_${getDateFormat(dateType).startDateStr}_${getDateFormat(dateType).endDateStr}`
          },
        },
        right: 20
      },
      visualMap: {
        color: ['#ff4e33', '#ff715c', '#ff9585', '#ffb8ad', '#ffdcd6', '#ffedda', '#cccccc'],
      },
      geo: {
        map: 'china',
        roam: false,
        label: {
          normal: {
            show: true,
            textStyle: {
              color: 'rgba(0,0,0,0.4)',
            },
          },
        },
        itemStyle: {
          normal: {
            borderColor: 'rgba(0, 0, 0, 0.2)',
          },
          emphasis: {
            areaColor: null,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 20,
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
      series: [
        {
          type: 'map',
          geoIndex: 0,
          // tooltip: {show: false},
          data: arr,
        },
      ],
    };
    return option
  }

  selectTableChange = (data) => {
    const { selectTable } = this.state
    selectTable.value = data.checked
    this.setState({
      selectTable, 
      columns: this.getColumns(data.checked) 
    });
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
    this.getDataFromApi(props, 'queryPcRegionalDistribution'); //地域分布
    this.getDataFromApi(props, 'queryPcVisitGeographicalDistribution'); //地区分布/访问地域分布概况
    this.getDataFromApi(props, 'queryPcRegionalDistrubutionCustomerIndex'); //地域分布/自定义指标
  }

  //获取数据
  getDataFromApi(props, url){
    const { operation, dispatch } = props;
    const obj = {
      appkey: operation.appkey,
      prevGroupExpression: operation.selectedGroupData.includePreGroupConditionJson,
      startDate: getDateFormat(this.state.dateType).startDateStr,
      endDate: getDateFormat(this.state.dateType).endDateStr
    }
    dispatch({
      type: 'report/PC/guest/' + url,
      payload: obj
    })
  }

  masDatePickerChange(value) {
    this.setState({
      dateType: value
    }, () => {
      this.init(this.props);
    });
  }

  formatList(list){
    let arr = [], obj;
    if(list){
      const { pvCount, uvCount, newvisitor, avgVisitorTime, bounceRate } = list;
      obj = { pvCount, uvCount, newvisitor, avgVisitorTime, bounceRate };
    }else{
      obj = { pvCount: 0, uvCount: 0, newvisitor: 0, avgVisitorTime: 0, bounceRate: 0 }
    }
    for (let i in obj) {
      arr.push({ title: i, value: obj[i] })
    }
    return arr
  }

  // 下载参数处理
  downLoad = () => {
    const { columns, dateType } = this.state;
    const { guest } = this.props;
    let head = {};
    columns.map((item, i) => {
      if (i != 0) {
        head[item.dataIndex] = item.title
      }
    });
   
    const data = guest && guest.rDistributionCustomerIndex && guest.rDistributionCustomerIndex.length > 0 ? guest.rDistributionCustomerIndex : null,
      fileName = `用户地域(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName
    }
  }

  downLoadMap = ()=>{
    const guest = cloneDeep(this.props.guest)
    const gphDistribution = guest && guest.gphDistribution && guest.gphDistribution.length > 0 ? guest.gphDistribution.map((item)=>{
      let obj = item;
      if (obj.hasOwnProperty('rate')){
        obj.rate = (Number(obj.rate) * 100).toFixed(2) + '%'
      }
      return obj;
    }) : null;
    const columns = this.areaColumns;
    let head = {};
    columns.map((item, i) => {
      head[item.dataIndex] = item.title;
    });
    const data = gphDistribution,
      fileName = '访客地域分布概况';
    return {
      head,
      data,
      fileName
    }
  }
  
  render() {
    const { guest, loading } = this.props,
      distribution = guest && guest.distribution ? guest.distribution : null,
      gphDistribution = guest && guest.gphDistribution && guest.gphDistribution.length > 0 ? guest.gphDistribution : null,
      _loading = loading['effects']['report/PC/guest/queryPcVisitGeographicalDistribution'],
      _rloading = loading['effects']['report/PC/guest/queryPcRegionalDistrubutionCustomerIndex'],
      rdx = guest && guest.rDistributionCustomerIndex && guest.rDistributionCustomerIndex.length > 0 ? guest.rDistributionCustomerIndex : null;

    return (
      <div>
        <MasHeader 
          {...this.props.operation }
          hideComparison
          title={this.state.title}
          dataList={ this.formatList(distribution) }
          dateType={this.state.dateType} 
          onChange={(data) => this.masDatePickerChange(data)}/>
        {
          _loading ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin /></div> :
          <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
            <Col span={24}>
              <HeaderTitle>访客地域分布概况</HeaderTitle>
              {!gphDistribution && <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>}
              <Col span={16} style={{padding: '0 20px'}}>
                {gphDistribution ? (<ReactEcharts style={{ height: 400 }} option={this.areaOption(gphDistribution)} />) : null}
              </Col>
              <Col span={8}>
                {
                  gphDistribution ? 
                  <div>
                    <div style={{ textAlign: 'right', color: 'green', fontSize: 20, fontWeight: 700 }}><DownLoadBtn {...this.downLoadMap()} /></div>
                    <Table
                      style={{ height: 400, overflow: 'auto' }}
                      size='small'
                      bordered
                      pagination={false}
                      columns={this.areaColumns}
                      dataSource={gphDistribution}
                      rowKey='province' /> 
                  </div>: null
                }
              </Col>
            </Col>
          </Row>
        }
        <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: '0 10px' }}>
          <Col span={24}>
            <div style={{ marginTop: 16, paddingLeft: 16,marginBottom: 10 }}>
              <MaSelect type="table" 
                onChange={this.selectTableChange}
                extra={<div style={{ float: 'right', color: 'green', fontSize: 20, fontWeight: 700 }} ><DownLoadBtn {...this.downLoad()} /></div>}
                {...this.state.selectTable} />
            </div>
            {
              _rloading ? 
              <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin /></div>:
              <Table 
              columns={this.state.columns} 
              dataSource={rdx} 
              pagination={{ onChange: (current, pageSize) => { this.setState({ current, pageSize }) } }} 
              rowKey={(record, index) => index} /> 
            }
          </Col>
        </Row>
      </div>
    )
  }
}