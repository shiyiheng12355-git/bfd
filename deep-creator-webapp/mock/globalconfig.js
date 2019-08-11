export const apiConfigData = [
	{
		name: 'E-mail接口配置',
		children: [
			{
				name: 'SMTP端口号',
				value: '',
			},
			{
				name: 'SMTP服务器地址',
				value: '',
			},
			{
				name: 'SMTP服务邮箱账号',
				value: '',
			},
			{
				name: 'SMTP服务邮箱密码',
				value: '',
			},
		],
	},
	{
		name: '短信接口配置',
		children: [
			{
				name: '短信平台用户名',
				value: '',
			},
			{
				name: '短信平台密码',
				value: '',
			},
			{
				name: '短信平台密匙文件',
				value: '',
			},
		],
	},
	{
		name: '客服系统在线接口配置',
		children: [
			{
				name: '接口地址',
				value: '',
			},
			{
				name: '接口端口',
				value: '',
			},
		],
	},
	{
		name: '客服系统数据库接口配置',
		children: [
			{
				name: '数据库地址',
				value: '',
			},
			{
				name: '数据库库名',
				value: '',
			},
			{
				name: '数据库表名',
				value: '',
			},
		],
	},
];

export const paramsConfigData = [
	{
		index: 1,
		name: 'taesaaa',
		business: '手机号',
		flagbusiness: true,
		flagname: false,
		flagexpend: false,
	},
	{
		index: 2,
		name: 'daesaaa',
		business: 'H5引流渠道',
		flagbusiness: false,
		flagname: false,
		flagexpend: false,
	},
	{
		index: 3,
		name: 'sid',
		business: 'session ID',
		flagbusiness: false,
		flagname: false,
		flagexpend: false,
	},
	{
		index: 4,
		name: 'gid',
		business: '用户唯一标识',
		flagbusiness: false,
		flagname: false,
		flagexpend: false,
	},
];

export const organizeConfigData = [
	{
		id: 1,
		sqlName: 'gorup',
		showName: '虚拟分组',
		expendRow: [],
	},
];

export const organizeLoadData = [
	{
		id: 1,
		update: '2017-12-12 12:00',
		user: 'admin',
		fileName: '用户标签.csv',
	},
];

export const detailOffline = [
	{
		id: 1,
		dataType: 'offline',
		sqlName: 'count',
		showName: '交易金额',
		type: 'int',
		vaildRow: false,
		vaildCol: false,
		selectType: [
			{
				value: '1',
				name: '线下事件速码',
			},
			{
				value: '2',
				name: '地区速码',
			}
		],
	},
	{
		id: 2,
		dataType: 'offline',
		sqlName: 'membership',
		showName: '会员等级',
		type: 'string',
		vaildRow: true,
		vaildCol: false,
		selectType: [
			{
				value: '1',
				name: '线下事件速码',
			},
			{
				value: '2',
				name: '地区速码',
			}
		],
	},
];

export const detailOnline = [
	{
		id: 1,
		dataType: 'online',
		sqlName: 'location',
		showName: '交易地点',
		type: 'int',
		vaildRow: false,
		vaildCol: false,
		selectType: [
			{
				value: '1',
				name: '线下事件速码',
			},
			{
				value: '2',
				name: '地区速码',
			}
		],
	},
	{
		id: 2,
		dataType: 'online',
		sqlName: 'time',
		showName: '交易时间',
		type: 'string',
		vaildRow: true,
		vaildCol: false,
		selectType: [
			{
				value: '1',
				name: '线下事件速码',
			},
			{
				value: '2',
				name: '地区速码',
			}
		],
	},
];

export const basicUserID = [
	{
		id: 1,
		dataType: 'id',
		sqlName: 'phone',
		showName: '手机',
		type: [
			{
				value: 'int',
				name: 'int',
			},
			{
				value: 'float',
				name: 'float',
			},
			{
				value: 'bool',
				name: 'bool',
			},
			{
				value: 'string',
				name: 'string'
			}
		],
		vaildRow: true,
		vaildCol: false,
		selectType: [
			{
				value: '1',
				name: '系统内置手机脱敏模板',
			},
			{
				value: '2',
				name: '系统内置身份证脱敏模板',
			},
			{
				value: '3',
				name: '系统内置邮箱模板'
			},
			{
				value: '4',
				name: '系统内置QQ脱敏模板'
			}
		],
		expendRow: [
			{
				index: 1,
				value: ''
			},
			{
				index: 2,
				value: ''
			}
		],
	},
	{
		id: 2,
		dataType: 'id',
		sqlName: 'IDnumber',
		showName: '身份证',
		type: [
			{
				value: 'int',
				name: 'int',
			},
			{
				value: 'float',
				name: 'float',
			},
			{
				value: 'bool',
				name: 'bool',
			},
			{
				value: 'string',
				name: 'string'
			}
		],
		vaildRow: false,
		vaildCol: false,
		selectType: [
			{
				value: '1',
				name: '系统内置手机脱敏模板',
			},
			{
				value: '2',
				name: '系统内置身份证脱敏模板',
			},
			{
				value: '3',
				name: '系统内置邮箱模板'
			},
			{
				value: '4',
				name: '系统内置QQ脱敏模板'
			}
		],
		expendRow: [],
	},
];

export const basicUserProps = [
	{
		id: 1,
		dataType: 'props',
		sqlName: 'Native place',
		showName: '籍贯',
		type: [
			{
				value: 'int',
				name: 'int',
			},
			{
				value: 'float',
				name: 'float',
			},
			{
				value: 'bool',
				name: 'bool',
			},
			{
				value: 'string',
				name: 'string'
			}
		],
		vaildRow: false,
		vaildCol: false,
		expendRow: []
	},
	{
		id: 2,
		dataType: 'props',
		sqlName: 'name',
		showName: '姓名',
		type: [
			{
				value: 'int',
				name: 'int',
			},
			{
				value: 'float',
				name: 'float',
			},
			{
				value: 'bool',
				name: 'bool',
			},
			{
				value: 'string',
				name: 'string'
			}
		],
		vaildRow: true,
		vaildCol: false,
		expendRow: []
	},
];

export default {
	apiConfigData,
	paramsConfigData,
	organizeConfigData,
	organizeLoadData,
	detailOffline,
	detailOnline,
	basicUserProps,
	basicUserID,
};
