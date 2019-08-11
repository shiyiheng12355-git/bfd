import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import { model } from '../common';
import Q from 'bluebird';
import uuid from 'uuid';
import { message, notification } from 'antd';

import { webAPICfg } from '../../utils';

const AutoFp = deepcreatorweb.BizautomarketingcontrollerApiFp(webAPICfg);
const GroupFp = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg);
const EntityFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const TemplateFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);
const EventFp = deepcreatorweb.EventactioncontrollerApiFp(webAPICfg);
const SMS = deepcreatorweb.SmshortmessagegroupcontrollerApiFp(webAPICfg);
const Email = deepcreatorweb.SmmailgroupcontrollerApiFp(webAPICfg);
const SuitFp = deepcreatorweb.BizautomarketingsuitecontrollerApiFp(webAPICfg);
const TagValue = deepcreatorweb.BiztagvaluecontrollerApiFp(webAPICfg);
const LifeTripFp = deepcreatorweb.BizlifetripcontrollerApiFp(webAPICfg);
const SceneAPI = deepcreatorweb.SmmarketingscenecontrollerApiFp(webAPICfg);

export default modelExtend(model, {
  namespace: 'marketing/automation',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    loading: true,
    globalGroups: [],
    userEntityList: [], // 用户类型实体列表,实体下携带群组列表信息
    appKeys: [], // 客户端列表
    events: [], // 客户端事件列表
    eventParams: [], // 事件参数
    eventParamValues: [], // 参数提示
    smsGroups: [], // 短信接收组
    emailGroups: [], // 邮件接收组
    templateList: [], // 消息模板
    recentMessageList: [], // 最近10条消息
    nodes: [], // 关系图节点列表
    nodeCountList: [], // 决策树节点覆盖数统计
    currentAutomation: undefined, // 自动化营销详情
  },

  effects: {
    *fetch({ payload }, { put, call }) {
      const { success, resultBody, errorMsg } = yield AutoFp.bizAutoMarketingListGet();
      if (success) {
        yield put({
          type: 'save',
          payload: { list: resultBody.map((item) => { item.key = item.id; return item; }) },
        });
      } else {
        notification.error({ message: '获取自动化营销列表失败', description: errorMsg })
      }
    },
    *fetchCurrentAutomation({ payload }, { put, call }) {
      const { success, resultBody, errorMsg } = yield AutoFp.bizAutoMarketingInfoIdGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { currentAutomation: resultBody },
        });
      } else {
        notification.error({ message: '获取自动化营销详情', description: errorMsg })
      }
    },
    *add({ payload, callback }, { call, put }) {
      const param = { ...payload }

      const { success, errorMsg } = yield AutoFp.bizAutoMarketingAddPost({ bizAutoMarketingPO: param });
      if (success) {
        message.success('添加成功');
        if (callback) callback();
      } else {
        notification.error({ message: '添加失败', description: errorMsg })
      }
    },
    *remove({ payload, callback }, { call, put, select }) {
      const { success, errorMsg } = yield AutoFp.bizAutoMarketingDelIdDelete(payload);
      if (success) {
        message.success('删除成功');
        if (callback) callback();
      } else {
        notification.error({ message: '删除失败', description: errorMsg })
      }
    },

    *update({ payload, callback }, { put }) {
      const bizAutoMarketingPO = payload;
      const { success, errorMsg } = yield AutoFp.bizAutoMarketingUpdatePut({ bizAutoMarketingPO });
      if (success) {
        message.success('更新成功');
        if (callback) callback();
      } else {
        notification.error({ message: '更新失败', description: errorMsg })
      }
    },

    *copy({ payload, callback }, { call, put }) {
      const param = payload;
      const random = uuid.v1().substring(0, 8); // 随机8字符串
      const subStr = (str) => {
        return str.replace(str.substring(28, 36), random); // 替换字符串的结尾8个字符，构建新的ID
      }
      // 由于节点之间的id有引用关系，所以统一添加一个随机值
      param.treeId = subStr(param.treeId);
      const json = JSON.parse(param.conditionJson);
      json.tree_id = param.treeId;
      json.node_list.forEach((node) => {
        node.node_id = subStr(node.node_id);
        if (node.branch_list) {
          node.branch_list.forEach((branch) => {
            branch.child_id = subStr(branch.child_id);
          })
        }
      })
      param.conditionJson = JSON.stringify(json);
      const { success, errorMsg } = yield AutoFp.bizAutoMarketingAddPost({ bizAutoMarketingPO: param });
      if (success) {
        message.success('复制成功');
        if (callback) callback();
      } else {
        notification.error({ message: '复制失败', description: errorMsg })
      }
    },

    *changeMonitor({ payload, callback }, { put }) {
      const { success, errorMsg } = yield AutoFp.bizAutoMarketingMonitorPost(payload);
      if (success) {
        message.success('改变监听状态成功');
        if (callback) callback();
      } else {
        notification.error({ message: '改变监听状态失败', description: errorMsg })
      }
    },

    // 获取用户实体类别下的群组列表
    *fetchUserEntityGroups({ payload, callback }, { put }) {
      const r1 = yield EntityFp.smConfigEntityQueryConfigEntityListGet();
      if (r1.success) {
        let userEntityList = r1.resultBody.filter(item => item.entityCategory === 0);
        userEntityList = yield Q.all(userEntityList.map((entity) => {
          return GroupFp.bizGroupListGet({ entityId: entity.id, isAddReport: 2, groupAuthorityType: 0 })
            .then((r) => { entity.groups = r.resultBody || []; return entity; });
        }));
        callback(null, userEntityList);
        yield put({
          type: 'updateState',
          payload: { userEntityList },
        });
      }
    },

    // 获取一个群组的用户数和客户数统计数据
    *fetchGroupNum({ payload, callback }, { put }) {
      if (!payload.ids || !payload.ids.length) return
      payload.ids = payload.ids.join(',');
      const { success, resultBody, errorMsg } = yield GroupFp.bizGroupQueryGroupCustomerNumAndUserNumGet(payload);
      if (success) {
        callback(null, JSON.parse(resultBody));
      } else {
        notification.error({ message: '获取数据失败', description: errorMsg })
      }
    },

    // 线上行为 客户端列表
    *fetctAppKeys({ payload }, { put }) {
      const { success, resultBody } = yield TemplateFp.smTemplateQueryAppKeyGet();
      if (success) {
        yield put({
          type: 'updateState',
          payload: { appKeys: resultBody },
        })
      }
    },

    // 线上行为 客户端事件列表
    *fetchAppEvents({ payload }, { put }) {
      const { success, resultBody } = yield EventFp.eventActionQueryEventListByAppIdGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { events: resultBody },
        })
      }
    },

    // 线上行为 获取事件参数
    *fetchEventParams({ payload }, { put }) {
      const { success, resultBody } = yield EventFp.eventActionQueryConfigEventListGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { eventParams: resultBody },
        })
      }
    },

    // 线上行为 获取参数值提示
    *fetchEventParamValue({ payload }, { put }) {
      const { success, resultBody } = yield EventFp.eventActionQueryActionParamPromptGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { eventParamValues: resultBody },
        })
      }
    },

    *fetchSmsGroups({ payload }, { put }) {
      const { success, resultBody } = yield SMS.smShortMessageGroupListGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { smsGroups: resultBody },
        })
      }
    },

    *saveRecentMessage({ payload, callback }, { put }) {
      const bizAutoMarketingSuiteInfo = payload;
      const { success, errorMsg, resultBody } = yield SuitFp.bizAutoMarketingSuiteSaveBizAutoMarketingSuitPost({ bizAutoMarketingSuiteInfo });
      if (success) {
        message.success('保存消息成功');
        if (callback) callback(null, resultBody);
      } else {
        notification.error({ message: '保存消息失败', description: errorMsg })
      }
    },

    *sendMessage({ payload, callback }, { put }) {
      const { success, errorMsg } = yield AutoFp.bizAutoMarketingSendMessagePost(payload);
      if (success) {
        message.success('发送消息成功');
        if (callback) callback(null);
      } else {
        notification.error({ message: '发送消息失败', description: errorMsg })
      }
    },

    *fetchRecentMessageList({ payload }, { put }) {
      const { success, resultBody, errorMsg } = yield SuitFp.bizAutoMarketingSuiteQueryBizAutoMarketingSuitGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { recentMessageList: resultBody },
        })
      } else {
        notification.error({ message: '获取消息列表失败', description: errorMsg })
      }
    },

    *fetchEmailGroups({ payload }, { put }) {
      const { success, resultBody } = yield Email.smMailGroupListGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { emailGroups: resultBody },
        })
      }
    },

    *fetchMessageTemplateList({ payload }, { put }) {
      const { success, resultBody } = yield SuitFp.bizAutoMarketingSuiteQueryBizAutoMarketingSuitGet(payload);
      if (success) {
        yield put({
          type: 'updateState',
          payload: { templateList: resultBody },
        })
      }
    },

    *addAutoTag({ payload, callback }, { put }) {
      const { success, errorMsg } = yield TagValue.bizTagValueAddAutomaticTagValueGet(payload)
      if (success) {
        message.success('添加成功');
        if (callback) callback(null);
      } else {
        notification.error({ message: '添加失败', description: errorMsg })
      }
    },

    *fetchAutoTagList({ payload }, { put }) {
      const { success, resultBody } = yield TagValue.bizTagValueQueryAutomaticTagValueListGet(payload)
      if (success) {
        yield put({
          type: 'updateState',
          payload: { autoTagList: resultBody },
        })
      }
    },

    // 决策树节点覆盖人群数量统计
    *fetchNodeCountList({ payload }, { put }) {
      const { TGItype } = payload;
      let response;
      if (TGItype === 'AUTOMATION') {
        response = yield AutoFp.bizAutoMarketingQueryDecisionTreeNodeNumGet(payload);
      } else {
        response = yield LifeTripFp.bizLifeTripQueryDecisionTreeNodeNumPost(payload);
      }
      const { success, resultBody, errorMsg } = response;
      if (success) {
        yield put({
          type: 'updateState',
          payload: { nodeCountList: resultBody ? JSON.parse(resultBody) : [] },
        })
      } else {
        notification.error({ message: '查询覆盖人数失败', description: errorMsg })
      }
    },

    *fetchNodeLimit({ payload }, { put }) {
      const { success, resultBody, errorMsg } = yield SceneAPI.smMarketingSceneQueryMarketingSceneInfoGet({ categorySign: '' });
      if (success) {
        const NODE_LIMIT = 'MARKETINGCONFIG_DECISIONTREE_NODE_UPPER_LIMIT';
        const cfg2 = resultBody.find(item => item.configKey === NODE_LIMIT);
        const nodeLimit = cfg2 ? parseInt(cfg2.configValue, 10) : 0;
        yield put({
          type: 'updateState',
          payload: { nodeLimit },
        })
      } else {
        notification.error({ message: '获取配置失败', description: errorMsg });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },

    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
});
