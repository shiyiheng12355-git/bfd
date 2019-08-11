export const getCoding = [
	{
		id: 1,
		type: '线下事件速码',
		desc: '线下事件的字段值编码及对应页面上显示的字段值',
	},
	{
		id: 2,
		type: '地区速码',
		desc: '地区的字段值编码及对应页面显示的字段值',
	},
	{
		id: 3,
		type: '标签渠道',
		desc: '标签来源',
		test: '1231311',
	},
	{
		id: 4,
		type: 'E-mail接口配置',
		desc: 'E-mail的字段值编码及对应页面显示的字段值',
	},
	{
		id: 5,
		type: '推荐内容 ID及属性列表',
		desc: '策略模板中可选项参数来源配置及前端页面显示',
		data: [
			{ code: 'iid', name: '物品ID' },
			{ code: 'price', name: '物品价格' }],
	},
	{
		id: 6,
		type: '用户行为参数配置',
		desc: '策略模板中可选项参数来源配置及前端页面显示',
		data: [{ code: '', name: '' }],
	},
	{
		id: 7,
		type: '算法实例列表',
		desc: '策略模板中可选项参数来源配置及前端页面显示',
		data: [{ code: '', name: '' }],
	},
	{
		id: 8,
		type: '获取热榜字段',
		desc: '策略模板中可选项参数来源配置及前端页面显示',
		data: [{ code: '', name: '' }],
	},
	{
		id: 9,
		type: '获取热榜字段',
		desc: '策略模板中可选项参数来源配置及前端页面显示',
		data: [{ code: '', name: '' }],
	},
	{
		id: 10,
		type: '热榜天数',
		desc: '策略模板中可选项参数来源配置及前端页面显示',
		data: [{ code: '', name: '' }],
	},
];

export const detailCoding = [
	{
		index: 1,
		code: '010',
		name: '北京',
	},
	{
		index: 2,
		code: '021',
		name: '上海',
	},
	{
		index: 3,
		code: '022',
		name: '天津',
	},
	{
		index: 4,
		code: '023',
		name: '重庆',
	},
];
export default { getCoding, detailCoding };
