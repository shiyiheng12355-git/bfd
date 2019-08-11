import React, { Component } from 'react';
import { Row, Col, Spin, Table, Icon, Tooltip } from 'antd';
import { connect } from 'dva'
import { getDateFormat, transTime } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'

@connect(state => (
  {
    dateType: state['report/mobile/visitedPages'].dateType,
    tableData: state['report/mobile/visitedPages'].tableData,
    Global: state.LOADING,
  }
))

export default class VisitedPages extends Component {
  state = {
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    columns: [
      {
        title: '访问页面',
        dataIndex: 'name',
      },
      {
        title: '访问人数（占比）',
        dataIndex: 'access',
        render: (text, record) => (
          `${record.access}(${(Number(record.accessProportion) * 100).toFixed(2)}%)`
        ),
      },
      {
        title: '访问次数（占比）',
        dataIndex: 'accessTimes',
        render: (text, record) => (
          `${record.accessTimes}(${(Number(record.accessTimesProportion) * 100).toFixed(2)}%)`
        ),
      },
      {
        title: '平均停留时长',
        dataIndex: 'avgStayLength',
        render: text => (
          transTime(text)
        ),
      },
      {
        title: '停留时长占比',
        dataIndex: 'stayLength',
        render: text => (
          `${(Number(text) * 100).toFixed(2)}%`
        ),
      },
      {
        title: '页面跳出率',
        dataIndex: 'bounceRate',
        render: text => (
          `${(Number(text) * 100).toFixed(2)}%`
        ),
      },
    ],
    detailedExplain: '访问人数： 访问当前页面的独立UV数。<br/>访问人数占比： 访问当前页面的独立UV数/访问全部页面的独立UV数之和。<br/>访问次数： 访问当前页面的总次数。<br/>访问次数占比： 当前页面的访问次数/全部页面的访问次数。<br/>平均停留时间： 访问当前页面的停留时间之和/访问总次数。<br/>停留时间占比： 用户访问当前页面的停留时间/用户在全部页面的停留时间之和。<br/>页面跳出率： 用户从当前页面离开应用程序的比例，从当前页面离开应用的次数/浏览此页面的总次数。 ',
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
    }
    this.getTableData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, dateType } = nextProps
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
    }
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      this.getTableData(params)
    }
  }

  getTableData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/visitedPages/fetchTableData',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
        dimension: JSON.stringify(dimension),
      },
    })
  }

  handleDateChange = (dateType) => {
    this.props.dispatch({
      type: 'report/mobile/visitedPages/setDateType',
      payload: dateType,
    })
    const params = {
      appkey: this.props.appkey,
      dateType,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
    }
    this.getTableData(params)
  }
  setDimension = (val) => {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.dateType,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: val,
    }
    this.setState({ dimension: val })
    this.getTableData(params)
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
      item.access = `${item.access}(${(Number(item.accessProportion) * 100).toFixed(2)}%)`
      item.accessTimes = `${item.accessTimes}(${(Number(item.accessTimesProportion) * 100).toFixed(2)}%)`
      item.avgStayLength = transTime(item.avgStayLength)
      item.stayLength = transTime(item.stayLength)
      item.bounceRate = `${(Number(item.bounceRate) * 100).toFixed(2)}%`
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
    const { tableData, filterData, Global } = this.props
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker dateDemision={['yestoday', '7days', '30days']} hideComparison {...this.props} onChange={this.handleDateChange} />
        <MasFilterParams filterData={filterData} onChange={this.setDimension} />
        <Spin size='large' spinning={Global.effects['report/mobile/visitedPages/fetchTableData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>
                页面访问汇总
                <Tooltip placement='right' title={<div dangerouslySetInnerHTML={{ __html: this.state.detailedExplain }}></div>}>
                  <Icon style={{ color: 'red' }} type="exclamation-circle-o" />
                </Tooltip>
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>

            <Col span={24}>
              <Table columns={this.state.columns} dataSource={tableData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}
