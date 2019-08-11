import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg, toTree } from '../../../utils';
import cloneDeep from 'lodash/cloneDeep';
import { message, notification } from 'antd';

const rooAPiFP = deepcreatorweb.ReportonlineoperateindexcontrollerApiFp(webAPICfg); //report-online-operate-index-controller

export default {
  namespace: 'report/PC/guest',
  state: {
    newAndOldVisitor: null,
    distribution: null,
    gphDistribution: [],
    rDistributionCustomerIndex:[],
    psEnvironmentBrowser: null,
    psEnvironmentBrowserOverview: [],
    psCompareEnvironmentBrowserOverview: [],
    loyalty: null
  },
  effects: {
    *queryPcOveriewOfNewAndOldVisitor({ payload }, { call, put }) { //globalConfiguration/queryPcOveriewOfNewAndOldVisitor
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcOveriewOfNewAndOldVisitorPost({baseOnlineOperatingIndexInfo: {...payload} });
      if (success){
        yield put({
          type:'savePcOveriewOfNewAndOldVisitor',
          payload: JSON.parse(resultBody) 
        })
      }
    },
    *queryPcRegionalDistribution({ payload }, { call, put }) { //globalConfiguration/queryPcRegionalDistribution
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcRegionalDistributionPost({ baseOnlineOperatingIndexInfo: { ...payload } });
      if(success){
        yield put({
          type: 'savePcRegionalDistribution',
          payload: JSON.parse(resultBody)
        })
      }
    },
    *queryPcVisitGeographicalDistribution({ payload }, { call, put }) { //globalConfiguration/queryPcVisitGeographicalDistribution
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcVisitGeographicalDistributionPost({ baseOnlineOperatingIndexInfo: { ...payload } });
      if (success) {
        yield put({
          type: 'savePcVisitGeographicalDistribution',
          payload: JSON.parse(resultBody)
        })
      }
    },
    *queryPcRegionalDistrubutionCustomerIndex({ payload }, { call, put }) { // globalConfiguration/queryPcRegionalDistrubutionCustomerIndex
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcRegionalDistrubutionCustomerIndexPost({ baseOnlineOperatingIndexInfo: { ...payload } });
      if (success) {
        yield put({
          type: 'savePcRegionalDistrubutionCustomerIndex',
          payload: JSON.parse(resultBody)
        })
      }
    },
    *queryPcSystemEnvironmentBrowser({ payload }, { call, put }) { // globalConfiguration/queryPcSystemEnvironmentBrowser
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcSystemEnvironmentBrowserPost({ baseOnlineOperatingIndexInfo: { ...payload } });
      if (success){
        yield put({
          type: 'savePcSystemEnvironmentBrowser',
          payload: JSON.parse(resultBody)
        })
      }
    },
    *queryPcSyfstemEnvironmentBrowserDistributionOverview({ payload }, { call, put }) { // globalConfiguration/queryPcSyfstemEnvironmentBrowserDistributionOverview
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcSyfstemEnvironmentBrowserDistributionOverviewPost({ baseSystemInfo: { ...payload } });
      if (success) {
        yield put({
          type: 'savePcSystemEnvironmentBrowserOverview',
          payload: JSON.parse(resultBody)
        })
      }
    },
    *queryComparePcSyfstemEnvironmentBrowserDistributionOverview({ payload }, { call, put }){
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcSyfstemEnvironmentBrowserDistributionOverviewPost({ baseSystemInfo: { ...payload } });
      if (success) {
        yield put({
          type: 'saveComparePcSystemEnvironmentBrowserOverview',
          payload: JSON.parse(resultBody)
        })
      }
    },
    *queryPcLoyalty({ payload }, { call, put }) { //globalConfiguration/queryPcLoyalty
      const { success, resultBody } = yield rooAPiFP.globalConfigurationQueryPcLoyaltyPost({ baseOnlineOperatingIndexInfo: { ...payload } });
      if (success) {
        yield put({
          type: 'savePcLoyalty',
          payload: JSON.parse(resultBody)
        })
      }
    }
  },
  reducers: {
    savePcOveriewOfNewAndOldVisitor(state, action){
      return {
        ...state,
        newAndOldVisitor: action.payload
      }
    },
    savePcRegionalDistribution(state, action){
      return {
        ...state,
        distribution: action.payload
      }
    },
    savePcVisitGeographicalDistribution(state, action){
      return {
        ...state,
        gphDistribution: action.payload
      }
    },
    savePcRegionalDistrubutionCustomerIndex(state, action){
      return {
        ...state,
        rDistributionCustomerIndex: action.payload
      }
    },
    savePcSystemEnvironmentBrowser(state, action){
      return {
        ...state,
        psEnvironmentBrowser: action.payload
      }
    },
    savePcSystemEnvironmentBrowserOverview(state, action){
      return {
        ...state,
        psEnvironmentBrowserOverview: action.payload
      }
    },
    saveComparePcSystemEnvironmentBrowserOverview(state, action) {
      return {
        ...state,
        psCompareEnvironmentBrowserOverview: action.payload
      }
    },
    savePcLoyalty(state, action){
      return {
        ...state,
        loyalty: action.payload
      }
    }
  }, 
};
