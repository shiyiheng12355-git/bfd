import { deepcreatorweb } from 'deep-creator-sdk';
import moment from 'moment';
import { webAPICfg } from '../../../utils';
import _ from 'lodash'

const mobileAppAPiFP = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)
const dateFormat = 'YYYY-MM-DD';

export default {
  namespace: 'report/mobile/userAnalysis',
  state: {
    chartData: [],
    rangeDateType: {
      startTime: null,
      endTime: moment().subtract(1, 'days').format(dateFormat),
    },
    newUserInfo: {
      dateType: '7days',
      currentValue: 'day',
    }, // 新增用户初始日期
    keepUserInfo: {
      dateType: '30days',
      currentValue: 'day',
    }, // 留存用户初始日期
    activeUserInfo: {
      dateType: '7days',
      currentValue: 'day',
    }, // 活跃用户初始日期
    silentUserInfo: {
      dateType: {
        startTime: moment().subtract(14, 'days').format(dateFormat),
        endTime: moment().subtract(8, 'days').format(dateFormat),
      },
      currentValue: 'day',
    }, // 沉默用户初始日期
    lostUserInfo: {
      dateType: '7days',
      currentValue: 'day',
    }, // 流失用户初始日期
    returnUserInfo: {
      dateType: {
        startTime: moment().subtract(14, 'days').format(dateFormat),
        endTime: moment().subtract(8, 'days').format(dateFormat),
      },
      currentValue: 'day',
    }, // 回访用户初始日期

    /*
      用户生命周期数据
    */
    rangeData: [],
    rangeDataOf: {},
    rangeTableData: [],
    /*
      新增用户数据
    */
    newUserData: [],
    newUserComData: [],
    newUserDataOf: {},
    newUserTableData: [],

    /*
      留存用户数据
    */
    keepChartData: [],
    keepTableData: [],
    /*
      活跃用户数据
    */
    activeUserTrendData: [],
    activeUserComTrendData: [],
    activeUserONData: [],
    activeUserDataOf: {},
    activeUserTableData: [],
    /*
      沉默用户数据
    */
    silentUserTrendData: [],
    silentUserComTrendData: [],
    silentUserSNdData: [],
    silentUserTableData: [],
    /*
      流失用户数据
    */
    lostUserData: [],
    lostUserComData: [],
    lostUserTableData: [],
    /*
      回访用户数据
    */
    returnUserData: [],
    returnUserTableData: [],
  },

  effects: {
    /*
      用户生命周期
    */
    *fetchChartData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLifeCycleGet(payload)
      yield put({
        type: 'setRangData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchChartDataOf({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLifeCycleDataOfGet(payload)
      yield put({
        type: 'setRangDataOf',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLifeCycleDetailDataGet(payload)
      yield put({
        type: 'setRangTableData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchStartDate({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppUserLifeCycleStartTimeGet()
      yield put({
        type: 'setRangeStartTime',
        payload: resultBody,
      })
    },

     /*
      新增用户接口
    */
    *fetchNewUser({ payload }, { call, put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppNewUserAnalysisGet(params)
      yield put({
        type: 'setNewUserData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchNewUserOf({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppNewUserDataOfGet(payload)
      yield put({
        type: 'setNewUserDataOf',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchNewUserTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppNewUserDetailDataGet(payload)
      yield put({
        type: 'setNewUserTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      留存用户接口
    */
    *fetchKeepChartData({ payload }, { put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppKeepTrendChartGet(payload)
      yield put({
        type: 'setKeepChartData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchKeepDetailData({ payload }, { put }) {
      console.log(payload)
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppNewKeepUserDetailDataGet(payload)
      yield put({
        type: 'setKeepTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      活跃用户接口
    */

    *fetchActiveUserTrend({ payload }, { call, put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppActiveUserTrendGet(params)
      yield put({
        type: 'setActiveUserTrend',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchActiveUserON({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppActiveUserNewOldTrendComparisonGet(payload)
      yield put({
        type: 'setActiveUserON',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchActiveUserOf({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppActiveUserDataOfGet(payload)
      yield put({
        type: 'setActiveUserDataOf',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchActiveUserTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppActiveUserDetailDataGet(payload)
      yield put({
        type: 'setActiveUserTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      沉默用户接口
    */
    *fetchSilentUserTrendData({ payload }, { call, put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppSilentUserTrendGet(params)
      yield put({
        type: 'setSilentUserTrendData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },

    *fetchSilentUserSNData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppSilentNewTrendComparisonGet(payload)
      yield put({
        type: 'setSilentUserSNData',
        payload: JSON.parse(resultBody),
      })
    },

    *fetchSilentUserTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppSilentDetailDataGet(payload)
      yield put({
        type: 'setSilentUserTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      流失用户接口
    */
    *fetchLostUserData({ payload }, { call, put }) {
      const { params, comparison } = payload
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppLossUserAnalysisGet(params)
      yield put({
        type: 'setLostUserData',
        payload: { data: JSON.parse(resultBody), comparison },
      })
    },
    *fetchLostUserTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppLossUserDetailDataGet(payload)
      yield put({
        type: 'setLostUserTableData',
        payload: JSON.parse(resultBody),
      })
    },

    /*
      回访用户接口
    */
   *fetchReturnUserData({ payload }, { call, put }) {
     const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppReturnUserAnalysisGet(payload)
     yield put({
       type: 'setReturnUserData',
       payload: JSON.parse(resultBody),
     })
   },

    *fetchReturnUserTableData({ payload }, { call, put }) {
      const { resultBody } = yield mobileAppAPiFP.bizOnlineOperatingIndexAppReturnUserDetailDataGet(payload)
      yield put({
        type: 'setReturnUserTableData',
        payload: JSON.parse(resultBody),
      })
    },
  },

  reducers: {
    /*
      用户生命周期
    */
    setRangData(state, { payload }) {
      return {
        ...state,
        rangeData: payload,
      }
    },
    setRangDataOf(state, { payload }) {
      return {
        ...state,
        rangeDataOf: payload || {},
      }
    },
    setRangTableData(state, { payload }) {
      return {
        ...state,
        rangeTableData: payload || [],
      }
    },
    setRangeStartTime(state, { payload }) {
      const { rangeDateType } = state
      rangeDateType.startTime = payload
      return {
        ...state,
        ...rangeDateType,
      }
    },

    /*
      新增用户state
    */
    setNewUserData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          newUserData: data,
        }
      } else {
        return {
          ...state,
          newUserComData: data,
        }
      }
    },

    setNewUserDataOf(state, { payload }) {
      return {
        ...state,
        newUserDataOf: payload || {},
      }
    },

    setNewUserTableData(state, { payload }) {
      return {
        ...state,
        newUserTableData: payload || [],
      }
    },

    /*
      留存用户state
    */
    setKeepChartData(state, { payload }) {
      return {
        ...state,
        keepChartData: payload,
      }
    },

    setKeepTableData(state, { payload }) {
      return {
        ...state,
        keepTableData: payload || [],
      }
    },

    /*
      活跃用户state
    */
    setActiveUserTrend(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          activeUserTrendData: data,
        }
      } else {
        return {
          ...state,
          activeUserComTrendData: data,
        }
      }
    },

    setActiveUserON(state, { payload }) {
      return {
        ...state,
        activeUserONData: payload,
      }
    },

    setActiveUserDataOf(state, { payload }) {
      return {
        ...state,
        activeUserDataOf: payload || {},
      }
    },

    setActiveUserTableData(state, { payload }) {
      return {
        ...state,
        activeUserTableData: payload || [],
      }
    },
    /*
      沉默用户state
    */
    setSilentUserTrendData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          silentUserTrendData: data,
        }
      } else {
        return {
          ...state,
          silentUserTrendData: data,
        }
      }
    },

    setSilentUserSNData(state, { payload }) {
      return {
        ...state,
        silentUserSNdData: payload,
      }
    },

    setSilentUserTableData(state, { payload }) {
      return {
        ...state,
        silentUserTableData: payload || [],
      }
    },
    /*
      流失用户state
    */
    setLostUserData(state, { payload }) {
      const { data, comparison } = payload
      if (!comparison) {
        return {
          ...state,
          lostUserData: data,
        }
      } else {
        return {
          ...state,
          lostUserComData: data,
        }
      }
    },
    setLostUserTableData(state, { payload }) {
      return {
        ...state,
        lostUserTableData: payload || [],
      }
    },

    /*
      回访用户state
    */
    setReturnUserData(state, { payload }) {
      return {
        ...state,
        returnUserData: payload,
      }
    },

    setReturnUserTableData(state, { payload }) {
      return {
        ...state,
        returnUserTableData: payload || [],
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

    setCurrentValue(state, { payload }) {
      const changeCurrentValue = { ...state[payload.type] };
      changeCurrentValue.currentValue = payload.value
      state[payload.type] = changeCurrentValue;
      return {
        ...state,
      }
    },
  },
}