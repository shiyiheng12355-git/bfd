import { userListData } from '../../services/api';
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg, arrayToTree, getChildrenKey } from '../../utils';
import { notification, Icon } from 'antd';
import { queryPostList } from '../../services/api';


function* getData (api, params, call){
  let response = yield call(api, params)
  let promise = response.json()
  let data = yield promise.then(res => res)
  return data
}

const ApiFp = deepcreatorweb.SmuserinfocontrollerApiFp(webAPICfg);
const ApiFp2 = deepcreatorweb.SmorginfocontrollerApiFp(webAPICfg);
const ApiFp3 = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);
export default {
  namespace: 'userManage',

  state: {
    loading: true,
    controlType: '',
    visible: false,
    total: 0,
    current: 1,
    FormData: {},//表单数据
    modalData: {
      isView: false,
      id: null
    },
    tableData: [],
  },

  effects: {
    *fetchTableData({ payload }, { call, put }) {
      const { resultBody, success } = yield ApiFp.smUserInfoQueryUserListGet({ pageNum: payload.pageNum, pageSize: 10, userName: payload.userName || "" });

      yield put({
        type: 'getTableData',
        payload: resultBody,
      });
    },
    *fetchGetFormData({ payload }, { call, put }) {
      let formData = {};
      // 获取组织架构
      const { resultBody } = yield ApiFp2.smOrgInfoQueryOpenListGet({});
      let data, map = {};
      data = arrayToTree(resultBody, 'orgCode', 'parentOrgCode', 'children', map)
      // console.log('===================',getChildrenKey(resultBody,'orgCode','parentOrgCode'))
      formData['1'] = {
        treeData: data,
        map: map,
        childKey: getChildrenKey(resultBody, 'orgCode', 'parentOrgCode')
      }
      // //获取功能模板
      // data = yield ApiFp3.smTemplateQuerySmTemplateListGet({ templateType: 1 });
      // formData['2'] = data.resultBody;
      // //获取行模板
      // data = yield ApiFp3.smTemplateQuerySmTemplateListGet({ templateType: 2 });
      // formData['3'] = data.resultBody;
      // //获取列模板
      // data = yield ApiFp3.smTemplateQuerySmTemplateListGet({ templateType: 3 });
      // formData['4'] = data.resultBody;
      // 岗位信息
      data = yield getData(queryPostList, {pageNum: 1, pageSize: 100}, call)
      formData['5'] = data.resultBody.list;
      yield put({
        type: 'getFormData',
        payload: formData,
      });
    },
    *fetchChangeUserState({ payload }, { call, put, select }) {
      const { success } = yield ApiFp.smUserInfoChangeUserStateIdPut({ id: payload });
      const state = yield select(_ => _['userManage']);

      if (success) {
        const { resultBody } = yield ApiFp.smUserInfoQueryUserListGet({ pageNum: state.current, pageSize: 10, userName: state.userName || "" });
        yield put({
          type: 'getTableData',
          payload: resultBody,
        });
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功' : '操作失败',
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      // yield put({type: 'getTableData', {pyload: tableData}})
      // const {user} = yield select(state=>state.resouce)
    },
    *fetchSaveUser({ payload,callback }, { call, put, select }) {
      const { success,errorMsg } = yield ApiFp.smUserInfoSaveOrEditUserInfoPost({ userAndPostInfo: payload });
      const state = yield select(_ => _['userManage']);

      if (success) {
        const { resultBody } = yield ApiFp.smUserInfoQueryUserListGet({ pageNum: state.current, pageSize: 10, userName: state.userName || "" });
        yield put({
          type: 'getTableData',
          payload: resultBody,
        });
        callback&&callback();
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功' : (errorMsg||'操作失败'),
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    },
    *fetchGetDataById({ payload, callback }, { call, pull }) {
      const { resultBody,success } = yield ApiFp.smUserInfoGetUserIdGet({ id: payload });
      console.log(resultBody)
      if(success){
        callback&&callback(resultBody)
      }
    },
    *fetchDelUser({ payload, callback }, { call, put, select }) {
      const { success } = yield ApiFp.smUserInfoDelUserDelete({ id: payload });
      const state = yield select(_ => _['userManage']);

      if (success) {
        const { resultBody } = yield ApiFp.smUserInfoQueryUserListGet({ pageNum: state.current, pageSize: 10, userName: state.userName || "" });
        yield put({
          type: 'getTableData',
          payload: resultBody,
        });
        callback && callback()
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功' : '操作失败',
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    },
  },

  reducers: {
    getTableData(state, { payload }) {
      return {
        ...state,
        tableData: payload.list,
        total: payload.total,
        current: payload.pageNum,
        loading: false,
        visible: false,
      };
    },
    getFormData(state, { payload }) {
      return {
        ...state,
        FormData: payload
      };
    },
    changeModal(state, { payload }) {
      return {
        ...state,
        modalData: payload.modalData,
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
        visible: false,
      };
    },
  },
};
