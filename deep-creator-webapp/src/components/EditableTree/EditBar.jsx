import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Modal } from 'antd';
import styles from './EditBar.less';

export default class EditBar extends Component {
  state = {
    showModal: false,
    showIcons: false,
  }

  EditBarModal = (props) => {
    return (<Modal
      visible={!!this.state.showModal}
      onCancel={() => this.setState({ showModal: null })}
      onOk={() => {
        if (props.onOk) {
          props.onOk((err) => {
            if (!err) { this.setState({ showModal: null }); }
          });
        } else {
          this.setState({ showModal: null });
        }
      }}
      title={props.title}
    >{props.children}</Modal>);
  }
  render () {
    const {
      children,
      barItems,
    } = this.props;

    const {
      showIcons,
      showModal,
    } = this.state;

    return (<span className={styles.editBar}
      onMouseOver={() => this.setState({ showIcons: true })}
      onMouseLeave={() => this.setState({ showIcons: false })}
    > {
        showModal && <this.EditBarModal {...barItems[showModal]} />
      }
      {
        showIcons && <span className={styles.editBarIcon}>
          <Icon type="plus" onClick={() => this.setState({ showModal: 'add' })} />
          <Icon type="minus" onClick={() => this.setState({ showModal: 'delete' })} />
          <Icon type="edit" onClick={() => this.setState({ showModal: 'edit' })} />
        </span>
      }
      <span className={styles.editBarTitle}>
        {children}
      </span>
    </span>);
  }
}


EditBar.propTypes = {
  children: PropTypes.any,
  tag: PropTypes.object,
  showBar: PropTypes.bool,
  barItems: PropTypes.object,
};
