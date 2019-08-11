import React from 'react';
import PropTypes from 'prop-types';
import { Tree, Icon, Popconfirm } from 'antd';

import { arrayToTree } from '../../utils';
import TagDetailModal from './TagDetailModal';
import EditBar from './EditBar';
import styles from './EditableTree.less';

const { TreeNode } = Tree;

class EditableTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTag: null,
    };
  }

  renderEditBar = (node) => {
    return <EditBar tag={node} barItems={this.props.getBarItems(node)}>{node.name}</EditBar>;
  }
  render() {
    const {
      nodes,
    } = this.props;

    const className = { ...styles, ...this.props.className };

    const modalProps = {
      showTag: this.state.showTag,
      onClose: () => this.setState({ showTag: null }),
    };

    const trees = arrayToTree(nodes || [], 'id', 'pid', 'children');

    const renderTreeNodes = (data) => {
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode
              key={item.id}
              dataRef={item}
              className="noCheckbox"
              title={this.renderEditBar(item)}
            >
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode
            {...item}
            dataRef={item}
            className="hasCheckbox"
            key={item.id}
            title={this.renderEditBar(item)}
          />);
      });
    };

    return (
      <div className={className.tagTree}>
        <TagDetailModal {...modalProps} />
        {
          !!trees.length &&
            <Tree
              defaultExpandAll
              showLine
              checkStrictly
            >
              {renderTreeNodes(trees, true)}
            </Tree>
        }
      </div>
    );
  }
}


EditableTree.propTypes = {
  nodes: PropTypes.array.isRequired,
  className: PropTypes.object,
  checkable: PropTypes.bool,
  getBarItems: PropTypes.func,
};

EditableTree.EditBar = EditBar;

export default EditableTree;
