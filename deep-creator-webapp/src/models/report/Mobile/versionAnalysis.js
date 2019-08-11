import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';
import { format } from 'url';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/versionAnalysis',

  state: {
    tableData: [],
    dateType: '7days',
    chartData: [],
    versionData: [],
    abstractList: [], // 摘要列表
  },

  effects: {

    *fetchChartData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppVersionAnalysisBersionTrendGet(payload)
      yield put({
        type: 'setChartData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTableData({ payload, callback }, { call, put }) {
      const { params, type } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppVersionAnalysisVersionDistributionGet(params)
      let versionData = []
      let formatData
      switch (type) {
        case 'newCount':
          formatData = JSON.parse(resultBody).sort((a, b) => { return b.newCount - a.newCount })
          break;
        case 'activeCount':
          formatData = JSON.parse(resultBody).sort((a, b) => { return b.activeCount - a.activeCount })
          break;
        case 'upgradeCount':
          formatData = JSON.parse(resultBody).sort((a, b) => { return b.upgradeCount - a.upgradeCount })
          break;
        case 'startupCount':
          formatData = JSON.parse(resultBody).sort((a, b) => { return b.startupCount - a.startupCount })
          break;
        default:
          formatData = JSON.parse(resultBody)
          break;
      }
      console.log(formatData)
      yield put({
        type: 'setTableData',
        payload: formatData,
      })
      formatData && formatData.map((item) => {
        versionData.push(item.version)
      })
      yield put({
        type: 'setVersionData',
        payload: versionData,
      })

      callback && callback(versionData)
    },
    *fetchAbstractList({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppVersionAnalysisDataSummaryGet(payload)
      yield put({
        type: 'setAbstractList',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {
    setChartData(state, { payload }) {
      return {
        ...state,
        chartData: payload,
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

    setVersionData(state, { payload }) {
      return {
        ...state,
        versionData: payload,
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
