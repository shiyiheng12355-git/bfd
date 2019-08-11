import React, { Component } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import _ from 'lodash';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import GroupDetail from '../../../components/GroupDetail';

import styles from './index.less';

class GroupProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entityId: 1,
      groupId: 0,
      TGItype: '',
      tabKey: 'BasicInfo',
      tabKeys: [],
      extraContentVisible: true,
      downloadBtnVisible: false, // 是否显示详情列表的下载按钮
      detailCusQuotaAuth: [], // 详情列表中的 自定义指标权限
    }
  }

  parseTagDistributionParams = () => {
    const { location: { state } } = this.props;
    let { TGItype, TGIParams, TagDistributionParams, groupInfo = {} } = state;
    if (TGItype === 'GROUP') {
      const groupId = groupInfo.id; // 只有普通群和外导群用
      TagDistributionParams = { groupId, TGItype };
    } else if (TGItype === 'REPORT') {
      TGIParams.group_expression = TGIParams.groupExpression
      TGIParams.prev_group_expression = ''
      TGIParams.type = 'report'
      TGIParams.group_id = ''
      TGIParams.entity_english_name = TGIParams.entityEnglishName
      TGIParams.longGroupId = TGIParams.id
      delete TGIParams.id
      delete TGIParams.entityEnglishName
      delete TGIParams.groupExpression
      TagDistributionParams = { expression: JSON.stringify(TGIParams) }
    } else if (TGItype === 'AUTOMATION') {
      TagDistributionParams = { expression: JSON.stringify(TGIParams) }
    } else if (TGItype === 'FUNNEL') {
      let TGIParamsCopy = _.cloneDeep(TGIParams);
      delete TGIParamsCopy.TGItype
      TagDistributionParams = { expression: JSON.stringify(TGIParamsCopy) }
      TGIParamsCopy = null;
    } else if (TGItype === 'LIFEFUNNEL') {
      let TGIParamsCopy = _.cloneDeep(TGIParams);
      const bizLifeTripInfoParam = _.cloneDeep(TGIParams.bizLifeTripInfoParam);
      delete TGIParamsCopy.bizLifeTripInfoParam;
      TagDistributionParams = {
        bizLifeTripInfoParam,
        type: TGIParamsCopy.type,
        groupExpression: JSON.stringify(TGIParams),
      }
      TGIParamsCopy = null;
    } else if (TGItype === 'LIFE_AUTOMATION') {
      let TGIParamsCopy = _.cloneDeep(TGIParams);
      const bizLifeTripInfoParam = _.cloneDeep(TGIParamsCopy.bizLifeTripInfoParam);
      delete TGIParamsCopy.TGItype;
      delete TGIParamsCopy.bizLifeTripInfoParam;
      TagDistributionParams = {
        bizLifeTripInfoParam,
        type: TGIParamsCopy.type,
        groupExpression: JSON.stringify(TGIParamsCopy.group_expression),
      }
      TGIParamsCopy = null;
    }
    this.TagDistributionParams = TagDistributionParams; // 缓存
  }

componentDidMount() {
  const { match, dispatch, location: { state } } = this.props;
  if (!state) {
    dispatch(routerRedux.push('/'));
    return false;
  }
  const { entityId } = match.params;
  let { TGItype, groupInfo = {} } = state;// 查询TGI的参数
  this.state.entityId = Number(entityId);
  this.state.groupId = groupInfo.id;
  this.state.TGItype = TGItype;
  if (TGItype === 'GROUP') {
    this.state.extraContentVisible = false;
    this.state.downloadBtnVisible = true;
  }

  this.parseTagDistributionParams();
  dispatch({
    type: 'entity/group/getEntityList',
    payload: {},
  })

  dispatch({ // 获取群分类
    type: 'entity/group/getGroupCategory',
    payload: { entityId },
  })

  if (groupInfo.groupType === 1) { // 外导群
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: `qzgl_xqzgl_wdq_qxq_${entityId}` },
      callback: (data) => {
        this.state.tabKeys = data || [];
        if (this.state.tabKeys.includes(`qzgl_xqzgl_wdq_qxq_xqlb_${entityId}`)) {
          this.getDetailCusQuotaAuth(dispatch, entityId);
        }
      },
    })
  } else { // 内置群和临时群
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: `qzgl_xqzgl_nzq_qxq_${entityId}` },
      callback: (data) => {
        if (groupInfo.groupType !== undefined) { // 内置群  其实内置群和临时群可以放在一起的,为了以防万一,暂时分开
          this.state.tabKeys = data || [];
          if (this.state.tabKeys.includes(`qzgl_xqzgl_nzq_qxq_xqlb_${entityId}`)) {
            this.getDetailCusQuotaAuth(dispatch, entityId);
          }
        } else { // 临时群
          this.state.tabKeys = data.filter(item => item !== `qzgl_xqzgl_nzq_qxq_bqtz_${entityId}` && item !== `qzgl_xqzgl_nzq_qxq_dzhbq_${entityId}`);
          if (this.state.tabKeys.length && this.state.tabKeys[0] === `qzgl_xqzgl_nzq_qxq_bqfb_${entityId}`) {
            this.state.tabKey = 'TagDistribution';
          }
          if (this.state.tabKeys.length && this.state.tabKeys[0] === `qzgl_xqzgl_nzq_qxq_xqlb_${entityId}`) {
            this.state.tabKey = 'DetailList';
          }
          if (this.state.tabKeys.includes(`qzgl_xqzgl_nzq_qxq_xqlb_${entityId}`)) {
            this.getDetailCusQuotaAuth(dispatch, entityId);
          }
        }
      },
    })
  }
}

