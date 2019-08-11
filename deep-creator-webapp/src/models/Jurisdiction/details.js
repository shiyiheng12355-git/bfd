import { organizationDetail, organizationType, classification } from '../../services/api';
import modelExtend from 'dva-model-extend';
import { model } from '../common';

export default modelExtend(model, {
  namespace: 'organization/details',

  state: {
	 	visible: false,
    controlType: '',
    loading: true,
    organizationType: [], // 筛选是的组织架构类型
    classificationData: [], // 添加时的类型选择
    modalData: {},
    tableData: [],
  },

  effects: {
  	*fetchTableData(_, { call, put }) {
  		const tableData = yield call(organizationDetail);
      const organizationTypeData = yield call(organizationType);
  		yield put({
        type: 'getTableData',
        payload: tableData,
      });
  		// yield put({type: 'getTableData', {pyload: tableData}})
  		// const {user} = yield select(state=>state.resouce)
  	},

    *fetchOrganizationType(_, { call, put }) {
      const organizationTypeData = yield call(organizationType);
      yield put({
        type: 'getOrganizationType',
        payload: organizationTypeData,
      });
      // yield put({type: 'getTableData', {pyload: tableData}})
      // const {user} = yield select(state=>state.resouce)
    },
    *fetchClassification(_, { call, put }) {
      const classificationData = yield call(classification);
      yield put({
        type: 'getClassification',
        payload: classificationData,
      });
      // yield put({type: 'getTableData', {pyload: tableData}})
      // const {user} = yield select(state=>state.resouce)
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
    // 组织类型
    getOrganizationType(state, { payload }) {
      return {
        ...state,
        organizationType: payload,
      }
    },
    // 选择类型
    getClassification(state, { payload }) {
      return {
        ...state,
        classificationData: payload,
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
});
