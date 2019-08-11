import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Button, DatePicker, Table, Pagination, LocaleProvider } from 'antd'
import moment from 'moment';
import { formatMoment } from '../../../utils'
import cloneDeep from 'lodash/cloneDeep'

import styles from './index.less'

const { RangePicker } = DatePicker
const dateFormat = 'YYYY-MM-DD';

@connect(state => ({
  personalcenter: state['userconfig/personalcenter'],
}))
export default class Log extends PureComponent {
  state = {
    startDate: '',
    endDate: '',
    range: [],
  }

  logColumns = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (text, record, index) => {
      const { logData } = this.props.personalcenter;
      return (logData.pageNum - 1) * logData.pageSize + index + 1
    },
  }, {
    title: '登录账户',
    dataIndex: 'operUser',
    key: 'operUser',
  }, {
    title: '系统菜单操作内容',
    dataIndex: 'operContent',
    key: 'operContent',
  }, {
    title: '操作时间',
    dataIndex: 'operTime',
    key: 'operTime',
    render: (text)=> formatMoment(text)
  }];

  componentDidMount() {
    this.init({ pageNum: 1, pageSize: 10 });
  }

  init(params) {
    const { dispatch } = this.props;
    var params = cloneDeep(params);
    if (this.state.startDate) {
      params.startDate = this.state.startDate;
      params.endDate = this.state.endDate;
    }
    dispatch({
      type: 'userconfig/personalcenter/queryLog',
      payload: { ...params },
    });
  }

  rangePickerOnChange(date, dateString) {
    const { logData } = this.props.personalcenter;
    this.setState({
      startDate: dateString[0],
      endDate: dateString[1],
      range: date,
    }, () => {
      this.init({
        pageNum: logData.pageNum,
        pageSize: logData.pageSize,
      });
    });
  }

  onChange(pageNum, pageSize) {
    this.init({ pageNum, pageSize });
  }

  queryAll() {
    this.setState({
      startDate: '',
      endDate: '',
      range: [],
    }, () => {
      this.init({ pageNum: 1, pageSize: 10 });
    });
  }

  render() {
    const { logData } = this.props.personalcenter;
    const list = logData && logData.list;
    return (
      logData &&
      <div className={styles.box}>
        <div className={styles.picker}>
          <Button type="primary" onClick={::this.queryAll}>全部</Button>
          <RangePicker value={this.state.range} onChange={::this.rangePickerOnChange} />
        </div>
        <Table rowKey="id" columns={this.logColumns} dataSource={list || []} pagination={false} />
        <Pagination className={styles.pager}
          showQuickJumper
          current={logData.pageNum}
          total={logData.total}
          onChange={::this.onChange}
          pageSize={logData.pageSize} />
      </div>
    )
  }
}
