import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Input, message, Button, Modal, Upload } from 'antd';
import CreateDetailCategory from './CreateDetailModal'
import { webAPICfg } from '../../../../utils';
import EditableItem from '../../../../components/EditableItem';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
// import styles from './index.less';

const { Search } = Input;
const confirm = Modal.confirm;

@connect(state => ({
  coding: state.coding,
}))

export default class DetailCoding extends Component {
  state = {
    pageSize: null,
    pageNum: null,
    uploadModalVisible:false,//上传模态框的示例的   可见性
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
        render: (text, item, index) => {
          const { pageSize, pageNum } = this.state
          if (!pageSize || !pageNum) {
            return index + 1
          } else {
            return ((pageNum - 1) * pageSize) + index + 1
          }
        },
      },
      {
        title: '速码名称',
        dataIndex: 'dictionaryCode',
        width: '30%',
        render: (text, record) => {
          if (text || text === '') {
            return (<EditableItem
              vaildCoding
              value={text}
              editable
              onChange={() => { this.onCellChange(text, record, 'dictionaryCode') }}
            />);
          } else {
            return '';
          }
        },
      },
      {
        title: '页面显示名称',
        dataIndex: 'dictionaryLabel',
        width: '30%',
        render: (text, record) => {
          if (text || text === '') {
            return (<EditableItem
              vaildCoding
              value={text}
              editable
              onChange={(text) => { this.onCellChange(text, record, 'dictionaryLabel') }}
            />);
          } else {
            return '';
          }
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (item) => {
          return (<span>
            <a style={{ marginRight: '10px' }} onClick={() => { this.deleteModal(item, 'del'); }} href="javascript:;">删除</a>
          </span>);
        },
      },
    ],
  }


  componentWillMount() {
    const code = this.props.location.pathname.split('/')
    this.setState({ categoryCode: code[code.length - 1] })
    this.props.dispatch({
      type: 'coding/fetchDetailData',
      payload: { categoryCode: code[code.length - 1] },
    });
  }

  onCellChange = (text, item, key) => {
    item[key] = text
    this.props.dispatch({
      type: 'coding/fetchUpdateCode',
      payload: item,
    })

    /* return (value) => {
      const dataSource = [...this.state.dataSource];
      const target = dataSource.find(item => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.setState({ dataSource });
      }
    }; */
  }

  handleNewItem = () => {
    this.props.dispatch({
      type: 'coding/openModal',
    })
  }

  deleteModal = (item, type) => {
    const { categoryCode } = this.state
    const dictionaryCode = type === 'del' ? item.dictionaryCode : item;
    confirm({
      title: '确认删除',
      content: '是否删除所选数据？',
      onOk: () => {
        this.props.dispatch({
          type: 'coding/fetchDelDetailCategory',
          payload: {
            dictionaryCode,
            categoryCode,
          },
        });
      },
      onCancel() { },
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
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
    }
    if (info.file.status === 'done') {
      if (fileList[fileList.length - 1].response.resultBody) {
        message.success('上传成功')
        this.props.dispatch({
          type: 'coding/fetchDetailData',
          payload: { categoryCode: this.state.categoryCode },
        });
      } else {
        message.error(fileList[fileList.length - 1].response.errorMsg)
      }
      this.setState({ loading: false });
      this.setState({uploadModalVisible:false});
    }
  }

  handleSeach = (value) => {
    const { categoryCode } = this.state
    this.props.dispatch({
      type: 'coding/fetchDetailData',
      payload: { categoryCode, codeLabelOrCode: value },
      callback: (result) => {
        this.setState({ pageSize: result.pageSize, pageNum: result.pageNum })
      },
    })
  }

  isSaved = (flag) => {
    if (flag) {
      this.setState({ pageNum: 1 })
    }
  }
  showUploadModal=()=>{
    this.setState({uploadModalVisible:true})
  }
  handleCancel=()=>{
    this.setState({uploadModalVisible:false})
  }
  render() {
    const { columns, categoryCode,uploadModalVisible } = this.state;
    const { coding } = this.props;
    const {
      tableData,
      loading,
    } = coding;

    const uploadData = { categoryCode }

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys })
      },

    };
    const pagination = {
      total: tableData.total,
      pageSize: tableData.pageSize,
      current: tableData.pageNum,
      onChange: (paginations) => {
        this.props.dispatch({
          type: 'coding/fetchDetailData',
          payload: { categoryCode, pageNum: paginations },
          callback: (result) => {
            this.setState({ pageSize: result.pageSize, pageNum: result.pageNum })
          },
        })
      },
    }

    return (
      <PageHeaderLayout>
        <div style={{ margin: '24px 24px 0', background: '#fff', padding: 16 }}>
          <div style={{ marginBottom: 16, borderBottom: '1px solid #e9e9e9', paddingBottom: 8 }}>
            <span style={{ marginRight: 16 }}>速码类别: {tableData.categoryLabel}</span>
            <span style={{ marginRight: 16 }}>速码描述: {tableData.desc}</span>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: 15 }}>
            <Search
              style={{ width: 240 }}
              onSearch={this.handleSeach}
              placeholder='快速编码'
              enterButton
            />
            <Button type="primary" onClick={this.handleNewItem} style={{ marginLeft: 8, marginRight: 8 }} >新增</Button>
            <Button type="primary" onClick={() => { this.deleteModal(this.state.selectedRowKeys, 'bathdel'); }} style={{ marginRight: 8 }}>选中删除</Button>
            <Button type="primary" onClick={this.showUploadModal.bind(this)}>导入</Button>
            <Modal
                visible={uploadModalVisible}
                title="导入说明"
                // onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={[
                  <Button key="back" style={{marginRight:5}} onClick={this.handleCancel}>取消</Button>,
                  <Upload
              name='file'
              data={uploadData}
              action={`${webAPICfg.basePath}/smInitDictionary/leadingInCodeValue`}
              withCredentials
              showUploadList={false}
              beforeUpload={this.beforeUpload}
              onChange={this.changeUpload}
            >
              <Button type="primary">导入</Button>
            </Upload>
                ]}
              >
                <p>请按照模板填写速码名称、页面显示名称，不支持其他新增字段导入。</p>
                <p>示例如下：</p>
                <p><img src="/imgs/uploadReduceCode.png" /></p>
              </Modal>
            {/* <Upload
              name='file'
              data={uploadData}
              action={`${webAPICfg.basePath}/smInitDictionary/leadingInCodeValue`}
              withCredentials
              showUploadList={false}
              beforeUpload={this.beforeUpload}
              onChange={this.changeUpload}
            >
              <Button type="primary">导入</Button>
            </Upload> */}
          </div>
          <Table
            columns={columns}
            dataSource={tableData.smInitDictionaryPOS}
            rowKey="dictionaryCode"
            pagination={pagination}
            rowSelection={rowSelection}
            loading={loading}
          />
          <CreateDetailCategory categoryCode={this.state.categoryCode} isSaved={this.isSaved} />
        </div>
      </PageHeaderLayout>
    );
  }
}
