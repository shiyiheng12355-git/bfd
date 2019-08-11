import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/timeAnalysis',

  state: {
    dateType: '7days',
    chartData: [],
    chartComData: [],
    abstractList: {}, // 摘要列表
    tableData: [], //  明细列表
  },

  effects: {
    *fetchTimeIntervalChart({ payload }, { call, put }) {
      console.log(payload)
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTimeIntervalAnalysisGet(params)
      yield put({
        type: 'setChartData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchAbstractList({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTimeIntervalDataOfGet(payload)
      yield put({
        type: 'setAbstractList',
        payload: JSON.parse(resultBody),
      })
    },
    *fetchTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTimeIntervalDetailDataGet(payload)
      yield put({
        type: 'setTableData',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {
    setChartData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          chartData: data,
        }
      } else {
        return {
          ...state,
          chartComData: data,
        }
      }
     
    },

    setDateType(state, { payload }) {
      return {
        ...state,
        dateType: payload,
      }
    },

    setAbstractList(state, { payload }) {
      return {
        ...state,
        abstractList: payload || {},
      }
    },
    setTableData(state, { payload }) {
      return {
        ...state,
        tableData: payload,
      }
    },
  },
}
