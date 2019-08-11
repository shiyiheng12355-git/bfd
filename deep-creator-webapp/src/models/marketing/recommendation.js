import { deepcreatorweb } from 'deep-creator-sdk';
import moment from 'moment';
import Q from 'bluebird';
import { message, notification } from 'antd';
import _ from 'lodash';
import { removeRule, addRule } from '../../services/api';
import { webAPICfg } from '../../utils';


const today = moment().format('YYYY-MM-DD');
const last6Day = moment().subtract(6, 'days').format('YYYY-MM-DD');
const yestoday = moment().subtract(1, 'days').format('YYYY-MM-DD');
const lastYear = moment().subtract(1, 'years').format('YYYY-MM-DD');
const PerRecomFp = deepcreatorweb.BizperrecomcontrollerApiFp(webAPICfg);
const EntityFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const GlobalCfgFp = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg);
const CodeFp = deepcreatorweb.SminitdictionarycontrollerApiFp(webAPICfg);
const PolicyFp = deepcreatorweb.BizrecompolicycontrollerApiFp(webAPICfg);
const TagValue = deepcreatorweb.BiztagvaluecontrollerApiFp(webAPICfg);
const AlgorithmAPI = deepcreatorweb.BizperrecomalgorithmcontrollerApiFp(webAPICfg);
const SceneAPI = deepcreatorweb.SmmarketingscenecontrollerApiFp(webAPICfg);
const MarketingForReco = deepcreatorweb.BizstrategymarketingforreccontrollerApiFp(webAPICfg);

