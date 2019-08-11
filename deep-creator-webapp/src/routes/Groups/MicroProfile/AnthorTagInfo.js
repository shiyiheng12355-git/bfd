import React, { Component } from 'react';
import { Tree, Checkbox, Button, Form, Tabs, Modal, Input, Icon } from 'antd';
import _ from 'lodash';
import { arrayToTree, getSubTree } from '../../../utils';

import styles from './AnthorTagInfo.less';

const { TreeNode } = Tree;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;
class AnthorTagInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      tabKey: '1', // 定制化标签的Tab值
      checkedValues: null, // 选择的已有自定义标签
    }
    this.defaultExpandAll = [];
  }


  handleModalShow = () => {
    this.props.form.resetFields();
    this.setState({
      modalVisible: true,
    }, () => {
      this.props.handleQueryExistCustomtag();
    })
  }

  handleModalCacel = () => {
    this.setState({
      modalVisible: false,
    })
  }

  handleTableChange = (tabKey) => {
    this.setState({
      tabKey,
    })
  }

  handlecheckboxChange = (checkedValues) => {
    this.setState({
      checkedValues,
    })
  }

  handleModalOk = () => {
    let { checkedValues } = this.state;
    if (this.state.tabKey === '1') { // 新增没有的
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const { newTagName } = values;
          this.props.handleAddNewCustomtag(newTagName, (success) => {
            const { userTagInfo = [] } = this.props;
            const customTag = userTagInfo.filter(item => item.tagEnglishName === 'custom_tag');
            const customTagValues = customTag[0].customTagValue.map(item => item.tagEnglishValueTitle);// 取到所有的自定义标签(最新的)

            if (success) {
              this.setState({
                checkedValues: customTagValues.slice(0), // 保存成功后重新设置checkValues确保已存在的自定义标签的值是勾选状态
                modalVisible: false,
              })
            }
          });
        }
      })
    } else { // 新增已有的
      const { userTagInfo = [] } = this.props;
      const customTag = userTagInfo.filter(item => item.tagEnglishName === 'custom_tag');
      const customTagValues = customTag[0].customTagValue.map(item => item.tagEnglishValueTitle);// 取到所有的自定义标签(这个可不是最新的)

      if (!checkedValues || customTagValues.length === checkedValues.length) { // 确保在没有勾选的情况下不执行以下的操作
        return false;
      }

      const finalCheckedValues = checkedValues.filter(item => !customTagValues.includes(item))

      this.props.handleAddOldCustomtag(finalCheckedValues, (success) => {
        if (success) {
          this.setState({
            modalVisible: false,
          })
        }
      });
    }
  }

  handleDeleteCustomtag = (tagValueTitle) => {
    this.props.handleDeleteCustomtag(tagValueTitle, (success) => {
      if (success) {
        this.setState({
          checkedValues: null,
        })
      }
    });
  }

  renderTreeNodes = (data) => {
    const { cusTagAuth } = this.props;
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            key={item.categoryEnglishName || item.tagEnglishName}
            selectable={false}
            // disableCheckbox={!item.isLeaf}
            title={
              item.categoryName === '定制化标签' && cusTagAuth.includes('qzgl_wghx_yhbqxx_zdybq')
                ? <div>{item.categoryName} <Button type="primary" size='small' style={{ marginLeft: 5 }} onClick={this.handleModalShow}>自定义标签</Button></div>
                : (item.categoryName || item.tagName)
            }
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (<TreeNode
        className='leafTag'
        key={item.key}
        selectable={false}
        title={
          item.isCustomer
            ? <div>
              {item.tagValueTitle}
              <Icon style={{ marginLeft: 5, cursor: 'pointer', fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }} type="delete" onClick={this.handleDeleteCustomtag.bind(this, item.tagEnglishValueTitle)} />
            </div>
            : item.tagvalue
        }
      />);
    });
  }

  createTagValueTree = (data) => {
    return data.map((item, index) => {
      if (item.children && !item.tagValueTitle) {
        this.createTagValueTree(item.children);
      } else {
        let tagValues = item.tagValueTitle ? item.tagValueTitle.split(',') : [];
        if (item.tagEnglishName === 'custom_tag') {
          const arr = item.customTagValue || [];
          tagValues = arr.map((cus, k) => {
            cus.isCustomer = true;
            cus.key = `${index}-${k}`;
            return cus;
          })
        } else {
          tagValues = tagValues.map((value, key) => {
            value = {
              key: `${index}-${key}`,
              isLeaf: true,
              tagvalue: value,
            }
            return value;
          })
        }

        item.children = tagValues;
      }
      return item;
    })
  }

  render() {
    let { userTagInfo = [], existCustomtag = [] } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { checkedValues } = this.state;

    // console.log('userTagInfo---------->>>>>>>>>>>', userTagInfo);

    userTagInfo = _.cloneDeep(userTagInfo);
    const tree = arrayToTree(userTagInfo, 'categoryEnglishName', 'parentCategoryEnglishName');
    const tagValueTree = this.createTagValueTree(tree);
    // const checkedKeys = tagValueTree.map((item) => {
    //   return item.categoryEnglishName;
    // })
    // console.log('tagValueTree---------->>>>>>>>>>>', tagValueTree);

    const businesTag = tagValueTree.find(item => item.categoryEnglishName === 'busines_tag') || {};// 定制化标签
    const customTag = businesTag.children ? businesTag.children[0] : {};
    const customTagVal = customTag.children ? customTag.children : [];
    const disabledExistList = customTagVal.map(item => item.tagEnglishValueTitle);

    // this.state.disabledExistList = disabledExistList;
    // console.log('disabledExistList----render------', disabledExistList);
    // console.log('checkedValues--------render------', checkedValues);
    // console.log('tagValueTree---------render-----', tagValueTree);
    // console.log('disabledExistList----render----------', disabledExistList);
    // console.log('existCustomtag--------render------', existCustomtag);


    return (
      <div className={styles.anthorTagInfo} >
        <Tree
          showLine
          key='AnthorTagTree'
          defaultExpandAll
        // checkable
        // checkedKeys={checkedKeys}
        >
          {this.renderTreeNodes(tagValueTree)}
        </Tree>
        <Modal
          width='350px'
          title='新增自定义标签'
          maskClosable={false}
          visible={this.state.modalVisible}
          onOk={this.handleModalOk}
          onCancel={this.handleModalCacel}
        >
          <Tabs type="card" onChange={this.handleTableChange}>
            <TabPane tab="新增标签" key="1">
              <FormItem
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 15 }}
                label="标签名称"
              >
                {
                  getFieldDecorator('newTagName', {
                    rules: [{ required: true, message: '请输入标签名称!' }],
                  })(
                    <Input placeholder="请输入标签名称" />
                    )
                }
              </FormItem>
            </TabPane>
            <TabPane tab="选择已有标签" key="2">
              <FormItem
                wrapperCol={{ span: 24 }}
              >
                {
                  <CheckboxGroup
                    onChange={this.handlecheckboxChange}
                    value={checkedValues || disabledExistList}
                    options={
                      (() => {
                        return existCustomtag.map((item) => {
                          return {
                            label: item.tagValueTitle,
                            value: item.tagEnglishValueTitle,
                            disabled: disabledExistList.includes(item.tagEnglishValueTitle),
                          }
                        })
                      })()
                    }
                  >
                  </CheckboxGroup>
                }
              </FormItem>
            </TabPane>
          </Tabs>
        </Modal>
      </div>

    );
  }
}


export default Form.create()(AnthorTagInfo);

