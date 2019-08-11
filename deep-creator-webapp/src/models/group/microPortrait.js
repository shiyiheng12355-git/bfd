import { deepcreatorweb } from 'deep-creator-sdk';

import moment from 'moment'
import { request, basePath, webAPICfg } from '../../utils';
import { message } from 'antd';


const BizMicroApiFp = deepcreatorweb.BizmicroscopicpicturecontrollerApiFp(webAPICfg);
const SmTemplateApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);

export default {
  namespace: 'microPortrait',
  state: {
    userBaseInfo: {},
    recommendProduct: '',
    actionCounts: [],
  },

  effects: {
    *getUserBaseInfo({ payload }, { put, call, select }) {
      const { entityId = 1, superId = '123456' } = payload;
      const params = {
        entityId,
        superId,
      };
      let userBaseInfo = {};
      const response = yield BizMicroApiFp.bizMicroscopicPictureUserBaseInfoGet(params);
      if (response.success) {
        userBaseInfo = JSON.parse(response.resultBody)[0];
        yield put({
          type: 'updateState',
          payload: { userBaseInfo },
        })
      }
    },
    *getRecommendProducts({ payload }, { put, call, select }) {
      const { entityId = 1, superId = '123456' } = payload;
      const params = {
        entityId,
        superId,
      };
      let recommendProduct = '';
      const response = yield BizMicroApiFp.bizMicroscopicPictureRecommendProductsGet(params);
      if (response.success) {
        recommendProduct = response.resultBody;
        yield put({
          type: 'updateState',
          payload: { recommendProduct },
        })
      }
    },
    *getActionCounts({ payload }, { put, call, select }) {
      let defaultAppkey = '';
      if (!payload.appkey) {
        const appkeyResponse = yield SmTemplateApiFp.smTemplateQueryCurrentUserAppKeyGet();
        if (appkeyResponse.success) {
          const { resultBody = [] } = appkeyResponse;
          defaultAppkey = resultBody[0].appkey;
        }
      }
      const defaultDate = moment().format('YYYY-MM-DD');

      const {
          entityId = 1, superId = '123456', startDate = defaultDate,
          endDate = defaultDate, appkey = defaultAppkey,
      } = payload;
      const params = {
        entityId,
        superId,
        startDate,
        endDate,
        appkey,
      }

      let actionCounts = [];
      const response = yield BizMicroApiFp.bizMicroscopicPictureActionInfoStatisticsGet(params);
      if (response.success) {
        actionCounts = JSON.parse(response.resultBody);
        yield put({
          type: 'updateState',
          payload: { actionCounts },
        })
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
