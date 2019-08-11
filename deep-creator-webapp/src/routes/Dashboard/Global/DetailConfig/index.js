import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Table, Button, Select, Checkbox, Input, message } from 'antd';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import uuidV4 from 'uuid/v4'

const Option = Select.Option;
const confirm = Modal.confirm;
const Authorized = RenderAuthorized()

@connect(state => ({
	data: state['gloablConfig/detailConfig'],
	auths: state.user.auths,
}))

export default class DetailConfig extends Component {
	state = {
		columns1: [
			{
				title: '数据库字段名称',
				dataIndex: 'columnName',
				width: '20%',
				render: (text, record) => {
					if (record.newId) {
						return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnName', 'input') }} />
					} else {
						return text
					}
				},
			},
			{
				title: '页面字段显示名称',
				dataIndex: 'columnTitle',
				width: '20%',
				render: (text, record) => {
					if (record.newId) {
						return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnTitle', 'input') }} />
					} else {
						return text
					}
				},
			},
			{
				title: '字段类型',
				dataIndex: 'dbColumnType',
				width: '10%',
				render: (text, record) => {
					if (record.newId) {
						return (
							<Select style={{ width: 120 }} defaultValue='int' onChange={(e) => { this.handleChangeCoulmn(e, record, 'dbColumnType', '') }}>
								<Option value='int'>int</Option>
								<Option value='float'>float</Option>
								<Option value='bool'>bool</Option>
								<Option value='string'>string</Option>
							</Select>
						)
						// return <Input style={{ width: 60 }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'dbColumnType', 'input') }} />
					} else {
						return text
					}
				},
			},
			{
				title: '权限控制',
				dataIndex: 'operation',
				width: '20%',
				render: (text, item) => (
					<div>
						<Checkbox checked={item.isRowAuthor} onChange={(e) => { this.handleChangeCoulmn(e, item, 'isRowAuthor', 'checkbox') }}>行权限</Checkbox>
						<Checkbox checked={item.isColumnAuthor} onChange={(e) => { this.handleChangeCoulmn(e, item, 'isColumnAuthor', 'checkbox') }}>列权限</Checkbox>
					</div>
				),
			},
			{
				title: '速码类别选择',
				dataIndex: 'rowAuthorRootCode',
				width: '20%',
				render: (text, record) => {
					if (!record.isRowAuthor) {
						return ''
					} else {
						let option = []
						this.props.data.selectList.map((item, i) => {
							option.push(
								<Option key={item.id} value={item.dictionaryCode}>{item.dictionaryLabel}</Option>
							)
						})
						return <Select style={{ width: 240 }} value={text} onChange={(value) => { this.handleChangeCoulmn(value, record, 'rowAuthorRootCode') }}>{option}</Select>
					}
				},
			},
			{
				title: '操作',
				dataIndex: 'operation1',
				width: '10%',
				render: (text, item, index) => {
					return (<div>
						<a href="javascript:;" onClick={() => { this.handleDel(item, index) }}>删除</a>
					</div>)
				},
			},
		],
		columns2: [
			{
				title: '数据库字段名称',
				dataIndex: 'columnName',
				width: '20%',
				render: (text, record) => {
					if (record.newId) {
						return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnName', 'input') }} />
					} else {
						return text
					}
				},
			},
			{
				title: '页面字段显示名称',
				dataIndex: 'columnTitle',
				width: '20%',
				render: (text, record) => {
					if (record.newId) {
						return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnTitle', 'input') }} />
					} else {
						return text
					}
				},
			},
			{
				title: '字段类型',
				dataIndex: 'dbColumnType',
				width: '10%',
				render: (text, record) => {
					if (record.newId) {
						return <Input style={{ width: 60 }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'dbColumnType', 'input') }} />
					} else {
						return text
					}
				},
			},
			{
				title: '权限控制',
				dataIndex: 'operation',
				width: '20%',
				render: (text, item) => (
					<div>
						<Checkbox checked={item.isRowAuthor} onChange={(e) => { this.handleChangeCoulmn(e, item, 'isRowAuthor', 'checkbox') }}>行权限</Checkbox>
					</div>
				),
			},
		/* 	{
				title: '速码类别选择',
				dataIndex: 'rowAuthorRootCode',
				width: '20%',
				render: (text, record) => {
					if (!record.isRowAuthor) {
						return ''
					} else {
						let option = []
						this.props.data.selectList.map((item, i) => {
							option.push(
								<Option key={item.id} value={item.dictionaryCode}>{item.dictionaryLabel}</Option>
							)
						})
						return <Select style={{ width: 240 }} value={text} onChange={(value) => { this.handleChangeCoulmn(value, record, 'rowAuthorRootCode') }}>{option}</Select>
					}
				},
			}, */
		],
		saveData: [],
	}

	componentDidMount() {
		this.props.dispatch({
			type: 'gloablConfig/detailConfig/fetchTableData',
		});
		this.props.dispatch({
			type: 'user/fetchAuths',
			payload: {
				parentKey: 'xtgl_qjpz_mxbpz',
			},
		});
	}


	handleChangeCoulmn = (e, item, key, type) => {
		let value
		switch (type) {
			case 'input':
				value = e.target.value
				break;
			case 'checkbox':
				value = e.target.checked ? 1 : 0
				break;
			default:
				value = e
				break;
		}
		const { saveData } = this.state
		const hasKey = saveData.findIndex((x) => {
			return x.id === item.id && x.configType === item.configType
		})
		if (hasKey === -1) {
			item[key] = value
			saveData.push(item)
		} else {
			saveData[hasKey][key] = value
		}
		this.props.dispatch({
			type: 'gloablConfig/detailConfig/updataData',
		 	payload: { item },
		})
	}

	handleAddObj = (type, list) => {
		const { selectList } = this.props.data
		const { saveData } = this.state
		const obj = {
			columnName: '',
			columnTitle: '',
			configType: type,
			dbColumnType: '',
			isColumnAuthor: 0,
			isRowAuthor: 0,
			id: uuidV4(),
			newId: uuidV4(),
			rowAuthorRootCode: selectList[0].dictionaryCode,
			safteTemplateId: 0,
		}
		saveData.push(obj)
		this.setState({ saveData })
		this.props.dispatch({
			type: 'gloablConfig/detailConfig/addObj',
			payload: obj,
		})
	}

	handleDel = (item, index) => {
		const { saveData } = this.state
		const hasKey = saveData.findIndex((x) => {
			return x.id === item.id && x.configType === item.configType
		})
		if (hasKey !== -1) {
			saveData.splice(hasKey, 1)
		}

		confirm({
			content: '是否删除该条数据？',
			onOk: () => {
				if (item.newId) {
					this.props.dispatch({
						type: 'gloablConfig/detailConfig/delObj',
						payload: { configType: item.configType, index },
					})
				} else {
					this.props.dispatch({
						type: 'gloablConfig/detailConfig/fetchDelItem',
						payload: item.id,
					})
				}
			},
			onCancel() {
				console.log('Cancel');
			},
		});


		/* confirm({
			content: '是否删除该条数据？',
			onOk: () => {
				this.props.dispatch({
					type: 'gloablConfig/detailConfig/fetchDelItem',
					payload: item.id,
				})
			},
			onCancel() {
				console.log('Cancel');
			},
		}); */
	}

	handleSave = () => {
		const { saveData } = this.state
		const reg = new RegExp('^[-_.A-Za-z0-9\u4e00-\u9fa5]+$')
		if (saveData.length !== 0) {
			const nullFlag = saveData.every((item, i, a) => {
				return item.columnName !== '' && item.columnTitle !== ''
			})
			const lenFlag = saveData.every((item, i, a) => {
				return item.columnName.length <= 20 && item.columnTitle.length <= 20
			})
			const regFlag = saveData.every((item, i, a) => {
				return reg.test(item.columnName) && reg.test(item.columnTitle)
			})
			if (!nullFlag) {
				message.warning('数据库字段名称和页面字段显示名称不能为空')
				return false
			}
			if (!lenFlag) {
				message.warning('数据库字段名称和页面字段显示名称不能超过20个字')
				return false
			}
			if (!regFlag) {
				message.warning('数据库字段名称和页面字段显示名称只能输入中文、英文、数字和_-.')
				return false
			}
			saveData.map((item) => {
				if (item.newId) {
					item.id = ''
					delete item.newId
				}
			})

			this.props.dispatch({
				type: 'gloablConfig/detailConfig/fetchSaveData',
				payload: saveData,
			})
			this.setState({ saveData: [] })
		}
	}

	handleReset = () => {
		this.setState({ saveData: [] })
		this.props.dispatch({
			type: 'gloablConfig/detailConfig/fetchTableData',
		})
	}

	render() {
		const { columns1, columns2 } = this.state
		const { auths, data } = this.props
		const { offlineList, clientList } = data
		return (
		  <div>
				{
					Authorized.check(() => { return auths.includes('xtgl_qjpz_mxbpz_xxmx') },
					<div>
						<div style={{ marginBottom: 8, overflow: 'hidden' }}>线下明细表：<Button style={{ float: 'right' }} type='primary' onClick={() => { this.handleAddObj(4) }}>增加字段</Button></div>
						<Table
							columns={columns1}
							dataSource={offlineList}
							pagination={false}
						/>
					</div>)
				}
				{
					Authorized.check(() => { return auths.includes('xtgl_qjpz_mxbpz_khdmx') },
					<div style={{ marginTop: 16 }}>
						<div style={{ marginBottom: 8, overflow: 'hidden' }}>客户端明细表：{/* <Button style={{ float: 'right' }} type='primary' onClick={() => { this.handleAddObj(3) }}>增加字段</Button> */}</div>
						<Table
							columns={columns2}
							dataSource={clientList}
							rowKey='id'
							pagination={false}
						/>
					</div>)
				}
				<div style={{ marginTop: 16 }}>
					<Button onClick={this.handleSave} type="primary" style={{ marginRight: 16 }}>保存</Button>
					<Button onClick={this.handleReset}>重置</Button>
				</div>
		  </div>
		);
	}
}
