import modelExtend from 'dva-model-extend';
import { deepcreatorweb } from 'deep-creator-sdk';
import Q from 'bluebird';
import { message, notification,Icon } from 'antd';
import { webAPICfg, toTree, getSubTree } from '../utils';
import uuid from 'uuid';
import _ from 'lodash'
import moment from 'moment'
import { 
  queryMicroSurvey,   //获取标签用户画像
  queryAppkey,
} from '../services/api';


function* getData (api, params, call){
  let response = yield call(api, params)
  let promise = response.json()
  let data = yield promise.then(res => res)
  return data
}

const uuidv4 = uuid.v4;

const BizGroupApiFp = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg);
const SmConfigEntityApiFp = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
const TagCategoryApiFp = deepcreatorweb.BiztagcategorycontrollerApiFp(webAPICfg);
const TagValueApiFp = deepcreatorweb.BiztagvaluecontrollerApiFp(webAPICfg);
const SmTemplateApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);
const EventActionApiFp = deepcreatorweb.EventactioncontrollerApiFp(webAPICfg);

const BizMicroApiFp = deepcreatorweb.BizmicroscopicpicturecontrollerApiFp(webAPICfg);

const createTagTree = (categoryTree, values, id = 'tagEnglishName', pid) => {
  return categoryTree.map((item) => {
    (item[id] && item[id] === pid)
      ? item.children = values
      : (item.children && item.children.length > 0) ? createTagTree(item.children, values, id = 'tagEnglishName', pid) : null
    return item;
  });
};


const valueToTree = (data, id = 'id', pid = 'pid', anotherid, format, map) => {
  data.forEach((item) => {
    delete item.children;
  });
  map = map || {};
  let val = [];
  data.forEach((item) => {
    if (format) {
      item = format(item);
    }
    const key = item[id] || item[anotherid];
    if (map[key]) {
      if (!map[key].children) {
        map[key].children = [];
      }
      item.isLeaf = true;
      map[key].children.push(item);
    } else {
      map[key] = item;
    }
  });

  data.forEach((item) => {
    if (!item.tagEnglishValueTitle) {
      const parent = map[item[pid]];
      if (parent) {
        (parent.children || (parent.children = [])).push(item);
      } else {
        val.push(item);
      }
    }
  });
  return val;
}


const id = uuidv4();

