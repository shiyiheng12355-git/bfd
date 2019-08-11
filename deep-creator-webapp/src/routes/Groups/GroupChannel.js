import React, { Component } from 'react';
import { Radio } from 'antd';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import classNames from 'classnames';

import styles from './GroupChannel.less';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Authorized = RenderAuthorized();
class GroupChannel extends Component {
  handleRadioChange = (e) => {
    const { value } = e.target
    this.props.handleGroupChannelChange(value)
  }


  render() {
    const { entityId, entityName, groupChannel, systemAndImprotAuth = [] } = this.props;
    const radioStyle = classNames({
      [styles.noBorder]: true,
      [styles.noBackground]: true,
    })
    console.log('systemAndImprotAuth-----', systemAndImprotAuth)
    return (
      <div className={styles.groupChannel}>
        <RadioGroup
          value={groupChannel}
          onChange={this.handleRadioChange}
        >
          <Authorized authority={() => systemAndImprotAuth.includes(`qzgl_xqzgl_nzq_${entityId}`)} >
            <RadioButton className={radioStyle} value="1">系统内{entityName}群</RadioButton>
          </Authorized>
          <Authorized authority={() => systemAndImprotAuth.includes(`qzgl_xqzgl_wdq_${entityId}`)} >
            <RadioButton className={radioStyle} value="2">外接{entityName}群</RadioButton>
          </Authorized>
        </RadioGroup>
      </div>
    );
  }
}


export default GroupChannel;
