import React, { Component } from 'react';
import moment from 'moment';
import styles from './index.less';

const dateFormat = 'YYYY-MM-DD';
export default class MasTitle extends Component {
  renderTitle = () => {
    const { noTime, dateType } = this.props
    let dateTitle = null
    if (noTime || !dateType) {
      return ''
    } else {
      switch (dateType) {
        case 'today':
          dateTitle = `(${moment().format(dateFormat)})`
          break;
        case 'yestoday':
          dateTitle = `(${moment().subtract(1, 'days').format(dateFormat)})`
          break;
        case '7days':
          dateTitle = `(${moment().subtract(7, 'days').format(dateFormat)}至${moment().subtract(1, 'days').format(dateFormat)})`
          break;
        case '30days':
          dateTitle = `(${moment().subtract(30, 'days').format(dateFormat)}至${moment().subtract(1, 'days').format(dateFormat)})`
          break;
        default:
          dateTitle = `(${dateType.startTime}至${dateType.endTime})`
          break;
      }
      return dateTitle
    }
  }
  render() {
    return (
      <div className={styles.MasTitle}>
        {this.props.title}
        {this.renderTitle()}
      </div>
    )
  }
}
