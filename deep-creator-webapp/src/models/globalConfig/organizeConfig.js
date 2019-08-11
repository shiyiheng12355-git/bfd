import { deepcreatorweb } from 'deep-creator-sdk';
import { webAPICfg } from '../../utils';

const organizeConfigApiFP = deepcreatorweb.GlobalconfigurationcontrollerApiFp(webAPICfg)
export default{
	namespace: 'gloablConfig/organizeConfig',

	state: {
		tableData: [],
	},

	effects: {
		*fetchTableData(_, { call, put }) {
			const { resultBody } = yield organizeConfigApiFP.globalConfigurationImportOrgListGet()
			yield put({
				type: 'getTableData',
				payload: resultBody,
			});
		},
	},

	reducers: {
		getTableData(state, { payload }) {
			return {
				...state,
				tableData: payload,
			};
		},
	},
};
