import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg, arrayToTree } from '../utils';

const codingApi = deepcreatorweb.SminitdictionarycontrollerApiFp(webAPICfg);

export default {
  namespace: 'coding',

  state: {
    loading: true,
    tableData: {},
    visible: false,
    addInfo: {},
  },

  effects: {
  	*fetchTableData({ payload }, { call, put }) {
      const label = !payload || !payload.label ? '' : payload.label
      const pageNum = !payload || !payload.pageNum ? 1 : payload.pageNum
      const { resultBody } = yield codingApi.smInitDictionaryQueryCategoryListGet({ categoryLabel: label, pageNum, pageSize: 10 })
  		yield put({
        type: 'getTableData',
        payload: resultBody,
      });
    },

    *fetchSaveCategory({ payload, callback }, { call, put }) {
      const smInitDictionaryCategoryInfo = payload
     /*  const result = yield codingApi.smInitDictionaryIsExistCodeGet({ code: payload.categoryCode })
      if (result.resultBody) {
        notification.error({ message: '保存失败', description: 'code重复' });
        return
      } */
      const { resultBody, errorMsg } = yield codingApi.smInitDictionarySaveCategoryPost({ smInitDictionaryCategoryInfo })
      if (resultBody) {
        message.success('保存成功');
      } else {
        notification.error({ message: '保存失败', description: errorMsg });
        return
      }
      yield put({
        type: 'fetchTableData',
      });
      yield put({
        type: 'handleCloseModal',
      })
      callback && callback()
    },


    *fetchDelCategory({ payload }, { call, put }) {
      const categoryCodeArray = typeof (payload) === 'string' ? [payload] : payload;
      const { resultBody } = yield codingApi.smInitDictionaryBatchDelByCategoryCodeDelete({ categoryCodeArray })
      yield put({
        type: 'fetchTableData',
      });
    },

    *fetchDetailData({ payload, callback }, { call, put }) {
      const categoryCode = !payload || !payload.categoryCode ? '' : payload.categoryCode
      const codeLabelOrCode = !payload || !payload.codeLabelOrCode ? '' : payload.codeLabelOrCode
      const pageNum = !payload || !payload.pageNum ? 1 : payload.pageNum
      const { resultBody } = yield codingApi.smInitDictionaryQueryCodeListGet({ categoryCode, codeLabelOrCode, pageNum, pageSize: 10 })
      yield put({
        type: 'getTableData',
        payload: resultBody,
      });
      callback && callback(resultBody)
    },
    *fetchSaveDetailCategory({ payload, callback }, { call, put }) {
      const smInitDictionaryCodeInfo = payload
      const result = yield codingApi.smInitDictionaryIsExistCodeGet({ code: payload.codeValueCode })
      if (result.resultBody) {
        notification.error({ message: '保存失败', description: '速码分类重复' });
      } else {
        const { resultBody, errorMsg } = yield codingApi.smInitDictionarySaveCodeValuePost({ smInitDictionaryCodeInfo })
        if (resultBody) {
          message.success('保存成功');
          yield put({
            type: 'fetchDetailData',
            payload: { categoryCode: payload.categoryCode },
          });
          yield put({
            type: 'handleCloseModal',
          })
          callback && callback()
        } else {
          notification.error({ message: '保存失败', description: `页面显示${errorMsg}` });
        }
      }
    },

    *fetchDelDetailCategory({ payload }, { call, put }) {
      const { categoryCode } = payload
      const codeValueCodeArray = typeof (payload.dictionaryCode) === 'string' ? [payload.dictionaryCode] : payload.dictionaryCode;
      const { resultBody } = yield codingApi.smInitDictionaryBatchDelByCodeValueCodeDelete({ codeValueCodeArray })
      yield put({
        type: 'fetchDetailData',
        payload: { categoryCode },
      });
    },
    *fetchUpdateCode({ payload }, { call, put }) {
      const { id, dictionaryCode, dictionaryLabel } = payload
      const result = yield codingApi.smInitDictionaryEditCodeValueIdPut({ id, dictionaryCode, dictionaryLabel })

      if (result.resultBody) {
        message.success('修改成功');
      } else {
        notification.error({ message: '修改失败', description: result.errorMsg });
      }
    },
  },


  reducers: {
  	getTableData(state, { payload }) {
  		return {
  			...state,
  			tableData: payload,
        loading: false,
        visible: false,
  		};
  	},
    openModal(state, { payload }) {
      return {
        ...state,
        visible: true,
      }
    },
    handleCloseModal(state) {
      return {
        ...state,
        visible: false,
      };
    },
  },
};
