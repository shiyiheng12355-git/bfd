import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Tabs } from 'antd'
import utils from '../../../utils'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout'
import Log from './Log'
import DownFile from './DownFile'
import Email from './Email'
import Phone from './Phone'
import Password from './Password'

import styles from './index.less'

const TabPane = Tabs.TabPane

@connect(state => ({
  user: state['user']
}))
export default class PersonalCenter extends PureComponent {

  state = {
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchAuths',
      payload: {
        parentKey: 'grzx',
      }
    });
  }

  render() {
    const { user } = this.props;
    return (
      <div className={styles.personalCenter}>
        <PageHeaderLayout />
        <div className={styles.container}>
          <Tabs>
            <TabPane tab="用户操作日志" key="1">
              <Log />
            </TabPane>
            {
              user.auths.includes('grzx_xz')? (
                <TabPane tab="下载文件" key="2">
                  <DownFile />
                </TabPane>
              ): null
            }
            {
              user.auths.includes('grzx_yjzpz')?(
                <TabPane tab="邮件组管理" key="3">
                  <Email />
                </TabPane>
              ):null
            }
            {
              user.auths.includes('grzx_dxzpz')?(
                <TabPane tab="短信组管理" key="4">
                  <Phone />
                </TabPane>
              ):null
            }
            <TabPane tab="修改密码" key="5">
              <Password />
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
  
}
