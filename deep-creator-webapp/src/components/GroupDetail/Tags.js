import React, { Component } from 'react';
import { Modal, Checkbox, Button, Tree, message } from 'antd';
import { Icon, Input, AutoComplete } from 'antd';
import styles from './tags.less';
import cloneDeep from 'lodash/cloneDeep';


const TreeNode = Tree.TreeNode;
let  dataList = [];
class tagTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedTags: null,
      expandedKeys:[],//存放展开key
      searchValue :'', //存放搜索值
      autoExpandParent: false,
    }
    this.tagTreeWithKey = [];
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.tagNameList !== nextProps.tagNameList){
      dataList= [];
      this.tagTreeWithKey = cloneDeep(nextProps.tagNameList);
      this.generateList(this.tagTreeWithKey); //tagTreeWithKey key在这个方法里加上去了
    }
  }

  handleTagsCheck = (checkValues) => {
    const { checked } = checkValues;
    // const { customerQuota, defaultcheckedTags } = this.props; // customerQuota->> 所有的自定义指标
    // const { checkedTags } = this.state;
    // const selectTags = checkedTags || defaultcheckedTags; // customerQuota->> 已选择的自定义指标
    // const noSelectTags = customerQuota.filter((item) => { // noSelectTags->> 未选择的自定义指标
    //   return !selectTags.includes(item.tagEnglishName)
    // })
    // for (let i = 0; i < noSelectTags.length; i++) {
    //   if (checked.includes(noSelectTags[i].tagEnglishName)) {
    //     message.info(`${noSelectTags[i].tagName}已存在,不能重复选择`);
    //     return false
    //   }
    // }
    this.setState({
      checkedTags: checked,
    })
  }

  handleResetCheckedTags=() => {
    this.setState({
      checkedTags: null,
    })
  }

  handleOk = () => {
    const { checkedTags } = this.state;
    const { defaultcheckedTags } = this.props;
    if (checkedTags === null) {
      this.props.handleAddtCustomerQuota(defaultcheckedTags, (success) => {
        if (success) this.handleResetCheckedTags();
      });
    } else {
      this.props.handleAddtCustomerQuota(checkedTags, (success) => {
        if (success) this.handleResetCheckedTags();
      });
    }
  }

  renderTreeNodes = (data) => {
    const { defaultcheckedTags } = this.props;
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
            className={item.categoryName ? 'categoryTree' : ''}
            title={title2}
            key={item.categoryEnglishName}
            selectable={false}
            isLeaf={!!item.tagEnglishName}
            disableCheckbox={!item.tagEnglishName}
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
        key={item.categoryEnglishName || item.tagEnglishName}
        selectable={false}
        isLeaf={!!item.tagEnglishName}
        disableCheckbox={defaultcheckedTags.includes(item.tagEnglishName)}
      />);
    });
  }

  //查询
  handleSearch(values){
    const {tagTree} = this.props;
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
    const { tagNameList, defaultcheckedTags } = this.props;
    const { checkedTags } = this.state;

    // console.log('标签分布/详情列表/自定义指标/tagNameList-----------------', tagNameList);
    // console.log('defaultcheckedTags-------------------', defaultcheckedTags);
    // console.log('checkedTags-------------------', checkedTags);
    return (
      <Modal
        title="添加自定义指标"
        maskClosable={false}
        visible={this.props.quotaVisible}
        bodyStyle={{ padding: 5, maxHeight: "400px", overflow: 'auto' }}
        onOk={this.handleOk}
        onCancel={this.props.handleQuotaHideClick}
      >
          {
            tagNameList && tagNameList.length >0 ?(<div className={styles.tagsSearchWrapper} style={{ width: 300 }}>
            <AutoComplete
              className="global-search"
              size="default"
              style={{ width: '100%' }}
              onChange={this.handleSearch.bind(this)}
              placeholder=""
              optionLabelProp="text"
            >
              <Input
                suffix={(
                  <Button className="search-btn" size="default" type="primary">
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
          className={styles.quotaTree}
          checkStrictly
          checkable
          onCheck={this.handleTagsCheck}
          checkedKeys={checkedTags || defaultcheckedTags}

        >
          {this.renderTreeNodes(tagNameList)}
        </Tree>
      </Modal>
    );
  }
}


export default tagTree;
