import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Button, Select, Upload, message,Modal } from 'antd';
import { formatMoment, webAPICfg } from '../../../../utils'

const Option = Select.Option;

@connect(state => ({
	data: state['gloablConfig/organizeConfig'],
}))

export default class OrganizeConfig extends Component {
	state = {
		columns: [
			{
				title: '更新日期',
				dataIndex: 'updateTime',
				render: text => (
					formatMoment(text)
				),
			},
			{
				title: '更新人',
				dataIndex: 'updateUser',
			},
			{
				title: '文件名称',
				dataIndex: 'fileName',
			},
			{
				title: '操作',
				dataIndex: 'operation',
				render: (text, item) => {
					return (<div>
						<a href={`${webAPICfg.basePath}${item.fileUrl}`} download>下载</a>
					</div>)
				},
			},
		],
		expandArr: [],
		uploadModalVisible:false,//上传模态框的示例的   可见性
	}

	componentDidMount() {
		this.props.dispatch({
			type: 'gloablConfig/organizeConfig/fetchTableData',
		});
	}

	beforeUpload = (file) => {
		const isExcel = file.name.split('.')[1];
		if (isExcel !== 'xls' && isExcel !== 'xlsx') {
			message.error('请上传EXCEL文件');
			return false;
		}
	}

	changeUpload = (info) => {
		const { file, fileList } = info
		if (file.status === 'uploading') {
			this.setState({ loading: true });
		}
		if (file.status === 'done') {
			if (fileList[fileList.length - 1].response.resultBody) {
				message.success('上传成功')
				this.props.dispatch({
					type: 'gloablConfig/paramsConfig/fetchTableData',
				});
			} else {
				message.error(fileList[fileList.length - 1].response.errorMsg || '上传文件失败')
			}
			this.setState({ loading: false });
			this.setState({uploadModalVisible:false});
		}
	}
	showUploadModal=()=>{
		this.setState({uploadModalVisible:true})
	  }
	handleCancel=()=>{
		this.setState({uploadModalVisible:false})
	}
	render() {
		const { columns,uploadModalVisible} = this.state
		const { tableData } = this.props.data
		return (
		  <div>
				<div style={{ marginBottom: 16, overflow: 'hidden' }}>
					<span style={{ lineHeight: '24px' }}>组织架构导入：</span>
					<span style={{ float: 'right' }}>
						<Button type="primary" onClick = {this.showUploadModal.bind(this)}>导入资源</Button>
						{/* <Upload
							name='file'
							action={`${webAPICfg.basePath}/globalConfiguration/importOrg`}
							withCredentials
							showUploadList={false}
							beforeUpload={this.beforeUpload}
							onChange={this.changeUpload}
						>
							<Button type="primary">导入资源</Button>
						</Upload> */}
					</span>
				</div>
				<Table
					columns={columns}
					dataSource={tableData}
					rowKey='id'
				/>
				<Modal
                visible={uploadModalVisible}
                title="导入说明"
                // onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={[
                  <Button key="back" style={{marginRight:5}} onClick={this.handleCancel}>取消</Button>,
                  <Upload
							name='file'
							action={`${webAPICfg.basePath}/globalConfiguration/importOrg`}
							withCredentials
							showUploadList={false}
							beforeUpload={this.beforeUpload}
							onChange={this.changeUpload}
						>
							<Button type="primary">导入资源</Button>
					</Upload>
                ]}
              >
                <p>请按照模板填写组织机构名称、组织机构代码、描述以及父级组织机构代码，不支持其他新增字段导入。</p>
				<p>示例如下：</p>
                <p><img src="/imgs/uploadReduceOrg.png" /></p>
              </Modal>
		  </div>
		);
	}
}
