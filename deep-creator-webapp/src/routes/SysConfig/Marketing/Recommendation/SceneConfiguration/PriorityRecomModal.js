import React, { Component } from 'react';
import {
  Modal, List, Row, Col, Form, Popover,
} from 'antd';
import moment from 'moment';
import { TIME_FORMAT } from '../../../../../utils/utils';

@Form.create()
export default class PriorityRecomModal extends Component {
  state = {
    toRemove: [],
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchPriorityRecmdList',
      payload: {},
    })
  }

  handleOk = () => {
    this.props.form.validateFields((err) => {
      if (!err) {
        const { toRemove } = this.state;
        if (toRemove.length) {
          const msg = toRemove.map(i => i.maketingName).join(',')
          Modal.confirm({
            title: `确定删除该优先推荐项[${msg}]`,
            onOk: () => {
              this.props.dispatch({
                type: 'sysconfig/marketing/removePriorityRecmdItems',
                payload: toRemove,
              })
            },
          })
          this.setState({ visible: false })
        }
        this.props.onOk();
      }
    })
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  handleRemove = (record) => {
    const { toRemove } = this.state;
    toRemove.push(record);
    this.setState({ toRemove: toRemove.slice(0) });
  }

  render() {
    const { priorityRecmdList } = this.props;
    const { toRemove } = this.state;
    const toRemoveIds = toRemove.map(i => i.id)
    const toShow = priorityRecmdList.filter(recmd => !toRemoveIds.includes(recmd.id))

    return (
      <Modal
        maskClosable={false}
        {...this.props}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <List
          dataSource={toShow}
          renderItem={item =>
            (<Row key={item.id}>
              <Col span={10}>{item.maketingName}</Col>
              <Col span={4}>
                <Popover
                  content={
                    <div>
                      <p>推荐对象:{item.toGroupName}</p>
                      <p>规则类型:{item.matchType}</p>
                      {/* <p>创建人：{item.createUser || ''}</p>
                      <p>创建时间：{moment(item.createTime).format(TIME_FORMAT)}</p>
                  <p>最近修改人：{item.updateUser || ''}</p> */}
                      <p>最近修改时间：{item.updateTime ? moment(item.updateTime).format(TIME_FORMAT) : ''}</p>
                    </div>}>
                  <a onClick={() => false}>详情</a>
                </Popover>
              </Col>
              <Col span={4}>
                <a onClick={this.handleRemove.bind(this, item)}>删除</a>
              </Col>
            </Row>)}>
        </List>
      </Modal >
    );
  }
}

PriorityRecomModal.propTypes = {

};
