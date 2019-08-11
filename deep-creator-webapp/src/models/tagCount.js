  import { 
    queryConfigEntityList,   //获取所有的实体
    queryHomePage,//获取标签首页三个指标
  } from '../services/api';
  import { message, notification,Icon } from 'antd';
  
  function* getData (api, params, call){
    let response = yield call(api, params)
    let promise = response.json()
    let data = yield promise.then(res => res)
    return data
  }
  
  export default {
    namespace: 'tagCount',
    state: {
      entityList     : [],                // 实体列表
      entityId_chart : '',                // 柱状图实体
      chartData      : [],                // 柱状图数据
    },
    effects: {
      *init({ payload }, { call, put, select }) {
        // 实体查询
        let response_entity = yield getData(queryConfigEntityList, '', call)
        response_entity.resultBody.unshift({ entityName: '全部实体', id: '' })
        let tmpData=[];
        if(response_entity.success) {
          console.log(response_entity.resultBody,"response_entity.resultBody");
          //过滤全部实体这个选项
          if(response_entity.resultBody && response_entity.resultBody.length >0){
            
            response_entity.resultBody.map((items,index)=>{
               if(items.entityName !== "全部实体" && items.id){
                tmpData.push(items);
               }
            })
          }
          yield put({
            type: 'save',
            payload: { 
              entityList: tmpData, 
              entityId_chart: tmpData[0].id||"", 
              entityId_table: '' 
            },
          });
        }

        //获取实体id
        const { entityId_chart } = yield select(state => state['tagCount'])
        let params={};
        params.entityId=entityId_chart;
        // 获取图表数据
        let { resultBody, success } = yield getData(queryHomePage, params, call)
        if(success) {
          yield put({
            type: 'save',
            payload: { 
              chartData: resultBody, 
            },
          });
        }
      },
      *chartChange({ payload }, { call, put, select }) {
        let params ={};
        params.entityId=payload.entityId;
        let { resultBody, success } = yield getData(queryHomePage,params, call);
        if(success) {
          yield put({
            type: 'save',
            payload: { 
              entityId_chart:payload.entityId,
              chartData: resultBody, 
            },
          });
        }
      },

    },
    reducers: {
      save(state, action) {
        return {
          ...state,
          ...action.payload
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
  };
  