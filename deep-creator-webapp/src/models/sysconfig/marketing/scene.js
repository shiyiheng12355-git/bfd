import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import { message, notification } from 'antd';
import { webAPICfg } from '../../../utils';
import { model } from '../../common';

const LifeFp = deepcreatorweb.BizlifetripcontrollerApiFp(webAPICfg);

export default modelExtend(model, {
  namespace: 'sysconfig/marketing/scene',
  state: {
    lifeNodes: [],
  },
  effects: {
    *fetchLifeNodes({ payload }, { put }) {
      const { success, resultBody: { list } } = yield LifeFp.bizLifeTripQueryBizLifeTripInfoByPageGet({ pageNum: 1, pageSize: 1000 })
      if (success) {
        yield put({
          type: 'updateState',
          payload: { lifeNodes: list },
        })
      }
    },

    *addLifeNode({ payload, callback }, { put }) {
      const bizLifeTripInfo = payload;
      const { success, errorMsg } = yield LifeFp.bizLifeTripAddPost({ bizLifeTripInfo })
      if (success) {
        if (callback) callback(null);
        message.success('添加生命旅程节点成功');
      } else {
        notification.error({ message: '添加生命旅程节点失败', description: errorMsg })
      }
    },
    *updateLifeNode({ payload, callback }, { put }) {
      const bizLifeTripInfo = payload;
      const { success, errorMsg } = yield LifeFp.bizLifeTripUpdatePut({ bizLifeTripInfo })
      if (success) {
        if (callback) callback(null);
        message.success('修改生命旅程节点成功');
      } else {
        notification.error({ message: '修改生命旅程节点失败', description: errorMsg })
      }
    },
    *delLifeNode({ payload, callback }, { put }) {
      const { success, errorMsg } = yield LifeFp.bizLifeTripDelByIdIdDelete({ ...payload });
      if (success) {
        if (callback) callback(null);
        message.success('删除成功');
      } else {
        notification.error({ message: '删除失败', description: errorMsg })
      }
    },
    *saveSortIndex({ payload, callback }, { put }) {//bizLifeTrip/saveSortIndex
      const { success, errorMsg } = yield  LifeFp.bizLifeTripSaveSortIndexPost({ ...payload });
      if (success) {
        if (callback) callback(null);
        message.success('操作成功');
      } else {
        notification.error({ message: '操作失败', description: errorMsg })
      }
    }
    
  },
})