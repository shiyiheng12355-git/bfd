import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';
import cloneDeep from 'lodash/cloneDeep';


const bizCollectionAPI = deepcreatorweb.BizcollectiondetailcontrollerApiFp(webAPICfg);
const ApiFp = deepcreatorweb.BizfunnelcontrollerApiFp(webAPICfg);// 漏斗相关
const reportApiFp = deepcreatorweb.BizreportcontrollerApiFp(webAPICfg);

export default {

  namespace: 'collect/collect',

  state: {
    report: [],
    funnel: [],
  },

  effects: {
    *queryList({ payload, callback }, { put, call }) {
      const { success, resultBody } = yield bizCollectionAPI.bizCollectionDetailQueryListByMenuIdGet({ ...payload });
      if (success) {
        if (typeof callback === 'function') {
          callback(resultBody);
        }
      }
    },
    // 搜索当个漏斗详情
    *fetchFunnel({ payload }, { call, put }) {
      let item = cloneDeep(payload);
      const params = JSON.parse(item.contentJson);
      const { resultBody, success } = yield ApiFp.bizFunnelFunnelDetailPost({ ...params });
      let data = yield ApiFp.bizFunnelInfoIdGet({ id: params.funnelId });
      item.data = data.resultBody;
      item.counts = JSON.parse(resultBody);
      if (data.success) {
        yield put({
          type: 'saveFunnel',
          payload: item,
        });
      }
    },
    *delFunnelById({ payload, callback }, { call, put }) {
      const { resultBody, errorMsg, success } = yield bizCollectionAPI.bizCollectionDetailDelCollectionDetailIdDelete({ ...payload });
      if (success){
        message.success('删除成功');
        typeof callback == 'function' && callback();
      }else{
        notification.error({ message: '删除失败', description: resultBody || errorMsg });
      }
    },

    //  获得图表
    *fetchReport({ payload }, { put }) {
      let item = cloneDeep(payload);
      let params = JSON.parse(item.contentJson);
      params.groupExpression = JSON.stringify(params.groupExpression);
      const { resultBody, success } = yield reportApiFp.bizPerRecomEventPost({ bizReportParam: params });
      if(success){
        item.data = JSON.parse(resultBody);
        yield put({
          type: 'saveReport',
          payload: item
        })
      }
    },

  },

  reducers: {
    saveFunnel(state, action) {
      let funnel = cloneDeep(state.funnel);
      let flag = true;
      funnel && funnel.length > 0 && funnel.map((item, i) => {
        if (item.id === action.payload.id) flag = false;
      });
      flag && funnel.push(action.payload);
      return {
        ...state,
        funnel,
      };
    },
    saveReport(state, action){
      let report = cloneDeep(state.report);
      let flag = true;
      report && report.length > 0 && report.map((item, i) => {
        if (item.id === action.payload.id) flag = false;
      });
      flag && report.push(action.payload);
      return {
        ...state,
        report,
      };
    },
    clear(state, action) {
      return {
        ...state,
        funnel: [],
        report: [],
      };
    },
  },
};
