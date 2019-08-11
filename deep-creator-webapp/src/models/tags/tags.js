import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg, toTree } from '../../utils';
import cloneDeep from 'lodash/cloneDeep';
import { message, notification, Icon } from 'antd';
import { fetchKeySearch, fetchSearch,cancelAddTag } from '../../services/api'

const tagCateAPI = deepcreatorweb.BiztagcategorycontrollerApiFp(webAPICfg);
const tagNameAPI = deepcreatorweb.BiztagnamecontrollerApiFp(webAPICfg);
const tagValueAPI = deepcreatorweb.BiztagvaluecontrollerApiFp(webAPICfg);

function* wrapper(cb, put) {
  yield put({
    type: 'changeLoading',
    payload: true,
  });
  yield cb()
  yield put({
     type: 'changeLoading',
     payload: false,
   });
}

function* getData (api, params, call){
  let response = yield call(api, params)
  let promise = response.json()
  let data = yield promise.then(res => res)
  return data
}

export default {
  namespace: 'tags/tags',
  state: {
    list: [], // 标签树数据
    loading: true,
    tagCateData: null, // 分类的节点数据
    tagNameData: null, // 标签名的节点数据
    tagValueData: null, // 标签值的节点数据
    isAddRootTag: false, // 是否是一级分类
    valueList: [], // 标签值列表
    dataSource: [],
    AutoValue: '',
    isNew: false,
  },
  effects: {
    // 标签名称是否为新增
    *isNewChange({ payload }, { put, call, select }) {
      yield put({
        type: 'saveIsNew',
        payload: payload,
      });
    },
    // 标签名称关键词模糊搜索
    *fetchKeySearch({ payload, callback }, { put, call, select }) {
      let { resultBody, success } = yield getData(fetchKeySearch, payload, call)
      if(success) {
        yield put({
          type: 'saveDataSource',
          payload: resultBody,
        });
        typeof callback === 'function' && callback();
      }
    },
    //新增标签名称 编辑模式下取消 需要重新发个取消的请求 test 
    *cancelAddTag({ payload }, { call, put, select }) {
      let params ={};
      params.id=payload.id;
      let { resultBody, success } = yield getData(cancelAddTag,params,call);
      if(success) {
        //message.warning('取消新增标签名称成功')
      }else{
        notification.error({ message: '查询失败', description: errorMsg || resultBody })
      }
    },
    // 标签查询
    *fetchSearch({ payload }, { put, call, select }) {
      yield put({
        type: 'save',
        payload: [],
      });

      let { resultBody, success, errorMsg } = yield getData(fetchSearch, payload, call)
      if(success) {
        if(resultBody){
          const resultBodyToTree = toTree(resultBody, 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName');
          console.log(resultBodyToTree)
          yield put({
            type: 'save',
            payload: resultBodyToTree,
          });

        }else{
          message.warning('未查询到相关数据')
        }

      }else{
        notification.error({ message: '查询失败', description: errorMsg || resultBody })
      }
    },
    // 查询all标签分类列表（包含标签名）
    *fetch({ payload }, { put, call }) {
      yield wrapper(function* () {

        yield put({
          type: 'clearResultBodyToTree'
        })

        yield put({
          type: 'save',
          payload: [],
        });

        const { resultBody, success } = yield tagCateAPI.bizTagCategoryTagCategoryAndTagNameListGet({ ...payload });
        if (success) {
          const resultBodyToTree = toTree(resultBody, 'categoryEnglishName', 'parentCategoryEnglishName', 'tagEnglishName');
          console.log(resultBodyToTree)
          yield put({
            type: 'save',
            payload: resultBodyToTree,
          });
        }
      }, put)
    },
    // 根据标签名唯一标识(tagEnglishName)查询标签值列表
    *fetchValue({ payload }, { put, call, select }) {
      yield wrapper(function* () {
        let { resultBody, errorMsg, success } = yield tagValueAPI.bizTagValueListByTagEnglishNameGet({ ...payload });
        if (success) {
          if (resultBody && resultBody.length > 0) {
            const { list } = yield select(_ => _['tags/tags']);
            let arrayClone = cloneDeep(list);
            // 打标记
            resultBody.map((item) => { item.isLast = true });
            // 添加数据
            const addLastTags = (array) => {
              array.map((item, i) => {
                (item.tagEnglishName && item.tagEnglishName === payload.tagEnglishName) ?
                item.children = resultBody :
                (item.children && item.children.length > 0) ? addLastTags(item.children) : null
              });
            };
            addLastTags(arrayClone);
            // console.log(arrayClone,123)
            console.log(arrayClone)
            yield put({
              type: 'save',
              payload: arrayClone,
            });
          }
        }else{
          notification.error({ message: '查询失败', description: errorMsg || resultBody });
        }
       }, put);
    },
    // 根据标签唯一标识(tagEnglishName)查询标签名详情
    *fetchTagName({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        // clear tagNameData
        yield put({
          type: 'saveTagName',
          payload: null,
        });
        // TODO get tagName data
        const { success, resultBody, errorMsg } = yield tagNameAPI.bizTagNameLabelInfoGet({ ...payload })
        if (success) {
          yield put({
            type: 'saveTagName',
            payload: resultBody,
          });
          typeof callback === 'function' && callback();
        }else{
          notification.error({ message: '查询失败', description: errorMsg || resultBody });
        }
      }, put);
    },
    *fetchTagInfoExceptCover({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        // clear tagNameData
        yield put({
          type: 'saveTagName',
          payload: null,
        });
        // TODO get tagName data
        console.log('###')
        console.log(payload)
        const { success, resultBody, errorMsg } = yield tagNameAPI.bizTagNameTagInfoExceptCoverGet({ ...payload })
        if (success) {
          yield put({
            type: 'saveTagName',
            payload: resultBody,
          });
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '查询失败', description: errorMsg || resultBody });
        }
      }, put);
    },
    // 根据标签值唯一标识(tagEnglishValueTitle)查询标签值信息
    *fetchTagValue({ payload }, { put, call, select }) {
      yield wrapper(function* () {
        const { resultBody } = yield tagValueAPI.bizTagValueInfoGet({ ...payload });
        yield put({
          type: 'saveTagValue',
          payload: resultBody,
        });
      }, put);
    },
    // 插入标签分类
    *insertTagCate({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        // console.log(payload, 'payload...')
        const { success, resultBody } = yield tagCateAPI.bizTagCategorySysEntityIdAddPost({ bizTagCategoryVO: payload, sysEntityId: payload.entityId });
        if (success) {
          message.success(resultBody);
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '添加失败', description: resultBody })
        }
      }, put);
    },
    // 插入标签名
    *insertTagName({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        const { success, resultBody } = yield tagNameAPI.bizTagNameSysEntityIdAddPost({ bizTagNameVO: payload, sysEntityId: payload.entityId });
        if (success) {
          message.success(resultBody)
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '添加失败', description: resultBody })
        }
      }, put);
    },
    // 删除标签分类
    *delTagCate({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        const {success, resultBody} = yield tagCateAPI.bizTagCategorySysEntityIdDelDelete({ ...payload });
        if (success) {
          message.success(resultBody)
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '删除失败', description: resultBody })
        }
      }, put);
    },
    // 删除标签名
    *delTagName({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        const { success, resultBody } = yield tagNameAPI.bizTagNameSysEntityIdDelDelete({ ...payload });
        if (success) {
          if (resultBody){
            message.success(resultBody)
            typeof callback === 'function' && callback();
          }else{
            notification.error({ message: '删除失败', description: resultBody })
          }
        } else {
          notification.error({ message: '删除失败', description: resultBody })
        }
      }, put);
    },
    // 编辑标签分类
    *editTagCate({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        const { success, resultBody } = yield tagCateAPI.bizTagCategorySysEntityIdUpdatePut({ bizTagCategoryVO: { ...payload }, sysEntityId: payload.entityId });
        if (success) {
          message.success(resultBody);
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '修改失败', description: resultBody })
        }
      }, put);
    },
    *queryValueListByTagName({ payload, callback }, { put, call, select }) { 

      yield wrapper(function* () {
        //const { success, resultBody } = yield tagValueAPI.bizTagValueListByTagEnglishNameGet({ ...payload });
        //清楚tagList缓存
        yield put({
          type: 'clearValueList'
        })
        const { success, resultBody } = yield tagValueAPI.bizTagValueTagValueListExceptCoverGet({ ...payload })
        if (success) {
          yield put({
            type: 'saveValueList',
            payload: resultBody,
          })
        }
      }, put);
    },
    // 编辑标签名
    *editTagName({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        //console.log(JSON.stringify(payload),'payload>>>>>>')
        const { success, resultBody, errorMsg } = yield tagNameAPI.bizTagNameSysEntityIdUpdatePut(payload)
        if (success) {
          message.success(resultBody);
          typeof callback === 'function' && callback();
        } else {
          notification.error({ message: '修改失败', description: errorMsg || resultBody })
        }
      }, put);
    },
    // 标签值删除
    *delTagValueByTagValueTitle({ payload, callback }, { put, call, select }) {
      yield wrapper(function* () {
        const { success, resultBody, errorMsg } = yield tagValueAPI.bizTagValueDeleteTagValueGet({ ...payload });
        if (success) {
          if (resultBody){
            message.success(resultBody);
            typeof callback === 'function' && callback();
          }else{
            notification.error({ message: '删除失败', description: resultBody }) 
          }
        } else {
          notification.error({ message: '删除失败', description: resultBody })
        }
      }, put);
    },
  },
  reducers: {
    saveIsNew(state, action) {
      return {
        ...state,
        isNew: action.payload,
      };
    },
    saveDataSource(state, action) {
      return {
        ...state,
        dataSource: action.payload,
      };
    },
    clearDataSource(state, action) {
      return {
        ...state,
        dataSource: [],
      };
    },
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveTagName(state, action) {
      return {
        ...state,
        tagNameData: action.payload,
      };
    },
    saveTagValue(state, action) {
      return {
        ...state,
        tagValueData: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    setIsAddRootTag(state, action) {
      return {
        ...state,
        isAddRootTag: action.payload,
      };
    },
    setTagCateData(state, action) {
      return {
        ...state,
        tagCateData: action.payload,
      };
    },
    saveValueList(state, action) {
      return {
        ...state,
        valueList: action.payload,
      };
    },
    clearValueList(state, action){
       return {
         ...state,
         valueList: [],
       };
     },
     clearResultBodyToTree(state, action){
      return {
        ...state,
        resultBodyToTree: [],
      };
    },
    addRowToValueList(state, action) {
      const { valueList } = state;
      const newData = {
        id: new Date().getTime(),
        tagEnglishValueTitle: '',
        tagEnglishValueTitle_edit: true,
        tagValueTitle: '',
        tagValueTitle_edit: true,
        isAdd: true,
      }
      return {
        ...state,
        valueList: [...valueList, newData],
      };
    },
    delFromValueList(state, action) {
      const { valueList } = state;
      // console.log(action, valueList)
      let a = [];
      valueList.map((item) => {
        let flag = true;
        action.payload.map((_item) => {
          if (item.tagEnglishValueTitle == _item.tagEnglishValueTitle) {
            flag = false;
          }
        });
        if (flag) a.push(item);
      });
      return {
        ...state,
        valueList: a,
      };
    },
    onCellChange(state, action) {
      const { index, key, value, flag } = action.payload;
      let valueList = [...state.valueList];
      if(value !== undefined)  valueList[index][key] = value;
      valueList[index][`${key}_edit`] = flag;
      return {
        ...state,
        valueList,
      };
    },
    changeGlobalParams(state, action) {
      const { index, key, value } = action.payload;
      let _ = state.tagNameData;
      let paramConditionJson = _ && _.paramConditionJson && JSON.parse(_.paramConditionJson);
      paramConditionJson.global[index][key] = value;
      _.paramConditionJson = JSON.stringify(paramConditionJson);
      return {
        ...state,
        tagNameData: _,
      }
    },
    changeTagsParams(state, action) {
      const { row, col, key, value, isChild } = action.payload;
      let _ = state.tagNameData;
      let paramConditionJson = _ && _.paramConditionJson && JSON.parse(_.paramConditionJson);
      if (isChild) {
        paramConditionJson.tags[row].condition[col][key] = value;
      } else {
        paramConditionJson.tags[row][key] = value;
      }
      _.paramConditionJson = JSON.stringify(paramConditionJson);
      return {
        ...state,
        tagNameData: _,
      }
    },
    addTagValue(state, action) {
      let _ = state.tagNameData;
      let paramConditionJson = _ && _.paramConditionJson && JSON.parse(_.paramConditionJson);
      let node = cloneDeep(paramConditionJson.tags[0]);
      if (node.hasOwnProperty('tag')) node.tag = '';
      if (node.hasOwnProperty('tag_english_name')) node.tag_english_name = '';
      node.condition &&
      node.condition.length > 0 &&
      node.condition.map((item, i) => {
        if (item.hasOwnProperty('range')) item.range = { gte: null, lte: null }
        if (item.hasOwnProperty('value')) item.value = null;
      })
      paramConditionJson.tags.push(node);
      _.paramConditionJson = JSON.stringify(paramConditionJson);
      return {
        ...state,
        tagNameData: _,
      }
    },
    delTagValue(state, action) {
      let _ = state.tagNameData;
      let paramConditionJson = _ && _.paramConditionJson && JSON.parse(_.paramConditionJson);
      paramConditionJson.tags.splice(action.payload, 1);
      _.paramConditionJson = JSON.stringify(paramConditionJson);
      return {
        ...state,
        tagNameData: _,
      }
    },
    clear(state, action) {
      return {
        ...state,
        list: [],
        valueList: [],
      }
    },
    success(state, action) {
      message.success(action.paylod.content);
      return { ...state }
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
