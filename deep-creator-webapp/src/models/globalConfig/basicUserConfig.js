import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';

const baseConfigApiFP = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg)
const baseConfigTabApiFP = deepcreatorweb.SmconfigentitycontrollerApiFp(webAPICfg)
const codingApi = deepcreatorweb.SminitdictionarycontrollerApiFp(webAPICfg);
const safeTemplateApiFp = deepcreatorweb.SmsafetemplatecontrollerApiFp(webAPICfg)

export default{
	namespace: 'gloablConfig/basicUserConfig',

	state: {
		tabData: [],
		templateList: [],
		categoryList: [],
		detailList: [],
		idList: [],
		visible: false,
		currentEntity: null,
	},

	effects: {
		*fetchTabData(_, { call, put, select }) {
			
			//清除tab选中实体的缓存
			yield put({
				type:'clearTabCurrentEntity'
			})

			const { resultBody } = yield baseConfigTabApiFP.smConfigEntityQueryConfigEntityListGet()
			const { currentEntity } = yield select(state => state['gloablConfig/basicUserConfig'])
			console.log('current', currentEntity)
			yield put({
				type: 'setTabData',
				payload: resultBody,
			})
			yield put({
				type: 'fetchTableData',
				payload: currentEntity || resultBody[0].id,
			})

			yield put({
				type: 'fetchTemplateList',
				payload: currentEntity || resultBody[0].id,
			})

			yield put({
				type: 'fetchCategoryList',
			})
		},

		*fetchTableData({ payload }, { call, put }) {
			const { resultBody } = yield baseConfigApiFP.globalConfigurationQueryEntityInitListGet({ entityId: payload })
			yield put({
				type: 'setCurrentEntity',
				payload,
			})
			yield put({
				type: 'setTableData',
				payload: resultBody,
			})
		},

		*fetchCategoryList(_, { call, put }) {
			const { resultBody } = yield codingApi.smInitDictionaryQueryALLCategoryListGet()
			yield put({
				type: 'setCategoryList',
				payload: resultBody,
			})
		},

		*fetchTemplateList({ payload }, { call, put }) {
			const { resultBody } = yield safeTemplateApiFp.smSafeTemplateQuerySafeTemplateListGet({ templateType: null })
			yield put({
				type: 'setTemplateList',
				payload: resultBody,
			})
		},

		*fetchSaveData({ payload, callback }, { call, put }) {
			const { resultBody, errorMsg } = yield baseConfigApiFP.globalConfigurationSaveEntityInitPost({ smEntityConfigInfos: payload })
			if (resultBody) {
				message.success('保存成功');
			} else {
        notification.error({ message: '保存失败', description: errorMsg });
			}
			yield put({
				type: 'fetchTabData',
			})
			callback && callback()
		},

		*fetchDelItem({ payload }, { call, put }) {
			const { resultBody, errorMsg } = yield baseConfigApiFP.globalConfigurationInitColumnDelIdDelete({ id: payload })
			if (resultBody) {
        message.success('删除成功');
				yield put({
					type: 'fetchTabData',
				})
			} else {
        notification.error({ message: '删除失败', description: errorMsg });
			}
		},

		*fetchSaveEntity({ payload, callback }, { call, put }) {
			const { resultBody, errorMsg } = yield baseConfigTabApiFP.smConfigEntitySaveConfigEntityPost({ smConfigEntityInfo: payload })
			if (resultBody) {
        message.success('添加成功');
				yield put({
					type: 'fetchTabData',
				})
				yield put({
					type: 'openModal',
					payload: false,
				})
				callback && callback()
			} else {
        notification.error({ message: '添加失败', description: errorMsg });
			}
		},
	},

	reducers: {
		setTabData(state, { payload }) {
			return {
				...state,
				tabData: payload,
			}
		},

		setCurrentEntity(state, { payload }) {
			return {
				...state,
				currentEntity: payload,
			}
		},

		setTableData(state, { payload }) {
			const { idList, detailList } = state
			return {
				...state,
				idList: payload.idList,
				detailList: payload.detailList,
			}
		},

		setCategoryList(state, { payload }) {
			return {
				...state,
				categoryList: payload,
			};
		},

		setTemplateList(state, { payload }) {
			return {
				...state,
				templateList: payload,
			};
		},

		addObj(state, { payload }) {
			const { idList, detailList } = state
			if (payload.configType === 1) {
				idList.push(payload)
				return {
					...state,
					...idList,
				}
			} else {
				detailList.push(payload)
				return {
					...state,
					...idList,
				}
			}
		},

		delObj(state, { payload }) {
			const { idList, detailList } = state
			const { configType, index } = payload
			if (configType === 1) {
				idList.splice(index, 1)
				return {
					...state,
					...idList,
				}
			} else {
				detailList.splice(index, 1)
				return {
					...state,
					...idList,
				}
			}
		},
		//清除缓存
		clearTabCurrentEntity(state, action){
			return {
			  ...state,
			  currentEntity: null,
			};
		  },

		updataData(state, { payload }) {
			const { item } = payload
			const { detailList, idList } = state
			if (item.configType === 2) {
				detailList.map((items) => {
					if (items.configType === item.configType && items.id === item.id) {
						items = item
					}
				})

				return {
					...state,
					...detailList,
				}
			} else if (item.configType === 1) {
				idList.map((items) => {
					if (items.configType === item.configType && items.id === item.id) {
						items = item
					}
				})
				return {
					...state,
					...idList,
				}
			}
		},

		openModal(state, { payload }) {
			return {
				...state,
				visible: payload,
			}
		},
	},
};
