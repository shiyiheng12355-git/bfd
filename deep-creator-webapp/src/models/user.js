import { query as queryUsers, queryCurrent } from '../services/user';
import modelExtend from 'dva-model-extend';
import { message, notification } from 'antd';
import _ from 'lodash';

import { model } from './common';
import { deepcreatorweb } from 'deep-creator-sdk';
import config from '../utils/config';
import { webAPICfg } from '../utils';


const globalConfig = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg)
const clientAPI = deepcreatorweb.ClientapicontrollerApiFp(webAPICfg);

export default modelExtend(model, {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    postList: [],
    logoUrl: [{ url: '' }],
    menus: [],
    auths: [], // 当前用户拥有的权限列表
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchCurrent({ callback }, { call, put }) {
      const { success, resultBody, errorMsg } = yield clientAPI.clientapiGetMyAccountGet();
      if (success) {
        // resultBody.postId = 23
        // resultBody.rowTemplateId = 33
        // resultBody.columnTemplateId = 9
        // resultBody.operTemplateId = 1
        // resultBody.orgCode = '0001'
        yield put({
          type: 'saveCurrentUser',
          payload: resultBody,
        });
        if (callback) callback(resultBody);
      } else {
        notification.error({ message: '获取登录信息失败', description: errorMsg })
      }
    },

    *fetchPostList({ callback }, { put }) { // 岗位列表
      const { success, resultBody } = yield clientAPI.clientapiGetPostListGet();
      if (success) {
        yield put({
          type: 'savePostList',
          payload: resultBody,
        });
        if (callback) callback(resultBody);
      }
    },

    *getLogoUrl(_, { call, put }) {
      const { resultBody } = yield globalConfig.globalConfigurationGetLogoUrlGet()
      if (resultBody !== '') {
        yield put({
          type: 'changeLogo',
          payload: [{ url: resultBody }],
        })
      }
    },

    *changePost({ payload, callback }, { put }) { // 保存岗位
      const { success, resultBody, errorMsg } = yield clientAPI.clientapiChangePostPostIdPut(payload);
      if (success) {
        yield put({
          type: 'fetchCurrent',
          payload: {},
        });
        if (resultBody) {
          typeof callback === 'function' && callback();
        }
      } else {
        notification.error({ message: '切换岗位失败', description: errorMsg || resultBody });
      }
    },

    *fetchMenus({ payload, callback }, { put, select }) {
      const { success, resultBody } = yield clientAPI.clientapiQueryMyMenusGet();
      if (success) {
        yield put({
          type: 'saveMenus',
          payload: resultBody,
        });
        if (callback) callback(resultBody)
      }
    },

    *fetchAuths({ payload, callback }, { put, select }) {
      const { resultBody, errorMsg, success } = yield clientAPI.clientapiQueryOperAuthListByParentKeyGet(payload);
      if (success) {
        const newKeys = (resultBody || []).map(item => item.resourceKey);
        const { auths } = yield select(_ => _.user);
        const newAuths = _.uniq(auths.concat(newKeys))
        callback && callback(newKeys);
        yield put({
          type: 'saveAuths',
          payload: newAuths,
        })
      } else {
        notification.error({ message: '查询权限失败', description: errorMsg })
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },

    changeLogo(state, action) {
      return {
        ...state,
        logoUrl: action.payload,
      }
    },

    savePostList(state, action) {
      return {
        ...state,
        postList: action.payload,
      }
    },

    saveMenus(state, action) {
      return {
        ...state,
        menus: action.payload,
      }
    },

    saveAuths(state, action) {
      return {
        ...state,
        auths: action.payload,
      }
    },
  },
});
