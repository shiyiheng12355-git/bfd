import React, { Component, PropTypes } from 'react';
import { Modal, message } from 'antd';
import moment from 'moment';
import TagPicker from '../../../../components/TagPicker';

class AddGroupModal extends Component {
  state = {
    radioValue: 1,
    selectGroup: null,
  }


  getTagPicker = (v) => {
    this.tagPicker = v;
  }

  onChangeRadio = (e) => {
    this.setState({ radioValue: e.target.value });
  }


  onOk = () => {
    const { conditionList } = this.props;
    const { length } = conditionList;
    const lastCondition = conditionList[length - 1];
    const { UserTag, CustomTag, OnlineBehavior } = lastCondition;
    if (!UserTag.isChannelReady && !UserTag.isReady && !CustomTag.isReady && !OnlineBehavior.isReady) {
      message.info('条件不能为空');
      return false;
    } else {
      this.handleConditionOk();
    }
  }

  formatPeriodDate = (start, end) => {
    let dateDesc = {};
    if (!start && end) {
      dateDesc = {
        key: '之前',
        value: end,
      }
    } else if (start && !end) {
      dateDesc = {
        key: '之后',
        value: start,
      }
    } else if (start && end) {
      if (moment(start).valueOf() === moment(end).valueOf()) {
        dateDesc = {
          key: '发生于',
          value: start,
        }
      } else {
        dateDesc = {
          key: '介于',
          value: [start, end],
        }
      }
    } else if (!start && !end) {
      dateDesc = null;
    }
    return dateDesc;
  }


  handleConditionOk = () => {
    const tagPickerValue = this.tagPicker.getFieldsValue();
    const { conditionList, outsideRelation } = this.props;
    let [conditions, conditionsDesc] = [[], []];

    conditionList.forEach((conditionItem, index) => {
      const { UserTag, CustomTag, OnlineBehavior } = conditionItem;
      let [tag, action, trade] = [{}, [], []];
      let [userTagDesc, channelDesc, customTagDesc, onlineActionDesc] = [{}, {}, {}, []];

      const relation = conditionItem.relation || 'and'; // 全部满足 任意满足 |
      const relationDesc = conditionItem.relation === 'and' ? '且' : '或';

      if (UserTag.isChannelReady) { // 渠道
        tag.channel = UserTag.checkedChannels.map(item => item.dictionaryCode);
        channelDesc = {
          key: '渠道',
          value: UserTag.checkedChannels.map(channel => channel.dictionaryLabel).join(',').replace(',', '或'),
        }
      }
      //  else { // 渠道不限
      //   tag.channels = [];
      // }

      if (UserTag.isReady) { // 用户标签
        const result = _.groupBy(UserTag.checkedTags, 'tagEnglishName');
        Object.keys(result).forEach((key) => {
          const current = result[key];
          const title = current[0].ptitle;
          const val = [];
          current.forEach((cur) => {
            val.push(cur.tagValueTitle);
          });
          tag[key] = val;
          // debugger;
          userTagDesc[title] = val.join(',').replace(',', '或');
        })
      }

      if (CustomTag.isReady) { // 自定义标签
        const { checkedCusTags } = CustomTag;
        const { customerTag, automaticTag } = checkedCusTags;
        if (customerTag.length) {
          let cusArr = customerTag.map(cus => cus.tagValueTitle);
          tag.custom_tag = cusArr;
          customTagDesc.custom_tag = cusArr.join(',').replace(',', '或');
        }
        if (automaticTag.length) {
          let autoArr = automaticTag.map(auto => auto.tagValueTitle);
          tag.automatic_tag = autoArr;
          customTagDesc.automatic_tag = autoArr.join(',').replace(',', '或');
        }
      }

      if (OnlineBehavior.isReady && OnlineBehavior.action.length) { // 线上行为
        OnlineBehavior.action.forEach((actionItem) => {
          const appkey = [actionItem.appkey.appkey];
          const appkeyDesc = actionItem.appkey.appkeyName;
          const date = actionItem.date.point ? { point: actionItem.date.point.key } : actionItem.date;
          const dateDesc = actionItem.date.point
            ? actionItem.date.point.name
            : this.formatPeriodDate(actionItem.date.period.start_date, actionItem.date.period.end_date);
          const event = {
            condition: actionItem.event.condition,
            actionname: actionItem.event.actionname,
            count: actionItem.event.count,
          }
          const eventDesc = {
            condition: actionItem.event.condition_cn,
            actionname: actionItem.event.actionname_cn,
            count: actionItem.event.count,
          }
          const eventParams = [];
          const eventParamsDesc = [];
          if (actionItem.event_params.length) {
            actionItem.event_params.forEach((param) => {
              eventParams.push({
                param_condition: param.param_condition,
                param_name: param.param_name,
                param_value: param.param_value,
              })
              eventParamsDesc.push({
                paramCondition: param.param_condition_cn,
                paramName: param.param_name_cn,
                paramValue: param.param_value,
              })
            })
          }
          const paramRelation = actionItem.relation;
          const paramRelationDesc = actionItem.relation === 'and' ? '且' : '或';
          const firstTimeDesc = this.formatPeriodDate(actionItem.first_time.start_date, actionItem.first_time.end_date);
          const lastTimeDesc = this.formatPeriodDate(actionItem.last_time.start_date, actionItem.last_time.end_date);

          action.push({
            appkey,
            date,
            event,
            relation: paramRelation,
            event_params: eventParams,
            first_time: actionItem.first_time,
            last_time: actionItem.last_time,
          })
          onlineActionDesc.push({
            appkeyDesc,
            dateDesc,
            eventDesc,
            eventParamsDesc,
            firstTimeDesc,
            lastTimeDesc,
            relationDesc: paramRelationDesc,
          })
        })
      }

      conditions.push({
        relation,
        tag,
        action,
        trade,
      })

      conditionsDesc.push({
        relationDesc,
        channelDesc,
        userTagDesc,
        customTagDesc,
        onlineActionDesc,

      })
    })


    const finalResult = { // 传给后台的英文JSON
      conditions,
      relation: outsideRelation,
    }

    const finalResultDesc = { // 传给后台的中文描述
      conditionsDesc,
      tagPickerValue,
      conditionList,
      relationDesc: outsideRelation === 'and' ? '且' : '或',
    }

    this.props.handleGroupData(finalResult, finalResultDesc);
  }


  render() {
    const { dispatch, entityId, curEditGroup, isResetTagPickerForm, isCopyHandle, tagpickerTabKeys = [] } = this.props;
    return (
      <Modal
        maskClosable={false}
        {...this.props}
        height='80%'
        width='80%'
        onOk={this.onOk}
      >
        <TagPicker
          SelectedConditionVisible
          isLifeTime
          isResetTagPickerForm={isResetTagPickerForm}
          isCopyHandle={isCopyHandle}
          curEditGroup={curEditGroup}
          entityId={entityId}
          dispatch={dispatch}
          ref={this.getTagPicker}
        />
      </Modal>);
  }
}

AddGroupModal.propTypes = {
};

export default AddGroupModal;
