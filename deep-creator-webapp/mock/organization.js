export const organizationList = [
	{
		id: 1,
		name: '线下事件速码',
		desc: '线下事件的字段值编码及对应页面上显示的字段值',
		code: '1032345',
		state:1,
	},
	{
		id: 2,
		name: '地区速码',
		desc: '地区的字段值编码及对应页面显示的字段值',
		code: '1032345',
		state:0,
	},
	{
		id: 3,
		name: '标签渠道',
		desc: '标签来源',
		code: '1231311',
		state:1, 
	},
	{
		id: 4,
		name: 'E-mail接口配置',
		desc: 'E-mail的字段值编码及对应页面显示的字段值',
		code: '1032345',
		state:0,
	},
];
export const organizationType = [{
	name:'百度',
	id:'1234'
},{
	name:'百分点科技',
	id:'6666'
}];

export const classification = [{
	id:1,
	name:'南区'
},{
	id:2,
	name:'华北'
}]
export const organizationDetail = [{
	      id: 1,
	      name: '标签管理',
	      nodeType:1,//组织
	      type: '南区',
	      isp:true,
	      code: '1234243',
	      desc: '标签的查看与管理',
	      state:1,
	      children: [{
	        id: 13,
	        name: '用户标签管理',
	        type: '华北',
	        nodeType:2,//部门
	        isp:false,
	        code: '1234243',
	        desc: '用户标签体系的管理',
	        state:0,
	        children: [{
	          id: 111,
	          name: '编辑模式',
	          nodeType:2,//组织
	          type: '华北',
	          code: '1234243',
	          isp:false,
	          desc: '进入用户标签编辑模式',
	          state:1,
	          children: [{
				id: 1111,
				name: '新增一级分类',
				type: '华北',
				nodeType:2,//组织
				code: '1234243',
				isp:false,
				desc: '进入用户标签编辑模式',
				state:1,
	          }],
	        }],
	      },{
	        id: 15,
	        name: '用户标签管理',
	        type: '华北',
	        nodeType:1,//组织
	        isp:false,
	        code: '1234243',
	        desc: '用户标签体系的管理',
	        state:0,
	      }],
	    }];

export const UserList = [
	{
		id: 1,
		name: 'admin',
		rname: 'root',
		state:1,
	},
	{
		id: 2,
		name: 'zxy',
		rname: '张三',
		state:0,
	},
	{
		id: 3,
		name: 'ls',
		rname: '李四',
		state:1, 
	},
	{
		id: 4,
		name: 'ww',
		rname: '王五',
		state:0,
	},
];

