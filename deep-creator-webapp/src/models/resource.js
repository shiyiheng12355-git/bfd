import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';

import { webAPICfg, arrayToTree } from '../utils';
import _ from 'lodash';

const ResourceApiFp = deepcreatorweb.SmresourceinfocontrollerApiFp(webAPICfg)

export default {
  namespace: 'resource',

  state: {
	 	visible: false,
    controlType: '',
    loading: true,
    selectList: [
      {
        value: 1,
        name: '一级菜单',
      },
      {
        value: 2,
        name: '二级菜单',
      },
      {
        value: 3,
        name: '区块',
      },
      {
        value: 4,
        name: '按钮',
      },
    ],
    selectData: [],
    modalData: {},
    tableData: [],
    defaultData: [],
  },

  effects: {
  	*fetchTableData(payload, { call, put }) {
      // const tableData = yield call(queryResource);
      const { resourceTitle } = payload
      const { resultBody } = yield ResourceApiFp.smResourceInfoQueryResourceListGet({})
      yield put({
        type: 'setDefaultData',
        payload: resultBody,
      })
  		yield put({
        type: 'getTableData',
        payload: arrayToTree(resultBody, 'resourceKey', 'parentResourceKey', 'children'),
      });
  		// yield put({type: 'getTableData', {pyload: tableData}})
  		// const {user} = yield select(state=>state.resouce)
    },

    *fetchAddOneLevel({ payload, callback }, { call, put }) {
      const smResourceOneLevelInfo = payload;
      const result = yield ResourceApiFp.smResourceInfoAddOneLevelPost({ smResourceOneLevelInfo });
      if (result.resultBody) {
        message.success('添加成功');
        yield put({
          type: 'fetchTableData',
        })
        yield put({
          type: 'handleCloseModal',
        })
        callback && callback(result.resultBody)
      } else {
        notification.error({ message: '添加失败', description: result.errorMsg });
      }
    },

    *fetchAddTwoLevel({ payload, callback }, { call, put }) {
      const smResourceTwoLevelInfo = payload;
      const { isCascadeAdd } = payload
      delete payload.isCascadeAdd
      const { success, errorMsg } = yield ResourceApiFp.smResourceInfoAddTwoLevelPost({ smResourceTwoLevelInfo, isCascadeAdd })
      if (success) {
        message.success('添加成功');
        yield put({
          type: 'fetchTableData',
        })
        yield put({
          type: 'handleCloseModal',
        })
        callback && callback(success)
      } else {
        notification.error({ message: '添加失败', description: errorMsg });
      }
    },

    *fetchAddThreeLevel({ payload, callback }, { call, put }) {
      const smResourceThreeLevelInfo = payload;
      const { isCascadeAdd } = payload
      delete payload.isCascadeAdd
      const { success, errorMsg } = yield ResourceApiFp.smResourceInfoAddThreeLevelPost({ smResourceThreeLevelInfo, isCascadeAdd })
      if (success) {
        message.success('添加成功');
        yield put({
          type: 'fetchTableData',
        })
        yield put({
          type: 'handleCloseModal',
        })
        callback && callback(success)
      } else {
        notification.error({ message: '添加失败', description: errorMsg });
      }
    },

    *fetchCheckTitle({ payload, callback }, { put }) {
      const { resourceTitle, id } = payload
      const { resultBody } = yield ResourceApiFp.smResourceInfoCheckResourceTitleGet({ resourceTitle, id })
      callback && callback(resultBody)
    },

    *fetchCheckKey({ payload, callback }, { put }) {
      const { resourceKey } = payload
      const { resultBody } = yield ResourceApiFp.smResourceInfoCheckResourceKeyGet({ resourceKey })
      callback && callback(resultBody)
    },

    *fetchUpdate({ payload, callback }, { call, put }) {
      let result
      if (payload.resourceType === 1) {
        const smResourceOneLevelUO = payload
        result = yield ResourceApiFp.smResourceInfoUpdateOneLevelPost({ smResourceOneLevelUO })
      } else if (payload.resourceType === 2) {
        const smResourceTwoLevelUO = payload
        result = yield ResourceApiFp.smResourceInfoUpdateTwoLevelPost({ smResourceTwoLevelUO })
      } else {
        const smResourceThreeLevelUO = payload
        result = yield ResourceApiFp.smResourceInfoUpdateThreeLevelPost({ smResourceThreeLevelUO })
      }
      const { success, errorMsg } = result;
      if (success) {
        message.success('修改成功');
        yield put({
          type: 'fetchTableData',
        })
        yield put({
          type: 'handleCloseModal',
        })
        callback && callback(success)
      } else {
        notification.error({ message: '修改失败', description: errorMsg });
      }
    },

    *fetchDelItem({ payload }, { call, put }) {
      const { resultBody } = yield ResourceApiFp.smResourceInfoDelResourceIdDelete({ id: payload })
      yield put({
        type: 'fetchTableData',
      })
    },

  },

  reducers: {
  	getTableData(state, { payload }) {
  		return {
  			...state,
  			tableData: payload,
        loading: false,
        visible: false,
  		};
    },
    setDefaultData(state, { payload }) {
      return {
        ...state,
        defaultData: payload,
      }
    },

    handleOpenModal(state, { payload }) {
      const selectData = _.cloneDeep(state.selectList)
      const { modalData, type } = payload
      if (type === 'createFirst' || type === 'createNext') {
        if (modalData.resourceType === '') {
          selectData.splice(1, 3)
          modalData.resourceType = 1
        } else if (modalData.resourceType === 1) {
          selectData.splice(2, 2)
          selectData.splice(0, 1)
          modalData.resourceType = 2
        } else {
          selectData.splice(0, 2)
          modalData.resourceType = 3
        }
      }

      return {
        ...state,
        visible: true,
        controlType: type,
        modalData,
        selectData,
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
