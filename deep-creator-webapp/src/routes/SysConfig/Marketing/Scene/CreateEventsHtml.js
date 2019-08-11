import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Row, Col, Icon } from 'antd';
import uuid from 'uuid';

const uuidv4 = uuid.v4;


class CreateEventsHtml extends PureComponent {
  createOnlineActionHtml = (item) => {
    const { onlineActionDesc = [], innerRelation = '且' } = item;
    return onlineActionDesc.map((action, key) => {
      return (
        <div key={uuidv4()}>
          <span>客户端: {action.appkeyDesc}&nbsp;&nbsp;</span>
          {
            action.firstTimeDesc
              ? <span>{action.firstTimeDesc.key.indexOf('之') >= 0 ? `首次访问时间: ${action.firstTimeDesc.value}${action.firstTimeDesc.key}` : `首次访问时间: ${action.firstTimeDesc.value}`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            action.lastTimeDesc
              ? <span>{action.lastTimeDesc.key.indexOf('之') >= 0 ? `上次访问时间: ${action.lastTimeDesc.value}${action.lastTimeDesc.key}` : `上次次访问时间: ${action.lastTimeDesc.value}`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            action.dateDesc && typeof (action.dateDesc) === 'string'
              ? <span>行为组合时间: {action.dateDesc} &nbsp;&nbsp;</span>
              : ''
          }
          {
            action.dateDesc && typeof (action.dateDesc) !== 'string'
              ? <span>{action.dateDesc.key.indexOf('之') >= 0 ? `行为组合时间: ${action.dateDesc.value}${action.dateDesc.key}` : `行为组合时间: ${action.dateDesc.value}`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            Object.keys(action.eventDesc).length
              ? <span>{`事件: ${action.eventDesc.actionname} ${action.eventDesc.condition} ${action.eventDesc.count}次`} &nbsp;&nbsp;</span>
              : ''
          }
          {
            onlineActionDesc.length > 1 && key !== onlineActionDesc.length - 1 ? <span>{innerRelation}</span> : ''
          }
        </div>
      )
    })
  }


  render() {
    const { keyEvents, outsideRelation } = this.props;
    return (
      <div>
        {
          keyEvents.map((item, index) => {
            console.log('item===---------', item);
            return (
              <div key={`conDiv_${index}`} style={{ display: 'flex', flexWrap: 'wrap' }}>
                <Col style={{ textAlign: 'center' }} span={2}>
                  <div>{`条件${index + 1}:`}</div>
                  {keyEvents.length > 1 && index !== keyEvents.length - 1 ? <span>{outsideRelation === 'and' ? '且' : '或'}</span> : ''}
                </Col>
                <Col span={20}>
                  { this.createOnlineActionHtml(item) }
                </Col>

              </div>
            )
          })
        }
      </div>
    );
  }
}


export default CreateEventsHtml;

