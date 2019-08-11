import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Select, Button, InputNumber, Checkbox, Input, Tooltip, Row, Col, Icon, notification } from 'antd';
import styles from './index.less'

const Option = Select.Option;
@connect(state => ({
  funelAdd: state['report/funelAdd'],
}))
class SelectBox extends PureComponent {
  constructor(props) {
    super();
    this.upData=true;
    this.state = {
      eventData: props.value || {
        action: {
          appkey: [''], // appkey筛选,数组
          appName: '', // app名字
          event: { // 事件
            condition: '', // = or > or <
            actionname: '', // 字段名称:actionname 字段值 MAddUser
            count: '', // 事件发生次数
          },
          eventId: '', // 事件ID
          eventName: '添加登陆用户信息', // 事件名称
          eventCondition: '', // 事件条件语句
          paramsName: [], // 参数名称
          paramsCondition: [], // 事件条件语句
          event_params: [{ // 事件参数
            param_condition: '', // = or > or <
            param_name: '', // 自定义参数列英文名称
            param_value: '', // 自定义参数的值（前端传的）
          }],
          relation: 'and',
        },
      },
    }
    this.evenType = [
      { value: 'gte', name: '大于等于' },
    ];
    this.paramType = [
      { value: 'eq', name: '等于' },
      { value: 'neq', name: '不等于' },
      { value: 'in', name: '包含' },
      { value: 'nin', name: '不包含' },
      { value: 'be', name: '开头是' },
      { value: 'nbe', name: '开头不是' },
      { value: 'en', name: '结尾是' },
      { value: 'nen', name: '结尾不是' },
    ]
  }
  /**
   * 更新state
   * @param {*} key
   * @param {*} value
   */
  upSelectState(key, value) {
    if (Object.prototype.toString.call(key) == '[object Array]') {
      key.map((item, i) => {
        if (Object.prototype.toString.call(value[i]) == '[object Object]') {
          this.state.eventData.action[item] = {
            ...this.state.eventData.action[item],
            ...value[i],
          }
        } else {
          this.state.eventData.action[item] = value[i]
        }
      })
    } else if (Object.prototype.toString.call(value) == '[object Object]') {
      this.state.eventData.action[key] = {
        ...this.state.eventData.action[key],
        ...value,
      }
    } else {
      this.state.eventData.action[key] = value
    }
    console.log(this.state.eventData.action)
    this.setState({
      eventData: {
        action: { ...this.state.eventData.action },
      },
    })
  }
  changeEventList(id) {
    this.props.dispatch({
      type: 'report/funelAdd/fetchGetAppEventList',
      payload: id,
    })
  }
  componentWillMount() {
    let { value } = this.props;
    let { action } = value;
    if (action && action.appkey[0]) {
      this.changeEventList(action.appkey[0])
    }
    if (action && action.eventId) {
      console.log(action.eventId);
      this.props.dispatch({
        type: 'report/funelAdd/fetchGetEventParam',
        payload: action.eventId,
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value&&this.upData) {
      this.upData = false;
      this.setState({
        eventData: nextProps.value,
      })
    }
  }
  getParamHtml(item, i) {
    const { funelAdd } = this.props;
    const {
      appList,
      actionList,
      paramClassList,
      paramList,
    } = funelAdd;
    return (<div className={styles['add-hang-k']} key={i}>
      <div className={styles.lianjie}>
        <Icon type="link" />
      </div>
      <Select
        showSearch
        className={styles['params-left']}
        dropdownMatchSelectWidth={false}
        value={item.param_name || ''}
        getPopupContainer={node => node.parentNode}
        onSelect={(value, item) => {
          let { eventData } = this.state;
          let event_params = eventData.action.event_params,
              paramsName = eventData.action.paramsName;
          event_params[i].param_name = value;
          paramsName[i] = item.props.refData.paramBizDesc
          this.upSelectState(['event_params', 'paramsName'], [event_params, paramsName]);
          
          this.props.dispatch({
            type:'report/funelAdd/fetchEventParamsTips',
            payload:{
              columnName:value,
              actionName:eventData.action.event.actionname,
              appkey:item.props.refData.appKey
            },
            index:i
          })
        }}
      >
        {paramList && paramList.map((item, i) => {
          return <Option key={i} value={item.fieldName} refData={item}>{item.paramBizDesc}</Option>
        })}
      </Select>
      <Select
        showSearch
        className={styles['params-right']}
        value={item.param_condition || ''}
        getPopupContainer={node => node.parentNode}
        onSelect={(value, item) => {
          let { eventData } = this.state;
          let event_params = eventData.action.event_params,
            paramsCondition = eventData.action.paramsCondition;
          event_params[i].param_condition = value;
          paramsCondition[i] = item.props.refData.name
          this.upSelectState(['event_params', 'paramsCondition'], [event_params, paramsCondition]);
        }}
      >
        {this.paramType.map((item, i) => {
          return <Option key={i} refData={item} value={item.value}>{item.name}</Option>
        })}
      </Select>
      <Select
        mode="combobox"
        className={styles['url-right']}
        value={item.param_value || ''}
        getPopupContainer={node => node.parentNode}
        onChange={(v) => {
          let { eventData } = this.state;
          let event_params = eventData.action.event_params
          event_params[i].param_value = v;

          this.upSelectState('event_params', event_params);
        }}
      >
        {paramClassList[i]?paramClassList[i].map((item, i) => {
          return <Option key={i} value={item} >{item}</Option>
        }):null}
      </Select>
      
      <a className={styles.lajitong}
        onClick={() => {
          let { eventData } = this.state;
          let event_params = eventData.action.event_params,
            paramsName = eventData.action.paramsName;
          event_params.splice(i, 1);
          paramsName.splice(i, 1);
          this.upSelectState(['event_params', 'paramsName'], [event_params, paramsName]);
        }}><Icon type="delete" /></a>
    </div>)
  }
  /**
   * 數據校驗
   * @param {*} data
   */
  getFormat(data) {
    let { action } = data;
    if (!action.appName) {
      notification.open({
        message: '提示',
        description: '請選擇客戶端',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      return false
    }
    let num = 0;
    Object.keys(action.event).map((item) => {
      
      if ((!action.event[item])) {
        num++
      }
    })
    let paramNum = 0;
    action.event_params.map(item=>{
      if(Object.keys(item).length == 0){
        paramNum++
      }
    })
    if (paramNum != 0) {
      notification.open({
        message: '提示',
        description: '请将事件参数补充完整',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      return false
    }
    if (num != 0) {
      notification.open({
        message: '提示',
        description: '请将事件信息补全',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      return false
    }
    return true
  }
  render() {
    const { funelAdd, onSave, closeBox } = this.props;
    const {
      appList,
      actionList,
      paramList,
    } = funelAdd;
    const { eventData } = this.state;
    const { action } = eventData;
    return (
      <div className={styles.tanchu}>
        <div className={styles['behavior-combination-con']}>
          <div className={styles.screen2}>
            <Row>
              <div className={styles.shou}>客户端</div>
              <Select
                showSearch
                getPopupContainer={
                  (node) => {
                    return node.parentNode
                  }
                }
                value={action.appkey[0] || ''}
                dropdownMatchSelectWidth={false}
                optionFilterProp="children"
                className={styles.eventwidth}
                onSelect={(value, item) => {
                  this.upSelectState(
                    ['appkey', 'appName', 'event', 'eventName', 'eventId'],
                    [[value], item.props.refData.appkeyName,
                    {
                      condition: '',
                      actionname: '',
                      count: '',
                    }, '', ''])
                  this.changeEventList(value)
                }}
              >
                <Option value="" refData={{appkeyName:""}}>请选择</Option>
                {appList && appList.map((item, i) => {
                  return <Option key={i} refData={item} value={item.appkey}>{item.appkeyName}</Option>
                })}
              </Select>
            </Row>
            {(actionList && actionList.length > 0) ? <Row className={styles['action-hang']}>
              <div className={styles.shou}>事件</div>
              <Select
                showSearch
                optionFilterProp="children"
                className={styles['params-left']}
                getPopupContainer={node => node.parentNode}
                dropdownMatchSelectWidth={false}
                placeholder={"请选择"}
                value={action.event.actionname || ""}
                onSelect={(value, item) => {
                  this.upSelectState(['event', 'eventName', 'eventId', 'event_params', 'paramsName','eventCondition'], [{
                    actionname: value,
                    condition: action.event.condition||'gte',
                    count: action.event.count || 1,
                  }, item.props.refData.action_name_cn, item.props.refData.id, [], [],action.eventCondition||'大于等于'])
                  this.props.dispatch({
                    type: 'report/funelAdd/fetchGetEventParam',
                    payload: item.props.refData.id,
                  })
                }}
              >
                <Option value="" refData={{action_name_cn:"",id:""}}>请选择</Option>
                {actionList && actionList.map((item, i) => {
                  return <Option key={item.action_name} value={item.action_name} refData={item}>{item.action_name_cn}</Option>
                })}
              </Select>
              <Select
                className={styles['params-right']}
                value={action.event.condition || 'gte'}
                getPopupContainer={node => node.parentNode}
                onSelect={(value, item) => {
                  this.upSelectState(['event', 'eventCondition'], [{
                    condition: value || 'gte',
                  }, item.props.refData.name])
                }}
              >
                {this.evenType.map((item, i) => {
                  return <Option key={i} refData={item} value={item.value}>{item.name}</Option>
                })}
              </Select>
              <InputNumber className={styles['url-right']}
                precision={0}
                onChange={(v) => {
                  this.upSelectState('event', {
                    count: v || 1,
                  })
                }}
                value={action.event.count || 1} />次
            </Row> : null}
          </div>
          {(paramList && paramList.length > 0) ? <div className={styles['add-hang']}>
            {action.event_params && action.event_params.map((item, i) => {
              return this.getParamHtml(item, i)
            })}
          </div> : null}
          <div className={styles.qie2}
            onClick={() => {
              let { eventData } = this.state;

              this.setState({
                eventData: {
                  action: {
                    ...eventData.action,
                    relation: eventData.action.relation == 'and' ? 'or' : 'and',
                  },
                },
              })
            }}>{action.relation == 'and' ? '全部满足' : '任意满足'}</div>
          <a className={styles['add-sj']}
            onClick={() => {
              let { eventData } = this.state;
              let event_params = eventData.action.event_params
              if(paramList && paramList.length > 0){
                event_params.push({})
                this.setState({
                  eventData: {
                    action: {
                      ...eventData.action,
                    },
                  },
                })
              }else{
                notification.open({
                  message: '提示',
                  description: '该事件没有参数',
                  icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
                });
              }
            }}><i className={`${styles.fa} ${['fa-plus-circle']}`} />增加参数条件</a>
        </div>
        <div className={styles['p-t50']}>
          <Button type="primary"
            onClick={() => {
              if(this.getFormat(this.state.eventData)){
                onSave(this.state.eventData);
                this.props.dispatch({
                  type: 'report/funelAdd/resetDataList',
                })
              } 
            }}>保存</Button>
          <Button type="primary"
            style={{ marginLeft: 20 }}
            onClick={() => {
              closeBox()
              this.props.dispatch({
                type: 'report/funelAdd/resetDataList',
              })
            }}>取消</Button>
        </div>
      </div>
    )
  }
}

class SelectCondition extends PureComponent {
  constructor(props) {
    super(props);

    // const { value , data} = this.props;
    let data = props.data ? { ...props.data } : {
      acrossPlatformJson: 'string', // 跨平台参数
      appkey: 0, // 客户端
      eventParamJson: '', // 查询语句
      isAcrossPlatform: 0, // 是否跨平台
      stepName: 'string', // 步骤名
      stepNum: 0, // 步骤号 表示第几步
    };
    data.stepNum = props.index;
    this.state = {
      // value:value,
      // data: data,
      isReName:false,
      isdata: false,
      data,
      isShow: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      this.setState({
        data: {
          ...nextProps.data,
          stepNum: nextProps.index,
          isStride: nextProps.isStride,
        },
      })
    }
  }
  render() {
    const { onChange, isStride, removeBox } = this.props;
    const { isShow, data, isdata } = this.state;
    // let rightDataKeys = Object.keys(rightData);
    let { eventParamJson } = data;
    let action;
    if (eventParamJson) {
      action = JSON.parse(eventParamJson)
      eventParamJson = action.action;
    }
    return (
      <Row className={styles['echelon-list']}>
        <span className={styles['echelon-list-after']}></span>
        <Col span={6}>
          <div className={styles['add-Name']}>
            <h2>步骤{data.stepNum}</h2>
            <label>步骤名称:</label>
            <Input
              value={data.stepName || ''}
              onChange={(e) => {
                let { data } = this.state;
                if(e.target.value.length >= 30){
                  notification.open({
                    message: '提示',
                    description: '步骤名不超过30个字节',
                    icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
                  });
                  return 
                }
                this.setState({
                  data: {
                    ...data,
                    stepName: e.target.value,
                  },
                })
              }}
              onBlur={() => {
                let { data } = this.state;
                if(onChange){
                  this.state.isReName = onChange({ ...data }) === false
                }
              }}
            />
          </div>
        </Col>
        <Col span={18}>
          <div className={styles.echelon}>
            {!eventParamJson ? <div className={styles['echelon-add']}>
              <Icon type="plus-circle-o"
                onClick={() => {
                  let { isShow,isReName } = this.state;
                  if(isReName){
                    notification.open({
                      message: '提示',
                      description: '步骤名称不合法，请修改步骤名',
                      icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
                    });
                    return 
                  }
                  if(!isShow === true && window.SelectBox !== true){
                    window.SelectBox = !isShow;
                    this.setState({
                      isShow: !isShow,
                    })
                  }else if(!isShow === false){
                    window.SelectBox = !isShow;
                    this.setState({
                      isShow: !isShow,
                    })
                  }
                }}
                style={{ cursor: 'pointer' }}
                className={styles['add-i']} />
            </div> :
              <div className={styles['echelon-show']}>

                <Icon type="smile"
                  className={styles['echelon-smile']}
                  onClick={() => {
                    {/* let { isShow } = this.state;
                    this.setState({
                      isShow: !isShow,
                    }) */}
                  }} />

                <h4>客户端:{eventParamJson.appName || ''}</h4>
                <Tooltip title={`${eventParamJson.eventName || ''}${eventParamJson.eventCondition || ''}${eventParamJson.event.count || ''}`}>
                  <p>[事件]：{`${eventParamJson.eventName || ''}${eventParamJson.eventCondition || ''}${eventParamJson.event.count || ''}`}</p>
                </Tooltip>
                <Tooltip title={eventParamJson.paramsName.length > 0 ?
                  eventParamJson.paramsName.map((item, i) => [`${item||""}${eventParamJson.paramsCondition[i]||""}${eventParamJson.event_params[i].param_value||""}${eventParamJson.paramsName.length != i+1?(eventParamJson.relation == 'and' ? '(且)' : '(或)'):""}`,<br/>])
                  : '暂无参数'}>
                  <p>[参数]：{eventParamJson.paramsName.length > 0 ?
                    eventParamJson.paramsName.map((item, i) => `${item||""}${eventParamJson.paramsCondition[i]||""}${eventParamJson.event_params[i].param_value||""}`).join(eventParamJson.relation == 'and' ? '(且)' : '(或)')
                    : '暂无参数'}
                  </p>
                </Tooltip>
                <Icon className={styles['echelon-close-circle']}
                  type="close-circle"
                  onClick={() => {
                    removeBox();
                  }} />

              </div>}
            {isStride ? <p className={styles['is-stride']}>
              <Checkbox
                checked={!!data.acrossPlatformJson}
                onChange={() => {
                  isStride && isStride();
                }}
              >
                跨客户端平台事件
                            </Checkbox>
            </p> : null}
            {isShow ? <SelectBox value={action || ''}
              onSave={(item) => {
                let { data } = this.state;
                window.SelectBox=false
                this.setState({
                  isShow: false,
                  data: {
                    ...data,
                    eventParamJson: JSON.stringify(item),
                    appkey: item.action.appkey[0],
                  },
                })
                onChange && onChange({
                  ...data,
                  eventParamJson: JSON.stringify(item),
                  appkey: item.action.appkey[0],
                });
              }}
              closeBox={() => {
                let { isShow } = this.state;
                window.SelectBox=false
                this.setState({
                  isShow: false,
                })
              }} /> : null}
          </div>
        </Col>
      </Row>


    );
  }
}
export default SelectCondition