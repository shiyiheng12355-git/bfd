import React, { Component } from 'react';
import { Row, Col, Spin, Table } from 'antd';
import { connect } from 'dva'
import { getDateFormat } from '../../../../../utils/utils'
import { MasTitle, MasDatePicker, MasFilterParams } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import _ from 'lodash'

@connect(state => (
  {
    errorListInfo: state['report/mobile/errorAnalysis'].errorListInfo,
    errorListData: state['report/mobile/errorAnalysis'].errorListData,
    Global: state.LOADING,
  }
))
export default class ErrorList extends Component {
  state = {
    dimension: {
      province: [],
      appversion: [],
      channel: [],
    },
    columns: [
      {
        title: '错误摘要',
        dataIndex: 'error',
      },
      {
        title: '首次发生时间',
        dataIndex: 'firstHappenDate',
      },
      {
        title: '最后发生时间',
        dataIndex: 'lastHappenDate',
      },
      {
        title: '今日错误次数',
        dataIndex: 'todayErrorCount',
      },
      {
        title: '近七日错误次数',
        dataIndex: 'near7DayErrorCount',
      },
      {
        title: '时段内错误次数',
        dataIndex: 'dateRangeErrorCount',
      },
    ],
  }

  componentDidMount() {
    const params = {
      appkey: this.props.appkey,
      dateType: this.props.errorListInfo.dateType,
      includePreGroupConditionJson: this.props.selectedGroupData.includePreGroupConditionJson,
      dimension: this.state.dimension,
    }
    this.getData(params)
  }

  componentWillReceiveProps(nextProps) {
    const { selectedGroupData, appkey, errorListInfo } = nextProps
    const { dateType } = errorListInfo
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
    }
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      this.getData(params)
    }
  }

  getData = (params) => {
    const {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
    } = params
    this.props.dispatch({
      type: 'report/mobile/errorAnalysis/fetchErrorListData',
      payload: {
        appkey,
        prevGroupExpression: includePreGroupConditionJson,
        dimension: JSON.stringify(dimension),
        startDateStr: getDateFormat(dateType).startDateStr,
        endDateStr: getDateFormat(dateType).endDateStr,
      },
    })
  }

  setDimension = (val) => {
    const { appkey, selectedGroupData, errorListInfo } = this.props
    const { dateType } = errorListInfo
    const { includePreGroupConditionJson } = selectedGroupData
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension: val,
    }
    this.setState({ dimension: val })
    this.getData(params)
  }

  handleDateChange = (dateType) => {
    const { appkey, selectedGroupData } = this.props
    const { includePreGroupConditionJson } = selectedGroupData
    const { dimension } = this.state
    const params = {
      appkey,
      dateType,
      includePreGroupConditionJson,
      dimension,
    }
    this.props.dispatch({
      type: 'report/mobile/errorAnalysis/setDateType',
      payload: {
        type: 'errorListInfo',
        value: dateType,
      },
    })
    this.getData(params)
  }

  // 下载参数处理
  downLoad = () => {
    const { columns } = this.state;
    const { title, errorListInfo } = this.props
    const { dateType } = errorListInfo;
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
    const { errorListData } = _.cloneDeep(this.props);
    let data = errorListData
    let fileName = `${title}明细数据(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName,
    }
  }

  render() {
    const { errorListInfo, errorListData, filterData, Global } = this.props
    const { dateType } = errorListInfo
    const { columns } = this.state
    let { head, data, fileName } = this.downLoad()
    return (
      <div>
        <MasTitle {...this.props} />
        <MasDatePicker {...this.props} dateType={dateType} hideComparison onChange={this.handleDateChange} />
        <MasFilterParams style={{ margin: '16px 0' }} filterData={filterData} onChange={this.setDimension} />
        <Spin size='large' spinning={Global.effects['report/mobile/errorAnalysis/fetchErrorListData']}>
          <Row style={{ border: '1px solid #e8e8e8', borderRadius: 4, padding: 8, marginTop: 16 }}>
            <Col span={24}>
              <HeaderTitle>
                错误列表
                <DownLoadBtn style={{ float: 'right', fontSize: 20 }} head={head} data={data} fileName={fileName} />
              </HeaderTitle>
            </Col>
            <Col span={24}>
              <Table columns={columns} dataSource={errorListData} />
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}