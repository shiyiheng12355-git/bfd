import React, { Component } from 'react';
import { Tree, Radio, Checkbox } from 'antd';
import { Icon, Button, Input, AutoComplete } from 'antd';
import { groupBy } from 'lodash';
import { arrayToTree, getSubTree } from '../../../utils';
import uuid from 'uuid';
import Q from 'bluebird';
import styles from './UserTag.less';
import tagTree from '../../GroupDetail/Tags';
import cloneDeep from 'lodash/cloneDeep';

const { TreeNode } = Tree;
const CheckboxGroup = Checkbox.Group;
const uuidv4 = uuid.v4;
let  dataList = [];

class UserTag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedKeys:[],//存放展开key
      searchValue :'', //存放搜索值
      autoExpandParent: false,
    };
    this.tagTreeWithKey = [];
  }


  componentDidMount() {
    const { dispatch, entityId } = this.props;
    this.initData(dispatch, entityId);

  }

  componentWillReceiveProps(nextProps) {
    if(this.props.tagTree !== nextProps.tagTree){
      dataList= [];
      this.tagTreeWithKey = cloneDeep(nextProps.tagTree);
      this.generateList(this.tagTreeWithKey);//tagTreeWithKey key在这个方法里加上去了
    }
    if (this.props.entityId !== nextProps.entityId) {
      const { dispatch } = this.props;
      const { entityId } = nextProps;
      this.initData(dispatch, entityId);
    }
    
  }
  initData = (dispatch, entityId) => {
    // 获取渠道
    dispatch({
      type: 'tagPicker/getChannel',
      payload: {
        entityId,
      },
    })

    // 获取标签树,包含标签值
    dispatch({
      type: 'tagPicker/getTagTree',
      payload: {
        entityId,
      },
    });
  }


  handleRadioChange = (e) => {
    const { checked } = e.target;
    const { value, onChange } = this.props;
    if (checked) {
      value.isChannelReady = false;
      value.checkedChannels = [];
    }
    onChange(value);
  }


  handleTagsCheck = (checkedKeys) => {
    const { checked } = checkedKeys;
    const { value, onChange, tagTree } = this.props;
    const checkedTags = [];
    checked.forEach((item) => {
      const subtree = getSubTree(tagTree, item, 'tagEnglishValueTitle') || {};
      const parent = getSubTree(tagTree, subtree.tagEnglishName, 'tagEnglishName');
      subtree.ptitle = parent.tagName;
      checkedTags.push(subtree);
    });

    value.checkedTags = checkedTags;

    if (checked.length) { // 判断是否选择了标签
      value.isReady = true;
    } else {
      value.isReady = false;
    }
    onChange(value);
  }

  handleChannelChange = (checkedChannelKeys) => {
    const { value, onChange } = this.props;
    const checkedChannels = this.props.channels.filter(channel => checkedChannelKeys.includes(channel.dictionaryCode));
    if (checkedChannels.length) {
      value.isChannelReady = true;
    } else {
      value.isChannelReady = false;
    }
    value.checkedChannels = checkedChannels;

    onChange(value);
  }

  filterDefaultExpandedKeys = (tree) => {
    const keys = [];
    let node = tree;
    while (node) {
      keys.push(node.id.toString());
      if (node.children && node.children.length) {
        [node] = node.children;
      } else {
        break;
      }
    }
    return keys;
  }


  onLoadData = (treeNode) => {
    return new Q((resolve) => {
      if (treeNode.props.children || treeNode.props.dataRef.isLeaf) {
        resolve();
        return;
      }
      const { dispatch, entityId } = this.props;

      const { dataRef } = treeNode.props;
      const { tagEnglishName } = dataRef;
      dispatch({
        type: 'tagPicker/getTagValues',
        payload: {
          entityId,
          tagEnglishName,
          callback: (success) => {
            if (success) resolve();
          },
        },
      })
    });
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        //增加查询命中的 高亮
        let searchValue2 = this.state.searchValue;
        const treeTitle2 =  item.categoryName || item.tagName;
        let index2 = treeTitle2.indexOf(searchValue2);
        let beforeStr2 = treeTitle2.substr(0, index2);
        let afterStr2 = treeTitle2.substr(index2+ searchValue2.length);
        let title2 = index2 > -1 ? (
          <span>
            {beforeStr2}
            <span style={{ color: '#f50' }}>{searchValue2}</span>
            {afterStr2}
          </span>
        ) : <span>{treeTitle2}</span>;
        return (
          <TreeNode
            title={title2}
            key={item.categoryEnglishName || item.tagEnglishName}
            dataRef={item}
            selectable={false}
            isLeaf={item.isLeaf}
            disableCheckbox={!item.isLeaf}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      //增加查询命中的 高亮
      let searchValue = this.state.searchValue;
      let treeTitle =  item.categoryName || item.tagName || item.tagValueTitle;
      let index = treeTitle.indexOf(searchValue);
      let beforeStr = treeTitle.substr(0, index);
      let afterStr = treeTitle.substr(index + searchValue.length);
      let title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{treeTitle}</span>;
      return (<TreeNode
        title={title}
        key={item.isLeaf ? item.tagEnglishValueTitle : (item.categoryEnglishName || item.tagEnglishName)}
        dataRef={item}
        selectable={false}
        isLeaf={item.isLeaf}
        disableCheckbox={!item.isLeaf}
      />);
    });
  }

  //查询
  handleSearch(values){
    const {tagTree } = this.props;
    const value = values;
    const expandedKeys = dataList.map((item) => {
      if (item.title.indexOf(value) > -1) {
        return this.getParentKey(item.key, this.tagTreeWithKey);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    //假如搜索值为空 则全部折叠回来
    if(!value){
      this.setState({
        expandedKeys:[],
        searchValue: value,
        autoExpandParent: false,
      });
    }
    else{
      this.setState({
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
      });
    }
   
  }

  getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  generateList = (data) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const title =  node.categoryName || node.tagName || node.tagValueTitle;
      node.title = title;
      const key = node.isLeaf ? node.tagEnglishValueTitle : (node.categoryEnglishName || node.tagEnglishName);
      node.key = key;
      dataList.push({ key, title:title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  };
  
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  render() {
    console.log('UserTag+++++++++++++this.props+++++++', this.props);
    let { channels, value = {}, tagTree = [] } = this.props;
    const { checkedChannels = [], checkedTags = [] } = value;
    const checkedKeys = checkedTags.map(tag => tag.tagEnglishValueTitle);
    const channelKeys = checkedChannels.map(channel => channel.dictionaryCode);
    console.log('tagTree999999999999----------------->>>>>>>>>>>>>>>>', tagTree);

    tagTree = tagTree.filter(item => item.categoryEnglishName !== 'busines_tag');

    return (
      <div className={styles.usertag} >
        <div style={{ display: 'flex' }}>
          <Radio
            checked={!checkedChannels.length}
            onChange={this.handleRadioChange}
          >
            不限
          </Radio>
          <CheckboxGroup
            onChange={this.handleChannelChange}
            value={channelKeys}
          >
            {
              channels.map((channel, index) => {
                return (
                  <Checkbox
                    value={channel.dictionaryCode}
                    key={uuidv4()}
                  >{channel.dictionaryLabel}
                  </Checkbox>);
              })
            }
          </CheckboxGroup>
        </div>
          {
            tagTree && tagTree.length >0 ?(<div className="global-search-wrapper" style={{ width: 300 }}>
            <AutoComplete
              className="global-search"
              size="large"
              style={{ width: '100%' }}
              onChange={this.handleSearch.bind(this)}
              placeholder=""
              optionLabelProp="text"
            >
              <Input
                suffix={(
                  <Button className="search-btn" size="large" type="primary">
                    <Icon type="search" />
                  </Button>
                )}
              />
            </AutoComplete>
          </div>):null
          }
        <Tree
          onExpand={this.onExpand}
          expandedKeys={this.state.expandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          checkable
          checkStrictly
          checkedKeys={checkedKeys}
          onCheck={this.handleTagsCheck}
        // loadData={this.onLoadData}
        >
          {this.renderTreeNodes(tagTree)}
        </Tree>

      </div>);
  }
}


export default UserTag;