getDetailCusQuotaAuth = (dispatch, entityId) => {
  dispatch({
    type: 'user/fetchAuths',
    payload: { parentKey: `qzgl_xqzgl_nzq_qxq_xqlb_${entityId}` },
    callback: (data) => {
      this.state.detailCusQuotaAuth = data || [];
    },
  })
}

// 保存用户群
handleGroupSave = (data, callback) => {
  const { match, location: { state } } = this.props;
  // if (!state) { dispatch(routerRedux.push('/')); return }
  const { entityId } = match.params;
  this.state.entityId = Number(entityId);
  let { TGItype, TGIParams } = state;

  this.props.dispatch({
    type: 'group/profile/saveGroup',
    payload: {
      data,
      TGItype,
      TGIParams,
    },
    callback: () => {
      callback && callback();
    },
  })
}

handleTabChange = (tabKey) => {
  this.setState({
    tabKey,
  })
}

handleGetExistCusTag = () => {
  const { dispatch } = this.props;
  dispatch({
    type: 'group/profile/getExistCusTag',
    payload: {
      entityId: this.state.entityId,
    },
  })
}

checkNameIsRepeat = (param, callback) => {
  const { dispatch } = this.props;
  dispatch({
    type: 'group/profile/checkNameIsRepeat',
    payload: param,
    callback,
  })
}

handleAddExistCusTag = (checkedValues, callback) => {
  const { dispatch } = this.props;
  dispatch({
    type: 'group/profile/addExistCusTag',
    payload: {
      groupId: this.state.groupId,
      checkedValues,
      callback: (success) => {
        if (success) {
          message.success('新增成功');
          if (callback) callback(true);
        } else {
          message.error('新增失败');
        }
      },
    },
  })
}

handleAddCusTag = (tagValueTitle, callback) => {
  const { dispatch } = this.props;
  const { entityId, groupId } = this.state;
  dispatch({
    type: 'group/profile/addCustomTag',
    payload: {
      groupId,
      entityId,
      tagValueTitle,
      callback: (success, errorMsg) => {
        if (success) {
          message.success('新增成功');
          if (callback) callback(true);
        } else {
          message.error(errorMsg || '新增失败');
        }
      },
    },
  })
}

handleCusTagDel = (tagEnglishValueTitle, callback) => {
  const { dispatch } = this.props;
  const { groupId } = this.state;
  dispatch({
    type: 'group/profile/delCustomTag',
    payload: {
      groupId,
      tagEnglishValueTitle,
      callback: (success) => {
        if (success) {
          message.success('删除成功');
        } else {
          message.error('删除失败');
        }
        if (callback) callback(success);
      },
    },
  })
}

handleAddtCustomerQuota = (checkedTags = [], callback) => {
  const { dispatch } = this.props;
  const { entityId, tabKey } = this.state;
  let dimensionType = 'GLOBVAL';
  if (tabKey === 'TagDistribution') {
    dimensionType = 'TAG_DISTRIBUTION';
  }
  if (tabKey === 'DetailList') {
    dimensionType = 'CUSTOM_INDEX';
  }
  const bizGroupAnalyzeDimensionPOList = checkedTags.map((item) => {
    return {
      entityId,
      dimensionType,
      tagEnglishName: item,
    }
  })
  dispatch({
    type: 'group/profile/addCustomQuota',
    payload: {
      entityId,
      dimensionType,
      bizGroupAnalyzeDimensionPOList,
      callback,
    },
  })
}

handleDelCustomerQuota = (id, callback) => {
  const { dispatch } = this.props;
  const { entityId, tabKey } = this.state;
  let dimensionType = 'GLOBVAL';
  if (tabKey === 'TagDistribution') {
    dimensionType = 'TAG_DISTRIBUTION';
  }
  if (tabKey === 'DetailList') {
    dimensionType = 'CUSTOM_INDEX';
  }
  dispatch({
    type: 'group/profile/delCustomQuota',
    payload: {
      id,
      entityId,
      dimensionType,
      callback: (success) => {
        if (callback) callback(success);
      },
    },
  })
}

handleChangetagDistribution = (tagEnglishName) => { // 获取标签分布 (柱状图数据)
  const { dispatch } = this.props;
  const { groupId } = this.state;

  dispatch({
    type: 'group/profile/getTagDistribution',
    payload: {
      ...this.TagDistributionParams,
      tagEnglishName,
      TGItype: this.state.TGItype,
      groupId,
    },
  })
}

