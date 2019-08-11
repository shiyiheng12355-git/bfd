import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg,arrayToTree } from '../../utils';
import {searchTree} from '../../utils/utils';
import {notification,Icon} from 'antd'

const ApiFp = deepcreatorweb.SmorginfocontrollerApiFp(webAPICfg);

export default {
  namespace: 'organization',

  state: {
	 	visible: false,
    controlType: '',
    loading: true,
    organizationType:[],//筛选是的组织架构类型
    modalData: {},
    tableData: [],
    list:[],
    searchData: false
  },

  effects: {
  	*fetchTableData(_, { call, put }) {
      const { resultBody }= yield ApiFp.smOrgInfoListGet({});
      let data,map;
      data = arrayToTree(resultBody,'orgCode','parentOrgCode','children',map)
  		yield put({
        type: 'getTableData',
        payload: data,
        list:resultBody
      });
  		// yield put({type: 'getTableData', {pyload: tableData}})
  		// const {user} = yield select(state=>state.resouce)
  	},
    *fetchAddData({ payload, callback}, { call, put }) {
      const { resultBody,success } = yield ApiFp.smOrgInfoAddPost({smOrgInfo:payload});
      if(success){
        yield put({
          type: 'fetchTableData'
        });
        yield put({
          type: 'handleCloseModal'
        });
        callback&&callback();
      }
  		notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
  	},

    *fetchChangeStatusById({payload}, { call, put }) {
      const { success } = yield ApiFp.smOrgInfoChangeStatusIdPut({...payload});
      if(success){
        yield put({
          type: 'fetchTableData'
        });
      }
      notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
    },
    *fetchDelByID({payload,callback}, { call, put }) {
      const { success } = yield ApiFp.smOrgInfoDelIdDelete({id:payload});
      if(success){
        yield put({
          type: 'fetchTableData'
        });
        callback&&callback();
      }
      notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
    },
    *fetchUpData({payload,callback}, { call, put }) {
      const { success } = yield ApiFp.smOrgInfoUpdatePut({smOrgInfo:payload});
      if(success){
        yield put({
          type: 'fetchTableData'
        });
        yield put({
          type: 'handleCloseModal'
        });
        callback&&callback();
      }
      notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
    },
    *isExitOrgCode({payload,callback}, { call, put }){
      const {resultBody, success} = yield ApiFp.smOrgInfoInfoByOrgCodeOrgCodeGet({orgCode:payload});
      if(success){
        callback&&callback(resultBody);
      }
    }
  },

  reducers: {
  	getTableData(state, {payload,list} ) {
  		return {
  			...state,
        tableData: payload,
        list:list||[],
        loading: false,
        visible: false,
  		};
    },
    
    getSearchData(state, { payload }){
      console.log(payload,searchTree(state['list'],'orgCode','parentOrgCode','orgName',payload));
      return {
        ...state,
        searchData:searchTree(state['list'],'orgCode','parentOrgCode','orgName',payload)
      }
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
        visible: false,
      };
    },
  },
};
