import React, { Component } from 'react';
import { Modal, Table, Button, Input } from 'antd';

export default class EditModal extends Component {
  state={
    columns: [
      {
        title: '优先顺序',
        dataIndex: 'index',
        width: '20%',
        render: (item, record, index) => {
          const { pageNum } = this.state
          if (!pageNum) {
            return index + 1
          } else {
            return ((pageNum - 1) * 10) + index + 1
          }
        },
      },
      {
        title: '正则表达式',
        width: '40%',
        dataIndex: 'regExp',
        render: (item, record, index) => {
          const { pageNum } = this.state
          let dataIndex
          if (!pageNum) {
            dataIndex = index
          } else {
            dataIndex = ((pageNum - 1) * 10) + index
          }
          if (record.isAdd) {
            return <Input value={item} style={{ width: '100%' }} onChange={(e) => { this.handleChangeReg(e, record, dataIndex) }} />
          } else {
            return item
          }
        },
      },
      {
        title: '调整顺序',
        dataIndex: 'position',
        width: '30%',
        render: (item, record, index) => {
          const { regList } = this.props
          const { pageNum } = this.state
          let dataIndex
          if (!pageNum) {
            dataIndex = index
          } else {
            dataIndex = ((pageNum - 1) * 10) + index
          }
          if (regList && regList.length === 1) {
            return (
              <div>
                <span>向上</span>
                <span style={{ marginLeft: 8 }}>向下</span>
              </div>
            )
          } else if (dataIndex === 0) {
            return (
              <div>
                <span>向上</span>
                <a style={{ marginLeft: 8 }} href='javascript:;' onClick={() => { this.handlePosition(dataIndex, 'down') }}>向下</a>
              </div>
            )
          } else if (dataIndex + 1 === this.props.regList.length) {
            return (
              <div>
                <a href='javascript:;' onClick={() => { this.handlePosition(dataIndex, 'up') }}>向上</a>
                <span style={{ marginLeft: 8 }}>向下</span>
              </div>
            )
          } else {
            return (
              <div>
                <a href='javascript:;' onClick={() => { this.handlePosition(dataIndex, 'up') }}>向上</a>
                <a href='javascript:;' style={{ marginLeft: 8 }} onClick={() => { this.handlePosition(dataIndex, 'down') }}>向下</a>
              </div>
            )
          }
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '10%',
        render: (item, record, index) => {
          const { pageNum } = this.state
          let dataIndex
          if (!pageNum) {
            dataIndex = index + 1
          } else {
            dataIndex = ((pageNum - 1) * 10) + index + 1
          }
          return <a href='javascript:;' onClick={() => { this.handleDel(record, dataIndex) }}>删除</a>
        },
      },
    ],
  }

  handleChangeReg = (e, item, index) => {
    this.props.modalCtrl('edit', e.target.value, index)
  }

  handleAddReg = () => {
    this.props.modalCtrl('add')
  }

  handleDel = (record, index) => {
    this.props.modalCtrl('del', record, index)
  }

  handlePosition = (index, type) => {
    this.props.modalCtrl('move', null, index, type)
  }

  handleOk = () => {
    this.props.modalCtrl('save')
  }

  handleCancel = () => {
    this.props.modalCtrl(false)
  }

  render() {
    const { columns } = this.state
    const { visible, urlName, regList, pageNum } = this.props
    const pagination = {
      total: regList.total,
      pageSize: regList.pageSize,
      // current: pageNum || regList.pageNum,
      onChange: (paginations) => {
        this.setState({ pageNum: paginations })
      },
    }
    return (
      <Modal
        title="编辑url参数"
        visible={visible}
        width={700}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Table
          title={() => { return `网站名称：${urlName}` }}
          columns={columns}
          dataSource={regList}
          pagination={pagination}
          footer={() => { return <Button type='primary' onClick={this.handleAddReg}>增加正则表达式</Button> }}
        />
      </Modal>
    )
  }
}