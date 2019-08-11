import React from 'react';
import PropTypes from 'prop-types';
import { Tree, Icon, Popconfirm } from 'antd';
import { arrayToTree } from '../../utils';
import TagDetailModal from './TagDetailModal';
import styles from './ComposeTagTree.less';

const { TreeNode } = Tree;

class ComposeTagTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTag: null,
    };
  }

  onSelectComposeTag = (keys) => {
    const tag = this.props.composeTags.find(item => keys.includes(item.id));
    this.setState({ showTag: tag });
  }

  onDeleteComposeTag = (keys) => {
    if (this.props.onDeleteComposeTag) { this.props.onDeleteComposeTag(keys); }
  }
  renderNodeTitle = (options) => {
    const { className, item, canDelete } = options;
    const title = canDelete ? (
      <div>
        <span
          className={className.leafTitle}
          onClick={this.onSelectComposeTag.bind(this, [item.id])}
        >
          {item.name}
        </span>
        <span className={className.leafPeriod}>
          {item.period}
        </span>
        <Popconfirm
          title="确定删除该组合标签"
          onConfirm={this.onDeleteComposeTag.bind(this, [item.id])}
        >
          <span className={className.leafDelete}>
            <Icon type="delete" />
          </span>
        </Popconfirm>

      </div>)
      :
      (
        <div>
          <span className={className.leafTitle}>
            {item.name}
          </span>
          <span className={className.leafPeriod}>
            {item.period}
          </span>
        </div>);
    return title;
  };
  render() {
    const {
      composeTags,
      showComposeTree,
    } = this.props;

    const className = { ...styles, ...this.props.className };

    const modalProps = {
      showTag: this.state.showTag,
      onClose: () => this.setState({ showTag: null }),
    };

    const composeNodes = arrayToTree(composeTags || [], 'id', 'pid', 'children');


    const renderTreeNodes = (data, canDelete) => {
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode
              title={item.name}
              key={item.id}
              dataRef={item}
              className="noCheckbox"
            >
              {renderTreeNodes(item.children, canDelete)}
            </TreeNode>
          );
        }
        return (<TreeNode
          {...item}
          dataRef={item}
          className="hasCheckbox"
          key={item.id}
          title={this.renderNodeTitle({ item, className, canDelete })}
        />);
      });
    };

    return (
      <div className={className.tagTree}>
        <TagDetailModal {...modalProps} />
        {
          showComposeTree && !!composeNodes.length &&
          <div>组合标签
            {
              <Tree
                defaultExpandAll
                showLine
                checkStrictly
              >
                {renderTreeNodes(composeNodes, true)}
              </Tree>
            }
          </div>
        }
      </div>
    );
  }
}


ComposeTagTree.propTypes = {
  basicTags: PropTypes.array.isRequired,
  composeTags: PropTypes.array,
  showBasicTree: PropTypes.bool,
  showComposeTree: PropTypes.bool,
  className: PropTypes.object,
  checkable: PropTypes.bool,
  onCheckBasicTag: PropTypes.func,
  canDeleteCompose: PropTypes.bool,
  onDeleteComposeTag: PropTypes.func,
  tagType: PropTypes.string,
};

export default ComposeTagTree;
