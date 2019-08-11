import React, { PureComponent } from 'react'

import styles from './index.less'

export default class TagTreeInfoHeaderTitle extends PureComponent {
  render() {
    return (
      <div className={styles.tagTreeInfoHeaderTitle} style={{ color: this.props.color }}>
        {this.props.title || this.props.children}
      </div>
    )
  }
}
