import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Row, Col } from 'antd';
import PercentageBar from './PercentageBar';
import styles from './TagDetailModal.less';


class TagDetailModal extends Component {
  render () {
    const className = { ...styles, ...this.props.className };
    const { showTag, onClose } = this.props;
    if (!showTag) return false;

    return (
      <Modal
        className={className.tagModal}
        title={showTag.name}
        transparent
        maskClosable
        onClose={onClose}
        visible={!!showTag}
        footer={false}
        //   onClose={this.onClose}
      >
        <PercentageBar />
        <Row>
          <Col span={24}><h4 className={className.tagHeader}>基本属性</h4></Col>
          <Col span={3}>父级分类: </Col>
          <Col span={5} >车产/资产信息</Col>
          <Col span={3}>标签ID： </Col>
          <Col span={5}>10001000030004001</Col>
          <Col span={3}>使用状态: </Col>
          <Col span={5} >停止跟新</Col>
        </Row>
        <Row>
          <Col span={4}>累计调用次数: </Col>
          <Col span={4} >287645</Col>
          <Col span={3}>更新周期: </Col>
          <Col span={5} >每月更新</Col>
          <Col span={3}>使用状态: </Col>
          <Col span={5} >正常/</Col>

        </Row>
        <Row>
          <Col span={24}><h4 className={className.tagHeader}>业务属性</h4> </Col>
          <Col span={3}>标签类型: </Col>
          <Col span={5} >组合标签</Col>
          <Col span={3}>创建时间: </Col>
          <Col span={5} >2017/8/31</Col>
          <Col span={3}>创建人: </Col>

          <Col span={5} >admin</Col>
        </Row>
        <Row>
          <Col span={3}>业务含义: </Col>
          <Col span={5} >出境线路的目标客户</Col>
          <Col span={24}><h4 className={className.tagHeader}>生产规则</h4> </Col>
          <Col span={24}>根据车险数据生成 </Col>
        </Row>
      </Modal>
    );
  }
}

TagDetailModal.propTypes = {
  showTag: PropTypes.object,
  onClose: PropTypes.func,
  className: PropTypes.object,
};

export default TagDetailModal;
