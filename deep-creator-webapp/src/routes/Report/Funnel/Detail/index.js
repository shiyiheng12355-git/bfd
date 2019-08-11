import React, {
  Component,
} from 'react'
import { connect } from 'dva';
import {
  Spin, Button,
  Row, Col,
  Switch, Popover,
  notification,
  Select, DatePicker,
  Breadcrumb,
  Tabs, Modal,
  Icon, Popconfirm,
  Card, Form, Input } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import GroupDataFilter from '../../../../components/GroupDataFilter';
import EditModal from '../Add';
import uuidV4 from 'uuid/v4';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import GroupList from '../../../../components/GroupList';

import styles from './index.less';
import { $override } from 'zrender/lib/core/util';
import { Model } from 'echarts/lib/export';


const TabPane = Tabs.TabPane;
const TextArea = Input.TextArea;
const FormItem = Form.Item;
const Option = Select.Option;
/**
 * 工具函数 获取url参数值
 * @param {*} url 
 * @param {*} id 
 */
function GetParam(url, id) {
  url = url+ "";
  let regstr = "/(\\?|\\&)" + id + "=([^\\&]+)/";
  let reg = eval(regstr);//eval可以将 regstr字符串转换为 正则表达式
  let result = url.match(reg);//匹配的结果是：result[0]=?sid=22 result[1]=sid result[2]=22。所以下面我们返回result[2]

  if (result && result[2]) {
      return result[2];
  }
}
@connect(state => ({
  funneldata: state['report/funneldetail'],
  Global: state.LOADING,
}))
@Form.create()
class Detail extends Component {
  funnel_id = ''
  params = {
    ranger: [moment().subtract(0, 'days').format('YYYY-MM-DD'), moment().subtract(0, 'days').format('YYYY-MM-DD')],
  }

