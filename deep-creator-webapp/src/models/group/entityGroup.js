import { deepcreatorweb } from 'deep-creator-sdk';
import { request, basePath, webAPICfg } from '../../utils';
import { notification } from 'antd';
import { queryImportFiles } from '../../services/api'
import uuidV4 from 'uuid/v4'
// import Q from 'bluebird';
// import { message } from 'antd';
// import {
//   queryUsergroupCategory,
//   queryProductgroupCategory,
//   queryUserGroupList,
//   queryProductGroupList,
// } from '../../services/api';

const listParam = {
  groupAuthorityType: 0, // 0个人 1生命旅程
  isAddReport: 2, // 0未添加到全局 1添加到全局 2所有
}

const GroupApiFp = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg);
const GroupCategoryApiFp = deepcreatorweb.BizgroupcategorycontrollerApiFp(webAPICfg);

const SmConfigEntityApiFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const FileApiFp = deepcreatorweb.FilecontrollerApiFp(webAPICfg);

function* getData (api, params, call){
  let response = yield call(api, params)
  let promise = response.json()
  let data = yield promise.then(res => res)
  return data
}

export default {
  namespace: 'entity/group',
  state: {
    entityList: [], // 实体列表
    groupCategory: [], // 群组分类
    groupList: [], // 群组列表
    customerAndUserNum: {}, // 群组的用户数/客户数
    matchCount: {}, // 外导群的匹配数
    importFiles: [], // 已导入文件列表
    importFileNames: [],
  },

  effects: {
    * fetch({ payload }, { put, call, select }) {
      let [total, groupCategory, groupList] = [0, [], []]
      yield put({
        type: 'updateState',
        payload: { loading: true },
      });
      const { entityId, callback } = payload;
      const groupListParam = {
        ...listParam,
        entityId,
      }
      const categoryResponse = yield GroupCategoryApiFp.bizGroupCategoryQueryGroupCategoryListByUserPostIdGet({ entityId });
      const listResponse = yield GroupApiFp.bizGroupListGet(groupListParam);

      if (categoryResponse.success && listResponse.success) {
        groupCategory = categoryResponse.resultBody;
        groupList = listResponse.resultBody;
        //去掉所有群 1220
        let index = groupList.findIndex((item, index, arr) => {
          return item.groupType == 7
        })
        if(index != -1){
          groupList.splice(index,1);
        }
        // total = listResponse.resultBody.total;
        yield put({
          type: 'updateState',
          payload: {
            groupCategory,
            groupList,
          },
        });
        if (callback) callback();
      }
    },


    *getEntityList({ payload }, { call, put }) {
      const { callback } = payload;
      let entityList = [];
      const response = yield call(SmConfigEntityApiFp.smConfigEntityQueryConfigEntityListGet);

      if (response.success) {
        entityList = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: {
            entityList,
          },
        })
        if (callback) callback(entityList);
      }
    },

    *getGroupList({ payload }, { call, put }) {
      const { entityId, callback } = payload;
      const groupListParam = {
        ...listParam,
        entityId,
      }
      let [groupList, total, success] = [[], 0, false];
      const response = yield GroupApiFp.bizGroupListGet(groupListParam);
      if (response.success) {
        success = true;
        groupList = response.resultBody || [];
        //去掉所有群 1219
        let index = groupList.findIndex((item, index, arr) => {
          return item.groupType == 7
        })
        if(index != -1){
          groupList.splice(index,1);
        }
        // total = groupList.length;
        yield put({
          type: 'updateState',
          payload: {
            groupList,
          },
        })
        if (callback) callback(success);
      } else if (!response.success) {
        if (callback) callback(success);
      }
    },

    *getGroupCategory({ payload }, { call, put }) {
      const { entityId, callback } = payload;
      let [groupCategory, success] = [[], false];
      const params = {
        entityId,
      }
      const response = yield call(GroupCategoryApiFp.bizGroupCategoryQueryGroupCategoryListByUserPostIdGet, params);
      if (response.success) {
        success = true;
        groupCategory = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { groupCategory },
        })
        if (callback) callback(success);
      } else if (!response.success) {
        if (callback) callback(success);
      }
    },


    *queryNumber({ payload }, { call, put }) {
      const { ids, entityId, callback } = payload;
      if (!ids || !ids.length) return
      const params = {
        entityId,
        ids: ids.join(','),
      }
      let customerAndUserNum = [];
      const response = yield call(GroupApiFp.bizGroupQueryGroupCustomerNumAndUserNumGet, params);
      if (response.success) {
        customerAndUserNum = JSON.parse(response.resultBody) || {};
        yield put({
          type: 'updateState',
          payload: { customerAndUserNum },
        })
        if (callback) callback();
      }
    },

    *checkNameIsRepeat({ payload }, { put, call, select }) {
      const { entityId, groupName, callback } = payload;
      const params = {
        entityId,
        groupName,
      }
      const response = yield call(GroupApiFp.bizGroupIsRepetitiveGroupNamePost, params);
      let groupNameIsRepeat = false;
      if (response.success) {
        groupNameIsRepeat = response.resultBody;
        if (callback) callback(groupNameIsRepeat);
      }
    },

    * saveCommonGroup({ payload }, { call, put, select }) {
      const { bizGroupInfo, callback } = payload;
      const { entityId } = bizGroupInfo;
      const params = {
        sysEntityId: entityId,
        bizGroupInfo,
      }
      const response = yield call(GroupApiFp.bizGroupSysEntityIdSaveCommonGroupPost, params);
      let success = false;
      if (response.success) {
        success = true;
        yield put({
          type: 'fetch',
          payload: {
            entityId,
            callback: () => {
              if (callback) callback(response);
            },
          },
        })
      } else if (!response.success) {
        if (callback) callback(response);
      }
    },

    * deleteGroup({ payload }, { put, call, select }) {
      const { id, entityId, callback } = payload;
      let params = { id }
      const response = yield call(GroupApiFp.bizGroupDeleteGroupByIdIdDelete, params);
      let success = false;
      if (response.success) {
        success = true;
        yield put({
          type: 'getGroupList',
          payload: {
            entityId,
            callback: () => {
              if (callback) callback(success);
            },
          },
        })
      } else if (!response.success) {
        if (callback) callback(success, response.errorMsg);
      }
    },


    *updateGroup({ payload }, { put }) {
      const { bizGroupInfo, entityId, callback } = payload;
      const response = yield GroupApiFp.bizGroupUpdateGroupPost(bizGroupInfo);
      if (response.success) {
        yield put({
          type: 'getGroupList',
          payload: { entityId },
        })
        if (callback) callback(true)
      } else if (!response.success) {
        if (callback) callback(false)
      }
    },


    *deleteFile({ payload }, { put, call, select }) {
      const { id, fileName, entityId, fileIdList, callback } = payload;
      const params = {
        id,
        fileName,
      }
      const response = yield call(FileApiFp.fileIdFileNameDelete, params);
      let success = false;
      if (response.ok) {
        success = true;
        yield put({
          type: 'getMatchCount',
          payload: {
            entityId,
            fileIdList,
          },
        })
        if (callback) callback(success)
      }
    },

    *saveDateGroupInput({ payload }, { put, call, select }) {
      const { entityId, fileUrlList, callback } = payload;
      const params = {
        entityId,
        fileUrlList,
      }
      const response = yield call(GroupApiFp.bizGroupSaveDateGroupInputPost, params);
      if (response && callback) {
        callback(response)
      }
    },

    *getMatchCount({ payload }, { put, call, select }) {
      const { entityId, fileIdList, callback } = payload;
      const params = {
        entityId,
        fileIdList,
      }
      let matchCount = {};
      let success = false;
      const response = yield call(GroupApiFp.bizGroupGetFromImportGroupPost, params);
      if (response.success) {
        success = true;
        matchCount = JSON.parse(response.resultBody) || {};
        yield put({
          type: 'updateState',
          payload: { matchCount },
        })
      }
      if (callback) callback(success);
    },

    *saveImportGroup({ payload }, { put, call, select }) {
      const { bizGroupInfo, fileIdList, callback } = payload;
      const sysEntityId = bizGroupInfo.entityId;
      const params = {
        bizGroupInfo,
        sysEntityId,
        fileIdList,
      }
      const response = yield call(GroupApiFp.bizGroupSysEntityIdSaveImportGroupPost, params);
      if (response.success) {
        yield put({
          type: 'fetch',
          payload: {
            entityId: bizGroupInfo.entityId,
            callback: () => {
              if (callback) callback(response);
            },
          },
        })
      } else {
        let success = false;
        if (callback) callback(response);
      }
    },

    // 查询已导入文件
    *queryImportFiles({ payload }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield getData(queryImportFiles, payload, call)
      resultBody.map((v,i) => v.key = i)
      if(success) {
        yield put({
          type: 'updateState',
          payload: { 
            importFiles: resultBody,
            importFileNames: resultBody.map(v => v.fileName),
          },
        })
      }else{
        notification.error({ message: '系统错误', description: errorMsg })
      }
    },
  },

  reducers: {
    updateState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};

