
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';
import { notification, Icon } from 'antd'

const ApiFp = deepcreatorweb.ReportonlineoperateindexcontrollerApiFp(webAPICfg);
const formatList = ({ sessionCount, uvCount, pvCount, avgVisitorTime, bounceRate }) => {
    let list = { sessionCount, uvCount, pvCount, avgVisitorTime, bounceRate }
    const arr = []

    for (let i in list) {
      arr.push({ title: i, value: list[i] })
    }
    return arr
  }
export default {
    namespace: 'report/pageEntry',

    state: {
        pcEntryPageCustomerIndex: [], // 流量趋势数据
        pcEntryPageFlowOverview: [],
        lineData: {},
        searchList: false,
        dataList: formatList({
            sessionCount: '0',
            uvCount: '0',
            pvCount: '0',
            avgVisitorTime: '0',
            bounceRate: '0',
        }), // 入口也top
    },

    effects: {
        // 自定义指标
        *fetchQueryPcEntryPageCustomerIndex({ payload, callback }, { call, put }) {
            const baseOnlineOperatingIndexInfo = payload;
            let { resultBody, success } = yield ApiFp.globalConfigurationQueryPcEntryPageCustomerIndexPost({ baseOnlineOperatingIndexInfo });
            resultBody = Object.prototype.toString.call(resultBody) == '[object String]' ? JSON.parse(resultBody) : resultBody;

            yield put({
                type: 'getTrafficTrend',
                payload: resultBody || [],
            });
            if (success) {
                callback && callback();
            }
        },
        // 获取top豆腐块
        *fetchQueryPcEntryPage({ payload }, { call, put }) {
            const baseOnlineOperatingIndexInfo = payload;
            let { resultBody, success } = yield ApiFp.globalConfigurationQueryPcEntryPagePost({ baseOnlineOperatingIndexInfo });
            resultBody = Object.prototype.toString.call(resultBody) == '[object String]' ? JSON.parse(resultBody) : resultBody;


            yield put({
                type: 'getDataList',
                payload: formatList(resultBody[0]),
            });
        },
        // 图表
        *fetchQueryPcEntryPageFlowOverview({ payload, callback }, { call, put }) {
            const baseIndexInfo = payload;
            let { resultBody, success } = yield ApiFp.globalConfigurationQueryPcEntryPageFlowOverviewPost({ baseIndexInfo });
            resultBody = Object.prototype.toString.call(resultBody) == '[object String]' ? JSON.parse(resultBody) : resultBody;

            yield put({
                type: 'getEntryPageFlowOverview',
                payload: resultBody || [],
            });
            if (success) {
                callback && callback();
            }
        },

    },

    reducers: {
        getLineView(state, { payload }) {
            const { pcEntryPageFlowOverview } = state;
            let lineData = {};

            pcEntryPageFlowOverview.map((item) => {
                // console.log('dateTime',item)
                lineData.dateTime ? lineData.dateTime.push(item.dateTime) : (lineData.dateTime = [item.dateTime])
                lineData.pretty_url ? lineData.pretty_url.push(item.pretty_url) : (lineData.pretty_url = [item.pretty_url])
                // (lineData['pretty_url']||(lineData['pretty_url'] = [])).push(item['pretty_url'])
                payload.map((ite) => {
                    lineData[ite] ? lineData[ite].push(item[ite] || 0) : (lineData[ite] = [item[ite]])

                    // (lineData[ite]||(lineData[ite] = [])).push(item[ite]);
                })
            })

            return {
                ...state,
                lineData,
            }
        },
        getSearch(state, { payload }) {
            let arr = [],
                { pcEntryPageCustomerIndex } = state;
            pcEntryPageCustomerIndex.map((item) => {
                if ((item.p_s || '').indexOf(payload) != -1 || (item.pretty_url || '').indexOf(payload) != -1) {
                    arr.push(item);
                }
            })

            return {
                ...state,
                searchList: arr.length == 0 ? false : arr,
            }
        },
        getDataList(state, { payload }) {
            return {
                ...state,
                dataList: payload,
            };
        },
        getEntryPageFlowOverview(state, { payload }) {
            return {
                ...state,
                pcEntryPageFlowOverview: payload,
            }
        },
        getTrafficTrend(state, { payload }) {
            return {
                ...state,
                pcEntryPageCustomerIndex: payload,
                searchList: false,
            }
        },

    },
};
