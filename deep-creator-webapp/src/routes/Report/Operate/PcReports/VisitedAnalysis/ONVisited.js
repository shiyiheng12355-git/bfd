import React, { Component } from 'react';
import { Row, Col, Button, Table, Spin } from 'antd';
import { connect } from 'dva'
import { MasTitle, MasDatePicker } from '../../../../../components/MasHeader';
import { getDateFormat, transTime } from '../../../../../utils/utils'
import HeaderTitle from '../../../../../components/HeaderTitle'
import ReactEcharts from 'echarts-for-react';
import nodata from '../../../../../assets/imgs/nodata.jpg'

@connect(state => ({
  operation: state['report/operation'],
  guest: state['report/PC/guest'],
  loading: state.LOADING,
}))
export default class ONVisited extends Component {
  state = {
    title: '新老访客',
    hideComparison: true,
    dateType: 'today',
  }

  renderChart = (type) => {
    const { guest } = this.props;
    if (guest && guest.newAndOldVisitor) {
      const data = guest.newAndOldVisitor;
      let list = [];
      if (type == 'new') {
        list = [{
          name: '浏览量（PV）',
          value: data.newPvCount,
        }, {
          name: '访客数（UV）',
          value: data.newvisitor,
        }, {
          name: '访问次数',
          value: data.newSessionCount,
        }, {
            name: '跳出率',
            value: Number(data.newBounceRate) > 0 ? (`${(Number(data.newBounceRate) * 100).toFixed(2)}%`) : '0',
        }, {
            name: '平均访问时长',
            value: transTime(data.newAvgVisitorTime),
        }, {
            name: '平均访问页数',
            value: data.newAvgAccessPage,
        }]
      } else if (type == 'old') {
        list = [{
          name: '浏览量（PV）',
          value: data.oldPvCount,
        }, {
          name: '访客数（UV）',
          value: data.oldCount,
        }, {
          name: '访问次数',
          value: data.oldSessionCount,
        }, {
          name: '跳出率',
          value: Number(data.oldBounceRate) > 0 ? (`${(Number(data.oldBounceRate) * 100).toFixed(2)}%`) : '0',
        }, {
          name: '平均访问时长',
          value: transTime(data.oldAvgVisitorTime),
        }, {
          name: '平均访问页数',
          value: data.oldAvgAccessPage,
        }]
      }
      return (
        list && list.length > 0 && list.map((item, i) => {
          return (
            <Row key={i} style={{ margin: '20px 0' }}>
              <Col span={12} style={{ fontSize: '16px' }}>{item.name}</Col>
              <Col span={12} style={{ fontSize: '16px' }}>{item.value}</Col>
            </Row>
          )
        })
      )
    }
  }

  renderPie = () => {
    const { guest } = this.props;
    if (guest && guest.newAndOldVisitor) {
      const data = guest.newAndOldVisitor;
      const exarr = [
        { value: data.newvisitor, name: '新访客访客数' },
        { value: data.oldCount, name: '老访客访客数' },
      ]
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
        },
        color: ['#4dc0f9', '#aab3b9'],
        legend: {
          orient: 'vertical',
          bottom: 'bottom',
          data: ['新访客访客数', '老访客访客数'],
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold',
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: exarr,
          },
        ],
      }
      return option
    }
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

  init(props) {
    const { operation, dispatch } = props;
    const obj = {
      appkey: operation.appkey,
      prevGroupExpression: operation.selectedGroupData.includePreGroupConditionJson,
      startDate: getDateFormat(this.state.dateType).startDateStr,
      endDate: getDateFormat(this.state.dateType).endDateStr,
    }
    dispatch({
      type: 'report/PC/guest/queryPcOveriewOfNewAndOldVisitor',
      payload: obj,
    })
  }

  masDatePickerChange(value) {
    this.setState({
      dateType: value,
    }, () => {
      this.init(this.props);
    });
  }

  render() {
    const { guest, loading } = this.props;
    const isHasGuest = !!(guest && guest.newAndOldVisitor);
    const _loading = loading.effects['report/PC/guest/queryPcOveriewOfNewAndOldVisitor'];
    return (
      <div>
        <MasTitle {...this.state} />
        <MasDatePicker hideComparison dateType={this.state.dateType} onChange={data => this.masDatePickerChange(data)} />
        {
          _loading ? <div style={{ height: '400px', lineHeight: '400px', textAlign: 'center' }}><Spin /></div> :
          <Row gutter={16} style={{ border: '1px solid #e8e8e8', marginTop: 16, marginRight: 0, borderRadius: 4, padding: 16, clear: 'both' }}>
            <Col span={24}>
              <HeaderTitle>新老访客概况</HeaderTitle>
            </Col>
            <Col span={6} style={{ height: 400, padding: '60px 0', textAlign: 'center', color: '#4dc0f9' }}>
              {this.renderChart('new')}
            </Col>
            <Col span={12}>
                {isHasGuest ? (<ReactEcharts style={{ height: 400 }} option={this.renderPie()} />) : <div style={{ textAlign: 'center', height: '400px' }}><img style={{ marginTop: 100 }} src={nodata} alt='暂无数据' /></div>}
            </Col>
            <Col span={6} style={{ height: 400, padding: '60px 0', textAlign: 'center', color: '#aab3b9' }}>
              {this.renderChart('old')}
            </Col>
          </Row>
        }
      {/*
      <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12} style={{ paddingLeft: 0 }}>
            <div style={{ border: '1px solid #e8e8e8', padding: 16 }}>
              <HeaderTitle>新访客访问来源TOP5</HeaderTitle>
              <Table columns={this.state.columns1} dataSource={this.state.tableData1} rowKey="index" />
            </div>
          </Col>
          <Col span={12} >
            <div style={{ border: '1px solid #e8e8e8', padding: 16 }}>
              <HeaderTitle>老访客访问来源TOP5</HeaderTitle>
              <Table columns={this.state.columns1} dataSource={this.state.tableData1} rowKey="index" />
            </div>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12} style={{ paddingLeft: 0 }}>
            <div style={{ border: '1px solid #e8e8e8', padding: 16 }}>
              <HeaderTitle>新访客访问入口页TOP5</HeaderTitle>
              <Table columns={this.state.columns1} dataSource={this.state.tableData1} rowKey="index" />
            </div>
          </Col>
          <Col span={12} >
            <div style={{ border: '1px solid #e8e8e8', padding: 16 }}>
              <HeaderTitle>老访客访问入口页TOP5</HeaderTitle>
              <Table columns={this.state.columns1} dataSource={this.state.tableData1} rowKey="index" />
            </div>
          </Col>
        </Row>
      */}
      </div>
    )
  }
}