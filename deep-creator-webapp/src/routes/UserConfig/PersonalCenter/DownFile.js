import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Table, Progress, Pagination } from 'antd'
import { formatMoment, webAPICfg } from '../../../utils'

import styles from './index.less'

@connect(state => ({
  personalcenter: state['userconfig/personalcenter'],
}))
export default class DownFile extends PureComponent {
  state = {
  }

  fileColumns = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (text, record, index) => {
      const { downData } = this.props.personalcenter;
      return (downData.pageNum - 1) * downData.pageSize + index + 1
    },
  }, {
    title: '文件名称',
    dataIndex: 'fileName',
    key: 'fileName',
  }, {
    title: '操作时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    render: text => formatMoment(text),
  }, {
    title: '预下载进度',
    dataIndex: 'fileState',
      render: (text) => { // 10:下载中 20.已完成 30.下载失败
        let str = '';
        if (text == 10) str = '下载中'
        if (text == 20) str = '已完成';
        if (text == 30) str = '下载失败'
        return str;
    },
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      if (record.fileState === 20) {
        const url = record.fileUrl;
        const path = url.substr(0, url.lastIndexOf('/')+1);
        let fileName = url.substr(url.lastIndexOf('/')+1,url.length);
        fileName = encodeURIComponent(fileName);
        return (<span>
          <a href={`${webAPICfg.basePath}${path + fileName}`} download>下载</a>
        </span>)
      }
    },
  }];

  componentDidMount() {
    this.init({
      pageNum: 1,
      pageSize: 10,
    })
  }

  init(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'userconfig/personalcenter/queryDown',
      payload: { ...params },
    })
  }

  onChange(pageNum, pageSize) {
    this.init({ pageNum, pageSize });
  }

  render() {
    const { downData } = this.props.personalcenter;
    const list = downData && downData.list;

    return (
      downData &&
      <div className={styles.box}>
        <Table columns={this.fileColumns} dataSource={list} rowKey={(record, index) => index} pagination={false} />
        <Pagination className={styles.pager}
          current={downData.pageNum}
          total={downData.total}
          onChange={::this.onChange}
          pageSize={downData.pageSize} />
      </div>
    )
  }
}
