import React, { PureComponent } from 'react'

import styles from './index.less'

export default class HeaderTitle extends PureComponent {
  render() {
    return (
      <div className={styles.headerTitle}>
        {this.props.title || this.props.children}
      </div>
    )
  }
}
