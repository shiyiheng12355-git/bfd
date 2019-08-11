import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import { webAPICfg } from '../../../utils';
import { model } from '../../common';
import { message, notification } from 'antd';

const eventActionAPI = deepcreatorweb.EventactioncontrollerApiFp(webAPICfg);
const sceneAPI = deepcreatorweb.SmmarketingscenecontrollerApiFp(webAPICfg);
const EntityFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const CodeFp = deepcreatorweb.SminitdictionarycontrollerApiFp(webAPICfg);

export default modelExtend(model, {
  namespace: 'sysconfig/marketing/recommendation',
  state: {
    appKeys: [], // 所有客户端列表
    strategyTags: [], // 策略用tag
    recomContentEntityList: [], // 算法实例作用的实体列表
    behaviorParams: [], // 用户行为参数列表
  },
  effects: {
    *fetchAppKeys({ payload, callback }, { put }) {
      const { success, errorMsg, resultBody } = yield eventActionAPI.eventActionQuerySiteAvailableAppKeyListGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { appKeys: resultBody },
        });
        if (callback) callback();
      } else {
        notification.error({ message: '获取站点客户端失败', description: errorMsg })
      }
    },

    // 添加站点
    *addSite({ payload, callback }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneSaveSiteInfoPost({ bizSiteInfo: payload });
      if (success) {
        message.success('添加客户资源成功');
        if (callback) callback();
      } else {
        notification.error({ message: '添加客户资源失败', description: errorMsg })
      }
    },

    *editSite({ payload, callback }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneEditSiteInfoPut(payload);
      if (success) {
        message.success('更新站点成功');
        if (callback) callback();
      } else {
        notification.error({ message: '更新站点失败', description: errorMsg })
      }
    },

    *removeSite({ payload, callback }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneDelSiteInfoDelete(payload);
      if (success) {
        message.success('删除站点成功');
        if (callback) callback();
      } else {
        notification.error({ message: '删除站点失败', description: errorMsg })
      }
    },

    *removeAppKey({ payload, callback }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneDelAppKeyInfoDelete(payload);
      if (success) {
        message.success('删除客户端成功');
        if (callback) callback();
      } else {
        notification.error({ message: '删除客户端失败', description: errorMsg })
      }
    },

    // 添加栏位
    *addField({ payload, callback }, { put }) {
      const bizFieldInfo = payload;
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneSaveFieldInfoPost({ bizFieldInfo });
      if (success) {
        message.success('添加栏位成功');
        if (callback) callback();
      } else {
        notification.error({ message: '添加栏位失败', description: errorMsg })
      }
    },

    *editField({ payload, callback }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneEditFieldInfoPut(payload);
      if (success) {
        message.success('更新栏位成功');
        if (callback) callback();
      } else {
        notification.error({ message: '更新栏位失败', description: errorMsg })
      }
    },

    *removeField({ payload, callback }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneDelFieldInfoDelete(payload);
      if (success) {
        message.success('删除栏位成功');
        if (callback) callback();
      } else {
        notification.error({ message: '删除栏位失败', description: errorMsg })
      }
    },

    *fetchRecomContentEntityList({ payload, callback }, { put }) {
      const { success, resultBody, errorMsg } = yield EntityFp.smConfigEntityQueryConfigEntityListGet();
      if (success) {
        yield put({
          type: 'updateState',
          payload: { recomContentEntityList: resultBody.filter(item => item.isRecommendContent === 1) },
        });
        if (callback) callback();
      } else {
        notification.error({ message: '查询失败', description: errorMsg })
      }
    },

    // 根据分类查询编码值
    *fetchCodeByCategoryCode({ payload, callback }, { put }) {
      const { success, resultBody, errorMsg } = yield CodeFp.smInitDictionaryQueryCodeByCategoryCodeGet(payload);
      if (success) {
        callback(null, resultBody);
      //   yield put({
      //     type: 'updateState',
      //     payload: { behaviorParams: resultBody },
      //   })
      } else {
        notification.error({ message: '查询失败', description: errorMsg })
      }
    },

    // 策略模板，输入规则验证
    *debugRule({ payload }, { put }) {
      const { success, resultBody, errorMsg } = yield sceneAPI.smMarketingSceneSceneConfigurationDebugGet(payload)
      if (success) {
        notification.success({ message: '调试策略模板规则成功', description: resultBody })
      } else {
        notification.error({ message: '调试策略模板规则失败', description: errorMsg })
      }
    },

    *removeAlgorithmTemplate({ payload }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneDelBizPerRecomAlgorithmTemplateIdDelete(payload)
      if (success) {
        message.success('删除算法模板成功')
        yield put({
          type: 'fetchAlgorithmTemplate',
          payload: {},
        })
      } else {
        notification.error({ message: '删除算法模板失败', description: errorMsg })
      }
    },

    *removeStrategyTemplate({ payload }, { put }) {
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneDelStrategyTemplateIdDelete(payload)
      if (success) {
        message.success('删除策略模板成功')
        yield put({
          type: 'fetchTemplateList',
          payload: {},
        })
      } else {
        notification.error({ message: '删除策略模板失败', description: errorMsg })
      }
    },
  },
})