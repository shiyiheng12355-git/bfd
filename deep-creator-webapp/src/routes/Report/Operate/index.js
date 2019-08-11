import React, { Component } from 'react';
import { Row, Col, Tabs, Select, Spin } from 'antd';
import { connect } from 'dva';
import GroupList from '../../../components/GroupList'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import PcReports from './PcReports'
import MobileReports from './MobileReports'

const Option = Select.Option;
const TabPane = Tabs.TabPane;

@connect(state => (
	{
		clientList: state['report/operation'].clientList,
		appkey: state['report/operation'].appkey,
		terminal: state['report/operation'].terminal,
		mappingName: state['report/operation'].mappingName,
		mappingDesc: state['report/operation'].mappingDesc,
		mappingType: state['report/operation'].mappingType,
		navTab: state['report/operation'].navTab,
		pagesTab: state['report/operation'].pagesTab,
		entityList: state['report/operation'].entityList, //  实体列表
		entityId: state['report/operation'].entityId, //  所选实体id
		groupList: state['report/operation'].groupList, //  用户群列表
		selectedGroupData: state['report/operation'].selectedGroupData, //  所选用户群
		filterData: state['report/operation'].filterData, //  所选用户群
		Global: state.LOADING,
	}
))

export default class Operate extends Component {
	componentDidMount() {
		this.props.dispatch({
			type: 'report/operation/fetchClientList',
		})
		/*
		this.props.dispatch({
			type: 'report/operation/fetchEntityList',
		})
		*/
	}

	handleChange = (val) => {
		const { clientList } = this.props
		const selectedItem = clientList.find((item) => {
			return item.appkey === val
		})
		this.props.dispatch({
			type: 'report/operation/setAppkey',
			payload: selectedItem,
		})
		this.props.dispatch({
			type: 'report/operation/fetchFilter',
			payload: selectedItem.appkey,
		})
	}

	changeActiveTab = (key) => {
    this.props.dispatch({
			type: 'report/operation/fetchGroupList',
      payload: Number(key),
    })
    this.props.dispatch({
			type: 'report/operation/setEntityId',
      payload: Number(key),
    })
  }

	handleGroupChange = (val) => {
		this.props.dispatch({
			type: 'report/operation/changeSelectedGroupData',
			payload: val,
		})
	}

	renderTabs = () => {
		const { entityList, groupList, selectedGroupData } = this.props
		return entityList && entityList.length !== 0 ?
			(<Tabs onChange={this.changeActiveTab} type="line" >
				{
					entityList.map((item, i) => {
						return (
							<TabPane tab={item.entityName} key={item.id}>
								<GroupList 
									value={selectedGroupData} 
									pageChange={(data)=>{
										this.props.dispatch({
											type: 'report/operation/getGroupListDetail',
											payload: data,
										})
									}}
									groupData={groupList} 
									onChange={this.handleGroupChange} />
							</TabPane>
						)
					})
				}
			</Tabs>)
			: ''
	}

	render() {
		const { clientList, appkey, terminal, groupList, selectedGroupData, Global } = this.props
		return (
			<PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '报表管理' }, { title: '在线运营指标' }]}>
				<Spin spinning={Global.effects['report/operation/fetchClientList']}>
					<div style={{ marginBottom: 16, background: '#fff', padding: '16px 16px 5px' }}>
						<Row style={{ marginBottom: 16 }}>
							<Col span={2} style={{ textAlign: 'right', paddingTop: 4 }}>客户端：</Col>
							<Select value={appkey} onSelect={this.handleChange} style={{width:240}}>
								{
									clientList && clientList.map((item, i) => {
										return <Option key={i} value={item.appkey}>{item.appkeyName}</Option>
									})
								}
							</Select>
						</Row>
						{/*<Row>
							<Col span={2} style={{ textAlign: 'right' }}>选择用户群：</Col>
							<Col span={22}>{this.renderTabs()}</Col>
						</Row>*/}
					</div>
				</Spin>
				{
					clientList && appkey && terminal
					?
						(terminal && terminal.toLowerCase() === 'ios' || terminal && terminal.toLowerCase() === 'android' || terminal && terminal.toLowerCase() === 'merge' ? <MobileReports {...this.props} /> : <PcReports {...this.props} />)
						: <div style={{ marginBottom: 16, background: '#fff', padding: 16 }}>暂无数据</div>
				}
		  </PageHeaderLayout>
		)
	}
}