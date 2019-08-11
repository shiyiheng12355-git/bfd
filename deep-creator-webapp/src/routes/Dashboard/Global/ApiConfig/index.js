import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Row, Col, Button } from 'antd';
import uuidV4 from 'uuid/v4'
import HeaderTitle from '../../../../components/HeaderTitle';

@connect(state => ({
	apiData: state['gloablConfig/apiConfig'],
}))
export default class ApiConfig extends Component {
	state = {
		saveData: [],
	}

	componentDidMount() {
		this.props.dispatch({
			type: 'gloablConfig/apiConfig/fetchApiConfig',
		});
	}

	handleChangeVa = (e, configKey) => {
		const configValue = e.target.value
		const { saveData } = this.state
		const hasKey = saveData.findIndex((x) => {
			return x.configKey === configKey
		})

		if (hasKey === -1) {
			saveData.push({ configKey, configValue })
		} else {
			saveData[hasKey].configValue = configValue
		}

		this.props.dispatch({
			type: 'gloablConfig/apiConfig/editInput',
			payload: { configValue, configKey },
		})
		console.log(saveData)
	}

	handleSave = () => {
		const { saveData } = this.state
		this.props.dispatch({
			type: 'gloablConfig/apiConfig/fatchSave',
			payload: saveData,
		})
	}

	handleReset = () => {
		this.setState({ saveData: [] })
		this.props.dispatch({
			type: 'gloablConfig/apiConfig/fetchApiConfig',
		});
	}

	renderApiData = (list) => {
		if (list.length === 0) {
			return '暂无数据'
		} else {
			return (
				[list.map((group, index) => {
					return (
						<div key={index} style={{ marginBottom: 24 }}>
							<div style={{ padding: '12px 10px', borderBottom: '1px solid #e9e9e9', fontSize: 16 }}>{group.groupName}</div>
							<Row gutter={16}>
								{
									group.list.map((item, i) => {
										return (
											<Col span={6} key={i} style={{ padding: 16 }}>
												<p>{item.configDesc}</p>
												<Input value={item.configValue} onChange={(e) => { this.handleChangeVa(e, item.configKey); }} />
											</Col>
										)
									})
								}
							</Row>
						</div>
					)
				}),
					<div key={uuidV4()}>
					<Button onClick={this.handleSave} type="primary" style={{ marginRight: 16 }}>保存</Button>
					<Button onClick={this.handleReset}>重置</Button>
				</div >]
			)
		}
	}

	render() {
		const { apiData } = this.props.apiData;
		return (
		  <div>
				{
					this.renderApiData(apiData)
				}
		  </div>
		);
	}
}
