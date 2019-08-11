import React, { Component, PropTypes, PureComponent } from 'react';
import { Layout, message } from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import styles from './index.less';
import ButtonDragSource from './ButtonDragSource';
import EditorDropTarget from './EditorDropTarget';

const { Sider, Content } = Layout;

@DragDropContext(HTML5Backend)
class WorkFlowEditor extends Component {
  state = {
    showModal: null, // 当前显示的对话框
    selectModal: null, // 点击左侧按钮选中的对话框
    selectEdge: null, // 当前被选择的边
    selectNode: null, // 当前被选择的节点
  }

  onDrop = ({ dropModal, item }) => {
    if (item.itemType === 'edge') {
      const model = item.item.getModel();
      if (!model) return;
      if (model.locked) { message.warn('虚线处不可放置节点'); return }
      this.setState({
        showModal: dropModal, selectEdge: model,
      });
    }
  }

  onSelectItem = (item) => {
    if (item.itemType === 'node') {
      const model = item.item.getModel();
      if (model.modal) {
        this.setState({ selectNode: model }, () => {
          this.setState({ showModal: model.modal })
        })
      }
    } else if (item.itemType === 'edge') {
      const model = item.item.getModel();
      if (this.props.onClickCount) this.props.onClickCount(model);
    }
  }

  clear = () => {
    this.setState({ showModal: null, selectNode: null, selectEdge: null });
  }

  renderModalList = (modals) => {
    const { selectEdge, selectNode, showModal } = this.state;

    return (
      <div>{
        modals.map((modal, index) => {
          const Com = modal.modalComponent;
          if (modal.id === showModal) { // 需要时才渲染
            return (<Com key={`com_${index}`}
              title={modal.title}
              {...modal.props}
              visible
              edge={selectEdge}
              node={selectNode}
              onOk={(values) => {
                modal.onOk({ edge: selectEdge, node: selectNode, ...values });
                console.log('将要关闭对话框');
                this.clear();
              }}
              onCancel={this.clear}
            />)
          }
          return false;
        })
      }
      </div>);
  };

  render() {
    let { sider, nodes = [], modals, onDeleteNode, edges } = this.props;

    return (
      <Layout>
        {
          this.renderModalList(modals)
        }
        {
          sider &&
          <Sider className={styles.sider}>
            {
              sider
            }
          </Sider>
        }
        <Content>
          {
            this.props.header
          }
          <EditorDropTarget
            onDeleteNode={onDeleteNode}
            onDrop={this.onDrop}
            onSelectItem={this.onSelectItem}
            nodes={nodes}
            edges={edges} />
        </Content>
      </Layout>);
  }
}

WorkFlowEditor.propTypes = {
};

export {
  WorkFlowEditor,
  ButtonDragSource,
}
