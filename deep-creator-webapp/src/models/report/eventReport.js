import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../utils';
import { message, notification } from 'antd';
import _ from 'lodash'

const groupApiFp = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg)
const baseConfigTabApiFP = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg)
const templateApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg)
const eventApiFp = deepcreatorweb.EventactioncontrollerApiFp(webAPICfg)
const reportApiFp = deepcreatorweb.BizreportcontrollerApiFp(webAPICfg)
const collectApiFp = deepcreatorweb.BizcollectionmenucontrollerApiFp(webAPICfg)
const saveCollectApi = deepcreatorweb.BizcollectiondetailcontrollerApiFp(webAPICfg)

export default {
  namespace: 'report/eventReport',

  state: {
    entityList: [],
    entityId: null,
    groupList: [],
    clientList: [],
    eventList: [],
    eventParamsList: [],
    eventParamsTips: [],
    dimensionList: [],
    appkey: null,
    selectedGroupData: null,
    selectedEventData: null,
    selectedEventPramsData: [],
    selectedDimension: [],
    radioDimension: '',
    menuList: [],
    chartData: [],
  },

  effects: {
    //  请求实体列表
    *fetchEntityList({ payload }, { call, put }) {
      const { resultBody } = yield baseConfigTabApiFP.smConfigEntityQueryConfigEntityListByCategoryEntityCategoryEnumGet({ entityCategoryEnum: 'PERSON' })
      yield put({
        type: 'setEntityList',
        payload: resultBody,
      })
      yield put({
        type: 'fetchGroupList',
        payload: resultBody[0].id,
      })
      yield put({
        type: 'setEntityId',
        payload: resultBody[0].id,
      })
    },

    //  请求用户群列表
    *fetchGroupList({ payload }, { call, put, select }) {
      let groupids = []
      const { resultBody } = yield groupApiFp.bizGroupListGet({
        entityId: payload,
        groupAuthorityType: 0,
        isAddReport: 1,
      });
      yield put({
        type: 'setGroupList',
        payload: resultBody.filter((item) => {
          return [0, 1, 7, 8].indexOf(item.groupType) !== -1
        }),
      })

      const { groupList } = yield select(state => state['report/eventReport'])
      let response;
      let ids;

      for (let i = 0, len = groupList.length; i < len; i++) {
        ids = groupList[i].id
        response = yield groupApiFp.bizGroupQueryGroupCustomerNumAndUserNumGet({ ids, entityId: payload })
        yield put({
          type: 'setGroupNum',
          payload: JSON.parse(response.resultBody),
        })
      }
      // groupList.map((item) => {
      //   groupids.push(item.id)
      // })
      // const ids = groupids.join(',');
      // if (!ids || !ids.length) return;
      // const response = yield groupApiFp.bizGroupQueryGroupCustomerNumAndUserNumGet({ ids, entityId: payload })
      // yield put({
      //   type: 'setGroupNum',
      //   payload: JSON.parse(response.resultBody),
      // })
    },
    //  获取客户端列表
    *fetchClientList(_, { call, put }) {
      const { resultBody } = yield templateApiFp.smTemplateQueryCurrentUserAppKeyGet()
      yield put({
        type: 'setClientList',
        payload: resultBody,
      })
      yield put({
        type: 'fetchEventList',
        payload: resultBody[0].appkey,
      })
    },

    // 根据客户端获得事件
    *fetchEventList({ payload }, { call, put }) {
      const { resultBody } = yield eventApiFp.eventActionQueryEventListByAppIdGet({ appKey: payload })
      yield put({
        type: 'setEventList',
        payload: resultBody,
      })
      yield put({
        type: 'setAppkey',
        payload,
      })
      yield put({
        type: 'changeSelectedEventData',
        payload: resultBody[0].id,
      })
      yield put({
        type: 'fetchDimension',
        payload: { eventId: resultBody[0].id },
      })
    },

    // 根据客户端、事件获得事件参数
    *fetchEventParamsList({ payload }, { call, put, select }) {
      const { index, eventId } = payload
      const { resultBody } = yield eventApiFp.eventActionQueryConfigEventListGet({ eventId, eventType: 1 })
      const { appkey, eventList } = yield select(state => state['report/eventReport'])
      yield put({
        type: 'fetchEventParamsTips',
        payload: { columnName: resultBody[0].fieldName, actionName: eventList[0].action_name, index: 0 },
      })
      yield put({
        type: 'changeSelectedEventParamsData',
        payload: { index, paramId: resultBody[0].paramId },
      })
      yield put({
        type: 'setEventParamsList',
        payload: resultBody,
      })
    },

    // 根据appkey，事件名称，事件参数名称获得事件参数提示
    *fetchEventParamsTips({ payload }, { call, put, select }) {
      const { appkey } = yield select(state => state['report/eventReport'])
      const { columnName, actionName, index } = payload
      const { resultBody } = yield eventApiFp.eventActionQueryActionParamPromptGet({ appkey, columnName, actionName })
      yield put({
        type: 'changeSelectedEventParamsTipsData',
        payload: { index, data: JSON.parse(resultBody) },
      })
    },

    //  获得维度
    *fetchDimension({ payload }, { put, select }) {
      const { eventId } = payload
      const { resultBody } = yield reportApiFp.bizPerRecomGetViewDimensionPost({ eventId, eventType: 1 })
      const { selectedDimension } = yield select(state => state['report/eventReport'])
      let moreDimension = false
      selectedDimension.length > 1 ? moreDimension = true : moreDimension = false
      yield put({
        type: 'setDimensionList',
        payload: resultBody,
      })
      if (!resultBody || resultBody.length === 0) {
        yield put({
          type: 'changeSelectedDimension',
          payload: { data: null, index: 0, moreDimension },
        })
      } else {
        yield put({
          type: 'changeSelectedDimension',
          payload: { data: resultBody[0].paramId, index: 0, moreDimension },
        })
        yield put({
          type: 'setRadioDimension',
          payload: resultBody[0].paramId,
        })
      }
    },

    //  获得图表
    *fetchReport({ payload }, { put }) {
      const { resultBody } = yield reportApiFp.bizPerRecomEventPost({ bizReportParam: payload })
      yield put({
        type: 'setChartData',
        payload: JSON.parse(resultBody),
      })
    },

    //  获得收藏菜单
    *fetchMenuList({ payload }, { call, put }) {
      const { resultBody, success } = yield collectApiFp.bizCollectionMenuQueryCollectionMenuListGet();
      if (success) {
        yield put({
          type: 'setMenuList',
          payload: resultBody,
        })
      }
    },

    //  我的收藏
    *fetchCollect({ payload, callback }, { put }) {
      payload.collectionType = 1
      const { success, errorMsg } = yield saveCollectApi.bizCollectionDetailSaveCollectionDetailPost({ bizCollectionDetailInfo: payload })
      if (success) {
        message.success('收藏成功');
        callback && callback()
      } else {
        notification.error({ message: '收藏失败', description: errorMsg });
      }
    },
  },

  reducers: {
    //  保存实体列表
    setEntityList(state, { payload }) {
      return {
        ...state,
        entityList: payload,
      }
    },

    // 保存实体id
    setEntityId(state, { payload }) {
      return {
        ...state,
        entityId: payload,
      }
    },

    //  保存用户群列表
    setGroupList(state, { payload }) {
      return {
        ...state,
        groupList: payload,
        selectedGroupData: payload[0],
      }
    },

    //  保存客户端列表
    setClientList(state, { payload }) {
      return {
        ...state,
        clientList: payload,
      }
    },

    //  保存事件列表
    setEventList(state, { payload }) {
      return {
        ...state,
        eventList: payload,
      }
    },

    //  保存时间参数列表
    setEventParamsList(state, { payload }) {
      return {
        ...state,
        eventParamsList: payload,
      }
    },

    //  保存Appkey
    setAppkey(state, { payload }) {
      return {
        ...state,
        appkey: payload,
      }
    },

    // 保存维度列表
    setDimensionList(state, { payload }) {
      return {
        ...state,
        dimensionList: payload,
      }
    },

    //  保存收藏菜单
    setMenuList(state, { payload }) {
      return {
        ...state,
        menuList: payload,
      }
    },

    //  保存所选事件
    changeSelectedEventData(state, { payload }) {
      return {
        ...state,
        selectedEventData: payload,
        selectedEventPramsData: [],
      }
    },


    //  保存所选事件参数
    changeSelectedEventParamsData(state, { payload }) {
      const selectedEventPramsData = _.cloneDeep(state.selectedEventPramsData)
      const { index, paramId } = payload
      selectedEventPramsData[index] = paramId
      return {
        ...state,
        selectedEventPramsData,
      }
    },

    //  保存事件参数提示
    changeSelectedEventParamsTipsData(state, { payload }) {
      const eventParamsTips = _.cloneDeep(state.eventParamsTips)
      const { data, index } = payload
      eventParamsTips[index] = data
      return {
        ...state,
        eventParamsTips,
      }
    },

    // 保存所选维度
    changeSelectedDimension(state, { payload }) {
      const { selectedDimension } = _.cloneDeep(state)
      const { data, index, moreDimension } = payload
      moreDimension ? selectedDimension.length = 1 : ''
      selectedDimension[index] = data
      return {
        ...state,
        selectedDimension,
      }
    },

    setRadioDimension(state, { payload }) {
      console.log('payload', payload)
      return {
        ...state,
        radioDimension: payload,
      }
    },

    //  删除事件参数
    delEventParams(state, { payload }) {
      const { selectedEventPramsData, eventParamsTips } = _.cloneDeep(state)
      selectedEventPramsData.splice(payload, 1)
      eventParamsTips.splice(payload, 1)
      return {
        ...state,
        selectedEventPramsData,
        eventParamsTips,
      }
    },

    // 删除维度
    delDimesion(state, { payload }) {
      const { selectedDimension } = _.cloneDeep(state)
      selectedDimension.splice(payload, 1)
      return {
        ...state,
        selectedDimension,
      }
    },
    // 保存图表数据
    setChartData(state, { payload }) {
      return {
        ...state,
        chartData: payload,
      }
    },

    // 选择用户群
    changeSelectedGroupData(state, { payload }) {
      return {
        ...state,
        selectedGroupData: payload,
      }
    },

    setGroupNum(state, { payload }) {
      const { groupList } = _.cloneDeep(state)
      for (let i in payload) {
        groupList.map((item) => {
          if (item.id === Number(i)) {
            item.customerNum = payload[i].customerNum
            item.userNum = payload[i].userNum
          }
          return item
        })
      }
      return {
        ...state,
        groupList,
      }
    },

    reset(state) {
      state.eventParamsList = []
      state.eventParamsTips = []
      // state.dimensionList = []
      state.selectedEventPramsData = []
      // state.selectedDimension = []
      return {
        ...state,
      }
    },
  },
}