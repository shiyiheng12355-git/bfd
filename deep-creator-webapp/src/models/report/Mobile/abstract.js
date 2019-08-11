import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/abstract',

  state: {
    absList: {},
    activeList: {},
  },

  effects: {
    *fetchAbsList({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppApplicationOfGet(payload)
      yield put({
        type: 'setAbsList',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchActiveList({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppActiveStatusGet(payload)
      yield put({
        type: 'setActiveList',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {
    setAbsList(state, { payload }) {
      return {
        ...state,
        absList: payload,
      }
    },
    setActiveList(state, { payload }) {
      return {
        ...state,
        activeList: payload,
      }
    },
  },
}