import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/operatorAnalysis',

  state: {
    tableData: [],
    dateType: '7days',
    ChartData: [],
    chartComData: [],
  },

  effects: {
    *fetchChartData({ payload }, { call, put }) {
      const { params, operator, comparison } = payload
      let response
      if (operator === 'operator') {
        response = yield mobileAppAPiFP.bizOnlineOperatingIndexAppNetworkOperatorOperatorGet(params)
      } else {
        response = yield mobileAppAPiFP.bizOnlineOperatingIndexAppNetworkOperatorNetWorkGet(params)
      }
      yield put({
        type: 'setChartData',
        payload: { data: JSON.parse(response.resultBody), comparison },
      })
    },


    *fetchTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppNetworkOperatorDetailDataGet(payload)
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
