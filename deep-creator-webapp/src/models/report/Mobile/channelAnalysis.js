import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/channelAnalysis',

  state: {
    tableData: [],
    dateType: '7days',
    chartData: [],
    channelData: [],
    abstractList: [], //  摘要列表
  },

  effects: {

    *fetchChartData({ payload }, { call, put }) {
      // console.log('channe',payload)
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppChannelAnalysisChannelTrendGet(payload)

      yield put({
        type: 'setChartData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTableData({ payload, callback }, { call, put }) {
      const { params, type } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppChannelAnalysisChannelDistributionGet(params)
      let channelData = []
      let formatData
      switch (type) {
        case 'newCount':
          formatData = JSON.parse(resultBody).sort((a, b) => { return b.newCount - a.newCount })
          break;
        case 'activeCount':
          formatData = JSON.parse(resultBody).sort((a, b) => { return b.activeCount - a.activeCount })
          break;
        case 'startupCount':
          formatData = JSON.parse(resultBody).sort((a, b) => { return b.startupCount - a.startupCount })
          break;
        default:
          formatData = JSON.parse(resultBody)
          break;
      }
      yield put({
        type: 'setTableData',
        payload: formatData,
      })
      formatData && formatData.map((item) => {
        channelData.push(item.channel)
      })
      yield put({
        type: 'setChannelData',
        payload: channelData,
      })

      callback && callback(channelData)
    },
    *fetchAbstractList({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppChannelAnalysisDataSummaryGet(payload)
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

    setChannelData(state, { payload }) {
      return {
        ...state,
        channelData: payload,
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
