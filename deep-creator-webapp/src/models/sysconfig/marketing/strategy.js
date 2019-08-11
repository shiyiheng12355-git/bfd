import { deepcreatorweb } from 'deep-creator-sdk';
import Q from 'bluebird';
import { message, notification } from 'antd';

import { webAPICfg } from '../../../utils';

const sceneAPI = deepcreatorweb.SmmarketingscenecontrollerApiFp(webAPICfg);
const EntityFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const TagFp = deepcreatorweb.BiztagcategorycontrollerApiFp(webAPICfg);

export default {
  namespace: 'sysconfig/marketing/strategy',

  state: {
    templateList: [], // 营销策略模板列表
    entityList: [], // 实体列表，附带标签体系信息
    entityStrategyTags: [], // 实体列表，带策略用标签
    entityListNoTags: [], // 实体列表
  },

  effects: {
    // 个性化推荐，策略模板列表
    *fetchTemplateList({ payload }, { put, select }) {
      const { success, resultBody } = yield sceneAPI.smMarketingSceneQuerySceneConfigurationGet();
      if (success) {
        yield put({
          type: 'updateState',
          payload: { templateList: resultBody },
        })
      }
    },

    *addTemplate({ payload, callback }, { put }) {
      const bizPerRecomStrategyTemplateInfo = payload;
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneAddStrategyTemplatePost({ bizPerRecomStrategyTemplateInfo });
      if (success) {
        message.success('添加成功');
        if (callback) callback();
      } else {
        notification.error({ message: '添加失败', description: errorMsg });
      }
    },

    *editTemplate({ payload, callback }, { put }) {
      const bizPerRecomStrategyTemplateEditInfo = payload;

      const { success, errorMsg } = yield sceneAPI.smMarketingSceneEditStrategyTemplatePut({ bizPerRecomStrategyTemplateEditInfo });
      if (success) {
        message.success('编辑成功');
        if (callback) callback();
      } else {
        notification.error({ message: '编辑失败', description: errorMsg });
      }
    },

    // 查询实例列表,带标签
    *fetchEntityTags({ payload, callback }, { call, put }) {
      const r1 = yield EntityFp.smConfigEntityQueryConfigEntityListGet();
      if (r1.success) {
        yield put({
          type: 'saveEntityList',
          payload: r1.resultBody,
        });
        const entityList = yield Q.all(r1.resultBody.map((entity) => {
          return TagFp.bizTagCategoryTagCategoryAndTagNameListGet({ entityId: entity.id })
            .then((r) => {
              entity.tags = (r.resultBody || []).map((item) => {
                return item;
              });
              return entity;
            })
        }));
        yield put({
          type: 'updateState',
          payload: { entityList },
        });
      }
    },

    // 查询策略用标签名列表，分实体
    *fetchEntityStrategyTag({ payload, callback }, { put }) {
      const r1 = yield EntityFp.smConfigEntityQueryConfigEntityListGet();
      if (r1.success) {
        const entityStrategyTags = yield Q.all(r1.resultBody.map((entity) => {
          return sceneAPI.smMarketingSceneQueryStrategyTagGet({ entityId: entity.id })
            .then((r) => {
              entity.strategyTags = r.resultBody && r.resultBody.length ?
                r.resultBody[0].configValue.split(',') : [];
              return entity;
            })
        }));
        yield put({
          type: 'updateState',
          payload: { entityStrategyTags },
        });
      }
    },

    // 保存策略用标签
    *saveStrategyTag({ payload, callback }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneSaveStrategyTagPost(payload);
      if (success) {
        message.success('保存成功');
        if (callback) callback(null);
      } else {
        notification.error({ message: '保存失败', description: errorMsg });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    saveEntityList(state, { payload }) {
      return {
        ...state,
        entityListNoTags: payload,
      }
    },
  },
};
