import { queryNotices, queryMenus } from '../services/api';
import { message, notification } from 'antd';
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../utils';

const collectionAPI = deepcreatorweb.BizcollectionmenucontrollerApiFp(webAPICfg);

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    fetchingNotices: false,
    menus: [],
  },

  effects: {
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: data.length,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },

    *saveCollectionMenu({ payload, callback }, { put, select }) {
      const { resultBody, errorMsg, success } = yield collectionAPI.bizCollectionMenuSaveCollectionMenuPost({ bizCollectionMenuInfo: { ...payload } });
      if (success) {
        message.success('添加收藏菜单成功');
        typeof callback === 'function' && callback();
      } else {
        message.error(errorMsg || '添加收藏菜单失败');
      }
    },
    *checkMenuName({ payload, callback }, { put, select }){
      const { resultBody, errorMsg, success } = yield collectionAPI.bizCollectionMenuCheckMenuNameGet({ ...payload });
      if(success){
        if (resultBody){ //存在
          message.error('收藏名称已存在');
        }else{// 不存在
          typeof callback === 'function' && callback();
        }
      }else{
        message.error(errorMsg);
      }
    },
    *delCollectionMenu({ payload, callback }, { put, select }) {
      // /bizCollectionMenu/delCollectionMenu/{id}
      const { resultBody, errorMsg, success } = yield collectionAPI.bizCollectionMenuDelCollectionMenuIdDelete({ ...payload });
      if (success) {
        message.success('删除成功');
        typeof callback === 'function' && callback();
      } else {
        message.error('删除失败');
      }
    },
    // *fetchMenus(_, { call, put }) {
    //   const data = yield call(queryMenus);
    //   yield put({
    //     type: 'changeMenus',
    //     payload: data,
    //   });
    // },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
