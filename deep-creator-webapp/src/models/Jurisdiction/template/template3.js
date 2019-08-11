import { arrayToTree, webAPICfg, toTree } from '../../../utils'
import { deepcreatorweb } from 'deep-creator-sdk';
import { notification, Icon } from 'antd'

const ApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);
const ApiFp2 = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg);
// arrayToTree
export default {
  namespace: 'template/modal/template3',

  state: {
    loading: true,
    controlType: '',
    treeMap: {},
    tableData: [],
    entityData: [], // 实体列表
    offlineList: [], // 线下
    TreeData: {}, // 功能集合
  },

  effects: {

    // 获取列表单数据（列）
    *fetchQueryIdAndTagByEntityId({ payload }, { call, put }) {
      const { resultBody, success } = yield ApiFp2.smConfigEntityQueryConfigEntityListGet();
      let treeData = {};
      let data = {};
      let map = {};
      let arr = [];
      if (success) {
        for (let i = 0, len = resultBody.length; i < len; i++) {
          data = yield ApiFp.smTemplateQueryIdAndTagByEntityIdGet({ entityId: resultBody[i].id });
          treeData[`${resultBody[i].id}`] = {
            treeList: [],
            idList: [],
          };
          if (data.success) {
            map = {};
            arr = toTree(data.resultBody.treeList, 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName', (item) => {
              if (item && item.categoryEnglishName) {
                item.tagEnglishName = item.categoryEnglishName;
                item.tagName = item.categoryName;
              }
              return item
            }, map);
            treeData[`${resultBody[i].id}`] = {
              treeList: arr,
              idList: data.resultBody.idList,
              map: {
                pid: 'parentCategoryEnglishName',
                map,
              },
            }
          }
        }
      }
      let offlineList = yield deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg).globalConfigurationQueryInitColumnListGet({ configType: 4 })

      yield put({
        type: 'getTreeData',
        payload: {
          treeData,
          entityData: resultBody,
          offlineList: offlineList.resultBody,
        },
      });
    },
    *saveTemplate({ payload, callback }, { call, put }) {
      // console.log('hahaha....', payload.idList, payload.offlineList, payload.smTemplateInfo, payload.tagList);
      let data = {};

      data = {
        idList: payload.idList ? payload.idList.reduce((a, b) => {
          return a.concat(b);
        }) : [],
        offlineList: payload.offlineList ? payload.offlineList.map((item) => {
          return {
            initColumnId: item.id,
            isDesensitize: 0,
            isVisual: 0,
          }
        }) : [],
        smTemplateInfo: payload.smTemplateInfo,
        tagList: payload.tagList ? payload.tagList.reduce((a, b) => {
          return a.concat(b)
        }) : [],
      }
      console.log('表单============================', JSON.stringify(data));
      const { resultBody, success } = yield ApiFp.smTemplateSaveColumnTemplatePost({ smColumnTemplateInfo: data });
      if (success) {
        callback && callback();
      }
      notification.open({
        message: '提示',
        description: success ? '操作成功' : '操作失败',
        icon: success ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    },
    *fetchEditData({ payload, callback }, { call, put }) {
      const { resultBody, success } = yield ApiFp2.smConfigEntityQueryConfigEntityListGet();
      let treeData = {};
      let data = {};
      let map = {};
      let arr = [];
      if (success) {
        for (let i = 0, len = resultBody.length; i < len; i++) {
          data = yield ApiFp.smTemplateFindIdAndTagByEntityIdAndTemplateIdGet({ entityId: resultBody[i].id, templateId: payload });
          treeData[`${resultBody[i].id}`] = {
            treeList: [],
            idList: [],
            tagList: [],
          };
          if (data.success) {
            map = {};
            arr = toTree(data.resultBody.treeList, 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName', (item) => {
              if (item && item.categoryEnglishName) {
                item.tagEnglishName = item.categoryEnglishName;
                item.tagName = item.categoryName;
              }
              return item
            }, map);
            treeData[`${resultBody[i].id}`] = {
              treeList: arr,
              idList: data.resultBody.idList,
              tagList: data.resultBody.tagList,
              map: {
                pid: 'parentCategoryEnglishName',
                map,
              },
            }
          }
        }
      }
      let offlineList = yield ApiFp.smTemplateFindTemplateAndOfflineByTemplateIdGet({ templateId: payload })


      callback && callback({
        treeData,
        offlineList: offlineList.resultBody,
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
        entityData: payload.entityData,
        offlineList: payload.offlineList,
        treeMap: map,
      };
    },
    setIdList(state, { payload }) {
      let { TreeData } = state;
      const { templateData, entityId, index } = payload;
      let data = TreeData[entityId].idList[index];
      templateData.afterExample && (data.afterExample = templateData.afterExample);
      templateData.beforeExample && (data.beforeExample = templateData.beforeExample);
      templateData.id && (data.safeTemplateId = templateData.id);
      templateData.templateName && (data.templateName = templateData.templateName);
      templateData.isDesensitize !== undefined && (data.isDesensitize = templateData.isDesensitize);
      return {
        ...state,
        TreeData,
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