import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import Q from 'bluebird';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';
import { model } from '../common';

const StrategyFp = deepcreatorweb.BizstrategymarketingcontrollerApiFp(webAPICfg);
const GroupFp = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg);
const EntityFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const PerRecomFp = deepcreatorweb.BizperrecomcontrollerApiFp(webAPICfg);
const MarketingForReco = deepcreatorweb.BizstrategymarketingforreccontrollerApiFp(webAPICfg);

export default modelExtend(model, {
  namespace: 'marketing/strategy',

  state: {
    data: {
      list: [],
      query: {},
      pagination: { pageNum: 1, pageSize: 10 },
    },
    entityList: [], // 实体列表携带群组列表信息
    pushMembers: [], // 带推送的邮件组
    ruleList: [], // 推荐规则列表
    groupColumns: [], // 群组的列
    recomList: [], // 推荐名单
    entityId: null, // 只用于群主分页
  },

  effects: {
    *fetch({ payload }, { put, select }) {
      let { data: { pagination } } = yield select(_ => _['marketing/strategy']);
      const { resultBody, success, errorMsg } = yield StrategyFp.bizStrategyMarketingPageGet(pagination);
      if (success) {
        const list = resultBody.list.map((item) => {
          item.matchType = item.toGroupId === 0 && item.toRuleId ? '规则匹配' : '手动匹配'
          item.key = item.id; return item;
        });
        pagination = { ...pagination, total: resultBody.total };
        yield put({
          type: 'save',
          payload: { list, pagination },
        });
      } else {
        notification.error({ message: '查询失败', description: errorMsg })
      }
    },
    *add({ payload, callback }, { call, put }) {
      const { success, errorMsg } = yield StrategyFp.bizStrategyMarketingAddPost({ param: payload })
      if (success) {
        message.success('添加成功');
        if (callback) callback(null);
      } else {
        if (callback) callback('error');
        notification.error({ message: '添加失败', description: errorMsg })
      }
    },

    *remove({ payload: { id } }, { put }) {
      const { success, resultBody } = yield StrategyFp.bizStrategyMarketingDelIdDelete({ id });
      if (success) {
        yield put(
          {
            type: 'fetch',
            payload: {},
          }
        )
      }
    },

    *update({ payload, callback }, { put }) {
      const { success, errorMsg } = yield StrategyFp.bizStrategyMarketingUpdatePut({ param: payload });
      if (success) {
        message.success('更新成功')
        if (callback) callback(null);
      } else {
        if (callback) callback('error');
        notification.error({ message: '更新失败', description: errorMsg })
      }
    },

    *pushStrategy({ payload, callback }, { put }) {
      const demo = {
        mail: '',
        mailGroup: '',
        object: '',
        rec: 0,
        stratetyId: '',
      }

      const param = { ...demo, ...payload };

      const { success, errorMsg } = yield StrategyFp.bizStrategyMarketingPushPost({ pushObject: param });
      if (success) {
        message.success('已推送(对方稍后即会收到)');
        callback(null)
      } else {
        notification.error({ message: '推送失败', description: errorMsg })
      }
    },

    *download({ payload }, { put }) {
      const { success, errorMsg } = yield StrategyFp.bizStrategyMarketingDownloadIdGet(payload)
      if (success) {
        message.success('申请下载成功')
      } else {
        notification.error({ message: '申请下载失败', description: errorMsg })
      }
    },
    // 获取实体和实体群组列表
    *fetchEntityGroups({ payload }, { put }) {
      const r1 = yield EntityFp.smConfigEntityQueryConfigEntityListGet(); // 查询实体
      if (r1.success) {
        const entityList = yield Q.all(r1.resultBody.map((entity) => {
          return GroupFp.bizGroupListGet({ entityId: entity.id, isAddReport: 2, groupAuthorityType: 0 })
            .then((r) => { entity.groups = r.resultBody || []; return entity; });
        }));
        yield put({
          type: 'saveEntityList',
          payload: entityList,
        });
      }
    },

    *fetchPushMembers(_, { put }) {
      const { success, resultBody } = yield StrategyFp.bizStrategyMarketingGetPushGet();
      if (success) {
        yield put({
          type: 'savePushMembers',
          payload: resultBody,
        });
      }
    },

    // 获取群组覆盖数
    *fetchGroupNum({ payload, callback }, { put }) {
      let { ids, entityId } = payload;
      ids = ids.split(',')
      let response;
      for (let i = 0, len = ids.length; i < len; i++) {
        response = yield GroupFp.bizGroupQueryGroupCustomerNumAndUserNumGet({ ids: ids[i], entityId })
        if (response.success) {
          callback && callback(null, JSON.parse(response.resultBody))
        } else {
          notification.error({ message: '获取失败' })
        }
      }
      // const { success, resultBody } = yield GroupFp.bizGroupQueryGroupCustomerNumAndUserNumGet(payload)
      // if (success) {
      //   callback && callback(null, JSON.parse(resultBody))
      // } else {
      //   notification.error({ message: '获取失败' })
      // }
    },

    // 获取推荐规则列表
    *fetchRuleList({ payload }, { put }) {
      const { success, resultBody } = yield PerRecomFp.bizPerRecomRuleListGet();
      if (success) {
        yield put({
          type: 'updateState',
          payload: { ruleList: resultBody },
        });
      } else {
        notification.error({ message: '获取规则列表失败' })
      }
    },

    // 生成推荐名单
    *fetchRecomList({ payload }, { put }) {
      const rec = payload;
      const { success, resultBody } = yield StrategyFp.bizStrategyMarketingRecPost({ rec });
      if (success) {
        yield put({
          type: 'updateState',
          payload: { recomList: resultBody },
        });
      } else {
        notification.error({ message: '获取推荐名单失败' })
      }
    },

    // 获取群组的主键
    *fetchGroupColumns({ payload, callback }, { put }) { // TODO
      const { success, resultBody, errorMsg } = yield StrategyFp.bizStrategyMarketingGetColumnsGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { groupColumns: resultBody },
        });
        if (callback) callback(resultBody)
      } else {
        notification.error({ message: '获取推荐名单失败,请尝试其他推荐方式', description: errorMsg })
      }
    },
    // 推送检查
    *pushCheck({ payload, callback }, { put }) {
      const { success, errorMsg, resultBody } = yield MarketingForReco.bizStrategyMarketingForRecIsExistGet(payload)
      if (success) {
        callback(null, resultBody)
      } else {
        notification.error({ message: '查询规则推送状态失败', description: errorMsg })
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },

    saveGlobalGroup(state, { payload }) {
      return {
        ...state,
        globalGroups: payload,
      }
    },

    saveEntityList(state, { payload }) {
      return {
        ...state,
        entityList: payload,
      }
    },

    savePushMembers(state, { payload }) {
      return {
        ...state,
        pushMembers: payload,
      }
    },
  },
});