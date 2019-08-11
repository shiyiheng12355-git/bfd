import { deepcreatorweb } from 'deep-creator-sdk';

import { removeRule, addRule } from '../../services/api';
import { webAPICfg } from '../../utils';
import cloneDeep from 'lodash/cloneDeep';
import { message, notification } from 'antd';


const ApiFp = deepcreatorweb.BizstrategymarketingcontrollerApiFp(webAPICfg);
const bizGroupAPI = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg);
const bizLifeTripAPI = deepcreatorweb.BizlifetripcontrollerApiFp(webAPICfg);
const smConfigEntityAPI = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);


function* wrapper(cb, put) {
  yield put({
    type: 'changeLoading',
    payload: true,
  });
  yield cb()
  yield put({
    type: 'changeLoading',
    payload: false,
  });
}

export default {
  namespace: 'marketing/scene',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    // groupList:[],
    tripList: [],
    tgiList: [],
    entityList: [],
    loading: true,
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield ApiFp.bizStrategyMarketingList();
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *add({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });

      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });

      if (callback) callback();
    },
    // -------------客户生命旅程-------------
    *queryConfigEntityList({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        const { resultBody, success } = yield call(smConfigEntityAPI.smConfigEntityQueryConfigEntityListGet);
        if (success && resultBody && resultBody.length > 0) {
          const userEntityList = resultBody.filter(i => i.entityCategory === 0)
          yield put({
            type: 'saveEntityList',
            payload: userEntityList,
          });
          for (let i = 0; i < userEntityList.length; i++) {
            if (i === 0) {
              yield put({
                type: 'queryGroupList',
                payload: {
                  entityId: userEntityList[i].id,
                  groupAuthorityType: 0,
                  isAddReport: 1,
                },
                callback: () => {
                  if (typeof callback === 'function') {
                    callback();
                  }
                },
              });
            } else {
              yield put({
                type: 'queryGroupList',
                payload: {
                  entityId: userEntityList[i].id,
                  groupAuthorityType: 0,
                  isAddReport: 1,
                },
              });
            }
          }
        }
      }, put);
    },
    *setNumGroupList({ payload, callback }, { call, put, select }) {
      yield wrapper(function* () {
        if (payload.list && payload.list.length > 0) {
          const state = yield select(_ => _['marketing/scene']);
          let groupList = state[`groupList_${payload.selected.entityId}`];
          const ids = payload.list;
          // for (let i = 0; i < ids.length; i++) {
            const result = yield bizGroupAPI.bizGroupQueryGroupCustomerNumAndUserNumGet({
              ids: ids.map(item => item).join(','),
              entityId: payload.selected.entityId,
            });
            if (result.success) {
              const numList = JSON.parse(result.resultBody);
              for (let k in numList) {
                groupList.map((m, n) => {
                  if (m.id == k) {
                    m.userNum = numList[k].userNum;
                    m.customerNum = numList[k].customerNum;
                  }
                })
              }
              yield put({
                type: 'saveGroupList',
                payload: groupList,
                entityId: payload.selected.entityId,
              });
              if (result.success) {
                const numList = JSON.parse(result.resultBody);
                for (let k in numList) {
                  groupList.map((m, n) => {
                    if (m.id == k) {
                      m.userNum = numList[k].userNum;
                      m.customerNum = numList[k].customerNum;
                    }
                  })
                }
                yield put({
                  type: 'saveGroupList',
                  payload: groupList,
                  entityId: payload.entityId,
                });
              }
            }
          }
        // }
      }, put);
    },
    *queryGroupList({ payload, callback }, { call, put }) {
      yield wrapper(function* () {
        const { success, resultBody } = yield bizGroupAPI.bizGroupListGet({ ...payload });
        if (success) {
          yield put({
            type: 'saveGroupList',
            payload: resultBody,
            entityId: payload.entityId,
          });
          if (typeof callback === 'function') {
            callback();
          }
          const _ids = resultBody && resultBody.length > 0 && resultBody.map(item => item.id);
          const ids = _ids.splice(0, 4);
          if (ids && ids.length > 0) {
            let groupList = resultBody;
            // for(let i=0;i<ids.length;i++){
              const result = yield bizGroupAPI.bizGroupQueryGroupCustomerNumAndUserNumGet({
                ids: ids.map(item => item).join(','),
                entityId: payload.entityId,
              });
              if (result.success) {
                const numList = JSON.parse(result.resultBody);
                for (let k in numList) {
                  groupList.map((m, n) => {
                    if (m.id == k) {
                      m.userNum = numList[k].userNum;
                      m.customerNum = numList[k].customerNum;
                    }
                  })
                }
                yield put({
                  type: 'saveGroupList',
                  payload: groupList,
                  entityId: payload.entityId,
                });
              }
            // }
          }
        }
      }, put);
    },
    *queryTripList({ payload, callback }, { call, put }) {
      yield wrapper(function* () {
        const { success, resultBody } = yield bizLifeTripAPI.bizLifeTripQueryBizLifeTripInfoByPageGet({ ...payload });
        if (success && resultBody && resultBody.total > 0) {
          yield put({
            type: 'saveTripList',
            payload: resultBody.list,
          });
          if (typeof callback === 'function') {
            callback();
          }
        }
      }, put);
    },
    *queryPeopleSum({ payload, callback }, { call, put }) {
      yield wrapper(function* () {
        const { success, resultBody } = yield bizLifeTripAPI.bizLifeTripQueryPeopleSumPost({ bizLifeTripInfoParam: { ...payload } });
        if (success) {
          yield put({
            type: 'setTripList',
            payload: resultBody,
          });
        } else {
          yield put({
            type: 'setTripList',
            payload: { type: 'error', id: payload.bizLifeTripId },
          });
        }
      }, put);
    },
    *queryTGI({ payload, callback }, { call, put }) {
      yield wrapper(function* () {
        const { success, resultBody } = yield bizLifeTripAPI.bizLifeTripQueryTGIPost({ bizLifeTripInfoParam: { ...payload } });
        if (success) {
          yield put({
            type: 'setTGIList',
            payload: resultBody,
          });
          if (typeof callback === 'function') {
            callback();
          }
        }
      }, put);
    },

  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    // ----------------客户生命旅程------------
    saveGroupList(state, action) {
      let list = action.payload;
      if (list && list.length > 0) list = list.filter(item => (item.groupType == 0 || item.groupType == 1 || item.groupType == 7 || item.groupType == 8));
      return {
        ...state,
        [`groupList_${action.entityId}`]: list,
      };
    },
    saveTripList(state, action) {
      return {
        ...state,
        tripList: action.payload,
      };
    },
    setTripList(state, action) {
      let tlist = cloneDeep(state.tripList);
      const key = Object.keys(action.payload)[0];
      const value = action.payload[key];
      if (action.payload.type == 'error') {
        tlist.map((item, i) => {
          if (item.bizLifeInfo && item.bizLifeInfo.id == action.payload.id) {
            delete item.bizLifeInfo.peopleSum;
          }
        });
      } else {
        tlist.map((item, i) => {
          if (item.bizLifeInfo && item.bizLifeInfo.id == key) {
            item.bizLifeInfo.peopleSum = value || 0
          }
        });
      }
      return {
        ...state,
        tripList: tlist,
      };
    },
    setTGIList(state, action) {
      return {
        ...state,
        tgiList: action.payload,
      };
    },
    saveEntityList(state, action) {
      return {
        ...state,
        entityList: action.payload,
      };
    },

  },
};
