import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../utils';
import { notification } from 'antd';
import { queryPostList, deletePost, addPost, queryOptionOfGN, queryOptionOfHang, queryOptionOfLie, updatePost, queryPostUser, queryPostExist } from '../../services/api';

function* getData (api, params, call){
  let response = yield call(api, params)
  let promise = response.json()
  let data = yield promise.then(res => res)
  return data
}

const ApiFp3 = deepcreatorweb.SmtemplatecontrollerApiFp(webAPICfg);

export default {
  namespace: 'jurisdiction/postManage',

  state: {
    postList: [],
    postUser: [],
  },

  effects: {
    // 查询岗位信息
    *queryPostList({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield getData(queryPostList, payload, call)

      if(success) {
        yield put({
          type: 'update',
          payload: { postList: resultBody.list },
        })
        callback && callback(resultBody)
      }else{
        notification.error({ message: '查询失败！', description: errorMsg || resultBody })
      }
    },

    // 删除岗位
    *deletePost({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield getData(deletePost, payload, call)

      if(success) {
        notification.success({ message: '删除成功！' })
        callback && callback()
      }else{
        notification.error({ message: '删除失败！', description: errorMsg || resultBody })
      }
    },

    // 新增岗位
    *addPost({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield getData(addPost, payload, call)

      if(success) {
        notification.success({ message: '添加成功！' })
        callback && callback()
      }else{
        notification.error({ message: '添加失败！', description: errorMsg || resultBody })
      }
    },

    // 获取功能模板
    *queryOptionOfGN({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield ApiFp3.smTemplateQuerySmTemplateListGet({ templateType: 1 });

      if(success) {
        yield put({
          type: 'update',
          payload: { Option_gn: resultBody },
        })
        callback && callback(resultBody)
      }
    },

    // 获取行模板
    *queryOptionOfHang({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield ApiFp3.smTemplateQuerySmTemplateListGet({ templateType: 2 });

      if(success) {
        yield put({
          type: 'update',
          payload: { Option_hang: resultBody },
        })
        callback && callback(resultBody)
      }
    },

    // 获取列模板
    *queryOptionOfLie({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield ApiFp3.smTemplateQuerySmTemplateListGet({ templateType: 3 });

      if(success) {
        yield put({
          type: 'update',
          payload: { Option_lie: resultBody },
        })
        callback && callback(resultBody)
      }
    },

    // 修改岗位
    *updatePost({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield getData(updatePost, payload, call)

      if(success) {
        notification.success({ message: '修改成功！' })
        callback && callback()
      }else{
        notification.error({ message: '修改失败！', description: errorMsg || resultBody })
      }
    },

    // 查询岗位用户
    *queryPostUser({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield getData(queryPostUser, payload, call)

      if(success) {
        yield put({
          type: 'update',
          payload: { postUser: resultBody },
        })
      }
    },

    // 岗位名称查重
    *queryPostExist({ payload, callback }, { call, put, select }) {
      let { resultBody, success, errorMsg } = yield getData(queryPostExist, payload, call)

      if(success) {
        callback && callback(resultBody)
      }
    },
  },

  reducers: {
    update(state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
}
