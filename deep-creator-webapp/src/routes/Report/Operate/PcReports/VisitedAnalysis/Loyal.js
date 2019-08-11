import React, { Component } from 'react';
import { Row, Col, Button, Radio, Table, Spin, Icon, Tooltip } from 'antd';
import { connect } from 'dva';
import { getDateFormat } from '../../../../../utils/utils';
import { MasTitle, MasDatePicker, MasList } from '../../../../../components/MasHeader';
import HeaderTitle from '../../../../../components/HeaderTitle';
import ReactEcharts from 'echarts-for-react';


@connect(state => ({
  operation: state['report/operation'],
  guest: state['report/PC/guest'],
  loading: state['LOADING'],
}))
export default class Loyal extends Component {
  state = {
    title: '忠诚度',
    dateType: 'today',
    tabValue:'avgAccessPage'
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
    this.getDataFromApi(props, 'queryPcLoyalty');
  }

  //获取数据
  getDataFromApi(props, url) {
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
    },()=>{
      this.init(this.props);
    });
  }

  formatList(list) {
    let arr = [];
    const key = this.state.tabValue;
    if (list) {
      arr.push({ title: key, value: list[key] })
    } else {
      arr.push({ title: key, value: 0 })
    }
    return arr;
  }

  handleSizeChange(target) {
    this.setState({ tabValue: target.value });
  }

  render() {
    const { columns, tableData } = this.state
    const { guest, loading } = this.props;
    const loyalty = guest && guest.loyalty && guest.loyalty.length > 0 ? guest.loyalty[0] : null;
    const _loading = loading['effects']['report/PC/guest/queryPcLoyalty'];
    return (
      <div>
        <MasTitle {...this.state} />
        <MasDatePicker
          hideComparison
          dateType={this.state.dateType}
          onChange={(data) => this.masDatePickerChange(data)} />
        <Radio.Group value={this.state.tabValue} onChange={({ target }) => this.handleSizeChange(target)} style={{ margin: '10px 0' }}>
          <Radio.Button value="avgAccessPage">访问页数 <Tooltip title={'访客一次访问会话中浏览的页面总数。'}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></Radio.Button>
          <Radio.Button value="avgVisitorDepth">访问深度 <Tooltip title={'访客一次访问会话中浏览的不同页面数。'}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></Radio.Button>
          <Radio.Button value="avgVisitorTime">访问时长 <Tooltip title={'访客一次访问会话的时长。'}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></Radio.Button>
          <Radio.Button value="avgVisitorFrequency">访问频次 <Tooltip title={'访客一天内在网站上的访问会话总次数。'}><Icon style={{ color: 'red' }} type="exclamation-circle-o" /></Tooltip></Radio.Button>
        </Radio.Group>
        {
          _loading ?
          <div style={{ height: '200px', lineHeight: '200px', textAlign: 'center' }}><Spin /></div> :
          <MasList {...this.props.operation} dataList={this.formatList(loyalty)} />
        }
      </div>
    )
  }
}
