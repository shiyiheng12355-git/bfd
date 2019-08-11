import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import { model } from '../common';
import { webAPICfg } from '../../utils';

const GlobalConfigApiFp = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg);
const SmConfigEntityApiFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const SmGroupManageApiFp = deepcreatorweb.SmgroupmanagementcontrollerApiFp(webAPICfg);
const BizMicroApiFp = deepcreatorweb.BizmicroscopicpicturecontrollerApiFp(webAPICfg);

export default modelExtend(model, {
  namespace: 'microPortrait',

  state: {
    entityList: [],
    searchInfo: [],
    ids: [],
  },

  effects: {
    *getEntityList({ payload }, { put, call, select }) {
      let entityList = [];
      const response = yield SmConfigEntityApiFp.smConfigEntityQueryConfigEntityListGet();

      if (response.success) {
        entityList = response.resultBody || [];
      }
      yield put({
        type: 'updateState',
        payload: { entityList },
      })
    },

    *getIdsfromEntity({ payload }, { put, call, select }) {
      const { entityId, configType, callback } = payload;
      const params = {
        entityId,
        configType,
      }
      let ids = [];
      let success = false;
      const response = yield GlobalConfigApiFp.globalConfigurationQueryInitColumnListGet(params);

      if (response.success) {
        success = true;
        ids = response.resultBody || [];
        ids = ids.filter(v => v.columnName !== 'khh')
        yield put({
          type: 'updateState',
          payload: {
            ids,
          },
        })
      }
      if (callback) callback(success, ids);
    },


    *getSearchInfo({ payload }, { put, call, select }) {
      const { entityId = 1, queryName = '', queryValue = '', callback } = payload;
      const params = {
        entityId,
        queryName,
        queryValue,
      }
      // debugger;
      let searchInfo = [];
      const response = yield BizMicroApiFp.bizMicroscopicPictureInfoGet(params);
      if (response.success) {
        searchInfo = JSON.parse(response.resultBody) || [];
        yield put({
          type: 'updateState',
          payload: {
            searchInfo,
          },
        })
        if (callback) callback(searchInfo);
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
});
