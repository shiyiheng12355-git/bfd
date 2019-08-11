import { userListData } from '../../services/api';
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg,arrayToTree } from '../../utils';
import {notification,Icon} from 'antd'

const ApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);

export default {
  namespace: 'jurisdiction/template',

  state: {
    loading: true,
    visibleModel:false,//模板类型弹窗
    total:0,
    templateName:"",
    templateType:"",
    current:1,
    modalData: {
      isView:false,
      id:null,
      visible:false,//表单显示控制
      templateType:1//模板类型
    },
    tableData: [],
  },

  effects: {
    *fetchTableData({payload}, { call, put }) {
      const {resultBody} = yield ApiFp.smTemplateQueryTemplateListGet({
        pageNum:payload.pageNum||1,
        pageSize:10,
        templateName:payload.templateName||'',
        templateType:payload.templateType||'',
      })
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
      const state = yield select(_ => _['jurisdiction/template']);
      const {resultBody} = yield ApiFp.smTemplateQueryTemplateListGet({
        pageNum:state.current,
        pageSize:10,
        templateName:state.templateName||"",
        templateType:state.templateType||'',
      });
      yield put({
        type: 'getTableData',
        payload: resultBody,
      });
      
    },
    *fetchChangeTempState({ payload }, { call, put, select }) {
      const { success,errorMsg } = yield ApiFp.smTemplateChangeTemplateStateIdPut({id:payload});
      if(success){
        yield put({
          type:'resetList'
        })
      }
      notification.open({
        message: '提示',
        description: success?'操作成功':(errorMsg||'操作失败'),
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
      
    },
    *deleteTemplate({ payload,callback }, { call, put, select }) {
      const { success,errorMsg } = yield ApiFp.smTemplateDelByTemplateIdDelete({id:payload});
      if(success){
        yield put({
          type:'resetList'
        })
        callback && callback()
      }
      notification.open({
        message: '提示',
        description: success?'操作成功':(errorMsg||'操作失败'),
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
      
    },
    
  },

  reducers: {
    getTableData(state, { payload }) {
      let {modalData} = state;
      modalData.visible = false;
      return {
        ...state,
        tableData: payload.list,
        total:payload.total,
        current:payload.pageNum,
        loading: false,
        modalData
      };
    },
    setSelect(state,{payload}){
      return {
        ...state,
        templateName:payload.templateName,
        templateType:payload.templateType,
      };
    },
    setVisibleModel(state, { payload }) {
      return {
        ...state,
        visibleModel:payload
      };
    },

    handleOpenModal(state, { payload }) {
      let {modalData} = state;
      if(payload.modalData){
        modalData = payload.modalData;
      }else{
        modalData.templateType = payload.modalType;
      }
      modalData.visible = true;
      return {
        ...state,
        visibleModel:false,
        modalData:modalData,
        templateData:payload.data||null
        // modalData: payload.modalData,
      };
    },
    handleCloseModal(state) {
      return {
        ...state,
        modalData:{
          isView:false,
          id:null,
          visible:false,//表单显示控制
          templateType:1
        },
        templateData:null
      };
    },
  },
};
