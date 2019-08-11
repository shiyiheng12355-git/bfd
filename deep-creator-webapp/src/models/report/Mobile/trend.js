import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

const formatList = (list) => {
  const arr = []
  if (!list) list = { activeCount: 0, startupCount: 0, newCount: 0, wastageCount: 0, backflowCount: 0 }
  for (let i in list) {
    arr.push({ title: i, value: list[i] })
  }
  return arr
}

export default {
  namespace: 'report/mobile/trend',

  state: {
    dataList: [],
    dateType: 'yestoday',
    chartData: [],
  },

  effects: {
    *fetchApplicationList({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppApplicationsGet(payload)
      yield put({
        type: 'setHeadList',
        payload: formatList(JSON.parse(resultBody)),
      })
    },

    *fetchTrendChart({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppDataTrendGet(payload)
      yield put({
        type: 'setChartData',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {
    setHeadList(state, { payload }) {
      return {
        ...state,
        dataList: payload,
      }
    },

    setChartData(state, { payload }) {
      return {
        ...state,
        chartData: payload,
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
