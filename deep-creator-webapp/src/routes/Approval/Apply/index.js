import React from 'react';
import { connect } from 'dva';
import echarts from 'echarts';
import { Radio, Select, Input, Button, Table, Icon, Divider, Modal } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TagApproval from '../TagApproval';
import moment from 'moment';

import styles from './index.less';

const RadioGroup = Radio.Group;
const Option = Select.Option;

@connect(state => ({
  approval: state['approval']
}))

class Apply extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false,
      open_delete: false,
      deleteRecord: '',
    }

    this.itemStyle = {
      normal: {
        // color: function (params) {
        //   const colorList = ['red', 'yellow', 'rgb(42,170,227)', 'rgb(14, 220, 70)', 'rgb(116,124,126)']
        //   return colorList[params.dataIndex];
        // },
        label: {
          show: true,
          position: 'top',
          textStyle: {
            color: '#615a5a'
          },
          // formatter: '     {c}\n\n{a}',
        }

      },
      emphasis: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }

    this.option = {
      color: ['rgb(42,170,227)', 'rgb(203, 236, 30)'],
      backgroundColor: 'rgb(218, 226, 228)',
      legend: {
        data: ['标签分类', '标签名称'],
        top: 15,
      }, 
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '4%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: [],
        axisTick: {
          alignWithLabel: true
        }
      }],
      yAxis: [{
        type: 'value'
      }],
      series: [{
        name: '标签分类',
        type: 'bar',
        barGap: '30%',
        barMaxWidth: 50,
        data: [],
        itemStyle: this.itemStyle,
      }, {
        name: '标签名称',
        type: 'bar',
        barMaxWidth: 50,
        data: [],
        itemStyle: this.itemStyle,
      }]
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
          <a onClick={() => {this.openTagApproval(record)}}>查看</a>
          <Divider type="vertical" />
          <a 
            disabled={record.isMyself && record.auditStatus === 1 ? false : true}
            onClick={()=>{this.setState({deleteRecord: record, open_delete: true})}}
          >取消申请</a>
        </span>
      )
    }]
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'approval/init',
      payload: { page: 'Apply' },
    }).then(res => {
      this.props.approval.chartData.forEach((v,i) => {
        this.option.series[i]['data'] = v.data
      })

      this.option.xAxis[0].data = this.props.approval.xAxis

      let myChart = echarts.init(document.getElementById('chart'))
      myChart.setOption(this.option, true)
      window.onresize = myChart.resize
    })
  }

  // 打开标签审批弹框
  openTagApproval = (record) => {
    this.setState({open: true})
    this.props.dispatch({
      type: 'approval/openModal',
      payload: { record, page: 'Apply' },
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

  // 图表数据切换
  chartChange = (e) => {
    this.props.dispatch({
      type: 'approval/chartChange',
      payload: { entityId: e.target.value },
    }).then(res => {
      this.props.approval.chartData.forEach((v,i) => {
        this.option.series[i]['data'] = v.data
      })

      let myChart = echarts.init(document.getElementById('chart'))
      myChart.setOption(this.option,true)
      window.onresize = myChart.resize
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
      payload: 1,
    })
  }

  // 分页获取并渲染数据
  pageChange = (page) => {
    this.props.dispatch({
      type: 'approval/pageChange',
      payload: { page },
    })
  }

  // 删除申请
  deleteOk = () =>{
    this.props.dispatch({
      type: 'approval/deleteOk',
      payload: this.state.deleteRecord,
    }).then(res =>{
      this.setState({open_delete: false})
      let page = this.props.approval.current
      this.props.dispatch({
        type: 'approval/pageChange',
        payload: { page },
      })
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

    const radioOptions = entityList.map(v => {
      return { label: v.entityName, value: v.id }
    })
    
    return ( 
      <div className={styles.Apply}>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '申请管理' }]} />

        <div className="chartBox">
          <RadioGroup options={radioOptions} onChange={this.chartChange} value={entityId_chart} style={{ marginBottom: 10 }}/>
          <div id="chart" style={{ width: '100%', height: 345 }}></div> 
        </div>

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

            <Select placeholder='请选择' value={applyStatus} onChange={(value) => { this.selectChange('applyStatus', value) }}>
              {applyStatusList.map((v,i) => {
                return <Option value={v.applyStatus} key={i}>{v.applyStatusName}</Option>
              })}
            </Select>

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
        </div>

        <TagApproval open={this.state.open} onOk={this.tagApprovalOk} onCancel={() => { this.setState({open: false}) }}/>

        <Modal
          title="删除申请"
          visible={this.state.open_delete}
          onOk={this.deleteOk}
          onCancel={() => {this.setState({open_delete: false})}}
        >
          <p>确定取消申请"{this.state.deleteRecord.applyTagName}"吗？</p>
        </Modal>
      </div>
    )
  }
}

export default Apply
