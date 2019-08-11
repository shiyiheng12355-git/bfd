import React, { Component, PropTypes } from 'react';
import { Modal } from 'antd';
import AddModal from '../../../Report/Funnel/Add'

class AddFunnelModal extends Component {
  render() {
    const { onChange, onCancel } = this.props;
    return (
      <Modal
        maskClosable={false}
        {...this.props}
        height='80%'
        width='80%'
        footer={null}
      >
        <AddModal onCancel={onCancel}
          onChange={(data) => {
            onChange && onChange(data);
            onCancel();
          }} />
      </Modal>);
  }
}

AddFunnelModal.propTypes = {
};

export default AddFunnelModal;
