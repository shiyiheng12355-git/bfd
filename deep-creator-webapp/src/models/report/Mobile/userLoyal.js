import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/userLoyal',
  state: {
    dateType: '7days',
    freqBarData: [],
    freqComBardata: [],
    freqTrendData: [],
    freqComTrendData: [],
    freqTableData: [],
    timeBarData: [],
    timeComBarData: [],
    timeTrendData: [],
    timeComTrendData: [],
    timeTableData: [],
    pagesBarData: [],
    pagesComBarData: [],
    pagesTableData: [],
    intBarData: [],
    intTableData: [],
  },

  effects: {

    /*
      使用频率
    */
    *fetchFreqBarData({ payload }, { put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUseFrequencyDistributionGet(params)
      yield put({
        type: 'setFreqBarData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchFreqTrendData({ payload }, { put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyUseFrequencyGet(params)
      yield put({
        type: 'setFreqTrendData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchFreqTableData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyUseFrequencyDetailDataGet(payload)
      yield put({
        type: 'setFreqTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      使用时长
    */
    *fetchTimeBarData({ payload }, { put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltySingleUseTimeDistributionGet(params)
      yield put({
        type: 'setTimeBarData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchTimeTrendData({ payload }, { put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyUseTimeTrendGet(params)
      yield put({
        type: 'setTimeTrendData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchTimeTableData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyUseTimeTrendDetailDataGet(payload)
      yield put({
        type: 'setTimeTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      访问页数
    */
    *fetchPagesBarData({ payload }, { put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyAccessPageDistributionGet(params)
      yield put({
        type: 'setPagesBarData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchPagesTableData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyDetailDataGet(payload)
      yield put({
        type: 'setPagesTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      使用间隔
    */
    *fetchIntBarData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyUseIntervalDistributionGet(payload)
      yield put({
        type: 'setIntBarData',
        payload: JSON.parse(resultBody),
      })
    },
    *fetchIntTableData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLoyaltyUseIntervalDetailDataGet(payload)
      yield put({
        type: 'setIntTableData',
        payload: JSON.parse(resultBody),
      })
    },
  },


  reducers: {
    /*
      使用频率存储数据
    */
    setFreqBarData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          freqBarData: data,
        }
      } else {
        return {
          ...state,
          freqComBardata: data,
        }
      }
    },
    setFreqTrendData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          freqTrendData: data,
        }
      } else {
        return {
          ...state,
          freqComTrendData: data,
        }
      }
    },
    setFreqTableData(state, { payload }) {
      return {
        ...state,
        freqTableData: payload,
      }
    },

    /*
      使用时长存储数据
    */
    setTimeBarData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          timeBarData: data,
        }
      } else {
        return {
          ...state,
          timeComBarData: data,
        }
      }
    },

    setTimeTrendData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          timeTrendData: data,
        }
      } else {
        return {
          ...state,
          timeComTrendData: data,
        }
      }
    },

    setTimeTableData(state, { payload }) {
      return {
        ...state,
        timeTableData: payload,
      }
    },

    /*
      访问页数存储数据
    */
    setPagesBarData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          pagesBarData: data,
        }
      } else {
        return {
          ...state,
          pagesComBarData: data,
        }
      }
    },

    setPagesTableData(state, { payload }) {
      return {
        ...state,
        pagesTableData: payload,
      }
    },

    /*
      使用间隔存储数据
    */
    setIntBarData(state, { payload }) {
      return {
        ...state,
        intBarData: payload,
      }
    },
    setIntTableData(state, { payload }) {
      return {
        ...state,
        intTableData: payload,
      }
    },

    // 更新时间
    setDateType(state, { payload }) {
      return {
        ...state,
        dateType: payload,
      }
    },
  },
}