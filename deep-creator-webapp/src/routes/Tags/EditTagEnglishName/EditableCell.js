import React, { PureComponent } from 'react'
import { Table, Input, Icon, Button, Popconfirm, Tooltip } from 'antd';

import styles from './index.less'

export default class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: !!this.props.isAdd,
    visible: false,
  }
  //修复批量删除 更新的值没有传递
  componentWillReceiveProps(nextProps){
    if(nextProps.value != this.props.value){
      this.setState({value:nextProps.value});
    }
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value, visible: !value});
  }
  check = () => {
    let value = this.state.value
    !value && (value = '')

    console.log(this.props.title)
    if(this.props.title){
      this.setState({ editable: false });
      if (this.props.onChange) {
        this.props.onChange(false, value.trim());
      }

    }else if(value.trim()){
      this.setState({ editable: false });
      if (this.props.onChange) {
        this.props.onChange(false, value.trim());
      }
    } 
  }
  onBlur = () => {
    let value = this.state.value
    !value && (value = '')
    if(value.trim()){
      this.setState({visible: false})
      this.check();
    } else {
      if(!this.props.title){
        this.setState({visible: true})
      }
    }
  }
  edit = () => {
    this.setState({ editable: true });
    if (this.props.onChange) {
      this.props.onChange(true);
    }
  }
  render() {
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
      {
        editable ?
          <div className="editable-cell-input-wrapper">
            
            <Tooltip visible={this.state.visible} title="请输入字段值" overlayClassName={styles.tooltipClass}>
              <Input
                value={value}
                onChange={this.handleChange}
                onBlur={this.onBlur}
                onPressEnter={this.check}
                maxLength={20}
                placeholder="最多20个字符"
              />
              <Icon
                type="check"
                className="editable-cell-icon-check"
                onClick={this.check}
              />
            </Tooltip>
            
          </div>
          :
          <div className="editable-cell-text-wrapper">
            {value || ' '}
            <Icon
              type="edit"
              className="editable-cell-icon"
              onClick={this.edit}
            />
          </div>
        }
      </div>
    )
  }
}