import React from 'react';
import { connect } from 'dva';
import { Row, Col, Radio, Select, Table } from 'antd';
import moment from 'moment';

import styles from './index.less';

const RadioGroup = Radio.Group;
const Option = Select.Option;

@connect(state => ({
  approval: state['approval']
}))

class Name extends React.Component {

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

  handleChange = (value) => {
    this.props.dispatch({
      type: 'approval/selectChange',
      payload: { value, key: 'selectValue' },
    })
  }

  render() {
    const { currentPage, approvalType, data, radioValue, selectValue, devUserList } = this.props.approval
    const tagContent = JSON.parse(data.tagContent)
    const tagValue = tagContent.tagValue ? JSON.parse(tagContent.tagValue) : []

    const columns = [
      {
        title: '标签值',
        dataIndex: 'tagEnglishValueTitle',
        key: 'tagEnglishValueTitle',
        width: 150,
      }, {
        title: '标签值ID',
        dataIndex: 'tagValueTitle',
        key: 'tagValueTitle',
        width: 150,
      }, {
        title: '业务定义',
        dataIndex: 'business',
        key: 'business',
      }, {
        title: '计算逻辑',
        dataIndex: 'calculLogic',
        key: 'calculLogic',
        width: 150,
      }
    ]
    const tagValueTable = <Table columns={columns} dataSource={tagValue} scroll={{ y: 240 }} pagination={false} style={{marginBottom: 10}}/>

    return ( 
      <div className={styles.Name}>
        <Row className={styles.title}>标签名称：{tagContent.tagName}</Row>
        {
          approvalType === 3 ? // 废弃申请
            <div className={styles.info}> 
                <Row>
                  <Col span={8}>标签ID：{tagContent.tagEnglishName}</Col>
                  <Col span={8}>申请人：{data.applyUser}</Col>
                  <Col span={8}>申请时间：{moment(data.applyTime).format('YYYY-MM-DD')}</Col>
                </Row>
                <Row className={styles.bottom}>
                  <Col span={8}>父级分类：{tagContent.fullPathName}</Col>
                  <Col span={8}>业务需求部门：{tagContent.businessDept}</Col>
                  {
                    currentPage === 'Apply' ? <Col span={8}>标签状态：{data.auditStatusName}</Col> : 
                    currentPage === 'Approval' ? <Col span={8}>审批状态：{data.auditStatusName}</Col> : ''
                  }  
                </Row>

                {tagValueTable}

                {
                  currentPage === 'Approval' || currentPage === 'Release' ? // 审批页面 发布页面
                    <Row>
                      {currentPage === 'Approval' ? '审批意见：' : '发布审批：'}
                      <RadioGroup onChange={this.onChange} value={radioValue}>
                        <Radio value={'1'}>通过</Radio>
                        <Radio value={'0'}>拒绝</Radio>
                      </RadioGroup>
                    </Row> : ''
                }
            </div> : 
            // 新增，修改申请
            <div className={styles.info}>  
              <Row>
                <Col span={8}>标签ID：{tagContent.tagEnglishName}</Col>
                <Col span={8}>申请人：{data.applyUser}</Col>
                <Col span={8}>申请时间：{moment(data.applyTime).format('YYYY-MM-DD')}</Col>
              </Row>
              <Row className={styles.bottom}>
                <Col span={8}>父级分类：{tagContent.fullPathName}</Col>
                {
                  currentPage === 'Apply' && data.auditStatus !== 1 ? 
                    <Row>
                      <Col span={8}>开发者：{data.devUser}</Col>
                    </Row> : ''
                }
              </Row>
              <Row>
                <Col span={8}>更新周期：{tagContent.updateRateName}</Col>
                <Col span={8}>同纬度是否互斥：{tagContent.isMutualName}</Col>
                <Col span={8}>纬度和是否为一：{tagContent.isExhaustivityName}</Col>
              </Row>
              <Row>
                <Col span={8}>业务需求部门：{tagContent.businessDept}</Col>
              </Row>
              <Row className={styles.bottom}>
                <Col span={24}>业务含义：{tagContent.business}</Col>
              </Row>

              {
                currentPage === 'Apply' ?
                  <Row>
                    <Col span={12}>标签状态：{data.auditStatusName}</Col>
                  </Row> : ''
              }

              <div>{tagValueTable}</div>

              {
                currentPage === 'Approval' || currentPage === 'Develop' || currentPage === 'Release' ? 
                  <Row>
                    {currentPage === 'Approval' ? '审批意见：' : currentPage === 'Develop' ? '开发意见：' : '发布审批：'}
                    {
                      currentPage === 'Develop' ? 
                        <RadioGroup onChange={this.onChange} value={radioValue}>
                          <Radio value={'1'}>提交上线</Radio>
                        </RadioGroup> :
                        <RadioGroup onChange={this.onChange} value={radioValue}>
                          <Radio value={'1'}>通过</Radio>
                          <Radio value={'0'}>拒绝</Radio>
                        </RadioGroup>
                    }
                  </Row> : ''
              }

              {
                currentPage === 'Approval' ? 
                  <Row>
                    指派开发者：
                    <Select placeholder='请选择' value={selectValue} style={{ width: 120 }} onChange={this.handleChange}>
                      {
                        devUserList.map((v,i) => <Option key={i} value={v.userName}>{v.userName}</Option>)
                      }
                    </Select>
                  </Row> : ''
              }
            </div> 
        }
      </div>
    )
  }
}

export default Name