export const treeData = [
	{
		id:1,
		name :"一级分类：1",
		pid :0,
	},
	{
		id:2,
		name :"二级分类：1",
		pid :1,
	},
	{
		id:3,
		name :"三级分类：3",
		pid :2,
	},
	{
		id:4,
		name :"一级分类：2",
		pid :0,
	},
	{
		id:7,
		name :"f级分类：2",
		pid :4,
	},
	{
		id:10,
		name :"f级分类：2",
		pid :7,
	},
	{
		id:9,
		name :"f级分类：2",
		pid :10,
	},
	{
		id:12,
		name :"f级分类：2",
		pid :9,
	},
	{
		id:15,
		name :"f级分类：2",
		pid :12,
	},
	{
		id:13,
		name :"f级分类：2",
		pid :15,
	},
	{
		id:19,
		name :"f级分类：9",
		pid :15,
	},
]
export const funnelList =  {
	"currentPage": "1",
	"elements": [
		{
			"status": 1,
			"creation_time": "2017-11-01 19:41:38",
			"funnel_name": "北京资产余额10万以上且有理财需求的客户购买漏斗",
			"path_info": [
				{
					"step_id": 1,
					"entry_count": 0,
					"step_name": "客户点击理财产品推荐链接",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 2,
					"entry_count": 0,
					"step_name": "下载APP",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 3,
					"entry_count": 0,
					"step_name": "用户注册",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 4,
					"entry_count": 0,
					"step_name": "用户登录",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 5,
					"entry_count": 0,
					"step_name": "浏览理财产品",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 6,
					"entry_count": 0,
					"step_name": "购买理财产品",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 7,
					"entry_count": 0,
					"step_name": "付款成功",
					"entry_ratio": 0,
					"trans_ratio": 0
				}
			],
			"funnel_id": "9ea673",
			"serial_id": 1
		},
		{
			"status": 1,
			"creation_time": "2017-10-17 17:31:03",
			"funnel_name": "APP开户转化漏斗",
			"path_info": [
				{
					"step_id": 1,
					"entry_count": 0,
					"step_name": "开户-验证手机号",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 2,
					"entry_count": 0,
					"step_name": "开户-上传身份证正面",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 3,
					"entry_count": 0,
					"step_name": "开户-上传身份证背面",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 4,
					"entry_count": 0,
					"step_name": "开户-个人信息填写",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 5,
					"entry_count": 0,
					"step_name": "开户-视频认证",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 6,
					"entry_count": 0,
					"step_name": "开户-开立账户沪A",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 7,
					"entry_count": 0,
					"step_name": "开户-开通现金宝",
					"entry_ratio": 0,
					"trans_ratio": 0
				},
				{
					"step_id": 8,
					"entry_count": 0,
					"step_name": "开户-开户成功APP下载",
					"entry_ratio": 0,
					"trans_ratio": 0
				}
			],
			"funnel_id": "e473c5",
			"serial_id": 2
		}
	],
	"totalPageNum": 1,
	"pageSize": "10",
	"totalCounts": 2,
}
export const funnelDetail = {
    "elements": {
        "status": 1,
        "creation_time": "2017-11-01 19:41:38",
        "funnel_name": "北京资产余额10万以上且有理财需求的客户购买漏斗",
        "window": 85440,
        "path_info": [{
            "trans_ratio": "100%",
            "entry_ratio": "100%",
            "group_list": [],
            "expression_text": "[客户端:金融行业APP端(android)][事件:北京资产余额10万以上客户点击理财产品推荐链接]",
            "entry_count": 29912,
            "step_name": "客户点击理财产品推荐链接",
            "step_id": 1,
            "user_group_id": "5f06480cf7348a34"
        }, {
            "trans_ratio": "45.32%",
            "entry_ratio": "45.32%",
            "group_list": [],
            "expression_text": "[客户端:金融行业APP端(android)][事件:下载APP]",
            "entry_count": 13556,
            "step_name": "下载APP",
            "step_id": 2,
            "user_group_id": "77653c3adfb0e29a"
        }, {
            "trans_ratio": "37.84%",
            "entry_ratio": "83.50%",
            "group_list": [],
            "expression_text": "[客户端:金融行业APP端(android)][事件:用户注册]",
            "entry_count": 11319,
            "step_name": "用户注册",
            "step_id": 3,
            "user_group_id": "2a566a67e94a76a8"
        }, {
            "trans_ratio": "37.05%",
            "entry_ratio": "97.91%",
            "group_list": [],
            "expression_text": "[客户端:金融行业APP端(android)][事件:用户登陆]",
            "entry_count": 11082,
            "step_name": "用户登录",
            "step_id": 4,
            "user_group_id": "0b92f88b0bac8fe3"
        }, {
            "trans_ratio": "32.33%",
            "entry_ratio": "87.27%",
            "group_list": [],
            "expression_text": "[客户端:金融行业APP端(android)][事件:浏览理财产品]",
            "entry_count": 9671,
            "step_name": "浏览理财产品",
            "step_id": 5,
            "user_group_id": "8b8336e8ab8e6cfa"
        }, {
            "trans_ratio": "8.39%",
            "entry_ratio": "25.95%",
            "group_list": [],
            "expression_text": "[客户端:金融行业APP端(android)][事件:点击购买按钮]",
            "entry_count": 2510,
            "step_name": "购买理财产品",
            "step_id": 6,
            "user_group_id": "1d4587959914afc3"
        }, {
            "trans_ratio": "2.22%",
            "entry_ratio": "26.49%",
            "group_list": [],
            "expression_text": "[客户端:金融行业APP端(android)][事件:成功付款]",
            "entry_count": 665,
            "step_name": "付款成功",
            "step_id": 7,
            "user_group_id": "3de129ef80632061"
        }],
        "is_cross_client": 0,
        "cross_expression": "",
        "funnel_id": "9ea673",
        "desc": ""
    }
}
export default { organizationList, organizationDetail, organizationType, classification, UserList, treeData, funnelList, funnelDetail };
