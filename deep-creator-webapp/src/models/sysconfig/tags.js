import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';

import { webAPICfg, toTree } from '../../utils';


const smConfigEntityAPI = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const tagCateAPI = deepcreatorweb.BiztagcategorycontrollerApiFp(webAPICfg);
const tagNameAPI = deepcreatorweb.BiztagnamecontrollerApiFp(webAPICfg);
const globalConfigurationAPI = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg);
const smInitDictionaryAPI = deepcreatorweb.SminitdictionarycontrollerApiFp(webAPICfg);

export default {
  namespace: 'sysconfig/tags',

  state: {
    loading: true,
    defaultPageNum: 1,
    pageSize: 5,
    list: [],
  },

  effects: {
    // 获取实体列表
    *queryConfigEntityList({ payload }, { put, call, select }) {
      const { resultBody, success } = yield call(smConfigEntityAPI.smConfigEntityQueryConfigEntityListGet);
      if (success && resultBody && resultBody.length > 0) {
        yield put({
          type: 'saveList',
          payload: resultBody,
        });
        for (let i = 0; i < resultBody.length; i++) {
          const { defaultPageNum, pageSize } = yield select(state => state['sysconfig/tags']);
          yield put({
            type: 'queryTagCategoryOne',
            payload: {
              pageNum: defaultPageNum,
              pageSize,
              entityId: resultBody[i].id,
            },
          });
        }
      }
    },
    // 查询某个实体下的列表数据
    *queryTagCategoryOne({ payload }, { put, call }) {
      const { resultBody, success } = yield call(tagCateAPI.bizTagCategoryOneTagConfigGet, { ...payload });
      if (success) {
        yield put({
          type: 'saveTagCategoryOne',
          payload: resultBody,
          entityId: payload.entityId,
        });
      }
    },
    *querySelectTree({ payload }, { put, call }) {
      const { resultBody, success } = yield call(tagCateAPI.bizTagCategoryQueryAdjustTagCategoryAndTagNameListGet, { ...payload });
      if (success) {
        const resultBodyToTree = toTree(resultBody, 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName');
        yield put({
          type: 'saveSelectTree',
          payload: resultBodyToTree,
          entityId: payload.entityId,
        });
      }
    },
    *queryTagNameLabelInfo({ payload, callback }, { put, call }) {
      const { success, errorMsg, resultBody } = yield call(tagNameAPI.bizTagNameLabelInfoGet, { ...payload });
      if (success) {
        if (typeof callback === 'function') {
          if (resultBody.paramConstraintJson) {
            callback(JSON.parse(resultBody.paramConstraintJson));
          } else {
            callback({});
          }
        }
      }else{
        notification.error({ message: '查询失败', description: errorMsg || resultBody });
      }
    },
    *querytagInfoExceptCover({ payload, callback }, { put, call }) {
      const { success, errorMsg, resultBody } = yield call(tagNameAPI.bizTagNameTagInfoExceptCoverGet, { ...payload });
      if (success) {
        if (typeof callback === 'function') {
          if (resultBody.paramConstraintJson) {
            callback(JSON.parse(resultBody.paramConstraintJson));
          } else {
            callback({});
          }
        }
      } else {
        notification.error({ message: '查询失败', description: errorMsg || resultBody });
      }
    },
    *queryInitColumnList({ payload }, { put, call }) {
      const { success, resultBody } = yield globalConfigurationAPI.globalConfigurationQueryInitColumnListGet({ ...payload });
      if (success) {
        yield put({
          type: 'saveInitColumnList',
          payload: resultBody,
          entityId: payload.entityId,
        });
      }
    },
    *queryALLCategoryList({ payload, callback }, { put, call }) {
      const { success, resultBody } = yield smInitDictionaryAPI.smInitDictionaryQueryALLCategoryListGet();
      if (success) {
        typeof callback === 'function' && callback(resultBody);
      }
    },
    *saveChannelInit({ payload }, { put, call }) {
      const { success, resultBody, errorMsg } = yield globalConfigurationAPI.globalConfigurationSaveChannelInitPost({ smEntityConfigInfos: [...payload] });
      if(success){
        message.success('修改成功')
      } else {
        notification.error({ message: '修改失败', description: errorMsg || resultBody });
      }
    },
    *updateTagConstraint({ payload }, { put, call }) {
      const { success, resultBody, errorMsg } = yield tagNameAPI.bizTagNameUpdateTagConstraintGet({ ...payload });
      if (success) {
        message.success('修改成功');
      } else {
        notification.error({ message: '修改失败', description: errorMsg || resultBody })
      }
    },
  },
  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    saveList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveTagCategoryOne(state, action) {
      return {
        ...state,
        [`entity_${action.entityId}`]: action.payload,
      }
    },
    saveSelectTree(state, action) {
      return {
        ...state,
        [`treeList_${action.entityId}`]: action.payload,
      };
    },
    saveInitColumnList(state, action) {
      return {
        ...state,
        [`columnList_${action.entityId}`]: action.payload,
      };
    },
    setColumnList(state, action) {
      const { entityId, index, value } = action.payload;
      let data = state[`columnList_${entityId}`];
      data[index].rowAuthorRootCode = value;
      return {
        ...state,
        [`columnList_${entityId}`]: data,
      }
    },

  },
};
