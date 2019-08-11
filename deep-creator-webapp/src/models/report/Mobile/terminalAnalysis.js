import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/terminalAnalysis',

  state: {
    tableData: [],
    dateType: '7days',
    chartData: [],
    chartComData: [],
    abstractList: {}, // 摘要列表
  },

  effects: {
    *fetchChartData({ payload }, { call, put }) {
      const { params, terminal, comparison } = payload
      let response
      if (terminal === 'osversion') {
        // 操作系统
        response = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTerminalAnalysisOperatingSystemGet(params)
      } else if (terminal === 'model') {
        // 终端型号
        response = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTerminalAnalysisTerminalTypeGet(params)
      } else if (terminal === 'resolution') {
        // 分辨率
        response = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTerminalAnalysisiResolutionGet(params)
      }
      yield put({
        type: 'setChartData',
        payload: { data: JSON.parse(response.resultBody), comparison },
      })
    },


    *fetchTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTerminalAnalysisDetailDataGet(payload)
      yield put({
        type: 'setTableData',
        payload: JSON.parse(resultBody),
      })
    },
    *fetchAbstractList({ payload }, { call, put }) {
      // console.log('params', payload)
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppTerminalAnalysisDataOfGet(payload)
      yield put({
        type: 'setAbstractList',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {
    setChartData(state, { payload }) {
      const { data, comparison } = payload
      // console.log(payload)
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

    setAbstractList(state, { payload }) {
      return {
        ...state,
        abstractList: payload,
      }
    },
  },
}
