import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import { webAPICfg } from '../../../utils';
import { model } from '../../common';
import { message, notification } from 'antd';

const sceneAPI = deepcreatorweb.SmmarketingscenecontrollerApiFp(webAPICfg);
const CREATE_LIMIT = 'MARKETINGCONFIG_CREATE_DECISIONTREE_UPPER_LIMIT';
const NODE_LIMIT = 'MARKETINGCONFIG_DECISIONTREE_NODE_UPPER_LIMIT'

export default modelExtend(model, {
  namespace: 'sysconfig/marketing/automation',
  state: {

  },
  effects: {
    *fetchSceneCfg({ payload }, { put }) {
      const { success, resultBody, errorMsg } = yield sceneAPI.smMarketingSceneQueryMarketingSceneInfoGet({ categorySign: '' });
      if (success) {
        const cfg1 = resultBody.find(item => item.configKey === CREATE_LIMIT);
        const cfg2 = resultBody.find(item => item.configKey === NODE_LIMIT);
        const createUpperLimit = cfg1 ? parseInt(cfg1.configValue, 10) : 0;
        const nodeUpperLimit = cfg2 ? parseInt(cfg2.configValue, 10) : 0;
        yield put({
          type: 'updateState',
          payload: { sceneCfg: { createUpperLimit, nodeUpperLimit } },
        })
      } else {
        notification.error({ message: '获取配置失败', description: errorMsg });
      }
    },

    *updateSceneCfg({ payload }, { put }) {
      const smConfigKvInfo = [{
        configKey: CREATE_LIMIT,
        configValue: payload.createUpperLimit,
      }, {
        configKey: NODE_LIMIT,
        configValue: payload.nodeUpperLimit,
      }]
      const { success, errorMsg } = yield sceneAPI.smMarketingSceneSaveMarketingScenePost({ smConfigKvInfo });
      if (success) {
        yield put({
          type: 'fetchSceneCfg',
          payload: {},
        })
        message.success('保存成功');
      } else {
        notification.error({ message: '保存失败', description: errorMsg });
      }
    },
  },
})