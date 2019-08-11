import React, { Component, PropTypes } from 'react';
import { Modal, notification } from 'antd';
import uuid from 'uuid';
import TagPicker from '../../../../components/TagPicker';

// @Form.create()
class SelectTagModal extends Component {
  state = {
    isResetTagPickerForm: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.setState({ isResetTagPickerForm: true })
      const { groupNode } = nextProps;
      if (!groupNode || !groupNode.extra_info || !groupNode.extra_info.entity_id) {
        notification.warn({ message: '请先选择一个群组' })
        return false;
      }
    }
  }
  handleOk = () => {
    const { groupNode } = this.props;
    const values = this.tagPickerRef.getFieldsValue();
    const { UserTag = {}, CustomTag = {} } = values;
    const { checkedTags = [], checkedChannels = [] } = UserTag;
    const { checkedCusTags = {} } = CustomTag;
    const { customerTag = [], automaticTag = [] } = checkedCusTags; // 自动化 自定义标签
    const customAutgTags = customerTag.concat(automaticTag);

    if (!checkedTags.length && !customAutgTags.length) { notification.warn({ message: '请选择标签值' }); return; }

    let categoryName = 'basic';
    let branchList = [];

    const tagName = { custom_tag: '定制标签', automatic_tag: '自动标签' }; // 缓存标签名的中文名

    if (checkedTags.length) { // 解析TagPicker返回的数据
      categoryName = 'basic';
      branchList = checkedTags.map((tag) => {
        tagName[tag.tagEnglishName] = tag.ptitle;
        return { condition: `${tag.tagEnglishName}=${tag.tagValueTitle}`, child_id: uuid.v1() }
      })
    } else if (customAutgTags.length) {
      categoryName = 'custom_and_auto';
      branchList = customAutgTags.map((tag) => {
        return { condition: `${tag.tagEnglishName}=${tag.tagValueTitle}`, child_id: uuid.v1() }
      })
    }
    branchList.push({ condition: 'default', child_id: uuid.v1() }) // 添加default分支

    const extraInfo = {
      tag_name: tagName,
      entity_name: groupNode.extra_info.entity_name,
      category_name: categoryName,
    };

    if (checkedTags.length && checkedChannels) extraInfo.channel_list = checkedChannels.map(c => c.dictionaryLabel) // 渠道

    const node = {
      type: 'TAG',
      interval: 0,
      extra_info: extraInfo,
      branch_list: branchList,
      deletable: true,
    }
    this.props.onOk(node);
    this.setState({ isResetTagPickerForm: false })
  }

  handleCancel = () => {
    this.props.onCancel();
    this.setState({ isResetTagPickerForm: false })
  }
  handleResetForm = () => {
    this.setState({ isResetTagPickerForm: false },
      () => this.setState({ isResetTagPickerForm: true })
    )
  }

  getTagPicker = (v) => {
    this.tagPickerRef = v;
  }
  render() {
    const { dispatch, groupNode } = this.props;
    const { isResetTagPickerForm } = this.state;
    if (!groupNode || !groupNode.extra_info || !groupNode.extra_info.entity_id) {
      return false;
    }
    const entityId = groupNode.extra_info.entity_id;

    return (
      <Modal
        maskClosable={false}
        {...this.props}
        onOk={this.handleOk}
        onCancel={this.handleCancel}>
        <TagPicker
          SelectedCondition={false}
          dispatch={dispatch}
          filterTabKey={['OnlineBehavior']}
          entityId={entityId}
          isResetTagPickerForm={isResetTagPickerForm}
          onTabChange={this.handleResetForm}
          ref={this.getTagPicker} />
      </Modal>);
  }
}

SelectTagModal.propTypes = {
};

export default SelectTagModal;
