import React, { PureComponent } from 'react';
import { Input, Icon, message } from 'antd';
import styles from './index.less';

export default class EditableItem extends PureComponent {
  state = {
    value: this.props.value,
    editable: false,
  };
  handleChange = (e) => {
    const { value } = e.target;
    const { vaildCoding } = this.props
    if (vaildCoding) {
      const reg = new RegExp('^[-_.A-Za-z0-9\u4e00-\u9fa5]+$')
      if (value === '' || !value) {
        message.warning('速码名称和页面显示名称显示名称不能为空')
        return
      }
      if (value.length > 20) {
        message.warning('速码名称和页面显示名称显示名称不能超过20个字')
        return
      }
      if (!reg.test(value)) {
        message.warning('速码名称和页面显示名称只能输入中文、英文、数字、-、_、.')
        return
      }
    }
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  edit = () => {
    this.setState({ editable: true });
  }
  render() {
    const { value, editable } = this.state;
    return (
      <div className={styles.editableItem}>
        {
          editable ? (
            <div className={styles.wrapper}>
              <Input
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
              />
              <Icon
                type="check"
                className={styles.icon}
                onClick={this.check}
              />
            </div>
          ) : (
            <div className={styles.wrapper}>
              <span>{value || ' '}</span>
              <Icon
                type="edit"
                className={styles.icon}
                onClick={this.edit}
              />
            </div>
          )
        }
      </div>
    );
  }
}
