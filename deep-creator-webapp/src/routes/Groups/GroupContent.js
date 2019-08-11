import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, List, Checkbox, Spin, Popconfirm } from 'antd';
import _ from 'lodash';
import GroupEdit from './GroupEdit';
import uuid from 'uuid';

const uuidv4 = uuid.v4;

import styles from './GroupContent.less';

class GroupContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1, // 当前页码
      dataSource: [], // List 组件数据
      curEditGroup: {}, // 当前要编辑的用户群
      editGroupModalVisible: false, // 编辑群Modal 显示/隐藏
      copyCoditionVisible: false,
    }
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.groupChannel !== this.props.groupChannel) {
      this.setState({
        current: 1,
      })
    }
  }

  paginationChange = (current) => {
    this.props.handlePaginationChange(current)
  }

  checkboxChange = (groupInfo, e) => {
    const isAddReport = e.target.checked ? 1 : 0;
    const { id, groupName, groupDesc = '', groupCategoryId } = groupInfo;
    const bizGroupInfo = {
      id,
      groupName,
      groupDesc,
      groupCategoryId,
      isAddReport,
    }
    this.props.handleGroupEdit(bizGroupInfo);
  }

  handleProfileClick = (groupInfo) => {
    const { history, entityId, systemCreAndProAuth, importCreAndProAuth, customerAndUserNum } = this.props;
    if (systemCreAndProAuth.includes(`qzgl_xqzgl_nzq_qxq_${entityId}`) ||
      importCreAndProAuth.includes(`qzgl_xqzgl_wdq_qxq_${entityId}`)
    ) {
      history.push({
        pathname: `/groups/${entityId}/${groupInfo.id}`,
        state: {
          groupInfo,
          TGItype: 'GROUP',
          userNum: _.get(customerAndUserNum, groupInfo.id) && _.get(customerAndUserNum, groupInfo.id).customerNum
          // TagDistributionParams: { groupId: groupInfo.id },
        },
      })
    }
  }

  handleEditGroupModalShow = (curEditGroup, type) => {
    let { copyCoditionVisible } = this.state;
    if (type === 'edit') { // 编辑
      copyCoditionVisible = false;
    } else { // 复制
      copyCoditionVisible = true;
      const conditonDesc = curEditGroup.conditonDesc ? JSON.parse(curEditGroup.conditonDesc) : {};

      const {
        conditionList = [{
          id: uuidv4(),
          UserTag: {},
          CustomTag: {},
          OnlineBehavior: {},
          relation: 'and',
        }],
        relationDesc = '或',
      } = conditonDesc;
      this.props.handleChangeConditionList(conditionList, relationDesc);
    }
    this.setState({
      curEditGroup,
      copyCoditionVisible,
      editGroupModalVisible: true,
    })
  }

  handleEditGroupModalCancel = () => {
    this.setState({
      editGroupModalVisible: false,
    })
  }


  handleGroupDelete = (id) => {
    this.props.handleGroupDelete(id);
  }


  render() {
    const {
      groupList, groupChannel, entityId, entityCategory, searchName,
      queryNumberLoading, current, customerAndUserNum,
      groupCategory, groupCategoryId, entityName,
      dispatch, conditionList, outsideRelation,
    } = this.props;


    // console.log('groupChannel-------------------', groupChannel);
    // console.log('searchName-------------------', searchName);
    const { curEditGroup, editGroupModalVisible, copyCoditionVisible } = this.state;

    let dataSource = [];

    let pagination = {
      current,
      pageSize: 4,
      onChange: this.paginationChange,
    };

    if (groupChannel === '1') { // 1 系统内用户群
      dataSource = groupList.filter(item => item.groupType !== 1);
    } else if (groupChannel === '2') { // 2 外导用户群
      dataSource = groupList.filter(item => item.groupType === 1);
    }

    if (groupCategoryId !== 0) {
      dataSource = dataSource.filter(item => item.groupCategoryId === groupCategoryId);
    }

    if (searchName) {
      dataSource = dataSource.filter(item => item.groupName.indexOf(searchName) >= 0);
    }

    // console.log('current-------------------', current);
    // console.log('dataSource-------------------', dataSource);


    pagination.total = dataSource.length;


    const editProps = {
      entityId,
      entityCategory,
      entityName,
      dispatch,
      groupCategory,
      curEditGroup,
      conditionList,
      outsideRelation,
      copyCoditionVisible,
      editGroupModalVisible,
      handleEditGroupModalCancel: this.handleEditGroupModalCancel,
      handleGroupEdit: this.props.handleGroupEdit,
      handleGroupSave: this.props.handleGroupSave,
    }

    let reg = /群$/;
    return (
      <div className={styles.content}>
        <List
          pagination={pagination}
          style={{ margin: '15px' }}
          grid={{ gutter: 20, column: 2 }}
          split={false}
          dataSource={dataSource.slice((pagination.current - 1) * 4, pagination.current * 4)}
          renderItem={item => (
            <List.Item
              style={{ height: 300, border: 'none' }}
            >
              <Card
                title={
                  <a onClick={this.handleProfileClick.bind(this, item)} style={{fontSize: 16}}>
                    {(item.groupType === 7 || item.groupType === 8) ? item.groupName.replace(reg, `${entityName}群`) : item.groupName}
                  </a>
                }
                bodyStyle={{ display: 'flex', alignItems: 'center', height: 195 }}
                extra={
                  item.groupType === 7 || item.groupType === 8 ? '' :
                    <span>
                      <a href="javascript:;" onClick={this.handleEditGroupModalShow.bind(this, item, 'edit')}>编辑</a>
                      <Popconfirm title='确定是否要删除此群组？'
                        onConfirm={this.handleGroupDelete.bind(this, item.id)}>
                        <a href="javascript:;" style={{ marginLeft: 5 }}>删除</a>
                      </Popconfirm>
                      {item.groupType === 0 ? <a href="javascript:;" style={{ marginLeft: 5 }} onClick={this.handleEditGroupModalShow.bind(this, item, 'copy')}>复制</a> : ''}
                    </span>
                }
                actions={
                  item.groupType === 0 || item.groupType === 1 || item.groupType === 7 || item.groupType === 8
                    ? [<Checkbox style={{display:"none"}}
                      checked={item.isAddReport}
                      disabled={item.groupType === 7 || item.groupType === 8}
                      onChange={this.checkboxChange.bind(this, item)}
                    >
                      添加到全局查看
                  </Checkbox>]
                    : [<span></span>]
                }
              >
                <div className={styles.card}>
                  <p style={{ flexShrink: 0 }} onClick={this.handleProfileClick.bind(this, item)} title="点击图片查看用户群详情"></p>
                  {
                    entityCategory === 0 &&
                    <ul>
                      {
                        item.configValue === ''
                          ? <li>客户数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, item.id) && _.get(customerAndUserNum, item.id).customerNum}</li>
                          : (() => {
                            let arr = [
                              <li key={1}>客户数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, item.id) && _.get(customerAndUserNum, item.id).userNum}</li>,
                              <li key={2}>{item.configValueName}数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, item.id) && _.get(customerAndUserNum, item.id).customerNum}</li>,
                            ];
                            return arr;
                          })()
                      }
                      <li>分类:{item.categoryName}</li>
                      <li>描述:{item.groupDesc}</li>
                    </ul>
                  }

                  {
                    entityCategory !== 0 &&
                    <ul>
                      {
                        item.configValue === ''
                          ? <li>产品数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, item.id) && _.get(customerAndUserNum, item.id).customerNum}</li>
                          : (() => {
                            let arr = [
                              <li key={1}>产品数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, item.id) && _.get(customerAndUserNum, item.id).userNum}</li>,
                              <li key={2}>{item.configValueName}数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, item.id) && _.get(customerAndUserNum, item.id).customerNum}</li>,
                            ];
                            return arr;
                          })()
                      }
                      <li>分类:{item.categoryName}</li>
                      <li>描述:{item.groupDesc}</li>
                    </ul>
                  }
                </div>
              </Card>
            </List.Item>
          )}
        />
        <GroupEdit {...editProps} />
      </div>
    );
  }
}


export default GroupContent;

