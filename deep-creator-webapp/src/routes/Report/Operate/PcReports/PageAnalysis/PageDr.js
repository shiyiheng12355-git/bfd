import React, { Component } from 'react';
import { Row, Col, Button, Table, Input, Switch } from 'antd';
import { MasTitle } from '../../../../../components/MasHeader';

const Search = Input.Search;
export default class PageDr extends Component {
  state = {
    title: '页面医生',
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
      },
      {
        title: '页面名称',
        dataIndex: 'name',
      },
      {
        title: 'URL',
        dataIndex: 'url',
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        render: (flag, item) => {
          return <Switch checked={!!flag} onChange={(val) => { this.handleSwitch(val, item) }} />
        },
      },
      {
        title: '操作',
        dataIndex: 'control',
      },
    ],
    tableData: [
      {
        index: 1,
        name: '测试1',
        url: 'wwwwwwwwwww',
        status: 0,
      },
      {
        index: 2,
        name: '测试2',
        url: 'wwwwwwwwwww',
        status: 1,
      },
      {
        index: 3,
        name: '测试3',
        url: 'wwwwwwwwwww',
        status: 0,
      },
    ],
  }

  handleSwitch = (val, item) => {
    console.log(val, item)
  }

  render() {
    const { columns, tableData } = this.state
    return (
      <div>
        <MasTitle noTime {...this.state} />
        <Row style={{ border: '1px solid #e8e8e8', marginTop: 16, borderRadius: 4, padding: 16 }}>
          <Col span={4}>
            <Button type='primary' icon='plus'>增加页面</Button>
          </Col>
          <Col span={8} offset={12}>
            <Search placeholder='输入页面名称或URL搜索' enterButton />
          </Col>
          <Col span={24}>
            <Table dataSource={tableData} columns={columns} rowKey='index' />
          </Col>
        </Row>
      </div>
    )
  }
}