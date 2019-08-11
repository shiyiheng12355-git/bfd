import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';

const detailConfigApiFP = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg)
const codingApi = deepcreatorweb.SminitdictionarycontrollerApiFp(webAPICfg);
export default{
	namespace: 'gloablConfig/detailConfig',

	state: {
		offlineList: [],
		clientList: [],
		selectList: [],
	},

	effects: {
		*fetchTableData(_, { call, put }) {
			const { resultBody } = yield detailConfigApiFP.globalConfigurationQueryDetailListGet()
			yield put({
				type: 'fetchSelectList',
			})
			yield put({
				type: 'getTableData',
				payload: resultBody,
			});
		},

		*fetchSaveData({ payload }, { call, put }) {
			const { errorMsg, resultBody } = yield detailConfigApiFP.globalConfigurationSaveDetailInitPost({ smEntityConfigInfos: payload })
			if (resultBody) {
        message.success('保存成功');
			} else {
        notification.error({ message: '保存失败', description: errorMsg })
			}
			yield put({
				type: 'fetchTableData',
			})
		},

		*fetchDelItem({ payload }, { call, put }) {
			const { resultBody, errorMsg } = yield detailConfigApiFP.globalConfigurationInitColumnDelIdDelete({ id: payload })
			if (resultBody) {
        message.success('删除成功');
				yield put({
					type: 'fetchTableData',
				})
			} else {
        notification.error({ message: '删除失败', description: errorMsg })
			}
		},

		*fetchSelectList(_, { call, put }) {
			const { resultBody } = yield codingApi.smInitDictionaryQueryALLCategoryListGet()
			yield put({
				type: 'getSelectData',
				payload: resultBody,
			})
		},


	},

	reducers: {
		getTableData(state, { payload }) {
			return {
				...state,
				clientList: payload.clientList,
				offlineList: payload.offlineList,
			};
		},

		getSelectData(state, { payload }) {
			return {
				...state,
				selectList: payload,
			};
		},

		addObj(state, { payload }) {
			const { clientList, offlineList } = state
			if (payload.configType === 4) {
				offlineList.push(payload)
				return {
					...state,
					...offlineList,
				}
			} else {
				clientList.push(payload)
				return {
					...state,
					...clientList,
				}
			}
		},

		updataData(state, { payload }) {
			const { item } = payload
			const { offlineList, clientList } = state
			console.log(item)
			if (item.configType === 4) {
				offlineList.map((items) => {
					if (items.configType === item.configType && items.id === item.id) {
						items = item
					}
				})
				return {
					...state,
					...offlineList,
				}
			} else if (item.configType === 3) {
				clientList.map((items) => {
					if (items.configType === item.configType && items.id === item.id) {
						items = item
					}
				})
				return {
					...state,
					...clientList,
				}
			}
		},

		delObj(state, { payload }) {
			const { offlineList } = state
			const { index } = payload
			offlineList.splice(index, 1)
			return {
				...state,
				...offlineList,
			}
		},
	},
};
