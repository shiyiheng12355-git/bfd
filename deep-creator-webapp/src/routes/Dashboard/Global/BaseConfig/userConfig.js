import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Table, Button, Select, Checkbox } from 'antd';

const Option = Select.Option;

@connect(state => ({
	data: state['gloablConfig/basicUserConfig'],
}))

export default class UserConfig extends Component {
	state = {
		columnsID: [
			{
				title: '数据库字段名称',
				dataIndex: 'sqlName',

			},
			{
				title: '页面字段显示名称',
				dataIndex: 'showName',
			},
			{
				title: '字段类型',
				dataIndex: 'type',
				render: (text, item) => {
					let option = []
					if (!text || text === '') return ''
					text.map((items, i) => {
						option.push(
							<Option key={i} value={items.value}>{items.name}</Option>
						)
					})
					return <Select style={{ width: '100%' }} onChange={this.handleChange}>{option}</Select>
				},
			},
			{
				title: '权限控制',
				dataIndex: 'operation',
				render: (text, item) => (
					<div>
						<Checkbox checked={item.vaildRow} onChange={(e) => { this.handleCheckbox(e, item, 'row') }}>行权限</Checkbox>
						<Checkbox checked={item.vaildCol} onChange={(e) => { this.handleCheckbox(e, item, 'col') }}>列权限</Checkbox>
					</div>
				),
			},
			{
				title: '速码类别选择',
				dataIndex: 'selectType',
				render: (text, item) => {
					if (!text || text === '') return ''
					let option = []
					text.map((items, i) => {
						option.push(
							<Option key={i} value={items.value}>{items.name}</Option>
						)
					})
					return <Select style={{ width: '100%' }} onChange={this.handleChange}>{option}</Select>
				},
			},
			{
				title: '操作',
				dataIndex: 'operation1',
				render: (text, item) => {
					let btnGroup = []
					const id = this.state.expandArr.id
					if (item.vaildRow) {
						if (id.indexOf(item.id) === -1) {
							btnGroup.push(<a key={btnGroup.length + 1} style={{ marginRight: 8 }} href="javascript:;" onClick={() => { this.handleOpenGroup(item) }}>编辑字段值</a>)
						} else {
							btnGroup.push(<a key={btnGroup.length + 1} style={{ marginRight: 8 }} href="javascript:;" onClick={() => { this.handleCloseGroup(item) }}>收起字段值</a>)
							btnGroup.push(<a key={btnGroup.length + 1} style={{ marginRight: 8 }} href="javascript:;" onClick={() => { this.handleCreateGroup(item) }}>新增字段值</a>)
						}
					}
					return (<div>
						{ btnGroup }
						<a href="javascript:;">删除</a>
					</div>)
				},
			},
		],
		columnsProps: [
			{
				title: '数据库字段名称',
				dataIndex: 'sqlName',
			},
			{
				title: '页面字段显示名称',
				dataIndex: 'showName',
			},
			{
				title: '字段类型',
				dataIndex: 'type',
				render: (text, item) => {
					let option = []
					if (!text || text === '') return ''
					text.map((item, i) => {
						option.push(
							<Option key={i} value={item.value}>{item.name}</Option>
						)
					})
					return <Select style={{ width: 240 }} onChange={this.handleChange}>{option}</Select>
				},
			},
			{
				title: '权限控制',
				dataIndex: 'operation',
				render: (text, item) => (
					<div>
						<Checkbox checked={item.vaildRow} onChange={(e) => { this.handleCheckbox(e, item, 'row') }}>行权限</Checkbox>
						<Checkbox checked={item.vaildCol} onChange={(e) => { this.handleCheckbox(e, item, 'col') }}>列权限</Checkbox>
					</div>
				),
			},
			{
				title: '速码类别选择',
				dataIndex: 'selectType',
				render: (text, item) => {
					if (!text || text === '') return ''
					let option = []
					text.map((item, i) => {
						option.push(
							<Option key={i} value={item.value}>{item.name}</Option>
						)
					})
					return <Select style={{ width: 240 }} onChange={this.handleChange}>{option}</Select>
				},
			},
			{
				title: '操作',
				dataIndex: 'operation1',
				render: (text, item) => {
					let btnGroup = []
					const props = this.state.expandArr.props
					if (item.vaildRow) {
						if (props.indexOf(item.id) === -1) {
							btnGroup.push(<a key={btnGroup.length + 1} style={{ marginRight: 8 }} href="javascript:;" onClick={() => { this.handleOpenGroup(item) }}>编辑字段值</a>)
						} else {
							btnGroup.push(<a key={btnGroup.length + 1} style={{ marginRight: 8 }} href="javascript:;" onClick={() => { this.handleCloseGroup(item) }}>收起字段值</a>)
							btnGroup.push(<a key={btnGroup.length + 1} style={{ marginRight: 8 }} href="javascript:;" onClick={() => { this.handleCreateGroup(item) }}>新增字段值</a>)
						}
					}
					return (<div>
						{ btnGroup }
						<a href="javascript:;">删除</a>
					</div>)
				},
			},
		],
		expandArr: {
			id: [],
			props: [],
		},
	}

