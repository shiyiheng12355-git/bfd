import React from 'react';
import { Link } from 'dva/router';
import PageHeader from '../components/PageHeader';
import styles from './PageHeaderLayout.less';

export default ({ children, wrapperClassName, contentClassName, top, ...restProps }) => (
  <div style={{ margin: '24px 0px' }} className={wrapperClassName}>
    {top}
    <PageHeader key="pageheader" {...restProps} linkElement={Link} />
    {children ? <div className={`${styles.content} ${contentClassName || ''}`}>{children}</div> : null}
  </div>
);
