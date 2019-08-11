import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Table, Checkbox, Select, Button, message } from 'antd';
import EditModal from './editModal'

const Option = Select.Option;
const limitCode = ['sid', 'tma', 'tmc', 'cid', 'tmd', 'gid', 'stime', 'ctime', 'v', 'appkey']

@connect(state => ({
	data: state['gloablConfig/paramsConfig'],
}))

export default class ParamConfig extends Component {
	state = {
		columns: [
			{
	      title: '序号',
				dataIndex: 'index',
				render: (text, record, index) => {
					return index + 1
				},
	    },
	    {
	      title: '参数名称',
				dataIndex: 'fieldName',
	    },
	    {
	      title: '业务含义',
				dataIndex: 'paramBizDesc',
	      render: (text, record) => {
					const { saveData } = this.state
					let savedText = null
					saveData.map((item) => {
						if (item.appKey === record.appKey && item.eventId === record.eventId && item.paramId === record.paramId) {
							savedText = item.paramBizDesc
						}
					})
	      	return (
						<Input value={savedText || text} onChange={(e) => { this.handleCheck(e, record, 'paramBizDesc') }} />
					)
				},
	    },
	    {
	      title: '通用业务筛选',
				dataIndex: 'isScreen',
	      render: (text, record) => {
					const { saveData } = this.state
					let savedText = null
					let flag = true
					limitCode.indexOf(record.fieldName) === -1 ? flag = false : flag = true
					saveData.map((item) => {
						if (item.appKey === record.appKey && item.eventId === record.eventId && item.paramId === record.paramId) {
							savedText = item.isScreen
						}
					})
      	 	return (<Checkbox
						checked={savedText !== null ? savedText : text}
						disabled={flag}
						onChange={(e) => { this.handleCheck(e, record, 'isScreen') }}>
      		</Checkbox>)
				},
	    },
     	{
	      title: '事件名称补充',
				dataIndex: 'isSupplement',
	      render: (text, record) => {
					const { saveData } = this.state
					let savedText = null
					saveData.map((item) => {
						if (item.appKey === record.appKey && item.eventId === record.eventId && item.paramId === record.paramId) {
							savedText = item.isSupplement
						}
					})
      	 	return (<Checkbox
						checked={savedText !== null ? savedText : text}
						onChange={(e) => { this.handleCheck(e, record, 'isSupplement') }}>
          </Checkbox>)
				},
	    },
	    {
	      title: '事件内容展开',
				dataIndex: 'isDisplay',
	      render: (text, record) => {
					const { saveData } = this.state
					let savedText = null
					saveData.map((item) => {
						if (item.appKey === record.appKey && item.eventId === record.eventId && item.paramId === record.paramId) {
							savedText = item.isDisplay
						}
					})
      	 	return (<Checkbox
						checked={savedText !== null ? savedText : text}
						onChange={(e) => { this.handleCheck(e, record, 'isDisplay') }}>
          </Checkbox>)
				},
	    },
		],
		columnsUrl: [
			{
				title: '网站名称',
				dataIndex: 'appkeyName',
			},
			{
				title: '操作',
				dataIndex: '',
				render: (item, record) => (
					<a href='javascript:;' onClick={() => { this.handleEditModal(record) }}>编辑</a>
				),
			},
		],
		saveData: [],
		name: '',
		initalVal: {
			appKeyList: null,
			eventList: null,
			AndroidList: null,
			IOSList: null,
		},
		visible: false,
		urlName: null,
	}

	componentDidMount() {
		this.props.dispatch({
			type: 'gloablConfig/paramsConfig/fetchAppKeyList',
		})

		this.props.dispatch({
			type: 'gloablConfig/paramsConfig/fetchUrlParams',
		})
	}

	handleCheck = (e, item, key) => {
		const value = e.target.value || (e.target.checked ? 1 : 0)
		const { paramId, appKey, eventId } = item
		const { saveData } = this.state
		const hasKey = saveData.findIndex((x) => {
			return x.paramId === paramId && x.appKey === appKey && x.eventId === eventId
		})
		if (hasKey === -1) {
			item[key] = value
			saveData.push(item)
		} else {
			saveData[hasKey][key] = value
		}

		this.props.dispatch({
			type: 'gloablConfig/paramsConfig/editColumns',
			payload: { paramId, item },
		})
	}

	handleChange = (value, changeType) => {
		const { appKeyList, eventList, AndroidList, IOSList } = this.props.data
		const { initalVal } = this.state
		initalVal[changeType] = value

		switch (changeType) {
			case 'appKeyList':
				this.props.dispatch({
					type: 'gloablConfig/paramsConfig/fetchEventList',
					payload: value,
				})
				initalVal.eventList = null
				break;
			case 'eventList':
				this.props.dispatch({
					type: 'gloablConfig/paramsConfig/fetchTableData',
					payload: value,
				})
				break;
			case 'AndroidList':
				this.setState({ AndroidApp: value })
				break;
			case 'IOSList':
				this.setState({ IOSApp: value })
				break;
			default:
				break;
		}
		this.setState({ initalVal })
	}

	handleMergeName = (e) => {
		this.setState({ name: e.target.value })
	}

