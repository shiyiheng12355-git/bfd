import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../utils';
import modelExtend from 'dva-model-extend';
import { queryAppkey } from '../../services/api'

const templateAPIFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg)
const baseConfigTabApiFP = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg)
const groupApiFp = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg)
const bdiApiFp = deepcreatorweb.BizonlineoperatingindexappcontrollerApiFp(webAPICfg)

function* getData (api, params, call){
  let response = yield call(api, params)
  let promise = response.json()
  let data = yield promise.then(res => res)
  return data
}

export default {
  namespace: 'report/operation',

  state: {
    clientList: [],
    entityList: [],
    entityId: null,
    groupList: [],
    selectedGroupData: [],
    appkey: null,
    terminal: null,
    navTab: null,
    pagesTab: null,
    filterData: {},
    mappingName: {
      newCount: '新增用户',
      wastageCount: '流失用户',
      activeCount: '活跃用户',
      startupCount: '启动次数',
      backflowCount: '回流用户',
      avgkepp: '平均停留时长',
      xy: '贡献下游浏览量',
      pageCount: '贡献浏览量',
      sessionCount: '访问次数',
      pages: '平均访问页数',
      newvisitor: '新访客数',
      pvCount: '浏览量（PV）',
      uvCount: '访客数（UV）',
      avgVisitorTime: '平均访问时长',
      bounceRate: '跳出率',
      gx: '贡献浏览量',
      avgAccessPage: '平均访问页数',
      avgVisitorDepth: '平均访问深度',
      avgVisitorFrequency: '平均访问频次',
      accessPage: '访问页数',
      linkclickCount: '贡献下游浏览量',
      exitRate: '退出率',
      avgVisitLength: '平均停留时长',
    },
    mappingDesc: {
      newCount: '新增用户：第一次启动应用的用户',
      activeCount: '活跃用户：启动过应用的用户(去重)，启动过一次的用户即被视为活跃用户，包括新用户和老用户。',
      wastageCount: '流失用户：距离上一次使用，大于等于7天没有使用过应用的用户，将被视为流失。',
      startupCount: '启动次数：打开应用视为启动,退往后台超过30S或者完全退出视为启动结束。',
      backflowCount: '回流用户：流失用户在某日再次使用应用，将视为当日的一个回流。',
      sessionCount: '访客在您网站上的会话(Session)次数，一次会话过程中可能浏览多个页面。',
      pageCount: '指以该页面作为入口产生的浏览量（PV）总计。',
      newvisitor: '一天的独立访客中,历史第一次访问您网站的访客数。',
      pvCount: '即通常说的Page View(PV),用户每打开一个网站页面就被记录1次。用户多次打开同一页面,浏览量值累计。',
      uvCount: '一天之内您网站的独立访客数(以Cookie为依据),一天内同一访客多次访问您网站只计算1个访客',
      avgVisitorTime: '访客在一次访问中,平均打开网站的时长。即每次访问中,打开第一个页面到关闭最后一个页面的平均值。',
      bounceRate: '只浏览了一个页面便离开了网站的访问次数占总的访问次数的百分比。跳出率=浏览一个页面的访问次数/总访问次数',
      avgAccessPage: '平均每次访问浏览的页面数量，平均访问页数=浏览量/访问次数',
      avgVisitorDepth: '平均每次访问会话中浏览的不同页面数。',
      avgVisitorFrequency: '访客一天内的平均会话次数，平均访问频次=访问次数/访客数。',
      accessPage: '访客在您网站上的会话(Session)次数，一次会话过程中可能浏览多个页面',
      linkclickCount: '该页面给站内其他页面直接带去的浏览量。以当前页面为前链的PV总和。',
      exitRate: '退出率=该页面的退出次数/该页面的PV数。',
      avgVisitLength: '访客浏览某一页面时所花费的平均时长。',

    },
    mappingType: {
      '1DayRetention': '次日留存率',
      '1day': '次日留存率',
      '7day': '7日留存率',
      '14day': '14日留存率',
      '30day': '30日留存率',
      activeAccount: '活跃账号',
      activeCount: '活跃用户',
      activeKeep: '活跃留存',
      addupCount: '累计用户',
      avgTimePerStartup: '平均单次使用时长',
      avgTimePerUser: '每日人均使用时长',
      backflowCount: '回流用户',
      dauAndMau: 'DAU/MAU',
      globalDistribution: '全球地区',
      inChina: '中国地区',
      model: '终端类型',
      newAccountCount: '新增账号',
      newCount: '新增用户',
      newKeep: '新增留存',
      osversion: '操作系统',
      resolution: '分辨率',
      returnCount: '7日回访用户',
      returnRate: '7日回访率',
      silentCount: '沉默用户',
      startupCount: '启动次数',
      startupPerUser: '人均启动次数',
      startupUser: '启动人数',
      upgradeCount: '升级用户',
      wastageCount: '流失用户',
      errorCount: '错误数',
      errorRate: '错误率',
    },
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

      const { groupList } = yield select(state => state['report/operation'])
      let response;
      let ids;
      console.log(groupList)
      // debugger
      for (let i = 0, len = groupList.length; i < len; i++) {
        console.log(i)
        ids = groupList[i].id
        response = yield groupApiFp.bizGroupQueryGroupCustomerNumAndUserNumGet({ ids, entityId: payload })
        yield put({
          type: 'setGroupNum',
          payload: JSON.parse(response.resultBody),
        })
      }
      // groupList.map((item) => {
        // groupids.push(item.id)
      // })
      // const ids = groupids.join(',');
      // if (!ids || !ids.length) return;
    },
    //  获取客户端列表
    *fetchClientList(_, { call, put }) {
      // const { resultBody } = yield templateAPIFp.smTemplateQueryCurrentUserAppKeyGet()
      const { resultBody } = yield getData(queryAppkey, '', call)
      yield put({
        type: 'setClientList',
        payload: resultBody,
      })
      if (resultBody[0].terminal !== 'pc') {
        yield put({
          type: 'setNavTab',
          payload: 'app',
        })
        yield put({
          type: 'setPagesTab',
          payload: 'trend',
        })
      }
      yield put({
        type: 'setAppkey',
        payload: resultBody[0],
      })

      yield put({
        type: 'fetchFilter',
        payload: resultBody[0].appkey,
      })
    },

    //  获取筛选条件
    *fetchFilter({ payload }, { put }) {
      //  appversion，province，channel
      const provinceRes = yield bdiApiFp.bizOnlineOperatingIndexAppScreeningConditionsGet({ appkey: payload, columnName: 'province' })
      const appversionRes = yield bdiApiFp.bizOnlineOperatingIndexAppScreeningConditionsGet({ appkey: payload, columnName: 'appversion' })
      const channelRes = yield bdiApiFp.bizOnlineOperatingIndexAppScreeningConditionsGet({ appkey: payload, columnName: 'channel' })
      let filterData = { province: [], channel: [], appversion: [] }
/*       JSON.parse(provinceRes.resultBody).map(item=>{
        filterData['province'].push({label:item,value:item})
      }) */
      JSON.parse(provinceRes.resultBody).map((item) => {
        filterData.province.push({ label: item.province, value: item.province })
      })
      JSON.parse(channelRes.resultBody).map((item) => {
        filterData.channel.push({ label: item.channel, value: item.channel })
      })
      JSON.parse(appversionRes.resultBody).map((item) => {
        filterData.appversion.push({ label: item.appversion, value: item.appversion })
      })
      // filterData.province = JSON.parse(provinceRes.resultBody)
     /*  filterData.channel = JSON.parse(channelRes.resultBody)
      filterData.appversion = JSON.parse(appversionRes.resultBody) */
      yield put({
        type: 'saveFilterData',
        payload: filterData,
      })
    },
  },

  reducers: {
    setClientList(state, { payload }) {
      return {
        ...state,
        clientList: payload,
      }
    },

    setAppkey(state, { payload }) {
     /*  let navTab = null
      let pagesTab = null
      if (payload.terminal !== 'pc') {
        navTab = 'app'
        pagesTab = 'trend'
      } */
      return {
        ...state,
        appkey: payload.appkey,
        terminal: payload.terminal || '',
      }
    },

    setNavTab(state, { payload }) {
      return {
        ...state,
        navTab: payload,
      }
    },

    setPagesTab(state, { payload }) {
      return {
        ...state,
        pagesTab: payload,
      }
    },

    // 保存实体id
    setEntityId(state, { payload }) {
      return {
        ...state,
        entityId: payload,
      }
    },

    //  保存实体列表
    setEntityList(state, { payload }) {
      return {
        ...state,
        entityList: payload,
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

    // 选择用户群
    changeSelectedGroupData(state, { payload }) {
      return {
        ...state,
        selectedGroupData: payload,
      }
    },

    //  保存筛选条件
    saveFilterData(state, { payload }) {
      return {
        ...state,
        filterData: payload,
      }
    },

    //  设置用户群人数
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
  },
}