export default {
  namespace: 'tagPicker',

  state: {
    entityList: [], // 实体列表
    tagTree: [], // 标签树 包含标签值
    tagNameList: [], // 标签数,不包含标签值
    microSurvey:{},//用户画像
    categoryTree: [],
    automaticTagList: [],
    customTagList: [],
    channels: [],
    AppKeys: [],
    events: [],
    params: [],
    loading: true,
    conditionList: [
      {
        id,
        UserTag: {},
        CustomTag: {},
        OnlineBehavior: {},
        // CounterTrade: {},
        relation: 'and',
      },
    ],
    currentCondition: id,
    outsideRelation: 'or', // 条件之间的逻辑关系 and=>且 or=>或 默认=>or
    isCopyAdd: false, // 是否在复制操作中进行条件新增

    // 下面是微观画像state
    userBaseInfo: {}, // 用户基本信息
    isSpecialGroup: false, // 是否属于特别关注用户群
    recommendProduct: '', // 推荐产品
    actionCounts: [], // 事件次数
    actionCountsByTime: [], // 事件次数(时间维度)
    userActionList: [], // 用户行为
    actionDetails: [], // 用户行为详情
    userTagInfo: [],
    existCustomtag: [],
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
          payload: {
            entityList,
          },
        })
        if (callback) callback(entityList);
      }
    },

    *getMicroSurvey({ payload }, { call, put }) { // 获取标签用户画像
      //清楚缓存先
      yield put({
        type: 'clearMicroSurvey'
      })
      const { entityId,superId } = payload;
      let params={};
      params.entityId=entityId;
      params.superId=superId;
      // 获取图表数据
      let { resultBody, success,errorMsg } = yield getData(queryMicroSurvey, params, call)
      if(success){
        // let microSurvey =  resultBody;
        let microSurvey = JSON.parse(resultBody);
        yield put({
          type: 'updateState',
          payload: {microSurvey},
        });
      }else{
        notification.error({ message: '查询失败', description: errorMsg || resultBody })
      }
    },

    *getTagTree({ payload }, { call, put }) { // 包含标签值
      const { entityId = 1 } = payload;
      let tagTree = []
      const response = yield TagCategoryApiFp.bizTagCategoryFindTagTreeGet({ entityId });
      if (response.success) {
        tagTree = valueToTree(response.resultBody || [], 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName');
        yield put({
          type: 'updateState',
          payload: { tagTree },
        });
      }
    },

    *fetchTags({ payload }, { call, put }) {
      const { entityId = 1 } = payload;
      let categoryTree = []
      const response = yield TagCategoryApiFp.bizTagCategoryTagCategoryAndTagNameListGet({ entityId });
      if (response.success) {
        categoryTree = toTree(response.resultBody || [], 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName')

        yield put({
          type: 'updateState',
          payload: { categoryTree },
        });
      }
    },

    *getTagNameList({ payload }, { call, put }) {
      const { entityId = 1 } = payload;
      let tagNameList = []
      const response = yield TagCategoryApiFp.bizTagCategoryTagCategoryAndTagNameListForGroupGet({ entityId });
      if (response.success) {
        tagNameList = toTree(response.resultBody || [], 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName');
        yield put({
          type: 'updateState',
          payload: { tagNameList },
        });
      }
    },

    *getTagValues({ payload }, { call, put, select }) {
      const { entityId, tagEnglishName, callback } = payload;
      const params = {
        entityId,
        tagEnglishName,
      }
      let { categoryTree } = yield select(state => state.tagPicker);
      const response = yield TagValueApiFp.bizTagValueTagValueListExceptCoverGet(params);

      if (response.success) {
        let values = response.resultBody;
        values = values.map((value) => {
          value.isLeaf = true;
          return value;
        })
        categoryTree = createTagTree(categoryTree, values, 'tagEnglishName', tagEnglishName);
        yield put({
          type: 'updateState',
          payload: { categoryTree },
        });
        if (callback) callback(true)
      }
    },

    *getAutomaticTag({ payload }, { call, put, select }) {
      const { entityId, callback } = payload;
      const params = {
        entityId,
      }
      const response = yield TagValueApiFp.bizTagValueQueryAutomaticTagValueListGet(params);
      let automaticTagList = [];
      if (response.success) {
        automaticTagList = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { automaticTagList },
        });
      }
    },

    *getCustomTag({ payload }, { call, put, select }) {
      const { entityId, callback } = payload;
      const params = {
        entityId,
      }
      const response = yield TagValueApiFp.bizTagValueQueryCustomTagValueListGet(params);
      let customTagList = [];
      if (response.success) {
        customTagList = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { customTagList },
        });
      }
    },

    *getChannel({ payload }, { call, put }) {
      const { entityId } = payload;
      let channels = [];
      const response = yield SmTemplateApiFp.smTemplateQueryCurrentUserTagByEntityIdGet({ entityId });
      if (response.success) {
        channels = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { channels },
        });
      }
    },

    *getAppKey({ payload }, { call, put }) {
      const { callback } = payload;
      // const response = yield SmTemplateApiFp.smTemplateQueryCurrentUserAppKeyGet();
      let response = yield getData(queryAppkey, '', call)
      let AppKeys = [];
      if (response.success) {
        AppKeys = response.resultBody || [];

        yield put({
          type: 'updateState',
          payload: { AppKeys },
        });
        if (callback) callback(AppKeys);
      }
    },

    *getEvent({ payload }, { call, put }) {
      const { appKey } = payload;
      let events = [];
      if (appKey !== '0') {
        const response = yield EventActionApiFp.eventActionQueryEventListByAppIdGet({ appKey });
        if (response.success) {
          events = response.resultBody || [];
        }
      }
      yield put({
        type: 'updateState',
        payload: { events },
      });
    },
    *getParam({ payload }, { call, put }) {
      const { eventId } = payload;
      let params = [];
      if (eventId !== '0') {
        const response = yield EventActionApiFp.eventActionQueryConfigEventListGet({ eventId });
        if (response.success) {
          params = response.resultBody || [];
        }
      }
      yield put({
        type: 'updateState',
        payload: { params },
      });
    },
    *getParamValues({ payload }, { call, put }) {
      const { columnName, appkey, actionName, callback } = payload;
      let params = {
        columnName,
        appkey,
        actionName,
      }
      let paramValues = [];
      if (columnName !== '0') {
        const response = yield EventActionApiFp.eventActionQueryActionParamPromptGet(params);
        if (response.success) {
          paramValues = JSON.parse(response.resultBody) || [];
        }
      }
      yield put({
        type: 'updateState',
        payload: { paramValues },
      });
      if (callback) callback(paramValues)
    },

    *getConditionList({ payload }, { call, put, select }) {
      const { fields } = payload;
      const key = _.findKey(fields);
      let { conditionList, currentCondition } = yield select(state => state.tagPicker);

      conditionList = conditionList.map((item) => {
        if (currentCondition === item.id) {
          item[key] = fields[key].value;
        }
        return item;
      })
      yield put({
        type: 'updateState',
        payload: { conditionList },
      });
    },
    *resetConditionList({ payload }, { call, put, select }) {
      const conditionList = [{
        id: uuidv4(),
        UserTag: {},
        CustomTag: {},
        OnlineBehavior: {},
        relation: 'and',
      }];
      let currentCondition = conditionList[0].id;
      let outsideRelation = 'or';
      yield put({
        type: 'updateState',
        payload: {
          conditionList,
          currentCondition,
          outsideRelation,
        },
      });
    },
    *addCodition({ payload }, { call, put, select }) {
      const { conditionList, currentCondition, callback } = payload;
      yield put({
        type: 'updateState',
        payload: {
          conditionList,
          currentCondition,
          isCopyAdd: true,
        },
      });
      if (callback) callback();
    },
    *delCondition({ payload }, { call, put, select }) {

      const { id, callback } = payload;
      let { conditionList } = yield select(state => state.tagPicker);
      conditionList = conditionList.filter(item => item.id !== id);
      const { length } = conditionList;
      yield put({
        type: 'updateState',
        payload: {
          conditionList,
          currentCondition: conditionList[length - 1].id,
        },
      });
      const { UserTag, CustomTag } = _.cloneDeep(conditionList[length - 1]);

      if (callback) callback(UserTag, CustomTag);
    },

    *updateCondition({ payload }, { call, put, select }) {
      const { conditionId, item, type, callback } = payload;
      let { conditionList } = yield select(state => state.tagPicker);
      conditionList = conditionList.map((condition) => {
        if (condition.id === conditionId) {
          const { UserTag = {}, OnlineBehavior = {}, CustomTag = {} } = condition;
          if (type === 'channel') {
            delete UserTag.checkedChannels;
            UserTag.isChannelReady = false;
            condition.UserTag = UserTag;
          } else if (type === 'user') {
            let { checkedTags = [] } = UserTag;
            checkedTags = checkedTags.filter(tag => tag.tagEnglishName !== item);
            if (!checkedTags.length) {
              // delete UserTag.checkedChannels;
              delete UserTag.checkedTags
              UserTag.isReady = false;
            } else {
              UserTag.checkedTags = checkedTags;
            }
            condition.UserTag = UserTag;
          } else if (type === 'custom') {
            const { checkedCusTags = {} } = CustomTag;
            let { customerTag = [], automaticTag = [] } = checkedCusTags;
            if (item.tagEnglishName === 'custom_tag') { // 自定义标签
              customerTag = customerTag.filter(tag => tag.tagEnglishValueTitle !== item.tagEnglishValueTitle)
            } else { // 自动化标签
              automaticTag = automaticTag.filter(tag => tag.tagEnglishValueTitle !== item.tagEnglishValueTitle)
            }
            if (!customerTag.length && !automaticTag.length) {
              delete CustomTag.checkedCusTags;
              CustomTag.isReady = false;
            } else {
              CustomTag.checkedCusTags = {
                customerTag,
                automaticTag,
              }
            }
            condition.CustomTag = CustomTag;
          } else if (type === 'onlineBehavior') {
            let { action = [] } = OnlineBehavior;
            action = action.filter(ac => ac.id !== item);
            if (!action.length) {
              delete OnlineBehavior.action;
              OnlineBehavior.isReady = false;
            } else {
              OnlineBehavior.action = action;
            }
            condition.OnlineBehavior = OnlineBehavior;
          }
        }
        return condition;
      })

      yield put({
        type: 'updateState',
        payload: { conditionList },
      });
      if (callback) callback(conditionList)
    },
    *changeCurrentCondition({ payload }, { call, put, select }) {
      const { currentCondition, callback } = payload;

      yield put({
        type: 'updateState',
        payload: { currentCondition },
      });
      if (callback) callback();
    },
    *changeConditionRelation({ payload }, { call, put, select }) {
      const { currentCondition } = payload;
      let { conditionList } = yield select(state => state.tagPicker);
      conditionList = conditionList.map((condition) => {
        if (condition.id === currentCondition) {
          condition.relation = condition.relation === 'and' ? 'or' : 'and';
        }
        return condition;
      })
      yield put({
        type: 'updateState',
        payload: { conditionList },
      });
    },
    *changeOutsideRelation({ payload }, { call, put, select }) {
      let { outsideRelation } = yield select(state => state.tagPicker);
      outsideRelation = outsideRelation === 'and' ? 'or' : 'and';
      yield put({
        type: 'updateState',
        payload: { outsideRelation },
      });
    },
    *changeConditionList({ payload }, { call, put, select }) {
      let { conditionList, outsideRelation } = payload;
      const { length } = conditionList
      let currentCondition = conditionList[length - 1].id;
      let isCopyAdd = false;
      yield put({
        type: 'updateState',
        payload: { conditionList, currentCondition, outsideRelation, isCopyAdd },
      });
    },

    *getUserBaseInfo({ payload }, { put, call, select }) {
      const { entityId = 1, superId } = payload;
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

    *isInSpecialGroup({ payload }, { put, call, select }) {
      const { entityId = 1, superId } = payload;
      const params = {
        entityId,
        superId,
      };
      let isSpecialGroup = false;
      const response = yield BizGroupApiFp.bizGroupIsInSpecialGroupGet(params);
      if (response.success) {
        isSpecialGroup = JSON.parse(response.resultBody)
        yield put({
          type: 'updateState',
          payload: { isSpecialGroup },
        })
      }
    },

    *getRecommendProducts({ payload }, { put, call, select }) {
      const { entityId, superId } = payload;
      const params = {
        entityId,
        superId,
      };
      let recommendProduct = '';
      const response = yield BizMicroApiFp.bizMicroscopicPictureRecommendProductsGet(params);
      if (response.success) {
        recommendProduct = response.resultBody ? JSON.parse(response.resultBody) : [];
        yield put({
          type: 'updateState',
          payload: { recommendProduct },
        })
      }
    },


    *getActionCounts({ payload }, { put, call, select }) {
      const defaultDate = moment().format('YYYY-MM-DD');
      const { AppKeys = [] } = yield select(state => state.tagPicker);
      const defaultAppkey = AppKeys[0] ? AppKeys[0].appkey : '';
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

    *getUserActionList({ payload }, { put, call, select }) {
      const { AppKeys = [] } = yield select(state => state.tagPicker);
      const defaultAppkey = AppKeys[0] ? AppKeys[0].appkey : '';
      const { appkey = defaultAppkey } = payload;
      const params = { appKey: appkey };
      let userActionList = [];
      const response = yield EventActionApiFp.eventActionQueryEventListByAppIdGet(params);
      if (response.success) {
        userActionList = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { userActionList },
        })
      }
    },

    *getActionCountsByTime({ payload }, { put, call, select }) {
      const defaultDate = moment().format('YYYY-MM-DD');
      const { AppKeys = [] } = yield select(state => state.tagPicker);
      const defaultAppkey = AppKeys[0] ? AppKeys[0].appkey : '';
      let { actionCounts = [] } = yield select(state => state.tagPicker);
      actionCounts.sort((cur, next) => {
        return next.num - cur.num;
      })
      const defaultActionName = actionCounts.length ? actionCounts[0].actionName : '';
      const {
        entityId = 1, superId = '123456',
        startDate = defaultDate, endDate = defaultDate,
        appkey = defaultAppkey, actionName = defaultActionName,
      } = payload;
      const params = {
        entityId,
        superId,
        startDate,
        endDate,
        appkey,
        actionName,
      }
      let actionCountsByTime = [];
      const response = yield BizMicroApiFp.bizMicroscopicPictureActionInfoStatisticsByTimeGet(params);
      if (response.success) {
        actionCountsByTime = JSON.parse(response.resultBody);
        yield put({
          type: 'updateState',
          payload: { actionCountsByTime },
        })
      }
    },
    *saveSpecialGroup({ payload }, { put, call, select }) {
      const { entityId, superId, callback } = payload;
      const params = {
        entityId,
        superid: superId,
      }
      const { success, errorMsg } = yield BizGroupApiFp.bizGroupSaveSpecialGroupPost(params);

      if (success) {
        yield put({
          type: 'updateState',
          payload: { isSpecialGroup: true },
        })
      }
      if (callback) callback(success);
    },
    *deleteSpecialGroup({ payload }, { put, call, select }) {
      const { entityId, superId, callback } = payload;
      const params = {
        entityId,
        superId,
      }
      const response = yield BizGroupApiFp.bizGroupDeleteSpecialGroupDelete(params);
      let success = false;
      if (response.success) {
        if (response.resultBody === 'true') {
          success = true;
          yield put({
            type: 'updateState',
            payload: { isSpecialGroup: false },
          })
        }
      }
      if (callback) callback(success);
    },
    *getUserActionDetails({ payload }, { put, call, select }) {
      const defaultDate = moment().format('YYYY-MM-DD');
      const { AppKeys = [] } = yield select(state => state.tagPicker);
      const defaultAppkey = AppKeys[0] ? AppKeys[0].appkey : '';
      const {
        entityId, superId, appkey = defaultAppkey, callback,
        timestamp = '', actionName = '', isloadingMore,
        startDate = defaultDate, endDate = defaultDate,
      } = payload;

      const params = {
        entityId,
        superId,
        startDate,
        endDate,
        appkey,
      }
      if (timestamp) {
        params.timestamp = timestamp;
      }
      if (actionName) {
        params.actionName = actionName;
      }
      let { actionDetails = [] } = yield select(state => state.tagPicker);
      const response = yield BizMicroApiFp.bizMicroscopicPictureUserActionDetailsGet(params);
      if (response.success) {
        if (isloadingMore) { // 说明点击的是'加载更多'
          actionDetails = actionDetails.concat(JSON.parse(response.resultBody)) || [];
        } else {
          actionDetails = JSON.parse(response.resultBody) || [];
        }

        yield put({
          type: 'updateState',
          payload: { actionDetails },
        })
        if (callback) callback();
      }
    },

    * getUserTagInfo({ payload }, { put, call, select }) {
    const { entityId = 1, superId, callback } = payload;
    const params = {
      entityId,
      superId,
    }
    let userTagInfo = [];
    const response = yield call(BizMicroApiFp.bizMicroscopicPictureUserTagInfoGet, params);
    let success = false;
    if (response.success) {
      success = true;
      userTagInfo = JSON.parse(response.resultBody);
      yield put({
        type: 'updateState',
        payload: { userTagInfo },
      })
    }
    if (callback) callback(success)
  },


    * queryExistCustomtag({ payload }, { put, call, select }) {
      const { entityId = 1 } = payload;
      const params = {
        entityId,
      }
      let existCustomtag = [];
      const response = yield call(BizMicroApiFp.bizMicroscopicPictureQueryExistCustomtagGet, params);
      if (response.success) {
        existCustomtag = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { existCustomtag },
        })
      }
    },

    *addNewCustomtag({ payload }, { put, call, select }) {
      const { entityId = 1, superId, tagValueTitle, callback } = payload;
      const params = {
        entityId,
        superId,
        tagValueTitle,
      }
      const response = yield call(BizMicroApiFp.bizMicroscopicPictureAddNewCustomtagValueGet, params);
      let success = false;
      if (response.success) {
        if (response.resultBody) {
          success = true;
          yield put({
            type: 'getUserTagInfo',
            payload: {
              entityId,
              superId,
              callback: (ok) => {
                if (callback) callback(ok);
              },
            },
          })
        }
      } else {
        const { errorMsg } = response;
        if (callback) callback(success, errorMsg);
      }
    },

    *addOldCustomtag({ payload }, { put, call, select }) {
      const { entityId = 1, superId, tagValueTitle, callback } = payload;
      const params = {
        entityId,
        superId,
        tagValueTitle,
      }
      const response = yield call(BizMicroApiFp.bizMicroscopicPictureAddOldCustomtagGet, params);
      let success = false;
      if (response.success) {
        if (response.resultBody) {
          success = true;
          yield put({
            type: 'getUserTagInfo',
            payload: {
              entityId,
              superId,
            },
          })
        }
      }
      if (callback) callback(success);
    },
    *deleteCustomtag({ payload }, { put, call, select }) {
      const { entityId = 1, superId, tagValueTitle, callback } = payload;
      const params = {
        entityId,
        superId,
        tagValueTitle,
      }
      const response = yield call(BizMicroApiFp.bizMicroscopicPictureDeleteCustomtagGet, params);
      let success = false;
      if (response.success) {
        if (response.resultBody) {
          success = true;
          yield put({
            type: 'getUserTagInfo',
            payload: {
              entityId,
              superId,
            },
          })
          yield put({
            type: 'queryExistCustomtag',
            payload: {
              entityId,
            },
          })
        }
      }
      if (callback) callback(success);
    },

  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearMicroSurvey(state, action) {
      return {
        ...state,
        microSurvey:{},
      };
    },
    fail(state, action) {
      notification.open({
        message: action.payload.message,
        description: action.payload.description,
        icon: <Icon type="warning" style={{ color: 'red' }} />,
      });
      return { ...state }
    },
  },
}
