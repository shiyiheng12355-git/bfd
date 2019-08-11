import React, { Component } from 'react';
import { Row, Col, Button,Input, Table,Spin,Select } from 'antd';
import { connect } from 'dva';
import { MasHeader,MasGranularity } from '../../../../../components/MasHeader';
import DownLoadBtn from '../../../../../components/DownLoadBtn';
import MaSelect from '../../../../../components/MaSelect';
import { getDateFormat,formatCurrentValue,formatNumber,transTime  } from '../../../../../utils/utils'
const { Search} = Input;
const Option = Select.Option;
const hash = {
  "newvisitorRate": '新访客占比',
  "newvisitor": '新访客数',
  "pvCount": '浏览量(PV)',
  "uvCount": '访客数（UV）',
  "landingCount":'入口页次数',
  "linkclickCount":'贡献下游浏览量',
  "visitLength":'页面停留总时长',
  "exitCount":'退出次数',
  "sessionLength" : '访问总时长',
  "bounceCount":'跳出次数',
  "bounceRate": '跳出率',
  'exitRate':'退出率',
  "avgVisitLength":'平均停留时长',
  "sessionCount": '访问次数',
  "avgVisitorTime":'平均访问时长',
  "avgAccessPage": '平均访问页数',
}
@connect(state => ({
  pageVisited: state['report/pageVisited'],
  Global: state.LOADING,
}))
export default class PageVisited extends Component {
  state = {
    title: '受访页面',
    visible: false,
    pageType:"",
    hideComparison: true,
    dateType:'today',
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
      },
      {
        title: '页面标题',
        dataIndex: 'p_s',
        width:160,
        render:(item)=>{
          return <div title={item} style={{width:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:"nowrap"}}>{item&&(item.length>6?(item.substring(0,6)+'...'):item)}</div>
        }
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
        title: '贡献下游浏览量',
        dataIndex: 'linkclickCount',
      },
      {
        title: '平均停留时长',
        dataIndex: 'avgVisitLength',
      },
      {
        title: '退出率',
        dataIndex: 'exitRate',
      },
    ],
    selectTable: {
      value: ['pvCount', 'uvCount', 'landingCount', 'avgVisitLength'],
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
            }
          ],
        },
        {
          label: '流量质量指标',
          checkData: [
            {
              label: '入口页次数',
              value: 'landingCount',
            },
            {
              label: '贡献下游浏览量',
              value: 'linkclickCount',
            },
            {
              label: '平均停留时长',
              value: 'avgVisitLength',
            },
            {
              label: '退出页次数',
              value: 'exitCount',
            },
            {
              label: '退出率',
              value: 'exitRate',
            },
          ],
        },
      ],
    },
    
  }

  getColumns = (selectTable)=>{
    
    selectTable = selectTable||this.state.selectTable;
    let columns= [
      {
        title: '序号',
        dataIndex: 'index',
        render:(it,r,i)=>{
          return i+1
        }
      },
      {
        title: '页面标题',
        dataIndex: 'p_s',
        // width:215,
        render:(item)=>{
          return <div title={item} style={{width:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:"nowrap"}}>{item&&(item.length>20?(item.substring(0,20)+'...'):item)}</div>
        }
      },
    ];
    selectTable.value.map(item=>{
      if(item == 'exitRate'||item=='newvisitorRate'){
        columns.push({
          title: hash[item],
          dataIndex: item,
          render:(ite)=>{
            return `${(ite*100).toFixed(2)}%`
          }
        })
      }else if(item == 'avgVisitLength'){
        columns.push({
          title: hash[item],
          dataIndex: item,
          render: (item) => {
            return transTime(item) || 0
          },
        })
      }else{

        columns.push({
          title: hash[item],
          dataIndex: item,
          render:(item)=>{
            return formatNumber(item*1)
          }
        })
      }
    })
    this.setState({
      columns:columns,
      selectTable
    })
  }
  componentDidMount(){
    // console.log(this.props)
    this.props.dispatch({
      type:'report/pageVisited/fetchPcInterviewPageCustomIndex',
      payload:{
        "appkey": this.props.appkey,
        "endDate": getDateFormat("today").endDateStr,
        "pageType":'',
        "prevGroupExpression": this.props.selectedGroupData.includePreGroupConditionJson,
        "startDate": getDateFormat("today").startDateStr
      }
    })
    this.props.dispatch({
      type:'report/pageVisited/fetchPcInterviewPage',
      payload:{
        "appkey": this.props.appkey,
        "endDate": getDateFormat("today").endDateStr,
        "prevGroupExpression": this.props.selectedGroupData.includePreGroupConditionJson,
        "startDate": getDateFormat("today").startDateStr
      }
    })
    this.getColumns()
  }
  componentWillReceiveProps=(nextProps) => {
     const { selectedGroupData, appkey } = nextProps;
    if (selectedGroupData.length !== 0 && selectedGroupData.id !== this.props.selectedGroupData.id || appkey !== this.props.appkey) {
      const { dateType } = this.state;
      this.updateViewData({
        endDate: getDateFormat(dateType).endDateStr,
        startDate: getDateFormat(dateType).startDateStr,
        appkey: appkey,
      })
    }
  }

  /**
   * 更新图数据
   */
  updateViewData = (date)=>{
    const {pageType} = this.state;
    this.props.dispatch({
      type:'report/pageVisited/fetchPcInterviewPage',
      payload:{
        ...date,
        "prevGroupExpression": this.props.selectedGroupData.includePreGroupConditionJson,
        "appkey": date.appkey || this.props.appkey,
      },
      
    })
    this.props.dispatch({
      type:'report/pageVisited/fetchPcInterviewPageCustomIndex',
      payload:{
        ...date,
        "pageType":pageType,
        "prevGroupExpression": this.props.selectedGroupData.includePreGroupConditionJson,
        "appkey": date.appkey || this.props.appkey,
      }
    })
  }
  selectTableChange = (props) => {
    const { selectTable } = this.state
    selectTable.value = props.checked
    this.getColumns(selectTable)
  }
  /**
   * 筛选
   */
  selectChange(type){
    this.state.pageType = type;
    const {dateType} = this.state;
    this.props.dispatch({
      type:'report/pageVisited/fetchPcInterviewPageCustomIndex',
      payload:{
        "appkey": this.props.appkey,
        "endDate": getDateFormat(dateType).endDateStr,
        "startDate": getDateFormat(dateType).startDateStr,
        "pageType":type,
        "prevGroupExpression": this.props.selectedGroupData.includePreGroupConditionJson,
      }
    })
  }
  /**
   * 时间修改
   */
  dateChange = (date)=>{
    this.setState({
      dateType:date
    })
    this.updateViewData({
      "endDate": getDateFormat(date).endDateStr,
      "startDate": getDateFormat(date).startDateStr
    })
  }
  downLoad = ()=>{
    const { columns,dateType } = this.state;
    let head = {};
    columns.map((item,i)=>{
      if(i != 0){
        head[item['dataIndex']] = item['title']
      }
    })
    const { pageVisited } = this.props;
    const {
      pcInterviewPageCustomIndex,
    } = pageVisited
    let data = pcInterviewPageCustomIndex.map(item=>{
      let b = {...item}
      b['avgVisitorTime'] = b['avgVisitorTime']?transTime(b['avgVisitorTime']):0;
      b['exitRate'] = b['exitRate']?`${(b['exitRate']*100).toFixed(2)}%`:0;
      b['newvisitorRate'] = b['newvisitorRate']?`${(b['newvisitorRate']*100).toFixed(2)}%`:0;
      
      return b
    }),
    fileName = `受访页面(${getDateFormat(dateType).startDateStr}至${getDateFormat(dateType).endDateStr})`;
    return {
      head,
      data,
      fileName
    }
    
  }
  render() {
    const { selectTable, columns,dateType,granularity } = this.state
    const { pageVisited,Global } = this.props;
    const {
      dataList,
      pcInterviewPageCustomIndex,
      searchList
    } = pageVisited

    let {head,data,fileName} = this.downLoad();
    return (
      <div>
      <Spin spinning={Global.effects['report/pageVisited/fetchPcInterviewPageCustomIndex'] || Global.effects['report/pageVisited/fetchPcInterviewPage']}>
        <MasHeader 
          dataList={dataList} 
          dateType={dateType} 
          {...this.props}
          hideComparison
          onChange={this.dateChange}
         />
        <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
          <Col span={24}>
            <MaSelect 
              type="table" 
              extra={
                <div style={{float:'right'}}>
                  <Select
                    defaultValue=""
                    style={{width:200,marginRight:20}}
                    onChange={(v)=>{
                      this.selectChange(v)
                    }}
                  >
                    <Option value="">全部受访页面</Option>
                    <Option value="1">受访详情页面</Option>
                  </Select>
                  <Search
                    style={{ width: 240,marginRight:20 }}
                    placeholder={'输入页面标题或URL搜索'}
                    onSearch={value => {
                      this.props.dispatch({
                        type: 'report/pageVisited/getSearch',
                        payload: value
                      });
                    }}
                    enterButton
                  />
                  <div style={{float:'right',color:'green','fontSize': 20,'fontWeight': 700}} ><DownLoadBtn head={head} data={data} fileName={fileName}  /></div>
                </div>}   
              onChange={this.selectTableChange} 
              {...selectTable} />
            <Table columns={columns} dataSource={searchList||pcInterviewPageCustomIndex} rowKey="" />
          </Col>
        </Row>
        </Spin>
      </div>
    )
  }
}