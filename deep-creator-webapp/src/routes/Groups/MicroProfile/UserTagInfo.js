import React, { Component } from 'react';
import {
  Tree, Checkbox, Button, Popconfirm,
  Form, Tabs, Modal, Input, Icon,
} from 'antd';
import _ from 'lodash';
import { arrayToTree } from '../../../utils';
import Tags from './../../../components/TagTable/Tags'
import uuid from 'uuid';
const uuidv4 = uuid.v4;
import styles from './UserTagInfo.less';
const { TreeNode } = Tree;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;

class UserTagInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      tabKey: '1', // 定制化标签的Tab值
      checkedValues: null, // 选择的已有自定义标签
      open: true,
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
    let { checkedValues } = this.state;
    this.props.handleDeleteCustomtag(tagValueTitle, (success) => {
      if (success) {
        this.setState({
          checkedValues: checkedValues.filter(item => item !== tagValueTitle),
        })
      }
    });
  }

  updateOpenStatus = (index, open) => {
    this.defaultExpandAll[index] = open;
    this.setState({open: index + open})
  }

  tagsRender=(datas)=>{
    let i = 0;
    return datas.map((item)=>{
      
        let index = i;
        i++;
        return (
          <Tags onParentModalShow={this.handleModalShow.bind(this)} 
            onParentHandleDeleteCustomtag={this.handleDeleteCustomtag}
            updateOpenStatus={this.updateOpenStatus}
            key={uuidv4()} 
            treeData={item}
            index={index}
            open={this.defaultExpandAll[index]}
          />
        )
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
    let { userTagInfo = [], existCustomtag = [], entityCategory } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { checkedValues } = this.state;
    

    // console.log('userTagInfo---------->>>>>>>>>>>', userTagInfo);

    userTagInfo = _.cloneDeep(userTagInfo);
    //userTagInfo = [{"business":"''","createTime":1528179373000,"createUser":"admin","customTagValue":[{"tagEnglishValueTitle":"6040693581EC6F2071CF57481BBE81C3164749D041","tagValueTitle":"11"},{"tagEnglishValueTitle":"6040693793D5B02BB1283C41DC9965E627EBEFE1C7","tagValueTitle":"22"}],"entityId":1,"fullPath":"/busines_tag","id":1,"isDelete":0,"isExhaustivity":true,"isExhaustivityName":"是","isMutual":1,"isMutualName":"是","paramConditionJson":"1","paramConstraintJson":"","parentCategoryEnglishName":"busines_tag","produceMethod":1,"tagCategoryEnglishName":"busines_tag","tagEnglishName":"custom_tag","tagName":"自定义标签","tagType":3,"updateRate":1,"updateTime":1546338725000,"updateUser":"admin","userPostId":1,"weightMergeDiffId":"1","weightMergeHistory":"1"}];
    const tree = arrayToTree(userTagInfo, 'categoryEnglishName', 'parentCategoryEnglishName');
    let tagValueTree = this.createTagValueTree(tree);
    if(tagValueTree && tagValueTree.length >0){ //将自定义标签放到最后
      let businesTagIndex = tagValueTree.findIndex(item => item.categoryEnglishName === 'busines_tag');
      let tmpArr = tagValueTree.splice(businesTagIndex,1);
      tagValueTree.push(tmpArr[0]);
    }
    console.log(tagValueTree,"tagValueTree");
    // const checkedKeys = tagValueTree.map((item) => {
    //   return item.categoryEnglishName;
    // })
    // console.log('tagValueTree---------->>>>>>>>>>>', tagValueTree);

    const businesTag = tagValueTree.find(item => item.categoryEnglishName === 'busines_tag') || {};// 定制化标签
    const customTag = businesTag.children ? businesTag.children[0] : {};
    const customTagVal = customTag.children ? customTag.children : [];
    // const disabledExistList = customTagVal.map(item => item.tagEnglishValueTitle);

    const customTagAll = userTagInfo.filter(item => item.tagEnglishName === 'custom_tag');
    const customTagValue = customTagAll && customTagAll[0] && customTagAll[0].customTagValue || [];
    const disabledExistList = customTagValue.map(item => item.tagEnglishValueTitle);// 取到所有的自定义标签(最新的)


    // this.state.disabledExistList = disabledExistList;
    // console.log('disabledExistList----render------', disabledExistList);
    // console.log('checkedValues--------render------', checkedValues);
    // console.log('tagValueTree---------render-----', tagValueTree);
    // console.log('disabledExistList----render----------', disabledExistList);
    // console.log('existCustomtag--------render------', existCustomtag);

    // const UserPortraitProps = {
    //   entityId:this.props.entityId,
    //   superId:this.props.superId,
    //   microSurvey:this.props.microSurvey, //标签用户画像
    // };


    return (
      <div className={styles.userTagInfo} >
        {/* {
          tagValueTree && tagValueTree.length>0?
          <Tree
            showLine
            defaultExpandAll
            // checkable
            // checkedKeys={checkedKeys}
          >
            {this.renderTreeNodes(tagValueTree)}
          </Tree>:null
        } */}
        {
              tagValueTree && tagValueTree.length>0?this.tagsRender(tagValueTree):null
        }

       
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
                    rules: [
                      { required: true, message: '请输入标签名称!' },
                      { max: 15, message: '15个字符以内' },
                    ],
                  })(
                    <Input placeholder="15个字符以内" />
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


export default Form.create()(UserTagInfo);

