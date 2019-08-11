import React, { PureComponent } from 'react'
import { Row, Col, Icon, Button, Modal, Tree, Progress } from 'antd'
import TagTreeInfoHeaderTitle from '../../../components/TagTreeInfoHeaderTitle'
import { getPercent, formatMoment } from '../../../utils'
import { connect } from 'dva'
import styles from './index.less'
import moment from 'moment';

@connect(state => ({
  tags: state['tags/tags'],
  LOADING: state.LOADING,
}))
export default class TagModal extends PureComponent {
  state = {
    open: false,
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
    const { tags: { tagNameData }, LOADING } = this.props;
    const showLoading = LOADING.effects['tags/tags/fetchTagName'];
    if (!tagNameData) return null;
    if (showLoading) return false;
    return (
      <Modal title={tagNameData.tagName}
        visible={this.state.open}
        onCancel={this.cancel}
        maskClosable={false}
        footer={null}
        width={960} >
        <div className={styles.tagModal}>
          <div className={styles.topDesc}>
            <Progress percent={getPercent(tagNameData.userNumber, tagNameData.total)} />
            <div className={styles.textDesc}>
              <span>
                <span className={styles.blue}>{tagNameData.userNumber || 0}</span>
                {this.props.entityId === 1 ? '用户' : '产品'}拥有该标签，占全部{this.props.entityId === 1 ? '用户' : '产品'}的
                <span className={styles.blue}>{getPercent(tagNameData.userNumber, tagNameData.total, '%')}</span>
              </span>
            <span style={{ marginLeft: '40px' }}>包含<span className={styles.blue}>{tagNameData.children || 0}</span>个标签值</span>
            </div>
          </div>
          <div className={styles.row}>
            <TagTreeInfoHeaderTitle title="基本属性" color="#108EE9" />
            <Row>
              {tagNameData.fullPathName ? <Col span={8} className={styles.col}>父级分类：<span className={styles.highlight}>{tagNameData.fullPathName}</span></Col> : ''}
              {tagNameData.updateRateName ? <Col span={8} className={styles.col}>更新周期：<span className={styles.highlight}>{tagNameData.updateRateName}</span></Col> : ''}
              {tagNameData.updateTime ? <Col span={8} className={styles.col}>最新更新：<span className={styles.highlight}>{formatMoment(tagNameData.updateTime, 'YYYY-MM-DD')}</span></Col> : ''}      
            </Row>
          </div>
          <div className={styles.row}>
            <TagTreeInfoHeaderTitle title="业务属性" color="#108EE9" />
            <Row>
              {tagNameData.tagTypeName ? <Col span={8} className={styles.col}>标签类型：<span className={styles.highlight}>{tagNameData.tagTypeName}</span></Col> : ''}
              {tagNameData.dataTime ? <Col span={8} className={styles.col}>数据日期：<span className={styles.highlight}>{ tagNameData.dataTime ? moment(tagNameData.dataTime).format('YYYY-MM-DD') : '' }</span></Col> : ''}
              {tagNameData.businessDept ? <Col span={8} className={styles.col}>业务需求部门：<span className={styles.highlight}>{tagNameData.businessDept}</span></Col> : ''}
              {tagNameData.business ? <Col span={24} className={styles.col}>业务含义：<span className={styles.highlight}>{tagNameData.business}</span></Col> : ''}          
            </Row>
          </div>
          <div className={styles.row}>
            <TagTreeInfoHeaderTitle title="生产属性" color="#108EE9" />
            <Row>
              {tagNameData.produceMethodName ? <Col span={8} className={styles.col}>生产方法类型：<span className={styles.highlight}>{tagNameData.produceMethodName}</span></Col> : ''}
              {tagNameData.isMutualName ? <Col span={8} className={styles.col}>同维度是否互斥：<span className={styles.highlight}>{tagNameData.isMutualName}</span></Col> : ''}
              {tagNameData.isExhaustivityName ? <Col span={8} className={styles.col}>维度和是否为一：<span className={styles.highlight}>{tagNameData.isExhaustivityName}</span></Col> : ''}
              {tagNameData.createUser ? <Col span={8} className={styles.col}>创建人：<span className={styles.highlight}>{tagNameData.createUser}</span></Col> : ''}
              {tagNameData.createTime ? <Col span={8} className={styles.col}>创建时间：<span className={styles.highlight}>{formatMoment(tagNameData.createTime, 'YYYY-MM-DD')}</span></Col> : ''}
            </Row>
          </div>
        </div>
      </Modal>
    )
  }
}
