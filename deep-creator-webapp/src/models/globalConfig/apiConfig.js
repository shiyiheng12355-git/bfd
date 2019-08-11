import { deepcreatorweb } from 'deep-creator-sdk';
import { message, notification } from 'antd';
import { webAPICfg } from '../../utils';
import _ from 'lodash';

const apiConfig = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg)

const getSubTree = (tree, id, ID = 'id', children = 'children') => {
	let _tree = tree;
	let subTree = null;
	if (!(_tree instanceof Array)) {
		_tree = [_tree];
	}
	let nodes = _tree;
	while (nodes.length) {
		const node = nodes.find(_node => _node[ID] === id);
		if (node) {
			subTree = node;
			break;
		} else {
			nodes = nodes.reduce((pre, current) => {
				if (current[children]) return pre.concat(current[children]);
				return pre;
			}, []);
		}
	}
	return subTree;
}

export default{
	namespace: 'gloablConfig/apiConfig',

	state: {
		apiData: [],
	},

	effects: {
		*fetchApiConfig(_, { call, put }) {
			const { resultBody } = yield apiConfig.globalConfigurationQueryInterfaceGet()
			yield put({
				type: 'getData',
				payload: resultBody,
			});
		},

		*fatchSave({ payload }, { put }) {
			const result = yield apiConfig.globalConfigurationSaveInterfacePost({ smConfigKvInfos: payload })
			if (result.resultBody) {
        message.success('保存成功');
			} else {
        notification.error({ message: '保存失败', description: result.errorMsg });
			}
		},

	},

	reducers: {
		getData(state, { payload }) {
			return {
				...state,
				apiData: payload,
			};
		},
		editInput(state, { payload }) {
			const { apiData } = state
			getSubTree(apiData, payload.configKey, 'configKey', 'list').configValue = payload.configValue
			return {
				...state,
				...apiData,
			}
		},
	},
};