  constructor(props) {
    super(props)
    this.funnel_id = GetParam(props.location.search,'id');
    this.GROUPID = GetParam(props.location.search,'GROUPID');//标识是否只为显示
    this.ENTITYID = GetParam(props.location.search,'ENTITYID');//获取实体ID
    if(this.GROUPID){
      this.bizLifeTripInfoParam = {
        bizLifeTripGroupId:GetParam(props.location.search,'bizLifeTripGroupId'),
        bizLifeTripGroupIncludePreGroupConditionJson:"",
        bizLifeTripId:GetParam(props.location.search,'bizLifeTripId'),
        entityId:GetParam(props.location.search,'ENTITYID'),
        groupId:GetParam(props.location.search,'GROUPID'),
        groupIncludePreGroupConditionJson:""
      }
    }
    this.state = {
      groupId: this.GROUPID?{id:this.GROUPID,entityId:this.ENTITYID}:null,
      startDateStr: moment().format('YYYY-MM-DD'),
      endDateStr: moment().format('YYYY-MM-DD'),
      traceModel: false, // 回溯
      traceData: null, // 回溯时间
      menuModel: false, // 收藏弹窗
      editModal: false, // 编辑
      visible: false,
      selRange: {// 选择的时间对象
        point: 'today',
        period: {
          'start-date': moment().format('YYYY-MM-DD'),
          'end-date': moment().format('YYYY-MM-DD'),
        },
        range: [moment().format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
      },
      MenuData: {// 收藏数据
        collectionName: '',
        collectionType: 2,
        contentJson: '',
        menuId: '',
      },
      AddModalKey: uuidV4(), // 新增漏斗弹层key
    };
  }

  componentDidMount() {
    console.log('-------------',this.GROUPID)
    this.props.dispatch({
      type: 'report/funneldetail/fetchFunnelaDetail',
      payload: this.funnel_id,
      GROUPID:this.GROUPID,
      bizLifeTripInfoParam:this.bizLifeTripInfoParam//从生命旅程跳过来的 就是要日了狗了特殊处理
    })
    if(!this.GROUPID){
      this.props.dispatch({
        type: 'report/funneldetail/fetchMenuList',
      })
    }
  }

  // 重置弹层key，丢弃原有数据
  resetModalKey() {
    this.setState({
      addModalKey: uuidV4(),
    })
  }

  // 关闭复制弹层
  handleModalClose=()=> {
    this.setState({
      showAddModal: false,
      visible: false,
    })
  }

  // 切换日期
  handleChangeDate(range) {
    // this.params.ranger = range
    
    this.state.startDateStr = range.period['start-date'];
    this.state.endDateStr = range.period['end-date'];
    this.state.selRange = range;
    let { groupId, startDateStr, endDateStr } = this.state;
    this.props.dispatch({
      type: 'report/funneldetail/fetchFunnelaSearch',
      payload: {
        groupId: groupId.id,
        funnelId: this.funnel_id,
        startDateStr,
        endDateStr,
      },
      GROUPID:this.GROUPID,
      bizLifeTripInfoParam:this.bizLifeTripInfoParam//从生命旅程跳过来的 就是要日了狗了特殊处理
    })
  }


  // 收藏
  saveMenuList () {
    let { groupId, startDateStr, endDateStr, MenuData } = this.state;
    const { funneldata } = this.props;
    const {funnelaDetail} = funneldata;
    MenuData.collectionName = funneldata.funnelaDetail.funnelName;
    MenuData.entityId = -1;
    MenuData.contentJson = JSON.stringify({
      groupId: groupId.id,
      funnelId: this.funnel_id,
      startDateStr,
      endDateStr,
    });
    this.props.dispatch({
      type: 'report/funneldetail/fetchSaveMenuList',
      payload: MenuData,
      callback: () => {
        
        this.setState({
          menuModel: false,
        })
      },
    })
  }


  // 切换状态
  handleChangeStatus=(value)=> {
    let { funneldata } = this.props;
    let { funnelaDetail } = funneldata;
    this.props.dispatch({
      type: 'report/funnel/fetchMonitor',
      payload: {
        funnelId: this.funnel_id,
        isMonitor: value,
      },
      callback: () => {
        funnelaDetail.isMonitor = value;
        this.props.dispatch({
          type: 'report/funneldetail/getFunnelaDetail',
          payload: {
            funnelaDetail,
          },
        })
      },
    })
  }
  // 选择用户群
  selGroup(value) {
    this.state.groupId = value;
    let { groupId, startDateStr, endDateStr } = this.state;
    this.props.dispatch({
      type: 'report/funneldetail/fetchFunnelaSearch',
      payload: {
        groupId: groupId.id,
        funnelId: this.funnel_id,
        startDateStr,
        endDateStr,
      },
    })
  }
  // 删除
  handleDelete(funnel_id, type) {
    console.log('删除', funnel_id)
    this.props.dispatch({
      type:'report/funnel/fetchFunnelCollection',
      payload:funnel_id,
      callback:(data)=>{
        if(data){
          notification.open({
            message: '提示',
            description: '该漏斗已收藏，请先删除收藏！',
            icon:  <Icon type="exclamation-circle" style={{ color: 'red' }} />,
          });
        }else{

          this.props.dispatch({
            type: 'report/funnel/fetchDelById',
            payload: funnel_id,
            callback:()=>{
              const { history } = this.props;
              history.push({
                pathname: '/report/funnel',
              })
            }
          })
        }
      }
    })
  }


  // 回溯漏斗
  rebackFunnel() {
    const state = this.state
    const { funneldata } = this.props;
    const {
      funnelaDetail } = funneldata;
    this.props.dispatch({
      type: 'report/funneldetail/fetchIsTrace',
      payload: this.funnel_id,
      callback: (isTrace) => {
        if (isTrace==true) {
          
          this.setState({
            traceModel: true,
            traceData: null,
          })
        } else {
          notification.open({
            message: '提示',
            description: `正在回溯至${state.traceData ? state.traceData.format('YYYY-MM-DD') : moment(funnelaDetail.traceBackStartDate).format('YYYY-MM-DD')}`,
            icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
          });
        }
      },
    })
  }


  // 开始回溯
  startreBack() {
    const { traceData } = this.state;
    if (traceData) {
      this.props.dispatch({
        type: 'report/funneldetail/fetchTraceData',
        payload: {
          funnelId: this.funnel_id,
          backDate: traceData.format('YYYY-MM-DD'),
        },
        callback: () => {
          this.setState({
            traceModel: false,
          })
        },
      })
    } else {
      notification.open({
        message: '提示',
        description: '请选择时间',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    }
  }
  // 编辑漏斗
  editForm() {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);
        this.props.dispatch({
          type: 'report/funneldetail/fetchEditFnnel',
          payload: {
            funnelId: this.funnel_id,
            funnelName: values.funnelName,
            funnelDesc: values.funnelDesc || '',
          },
          callback: () => {
            this.setState({
              editModal: false,
            })
            this.form.resetFields();
          },
        })
      }
    })
  }
  // 复制漏斗弹窗
  openCopeModal() {
    this.setState({
      visible: true,
    })
  }

  openEditModal=()=> {
    this.setState({
      editModal: true,
    })
  }
  // 点步骤显示用户群详情参数组装
  TGIParams = (data, next, type) => {
    const { groupId, selRange } = this.state;
    const { funneldata } = this.props;
    const { funnelaDetail } = funneldata;
    let acrossPlatform = data.isAcrossPlatform == 1 ? JSON.parse(data.acrossPlatformJson) : null;
    console.log(selRange);
    let date;
    let TGIParamsData = {};
    if(this.GROUPID){
      date = selRange.point?{point: selRange.point}:{period: {
        end_date: selRange.range[1],
        start_date: selRange.range[0],
      }};
      TGIParamsData = {
        bizLifeTripInfoParam:this.bizLifeTripInfoParam,
        entityId: groupId && groupId.entityId,
        groupExpression: {
          date: date,
          is_across_platform:acrossPlatform ? 1 : 0,
          next_node: {
            node_id: next ? next.id : '',
          },
          node: {
            node_id: data.id,
          },
          tree_id: data.funnelId,
        },
        type, // funnel/funnel_lost
      }
      if(type == 'funnel'){
        delete TGIParamsData.groupExpression.next_node
      }
    }else{
      date = selRange.point?{point: selRange.point}:{period: {
        endDate: selRange.range[1],
        startDate: selRange.range[0],
      }};
      TGIParamsData = {
        entityId: groupId && groupId.entityId,
        entity_english_name: '',
        group_expression: {
          date: date,
          is_across_platform:acrossPlatform ? 1:0,
          next_node: {
            // cross_param: acrossPlatform ? acrossPlatform.cross_next : '',
            node_id: next ? next.id : '',
          },
          node: {
            // cross_param: acrossPlatform ? acrossPlatform.cross_last : '',
            node_id: data.id,
          },
          tree_id: data.funnelId,
        },
        group_id: '',
        longGroupId: groupId && groupId.id,
        prev_group_expression: '',
        type, // funnel/funnel_lost
      }
      if(type == 'funnel'){
        delete TGIParamsData.group_expression.next_node
      }
    }
    return TGIParamsData
  }
  // 跳转用户群详情
  jumpGroupDetail(data,personNumber) {
    const { history } = this.props;
    // let path = history.createHref('/groups',{})
    if (!data.entityId) {
      notification.open({
        message: '提示',
        description: '请选择用户群',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      return false
    }
    console.log(data);
    history.push({
      pathname: `/groups/${data.entityId}/temp`,
      state: {
        TGItype: this.GROUPID==undefined?'FUNNEL':'LIFEFUNNEL',
        TGIParams: data,
        entityName:'用户',
        personNumber:personNumber//覆盖人数
      },
    })
  }
  // 主容器
  containMain(funnel_data, funnelaDetailList) {
    const state = this.state
    const funnelname = funnel_data.funnelName;
    return (
      <div className={styles['main-contain']}>
        <div className={styles['contain-title']}>

          {this.GROUPID==undefined?<a className={styles.return}
            title='返回'
            onClick={() => {
            const { history } = this.props;
            history.push({
              pathname: '/report/funnel',
            })
          }}><Icon type="rollback" /></a>:null}
          <h2>{funnel_data.funnelName}</h2>
          <p>
            <span className={styles['menu-list']}>窗口期：{funnel_data.windowPeriod % 24 == 0 ? `${funnel_data.windowPeriod / 24}天` : `${funnel_data.windowPeriod}小时`}</span>
            <span className={styles['menu-list']}>数据统计时段：{moment(funnel_data.traceBackStartDate).format('YYYY-MM-DD')}之后</span>
            {this.GROUPID==undefined?<span className={styles['menu-list']} style={{ cursor: 'help' }} title="用来控制该漏斗从此刻起在时间上是否继续向后进行数据监听，若为关闭状态则停止监听。" >状态：</span>:null}
            {this.GROUPID==undefined?<Switch checked={Boolean(funnel_data.isMonitor)} onChange={this.handleChangeStatus} checkedChildren="监听" unCheckedChildren="停用" />:null}
          </p>
          {this.GROUPID==undefined?<Popconfirm title={Boolean(funnel_data.isMonitor)?'该漏斗正在监听，确认删除？':"确定删除?"}
            onConfirm={() => {
              this.handleDelete(funnel_data.id)
            }}
            okText="确定"
            cancelText="取消">
            <a className={styles.trash} title='删除漏斗'><Icon type="delete" /></a>
          </Popconfirm>:null}
          {this.GROUPID==undefined?<a className={styles.trash}
            style={{ right: '0px' }}
            title='复制漏斗'
            onClick={() => {
            this.openCopeModal()
            }}><Icon type="copy" /></a>:null}
          {this.GROUPID==undefined?<a className={styles.trash} style={{ right: '40px' }} title='编辑漏斗' onClick={this.openEditModal}><Icon type="edit" /></a>:null}

      </div>
        {
    funnel_data.funnelDesc && funnel_data.funnelDesc.replace(/\s/g,'') &&
      <Popover placement="topLeft" content={<div style={{maxWidth:400,wordWrap: 'break-word'}}>{funnel_data.funnelDesc}</div>}>
        <div className={styles.desc}>说明 :{funnel_data.funnelDesc}</div>
      </Popover>
    }
    <div className={styles['main-contaner-table']}>
      <div className={styles['main-contaner']}>
        {funnel_data.bizFunnelStepPO && funnel_data.bizFunnelStepPO.map(function (item, step) {
          let data = item.eventParamJson ? JSON.parse(item.eventParamJson).action : {};
          let entry_count = '暂无',//进入漏斗人数
              entry_next = '暂无',//未进入下一步漏斗人数
              entry_ratio = '暂无',
              trans_ratio = '暂无';
          if (funnelaDetailList && item) {
            entry_count = funnelaDetailList[item.id+''];
            if(entry_count != undefined){
              
              if(step != funnel_data.bizFunnelStepPO.length-1){
                entry_next = (funnelaDetailList[item.id+'']-funnelaDetailList[funnel_data.bizFunnelStepPO[step + 1].id+''])
              }
              if (step == 0) {
                entry_ratio = '100%';
                trans_ratio = '100%';
                
              } else {
                entry_ratio = `${(funnelaDetailList[item.id+''] * 100 / funnelaDetailList[funnel_data.bizFunnelStepPO[step - 1].id+'']).toFixed(2)}%`;
                trans_ratio = `${(funnelaDetailList[item.id+''] * 100 / funnelaDetailList[[funnel_data.bizFunnelStepPO[0].id+'']]).toFixed(2)}%`;
              }
            }else{
              entry_count = '暂无'
            }
          }
          return (
            <div key={item.id} style={{ position: 'relative' }}>
              <div className={`${styles['eachfunel-list']} ${styles[`eachfunel-list0${item.stepNum < 8 ? item.stepNum : '8'}`]}  ${styles[`eachfunel-list-width0${item.stepNum < 8 ? item.stepNum : '8'}`]} ${styles.list}`}>
                <div className={styles['eachfunel-list-font']}>
                  <h3 style={{ color: '#fff' }}>步骤{item.stepNum}:
                      <span>
                      <a href="javascript:void(0);"
                        onClick={() => {
                          this.jumpGroupDetail(this.TGIParams(item, funnel_data.bizFunnelStepPO[step + 1], 'funnel'),entry_count);
                        }}
                      >
                        <span>{item.stepName}</span>
                      </a>
                      <span style={{ marginLeft: '20px', fontSize: '14px' }} >
                        <Popover
                          title={[`客户端：${data.appName || ''}`,<br key={1} />,data.eventName ? `事件[${data.eventName}]：${data.eventCondition}${data.event.count}` : '暂无事件']}
                          content={(data.paramsName && data.paramsName.length > 0) ? data.paramsName.map((ite, i) => {
                            return <span key={i}>{`${ite}：${data.paramsCondition[i]} ${data.event_params[i].param_value}`}</span>
                          }) : '暂无参数'}>
                          客户端：{data.appName || ''}
                        </Popover>
                      </span>
                    </span>
                  </h3>
                  <p style={{ fontSize: 14 }}>
                    <span>人数：[{entry_count}]</span>
                    <span>转化率：[{entry_ratio}]</span>
                    <span>到达率：[{trans_ratio}]</span>
                  </p>
                </div>
              </div>
              {funnel_data.bizFunnelStepPO[step + 1] ?
                <div className={styles.funnelStepBtn}
                onClick={() => {
                  this.jumpGroupDetail(this.TGIParams(item, funnel_data.bizFunnelStepPO[step + 1], 'funnel_lost'),entry_next);
                }}
              >未进入下一步人群</div> : null}

            </div>
          )
        }, this)}
      </div>
    </div>
      </div>)
  }

  // 渲染函数
  render() {
    const state = this.state;
    const { funneldata, Global, form } = this.props;
    const {
      ifloading,
      funnelaDetail,
      groupList,
      menuList,
      funnelaDetailList,
      entityList } = funneldata;
    const { global,effects } = Global;
    const { getFieldDecorator } = form;
    if (!state.groupId) {
      this.state.groupId = (groupList && entityList.length > 0) ? groupList[`${entityList[0].id}`][0] : null;
    }

    return (
      <PageHeaderLayout>
        <Spin spinning={global||effects['report/funneldetail/fetchTabGroup']} style={{ width: '100%' }}>
        <div className={styles.funneldetal}>
          <div className={styles.bt} style={{display:this.GROUPID==undefined?'block':'none'}}>
            <h2>实时行为漏斗</h2>
            <div className={styles['main-mid-head']}>
              <Button type="primary"
              style={{ marginRight: 10 }}
              onClick={() => {
                this.rebackFunnel()
              }}>回溯漏斗历史数据</Button>
              <Button type="primary"
                onClick={() => {
                
                if(menuList.length == 0){
                  notification.open({
                    message: '提示',
                    description: '请先创建收藏夹',
                    icon: <Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
                  });
                  return false
                }
                this.setState({
                  menuModel: true,
                  MenuData: {
                    collectionName: '',
                    collectionType: 2,
                    contentJson: '',
                    menuId: '',
                  },
                })
              }}><Icon type="star-o" />收藏漏斗</Button>
          </div>
        </div>
        
          <div className={styles.padding20}>
            {this.GROUPID==undefined?<Card style={{ marginBottom: 10 }} >
              {entityList && entityList.length > 0 ?
                <Tabs onChange={(key) => {
                  if (!groupList[`${key}`]) {
                    this.props.dispatch({
                      type: 'report/funneldetail/fetchGetUser',
                      payload: key,
                    })
                  }
                }}>
                  {entityList.map((item) => {
                    return (<TabPane tab={item.entityName} key={`${item.id}`}>{
                      groupList[`${item.id}`] && groupList[`${item.id}`].length > 0 ?
                        <GroupList
                          onChange={(value) => {
                            this.selGroup(value)
                          }}
                          pageChange={(data)=>{
                            this.props.dispatch({
                              type:'report/funneldetail/fetchTabPageGroup',
                              payload:{
                                groupList:data,
                                entityId:item.id
                              }
                            })
                          }}
                          value={state.groupId}
                          groupData={groupList[`${item.id}`]} /> :
                        '暂无数据'}
                    </TabPane>)
                  })}
                </Tabs> : '暂无数据'
              }
            </Card>:null}
            <Card>
              <div className={styles.dateleft}>
                <GroupDataFilter
                  selected="today"
                  onChange={(range) => {
                    this.handleChangeDate(range)
                  }}
                />
              </div>
            </Card>
            
              {funnelaDetail && this.containMain(funnelaDetail, funnelaDetailList)}
            

          </div>
        
        {/* 回溯弹框 */}
        <Modal
          maskClosable={false}
          title="回溯漏斗历史数据"
          visible={state.traceModel}
          onOk={() => {
            this.startreBack()
          }}
          width={600}
          wrapClassName={styles.funneldetal}
          onCancel={() => { this.setState({ traceModel: false }) }}
        >

        <Popover content={(
            <div>
              <p style={{ color: 'red' }}>回溯是指设置一个漏斗创建时间之前的日期用以追溯历史数据</p>
            </div>
          )}
          title="回溯说明">
          <Icon type="question-circle" style={{ position: 'absolute', top: '18px', left: '160px', color: '#999', fontSize: '18px' }} />
        </Popover>

          <div className={styles['back-left']}>
            <h4>
              <label>当前漏斗数据统计时段：</label>
              {funnelaDetail && moment(funnelaDetail.traceBackStartDate).format('YYYY-MM-DD')} 之后
            </h4>
            <h4>
              <label>数据回溯日期：</label>
              <DatePicker
                format="YYYY-MM-DD"
                value={state.traceData}
                disabledDate={(current) => {
                  if (funnelaDetail) {
                    return current && current > moment(funnelaDetail.traceBackStartDate);
                  } else {
                    return false
                  }
                }}
                onChange={(value, formated) => {
                  this.setState({
                    traceData: value,
                  })
                }} />
            </h4>
            <h4>
              <label>当前回溯状态：</label>
              已完成
            </h4>
          </div>

        </Modal>
        {/* 编辑漏斗 */}
        <Modal
          maskClosable={false}
          title="编辑转化漏斗"
          visible={state.editModal}
          onOk={() => {
            this.editForm();
          }}
          width={600}
          onCancel={() => { 
            this.props.form.resetFields();
            this.setState({ editModal: false })
          }}
        >
          <Form>
            <FormItem label="漏斗名字">
              {getFieldDecorator('funnelName', {
                initialValue: funnelaDetail ? funnelaDetail.funnelName : '',
                rules: [{
                  required: true, message: '请输入漏斗名字',
                },
                {
                  validator: (rule, value, callback) => {
                    if (value == funnelaDetail.funnelName) {
                      callback();
                    } else {
                      this.props.dispatch({
                        type: 'report/funelAdd/fetchReName',
                        payload: value,
                        callback: (type) => {
                          if (type) {
                            callback('漏斗已存在，请重新输入!')
                          } else {
                            callback();
                          }
                        },
                      });
                    }
                  },
                }],
              })(
                <Input placeholder="请输入漏斗名字" />
                )}
            </FormItem>
            <FormItem label="漏斗描述">
              {getFieldDecorator('funnelDesc', {
                initialValue: funnelaDetail ? funnelaDetail.funnelDesc : '',
                rules: [{
                  max: 100, message: '漏斗描述不得超过100个字符',
                }]
              })(
                <TextArea placeholder="请输入模板描述" />
                )}
            </FormItem>
          </Form>
        </Modal>
         {/* 复制漏斗  */}
        <Modal maskClosable={false} width={900} title="复制转化漏斗" afterClose={() => { this.resetModalKey() }} footer={null} visible={state.visible} key={this.state.addModalKey} onCancel={this.handleModalClose}>
          <EditModal data={_.cloneDeep(funnelaDetail)} onCancel={this.handleModalClose} />
        </Modal>
        {/* 收藏漏斗 */}
        <Modal
          maskClosable={false}
          title="收藏转化漏斗"
          visible={state.menuModel}
          onOk={() => {
            this.saveMenuList();
          }}
          width={400}
          onCancel={() => { this.setState({ menuModel: false }) }}
        >
          {/* <Row style={{
            marginBottom: 20,
          }}>
            <Col span={8}>
              <span>报表名称</span>
            </Col>
            <Col span={16}>
              <Input type="text"
                onChange={(e) => {
                let { MenuData } = this.state;
                  MenuData.collectionName = e.target.value;
                  this.setState({
                    MenuData: {
                      ...MenuData,
                    },
                  });
              }} />
            </Col>
          </Row> */}
          <Row>
            <Col span={8}>
              <span>添加到菜单</span>
            </Col>
            <Col span={16}>
              <Select
                style={{ width: 236 }}
                defaultValue={""}
                onChange={(value) => {
                  let { MenuData } = this.state;
                  MenuData.menuId = value;
                  this.setState({
                    MenuData: {
                      ...MenuData,
                    },
                  });
                }}
              >
              <Option value='' >请选择</Option>
              {menuList && menuList.map((item, i) => {
                return <Option key={i} refData={item} value={item.id}>{item.menuName}</Option>
              })}
              </Select>
            </Col>
          </Row>
        </Modal>
      </div>
      </Spin>
      </PageHeaderLayout>
    )
  }
}
export default Detail
