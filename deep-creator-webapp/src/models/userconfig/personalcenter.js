import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';


const tagValueAPI = deepcreatorweb.BizoperlogcontrollerApiFp(webAPICfg);
const smFileRecordAPI = deepcreatorweb.SmfilerecordcontrollerApiFp(webAPICfg);
const smUserInfoAPI = deepcreatorweb.SmuserinfocontrollerApiFp(webAPICfg);
const smMailGroupAPI = deepcreatorweb.SmmailgroupcontrollerApiFp(webAPICfg);
const smShortMsgAPI = deepcreatorweb.SmshortmessagegroupcontrollerApiFp(webAPICfg);

function* wrapper(cb, put) {
  yield put({
    type: 'changeLoading',
    payload: true,
  });
  yield cb()
  yield put({
    type: 'changeLoading',
    payload: false,
  });
}

export default {
  namespace: 'userconfig/personalcenter',

  state: {
    loading: true,
    logData: null,
    downData: null,
    emailData: null,
    phoneData: null,
  },

  effects: {
    *queryLog({ payload }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success } = yield tagValueAPI.bizOperLogOperLogPageGet({ ...payload });
        if (success) {
          yield put({
            type: 'saveLogData',
            payload: resultBody,
          });
        }
      }, put);
    },
    *queryDown({ payload }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success } = yield smFileRecordAPI.smFileRecordSmFileRecordPageGet({ ...payload });
        if (success) {
          yield put({
            type: 'saveDownData',
            payload: resultBody,
          });
        }
      }, put);
    },
    *queryEmail({ payload }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success } = yield smMailGroupAPI.smMailGroupPageGet({ ...payload });
        if (success) {
          yield put({
            type: 'saveEmailData',
            payload: resultBody,
          });
        }
      }, put);
    },
    *addEmailGroup({ payload, callback }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success, errorMsg } = yield smMailGroupAPI.smMailGroupCheckRepeatGet({ mailGroupName: payload.mailGroupName });
        if (success && resultBody) {
          const { resultBody, success, errorMsg } = yield smMailGroupAPI.smMailGroupAddPost({ smMailGroupPO: { ...payload } });
          if (success) {
            message.success('新增成功')
            typeof callback == 'function' && callback();
          } else {
            notification.error({ message: errorMsg || '新增失败' })
          }
        }else{
          notification.error({ message: '邮件组名称已存在' })
        }
      }, put);
    },
    *editEmailGroup({ payload, callback }, { put, call }) {
      function* edit() {
        const { resultBody, success, errorMsg } = yield smMailGroupAPI.smMailGroupUpdatePut({
          smMailGroupPO: {
            id: payload.id,
            mailGroupName: payload.mailGroupName,
            mailAddresses: payload.mailAddresses,
          },
        });
        if (success && resultBody) {
          message.success('修改成功')
          typeof callback == 'function' && callback();
        } else {
          notification.error({ message: '修改失败' })
        }
      }
      yield wrapper(function* () {
        if (!payload.nameIsChange) {
          yield edit();
        } else {
          const { resultBody, success, errorMsg } = yield smMailGroupAPI.smMailGroupCheckRepeatGet({ mailGroupName: payload.mailGroupName });
          if (success && resultBody) {
            yield edit();
          } else {
            notification.error({ message: '邮件组名称已存在', description: errorMsg });
          }
        }
      }, put);
    },
    *delEmailGroup({ payload, callback }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success, errorMsg } = yield smMailGroupAPI.smMailGroupDelIdDelete({ ...payload })
        if (success && resultBody) {
          message.success('删除成功');
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '删除失败', description: errorMsg });
        }
      }, put);
    },
    *queryPhone({ payload }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success } = yield smShortMsgAPI.smShortMessageGroupPageGet({ ...payload });
        if (success) {
          yield put({
            type: 'savePhoneData',
            payload: resultBody,
          });
        }
      }, put);
    },
    *addPhoneGroup({ payload, callback }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success, errorMsg } = yield smShortMsgAPI.smShortMessageGroupCheckRepeatGet({ shortMessageGroupName: payload.shortMessageGroupName });
        if (success && resultBody) {
          const { resultBody, success, errorMsg } = yield smShortMsgAPI.smShortMessageGroupAddPost({ smShortMessageGroupPO: { ...payload } });
          if (success) {
            message.success('新增成功');
            typeof callback === 'function' && callback();
          } else {
            notification.error({ message: '新增失败', description: errorMsg });
          }
        } else {
          notification.error({ message: '短信组名称已存在', description: errorMsg });
        }
      }, put);
    },
    *editPhoneGroup({ payload, callback }, { put, call }) {
      function* edit() {
        const { resultBody, success, errorMsg } = yield smShortMsgAPI.smShortMessageGroupUpdatePut({
          smShortMessageGroupPO: {
            id: payload.id,
            phones: payload.phones,
            shortMessageGroupName: payload.shortMessageGroupName,
          },
        });
        if (success && resultBody) {
          message.success('修改成功');
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '修改失败', description: errorMsg });
        }
      }
      yield wrapper(function* () {
        if (!payload.nameIsChange) {
          yield edit();
        } else {
          const { resultBody, success, errorMsg } = yield smShortMsgAPI.smShortMessageGroupCheckRepeatGet({ shortMessageGroupName: payload.shortMessageGroupName });
          if (success && resultBody) {
            yield edit();
          } else {
            notification.error({ message: '短信组名称已存在' })
          }
        }
      }, put);
    },
    *delPhoneGroup({ payload, callback }, { put, call }) {
      yield wrapper(function* () {
        const { resultBody, success, errorMsg } = yield smShortMsgAPI.smShortMessageGroupDelIdDelete({ ...payload })
        if (success && resultBody) {
          message.success('删除成功')
          typeof callback == 'function' && callback();
        } else {
          notification.error({ message: '删除失败' })
        }
      }, put);
    },
    *updatePassword({ payload, callback }, { put, call }) {
      yield wrapper(function* () {
        const { success, resultBody, errorMsg } = yield smUserInfoAPI.smUserInfoCheckPasswordGet({ password: payload.oldPassword });
        if (success && resultBody) {
          const { resultBody, success } = yield smUserInfoAPI.smUserInfoChangePasswordPut({ ...payload });
          if (success) {
            message.success('修改成功');
            setTimeout(() => {
              typeof callback == 'function' && callback();
            }, 2000);
          } else {
            notification.error({ message: '修改失败' });
          }
        }else{
          notification.error({ message: '旧密码不正确' })
        }
      }, put);
    },
  },
  reducers: {
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    saveLogData(state, action) {
      return {
        ...state,
        logData: action.payload,
      };
    },
    saveDownData(state, action) {
      return {
        ...state,
        downData: action.payload,
      }
    },
    saveEmailData(state, action) {
      return {
        ...state,
        emailData: action.payload,
      }
    },
    savePhoneData(state, action) {
      return {
        ...state,
        phoneData: action.payload,
      }
    },
  },
};
