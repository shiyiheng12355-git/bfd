
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';
import { notification, Icon } from 'antd'

const ApiFp = deepcreatorweb.ReportonlineoperateindexcontrollerApiFp(webAPICfg);

const formatList = ({linkclickCount,pvCount,uvCount,avgVisitLength,exitRate}) => {
    let list = {linkclickCount,pvCount,uvCount,avgVisitLength,exitRate}
    const arr = []
    
    for (let i in list) {
      arr.push({ title: i, value: list[i] })
    }
    return arr
  }
export default {
    namespace: 'report/pageVisited',

    state: {
        pcInterviewPageCustomIndex: [],//受访页面table
        searchList:false,
        dataList: formatList({
            "linkclickCount": '0',
            "pvCount": '0',
            "avgVisitLength":'0',
            "exitRate":'0',
            "uvCount": '0',
            
        })//网站趋势
    },

    effects: {
        *fetchPcInterviewPageCustomIndex({ payload,callback }, { call, put }) {
            const basePageTypeInfo = payload;
            let { resultBody, success } = yield ApiFp.globalConfigurationQueryPcInterviewPageCustomIndexPost({ basePageTypeInfo });
            resultBody = Object.prototype.toString.call(resultBody) == '[object String]'?JSON.parse(resultBody):resultBody;
            console.log('resultBody',resultBody);
            if(success){
                callback && callback();
            }
            yield put({
                type: 'getTrafficTrend',
                payload: resultBody || [],
            });

        },
        *fetchPcInterviewPage({ payload }, { call, put }) {
            const baseOnlineOperatingIndexInfo = payload;
            let { resultBody, success } = yield ApiFp.globalConfigurationQueryPcInterviewPagePost({ baseOnlineOperatingIndexInfo });
            resultBody = Object.prototype.toString.call(resultBody) == '[object String]'?JSON.parse(resultBody):resultBody;
            
            console.log('=======================',resultBody,formatList(resultBody[0]))
            yield put({
                type: 'getDataList',
                payload: formatList(resultBody[0]) ,
            });

        },

    },

    reducers: {
        getDataList(state, { payload }) {
            return {
                ...state,
                dataList:payload
            };
        },
        getSearch(state, { payload }){
            let arr = [],
                {pcInterviewPageCustomIndex} = state;
            pcInterviewPageCustomIndex.map(item=>{
                if((item['p_s']||"").indexOf(payload) != -1||(item['pretty_url']||"").indexOf(payload) != -1){
                    arr.push(item);
                }
            })

            return {
                ...state,
                searchList:arr.length==0?false:arr
            }
        },
        getTrafficTrend(state, { payload }) {
            return {
                ...state,
                pcInterviewPageCustomIndex: payload,
                searchList:false
            }
        },
        
    },
};
