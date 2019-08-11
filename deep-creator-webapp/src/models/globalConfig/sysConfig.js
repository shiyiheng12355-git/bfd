import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';

const UpfileApiFp = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg)

export default {
  namespace: 'gloablConfig/sysConfig',

  state: {

  },

  effects: {
    *saveLogo({ payload }, { put }) {
      const { fileUrl, fileName } = payload
      const { success, errorMsg } = yield UpfileApiFp.globalConfigurationSaveLogoPost({ logoInfo: { fileUrl, fileName } })
      if (success) {
        message.success('保存成功');
        yield put({
          type: 'user/getLogoUrl',
        })
      } else {
        notification.error({ message: '保存失败', description: errorMsg });
      }
    },
  },

  reducer: {

  },
}