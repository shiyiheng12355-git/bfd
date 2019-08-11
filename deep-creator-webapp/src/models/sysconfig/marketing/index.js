import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import _ from 'lodash';
import { message, notification } from 'antd';
import Q from 'bluebird';
import { webAPICfg } from '../../../utils';
import strategy from './strategy';
import automation from './automation';
import recommendation from './recommendation';
import scene from './scene';

const sceneAPI = deepcreatorweb.SmmarketingscenecontrollerApiFp(webAPICfg);
const algorithmAPI = deepcreatorweb.BizperrecomalgorithmcontrollerApiFp(webAPICfg);
// const siteAPI = deepcreatorweb.BizsiteinfocontrollerApiFp(webAPICfg);

export default modelExtend(strategy, automation, recommendation, scene, {
  namespace: 'sysconfig/marketing',

  state: {
    siteNodes: [], // 站点、栏位、客户端混排列表
    sceneCfg: {
      createUpperLimit: 0,
      nodeUpperLimit: 0,
    },
    siteList: [], // 个性化推荐 站点列表
    priorityRecmdList: [], // 优先推荐项列表
    algorithmList: [], // 算法实例列表,
    algorithmTemplateList: [], // 算法模板列表
  },

  effects: {
    // 获取所有站点
    *fetchSites({ payload }, { put, select }) {
      const { success, resultBody } = yield sceneAPI.smMarketingSceneGetSiteInfoGet(payload);

      if (success) {
        const siteNodes = resultBody.map((site) => {
          const node = site;
          node.name = site.siteName;
          node.id = site.siteId;
          node.key = `site_${site.siteId}`;
          node.type = 'SITE';
          return node;
        });

        yield put({
          type: 'updateState',
          payload: {
            siteNodes,
            siteList: resultBody.map((site) => {
              site.key = site.siteId;
              return site;
            }),
          },
        });
      }
    },

    // 获取站点下的客户端列表
    *fetchSiteApps({ payload, callback }, { put, select }) {
      const { success, resultBody } = yield sceneAPI.smMarketingSceneGetAppKeyGet(payload);
      try {
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
      } catch (e) {
        console.log(e, 'error');
      }
    },

    // 获取客户端下栏位列表
    *fetchAppFields({ payload, callback }, { put }) {
      const { success, resultBody } = yield sceneAPI.smMarketingSceneQueryFieldByAppKeyGet(payload);
      if (success) {
        const fieldsNodes = resultBody.map((field) => {
          const node = field;
          node.id = field.fieldId;
          node.name = field.fieldName;
          node.key = `field_${field.fieldId}`;
          node.type = 'FIELD';
          node.isLeaf = true;
          return node;
        });

        if (callback) callback(fieldsNodes);
      }
    },

    *fetchSiteAppKeys({ payload, callback }, { put, select }) {
      const { siteList } = yield select(state => state['sysconfig/marketing']);
      const { success, errorMsg, resultBody } = yield sceneAPI.smMarketingSceneGetAppKeyGet(payload);
      if (success) {
        const index = _.findIndex(siteList, item => item.siteId === payload.siteId)
        let site = siteList[index];
        site = { ...site, appKeys: resultBody };
        siteList.splice(index, 1, site);
        yield put({
          type: 'updateState',
          payload: { siteList: siteList.slice(0) },
        });
        if (callback) callback();
      } else {
        notification.error({ message: '更新站点失败', description: errorMsg });
      }
    },

    // 个性化推荐，算法实例列表
    *fetchPerRecomAlgorithm({ payload }, { put }) {
      const { success, resultBody } = yield algorithmAPI.bizPerRecomAlgorithmQueryRecomAlgorithmListGet();
      if (success) {
        yield put({
          type: 'updateState',
          payload: { algorithmList: resultBody },
        });
      }
    },

    // 个性化推荐，添加算法实例
    *addPerRecomAlgorithm({ payload, callback }, { put, select }) {
      const bizPerRecomAlgorithmInfo = payload;
      const { success, errorMsg } = yield algorithmAPI.bizPerRecomAlgorithmSavePerRecomAlgorithmPost({ bizPerRecomAlgorithmInfo });
      if (success) {
        message.success('添加算法实例成功');
        if (callback) callback();
      } else {
        notification.error({ message: '添加算法实例失败', description: errorMsg })
      }
    },

    // 个性化推荐，编辑算法实例
    *editPerRecomAlgorithm({ payload, callback }, { put }) {
      const bizPerRecomAlgorithmInfo = payload;
      const { success, errorMsg } = yield algorithmAPI.bizPerRecomAlgorithmSavePerRecomAlgorithmPost({ bizPerRecomAlgorithmInfo });
      if (success) {
        message.success('编辑算法实例成功');
        if (callback) callback();
      } else {
        notification.error({ message: '编辑算法实例失败', description: errorMsg })
      }
    },

    // 个性化推荐，删除算法实例
    *removePerRecomAlgorithm({ payload }, { put, select }) {
      const { success, errorMsg } = yield algorithmAPI.bizPerRecomAlgorithmDelIdDelete(payload);
      if (success) {
        yield put({
          type: 'fetchPerRecomAlgorithm',
          payload: {},
        })
        message.success('删除成功');
      } else {
        notification.error({ message: '删除失败', description: errorMsg })
      }
    },

    // 个性化推荐,算法模板列表
    *fetchAlgorithmTemplate({ payload }, { put, select }) {
      const { success, resultBody } = yield sceneAPI.smMarketingSceneBizPerRecomAlgorithmTemplateListGet();
      if (success) {
        yield put({
          type: 'updateState',
          payload: { algorithmTemplateList: resultBody },
        })
      }
    },

    // 获取优先推荐列表
    * fetchPriorityRecmdList({ payload }, { put }) {
      const { success, resultBody } = yield sceneAPI.smMarketingSceneQueryRecommendGet();
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

    // 删除优先推荐推荐项
    * removePriorityRecmdItems({ payload = [] }, { put }) {
      const itemIds = payload.map(item => item.id);
      const deleteItems = itemIds.map((id) => {
        return sceneAPI.smMarketingSceneDelByRecommendIdIdDelete({ id })
        .then((success, errorMsg) => {
          if (success) {
            return true;
          } else {
            throw new Error(errorMsg)
          }
        })
      })
      yield Q.all(deleteItems).then(() => {
        message.success('删除优先推荐项目成功');
        put({
          type: 'fetchPriorityRecmdList',
          payload: {},
        })
      }).catch((err) => {
        notification.error({ message: '删除部分优先推荐项目失败' })
        put({
          type: 'fetchPriorityRecmdList',
          payload: {},
        })
      })
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
});
