import React, { PureComponent } from 'react'
import { Row, Col, Icon, Button, Modal, Tree, Progress, Input } from 'antd'
import TagTreeInfoHeaderTitle from '../../../components/TagTreeInfoHeaderTitle'
import { getPercent, formatMoment } from '../../../utils'
import { connect } from 'dva'

import styles from './index.less'

@connect(state => ({
  tags: state['tags/tags'],
  LOADING: state.LOADING,
}))
export default class ValueModal extends PureComponent {
  state = {
    open: false,
  }

  componentDidMount() {
    const { dispatch } = this.props
  }

  componentWillReceiveProps(nextProps) {
    const { open } = nextProps
    if (this.state.open !== open) {
      this.setState({ open })
    }
  }

  cancel = () => {
    this.props.onChange(false)
  }

  render() {
    const { tags: { tagValueData }, LOADING } = this.props;
    if (!tagValueData) return null;
    const showLoading = LOADING.effects['tags/tags/fetchTagValue'];
    if (showLoading) return false;
    return (
      <Modal title={tagValueData.tagValueTitle}
        visible={this.state.open}
        onCancel={this.cancel}
        maskClosable={false}
        footer={null}
        width={960} >
        <div className={styles.tagModal}>
          <div>
            <div className={styles.topDesc}>
              <Progress percent={getPercent(tagValueData.userNumber, tagValueData.total)} />
              <div className={styles.textDesc}>
                <span>
                  <span className={styles.blue}>{tagValueData.userNumber || 0}
                  </span>{this.props.entityId === 1 ? '用户' : '产品'}拥有该标签，占全部{this.props.entityId === 1 ? '用户' : '产品'}的
                <span className={styles.blue}>{
                    getPercent(tagValueData.userNumber, tagValueData.total, '%')}
                  </span>
                </span>
              </div>
            </div>
            <div className={styles.row}>
              <TagTreeInfoHeaderTitle title="基本属性" color="#108EE9" />
              <Row>
                {tagValueData.fullPathName ? <Col span={8} className={styles.col}>父级分类：<span className={styles.highlight}>{tagValueData.fullPathName}</span></Col> : ''}
                {tagValueData.updateRateName ? <Col span={8} className={styles.col}>更新周期：<span className={styles.highlight}>{tagValueData.updateRateName}</span></Col> : ''}
                {tagValueData.updateTime ? <Col span={8} className={styles.col}>最新更新：<span className={styles.highlight}>{formatMoment(tagValueData.updateTime, 'YYYY-MM-DD')}</span></Col> : ''}
              </Row>
            </div>
          </div>
          <div className={styles.row}>
            <TagTreeInfoHeaderTitle title="业务属性" color="#108EE9" />
            <Row>
              {tagValueData.business ? <Col span={12} className={styles.col}>业务定义：{tagValueData.business}</Col> : ''}
              {tagValueData.calculLogic ? <Col span={12} className={styles.col}>计算逻辑：{tagValueData.calculLogic}</Col> : ''}
            </Row>
          </div>
        </div>
      </Modal>
    )
  }
}