handleApplyDownloadGroup = (columnNames, columnCHNames) => { // 申请下载人群
  const { dispatch } = this.props;
  const { groupId, entityId } = this.state;
  dispatch({
    type: 'group/profile/applyDownloadGroup',
    payload: {
      entityId,
      groupId,
      columnNames: columnNames.join(','),
      columnCHNames: columnCHNames.join(','),
      callback: (success) => {
        if (success) message.success('申请下载成功，可前往个人中心-下载文件列表进行文件下载');
      },
    },
  })
}


handleProfileList = (columnNames) => {
  const { dispatch, location: { state } } = this.props;
  let { TGItype, TGIParams } = state;
  const { groupId, entityId } = this.state;

  if (!columnNames.includes('super_id')) {
    columnNames.push('super_id');
  }

  dispatch({ // 获取用户列表
    type: 'group/profile/getGroupDetailInfo',
    payload: {
      entityId,
      groupId,
      TGItype,
      limit: 200,
      expression: TGIParams,
      columnNames: columnNames.join(','),
    },
  })
}

render() {
  const { groupProfile, entityGroup, dispatch, location } = this.props;
  const { tagNameList = [] } = this.props.tagTree;
  const { effects } = this.props.loadings;
  // console.log('loadings-------------------', this.props.loadings);

  const {
    basicInfo, customerTag, distriCustomerQuota,
    existCusTag, TGIList, tagDistribution,
    customerQuota, basicQuota, infoList,
  } = groupProfile;
  const { customerAndUserNum, groupCategory, entityList } = entityGroup;
  let { entityId, groupId, TGItype, detailCusQuotaAuth, downloadBtnVisible, tabKeys } = this.state;

  const queryNumberLoading = effects['entity/group/queryNumber'];
  const tagDistributionLoading = effects['group/profile/getTagDistribution'];
  const detailTableLoading = effects['group/profile/getGroupDetailInfo'];
  const detailDownloadLoading = effects['group/profile/applyDownloadGroup'];

  // console.log('1111111111111111------------', queryNumberLoading);
  let breadName = '';
  entityList.forEach((item) => {
    if (item.id === this.state.entityId) {
      breadName = item.entityName
    }
  })

  const BasicInfoProps = {
    basicInfo,
    dispatch,
    entityList,
    customerTag,
    existCusTag,
    customerAndUserNum,
    queryNumberLoading,
    handleAddCusTag: this.handleAddCusTag,
    handleCusTagDel: this.handleCusTagDel,
    handleGetExistCusTag: this.handleGetExistCusTag,
    handleAddExistCusTag: this.handleAddExistCusTag,
  }
  const TagCharacterProps = {
    dispatch,
    TGIList,
  }
  const TagDistributionProps = {
    basicInfo,
    customerAndUserNum,
    dispatch,
    location,
    groupId,
    tagNameList,
    distriCustomerQuota,
    tagDistributionLoading,
    tagDistribution,
    handleChangetagDistribution: this.handleChangetagDistribution,
    handleAddtCustomerQuota: this.handleAddtCustomerQuota,
    handleDelCustomerQuota: this.handleDelCustomerQuota,
    TagDistributionParams: this.TagDistributionParams,
    TGItype: this.state.TGItype,
  }

  const DetailListProps = {
    dispatch,
    location,
    entityId,
    groupId,
    tagNameList,
    basicQuota,
    customerQuota,
    infoList,
    detailCusQuotaAuth,
    detailTableLoading,
    detailDownloadLoading,
    downloadBtnVisible,
    handleProfileList: this.handleProfileList,
    handleAddtCustomerQuota: this.handleAddtCustomerQuota,
    handleDelCustomerQuota: this.handleDelCustomerQuota,
    handleApplyDownloadGroup: this.handleApplyDownloadGroup,
    extraContentVisible: this.state.extraContentVisible,
  }


  return (
    <div className={styles.profile}>
      <PageHeaderLayout
        breadcrumbList={
          [
            { href: '/', title: '首页' },
            { title: '群组管理' },
            { title: `${breadName}群组管理` },
          ]
        }
      />
      <div className={styles.content}>
        <GroupDetail
          entityId={entityId}
          TGItype={TGItype}
          checkNameIsRepeat={this.checkNameIsRepeat}// 保存用户群名称重复校验
          tabKeys={tabKeys}
          BasicInfoProps={BasicInfoProps}
          // personNumber={state.personNumber}
          // GroupSaveProps={{ entityName }}
          location={location}
          TagCharacterProps={TagCharacterProps}
          groupCategory={groupCategory}
          TagDistributionProps={TagDistributionProps}
          extraContentVisible={this.state.extraContentVisible}
          DetailListProps={DetailListProps}
          handleGroupSave={this.handleGroupSave}
          handleTabChange={this.handleTabChange}
        >
        </GroupDetail>
      </div>
    </div>
  );
}
}

function mapStateToProps(state) {
  return {
    entityGroup: state['entity/group'],
    groupProfile: state['group/profile'],
    tagTree: state.tagPicker,
    loadings: state.LOADING,
  };
}


export default connect(mapStateToProps)(GroupProfile);
