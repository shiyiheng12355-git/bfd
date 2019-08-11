
import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../../utils';
import { notification, Icon } from 'antd'

const ApiFp = deepcreatorweb.ReportonlineoperateindexcontrollerApiFp(webAPICfg);
const formatList = ({newvisitor,pvCount,uvCount,avgVisitorTime,bounceRate}) => {
    let list = {newvisitor,pvCount,uvCount,avgVisitorTime,bounceRate}
    const arr = []
    
    for (let i in list) {
      arr.push({ title: i, value: list[i] })
    }
    return arr
  }
export default {
    namespace: 'report/flowanalysis',

    state: {
        queryPcWebsiteTrafficTrend: [],//流量趋势数据
        lineData:{},
        contrastData:false,//对比数据
        dataList: formatList({
            "newvisitor": '0',
            "pvCount": '0',
            "uvCount": '0',
            "avgVisitorTime":'0',
            "bounceRate": '0',
        })//网站趋势
    },

    effects: {
        *fetchQueryPcWebsiteTrafficTrend({ payload, callback }, { call, put }) {
            const baseGranularityInfo = payload;
            let { resultBody, success } = yield ApiFp.globalConfigurationQueryPcWebsiteTrafficTrendPost({ baseGranularityInfo });
            resultBody = Object.prototype.toString.call(resultBody) == '[object String]'?JSON.parse(resultBody):resultBody;
            
            yield put({
                type: 'getTrafficTrend',
                payload: resultBody || [],
            });
            if(success){
                callback && callback();
            }

        },
        *fetchQueryPcWebsiteTrend({ payload }, { call, put }) {
            const baseOnlineOperatingIndexInfo = payload;
            let { resultBody, success } = yield ApiFp.globalConfigurationQueryPcWebsiteTrendPost({ baseOnlineOperatingIndexInfo });
            resultBody = Object.prototype.toString.call(resultBody) == '[object String]'?JSON.parse(resultBody):resultBody;
            
            
            yield put({
                type: 'getDataList',
                payload: formatList(resultBody[0]) ,
            });

        },

    },

    reducers: {
        getLineView(state,{payload,contrast}){
            const {queryPcWebsiteTrafficTrend} = state;
            let lineData = {},
                contrastData = contrast?{}:false;
            queryPcWebsiteTrafficTrend.map(item=>{
                (lineData['dateTime']||(lineData['dateTime']=[])).push(item['dateTime'])
                payload.map(ite=>{
                    if(contrast){
                        
                        (contrastData[ite]||(contrastData[ite]=[])).push(item[ite]||0);
                    }else{
                        (lineData[ite]||(lineData[ite]=[])).push(item[ite]||0);
                    }
                })
            })
            return {
                ...state,
                lineData:contrast?state['lineData']:lineData,
                contrastData:contrastData
            }
        },
        getDataList(state, { payload }) {
            return {
                ...state,
                dataList:payload
            };
        },
        getTrafficTrend(state, { payload }) {
            return {
                ...state,
                queryPcWebsiteTrafficTrend: payload
            }
        },
        
    },
};
