import {arrayToTree ,webAPICfg,toTree} from '../../../utils'
import { deepcreatorweb } from 'deep-creator-sdk';
import {notification,Icon} from 'antd'
const ApiFp = deepcreatorweb.SmresourceinfocontrollerApiFp(webAPICfg);//资源表
const ApiFp2 = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);//模板设置
// arrayToTree
export default {
    namespace: 'template/modal/template1',

    state: {
        loading: true,
        treeMap:{},
        templateDate:null,
        TreeData:[],//功能集合
    },

    effects: {
        // 获取功能集合
        *fetchTreeData(_, { call, put }) {
            const {resultBody,success} = yield ApiFp.smResourceInfoQueryResourceListGet({});
            if(success){

                yield put({
                    type: 'getTreeData',
                    payload: resultBody
                });
            }
        },
        *fetchEditData({ payload,callback }, { call, put }){
            let {resultBody,success} = yield ApiFp2.smTemplateFindTemplateAndResourceByTemplateIdGet({templateId:payload});
            resultBody.resourceList = resultBody.resourceList.map(item=>{return {resourceKey:item.resourceKey}})
            // console.log('111',resultBody.resourceList)
            
            if(success){

                // yield put({
                //     type: 'getTemplate',
                //     payload: resultBody
                // });
                callback && callback(resultBody);
            }
        }
    },
    reducers: {
        getTreeData(state, { payload }) {
          let map = {};
          payload = arrayToTree(payload,'resourceKey','parentResourceKey','resourceSet',map);
          return {
            ...state,
            TreeData:payload,
            treeMap:{
                pid:'parentResourceKey',
                map:map}
          };
        },
        getTemplate(state,{payload}){
            return {
                ...state,
                templateDate:payload
            };
        },
    
        changeModal(state, { payload }){
          return {
            ...state,
            modalData: payload.modalData,
          };
        },
        
        
      },
}