	handleEditModal = (item) => {
		this.props.dispatch({
			type: 'gloablConfig/paramsConfig/fetchRegList',
			payload: item.appkey,
			callback: (result) => {
				this.setState(
					{
						appkey: item.appkey,
						urlName: item.appkeyName,
						visible: true,
					}
				)
			},
		})
	}

	modalCtrl = (type, value, index, moveType) => {
		switch (type) {
			case 'add':
				this.props.dispatch({
					type: 'gloablConfig/paramsConfig/addRegList',
					payload: {
						regExp: '',
						isAdd: true,
					},
				})
				break;
			case 'save':
				{
					const { appkey } = this.state
					const { regList } = this.props.data
					const regExp = []
					const nullFlag = regList.every((item, i, a) => {
						return item.regExp !== ''
					})
					if (!nullFlag) {
						message.warning('正则表达式不能为空')
						return
					}

					regList.map((item) => {
						regExp.push(item.regExp)
					})
					this.props.dispatch({
						type: 'gloablConfig/paramsConfig/fetchSaveRegList',
						payload: { appkey, regExp },
						callback: () => {
							this.setState({ visible: false })
						},
					})
				}
				break;
			case 'edit':
				this.props.dispatch({
					type: 'gloablConfig/paramsConfig/editRegList',
					payload: {
						value,
						index,
					},
				})
				break;
			case 'del':
				this.props.dispatch({
					type: 'gloablConfig/paramsConfig/delRegList',
					payload: { index },
				})
				break;
			case 'move':
				this.props.dispatch({
					type: 'gloablConfig/paramsConfig/moveRegList',
					payload: { index, moveType },
				})
				break;
			default:
				this.setState({ visible: false })
				break;
		}
	}

	handleSave = () => {
		const { saveData, AndroidApp, IOSApp, name, initalVal } = this.state
		const appkeyOne = !AndroidApp ? this.props.data.AndroidList[0].appkey : AndroidApp
		const appkeyTwo = !IOSApp ? this.props.data.IOSList[0].appkey : IOSApp

		if (saveData.length !== 0) {
			this.props.dispatch({
				type: 'gloablConfig/paramsConfig/saveConfigEvent',
				payload: saveData,
			})
		}

		if (name) {
			this.props.dispatch({
				type: 'gloablConfig/paramsConfig/fetchCheckName',
				payload: name,
				callback: () => {
					this.props.dispatch({
						type: 'gloablConfig/paramsConfig/saveMergeAppkey',
						payload: { appkeyOne, appkeyTwo, name },
					})
				},
			})
		}

		this.setState({ saveData: [] })
	}

	handleReset = () => {
		this.setState({ saveData: [], name: '' })
		this.props.dispatch({
			type: 'gloablConfig/paramsConfig/fetchAppKeyList',
		})
	}

	renderSelect = (list, val, name, changeType) => {
		const { initalVal } = this.state
		return list.length !== 0 ? (
			<Select value={initalVal[changeType] || list[0][val]} style={{ width: 120, marginRight: 8 }} onChange={(value) => { this.handleChange(value, changeType) }}>
				{
					list.map((item, index) => {
						return (<Option key={index} value={item[val]} >{item[name]}</Option>)
					})
				}
			</Select>
		) : ''
	}

	render() {
		const { columns, columnsUrl, visible, urlName } = this.state
		const { tableData, appKeyList, eventList, AndroidList, IOSList, urlList, regList } = this.props.data
		return (
			<div>
				<div>事件参数配置：</div>
				<div style={{ marginBottom: 16 }}>
					<span>请选择要配置的事件：</span>
					{
						this.renderSelect(appKeyList, 'appkey', 'appkeyName', 'appKeyList')
					}
					{
						this.renderSelect(eventList, 'id', 'action_name_cn', 'eventList')
					}

				</div>
				<Table
					columns={columns}
					dataSource={tableData}
					pagination={false}
					rowKey='paramId'
				/>
				<div style={{ marginBottom: 8, marginTop: 16 }}>客户端合并配置（请选择需要合并的同一个客户端的Android和iOS版本）：</div>
				<div>
					<span>请选择要合并的Android客户端：</span>
					{this.renderSelect(AndroidList, 'appkey', 'appkeyName', 'AndroidList')}
			    <span>请选择要合并的IOS客户端：</span>
					{this.renderSelect(IOSList, 'appkey', 'appkeyName', 'IOSList')}
			    <span>合并后名称：</span>
			    <Input style={{ width: 120 }} onChange={this.handleMergeName} />
				</div>
				<div style={{ marginBottom: 8, marginTop: 16 }}>网站Url参数配置：</div>
				<div>
					<Table
						columns={columnsUrl}
						dataSource={urlList}
						bordered
						rowKey='appkey'
					/>
				</div>
				<div style={{ marginTop: 16 }}>
					<Button onClick={this.handleSave} type="primary" style={{ marginRight: 16 }}>保存</Button>
					<Button onClick={this.handleReset}>重置</Button>
				</div>
				<EditModal
					urlName={urlName}
					visible={visible}
					regList={regList}
					modalCtrl={this.modalCtrl}
				/>
			</div>
		)
	}
}