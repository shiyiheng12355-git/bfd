import { organizationDetail,organizationType, classification } from '../../services/api';
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg,arrayToTree } from '../../utils';
import {notification,Icon} from 'antd'
const ApiFp = deepcreatorweb.SmsafetemplatecontrollerApiFp(webAPICfg);

export default {
  namespace: 'jurisdiction/modelConfig',

  state: {
	 	visible: false,
    controlType: '',
    loading: true,
    organizationType:[],//筛选是的组织架构类型
    classificationData:[],//添加时的类型选择
    total:0,
    templateName:"",
    templateType:"",
    current:1,
    modalData: {},
    tableData: [],
  },

  effects: {
  	*fetchTableData({payload}, { call, put }) {
      let data = {
        pageSize:10,
        pageNum:payload.pageNum||1,
      };
      payload.templateName&&(data.templateName=payload.templateName);
      payload.templateType&&(data.templateType=payload.templateType);
      const { resultBody }= yield ApiFp.smSafeTemplateSafeTemplatePageGet(data);
  		yield put({
        type: 'getTableData',
        payload: resultBody,
      });
      yield put({
        type: 'setSelect',
        payload: {
          templateName:payload.templateName||'',
          templateType:payload.templateType||'',
        },
      });
    },
    *resetList({ payload }, { call, put, select }){
      const state = yield select(_ => _['jurisdiction/modelConfig']);
      let data = {
        pageSize:10,
        pageNum:state.current,
      };
      state.templateName&&(data.templateName=statepayload.templateName);
      state.templateType&&(data.templateType=state.templateType);
      const {resultBody} = yield ApiFp.smSafeTemplateSafeTemplatePageGet(data);
      yield put({
        type: 'getTableData',
        payload: resultBody,
      });
      
    },
    *fetchAddData({ payload,callback }, { call, put }) {
      console.log(payload);
      const { resultBody,success } = yield ApiFp.smSafeTemplateSaveSafeTemplatePost({smSafeTemplateInfo:payload});
      if(success){
        yield put({
          type: 'resetList'
        });
        yield put({
          type: 'handleCloseModal'
        });
        callback&&callback()
      }
  		notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
  	},
    *fetchDelTemplate({payload,callback},{call,put}){
      const { resultBody,success } = yield ApiFp.smSafeTemplateDelSafeTemplateByIdsDelete({ids:payload});
      if(success){
        yield put({
          type: 'resetList'
        });
        callback && callback();
      }
  		notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
      
    },
    *fetchChangeState({payload}, { call, put }) {
      const {success} = yield ApiFp.smSafeTemplateChangeSafeTemplateStatusByIdPut({id:payload});
      if(success){
        yield put({
          type:'resetList'
        })
      }
      notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
      
    },

  },

  reducers: {
    getTableData(state, { payload }) {
      return {
        ...state,
        tableData: payload.list,
        total:payload.total,
        current:payload.pageNum,
        loading: false,
        visible:false
      };
    },
    setSelect(state,{payload}){
      return {
        ...state,
        templateName:payload.templateName,
        templateType:payload.templateType,
      };
    },

    
    handleOpenModal(state, { payload }) {
      return {
        ...state,
        visible: true,
        controlType: payload.type,
        modalData: payload.modalData,
      };
    },
    handleCloseModal(state) {
      return {
        ...state,
        modalData:{},
        visible: false,
      };
    },
  },
};
