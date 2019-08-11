import React from 'react';
import PropTypes from 'prop-types';
import { Tag, Row, Col } from 'antd';
import styles from './TagComposer.less';

let KeyNum = 0;

const LOGIC_TAGS = [
  { key: 'LEFT_BRACKET', name: '(', type: 'LOGIC' },
  { key: 'RIGHT_BRACKET', name: ')', type: 'LOGIC' },
  { key: 'AND', name: 'AND', type: 'LOGIC' },
  { key: 'OR', name: 'OR', type: 'LOGIC' },
  { key: 'NOT', name: 'NOT', type: 'LOGIC' },
];

class TagComposer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
      composeTags: [],
      draggingTag: null,
    };
  }


  onResultClose = (tag) => {
    const { composeTags, tags } = this.state;
    const tagIndex = composeTags.indexOf(tag);
    composeTags.splice(tagIndex, 1);
    this.setState({ composeTags: composeTags.slice(0) },
      this.onUpdateResult.bind(this.state.composeTags));
    this.setState({ tags: tags.slice(0) });
  }

  onUpdateResult = () => {
    if (this.props.onChange) { this.props.onChange(this.state.composeTags); }
  }
  onDropToResult = () => {
    let { draggingTag, composeTags } = this.state;
    if (draggingTag.type === 'LOGIC') {
      KeyNum += 1;
      draggingTag = Object.assign({}, draggingTag, { key: `${draggingTag.key}_${KeyNum}` });
    }
    this.setState({ composeTags: composeTags.concat([draggingTag]) },
      this.onUpdateResult.bind(this.state.composeTags));
  }

  render() {
    let { tags, composeTags, labelCol, wrapperCol } = this.state;
    labelCol = labelCol || {
      xs: 24,
      sm: 24,
    };
    wrapperCol = wrapperCol || {
      xs: 24,
      sm: 24,
    };

    const className = { ...styles, ...this.props.className };

    return (
      <div className={className.tagComposer}>
        <Row className={className.tagContainer}>
          <Col {...labelCol} className={className.label}>{this.props.topTitle || '已选标签：'}</Col>
          <Col {...wrapperCol} className={className.column}>
            {
              tags.map((tag) => {
                return (
                  <Tag
                    style={{ display: composeTags.includes(tag) ? 'none' : true }}
                    draggable
                    closable
                    color="blue"
                    className={className.tag}
                    key={tag.id}
                    onDragStart={() => this.setState({ draggingTag: tag })}
                    onDragEnd={() => this.setState({ draggingTag: null })}
                  >{tag.name}
                  </Tag>);
              })
            }
          </Col>
        </Row>

        <Row className={className.tagContainer}>
          {this.props.middleTitle || <Col {...labelCol} className={className.label}>组合条件：</Col>}
          <Col {...wrapperCol} className={className.column}>

            {
              LOGIC_TAGS.map((tag) => {
                return (
                  <Tag
                    draggable
                    color="blue"
                    className={className.tag}
                    onDragStart={() => this.setState({ draggingTag: tag })}
                    onDragEnd={() => this.setState({ draggingTag: null })}
                    key={tag.key}
                  >{tag.name}
                  </Tag>);
              })
            }
          </Col>
        </Row>
        <Row className={className.tagContainer}>
          {this.props.bottomTitle || ''}
          <Col
            {...wrapperCol}
            className={className.resultColumn}
            onDrop={this.onDropToResult}
            onDragOver={e => e.preventDefault()}
          >
            {
              composeTags.map((tag) => {
                return (
                  <Tag
                  // draggable
                    color="blue"
                    className={className.tag}
                    closable
                    onClose={this.onResultClose.bind(this, tag)}
                    key={tag.key || tag.id}
                  >{tag.name}
                  </Tag>);
              })
            }
          </Col>
        </Row>
      </div>
    );
  }
}


TagComposer.propTypes = {
  tags: PropTypes.array.isRequired, // 初始标签列表
  onChange: PropTypes.func, // 监听标签组合的数据变化
  labelCol: PropTypes.object,
  wrapperCol: PropTypes.object,
  className: PropTypes.object,
  topTitle: PropTypes.element || PropTypes.string,
  middleTitle: PropTypes.string || PropTypes.element,
  bottomTitle: PropTypes.element || PropTypes.string,
};

export default TagComposer;
