import React from 'react';
import { connect } from 'dva';
import { Modal } from 'antd';
import Classification from './Classification';
import Name from './Name';

import styles from './index.less';

@connect(state => ({
  approval: state['approval']
}))

class TagApproval extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
  }

  componentWillReceiveProps(nextProps) {
    const { open } = nextProps
    if (this.state.open !== open) {
      this.setState({ open })
    }
  }

  render() {
    const { tagType, modalTitle } = this.props.approval

    return ( 
      <Modal
        className={styles.TagApproval}
        title={modalTitle}
        visible={this.state.open}
        onOk={this.props.onOk}
        onCancel={() => {this.props.onCancel()}}
      >
        {tagType === 1 ? <Classification/> : <Name/>}
      </Modal>
    )
  }
}

export default TagApproval
