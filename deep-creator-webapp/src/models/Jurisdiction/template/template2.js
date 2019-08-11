import { arrayToTree, webAPICfg, toTree } from '../../../utils'
import { deepcreatorweb } from 'deep-creator-sdk';
import { notification, Icon } from 'antd'
const ApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);
const ApiFp2 = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
// arrayToTree
export default {
    namespace: 'template/modal/template2',

    state: {
        loading: true,
        controlType: '',
        treeMap: {},
        entityData: [],
        TreeData: {},//功能集合
    },

    effects: {
        // 获取功能集合
        *fetchQueryEntityAttribute(_, { call, put }) {
            function getList(arr){
                let data = [];
                arr.map(item=>{
                    if(item.codeValueList){
                        item.codeValueList.map(ite=>{
                            ite.pid = item.initColumnId
                            data.push(ite)
                        })
                    }
                    delete item.codeValueList
                    item.dictionaryCode = item.initColumnId;
                    item.dictionaryLabel = item.columnTitle;
                    data.push(item)
                })
                return data
            }
            const { resultBody, success } = yield ApiFp2.smConfigEntityQueryConfigEntityListGet();
            let treeData = {};
            let data = {},
                map = {},
                arr=[],
                data2 = {};
            if (success) {
                for (var i = 0, len = resultBody.length; i < len; i++) {
                    data = yield ApiFp.smTemplateQueryEntityAttributeGet({ entityId: resultBody[i].id });
                    data2 = yield ApiFp.smTemplateQueryEntityTagGet({ entityId: resultBody[i].id });
                    //功能
                    treeData[`fun${resultBody[i].id}`] = {
                        treeList:[],
                        map:{}
                    }
                    if (data.success) {
                        arr = arrayToTree(getList(data.resultBody),'dictionaryCode','pid','codeValueList',map)
                        treeData[`fun${resultBody[i].id}`] = {
                            treeList:arr,
                            map:{
                                pid:'pid',
                                map:map
                            }
                        }
                    }
                    //渠道
                    treeData[`cha${resultBody[i].id}`] = {
                        treeList:[],
                        map:{}
                    }
                    map = {};
                    if (data2.success && data2.resultBody[0] && data2.resultBody[0].codeValueList) {
                        arr = arrayToTree(data2.resultBody[0].codeValueList.map(item => {
                            item.initColumnId = data2.resultBody[0].initColumnId
                            return item
                        }),'dictionaryCode','pid','codeValueList',map)

                        treeData[`cha${resultBody[i].id}`] = {
                            treeList:arr,
                            map:{
                                pid:'pid',
                                map:map
                            }
                        }
                    }
                }
            }

            // 获取客户端Key
            data = yield ApiFp.smTemplateQueryAppKeyGet();
            data2 = data.resultBody;
            treeData['7'] ={
                treeList:[],
                map:{}
            };
            map = {};
            if (data.success) {
                arr = arrayToTree(data2||[] ,'appkey','pid','codeValueList',map)

                treeData['7'] = {
                    treeList:arr,
                    map:{
                        pid:'pid',
                        map:map
                    }
                };
            }
            // 线下交易
            data = yield ApiFp.smTemplateQueryOfflineTransactionGet();
            data2 = data.resultBody;
            map = {};
            treeData['8'] ={
                treeList:[],
                map:{}
            };
            if (data.success) {
                arr = arrayToTree(getList(data2),'dictionaryCode','pid','codeValueList',map)

                treeData['8'] ={
                    treeList:arr,
                    map:{
                        pid:'pid',
                        map:map
                    }
                };
            }
            console.log(treeData);
            yield put({
                type: 'getTreeData',
                payload: {
                    treeData: treeData,
                    entityData: resultBody
                }
            });
        },
        *fetchEditData({ payload,callback }, { call, put ,select}){
            function getList(arr){
                let data = [];
                arr.map(item=>{
                    if(item.codeValueList){
                        item.codeValueList.map(ite=>{
                            ite.pid = item.initColumnId
                            ite.pname = item.columnTitle
                            data.push({
                                initColumnId:item.initColumnId,
                                cellCode:ite.dictionaryCode
                            })
                        })
                    }
                })
                return data
            }
            // const {TreeData} = yield select(_ => _['template/modal/template2']);
            // if(Object.keys(TreeData).length == 0){
            //     yield put({
            //         type:'fetchQueryEntityAttribute'
            //     })
            // }
            const { resultBody, success } = yield ApiFp2.smConfigEntityQueryConfigEntityListGet();
            let treeData = {};
            let data = {},
                map = {},
                arr=[],
                data2 = {};
            if (success) {
                for (var i = 0, len = resultBody.length; i < len; i++) {
                    data = yield ApiFp.smTemplateQueryAlreadyEditEntityIdGet({ entityId: resultBody[i].id, id:payload});
                    data2 = yield ApiFp.smTemplateQueryAlreadyEditEntityActionIdGet({ entityId: resultBody[i].id, id:payload });
                    //功能
                    treeData[`fun${resultBody[i].id}`] = {
                        treeList:[],
                        map:{}
                    }
                    if (data.success) {
                        //arr = arrayToTree(getList(data.resultBody),'dictionaryCode','pid','codeValueList',map)
                        treeData[`fun${resultBody[i].id}`] = getList(data.resultBody);
                    }
                    //渠道
                    treeData[`cha${resultBody[i].id}`] = []
                    map = {};
                    if (data2.success && data2.resultBody[0] && data2.resultBody[0].codeValueList) {
                        // arr = arrayToTree(data2.resultBody[0].codeValueList.map(item => {
                        //     item.initColumnId = data2.resultBody[0].initColumnId
                        //     return item
                        // }),'dictionaryCode','pid','codeValueList',map)

                        treeData[`cha${resultBody[i].id}`] = getList(data2.resultBody);
                    }
                }
            }

            // 获取客户端Key
            data = yield ApiFp.smTemplateQueryRowAuthorityTemplateIdGet({id:payload});
            data2 = data.resultBody;
            data2.offlineTransactionInfo = getList(data2.offlineTransactionInfo);
            // data2.templateInfo = data2.smTemplateInfo;
            treeData = {...data2,...treeData};
            // console.log(treeData);
            callback && callback(treeData);
        },
        *saveTemplate({ payload,callback }, { call, put }) {
            let data = {};
            function formatArr(Arr){
                if(!Arr) return []
                let data = [];
                Arr.map((item,index)=>{
                    if(item&&item.length>0){
                        data.push({
                            entityId:index,
                            smEntityAttributeInfo:item
                        })
                    }
                })
                return data
            }

            data={
                appKey:payload.appKey||[],
                entityAttributeInfo:formatArr(payload.entityAttributeInfo),
                entityTagInfo:formatArr(payload.entityTagInfo),
                smTemplateInfo:payload.smTemplateInfo,
                offlineTransactionInfo:payload.offlineTransactionInfo
            }
            const {resultBody, success, errorMsg} = yield ApiFp.smTemplateSaveRowAuthorityTemplatePost({rowAuthorityTemplateInfo:data});
            if(success){
                callback&&callback();
            }
            notification.open({
                message: '提示',
                description: success?'操作成功':(errorMsg||'操作失败'),
                icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
            });
        },
    },
    reducers: {
        getTreeData(state, { payload }) {
            let map = {};
            // payload = arrayToTree(payload,'id','pid','children',map);
            return {
                ...state,
                TreeData: payload.treeData,
                treeMap: map,
                entityData: payload.entityData
            };
        },


        changeModal(state, { payload }) {
            return {
                ...state,
                modalData: payload.modalData,
            };
        },


    },
}