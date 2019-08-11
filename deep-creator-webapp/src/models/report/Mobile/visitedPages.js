import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/mobile/visitedPages',

  state: {
    tableData: [],
    dateType: 'yestoday',
  },

  effects: {
    *fetchTableData({ payload }, { call, put }) {
      console.log(payload)
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppAccessPageSummaryGet(payload)
      yield put({
        type: 'setTableData',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {

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
