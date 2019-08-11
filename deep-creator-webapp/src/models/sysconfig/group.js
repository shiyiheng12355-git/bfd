import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';

const GlobalConfigApiFp = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg);
const SmConfigEntityApiFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const SmGroupManageApiFp = deepcreatorweb.SmgroupmanagementcontrollerApiFp(webAPICfg);
export default {
  namespace: 'sysconfig/group',

  state: {
    entityList: [], // 实体列表
    idPullList: [], // 个体是否ID拉通区别展示
    idAndPropertyList: [], // 选中ID或属性可见
    groupInfo: {}, // 默认要展示的id,群组创建数量,TGI显示个数,已选标签维度, 选中ID或属性可见
  },

  effects: {
    *getEntityList({ payload }, { call, put }) {
      const { callback } = payload;
      let entityList = [];
      const response = yield call(SmConfigEntityApiFp.smConfigEntityQueryConfigEntityListGet);

      if (response.success) {
        entityList = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { entityList },
        })
        if (callback) callback(entityList);
      }
    },

    *fetchInitData({ payload }, { call, put, select }) {
      const { entityId, callback } = payload;

      let [idPullList, propertyList, idAndPropertyList, groupInfo] = [[], [], [], {}];
      const idResponse = yield call(GlobalConfigApiFp.globalConfigurationQueryInitColumnListGet, { entityId, configType: 1 });
      const propertyResponse = yield call(GlobalConfigApiFp.globalConfigurationQueryInitColumnListGet, { entityId, configType: 2 });
      const groupInfoResponse = yield call(SmGroupManageApiFp.smGroupManagementQueryGroupConfigInfoGet, { entityId })

      if (idResponse.success) {
        idPullList = idResponse.resultBody || [];
      }
      if (propertyResponse.success) {
        propertyList = propertyResponse.resultBody || [];
      }
      if (groupInfoResponse) {
        groupInfo = groupInfoResponse.resultBody || {};
      }
      idAndPropertyList = idPullList.concat(propertyList)

      yield put({
        type: 'updateState',
        payload: {
          idPullList,
          idAndPropertyList,
          groupInfo,
        },
      })
      if (callback) callback();
    },


    *getGroupInfo({ payload }, { call, put, select }) {
      const { entityId } = payload;
      let groupInfo = {};
      const response = yield call(SmGroupManageApiFp.smGroupManagementQueryGroupConfigInfoGet, { entityId })
      if (response.success) {
        groupInfo = response.resultBody;
        yield put({
          type: 'updateState',
          payload: { groupInfo },
        })
      }
    },


    *saveGroupInfo({ payload }, { call, put, select }) {
      const { smGroupManagementInfo } = payload;
      const response = yield SmGroupManageApiFp.smGroupManagementSaveGroupManagementPost({ smGroupManagementInfo });
      if (response.success) {
        message.success('保存成功');
      }
    },

  },

  reducers: {
    updateState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
