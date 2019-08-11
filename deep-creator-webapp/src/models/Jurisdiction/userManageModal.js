import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg,arrayToTree } from '../../utils';
import {notification,Icon} from 'antd'
import _ from 'lodash';

const ApiFp = deepcreatorweb.SmuserinfocontrollerApiFp(webAPICfg);

// arrayToTree
export default {
  namespace: 'userManage/modal',

  state: {
    loading: true,
    controlType: '',
    treeMap:{},
    formData: {
      userData : [{
        userName : "",
        name : "", 
        email : '', 
        phone : "", 
        password : "", 
        confirmWord : ""
      }],
      stationData:[{
        postName:undefined,//岗位名称
        operTemplateId:"",//功能权限
        orgCode:"",//组织名称
        columnTemplateId:"",
        rowTemplateId:"",
        orgdataEnableStatus:1,
        enableStatus:1,
        subNode:[],
        key:new Date().getTime()
      }]
    },
    TreeData:[]
  },

  effects: {
    *fetchUserName({payload,callback},{call,put}){
      const { resultBody, success, errorMsg } = yield ApiFp.smUserInfoUserNameIsExitGet({userName:payload});
      
      callback && callback(resultBody);
    },
    *fetchDelInfo({payload,callback},{call,put}){
      const { resultBody, success,errorMsg } = yield ApiFp.smUserInfoDelPostIdDelete({id:payload});
      console.log('成功了',success);
      if(success){
        callback && callback();
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功' : (errorMsg||'操作失败'),
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    }
  },

  reducers: {
    getTreeData(state, { payload }) {
      let map = {};
      payload = arrayToTree(payload,'id','pid','children',map);
      return {
        ...state,
        TreeData: payload,
        treeMap:map
      };
    },
    updateUserData(state, {payload}){
      let {formData} = state;
      formData.userData = payload
      return {
        ...state,
        formData
      };
    },
    updateStationData(state, {payload}){
      let {formData} = state;
      // formData = _.cloneDeep(formData);
      formData.stationData = payload
      return {
        ...state,
        formData
      };
    },
    updataFormData(state,{payload}){
      return {
        ...state,
        formData: payload,
      };
    },
    changeModal(state, { payload }){
      return {
        ...state,
        modalData: payload.modalData,
      };
    },
    resetFormData(state,{payload}){
      return {
        ...state,
        formData: {
          userData : [{
            userName : "",
            name : "", 
            email : '', 
            phone : "", 
            password : "", 
            confirmWord : ""
          }],
          stationData:[{
            postName:undefined,//岗位名称
            operTemplateId:"",//功能权限
            orgCode:"",//组织名称
            columnTemplateId:"",
            rowTemplateId:"",
            orgdataEnableStatus:1,
            enableStatus:1,
            subNode:[],
            key:new Date().getTime()
          }]
        }
      }
    }
    
  },
};
