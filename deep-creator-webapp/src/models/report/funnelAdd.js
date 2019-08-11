import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg, arrayToTree } from '../../utils';
import { notification, Icon } from 'antd'

const ApiFp = deepcreatorweb.BizfunnelcontrollerApiFp(webAPICfg);
const eventApiFp = deepcreatorweb.EventactioncontrollerApiFp(webAPICfg);
const APPApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);
const reportFp = deepcreatorweb.SmreportmanagementcontrollerApiFp(webAPICfg)//报表管理获取漏斗上限
export default {
  namespace: 'report/funelAdd',

  state: {
    appList: [],//APPKEY列表
    actionList: [],//事件列表
    showStride: false,//顯示跨平台彈框
    maxStep:15,//最大层数
    strideData: [{
      stepName: '',//步骤名称
      eventId: '',//事件
      eventName: "",//事件名
      paramList: [],//参数列表
    }],//跨平台弹框数据
    paramList: [],//参数列表
    paramClassList:[],
  },

  effects: {
    *fetchGetAppList(_, { call, put }) {
      // const { resultBody, success } = yield eventApiFp.eventActionQueryAppListGet({ isExtend: 1 });
      const { resultBody, success } = yield APPApiFp.smTemplateQueryCurrentUserAppKeyGet();
      if (success) {
        yield put({
          type: 'getAppList',
          payload: resultBody,
        });
      }
    },
    *fetchGetFunnelLevel({ payload }, { call, put }){
      const { resultBody, success } = yield reportFp.smReportManagementQueryReportConfigInfoStepUpperLimitGet();
      yield put({
        type:'getMaxStep',
        payload:resultBody?resultBody.configValue:15
      })
    },
    //
    *fetchGetAppEventList({ payload }, { call, put }) {
      const { resultBody, success } = yield eventApiFp.eventActionQueryEventListByAppIdGet({ appKey: payload });

      yield put({
        type: 'getAppEvent',
        payload: resultBody || [],
      });
    },
    *fetchGetEventParam({ payload }, { call, put }) {
      console.log('param',payload)
      const { resultBody, success } = yield eventApiFp.eventActionQueryConfigEventListGet({ eventId: payload,eventType:1 });

      yield put({
        type: 'getEventParamList',
        payload: resultBody || [],
      });
    },
    // 获取参数类型
    *fetchEventParamsTips({ payload,index }, { call, put, select }) {
      const { resultBody } = yield eventApiFp.eventActionQueryActionParamPromptGet({ ...payload })
      yield put({
        type: 'changeSelectedEventParamsTipsData',
        payload: { index, data: JSON.parse(resultBody) },
      })
    },
    *fetchAddFunnel({ payload,callback }, { call, put }) {
      const { resultBody, success, errorMsg } = yield ApiFp.bizFunnelAddPost({ bizFunnelVO: payload });
      
      if(success){
        callback && callback();
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功' : (errorMsg || '操作失败'),
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    },
    *fetchReName({ payload,callback }, { call, put }){
      
      const { resultBody, success } = yield ApiFp.bizFunnelIsNameRepeatedGet({ funnelName: payload });
      callback&&callback(resultBody);
    },
    *fetchStrideData({ payload }, { call, put }) {
      const data = {};
      for (let i = 0, len = 2; i < len; i++) {
        
        const data = yield eventApiFp.eventActionQueryConfigEventListGet({ eventId: payload[i].eventId,eventType:1 });
        payload[i] = {
          ...payload[i],
          paramList: data.resultBody || []
        }
      }
      yield put({
        type: "setStrideData",
        payload: payload
      })
    },
  },

  reducers: {
    /**
     * 设置参数类型
     * @param {*} state 
     * @param {*} param1 
     */
    changeSelectedEventParamsTipsData(state, { payload }){
      let paramClassList = state['paramClassList'];
      paramClassList[payload.index] = payload.data
      return {
        ...state,
        paramClassList
      }
    },  
    /**
     * 设置APP列表
     * @param {*} state 
     * @param {*} param1 
     */
    getAppList(state, { payload }) {
      return {
        ...state,
        appList: payload,
        actionList: [],
      };
    },
    getMaxStep(state,{payload}){
      return {
        ...state,
        maxStep:payload
      }
    },
    /**
     * 设置APP事件
     * @param {*} state 
     * @param {*} param1 
     */
    getAppEvent(state, { payload }) {
      return {
        ...state,
        actionList: payload,
        paramList: [],
        paramClassList:[]
      };
    },
    // 清空事件列表和清空参数列表
    resetDataList(state, { payload }){
      return{
        ...state,
        paramList: [],
        actionList:[],
        paramClassList:[]
      }
    },
    setStrideData(state, { payload }) {
      return {
        ...state,
        showStride: true,
        strideData: payload
      };
    },
    closeStrideData(state, { payload }) {
      return {
        ...state,
        showStride: false,
        strideData: []
      };
    },
    getEventParamList(state, { payload }) {
      return {
        ...state,
        paramList: payload,
        paramClassList:[]
      };
    },
    // 选择类型
    getClassification(state, { payload }) {
      return {
        ...state,
        classificationData: payload
      }
    },
    handleOpenModal(state, { payload }) {
      return {
        ...state,
        visible: true,
      };
    },
    handleCloseModal(state) {
      return {
        ...state,
        visible: false,
      };
    },
  },
};
