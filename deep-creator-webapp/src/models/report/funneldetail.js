
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg, arrayToTree } from '../../utils';
import { notification, Icon } from 'antd';
import moment from 'moment';

const ApiFp = deepcreatorweb.BizfunnelcontrollerApiFp(webAPICfg);// 漏斗相关
const ApiFp2 = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);// 实体相关
const ApiFp3 = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg)// 用户群相关
const ApiFp4 = deepcreatorweb.BizcollectionmenucontrollerApiFp(webAPICfg)// 收藏相关
const ApiFp5 = deepcreatorweb.BizcollectiondetailcontrollerApiFp(webAPICfg)// 收藏相关
const LifeFp = deepcreatorweb.BizlifetripcontrollerApiFp(webAPICfg)// 生命旅程相关
export default {
  namespace: 'report/funneldetail',

  state: {
    totalCounts: null, // 漏斗数据总数
    pageSize: 10, // 页面显示数量
    currentPage: 1, // 当前页
    funnelaDetail: null,
    funnelaDetailList: null,
    entityList: [], // 实体列表
    groupList: {}, // 用户群列表集合
    menuList: [], // 收藏列表
    isEntityIdData: {}, // 用于优化 记录是否请求过 用户群数据
    showAddModal: false, // 显示新增漏斗弹层
  },

  effects: {
    *fetchFunnelaDetail({ payload, GROUPID, bizLifeTripInfoParam }, { call, put }) {
      // GROUPID 用于判断从生命周期跳转过来 只用于查看的页面
      let dataList = {};
      // 获取实体
      console.log('GROUPID', GROUPID == undefined)
      let resultBody, 
          success,
          data;
      if (GROUPID == undefined) {
        // data = yield ApiFp2.smConfigEntityQueryConfigEntityListGet();
        data = yield ApiFp2.smConfigEntityQueryConfigEntityListByCategoryEntityCategoryEnumGet({
          entityCategoryEnum: 'PERSON',
        });
        resultBody = data.resultBody
        success = data.success
        // 赋值实体列表
        dataList.entityList = resultBody;
      }

      // 获取漏斗步骤
      data = yield ApiFp.bizFunnelInfoIdGet({ id: payload })
      try {
        // 赋漏斗步骤
        dataList.funnelaDetail = data.resultBody;
        if (GROUPID != undefined) {
          // 获取详情数据 (生命周期)
          data = yield LifeFp.bizLifeTripFunnelDetailPost({
            bizLifeTripInfoParam,
            funnelId: payload,
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
          })
          // 赋值漏斗详情
          dataList.funnelaDetailList = Object.prototype.toString.call(data.resultBody) == '[object String]' ? JSON.parse(data.resultBody) : data.resultBody;
        }else {
          // 请求用户列表
          if (resultBody[0]) {
            data = yield ApiFp3.bizGroupListGet({
              entityId: resultBody[0].id,
              groupAuthorityType: 0,
              isAddReport: 1,
            });
            // 赋漏群列表
            dataList.groupList = {}
            dataList.groupList[`${resultBody[0].id  }`] = data.resultBody ? data.resultBody.filter((item) => {
              return [0, 1, 7, 8].indexOf(item.groupType) != -1
            }) : [];

            // 获取详情数据
            if (dataList.groupList[`${resultBody[0].id  }`][0]) {
              data = yield ApiFp.bizFunnelFunnelDetailPost({
                groupId: dataList.groupList[`${resultBody[0].id  }`][0].id,
                funnelId: payload,
                startDateStr: moment().format('YYYY-MM-DD'),
                endDateStr: moment().format('YYYY-MM-DD'),
              })
              // 赋值漏斗详情
              dataList.funnelaDetailList = Object.prototype.toString.call(data.resultBody) == '[object String]' ? JSON.parse(data.resultBody) : data.resultBody;
            }
          }
        }
        yield put({
          type: 'upFunnelData',
          payload: dataList,
        });
        if (GROUPID == undefined) {
          yield put({
            type: 'fetchTabGroup',
            payload: 0,
          })
        }
      } catch (e) {
        console.log(e);
        notification.open({
          message: '提示',
          description: '接口错误',
          icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
        });
      }
    },
    // 获取群详情数据
    *fetchTabGroup({ payload, isEntityId }, { call, put , select }) {
      let { entityList, groupList, isEntityIdData } = yield select(_ => _['report/funneldetail']);
      let data;
      console.log('请求用户群1', isEntityIdData, isEntityId, entityList, payload)
      // if(isEntityIdData[(isEntityId?payload:entityList[payload].id) + '']) return false;
      console.log('请求用户群2',groupList)
      // isEntityIdData[`${isEntityId?payload:entityList[payload].id  }`] = true;
      let ids = groupList[`${isEntityId?payload:entityList[payload].id}`].map(g => g.id).slice(0, 4).join(',');
      
      // for (let i = 0, len = groupList[`${isEntityId?payload:entityList[payload].id  }`].length; i < len; i++) {
        // let item = groupList[`${isEntityId?payload:entityList[payload].id  }`][i];
        data = yield ApiFp3.bizGroupQueryGroupCustomerNumAndUserNumGet({ ids, entityId: payload })
        if (data.resultBody) {
          groupList[`${isEntityId?payload:entityList[payload].id}`].map((item,i)=>{
            if(JSON.parse(data.resultBody)[`${item.id}`]){
              item = { ...item, ...(JSON.parse(data.resultBody)[`${item.id}`]) }
              groupList[`${isEntityId?payload:entityList[payload].id}`][i] = item;
            }
          })
          // groupList[`${isEntityId?payload:entityList[payload].id  }`][i] = item;
        }
      // }
      yield put({
        type: 'upFunnelData',
        payload: {
          groupList,
          entityList,
        },
      });
    },
    // 获取分页群详情数据
    *fetchTabPageGroup({ payload, isEntityId }, { call, put , select }) {
      let {  groupList, isEntityIdData } = yield select(_ => _['report/funneldetail']);
      let data;
      
      let ids = payload.groupList.map(g => g.id).join(',');
      
        data = yield ApiFp3.bizGroupQueryGroupCustomerNumAndUserNumGet({ ids, entityId: payload.entityId })
        if (data.resultBody) {
          groupList[`${payload.entityId}`].map((item,i)=>{
            if(JSON.parse(data.resultBody)[`${item.id}`]){
              item = { ...item, ...(JSON.parse(data.resultBody)[`${item.id}`]) }
              groupList[`${payload.entityId}`][i] = item;
            }
          })
          
        }
      yield put({
        type: 'upFunnelData',
        payload: {
          groupList
        },
      });
    },
    // 获取收藏列表
    *fetchMenuList({ payload }, { call, put }) {
      const { resultBody, success } = yield ApiFp4.bizCollectionMenuQueryCollectionMenuListGet();
      if (success) {
        yield put({
          type: 'upMenuList',
          payload: resultBody,
        })
      }
    },
    // 搜索当个漏斗详情
    *fetchFunnelaSearch({ payload, GROUPID, bizLifeTripInfoParam }, { call, put }) {
      console.log(payload);
      let data;
      if (GROUPID != undefined) {
        data = yield LifeFp.bizLifeTripFunnelDetailPost({
          bizLifeTripInfoParam,
          funnelId: payload,
          startDate: moment().format('YYYY-MM-DD'),
          endDate: moment().format('YYYY-MM-DD'),
        })
      }else {
        data = yield ApiFp.bizFunnelFunnelDetailPost({
          groupId: payload.groupId,
          funnelId: payload.funnelId,
          startDateStr: payload.startDateStr,
          endDateStr: payload.endDateStr,
        });
      }
      const { resultBody, success } = data;
      yield put({
        type: 'upFunnelData',
        payload: {
          funnelaDetailList: Object.prototype.toString.call(resultBody) == '[object String]' ? JSON.parse(resultBody) : resultBody,
        },
      });
    },
    // 查询用户群
    *fetchGetUser({ payload }, { call, put }) {
      const { resultBody, success } = yield ApiFp3.bizGroupListGet({
        entityId: payload,
        groupAuthorityType: 0,
        isAddReport: 1,
      });
      yield put({
        type: 'getGroupList',
        payload: {
          getGroupList: resultBody ? resultBody.filter((item) => {
            return [0, 1, 7, 8].indexOf(item.groupType) != -1
          }) : [],
          index: payload,
        },
      });

      yield put({
        type: 'fetchTabGroup',
        payload,
        isEntityId: true,
      })
    },
    // 设置回溯时间
    *fetchTraceData({ payload, callback }, { call, put, select }) {
      const { funnelaDetailList } = yield select(_ => _['report/funneldetail']);
      const { resultBody, success } = yield ApiFp.bizFunnelTraceBackPost({
        funnelId: payload.funnelId,
        backDate: payload.backDate,
      });
      if (success) {
        funnelaDetailList.traceBackStatus = 0;
        callback && callback();
        yield put({
          type: 'upFunnelData',
          payload: {
            funnelaDetailList,
          },
        });
      } else{
        notification.open({
          message: '提示',
          description: '接口错误',
          icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
        });
      }
    },
    // 编辑漏斗
    *fetchEditFnnel({ payload, callback }, { call, put, select }) {
      let { funnelaDetail } = yield select(_ => _['report/funneldetail']);
      const { resultBody, success } = yield ApiFp.bizFunnelUpdateFunnelByIdPost({
        funnelId: payload.funnelId,
        funnelName: payload.funnelName,
        funnelDesc: payload.funnelDesc,
      });
      if (success) {
        funnelaDetail.funnelName = payload.funnelName;
        funnelaDetail.funnelDesc = payload.funnelDesc;
        callback && callback()
        yield put({
          type: 'getFunnelaDetail',
          payload: {
            funnelaDetail,
          },
        })
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功':'操作失败',
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    },
    // 是否回溯
    *fetchIsTrace({ payload, callback }, { call, put, select }) {
      const { resultBody, success } = yield ApiFp.bizFunnelTraceBackIsFinishGet({
        funnelId: payload,
      });
      callback && callback(resultBody)
    },
    // 保存收藏
    *fetchSaveMenuList({ payload, callback }, { call, put, select }) {
      const { resultBody, success } = yield ApiFp5.bizCollectionDetailSaveCollectionDetailPost({
        bizCollectionDetailInfo: payload,
      });
      if (success) {
        callback && callback(resultBody)
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功':'操作失败',
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    },
  },

  reducers: {
    upFunnelData(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    // 更新收藏列表
    upMenuList(state, { payload }) {
      return {
        ...state,
        menuList: payload,
      }
    },
    getFunnelaDetail(state, { payload }) {
      return {
        ...state,
        funnelaDetail: payload.funnelaDetail,

      };
    },
    getGroupList(state, { payload }) {
      let { groupList } = state;
      groupList[`${payload.index  }`] = payload.getGroupList;
      return {
        ...state,
        groupList,
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
