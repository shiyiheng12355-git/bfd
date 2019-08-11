import React, { Component } from 'react';
import { connect } from 'dva'
import { Tabs, Row, Col, Select, Input, Button, InputNumber, Spin } from 'antd'
import moment from 'moment';
import ReportChart from './ReportChart'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout'
import GroupList from '../../../components/GroupList'
import GroupDataFilter from '../../../components/GroupDataFilter'
import styles from './index.less'

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';

@connect(state => (
  {
    entityList: state['report/eventReport'].entityList, //  实体列表
    entityId: state['report/eventReport'].entityId, //  所选实体id
    groupList: state['report/eventReport'].groupList, //  用户群列表
    clientList: state['report/eventReport'].clientList, //  客户端列表
    eventList: state['report/eventReport'].eventList, //  时间列表
    appkey: state['report/eventReport'].appkey, //  appkey
    selectedGroupData: state['report/eventReport'].selectedGroupData, //  所选用户群数据
    selectedEventData: state['report/eventReport'].selectedEventData, //  所选事件数据
    eventParamsList: state['report/eventReport'].eventParamsList, //  事件参数列表
    eventParamsTips: state['report/eventReport'].eventParamsTips, //  事件参数提示
    dimensionList: state['report/eventReport'].dimensionList, //  维度列表
    selectedDimension: state['report/eventReport'].selectedDimension, //  所选维度
    selectedEventPramsData: state['report/eventReport'].selectedEventPramsData, //  所选事件参数数据
    radioDimension: state['report/eventReport'].radioDimension, //  所选事件参数数据
    auths: state.user.auths,
    Global: state.LOADING,
  }
))
export default class EventReport extends Component {
  state = {
    eventCount: null,
    eventType: 'eq',
    resetDate: false,
    eventParamVal: [],
    eventParamType: [],
    entityId: null,
    paramsRelotion: 'and',
    selectedDate: [moment().format(dateFormat), moment().format(dateFormat)],
    reportParams: {},
    showReport: false,
    reportCount: 0,
    date: {
      period: {
        startDate: moment().format(dateFormat),
        endDate: moment().format(dateFormat),
      },
      point: 'today',
    },
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'report/eventReport/fetchEntityList',
    })
    this.props.dispatch({
      type: 'report/eventReport/fetchClientList',
    })
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: {
        parentKey: 'bbgl_zxsjbb',
      },
    });
  }

  handleGroupChange = (val) => {
    this.props.dispatch({
      type: 'report/eventReport/changeSelectedGroupData',
      payload: val,
    })
  }

  changeActiveTab = (key) => {
    this.props.dispatch({
      type: 'report/eventReport/fetchGroupList',
      payload: Number(key),
    })
    this.props.dispatch({
      type: 'report/eventReport/setEntityId',
      payload: Number(key),
    })
  }

  addEventParams = () => {
    const eventId = this.props.selectedEventData
    const index = this.props.selectedEventPramsData.length
    const { eventParamsList, eventList } = this.props
    const { eventParamType } = this.state
    eventParamType[index] = 'eq'
    this.setState({ eventParamType })
    if (index === 0) {
      this.props.dispatch({
        type: 'report/eventReport/fetchEventParamsList',
        payload: { eventId, index },
      })
    } else {
      this.props.dispatch({
        type: 'report/eventReport/changeSelectedEventParamsData',
        payload: { paramId: eventParamsList[0].paramId, index },
      })
      this.props.dispatch({
        type: 'report/eventReport/fetchEventParamsTips',
        payload: { index, columnName: eventParamsList[0].fieldName, actionName: eventList[0].action_name },
      })
    }
  }

  addDimension = () => {
    const data = this.props.dimensionList[0].paramId
    const index = this.props.selectedDimension.length
    this.props.dispatch({
      type: 'report/eventReport/changeSelectedDimension',
      payload: { data, index },
    })
  }

  delParams = (index, type) => {
    if (type === 'eventParams') {
      this.props.dispatch({
        type: 'report/eventReport/delEventParams',
        payload: index,
      })
    } else {
      this.props.dispatch({
        type: 'report/eventReport/delDimesion',
        payload: index,
      })
    }
  }

  handleChangeDate = (val) => {
    const { date } = this.state
    date.period.startDate = val.period['start-date']
    date.period.endDate = val.period['end-date']
    date.point = val.point
    this.setState({ selectedDate: val.range, date })
  }

  handleEventCount = (value) => {
    this.setState({ eventCount: value })
  }

  handleChangeCilent = (val) => {
    const { clientList } = this.props
    const selectedItem = clientList.find((item) => {
      return item.appkey === val
    })
    this.props.dispatch({
      type: 'report/eventReport/fetchEventList',
      payload: selectedItem.appkey,
    })
  }

  handleChangeEvent = (val) => {
    this.props.dispatch({
      type: 'report/eventReport/changeSelectedEventData',
      payload: val,
    })
    this.props.dispatch({
      type: 'report/eventReport/fetchDimension',
      payload: { eventId: val },
    })
  }

  handleChangeEventType = (val) => {
    this.setState({ eventType: val })
  }

  handleChangeEventParamsRelation = (val) => {
    this.setState({ paramsRelotion: val })
  }

  handleChangeEventParams = (val, index) => {
    const { eventParamsList, selectedEventData, eventList } = this.props
    const param = eventParamsList.find((x) => {
      return x.paramId === val
    })
    const event = eventList.find((x) => {
      return x.id === selectedEventData
    })
    this.props.dispatch({
      type: 'report/eventReport/changeSelectedEventParamsData',
      payload: { paramId: val, index },
    })
    this.props.dispatch({
      type: 'report/eventReport/fetchEventParamsTips',
      payload: { columnName: param.fieldName, actionName: event.action_name, index },
    })
  }

  handleChangeEventParamsType = (val, index) => {
    const { eventParamType } = this.state
    eventParamType[index] = val
    this.setState({ eventParamType })
  }

  handleChangeEventParamsTips = (val, index) => {
    const { eventParamVal } = this.state
    eventParamVal[index] = val
    this.setState({ eventParamVal })
  }

  handleChangeDimension = (val, index) => {
    this.props.dispatch({
      type: 'report/eventReport/changeSelectedDimension',
      payload: { data: val, index },
    })
    this.props.dispatch({
      type: 'report/eventReport/setRadioDimension',
      payload: val,
    })
  }

  viewReport = (index, type) => {
    const {
      selectedEventData,
      selectedGroupData,
      eventList,
      entityList,
      entityId,
      appkey,
      eventParamsList,
      selectedEventPramsData,
      dimensionList,
      radioDimension,
      selectedDimension,
    } = this.props

    const {
      eventCount,
      eventType,
      eventParamType,
      eventParamVal,
      selectedDate,
      paramsRelotion,
      reportCount,
    } = this.state

    const params = {
      id: selectedGroupData.id,
      // id: 1,
      entityEnglishName: '',
      groupExpression: {
        action: {
          appkey: [],
          event: {},
          date: {
            end_date: selectedDate[1],
            start_date: selectedDate[0],
          },
          relation: paramsRelotion,
          event_params: [],
        },
        dimension: '',
        index: index || ['event_user', 'event_number'],
      },
    }

    const { entityEnglishName } = entityList.find((x) => {
      return x.id === entityId
    })
    const event = eventList.find((x) => {
      return x.id === selectedEventData
    })
    console.log(selectedDimension)
    if (type !== 'report') {
      this.props.dispatch({
        type: 'report/eventReport/setRadioDimension',
        payload: selectedDimension[0],
      })
      params.groupExpression.dimension = dimensionList.find((x) => {
        return x.paramId === selectedDimension[0]
      }).fieldName
    } else {
      params.groupExpression.dimension = dimensionList.find((x) => {
        return x.paramId === radioDimension
      }).fieldName
    }

    params.entityEnglishName = entityEnglishName
    params.groupExpression.action.appkey[0] = appkey
    params.groupExpression.action.event.condition = eventType
    params.groupExpression.action.event.count = eventCount
    params.groupExpression.action.event.actionname = event.action_name

    selectedEventPramsData.map((item, i) => {
      params.groupExpression.action.event_params.push(
        {
          param_name: eventParamsList.find((x) => {
            return x.paramId === item
          }).fieldName,
          param_condition: eventParamType[i],
          param_value: eventParamVal[i],
        }
      )
    })

    this.setState({ reportParams: params, showReport: true, reportCount: reportCount + 1 })
    params.groupExpression = JSON.stringify(params.groupExpression)
    this.props.dispatch({
      type: 'report/eventReport/fetchReport',
      payload: params,
    })
  }

  reset = () => {
    let resetDate = !this.state.resetDate
    this.setState({ showReport: false, eventCount: null, eventType: 'eq', resetDate })
    this.props.dispatch({
      type: 'report/eventReport/fetchEntityList',
    })
    this.props.dispatch({
      type: 'report/eventReport/fetchClientList',
    })
  }

  renderTabs = () => {
    const { entityList, groupList, selectedGroupData } = this.props
    return entityList && entityList.length !== 0 ?
      (<Tabs onChange={this.changeActiveTab} type="line" >
        {
          entityList.map((item, i) => {
            return (
              <TabPane tab={item.entityName} key={item.id}>
                <GroupList 
                  value={selectedGroupData} 
                  groupData={groupList} 
                  pageChange={(data)=>{
										this.props.dispatch({
											type: 'report/eventReport/getGroupListDetail',
											payload: data,
										})
									}}
                  onChange={this.handleGroupChange} />
              </TabPane>
            )
          })
        }
      </Tabs>)
      : ''
  }

  renderDimension = (list) => {
    const { dimensionList } = this.props
    if (!dimensionList) return
    return list && list.map((item, i) => {
      return (
        <Row key={i} type="flex" justify="space-around" align="middle" style={{ marginTop: 32 }}>
          <Col span={2}>{i === 0 ? <div style={{ textAlign: 'right' }}>查看维度：</div> : ''}</Col>
          <Col span={22}>
            <Select value={item} style={{ width: 160 }} onSelect={(val) => { this.handleChangeDimension(val, i) }}>
              {
                dimensionList.map((group) => {
                  return (<Option key={group.paramId} value={group.paramId}>{group.paramBizDesc}</Option>)
                })
              }
            </Select>
            {i !== 0 ? <a href="javascript:;" style={{ color: '#f00', marginLeft: 8 }} onClick={() => { this.delParams(i, 'dimension') }}>删除</a> : ''}
          </Col>
        </Row>
      )
    })
  }

  renderEventParams = (list) => {
    const { eventParamsList, eventParamsTips } = this.props
    const { eventParamType, paramsRelotion } = this.state
    return (list && list.map((item, i) => {
      return (
        <div className={styles['add-hang-k']} key={i}>
          <div className={styles.lianjie}>
            参数：
          </div>
          <Select
            value={item}
            style={{ width: 160 }}
            onSelect={(val) => { this.handleChangeEventParams(val, i) }}
            className={styles['params-left']}
          >
            {
              eventParamsList.map((group) => {
                return <Option key={group.paramId} value={group.paramId}>{group.paramBizDesc}</Option>
              })
            }
          </Select>

          <Select
            value={eventParamType[i]}
            style={{ width: 80, marginLeft: 8 }}
            onSelect={(val) => { this.handleChangeEventParamsType(val, i) }}
            className={styles['params-right']}
          >
            <Option value="eq">等于</Option>
            <Option value="nwq">不等于</Option>
            <Option value="in">包含</Option>
            <Option value="nin">不包含</Option>
            <Option value="be">开头是</Option>
            <Option value="nbe">开头不是</Option>
            <Option value="en">结尾是</Option>
            <Option value="nen">结尾不是</Option>
          </Select>

          <Select
            mode="combobox"
            style={{ width: 160, marginLeft: 16 }}
            onChange={(val) => { this.handleChangeEventParamsTips(val, i) }}
            className={styles['url-right']}
          >
            {
              eventParamsTips.length === i + 1 && eventParamsTips[i].map((group, index) => {
                return <Option key={index} value={group} >{group}</Option>
              })
            }
          </Select>

          <a className={styles.lajitong} href="javascript:;" style={{ color: '#f00', marginLeft: 8 }} onClick={() => { this.delParams(i, 'eventParams') }}>删除</a>

        </div>
      )
    }))
  }

  render() {
    const {
      eventType,
      showReport,
      reportCount,
      reportParams,
      date,
      eventCount,
      resetDate,
      paramsRelotion,
    } = this.state
    const {
      appkey,
      clientList,
      eventList,
      selectedEventData,
      selectedEventPramsData,
      selectedDimension,
      Global,
    } = this.props
    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '报表管理' }, { title: '在线事件报表' }]}>
        <Row style={{ background: '#fff', padding: '8px 16px' }}>
          <Col span={24}>{this.renderTabs()}</Col>
        </Row>
        <Row style={{ background: '#fff', padding: 16, marginTop: 16 }}>
          <Row type="flex" justify="space-around" align="middle">
            <Col span={2}>选择查看时段：</Col>
            <Col span={22}>
              <GroupDataFilter selected='today' reset={resetDate} onChange={this.handleChangeDate} />
            </Col>
          </Row>
          <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 32 }}>
            <Col span={24}>选择查询条件：</Col>
          </Row>
          <div style={{ position: 'relative' }}>
            <div className={styles.tanchu}>
              <div className={styles['behavior-combination-con']}>
                <div className={styles.screen2}>
                  <Row>
                    <div className={styles.shou}>客户端：</div>
                    <Select
                      value={appkey}
                      style={{ width: 160 }}
                      onSelect={this.handleChangeCilent}
                      className={styles.eventwidth}
                    >
                      {
                        clientList && clientList.map((item, i) => {
                          return <Option key={i} value={item.appkey}>{item.appkeyName}</Option>
                        })
                      }
                    </Select>
                  </Row>

                  <Row className={styles['action-hang']}>
                    <div className={styles.shou}>事件：</div>
                    <Select value={selectedEventData} style={{ width: 160, marginLeft: 70 }} onSelect={this.handleChangeEvent}>
                      {
                        eventList && eventList.map((item, i) => {
                          return <Option key={item.id} value={item.id}>{item.action_name_cn}</Option>
                        })
                      }
                    </Select>

                    <Select value={eventType} style={{ width: 80, marginLeft: 16 }} onSelect={this.handleChangeEventType}>
                      <Option value="eq">等于</Option>
                      <Option value="gt">大于</Option>
                      <Option value="lt">小于</Option>
                    </Select>
                    <InputNumber value={eventCount} style={{ marginLeft: 16, width: 160 }} onChange={this.handleEventCount} /> 次
                </Row>
                </div>
                <div className={styles['add-hang']}>
                  {this.renderEventParams(selectedEventPramsData)}
                </div>
                <div className={styles.qie2}>
                  <Select value={paramsRelotion} style={{ width: 100 }} onSelect={this.handleChangeEventParamsRelation}>
                    <Option value='and'>全部满足</Option>
                    <Option value='or'>任意满足</Option>
                  </Select>
                </div>
                <a href="javascript:;" className={styles['add-sj']} onClick={this.addEventParams}>增加事件参数</a>
              </div>
            </div>
          </div>


          {/* <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }}>
            <Col span={2}><div style={{ textAlign: 'right' }}>客户端：</div></Col>
            <Col span={22}>
              <Select value={appkey} style={{ width: 160 }} onSelect={this.handleChangeCilent}>
                {
                  clientList && clientList.map((item, i) => {
                    return <Option key={i} value={item.appkey}>{item.appkeyName}</Option>
                  })
                }
              </Select>

            </Col>
          </Row>
          <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }}>
            <Col span={2}><div style={{ textAlign: 'right' }}>事件：</div></Col>
            <Col span={22}>
              <Select value={selectedEventData} style={{ width: 160 }} onSelect={this.handleChangeEvent}>
                {
                  eventList && eventList.map((item, i) => {
                    return <Option key={item.id} value={item.id}>{item.action_name_cn}</Option>
                  })
                }
              </Select>

              <Select value={eventType} style={{ width: 80, marginLeft: 16 }} onSelect={this.handleChangeEventType}>
                <Option value="eq">等于</Option>
                <Option value="gt">大于</Option>
                <Option value="lt">小于</Option>
              </Select>
              <InputNumber value={eventCount} style={{ marginLeft: 16, width: 160 }} onChange={this.handleEventCount} /> 次
            </Col>
          </Row>
          {this.renderEventParams(selectedEventPramsData)}
          <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }}>
            <Col span={2}></Col>
            <Col span={22}>
              <a href="javascript:;" onClick={this.addEventParams}>增加事件参数</a>
            </Col>
          </Row> */}
          {this.renderDimension(selectedDimension)}
          <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }}>
            <Col span={2}></Col>
            <Col span={22}>
              <a href="javascript:;" onClick={this.addDimension}>增加查看维度</a>
            </Col>
          </Row>
          <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }}>
            <Col span={2}></Col>
            <Col span={22}>
              <Button type="primary" onClick={() => { this.viewReport(null, null) }}>查看报表</Button>
              <Button style={{ marginLeft: 16 }} onClick={this.reset}>重置条件</Button>
            </Col>
          </Row>
        </Row>

        {
          showReport ?
            <Spin size='large' spinning={Global.effects['report/eventReport/fetchReport']}>
              <Row style={{ background: '#fff', padding: 16, marginTop: 16 }}>
                <Col span={24}>
                  <ReportChart date={date} changeReport={this.viewReport} reportCount={reportCount} reportParams={reportParams} {...this.props} />
                </Col>
              </Row>
            </Spin>
            : ''
        }
      </PageHeaderLayout>
    )
  }
}