export default {
  namespace: 'marketing/recommendation',
  state: {
    query: {
      startTime: last6Day,
      endTime: today,
      dataIndex: 'show_pv,click_pv,order_num,item_total,item_day,item_new',
      siteId: undefined,
      appKey: undefined,
      fieldId: undefined,
    },
    data: {
      list: [],
      pagination: { pageNum: 1, pageSize: 10 },
    },
    appKeyList: [], // 客户端列表
    fieldList: [], // 栏位列表
    currentTrend: [], // 当前被查看的趋势图
    currentRecom: null, // 当前的自动化推荐信息
    productEntityList: [], // 产品实例列表
    currentRecomCfg: null, // 当前的自动化推荐详细配置信息
    paramSources: {}, // 策略模板源
    userEntityList: [], // 用户实例列表
    entityTags: [], // 实体标签
    recContentEntityList: [], // 推荐内容实体列表
  },

  effects: {
    *fetch({ payload }, { put, select }) {
      let _query = payload.query;
      let _pagination = payload.pagination;

      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const { data: { pagination }, query } = yield select(_ => _['marketing/recommendation']);
      _query = { ...query, ..._query };
      _pagination = { ...pagination, ..._pagination };
      const params = {
        ..._pagination,
        ..._query,
      };
      // 参数去掉空
      const { success, errorMsg, resultBody } = yield PerRecomFp.bizPerRecomPageGet(_.pickBy(params, e => !!e));
      if (success) {
        const _list = resultBody.list || []; // 接口居然返回null,无语

        const formatList = _list.map((item, index) => {
          const preItem = _list[index - 1];
          if (preItem) { // 将客户资源，客户端，栏位的相邻同名列进行合并
            if (preItem.siteId === item.siteId
              && preItem.appKey === item.appKey
              && preItem.fieldId === item.fieldId) {
              delete item.siteName;
              delete item.appKeyName;
              delete item.fieldName
            }
          }
          return item;
        })
        _pagination = { ..._pagination, total: resultBody.total }
        yield put({
          type: 'save',
          payload: { list: formatList, pagination: _pagination },
        });
      } else {
        notification.error({ message: '查询失败', description: errorMsg })
      }

      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },

    *fetchByFieldId({ payload, callback }, { put }) {
      const { success, resultBody } = yield PerRecomFp.bizPerRecomFindByFieldIdGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { currentRecom: resultBody },
        })
        if (callback) callback(null, resultBody);
      }
    },

    *add({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });

      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });

      if (callback) callback();
    },

    // 查询趋势
    *fetchTrend({ payload, callback }, { call, put }) {
      const { success, resultBody, errorMsg } = yield PerRecomFp.bizPerRecomTrendsGet(payload);
      if (success) {
        const data = resultBody ? JSON.parse(resultBody) : {}
        yield put({
          type: 'updateState',
          payload: { currentTrend: data },
        })
      } else {
        notification.error({ message: '查询趋势失败', description: errorMsg })
      }
    },

    // 查询产品实例
    *fetchProductEntityList({ payload }, { put }) {
      const { success, resultBody } = yield EntityFp.smConfigEntityQueryConfigEntityListGet();
      if (success) {
        let productEntityList = resultBody.filter(item => item.entityCategory === 1);
        productEntityList = yield Q.all(productEntityList.map((entity) => {
          return GlobalCfgFp.globalConfigurationQueryCurrentEntityInitListGet({ entityId: entity.id })
            .then((r) => { entity.columns = r.resultBody || []; return entity; })
        }))
        yield put({
          type: 'updateState',
          payload: { productEntityList },
        })
      }
    },


    // 查询推荐内容实体
    *fetchRecContentEntityList({ payload }, { put }) {
      const { success, resultBody } = yield EntityFp.smConfigEntityQueryRecommendContentEntityListGet();
      if (success) {
        let recContentEntityList = resultBody || [];
        recContentEntityList = yield Q.all(recContentEntityList.map((entity) => {
          return GlobalCfgFp.globalConfigurationQueryCurrentEntityInitListGet({ entityId: entity.id })
            .then((r) => { entity.columns = r.resultBody || []; return entity; })
        }))
        yield put({
          type: 'updateState',
          payload: { recContentEntityList },
        })
      }
    },

    // 获取优先推荐列表
    * fetchPriorityRecmdList({ payload }, { put }) {
      const { success, resultBody } = yield MarketingForReco.bizStrategyMarketingForRecQueryForRecGet(payload);
      if (success) {
        const priorityRecmdList = (resultBody || []).map((item) => {
          item.matchType = item.toGroupId === 0 && item.toRuleId ? '规则匹配' : '手动匹配';
          return item;
        })
        yield put({
          type: 'updateState',
          payload: { priorityRecmdList },
        })
      }
    },


    // 查询实体标签体系
    *fetchEntityTags({ payload }, { put }) {
      const { success, resultBody, errorMsg } = yield SceneAPI.smMarketingSceneFilterStrategyTagGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { entityTags: resultBody || [] },
        })
      } else {
        notification.error({ message: '获取标签体系失败', description: errorMsg })
      }
    },

    // 根据标签名获取标签值
    *fetchTagValue({ payload, callback }, { put }) {
      const { success, resultBody, errorMsg } = yield TagValue.bizTagValueTagValueListExceptCoverGet(payload)
      if (success) {
        callback(null, resultBody)
      } else {
        callback(errorMsg)
      }
    },

    // 查询用户实体列表
    *fetchUserEntityList({ payload }, { put }) {
      const { success, resultBody } = yield EntityFp.smConfigEntityQueryConfigEntityListGet();
      if (success) {
        let userEntityList = resultBody.filter(item => item.entityCategory === 0);
        yield put({
          type: 'updateState',
          payload: { userEntityList },
        })
      }
    },

    // 保存个性化推荐策略 栏位规则名称优先推荐的配置接口
    *savePolicy({ payload, callback }, { put }) {
      const bizRecRuleParam = payload;
      const { success, errorMsg } = yield PerRecomFp.bizPerRecomSaveRecContextPost({ bizRecRuleParam });
      if (success) {
        callback && callback()
        message.success('保存成功');
      } else {
        notification.error({ message: '保存失败', description: errorMsg })
      }
    },

    // 执行个性化推荐策略
    *execPolicy({ payload, callback }, { put }) {
      const policyReq = payload;
      const { success, errorMsg } = yield PerRecomFp.bizPerRecomSavePolicyPost({ policyReq });
      if (success) {
        message.success('立即执行成功');
        if (callback) callback()
      } else {
        notification.error({ message: '立即执行失败', description: errorMsg })
      }
    },

    // 批量保存策略分支
    *savePolicys({ payload, callback }, { put }) {
      const recPolicyParam = payload;
      const { success, resultBody, errorMsg } = yield PolicyFp.bizRecomPolicySavePost({ recPolicyParam });
      if (success) {
        message.success('保存成功');
        if (callback) callback(null, resultBody);
      } else {
        notification.error({ message: '保存失败', description: errorMsg })
      }
    },

    // 查询个性化推荐配置信息
    *fetchCurrentRecomCfg({ payload, callback }, { put }) {
      const { success, resultBody } = yield PerRecomFp.bizPerRecomFindByFieldIdGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { currentRecomCfg: resultBody },
        })
        if (callback) callback(null, resultBody)
      }
    },


    *updateRecomPolicy({ payload, callback }, { put }) {
      const bizRecomPolicyPO = payload;
      const { success } = yield PolicyFp.bizRecomPolicyUpdatePut({ bizRecomPolicyPO })
      if (success) {
        message.success('更新成功');
        if (callback) callback(null);
      }
    },

    *fetchEntityList({ payload }, { put }) {
      const { success, resultBody } = yield EntityFp.smConfigEntityQueryConfigEntityListGet();
      if (success) {
        yield put({
          type: 'updateState',
          payload: { entityList: resultBody },
        })
      }
    },

    // 查询策略模板的源
    *fetchParamSource({ payload }, { put, select }) {
      let response;
      const { paramSources } = yield select(_ => _['marketing/recommendation'])
      switch (payload.key) {
        case 'USER_BEHAVIOR_PARAM': { // 用户行为参数配置
          const { success, resultBody } = yield CodeFp.smInitDictionaryQueryCodeByCategoryCodeGet({ categoryCode: 'USER_BEHAVIOR_PARAM' })
          if (success) {
            response = resultBody.map((i) => {
              return { key: i.dictionaryCode, label: i.dictionaryLabel }
            })
          }
          break;
        }
        case 'ALGORITHM_INSTANCE': { // 算法实例列表hm
          const { success, resultBody } = yield AlgorithmAPI.bizPerRecomAlgorithmQueryRecomAlgorithmListGet();
          if (success) {
            response = resultBody.map((i) => {
              return {
                key: i.algorithmName,
                label: i.algorithmName,
              }
            });
          }
          break;
        }
        case 'RECOM_ID_ATTRIBUTE': { // 推荐内容ID及属性列表
          const { entityId } = payload;
          const { success, resultBody } = yield GlobalCfgFp.globalConfigurationQueryInitColumnListGet({ entityId });
          if (success) {
            response = resultBody.map((i) => { return { key: i.columnName, label: i.columnTitle } })
          }
          break;
        }
        default:
          break;
      }
      yield put({
        type: 'updateParamSources',
        payload: { [payload.key]: response },
      })
    },

    *fetchAppKeys({ payload, callback }, { put }) {
      const { success, resultBody } = yield SceneAPI.smMarketingSceneQueryCurrentUserAppKeyGet(payload);
      if (success) {
        const appNodes = resultBody.map((app) => {
          const node = app;
          node.name = app.appKeyName;
          node.id = app.appKey;
          node.key = `app_${app.appKey}`;
          node.type = 'APP_KEY';
          node.pid = app.siteId;
          return node;
        });
        if (callback) callback(appNodes);
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
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    updateQuery(state, { payload }) {
      return {
        ...state,
        query: { ...state.query, ...payload },
      }
    },

    updatePagination(state, { payload }) {
      const { data } = state;
      return {
        ...state,
        data: { ...data, pagination: { ...data.pagination, ...payload } },
      }
    },

    updateParamSources(state, { payload }) {
      const { paramSources } = state;
      return {
        ...state,
        paramSources: { ...paramSources, ...payload },
      }
    },
  },
};
