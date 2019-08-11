import React, { Component } from 'react';
import { Row, Col, Checkbox, Select, Form, DatePicker, Button, Radio, Input, Tag, message } from 'antd';
import uuid from 'uuid';
import moment from 'moment'

import styles from './OnlineBehavior.less';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const uuidv4 = uuid.v4;

class OnlineBehavior extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // firstVisitType: '1',
      // lastVisitType: '1',
      // behaviorType: '1',
      // paramList: [],
      // paramInputValue: '', // 事件参数输入的值 受控
      relation: 'and', // &全部满足 //|任意满足
    };
  }


  componentDidMount() {
    const { dispatch } = this.props;
    const self = this;
    dispatch({
      type: 'tagPicker/getAppKey',
      payload: {
        callback: (res) => {
          if(res && res.length > 0){
            self.handleValueTypeChange(res, 'client', res[0].appkey );
          }
        }
      }
    });
  }


  formatDate = (key, dateStrings) => {
    let time = [];
    switch (key) {
      case '1':// 介于
        time = dateStrings;
        break;
      case '2':// 发生于
        time = [dateStrings, dateStrings];
        break;
      case '3':// 之前
        time = ['', dateStrings];
        break;
      case '4':// 之后
        time = [dateStrings, ''];
        break;
      default:
        break;
    }
    return time;
  }


  handleRadioTypeChange = (...arg) => {
    const [type, e] = [...arg];
    const selectValue = e.target.value;
    const { value, onChange } = this.props;
    const comparename = `${type}TimeCompare`;
    const timename = `${type}time`;
    if (type === 'first') {
      value[comparename] = { name: '请选择', key: '0' };
      value.firstVisitType = selectValue;
    } else if (type === 'last') {
      value[comparename] = { name: '请选择', key: '0' };
      value.lastVisitType = selectValue;
    } else if (type === 'behavior') {
      if (selectValue === '1') {
        value.periodCompare = { name: '请选择', key: '0' };
      } else {
        value.pointVal = { name: '请选择', key: '0' };
      }
      value.behaviorType = selectValue;
    }
    onChange(value);
  }

  handleCompareChange = (...arg) => {
    const [compareList, type, key] = [...arg];
    const { value, onChange } = this.props;
    const name = `${type}Compare`;
    if (key === '0') value[name] = undefined;
    else value[name] = compareList.find(item => item.key === key);
    onChange(value);
  }

  handleDateChange = (...arg) => {
    const [compareKey, type, , dateStrings] = [...arg];
    const { value, onChange } = this.props;
    let time = this.formatDate(compareKey, dateStrings);
    if (type === 'firstTime') { // 首次访问时间
      value.firstTime = time;
    } else if (type === 'lastTime') { // 上次访问时间
      value.lastTime = time;
    } else if (type === 'period') { // 时间段
      value.periodTime = time;
    }
    onChange(value);
  }


  handleValueTypeChange = (...arg) => {
    const [valueList, type, key] = [...arg];
    const { value, onChange, dispatch } = this.props;
    let name = `${type}Val`;
    if (type === 'event') {
      name = `${type}Type`;
    }
    if (type === 'client') {
      value.isTrigger = false;
      value[name] = valueList.find(item => item.appkey === key);
      value.eventType = undefined;
      value.paramList = [];
      dispatch({
        type: 'tagPicker/getEvent',
        payload: {
          appKey: key,
        },
      })
    } else if (type === 'event') {
      value[name] = valueList.find(item => item.id === key);

      dispatch({
        type: 'tagPicker/getParam',
        payload: {
          eventId: key,
        },
      })
    } else {
      value[name] = valueList.find(item => item.key === key);
    }

    onChange(value);
  }


  handleEventValue = (e) => {
    let reg = /[1-9]\d*/;
    if (!reg.test(e.target.value) && e.target.value) {
      message.error('事件次数必须是数字且大于0');
      return false;
    }
    const { value, onChange } = this.props;
    value.eventValue = e.target.value;

    onChange(value);
  }

  handleJdugeEventIsOk = () => {
    const { value } = this.props;
    const {
      eventType = { name: '请选择', key: '0' },
      eventCompare = { name: '请选择', key: '0' },
      eventValue = '',
    } = value;
    if (eventType.key === '0') {
      message.error('请选择事件类型')
      return false;
    }
    if (eventCompare.key === '0') {
      message.error('请选择事件条件')
      return false;
    }
    if (!eventValue) {
      message.error('请输入事件次数')
      return false;
    }
    return true;
  }

  handleJdugeParamIsOk = () => {
    const { value } = this.props;
    const { paramList = [] } = value;
    const { length } = paramList;
    if (length > 0) {
      let current = paramList[length - 1]
      if (current.type === '0') {
        message.error('请选择参数类型');
        return false;
      }
      if (current.compare === '0') {
        message.error('请选择参数条件');
        return false;
      }
      if (!current.value) {
        message.error('请输入参数值');
        return false;
      }
      return true;
    } else {
      return true;
    }
  }


  handleJdugeDateIsOk = () => {
    const { value } = this.props;
    const {
      firstTimeCompare = { name: '请选择', key: '0' },
      lastTimeCompare = { name: '请选择', key: '0' },
      firstVisitType = '1',
      firstTime,
      lastVisitType = '1',
      lastTime,
      behaviorType = '1',
      pointVal = { name: '请选择', key: '0' },
      periodCompare = { name: '请选择', key: '0' },
      periodTime,
    } = value;

    if (firstVisitType === '2') { // 自定义首次访问时间
      if (firstTimeCompare.key === '0') {
        message.error('请选择首次访问时间条件');
        return false;
      }
      if (!firstTime) {
        message.error('请选择首次访问时间');
        return false;
      }
    }
    if (lastVisitType === '2') { // 自定义上次访问时间
      if (lastTimeCompare.key === '0') {
        message.error('请选择上次访问时间条件');
        return false;
      }
      if (!lastTime) {
        message.error('请选择上次访问时间');
        return false;
      }
    }

    if (behaviorType === '1') { // 行为组合
      if (pointVal.key === '0') {
        message.error('请选择行为组合时间');
        return false;
      }
    }

    if (behaviorType === '2') { // 行为组合
      if (periodCompare.key === '0') {
        message.error('请选择行为组合条件');
        return false;
      }
      if (!periodTime) {
        message.error('请选择行为组合时间');
        return false;
      }
    }
    return true;
  }


  handleAddParam = () => {
    // const [...paramList] = [...this.state.paramList];
    const { value, onChange } = this.props;
    const { paramList = [] } = value;
    if (!this.handleJdugeDateIsOk()) {
      return false;
    }
    if (!this.handleJdugeEventIsOk()) {
      return false;
    }
    if (!this.handleJdugeParamIsOk()) {
      return false;
    }
    const param = {
      id: uuidv4(),
      type: '0',
      typeName: '',
      compare: '0',
      compareName: '',
      value: '',
    };
    paramList.push(param);
    value.paramList = paramList;
    onChange(value);
  }

  handleParamListChange = (...arg) => {
    const [paramId, params, type, selectKey] = [...arg]; // selectKey 在Select组件下是key,在Input组件下是事件参数e
    const { value, onChange, dispatch } = this.props;
    const { paramList } = value;
    let newParamList;
    if (type === 'updateValue') {
      newParamList = paramList.map((item, index) => {
        if (paramId === item.id) {
          // item.value = selectKey.target.value;
          item.value = selectKey;
        }
        return item;
      });
    } else if (type === 'updateCompare') {
      newParamList = paramList.map((item, index) => {
        if (paramId === item.id) {
          item.compare = selectKey;
          item.compareName = params.find(i => i.key === selectKey).name;
        }
        return item;
      });
    } else if (type === 'updateType') {
      newParamList = paramList.map((item, index) => {
        if (paramId === item.id) {
          item.type = selectKey;
          item.typeName = selectKey !== '0' ? params.find(i => i.fieldName === selectKey).paramBizDesc : '';
          const { clientVal, eventType } = value;
          dispatch({
            type: 'tagPicker/getParamValues',
            payload: {
              columnName: selectKey, // 参数名
              appkey: clientVal.appkey, // 客户端
              actionName: eventType.action_name, // 事件名
              callback: (paramValues) => {
                item.paramValues = paramValues;
              },
            },
          })
        }
        return item;
      });
    } else if (type === 'delete') {
      newParamList = paramList.filter((item, index) => {
        return paramId !== item.id;
      });
    }
    value.paramList = newParamList;
    onChange(value);
  }

  handleParamLogicClick = () => {
    const { value, onChange } = this.props;
    this.setState({
      relation: this.state.relation === 'and' ? 'or' : 'and',
    }, () => {
      value.relation = this.state.relation;
      onChange(value);
    });
  }

  handleJoinClick = () => {
    const { value, onChange } = this.props;
    const { clientVal, action = [] } = value;
    if (!this.handleJdugeDateIsOk()) {
      return false;
    }
    if (!this.handleJdugeEventIsOk()) {
      return false;
    }
    if (!this.handleJdugeParamIsOk()) {
      return false;
    }

    value.isReady = true;
    if (value.isReady) action.push(this.organizeServerData(value));
    value.action = action;
    // onChange(value);
    this.props.updateFilesValue({ action: value.action, isReady: value.isReady, 
        isTrigger: true }, 'OnlineBehavior');
    this.handleValueTypeChange(this.props.AppKeys, 'client', this.props.AppKeys && this.props.AppKeys[0].appkey );
  }

  organizeServerData = (value) => {
    const {
      clientVal,
      firstVisitType = '1',
      lastVisitType = '1',
      firstTime,
      lastTime,
      behaviorType = '1',
      pointVal,
      periodTime,
      eventType,
      eventCompare,
      eventValue,
      paramList = [],
      relation = this.state.relation,
    } = value;
    let firstVisit = {};
    let lastVisit = {};
    let date = {};
    let event = {};
    let eventParams = [];

    if (firstVisitType === '1') { // 首次不限
      firstVisit.start_date = '';
      firstVisit.end_date = '';
    } else { // 首次自定义
      firstVisit.start_date = firstTime[0];
      firstVisit.end_date = firstTime[1];
    }

    if (lastVisitType === '1') { // 上次不限
      lastVisit.start_date = '';
      lastVisit.end_date = '';
    } else { // 上次自定义
      lastVisit.start_date = lastTime[0];
      lastVisit.end_date = lastTime[1];
    }

    if (behaviorType === '1' && pointVal) { // 行为组合=>选择时段
      const { key } = pointVal;
      date = {
        point: pointVal,
      }
    } else if (behaviorType === '2' && periodTime) { // 行为组合=>自定义时段
      date = {
        period: {
          start_date: periodTime[0],
          end_date: periodTime[1],
        },
      }
    }

    if (eventValue) { // 事件
      event = {
        condition: eventCompare.key,
        actionname: eventType.action_name,
        count: eventValue,
        condition_cn: eventCompare.name,
        actionname_cn: eventType.action_name_cn,
      }
    }

    if (paramList.length) { // 事件参数
      paramList.forEach((item, index) => {
        eventParams.push({
          param_name: item.type,
          param_condition: item.compare,
          param_value: item.value,
          param_name_cn: item.typeName,
          param_condition_cn: item.compareName,
        })
      })
    }
    const option = {
      id: uuidv4(),
      appkey: clientVal,
      first_time: firstVisit,
      last_time: lastVisit,
      date,
      event,
      event_params: eventParams,
      relation,
    };
    return option;
  }

  render() {
    const { AppKeys, events, params, paramValues = [] } = this.props;

    const timeCompares = [
      { name: '请选择', key: '0' },
      { name: '介于', key: '1' },
      { name: '发生于', key: '2' },
      { name: '之前', key: '3' },
      { name: '之后', key: '4' },
    ];

    const points = [
      { name: '请选择', key: '0' },
      { name: '今天', key: 'today' },
      { name: '昨天', key: 'yesterday' },
      { name: '近7天', key: 'near_7' },
      { name: '近30天', key: 'near_30' },
      { name: '近60天', key: 'near_60' },
      { name: '近90天', key: 'near_90' },
      { name: '近180天', key: 'near_180' },
      { name: '近365天', key: 'near_365' },
    ];

    const eventCompares = [
      { name: '请选择', key: '0' },
      { name: '等于', key: 'eq' },
      { name: '大于', key: 'gt' },
      { name: '小于', key: 'lt' },
    ];

    const paramCompares = [
      { name: '请选择', key: '0' },
      { name: '等于', key: 'eq' },
      { name: '不等于', key: 'neq' },
      { name: '包含', key: 'in' },
      { name: '不包含', key: 'nin' },
      { name: '开头是', key: 'be' },
      { name: '开头不是', key: 'nbe' },
      { name: '结尾是', key: 'en' },
      { name: '结尾不是', key: 'nen' },
    ];


    const { value } = this.props;
    const {
      clientVal = {},
      firstVisitType = '1',
      lastVisitType = '1',
      firstTimeCompare = {},
      lastTimeCompare = {},
      behaviorType = '1',
      pointVal = {},
      periodCompare = {},
      eventType = {},
      eventCompare = {},
      eventValue,
      paramList = [],
    } = value;
    const clientValKey = clientVal.appkey || (AppKeys && AppKeys[0] && AppKeys[0].appkey) || '0';
    const firstTimeCompareKey = firstTimeCompare.key || '0';
    const lastTimeCompareKey = lastTimeCompare.key || '0';
    const pointValKey = pointVal.key || '0';
    const periodCompareKey = periodCompare.key || '0';
    const eventTypeKey = eventType.id || '0';
    const eventCompareKey = eventCompare.key || '0';
    console.log('this.props.value-----', value);

    // const paramValues = [{ key: '1', name: 'hehe' }]

    return (

      <div className={styles.onlineBehavior}>
        <div className={styles.form}>
          <FormItem
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 5 }}
            label="客户端"
            style={{ marginBottom: 0, marginTop: 15 }}
          >
            <Select style={{width: 240}}
              value={clientValKey}
              onChange={this.handleValueTypeChange.bind(this, AppKeys, 'client')}>
              
              {
                AppKeys.map((client, index) => {
                  return <Option key={uuidv4()} value={client.appkey}>{client.appkeyName}</Option>;
                })
              }
            </Select>
          </FormItem>

          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label="首次访问时间:"
            style={{ marginBottom: 0 }}
          >
            <Col span={6}>
              <RadioGroup
                onChange={this.handleRadioTypeChange.bind(this, 'first')}
                value={firstVisitType}
              >
                <Radio value="1">不限</Radio>
                <Radio value="2">自定义</Radio>
              </RadioGroup>
            </Col>
            <Col span={3}>
              <Select
                value={firstTimeCompareKey}
                disabled={firstVisitType === '1'}
                onChange={this.handleCompareChange.bind(this, timeCompares, 'firstTime')}
              >

                {
                  timeCompares.map((cmp, index) => {
                    return <Option key={uuidv4()} value={cmp.key}>{cmp.name}</Option>;
                  })
                }
              </Select>
            </Col>
            <Col span={5} style={{ marginLeft: 10 }}>
              {
                firstTimeCompareKey === '0' || firstVisitType === '1' ?
                  '' :
                  (
                    firstTimeCompareKey === '1' ?
                      <RangePicker
                        placeholder={['开始时间', '结束时间']}
                        style={{ width: 200 }}
                        onChange={this.handleDateChange.bind(this, firstTimeCompareKey, 'firstTime')}
                      /> :
                      <DatePicker
                        placeholder="请选择日期"
                        onChange={this.handleDateChange.bind(this, firstTimeCompareKey, 'firstTime')}
                      />
                  )
              }
            </Col>
          </FormItem>

          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label="上次访问时间"
            style={{ marginBottom: 0 }}
          >
            <Col span={6}>
              <RadioGroup
                onChange={this.handleRadioTypeChange.bind(this, 'last')}
                value={lastVisitType}
              >
                <Radio value="1">不限</Radio>
                <Radio value="2">自定义</Radio>
              </RadioGroup>
            </Col>
            <Col span={3}>
              <Select
                value={lastTimeCompareKey}
                disabled={lastVisitType === '1'}
                onChange={this.handleCompareChange.bind(this, timeCompares, 'lastTime')}
              >

                {
                  timeCompares.map((cmp, index) => {
                    return <Option key={uuidv4()} value={cmp.key}>{cmp.name}</Option>;
                  })
                }
              </Select>
            </Col>
            <Col span={5} style={{ marginLeft: 10 }}>
              {
                lastTimeCompareKey === '0' || lastVisitType === '1' ?
                  '' :
                  (
                    lastTimeCompareKey === '1' ?
                      <RangePicker
                        placeholder={['开始时间', '结束时间']}
                        style={{ width: 200 }}
                        onChange={this.handleDateChange.bind(this, lastTimeCompareKey, 'lastTime')}
                      /> :
                      <DatePicker
                        placeholder="请选择日期"
                        onChange={this.handleDateChange.bind(this, lastTimeCompareKey, 'lastTime')}
                      />
                  )
              }
            </Col>
          </FormItem>

          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label="行为组合"
            style={{ marginBottom: 0 }}
          >
            <RadioGroup
              style={{ width: '100%' }}
              onChange={this.handleRadioTypeChange.bind(this, 'behavior')}
              value={behaviorType}
            >
              <Col span={3} style={{ marginRight: 5 }}>
                <Radio value="1">选择时间段</Radio>
              </Col>
              <Col span={4}>
                <Select
                  disabled={behaviorType === '2'}
                  style={{ width: 100 }}
                  value={pointValKey}
                  onChange={this.handleValueTypeChange.bind(this, points, 'point')}

                >

                  {
                    points.map((item, index) => {
                      return (
                        <Option
                          key={uuidv4()}
                          value={item.key}
                        >{item.name}
                        </Option>
                      );
                    })
                  }
                </Select>
              </Col>
              <Col span={4} style={{ marginLeft: 10 }}>
                <Radio value="2">自定义时间段</Radio>
              </Col>
              <Col span={4}>
                <Select
                  disabled={behaviorType === '1'}
                  style={{ width: 100 }}
                  value={periodCompareKey}
                  onChange={this.handleCompareChange.bind(this, timeCompares, 'period')}
                >

                  {
                    timeCompares.map((item, index) => {
                      return (
                        <Option
                          key={uuidv4()}
                          value={item.key}
                        >{item.name}
                        </Option>
                      );
                    })
                  }
                </Select>
              </Col>
              {
                behaviorType === '2' &&
                <Col span={5}>
                  {
                    periodCompareKey === '0'
                      ? ''
                      : (
                        periodCompareKey === '1' ?
                          <RangePicker
                            placeholder={['开始时间', '结束时间']}
                            style={{ width: 200 }}
                            onChange={this.handleDateChange.bind(this, periodCompareKey, 'period')}
                          /> :
                          <DatePicker
                            placeholder="请选择日期"
                            onChange={this.handleDateChange.bind(this, periodCompareKey, 'period')}
                          />
                      )
                  }
                </Col>
              }
            </RadioGroup>
          </FormItem>

          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 18 }}
            label="事件"
            style={{ marginBottom: 0 }}
          >
            <Col span={5}>
              <Select
                value={eventTypeKey}
                onChange={this.handleValueTypeChange.bind(this, events, 'event')}
              >
                <Option key={uuidv4()} value='0'>请选择</Option>
                {
                  events.map((event, index) => {
                    return <Option key={uuidv4()} value={event.id}>{event.action_name_cn}</Option>;
                  })
                }
              </Select>
            </Col >
            <Col span={5} style={{ marginLeft: 5 }}>
              <Select
                disabled={eventTypeKey === '0'}
                value={eventCompareKey}
                onChange={this.handleCompareChange.bind(this, eventCompares, 'event')}
              >

                {
                  eventCompares.map((param, index) => {
                    return <Option key={`eventCompare_${index}`} value={param.key}>{param.name}</Option>;
                  })
                }
              </Select>
            </Col >
            <Col span={5} style={{ marginLeft: 5 }}>
              <Input
                disabled={eventCompareKey === '0' || eventTypeKey === '0'}
                value={eventValue}
                onChange={this.handleEventValue}
                addonAfter="次"
              />
            </Col >
          </FormItem>

          {
            paramList.map((item, index) => {
              return (
                <FormItem
                  className={paramList.length > 1 ? 'paramList' : ''}
                  key={item.id}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 18 }}
                  label="参数"
                  style={{ marginBottom: 0 }}
                >
                  <Col span={5}>
                    <Select
                      value={item.type}
                      onChange={this.handleParamListChange.bind(this, item.id, params, 'updateType')}
                    >
                      <Option key='paramType_-1' value='0'>请选择</Option>
                      {
                        params.map((param, key) => {
                          return <Option key={`paramType_${item.paramId}`} value={param.fieldName}>{param.paramBizDesc}</Option>;
                        })
                      }
                    </Select>
                  </Col >

                  <Col span={5} style={{ marginLeft: 5 }}>
                    <Select
                      disabled={item.type === '0'}
                      value={item.compare}
                      onChange={this.handleParamListChange.bind(this, item.id, paramCompares, 'updateCompare')}
                    >

                      {
                        paramCompares.map((param, key) => {
                          return <Option key={`paramCompare_${key}`} value={param.key}>{param.name}</Option>;
                        })
                      }
                    </Select>
                  </Col >

                  <Col span={5} style={{ marginLeft: 5 }}>
                    <Select
                      mode="combobox"
                      disabled={item.type === '0' || item.compare === '0'}
                      value={item.value}
                      onChange={this.handleParamListChange.bind(this, item.id, [], 'updateValue')}
                      onSelect={this.handleParamListChange.bind(this, item.id, paramValues, 'updateValue')}
                    >
                      {
                        item.paramValues && item.paramValues.map((item, key) => {
                          return <Option key={`paramValue_${key}`} value={item}>{item}</Option>;
                        })
                      }
                    </Select>
                  </Col >

                  <Col span={2} style={{ marginLeft: 5 }}>
                    <Tag
                      color="red"
                      onClick={this.handleParamListChange.bind(this, item.id, [], 'delete')}
                    >
                      删除
                    </Tag>
                  </Col >

                </FormItem>
              );
            })
          }
          <div style={{ marginTop: 13, marginLeft: 10 }}>
            {paramList.length > 1 && <span className={styles.andOrBtn} size='small' onClick={this.handleParamLogicClick}>{this.state.relation === 'or' ? '任意满足' : '全部满足'}</span>}
            {!this.props.isLifeTime && <a className={styles.addParams} href="javascript:;" onClick={this.handleAddParam}> 增加事件参数条件</a>}
          </div>
        </div>

        <div className={styles.join}>
          <Button type='primary' onClick={this.handleJoinClick}>加入条件</Button>
        </div>

      </div >
    );
  }
}


export default OnlineBehavior;

