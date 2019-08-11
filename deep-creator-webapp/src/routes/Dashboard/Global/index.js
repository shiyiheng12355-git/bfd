import React, { Component } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import ApiConfig from './ApiConfig'
import OrganizeConfig from './OrganizeConfig'
import BaseConfig from './BaseConfig'
import DetailConfig from './DetailConfig'
import ParamConfig from './ParamConfig'
import SysConfig from './SysConfig'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

import styles from './index.less';

const TabPane = Tabs.TabPane;
const Authorized = RenderAuthorized()
/* const Auth1 = RenderAuthorized('xtgl_qjpz_xtzs');
const Auth2 = RenderAuthorized('xtgl_qjpz_stpz');
const Auth3 = RenderAuthorized('xtgl_qjpz_mxbpz');
const Auth4 = RenderAuthorized('xtgl_qjpz_jkpz');
const Auth5 = RenderAuthorized('xtgl_qjpz_sjcs');
const Auth6 = RenderAuthorized('xtgl_qjpz_zzjgpz'); */

@connect(state => ({
	auths: state.user.auths,
}))
export default class GlobalConfingHeader extends Component {
	componentWillMount() {
		this.props.dispatch({
			type: 'user/fetchAuths',
			payload: {
				parentKey: 'xtgl_qjpz',
			},
		});
	}
	render() {
		const { auths } = this.props
		return (
			<PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '系统管理' }, { title: '全局配置' }]}>
			  <div className={styles['card-container']} style={{ marginBottom: 16 }}>
					{auths.length !== 0 ? <Tabs type="card">
						{
							Authorized.check(() => { return auths.includes('xtgl_qjpz_xtzs') }, <TabPane style={{ marginTop: -2 }} tab="系统展示配置" key="1"><SysConfig /></TabPane>)
						}
			      {
							Authorized.check(() => { return auths.includes('xtgl_qjpz_stpz') }, <TabPane style={{ marginTop: -2 }} tab="实体配置" key="2"><BaseConfig /></TabPane>)
						}
						{
							Authorized.check(() => { return auths.includes('xtgl_qjpz_mxbpz') }, <TabPane style={{ marginTop: -2 }} tab="明细表配置" key="3"><DetailConfig /></TabPane>)
						}
						{
							Authorized.check(() => { return auths.includes('xtgl_qjpz_jkpz') }, <TabPane style={{ marginTop: -2 }} tab="接口配置" key="4"><ApiConfig /></TabPane>)
						}
			      {
							Authorized.check(() => { return auths.includes('xtgl_qjpz_sjcs') }, <TabPane style={{ marginTop: -2 }} tab="事件参数表配置" key="5"><ParamConfig /></TabPane>)
						}
			      {
							Authorized.check(() => { return auths.includes('xtgl_qjpz_zzjgpz') }, <TabPane style={{ marginTop: -2 }} tab="组织架构配置" key="6"><OrganizeConfig /></TabPane>)
						}

			    </Tabs> : ''}
			  </div>
		  </PageHeaderLayout>
		)
	}
}