	componentWillMount() {
		this.props.dispatch({
			type: 'gloablConfig/basicUserConfig/fetchIdData',
		});
	 	this.props.dispatch({
			type: 'gloablConfig/basicUserConfig/fetchPropsData',
    });
	}

	handleCheckbox = (e, item, type) => {
		const flag = e.target.checked
		const dataType = item.dataType
		const { expandArr } = this.state
		if (type === 'row') {
			item.vaildRow = flag
		} else {
			item.vaildCol = flag
		}
		this.props.dispatch({
			type: 'gloablConfig/basicUserConfig/updataData',
		 	payload: {
		 		type: dataType,
		 		item,
		 	},
		})
		if (!flag && type === 'row') {
			const index = expandArr[item.dataType].indexOf(item.id)
			if (index !== -1) {
				expandArr[item.dataType].splice(index, 1)
			}
		}
	}

	handleOpenGroup = (item) => {
		const { expandArr } = this.state
		if (expandArr[item.dataType].indexOf(item.id) === -1) {
			expandArr[item.dataType].push(item.id)
		}
		this.setState({ expandArr })
	}

	handleCloseGroup = (item) => {
		const { expandArr } = this.state
		const index = expandArr[item.dataType].indexOf(item.id)
		expandArr[item.dataType].splice(index, 1)
		this.setState({ expandArr })
	}

	handleCreateGroup = (item) => {
		const expendRow = item.expendRow
		const { expandArr } = this.state
		expendRow.push(
			{
				index: expendRow.length + 1,
				value: '',
			}
		)
		this.setState({ expandArr })
	}

	handleChange = (value) => {
		console.log(value)
	}

	handleGroupValue = (item) => {
		console.log(item)
	}

	renderRow = (record) => {
		console.log('record---', record)
		const groupDom = []
		const expendRow = record.expendRow
		if (expendRow.length !== 0) {
			expendRow.map((item, i) => {
				groupDom.push(
					<div key={i}>
						<span>分组值：</span>
						<Input onChange={() => { this.handleGroupValue(item) }} />
						<a href="javascript:;">删除</a>
					</div>
				)
			})
		}


		return <div>{groupDom}</div>
	}

	render() {
		const { columnsID, columnsProps, expandArr } = this.state
		const { userID, userProps } = this.props.data
		return (
			<div>
		    <div>
		    	<div>线下明细表：</div>
		    	<Table
		    		columns={columnsID}
		    		dataSource={userID}
		    		rowKey='id'
		    		expandedRowKeys={expandArr.id}
          	expandedRowRender={this.renderRow}
		    	/>
		    </div>
		    <div>
		    	<div>线上行为表：</div>
		    	<Table
		    		columns={columnsProps}
		    		dataSource={userProps}
		    		rowKey='id'
		    		expandedRowKeys={expandArr.props}
          	expandedRowRender={this.renderRow}
		    	/>
		    </div>
		  </div>
		);
	}
}
