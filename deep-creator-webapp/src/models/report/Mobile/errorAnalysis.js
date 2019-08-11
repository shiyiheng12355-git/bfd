import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';
import _ from 'lodash'

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/errorAnalysis',
  state: {
    errorListInfo: {
      dateType: '7days',
      currentValue: 'day',
    },
    errorTrendInfo: {
      dateType: '7days',
      currentValue: 'day',
    },
    errorListData: [],
    errorTrendData: [],
    versionData: [],
    systemData: [],
    modelData: [],
    channelData: [],
  },
  effects: {
    *fetchErrorListData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppErrorListGet(payload)
      yield put({
        type: 'setErrorListData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchErrorTrendData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppErrorAnalysisGet(payload)
      yield put({
        type: 'setErrorTrendData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchErrorTrendTopData({ payload }, { put }) {
      const versionData = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopAppversionErrorAnalysisGet(payload)
      const systemData = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopOsversionErrorAnalysisGet(payload)
      const modelData = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopModelErrorAnalysisGet(payload)
      const channelData = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTopChannelErrorAnalysisGet(payload)
      console.log('end')

      yield put({
        type: 'setTopData',
        payload: {
          versionData: JSON.parse(versionData.resultBody),
          systemData: JSON.parse(systemData.resultBody),
          modelData: JSON.parse(modelData.resultBody),
          channelData: JSON.parse(channelData.resultBody),
        },
      })
    },

  },
  reducers: {
    setErrorListData(state, { payload }) {
      return {
        ...state,
        errorListData: payload,
      }
    },
    setErrorTrendData(state, { payload }) {
      return {
        ...state,
        errorTrendData: payload,
      }
    },

    setTopData(state, { payload }) {
      console.log('111')
      const {
        versionData,
        systemData,
        modelData,
        channelData,
      } = payload
      console.log('payload', payload)
      return {
        ...state,
        versionData,
        systemData,
        modelData,
        channelData,
      }
    },

    /*
     公共更新时间state
   */
    setDateType(state, { payload }) {
      const changeDateType = { ...state[payload.type] }
      changeDateType.dateType = payload.value
      state[payload.type] = changeDateType
      return {
        ...state,
      }
    },
  },
}