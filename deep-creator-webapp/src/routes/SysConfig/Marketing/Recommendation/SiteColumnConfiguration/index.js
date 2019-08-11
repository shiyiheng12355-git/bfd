import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Q from 'bluebird';
import { Tree, Icon, Button, Row, Col, Modal } from 'antd';
import HeaderTitle from '../../../../../components/HeaderTitle';
import { arrayToTree, PROTECTED_FIELDS } from '../../../../../utils/utils';
import AddSiteModal from './AddSiteModal';
import AddColumnModal from './AddColumnModal';
import styles from './index.less';

const TreeNode = Tree.TreeNode;

class SiteColumnConfiguration extends Component {
  state = {
    showSiteModal: false,
    showColumnModal: false,
    editItem: null,
    editField: null,
    tree: [],
    resetTree: true,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.siteNodes) {
      this.setState({ tree: arrayToTree(nextProps.siteNodes) });
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchSites',
      payload: {},
    });
  }

  resetTree = () => {
    this.setState({ resetTree: false }, () => {
      this.setState({ resetTree: true })
    })
  }

  handleDelete = (item) => {
    let title;
    let content;
    let onOk;
    switch (item.type) {
      case 'SITE': {
        title = '删除客户资源';
        content = '删除客户资源将一同删除客户资源下的客户端和栏位，确认是否删除?';
        onOk = close => this.props.dispatch({
          type: 'sysconfig/marketing/removeSite',
          payload: item,
          callback: () => {
            close();
            this.props.dispatch({
              type: 'sysconfig/marketing/fetchSites',
              payload: {},
            });
            this.resetTree();
          },
        });
        break;
      }
      case 'APP_KEY': {
        title = '删除客户端';
        content = '删除客户端将一同删除客户端下的栏位，确认是否删除?';
        onOk = close => this.props.dispatch({
          type: 'sysconfig/marketing/removeAppKey',
          payload: item,
          callback: () => {
            close();
            this.props.dispatch({
              type: 'sysconfig/marketing/fetchSites',
              payload: {},
            });
            this.resetTree();
          },
        });
        break
      }
      case 'FIELD': {
        title = '删除栏位';
        content = '确认是否删除栏位?';
        onOk = close => this.props.dispatch({
          type: 'sysconfig/marketing/removeField',
          payload: item,
          callback: () => {
            close();
            this.props.dispatch({
              type: 'sysconfig/marketing/fetchSites',
              payload: {},
            });
            this.resetTree();
          },
        });
        break
      }
      default:
        break;
    }
    Modal.confirm({
      title,
      content,
      onOk,
    })
  }

  handleEdit = (item) => {
    if (item.type === 'SITE') {
      this.setState({
        editItem: item,
        showSiteModal: true,
      });
    } else {
      this.setState({
        editField: item,
        showColumnModal: true,
      });
    }
  }

  handleToggleModal = (modal) => {
    const visible = this.state[modal];
    this.setState({ [modal]: !visible });
  }

  renderNodeTitle = (item) => {
    let title = [];
    let button;
    switch (item.type) {
      case 'SITE': {
        title = [`客户资源名称:${item.name}`, `客户资源ID:${item.id}`];
        button = (<span style={{ position: 'absolute', top: 0, right: 0 }}>
          <Icon size='large' type='edit' onClick={this.handleEdit.bind(this, item)} />
          <Icon style={{ marginLeft: '8px' }} size='large' type='delete' onClick={this.handleDelete.bind(this, item)} />
        </span>)
        if (PROTECTED_FIELDS.siteId.includes(item.id)) button = <span />
        break;
      }
      case 'APP_KEY': {
        title = [`客户端名称:${item.name}`];
        button = (<span style={{ position: 'absolute', top: 0, right: 0 }}>
          <Icon size='large' type='delete' onClick={this.handleDelete.bind(this, item)} />
        </span>)
        if (PROTECTED_FIELDS.appkey.includes(item.id)) button = <span />
        break;
      }
      default: {
        title = [`栏位名称:${item.name}`, `栏位ID:${item.id}`];
        button = (<span style={{ position: 'absolute', top: 0, right: 0 }}>
          <Icon size='large' type='edit' onClick={this.handleEdit.bind(this, item)} />
          <Icon style={{ marginLeft: '8px' }} size='large' type='delete' onClick={this.handleDelete.bind(this, item)} />
        </span>)
        if (PROTECTED_FIELDS.fieldId.includes(item.id)) button = <span />
        break;
      }
    }

    return (
      <Row justify="space-between" type='flex' className={styles.row}>
        <Col>
          {
            title.join(' ')
          }
        </Col>
        <Col>
          {
            button
          }
        </Col>
      </Row>)
  }

  handleLoadData = (treeNode) => {
    const _this = this;
    return new Q((resolve) => {
      if (treeNode.props.children) {
        resolve();
        return
      }
      const { dataRef } = treeNode.props
      if (dataRef.type === 'SITE') {
        this.props.dispatch({
          type: 'sysconfig/marketing/fetchSiteApps',
          payload: { siteId: dataRef.id },
          callback: (apps) => {
            dataRef.children = apps.map((app) => {
              return { ...app, siteId: dataRef.id };
            });
            _this.setState({ tree: [..._this.state.tree] })
            resolve();
          },
        })
      } else if (dataRef.type === 'APP_KEY') {
        this.props.dispatch({
          type: 'sysconfig/marketing/fetchAppFields',
          payload: { siteId: dataRef.siteId, appKey: dataRef.appKey },
          callback: (fields) => {
            dataRef.children = fields.map((field) => { return { ...field, isLeaf: true } });
            _this.setState({ tree: [..._this.state.tree] })
            resolve()
          },
        })
      } else {
        resolve()
      }
    })
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={this.renderNodeTitle(item)}
            className={styles.treeNode}
            key={item.id}
            isLeaf={item.isLeaf}
            dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode className={styles.treeNode}
          key={item.id}
          dataRef={item}
          title={this.renderNodeTitle(item)}
          isLeaf={item.isLeaf}
          selectable={false} />);
    });
  }

  renderTree = (tree) => {
    return (<Tree
      showLine
      loadData={this.handleLoadData}
    >
      {
        this.renderTreeNodes(tree)
      }
    </Tree>)
  }

  render() {
    const { siteList, dispatch, appKeys, loading } = this.props;
    let { showSiteModal, editItem, showColumnModal, tree, editField, resetTree } = this.state;

    const siteModalProps = {
      title: editItem ? '编辑客户资源' : '添加客户资源',
      loading,
      visible: showSiteModal,
      editSite: editItem,
      dispatch,
      appKeys,
      onCancel: () => {
        this.handleToggleModal('showSiteModal');
        this.setState({ editItem: null });
      },
      onOk: () => {
        this.handleToggleModal('showSiteModal');
        this.setState({ editItem: null });
        this.resetTree();
      },
    }

    const columnModalProps = {
      visible: showColumnModal,
      title: editField ? '编辑栏位' : '添加栏位',
      loading,
      editField,
      siteList,
      dispatch,
      onCancel: () => {
        this.handleToggleModal('showColumnModal');
        this.setState({ editField: null });
      },
      onOk: () => {
        this.handleToggleModal('showColumnModal');
        this.setState({ editField: null })
        this.resetTree();
      },
    }

    return (
      <div className={styles.gxhtj}>
        <AddSiteModal {...siteModalProps} />
        <AddColumnModal {...columnModalProps} />
        <HeaderTitle>推荐栏位配置</HeaderTitle>
        <Row className={styles.operator}>
          <Button size='small'
            type='primary'
            onClick={this.handleToggleModal.bind(this, 'showSiteModal')}
          >添加客户资源</Button>
          <Button size='small'
            type='primary'
            onClick={this.handleToggleModal.bind(this, 'showColumnModal')}
          >添加栏位</Button>
        </Row>
        {
          resetTree && this.renderTree(tree)
        }
      </div >
    );
  }
}

SiteColumnConfiguration.propTypes = {

};

export default SiteColumnConfiguration;