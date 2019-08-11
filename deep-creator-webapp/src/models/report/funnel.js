import { organizationDetail, organizationType, getFunnel } from '../../services/api';
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg, arrayToTree } from '../../utils';
import { notification, Icon } from 'antd'

const ApiFp = deepcreatorweb.BizfunnelcontrollerApiFp(webAPICfg);
const collectionFp = deepcreatorweb.BizcollectiondetailcontrollerApiFp(webAPICfg);
export default {
  namespace: 'report/funnel',

  state: {
    ifloading: true, // 是否加载动画
    switchdis: false, // 是否禁用切换状态
    visible: false,//新增弹窗
    funneldom: [], // 首页漏斗DOM
    funnelaList: [], // 存放接口数据
    totalCounts: null, // 漏斗数据总数
    pageSize: 10, // 页面显示数量
    currentPage: 1, // 当前页
    showAddModal: false, // 显示新增漏斗弹层
  },

  effects: {
    *fetchFunnelaList({ payload }, { call, put }) {
      const { resultBody, success } = yield ApiFp.bizFunnelPageGet({ pageNum: payload, pageSize: 10 });
      yield put({
        type: 'getFunnelaList',
        payload: resultBody || [],
      });
      
    },
    *fetchDelById({ payload,callback }, { call, put }) {
      yield put({
        type: 'upIfloading',
      });
      const { resultBody, success } = yield ApiFp.bizFunnelDelIdDelete({ id:payload });
      if(success){
        callback && callback();
        yield put({
          type: 'fetchFunnelaList',
          payload: 1,
        });
      }
      
    },
    *fetchFunnelCollection({ payload,callback }, { call, put ,select }){
      const {resultBody, success} = yield collectionFp.bizCollectionDetailCheckByFunnelIdGet({funnelId:payload})
      callback && callback(resultBody);
    },
    *fetchMonitor({ payload,callback }, { call, put ,select }) {
      
      const {currentPage} = yield select(_ => _['report/funnel']);
      const { resultBody, success } = yield ApiFp.bizFunnelMonitorPost({ funnelId:payload.funnelId,isMonitor:payload.isMonitor*1 });
      
      if(success){
        if(callback){
          callback();
        }else{

          yield put({
            type: 'fetchFunnelaList',
            payload: currentPage,
          });
        }
      }
      notification.open({
        message: '提示',
        description: success ? `${payload.isMonitor?'启用':'停用'}成功` : '操作失败',
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
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
    getFunnelaList(state, { payload }) {

      return {
        ...state,
        funnelaList: payload.list,
        totalCounts: payload.total,
        currentPage: payload.pageNum,
        visible:false,
        ifloading: false,

      };
    },
    upIfloading(state, { payload }){
      return {
        ...state,
        ifloading:true
      }
    },
    // 组织类型
    getOrganizationType(state, { payload }) {
      return {
        ...state,
        organizationType: payload
      }
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
