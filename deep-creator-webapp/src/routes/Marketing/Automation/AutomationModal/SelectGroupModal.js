import React, { Component, PropTypes } from 'react';
import { Modal, Tabs, Form, Spin, notification } from 'antd';
import lodash from 'lodash';
import uuid from 'uuid';

import GroupList from '../../../../components/GroupList';

const { TabPane } = Tabs;

@Form.create()
class SelectGroupModal extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.dispatch({
        type: 'marketing/automation/fetchUserEntityGroups',
        payload: {},
        callback: (err, entityList) => {
          entityList.forEach((entity) => {
            let ids = entity.groups.map(g => g.id);
            ids = ids.slice(0, 4);
            this.props.dispatch({
              type: 'marketing/automation/fetchGroupNum',
              payload: { entityId: entity.id, ids },
              callback: (err, nums) => {
                entity.groups = entity.groups.map((g) => {
                  if (nums[g.id]) return { ...g, ...nums[g.id] };
                  return g;
                });
              },
            })
          })
        },
      })
    }
  }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const node = {
          type: 'GROUP',
          modal: 'SelectGroupModal',
          interval: 0,
          parent_id: '',
          node_id: uuid.v1(),
          branch_list: [{ condition: '', child_id: uuid.v1() }],
        }
        const entityName = values.extra_info.entity_name;
        const entity = this.props.userEntityList.find(_entity => _entity.entityEnglishName === entityName);
        const group = values[entityName].group;
        if (!group || !group.id) { notification.error({ message: '没有选择任何实体群组' }); return }
        if (!entityName) { notification.error({ message: '没有选择任何实体' }); return }
        node.extra_info = {
          group_name: group.groupName,
          group_id: group.groupId,
          entity_name: entityName,
          entity_id: entity.id,
          groupId: group.id,
        };

        let entityChanged = false; // 变更实体
        let groupChanged = false; // 变更群组
        if (this.node && this.node.extra_info) {
          entityChanged = this.node.extra_info.entity_id && this.node.extra_info.entity_id !== entity.id;
          groupChanged = this.node.extra_info.groupId && this.node.extra_info.groupId !== group.id;
        }
        if (entityChanged || groupChanged) { // 配置变更,给予提示
          Modal.confirm({
            title: '变更群组节点，将重置自动化营销条件，是否继续',
            onOk: () => {
              this.props.onOk(node);
            },
          })
        } else {
          this.props.onOk(node);
        }
      }
    })
  }

  handleChangeGroup = (selectGroup) => {
    this.setState({ selectGroup });
  }
  fetchGroupNum = (entityId, groups, page) => {
    const entity = this.props.userEntityList.find(e => e.id === entityId);
    if (!entity || !groups) return;
    entity.page = page;
    const ids = groups.map(g => g.id);
    this.props.dispatch({
      type: 'marketing/automation/fetchGroupNum',
      payload: { entityId, ids },
      callback: (err, groupNum = {}) => {
        entity.groups = entity.groups.map((g) => {
          const num = groupNum[g.id] || {};
          return { ...g, ...num }
        })
        console.log(this.props.userEntityList);
        this.props.dispatch({
          type: 'marketing/automation/updateState',
          payload: { userEntityList: this.props.userEntityList.slice(0) },
        })
      },
    })
  }
  render() {
    let { userEntityList, form: { getFieldDecorator }, loading, node } = this.props;
    node = node || {};
    this.node = node;
    const extraInfo = node.extra_info || {};
    const firstEntity = lodash.first(userEntityList) || {};
    const numLoading = loading.effects['marketing/automation/fetchGroupNum'];

    return (
      <Modal
        {...this.props}
        title='条件选择'
        onOk={this.onOk}
        maskClosable={false}
      >
        {
          loading.global && <Spin />
        }
        {
          !loading.global &&
          getFieldDecorator('extra_info.entity_name', {
            initialValue: extraInfo.entity_name || firstEntity.entityEnglishName,
          })(
            <Tabs>
              {
                userEntityList.map((entity) => {
                  const firstGroup = entity.groups ? entity.groups[0] : undefined;
                  const initGroup = extraInfo.group_id ?
                    entity.groups.find(group => group.groupId === extraInfo.group_id) : firstGroup;

                  return (
                    <TabPane tab={entity.entityName} key={entity.id}>
                      <Form.Item>
                        {
                          getFieldDecorator(`${entity.entityEnglishName}.group`, {
                            initialValue: initGroup,
                          })(
                            <GroupList
                              groupData={entity.groups}
                              numLoading={numLoading}
                              current={entity.page||1}
                              pageChange={(data,page)=>{
                                this.fetchGroupNum(entity.id, data,page);
                              }}
                              onChange={this.handleChangeGroup}
                            />)
                        }
                      </Form.Item>
                    </TabPane>)
                })
              }
            </Tabs>
          )
        }
      </Modal>);
  }
}

SelectGroupModal.propTypes = {
};

export default SelectGroupModal;
