import React from 'react';
import { connect } from 'dva';
import { Modal, Table, Button, Row, Col, Icon, Tag, Upload, notification } from 'antd';
import styles from './ImportFileList.less';
import { webAPICfg } from '../../utils';

@connect(state => ({
  entityGroup: state['entity/group'],
  loading: state.LOADING,
}))

class ImportFileList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      current: 1,
    }

    this.time = null

    this.columns = [{
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: '80%',
    }, {
      title: '状态',
      key: 'fileState',
      dataIndex: 'fileState',
      width: '20%',
      render: (text, record) => {
        return (
          text === 20 ? (
            <span style={{color: 'rgb(135, 208, 104)'}}>上传成功</span>
          ) : text === 10 ? (
            <span style={{color: 'rgb(16, 142, 233)'}}>上传中</span>
          ) : text === 30 ? (
            <span style={{color: '#f5222d'}}>上传失败</span>
          ) : null
        )
      },
      sorter: (a, b) => {
        let aa = a.fileState === 20 ? 1 : a.fileState === 10 ? 2 : 3
        let bb = b.fileState === 20 ? 1 : b.fileState === 10 ? 2 : 3
        return aa - bb
      },
    }]
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.visible && nextProps.visible !== this.props.visible){
      this.setState({ 
        selectedRowKeys: [],
        selectedRows: [],
        current: 1,
      })
      this.queryImportFiles()

      this.time = setInterval(this.queryImportFiles, 1000*300)
    }
  }

  componentDidMount() {
    this.queryImportFiles()
  }

  queryImportFiles = () => {
    this.props.dispatch({
      type: 'entity/group/queryImportFiles',
      payload: {
        entityId: this.props.entityId,
      },
    })
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows })
  }

  tagDelete = (record) => {
    let { selectedRowKeys, selectedRows } = this.state
    selectedRowKeys = selectedRowKeys.filter(v => v !== record.key)
    selectedRows = selectedRows.filter(v => v.key !== record.key)
    this.setState({ selectedRowKeys, selectedRows })
  }

  handleCheckFile = (file, fileList) => {
    const excelReg = /\.xl(s|sx)$/;
    const patrn = /[`~!@#$%^&*\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*\+={}|？：“”、；‘’，。、]/im;

    const { importFileNames } = this.props.entityGroup;

    if (!excelReg.test(file.name)) {
      notification.info({ message: `${file.name} 格式错误，请上传excel文件！` })
      return false;

    } else if (patrn.test(file.name)) {
      notification.info({ message: `文件名 ${file.name} 中不允许有特殊字符！` })
      return false;

    }else if(file.size > 10 * 1024 * 1024) {
      notification.info({ message: `${file.name} 超过10M！` })
      return false;

    } else if (importFileNames.includes(file.name)) {
      notification.info({ message: `${file.name} 已存在，请勿重复上传！` })
      return false;

    } else {
      return true;
    }
  }

  handleUploadFileChange = (info) => {
    if(info.file.status === 'done'){
      this.props.handleUploadFileChange(info, this.queryImportFiles)
    }
  }

  handleOk = (selectedRows) => {
    clearInterval(this.time)
    this.props.handleOk(selectedRows)
  }

  handleClose = () => {
    clearInterval(this.time)
    this.props.handleClose()
  }

  render() {
    const { visible, handleOk, handleClose, entityGroup, loading } = this.props
    const { importFiles } = entityGroup
    const { selectedRowKeys, selectedRows, current } = this.state

    const title = () => {
      return (
        <Row>
          <Col span={12} style={{ fontSize: 16, fontWeight: 800 }}>已导入文件：</Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.queryImportFiles} style={{marginRight: 10}}>刷新列表</Button>
            <Upload
              withCredentials
              action={`${webAPICfg.basePath}/file/upload`}
              beforeUpload={this.handleCheckFile}
              onChange={this.handleUploadFileChange}
              showUploadList={false}
            >
              <Button type="primary">上传文件</Button>
            </Upload>
          </Col>
        </Row>
      )
    }

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.fileState !== 20, 
      }),
    }

    return ( 
      <Modal
        className={styles.ImportFileList}
        style={{ top: 50 }}
        title="文件列表详情"
        visible={visible}
        onOk={() => { this.handleOk(selectedRows)} }
        onCancel={this.handleClose}
        okText='确定导入'
        maskClosable={false}
      >
        <Table 
          title={title} 
          columns={this.columns} 
          dataSource={importFiles}
          pagination={{
            pageSize: 5,
            onChange: (page) => { this.setState({ current: page }) },
            current,
          }}
          rowSelection={rowSelection}
          loading={loading.effects['entity/group/queryImportFiles']}
        />

        {
          selectedRows.length > 0 ? (
            <div style={{marginBottom: 24, marginTop: -16}}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>已选择的文件：</div>
              {selectedRows.map(v => (
                <Tag 
                  key={v.key}
                  color="#2db7f5" 
                  closable={true}
                  style={{margin: '10px 10px 0 0 '}}
                  onClose={() => {this.tagDelete(v)}}
                >
                  {v.fileName}
                </Tag>
              ))}
            </div>
          ) : null
        }
      </Modal>
    )
  }
}

export default ImportFileList