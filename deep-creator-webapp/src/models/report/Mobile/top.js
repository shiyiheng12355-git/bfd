import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/top',

  state: {
    regionData: [],
    channelData: [],
    modelData: [],
    eventData: [],
    accessPagesData: [],
    jumpPagesData: [],
    dateType: 'yestoday',
  },

  effects: {

    *fetchTopRegionChart({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopRegionsGet(payload)
      yield put({
        type: 'setTopRegionChart',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTopChannelChart({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopChannelGet(payload)
      yield put({
        type: 'setTopChannelChart',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTopModelChart({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopModelGet(payload)
      yield put({
        type: 'setTopModelChart',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTopEventChart({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopCustomEventGet(payload)
      yield put({
        type: 'setTopEventChart',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTopAccessPagesChart({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopAccessPageGet(payload)
      yield put({
        type: 'setTopAccessPagesChart',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTopJumpPagesChart({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopJumpsPageGet(payload)
      yield put({
        type: 'setTopJumpPagesChart',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {
    setTopRegionChart(state, { payload }) {
      return {
        ...state,
        regionData: payload,
      }
    },

    setTopChannelChart(state, { payload }) {
      return {
        ...state,
        channelData: payload,
      }
    },

    setTopModelChart(state, { payload }) {
      return {
        ...state,
        modelData: payload,
      }
    },

    setTopEventChart(state, { payload }) {
      return {
        ...state,
        eventData: payload,
      }
    },

    setTopAccessPagesChart(state, { payload }) {
      return {
        ...state,
        accessPagesData: payload,
      }
    },

    setTopJumpPagesChart(state, { payload }) {
      return {
        ...state,
        jumpPagesData: payload,
      }
    },

    setDateType(state, { payload }) {
      return {
        ...state,
        dateType: payload,
      }
    },
  },
}