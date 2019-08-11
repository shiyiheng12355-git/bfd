import React from 'react';
import { connect } from 'dva';
import { Row, Col, Radio } from 'antd';
import moment from 'moment';

import styles from './index.less';

const RadioGroup = Radio.Group;

@connect(state => ({
  approval: state['approval']
}))

class Classification extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {

  }

  onChange = (e) => {
    this.props.dispatch({
      type: 'approval/radioChange',
      payload: { value: e.target.value },
    })
  }

  render() {
    const { currentPage, data, radioValue } = this.props.approval
    const tagContent = JSON.parse(data.tagContent)

    return ( 
      <div className={styles.Classification}>
        <Row className={styles.title}>分类名称：{tagContent.categoryName}</Row>
        <div className={styles.info}>
          <Row>
            <Col span={8}>分类ID：{tagContent.categoryEnglishName}</Col>
            <Col span={8}>申请人：{data.applyUser}</Col>
            <Col span={8}>申请时间：{moment(data.applyTime).format('YYYY-MM-DD')}</Col>
          </Row>
          <Row>
            <Col span={8}>父级分类：{tagContent.pathName}</Col>
            {
              currentPage === 'Apply' ? <Col span={8}>标签状态：{data.auditStatusName}</Col> :
              currentPage === 'Approval' ? <Col span={8}>审批状态：{data.auditStatusName}</Col> : ''
            }
          </Row>
          
          {
            currentPage === 'Approval' || currentPage === 'Release' ? 
              <Row>
                {currentPage === 'Approval' ? '审批意见：' : '发布审批：'}
                <RadioGroup onChange={this.onChange} value={radioValue}>
                  <Radio value={'1'}>通过</Radio>
                  <Radio value={'0'}>拒绝</Radio>
                </RadioGroup>
              </Row> : ''
          }
        </div>
      </div>
    )
  }
}

export default Classification
