import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Row, Col, Icon } from 'antd';
import uuid from 'uuid';

const uuidv4 = uuid.v4;


class CreateConditionCnHtml extends PureComponent {
  createConditionHtml = (curEditGroup = {}) => {
    let [conditionsDesc, relationDesc] = [[], '或'];
    if (typeof curEditGroup.conditonDesc === 'string') { // 从后端拿回来的JSON数据 => 群组复制的时候用  后端的conditonDesc这个字段写错了,少些一个字母i,注意
      conditionsDesc = curEditGroup.conditonDesc ? JSON.parse(curEditGroup.conditonDesc).conditionsDesc : conditionsDesc;
      relationDesc = curEditGroup.conditonDesc ? JSON.parse(curEditGroup.conditonDesc).relationDesc : relationDesc;
    } else { // 前端自己组织的数据 =>群组新增的时候用
      conditionsDesc = curEditGroup.conditionsDesc || conditionsDesc;
      relationDesc = curEditGroup.relationDesc || relationDesc;
    }

    return conditionsDesc.map((condition, index) => {
      const { channelDesc, userTagDesc, customTagDesc, onlineActionDesc } = condition;
      const insideRelation = condition.relationDesc;
      let totalHtml = [];
      if (Object.keys(channelDesc).length) {
        let channelHtml = this.createChannelHtml(channelDesc);
        totalHtml = totalHtml.concat(channelHtml)
      }
      if (Object.keys(userTagDesc).length) {
        let userTagHtml = this.createUserTagHtml(userTagDesc);
        totalHtml = totalHtml.concat(userTagHtml)
      }
      if (customTagDesc.custom_tag) {
        let customTagHtml = this.createCustomTagHtml(customTagDesc.custom_tag);
        totalHtml = totalHtml.concat(customTagHtml)
      }
      if (customTagDesc.automatic_tag) {
        let automaticTagHtml = this.createAutomaticTagHtml(customTagDesc.automatic_tag);
        totalHtml = totalHtml.concat(automaticTagHtml)
      }
      if (onlineActionDesc.length) {
        let onlineActionHtml = this.createOnlineActionHtml(onlineActionDesc);
        totalHtml = totalHtml.concat(onlineActionHtml)
      }

      return (
        <Row key={uuidv4()} style={{ fontSize: 12 }}>
          <Col span={2} style={{ textAlign: 'center' }}>
            <div >{`条件${index + 1}:`}</div>
            {conditionsDesc.length > 1 && index !== conditionsDesc.length - 1 ? <span>{relationDesc}</span> : ''}
          </Col>
          <Col span={20} style={{ minHeight: 25 }}>
            {
              totalHtml.map((html, index) => {
                if (index !== 0) {
                  return [<span key={uuidv4()}>{insideRelation}</span>, html]
                }
                return html
              })
            }
          </Col>
        </Row>
      )
    })
  }

  createChannelHtml = (channelDesc) => {
    return <span key={uuidv4()} color='blue'>{channelDesc.key}: {channelDesc.value}&nbsp;&nbsp;</span>
  }

  createUserTagHtml = (userTagDesc) => {
    return Object.keys(userTagDesc).map((key) => {
      let tags = userTagDesc[key];
      return <span key={uuidv4()}>{key}: {tags}&nbsp;&nbsp;</span>
    })
  }


  createCustomTagHtml = (customTag) => {
    customTag = customTag.split('或');
    return customTag.map((item) => {
      return <span key={uuidv4()}>自定义标签: {item}&nbsp;&nbsp;</span>
    })
  }

  createAutomaticTagHtml = (automaticTag) => {
    automaticTag = automaticTag.split('或');
    return automaticTag.map((item) => {
      return <span key={uuidv4()}>自动化标签: {item}&nbsp;&nbsp;</span>
    })
  }

  createOnlineActionHtml = (onlineActionDesc) => {
    return onlineActionDesc.map((item, index) => {
      return (
        <span key={uuidv4()}>
          <span>客户端: {item.appkeyDesc}&nbsp;&nbsp;</span>
          {
            item.firstTimeDesc
              ? <span>{item.firstTimeDesc.key.indexOf('之') >= 0 ? `首次访问时间: ${item.firstTimeDesc.value}${item.firstTimeDesc.key}` : `首次访问时间: ${item.firstTimeDesc.value}`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            item.lastTimeDesc
              ? <span>{item.lastTimeDesc.key.indexOf('之') >= 0 ? `上次访问时间: ${item.lastTimeDesc.value}${item.lastTimeDesc.key}` : `上次访问时间: ${item.lastTimeDesc.value}`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            item.dateDesc && typeof (item.dateDesc) === 'string'
              ? <span>行为组合时间: {item.dateDesc} &nbsp;&nbsp;</span>
              : ''
          }
          {
            item.dateDesc && typeof (item.dateDesc) !== 'string'
              ? <span>{item.dateDesc.key.indexOf('之') >= 0 ? `行为组合时间: ${item.dateDesc.value}${item.dateDesc.key}` : `行为组合时间: ${item.dateDesc.value}`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            Object.keys(item.eventDesc).length
              ? <span>{`事件: ${item.eventDesc.actionname} ${item.eventDesc.condition} ${item.eventDesc.count}次`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            item.eventParamsDesc.length
              ? <span> 参数: &nbsp;
               {
                  item.eventParamsDesc.map((param, key) => {
                    return (
                      <span key={uuidv4()}>
                        {key === 0 ? '' : <span>{item.relationDesc}</span>}
                        <span>{param.paramName}  </span>
                        <span>{param.paramCondition}  </span>
                        <span>{param.paramValue}  </span>
                      </span>
                    )
                  })
                }
              </span>
              : ''
          }
        </span>
      )
    })
  }


  render() {
    const { curEditGroup } = this.props;
    return (
      <div>
        {this.createConditionHtml(curEditGroup)}
      </div>
    );
  }
}


export default CreateConditionCnHtml;

