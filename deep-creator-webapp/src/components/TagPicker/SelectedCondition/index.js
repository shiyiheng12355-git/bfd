import React, { PureComponent, createElement } from 'react';
import { List, Button, Tag, Row, Col, Icon, Radio, message } from 'antd';
import moment from 'moment';
import { cloneDeep, groupBy } from 'lodash';
import uuid from 'uuid';


import styles from './index.less';

const ListItem = List.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const uuidv4 = uuid.v4;
class SelectedCondition extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    };
  }


  handleRadioChange = (e) => {
    const { dispatch, conditionList } = this.props;
    dispatch({
      type: 'tagPicker/changeCurrentCondition',
      payload: {
        currentCondition: e.target.value,
        callback: () => {
          const { updateFilesValue } = this.props;
          const userTagItem = conditionList.find(cur => cur.id === e.target.value).UserTag;
          const cusTagItem = conditionList.find(cur => cur.id === e.target.value).CustomTag;
          // const counterTradeItem = conditionList.find(cur => cur.id === e.target.value).CounterTrade;
          const OnlineBehaviorItem = conditionList.find(cur => cur.id === e.target.value).OnlineBehavior;

          updateFilesValue(userTagItem, 'UserTag');
          updateFilesValue(cusTagItem, 'CustomTag');
          updateFilesValue(OnlineBehaviorItem, 'OnlineBehavior');
          // updateFilesValue(counterTradeItem, 'CounterTrade');
        },
      },
    })
  }


  handleAddConditionClick = () => {
    let { conditionList, currentCondition, dispatch } = this.props;
    const { length } = conditionList;
    const lastCondition = conditionList[length - 1];
    // && !lastCondition.CounterTrade.isReady
    if (
      !lastCondition.UserTag.isChannelReady && !lastCondition.UserTag.isReady
      && !lastCondition.CustomTag.isReady && !lastCondition.OnlineBehavior.isReady
    ) {
      message.error('条件不能为空!');
      return false;
    }

    if (lastCondition.UserTag.isChannelReady && !lastCondition.UserTag.isReady) {
      message.error('对不起,如果你选择了渠道,就必须选择标签!');
      return false;
    }

    const condition = {
      id: uuidv4(),
      UserTag: {},
      CustomTag: {},
      OnlineBehavior: {},
      // CounterTrade: {},
    };

    conditionList.push(condition);
    currentCondition = condition.id;

    dispatch({
      type: 'tagPicker/addCodition',
      payload: {
        conditionList,
        currentCondition,
        callback: () => {
          this.props.resetfiledsValues();
        },
      },
    })
  }


  createHtmlTag = (item) => {
    const { UserTag = {}, CustomTag = {}, OnlineBehavior = {} } = item;
    let [channelHtml, UserTagHtml, CustomTagHtml, AutomaticTagHtml, OnlineBehaviorHtml] = ['', '', '', '', ''];
    let totalHtml = [];

    if (UserTag.isChannelReady) {
      channelHtml = this.createChannelTag(item.id, UserTag.checkedChannels)
      totalHtml = totalHtml.concat(channelHtml);
    }

    if (UserTag.isReady) {
      UserTagHtml = this.createUserTag(item.id, UserTag.checkedTags)
      totalHtml = totalHtml.concat(UserTagHtml);
    }
    if (CustomTag.isReady) {
      const { customerTag = [], automaticTag = [] } = CustomTag.checkedCusTags;
      if (customerTag.length) {
        CustomTagHtml = this.createCustomTag(item.id, customerTag);
        totalHtml = totalHtml.concat(CustomTagHtml);
      }
      if (automaticTag.length) {
        AutomaticTagHtml = this.createAutomaticTag(item.id, automaticTag);
        totalHtml = totalHtml.concat(AutomaticTagHtml);
      }
    }

    if (OnlineBehavior.isReady) {
      OnlineBehaviorHtml = this.createOnlineBehaviorTag(item.id, OnlineBehavior)
      totalHtml = totalHtml.concat(OnlineBehaviorHtml)
    }

    return (<RadioButton key={uuidv4()} value={item.id} style={{ width: '100%', minHeight: 30, height: 'auto', padding: '3px 5px' }}>
      {
        totalHtml.length >= 2
          ? <Button
            style={{ height: 25, padding: '0px 8px', marginRight: 8 }}
            onClick={this.handleChangeConditionRelation.bind(this, item.id)}
          >
            {item.relation === 'and' ? '全部满足' : '任意满足'}
          </Button>
          : ''
      }

      {
        totalHtml.map((cur, index) => {
          if (index !== 0) {
            cur = [<span key={uuidv4()} style={{ fontSize: 12, marginRight: 3 }}>{item.relation === 'and' ? '且' : '或'} </span>, cur]
          }
          return cur;
        })
      }
    </RadioButton>)
  }


  createChannelTag = (conditionId, channels) => {
    let title = '';
    channels.forEach((channel, index) => {
      if (!title) {
        title += channel.dictionaryLabel
      } else {
        title += ` 或 ${channel.dictionaryLabel}`;
      }
    })
    return (
      <Tag key="channel_-1" closable color="blue" onClose={e => this.handleTagClose(e, conditionId, channels, 'channel')}>
        <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
        {`渠道:${title}`}
      </Tag>
    );
  }


  createUserTag = (conditionId, item) => {
    const itemObj = groupBy(item, 'tagEnglishName');
    return Object.keys(itemObj).map((key, index) => {
      const current = itemObj[key];
      const parentTitle = current[0].ptitle;
      let title = '';
      current.forEach((i) => {
        if (!title) {
          title += i.tagValueTitle;
        } else {
          title += ` 或 ${i.tagValueTitle}`;
        }
      });
      return (
        <Tag key={`userTag_${index}`} closable color="blue" onClose={e => this.handleTagClose(e, conditionId, key, 'user')}>
          <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
          {`${parentTitle}:${title}`}
        </Tag>
      );
    });
  }


  createCustomTag = (conditionId, customTag) => {
    // let [title, value] = ['', ''];
    // value = customTag.map(item => item.tagValueTitle).join(',').replace(',', '或');
    // return (
    //   <Tag key='autoTag_-1' closable color="blue" onClose={() => this.handleCustomerTagClose(conditionId, 'custom_tag')}>
    //     <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
    //     {`${title}:${value}`}
    //   </Tag>
    // );
    let title = '自定义标签';
    return customTag.map((item) => {
      return (<Tag key={uuidv4()} closable color="blue" onClose={e => this.handleTagClose(e, conditionId, item, 'custom')}>
        <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
        {`${title}:${item.tagValueTitle}`}
      </Tag>)
    })
  }


  createAutomaticTag = (conditionId, automaticTag) => {
    // let [title, value] = ['', ''];
    // title = '自动化标签';
    // value = automaticTag.map(item => item.tagValueTitle).join(',').replace(',', '或');
    // return (
    //   <Tag key='autoTag_-1' closable color="blue" onClose={() => this.handleCustomerTagClose(conditionId, 'automatic_tag')}>
    //     <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
    //     {`${title}:${value}`}
    //   </Tag>
    // );
    let title = '自动化标签';
    return automaticTag.map((item) => {
      return (<Tag key={uuidv4()} closable color="blue" onClose={e => this.handleTagClose(e, conditionId, item, 'custom')}>
        <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
        {`${title}:${item.tagValueTitle}`}
      </Tag>)
    })
  }


  // createCounterTradeTag = (conditionId, counterTrade) => {
  //   const { trade } = counterTrade;
  //   console.log('item-------0000000000000', counterTrade)
  //   return trade.map((current, index) => {
  //     const { date, trade_params, trade_type, relation } = current;
  //     let [timeStr, typeStr, paramStr] = ['', '', '']
  //     const relationStr = relation === '&' ? '且' : '或';
  //     const { start_date, end_date } = date;
  //     if (start_date || end_date) {
  //       timeStr = `订单时间:【 ${start_date}${end_date ? `-${end_date}` : ''} 】`;
  //     }
  //     if (trade_type) {
  //       typeStr = `购买类型:【${trade_type.column_value_cn}】`;
  //     }
  //     trade_params.forEach((param) => {
  //       let str = index === 0 ? '参数:' : '';
  //       let valueName = param.valueName ? param.valueName : param.param_value;
  //       str += `【${param.param_name_cn}】${param.param_condition_cn}【${valueName}】`;
  //       paramStr += paramStr ? `${relationStr}${str}` : `${str}`;
  //     })
  //     return (
  //       <Tag key={`trade_${index}`} closable color="blue" onClose={() => this.handleTradeClose(conditionId, current.id, 'counterTrade')}>
  //         <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
  //         {`${timeStr}${typeStr}${paramStr}`}
  //       </Tag>
  //     );
  //   })
  // }

  createOnlineBehaviorTag = (conditionId, item) => {
    const { action } = item;
    return action.map((current, index) => {
      const { appkey, first_time, last_time, date, event, event_params, relation } = current;
      let [appStr, firstStr, lastStr, dateStr, paramStr, relationStr] = ['', '', '', '', '', '', '']

      const firstStart = first_time.start_date;
      const firstEnd = first_time.end_date;
      const lastStart = last_time.start_date;
      const lastEnd = last_time.end_date;

      appStr = `客户端:【${appkey.appkeyName}】`;
      firstStr = this.handleTimeStr(firstStart, firstEnd, '首次访问行为');
      lastStr = this.handleTimeStr(lastStart, lastEnd, '上次访问行为');
      if (date.point) { // 时间点 今天/昨天
        let pointStr = date.point.name;
        dateStr += `在【${pointStr}】发生【${event.actionname_cn}】 ${event.condition_cn}【${event.count}】次`;
      } else { // 时间段 xx年xx月xx日
        const periodStart = date.period.start_date;
        const periodEnd = date.period.end_date;
        dateStr += `${this.handleTimeStr(periodStart, periodEnd, event.actionname_cn)} ${event.condition_cn}【${event.count}】次`;
      }
      relationStr = relation === 'and' ? '且' : '或';

      event_params.forEach((param, key) => {
        let str = key === 0 ? ' 参数:' : '';
        str += `【${param.param_name_cn}】${param.param_condition_cn}【${param.param_value}】`;
        paramStr += paramStr ? `${relationStr}${str}` : `${str}`;
      })

      return (
        <Tag
          key={uuidv4()}
          closable
          color="blue"
          style={{ whiteSpace: 'normal' }}
          onClose={e => this.handleTagClose(e, conditionId, current.id, 'onlineBehavior')}
        >
          <Icon type="tag" style={{ transform: 'rotate(90deg)', marginRight: 2 }} />
          {`${appStr}${firstStr}${lastStr}${dateStr}${paramStr}`}
        </Tag>
      );
    })
  }

  handleTimeStr = (start, end, type) => {
    let timeStr = '';
    if (!start && end) {
      timeStr += `在【${end}】之前发生【${type}】`;
    } else if (start && !end) {
      timeStr += `在【${start}】之后发生【${type}】`;
    } else if (start && end) {
      if (moment(start).valueOf() === moment(end).valueOf()) {
        timeStr += `在【${start}】发生【${type}】`;
      } else {
        timeStr += `在【${start},${end}】发生【${type}】`;
      }
    }
    return timeStr;
  }


  handleTagClose = (e, conditionId, item, type) => {
    e.preventDefault();
    const { dispatch, currentCondition } = this.props;
    if (currentCondition !== conditionId) {
      message.error('只能对选中条件进行选项删除');
      return false;
    }
    dispatch({
      type: 'tagPicker/updateCondition',
      payload: {
        type,
        item,
        conditionId,
        callback: (conditionList) => {
          let condition = conditionList.find(co => co.id === conditionId) || {};
          const { UserTag = {}, CustomTag = {}, OnlineBehavior = {} } = condition;
          this.props.updateFilesValue(UserTag, 'UserTag');
          this.props.updateFilesValue(CustomTag, 'CustomTag');
          if (!UserTag.isChannelReady && !UserTag.isReady && !CustomTag.isReady && !OnlineBehavior.isReady && conditionList.length > 1) {
            // 当某一条件中的条件全部删除后,自动将该条件删除
            dispatch({
              type: 'tagPicker/delCondition',
              payload: {
                id: conditionId,
              },
            })
          }
        },
      },
    })
  }


  handleDelCondition = (id) => {
    const { dispatch } = this.props;
    if (this.props.conditionList.length <= 1) {
      message.error('请至少选择一个条件!');
      return false;
    }
    dispatch({
      type: 'tagPicker/delCondition',
      payload: {
        id,
        callback: (UserTag, CustomTag) => {
          this.props.updateFilesValue(UserTag, 'UserTag');
          this.props.updateFilesValue(CustomTag, 'CustomTag');
        },
      },
    })
  }

  handleChangeConditionRelation = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tagPicker/changeConditionRelation',
      payload: {
        currentCondition: id,
      },
    })
  }

  handleOutsideRelationClick = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tagPicker/changeOutsideRelation',
    })
  }


  render() {
    const { conditionList, currentCondition, outsideRelation } = this.props;
    return (
      <div
        className={styles.selectedCondition}
        style={{ display: this.props.visible ? 'flex' : 'none' }}
      >
        <Row style={{ width: '100%' }}>
          <Col span={2}>已选条件</Col>
          <Col span={22} style={{ backgroundColor: '#fff', maxHeight: 150, overflow: 'auto' }}>

            <Row>
              <Col span={3} style={{ textAlign: 'center', marginTop: 15 }}>
                <span>条件间</span>
                {
                  conditionList.length > 1
                    ? <Button
                      style={{ height: 25, padding: '0px 8px', marginRight: 0 }}
                      onClick={this.handleOutsideRelationClick}
                    >
                      {outsideRelation === 'and' ? '全部满足' : '任意满足'}
                    </Button>
                    : ''
                }

              </Col>

              <Col span={21}>
                <RadioGroup value={currentCondition} onChange={this.handleRadioChange} style={{ width: '100%' }}>
                  {
                    conditionList.map((item, index) => {
                      return (
                        <div key={uuidv4()} style={{ display: 'flex', flexWrap: 'wrap' }}>
                          <Col style={{ fontSize: 12, textAlign: 'center' }} span={2}>
                            <div>{`条件${index + 1}:`}</div>
                            {conditionList.length > 1 && index !== conditionList.length - 1 ? <span style={{ color: '#38adf5' }}>{outsideRelation === 'and' ? '且' : '或'}</span> : ''}
                          </Col>
                          <Col span={20}>
                            {this.createHtmlTag(item)}
                          </Col>
                          <Col span={2}><Tag onClick={() => this.handleDelCondition(item.id)}>删除</Tag></Col>
                        </div>
                      );
                    })
                  }
                </RadioGroup>
                <Row style={{ width: '100%' }}>
                  <Col span={3} offset={10}>
                    <Tag onClick={this.handleAddConditionClick}>添加条件</Tag>
                  </Col>
                </Row>
              </Col>
            </Row>

          </Col>
        </Row>
      </div>
    );
  }
}

export default SelectedCondition;
