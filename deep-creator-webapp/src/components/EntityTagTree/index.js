import React, { Component } from 'react';
import { Tree, Tabs, Form } from 'antd';
import lodash from 'lodash';
import { arrayToTree } from '../../utils';

const { TabPane } = Tabs;
const { TreeNode } = Tree;

class EntityTagTree extends Component {
  componentDidMount() {
    const firstEntity = lodash.first(this.props.entityList);
    this.handleChangeEntity(firstEntity.id);
  }

  genKey = (item) => {
    if (item.tagEnglishName) {
      return `TAGNAME_${item.tagEnglishName}`; // 标签名
    } else {
      return `TAGCATE==${item.id}==${item.categoryEnglishName}`; // 标签分类
    }
  }
  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.categoryName || item.tagName}
            key={this.genKey(item)}
            dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={this.genKey(item)}
          dataRef={item}
          title={item.categoryName || item.tagName}
          selectable={false}
          {...item} />);
    });
  }

  handleChangeEntity = (entityId) => {
    const _entity = this.props.entityStrategyTags.find(item => item.id === parseInt(entityId, 10));
    const keys = _entity ? _entity.strategyTags.map(key => `TAGNAME_${key}`) : [];
    this.props.form.setFieldsValue({labelName: keys, entityId})
  }

  render() {
    const { form: { getFieldDecorator },
      entityList, entityStrategyTags } = this.props;
    // if (!entityList.length || !entityStrategyTags.length) return false;
    return (<div>
      {
        getFieldDecorator('entityId')(
          <Tabs type='card' onChange={this.handleChangeEntity}>
            {
              entityList.map((entity, index) => {

                return (
                  <TabPane tab={entity.entityName} key={entity.id}>

                    <Form.Item>
                      {
                        getFieldDecorator('labelName', {
                          // initialValue: keys,
                          trigger: 'onCheck',
                          valuePropName: 'checkedKeys',
                        })(
                          <Tree
                            checkable
                          >
                            {
                              this.renderTreeNodes(arrayToTree(lodash.cloneDeep(entity.tags),
                                'categoryEnglishName', 'parentCategoryEnglishName'))
                            }
                          </Tree>
                        )
                      }
                    </Form.Item>
                  </TabPane>)
              })
            }
          </Tabs>
        )
      }
    </div>)
  }
}

EntityTagTree.propTypes = {
}

export default EntityTagTree;