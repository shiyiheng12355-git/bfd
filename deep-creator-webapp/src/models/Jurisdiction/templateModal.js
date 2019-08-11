import {arrayToTree ,webAPICfg,toTree} from '../../utils'
import { getTreeData } from '../../services/api';
import { deepcreatorweb } from 'deep-creator-sdk';
import {notification,Icon} from 'antd'
const ApiFp = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);//模板管理
// arrayToTree
export default {
  namespace: 'template/modal',

  state: {
    loading: true,
    controlType: '',
    treeMap:{},
    tableData:[{
      name:'ID名字',
      desensitization:"脱敏规则",
      desensitizationBefor:'脱敏之前',
      desensitizationAfter:'脱敏之后',
      isShow:true,
      ifDesensitization:true
    }],
    TreeData:[],//功能集合
    TreeData1:{},//实体属性(行)
    TreeData2:{}//列表单数据
  },

  effects: {
    

    
    *saveResourceTemplate({payload, callback}, { call, put }) {
      const {success} = yield ApiFp.smTemplateSaveOperTemplatePost({smOperTemplateInfo:{
        resourceList:payload.resourceList,
        smTemplateInfo:payload.smTemplateInfo
      }});
      if(success){
        callback&&callback();
      }
      notification.open({
        message: '提示',
        description: success?'操作成功':'操作失败',
        icon: success?<Icon type="check-circle" style={{ color: 'green' }} />:<Icon type="exclamation-circle"  style={{ color: 'red' }}/>,
      });
    },
    *isExitTemplateName({payload, callback}, { call, put }){
      const {resultBody, success} = yield ApiFp.smTemplateIsExitTemplateNameGet({templateName:payload});
      if(success){
        callback&&callback(resultBody);
      }
    }
  },

  reducers: {
    getTreeData(state, { payload }) {
      let map = {},
          date = {};
      date[`TreeData${payload.index}`] = payload.data;
      // payload = arrayToTree(payload,'id','pid','children',map);
      return {
        ...state,
        ...date,
        treeMap:map
      };
    },


    changeModal(state, { payload }){
      return {
        ...state,
        modalData: payload.modalData,
      };
    },
    
    
  },
};
