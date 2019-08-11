import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, notification } from 'antd';
import lodash from 'lodash';
import HeaderTitle from '../../../../components/HeaderTitle';
import EntityTagTree from '../../../../components/EntityTagTree';
import { arrayToTree, getSubTree } from '../../../../utils/utils';

@Form.create()
class TagConfiguration extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchEntityTags',
      payload: {},
    })
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchEntityStrategyTag',
      payload: {},
    })
  }

  handleSubmit = () => {
    const values = this.props.form.getFieldsValue();
    const { entityId } = values;
    if (!entityId) return notification.error({ message: '请先选择一个实体' });
    const entity = this.props.entityList.find(i => i.id === parseInt(entityId, 10));
    const tagCateNames = values.labelName.filter(key => key.startsWith('TAGCATE')).map(key => key.split('==')[2]);
    if (tagCateNames.length) { // 选中了标签分类
      const errorTags = [];
      const tree = arrayToTree(lodash.cloneDeep(entity.tags),
        'categoryEnglishName', 'parentCategoryEnglishName');
      tagCateNames.forEach((cateName) => {
        const subTree = getSubTree(tree, cateName, 'categoryEnglishName');
        if (subTree && (!subTree.children || !subTree.children.length)) errorTags.push(subTree.categoryName);
      })
      if (errorTags.length) {
        return notification.error({
          message: '所选标签分类没有标签值',
          description: `选择的标签分类 [${errorTags.join(',')}] 下没有标签值，请选择带标签值的分类`,
        })
      }
    }

    values.labelName = values.labelName.filter(key => key.startsWith('TAGNAME'))
      .map(key => key.replace('TAGNAME_', '')).join(',');
    this.props.dispatch({
      type: 'sysconfig/marketing/saveStrategyTag',
      payload: values, // 英文名
      callback: (err) => {
        if (!err) {
          this.props.dispatch({
            type: 'sysconfig/marketing/fetchEntityStrategyTag',
            payload: {},
          })
        }
      }
    })
  }

  render() {
    const { entityList } = this.props;
    const notReady = !entityList.length;

    return (
      <Form>
        <HeaderTitle>策略用标签配置</HeaderTitle>
        {!notReady &&
          <EntityTagTree {...this.props} />}
        {notReady && <div style={{
          textAlign: 'center',
          color: 'rgba(0, 0, 0, 0.45)',
        }}>暂无数据</div>}
        <Button type="primary" onClick={this.handleSubmit}>保存</Button>
      </Form>
    );
  }
}

TagConfiguration.propTypes = {

};

export default TagConfiguration;