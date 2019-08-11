import React from 'react';
import { connect } from 'dva';
import { Select, Button, Table, Icon, Divider, AutoComplete, Input } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TagApproval from '../TagApproval';
import moment from 'moment';

import styles from './index.less';

const Option = Select.Option;

@connect(state => ({
  approval: state['approval']
}))

class Develop extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }

    this.columns = [{
      title: '申请类型',
      dataIndex: 'applyTypeName',
      key: 'applyTypeName',
    },{
      title: '申请要求',
      dataIndex: 'applyDemand',
      key: 'applyDemand',
    },{
      title: '申请名称',
      dataIndex: 'applyTagName',
      key: 'applyTagName',
    },{
      title: '申请人',
      dataIndex: 'applyUser',
      key: 'applyUser',
    },{
      title: '最后处理人',
      dataIndex: 'operateUser',
      key: 'operateUser',
    },{
      title: '最后处理时间',
      dataIndex: 'operateTime',
      key: 'operateTime',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },{
      title: '审批状态',
      dataIndex: 'auditStatusName',
      key: 'auditStatusName',
    },{
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a 
            onClick={() => {this.openTagApproval(record)}} 
            disabled={record.tagType === 1 || (record.tagType === 2 && record.applyType === 3) ? true : false}
          >开发</a>
        </span>
      )
    }]
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'approval/init',
      payload: { page: 'Develop' },
    })
  }

  // 打开标签审批弹框
  openTagApproval = (record) => {
    this.setState({open: true})
    this.props.dispatch({
      type: 'approval/openModal',
      payload: { record, page: 'Develop' },
    })
  } 
  
  // 标签审批弹框确认
  tagApprovalOk = () => {
    this.setState({open: false})
    this.props.dispatch({
      type: 'approval/modalOk',
    }).then(res =>{
      this.setState({open_delete: false})
      let page = this.props.approval.current
      this.props.dispatch({
        type: 'approval/pageChange',
        payload: { page },
      })
    })
  }

  // 下拉框
  selectChange = (key, value) => {
    this.props.dispatch({
      type: 'approval/selectChange',
      payload: { key, value },
    })
  }

  // 搜索
  handleSearch = () =>{
    this.props.dispatch({
      type: 'approval/handleSearch',
    })
  }

  // 分页获取并渲染数据
  pageChange = (page) => {
    this.props.dispatch({
      type: 'approval/pageChange',
      payload: { page },
    })
  } 

  render() {
    const { 
      modalTitle, applyTagName,
      entityList, entityId_chart, entityId_table, 
      applyTypeList, applyType, 
      applyStatusList, applyStatus,
      tableData, total, current
    } = this.props.approval

    return ( 
      <div className={styles.Develop}>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '开发管理' }]} />

        <div className={styles.tableBox}>
          <div className={styles.searchBox}>
            <Select placeholder='请选择' value={entityId_table} onChange={(value) => { this.selectChange('entityId_table', value) }}>
              {entityList.map((v,i) => {
                return <Option value={v.id} key={i}>{v.entityName}</Option>
              })}
            </Select>

            <Select placeholder='请选择' value={applyType} onChange={(value) => { this.selectChange('applyType', value) }}>
              {applyTypeList.map((v,i) => {
                return <Option value={v.applyType} key={i}>{v.applyTypeName}</Option>
              })}
            </Select>

            {/* <Select placeholder='请选择' value={applyStatus} onChange={(value) => { this.selectChange('applyStatus', value) }}>
              {applyStatusList.map((v,i) => {
                return <Option value={v.applyStatus} key={i}>{v.applyStatusName}</Option>
              })}
            </Select> */}

            <Input
              placeholder="请输入关键词进行搜索..." 
              value={applyTagName}
              style={{ width: 200 }}
              onChange={(e) => { this.selectChange('applyTagName', e.target.value) }}
            />
            <Button type="primary" icon="search" onClick={this.handleSearch}>查询</Button>
          </div>

          <Table 
            columns={this.columns} 
            dataSource={tableData} 
            pagination={{
              pageSize: 10,
              total: total,
              current: current,
              showTotal: (total, range) => `当前${range[0]}-${range[1]}条 / 共${total}条`,
              onChange: this.pageChange
            }}
          />

          <TagApproval open={this.state.open} onOk={this.tagApprovalOk} onCancel={() => { this.setState({open: false}) }}/>
        </div>
      </div>
    )
  }
}

export default Develop
