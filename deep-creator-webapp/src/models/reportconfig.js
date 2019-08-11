import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';

import { webAPICfg } from '../utils';

const reportApiFp = deepcreatorweb.SmreportmanagementcontrollerApiFp(webAPICfg)
export default {
  namespace: 'reportconfig',

  state: {
    REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT: null,
    REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT: null,
  },

  effects: {
    *fetchVal(_, { put }) {
      const { resultBody } = yield reportApiFp.smReportManagementQueryReportConfigInfoGet()
      yield put({
        type: 'setVal',
        payload: resultBody,
      })
    },

    *fetchSaveVal({payload},{put}) {
      const { resultBody,errorMsg } = yield reportApiFp.smReportManagementSaveReportManagementPost({ smConfigKvInfo: payload})
      if (resultBody) {
        message.success('添加成功');
      } else {
        notification.error({ message: '添加失败', description: errorMsg });
      }
    }
  },

  reducers: {
    setVal(state, { payload }) {
      let val1 = null
      let val2 = null
      payload.map((item) => {
        if (item.configKey === 'REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT') {
          val1 = Number(item.configValue)
        } else if (item.configKey === 'REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT') {
          val2 = Number(item.configValue)
        }
      })
      return {
        ...state,
        REPORTCONFIG_FUNNEL_STEP_UPPER_LIMIT: val1,
        REPORTCONFIG_FUNNEL_CREATE_UPPER_LIMIT: val2,
      }
    },
  },
}