import React, { Component } from 'react';
import { Link } from 'dva/router';

export default class GlobalConfingHeader extends Component {
	render() {
		return (
		  <div style={{ textAlign: 'center', marginBottom: 16 }}>
		    <Link style={{ marginRight: '10px' }} to="/config/global">系统展示配置</Link>
		    <Link style={{ marginRight: '10px' }} to="/config/global/baseconfig">实体配置</Link>
		    <Link style={{ marginRight: '10px' }} to="/config/global/detailconfig">明细表配置</Link>
		    <Link style={{ marginRight: '10px' }} to="/config/global/apiconfig">接口配置</Link>
		    <Link style={{ marginRight: '10px' }} to="/config/global/paramconfig">事件参数表配置</Link>
		    <Link style={{ marginRight: '10px' }} to="/config/global/organizeconfig">组织架构配置</Link>
		  </div>
		)
	}
}
