import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/areaAnalysis',

  state: {
    tableData: [],
    dateType: '7days',
    ChartData: [],
    chartComData: [],
  },

  effects: {
    *fetchChartData({ payload }, { call, put }) {
      const { params, area, comparison } = payload
      if (area === 'inChina') {
        const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppRegionalAnalysisChinalGet(params)
        yield put({
          type: 'setChartData',
          payload: { data: JSON.parse(resultBody), comparison },
        })
      } else {
        const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppRegionalAnalysisGlobalDistributionGet(params)
        yield put({
          type: 'setChartData',
          payload: { data: JSON.parse(resultBody), comparison },
        })
      }
    },

    *fetchTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppRegionalAnalysisDetailDataGet(payload)
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

    setTableData(state, { payload }) {
      return {
        ...state,
        tableData: payload,
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
