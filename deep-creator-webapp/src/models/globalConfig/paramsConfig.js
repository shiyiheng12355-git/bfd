import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';
import _ from 'lodash'

const paramsConfigApiFP = deepcreatorweb.EventactioncontrollerApiFp(webAPICfg)
const regApiFP = deepcreatorweb.SmconfigcidregcontrollerApiFp(webAPICfg)

export default{
	namespace: 'gloablConfig/paramsConfig',

	state: {
		tableData: [],
		appKeyList: [],
		eventList: [],
		AndroidList: [],
		IOSList: [],
		urlList: [],
		regList: [],
	},

	effects: {
		*fetchAppKeyList(_, { call, put }) {
			const { resultBody } = yield paramsConfigApiFP.eventActionQueryAppListGet({ isExtend: 1 })
			yield put({
				type: 'getAppKeyList',
				payload: resultBody,
			});

			yield put({
				type: 'fetchEventList',
				payload: resultBody[0].appkey,
			})

			yield put({
				type: 'fetchIOSData',
			})

			yield put({
				type: 'fetchAndroidData',
			})
		},

		*fetchEventList({ payload }, { call, put }) {
			const appKey = payload
			const { resultBody } = yield paramsConfigApiFP.eventActionQueryEventListByAppIdGet({ appKey })
			yield put({
				type: 'getEventList',
				payload: resultBody,
			})
			yield put({
				type: 'fetchTableData',
				payload: resultBody[0].id,
			})
		},

		*fetchTableData({ payload }, { call, put }) {
			const eventId = payload
			const { resultBody } = yield paramsConfigApiFP.eventActionQueryConfigEventListGet({ eventId })
			yield put({
				type: 'getTableData',
				payload: resultBody,
			})
		},

		*fetchIOSData({ payload }, { call, put }) {
			const { resultBody } = yield paramsConfigApiFP.eventActionQueryAppListGet({ isExtend: 0, terminal: 'IOS' })
			yield put({
				type: 'getIOSList',
				payload: resultBody,
			})
		},

		*fetchAndroidData({ payload }, { call, put }) {
			const { resultBody } = yield paramsConfigApiFP.eventActionQueryAppListGet({ isExtend: 0, terminal: 'Android' })
			yield put({
				type: 'getAndroidList',
				payload: resultBody,
			})
		},

		*saveMergeAppkey({ payload }, { call, put }) {
			const { appkeyOne, appkeyTwo, name } = payload
			const { success, errorMsg, resultBody } = yield paramsConfigApiFP.eventActionSaveBizMergeAppkeyPost({ bizMergeAppkeyInfo: { appkeyOne, appkeyTwo, name } })

			if (success) {
        message.success('保存成功');
			} else {
        notification.error({ message: '保存失败', description: errorMsg })
			}
		},

		*saveConfigEvent({ payload }, { call, put }) {
			const smConfigEventInfos = payload
			const result = yield paramsConfigApiFP.eventActionSaveConfigEventPost({ smConfigEventInfos })
			if (result.resultBody) {
        message.success('保存成功');
			} else {
        notification.error({ message: '保存失败', description: result.errorMsg });
			}
		},

		*fetchCheckName({ payload, callback }, { put }) {
			const { resultBody } = yield paramsConfigApiFP.eventActionCheckAppkeyNameGet({ appkeyName: payload })
			if (resultBody) {
				notification.error({ message: '保存失败', description: '合并的客户端不能重名' });
			} else {
				callback && callback()
			}
		},

		*fetchUrlParams({ payload }, { put }) {
			const { resultBody } = yield paramsConfigApiFP.eventActionQueryAppListGet({ isExtend: 1, terminal: 'PC' })
			yield put({
				type: 'setUrlList',
				payload: resultBody,
			})
		},

		*fetchRegList({ payload, callback }, { put }) {
			const { resultBody } = yield regApiFP.smConfigCidRegQueryConfigCidRegListGet({ appkey: payload })
			yield put({
				type: 'setRegList',
				payload: resultBody,
			})
			callback && callback(resultBody)
		},

		*fetchSaveRegList({ payload, callback }, { put }) {
			console.log(payload)
			const { resultBody, success, errorMsg } = yield regApiFP.smConfigCidRegSaveConfigCidRegInfoPost({ smConfigCidRegInfos: payload })
			if (!success) {
				notification.error({ message: '保存失败', description: errorMsg });
			}
			if (success && resultBody) {
				message.success('保存成功')
				callback && callback()
			}
		},

	},

	reducers: {
		getAppKeyList(state, { payload }) {
			return {
				...state,
				appKeyList: payload,
			};
		},

		getEventList(state, { payload }) {
			return {
				...state,
				eventList: payload,
			}
		},

		getTableData(state, { payload }) {
			return {
				...state,
				tableData: payload,
			}
		},

		getIOSList(state, { payload }) {
			return {
				...state,
				IOSList: payload,
			}
		},

		getAndroidList(state, { payload }) {
			return {
				...state,
				AndroidList: payload,
			}
		},

		setUrlList(state, { payload }) {
			return {
				...state,
				urlList: payload,
			}
		},

		setRegList(state, { payload }) {
			return {
				...state,
				regList: payload,
			}
		},

		addRegList(state, { payload }) {
			const { regList } = state
			regList.push(payload)
			return {
				...state,
				...regList,
			}
		},

		editRegList(state, { payload }) {
			const { regList } = state
			const { value, index } = payload
			regList[index].regExp = value
			return {
				...state,
				...regList,
			}
		},

		delRegList(state, { payload }) {
			const { regList } = state
			const { index } = payload
			regList.splice(index - 1, 1)
			return {
				...state,
				...regList,
			}
		},

		moveRegList(state, { payload }) {
			const { regList } = state
			const { index, moveType } = payload
			let position

			moveType === 'up' ? position = index - 1 : position = index + 1;
			// regList.splice(index - 1, 1, ...regList.splice(position - 1, 1, regList[index - 1]))
			[regList[index], regList[position]] = [regList[position], regList[index]]
			return {
				...state,
				...regList,
			}
		},

		editColumns(state, { payload }) {
			const { tableData } = state
			const { paramId, appKey, eventId, item } = payload
			tableData.map((items) => {
				if (items.paramId === paramId && item.appKey === appKey && item.eventId === eventId) {
					items = item
				}
			})
			return {
				...state,
				...tableData,
			}
		},

	},
};
