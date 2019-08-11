import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Row, Col, Form, Input, Select, Icon, Button, Table, Tabs, TreeSelect, Pagination, Spin, Upload, message, Modal } from 'antd'
import { formatMoment, basePath, webAPICfg } from '../../../utils'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout'
import TagConfig from './TagConfig'
import TagQudao from './TagQudao'
import HeaderTitle from '../../../components/HeaderTitle'

import styles from './index.less'

const TabPane = Tabs.TabPane


@connect(state => ({
  tags: state['sysconfig/tags'],
  loading: state.LOADING,
}))
export default class Tags extends PureComponent {

  state = {
    visible: false,
    uploadProps : {}
  }

  columns = [{
    title: '更新日期',
    dataIndex: 'updateTime',
    sorter: (a, b) => a.updateTime - b.updateTime,
    key: 'updateTime',
    render: (text, record) => formatMoment(text, 'YYYY-MM-DD'),
  }, {
    title: '更新人',
    dataIndex: 'updateUser',
    key: 'updateUser',
  }, {
    title: '文件名称',
    dataIndex: 'fileName',
    key: 'fileName',
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      return (
        <span>
          <a href={`${basePath}${record.fileUrl}`} download>下载</a>
        </span>
      )
    },
  }]

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sysconfig/tags/queryConfigEntityList',
    });
  }

  onPageChange(item) {
    return (page, pageSize) => {
      const { dispatch } = this.props;
      dispatch({
        type: 'sysconfig/tags/queryTagCategoryOne',
        payload: {
          pageNum: page,
          pageSize,
          entityId: item.id,
        },
      })
    }
  }

  open(props){
    this.setState({
      visible: true,
      uploadProps: props
    });
  }

  render() {
    const { tags, dispatch, loading } = this.props;
    return (
      <div className={styles.tags}>
        <Spin spinning={loading.global} tip="Loading..." style={{ position: 'fixed', margin: 'auto', top: '30%', left: 0, right: 0, zIndex: 100 }} />
        
        <Modal
          title="提示"
          footer={null}
          onCancel={()=>this.setState({ visible:false })}
          visible={this.state.visible}>
          <div>导入新的标签体系，已有实体下的数据将被覆盖，确定导入吗？</div>
          <div style={{textAlign:'right',marginTop:'20px'}}>
            <Button style={{marginRight:'10px'}} type="default" onClick={() => this.setState({ visible: false })}>取消</Button>
            <Upload { ...this.state.uploadProps }>
              <Button type="primary">确定</Button>
            </Upload>
          </div>
        </Modal>

        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '系统管理' }, { title: '标签管理配置' }]} />
        <div className={styles.container}>
          <Tabs defaultActiveKey="1" tabBarStyle={{ textAlign: 'center' }}>
            <TabPane tab="标签体系配置" key="1">
              <div className={styles.tables}>
                {
                  tags.list && tags.list.length > 0 && tags.list.map((item, i) => {
                    const props = {
                      name: 'file',
                      action: `${basePath}/bizTagCategory/fileUpload?entityId=${item.id}`,
                      withCredentials: true,
                      showUploadList: false,
                      onChange: (info)=> {
                        const response = info.file.response;
                        this.setState({ visible: false });
                        if (response) {
                          if (response.success) {
                            message.success(`${info.file.name} 导入成功`);
                            dispatch({
                              type: 'sysconfig/tags/queryTagCategoryOne',
                              payload: {
                                pageNum: 1,
                                pageSize: tags.pageSize,
                                entityId: item.id,
                              },
                            });
                          } else{
                            message.error(`${info.file.name} 导入失败，${response.errorMsg}`);
                          }
                        }
                      },
                    };
                    return (
                      <div className={styles.list} key={i}>
                        <Row className={styles.header}>
                          <Col span={12}>{item.entityName}实体标签体系：</Col>
                          <Col span={12} className={styles.drbtn}>
                            <Button type="primary" onClick={() => this.open(props)}>导入资源</Button>
                          </Col>
                        </Row>
                        {
                          tags[`entity_${item.id}`] ? (
                            <div>
                              <Table columns={this.columns} dataSource={tags[`entity_${item.id}`].list} pagination={false} rowKey="id" />
                              <Pagination className={styles.pager}
                                current={tags[`entity_${item.id}`].pageNum}
                                total={tags[`entity_${item.id}`].total}
                                onChange={::this.onPageChange(item)}
                                pageSize={tags.pageSize} />
                            </div>
                          ) : null
                        }
                      </div>
                    )
                  })
                }
              </div>
            </TabPane>
            <TabPane tab="标签渠道配置" key="2">
              <div className={styles.scpzBox}>
                <Tabs defaultActiveKey="0">
                  {
                    tags.list && tags.list.length > 0 && tags.list.map((item, i) => {
                      return (
                        <TabPane tab={<span>{item.entityName}</span>} key={`${i}`}>
                          <TagQudao entityId={item.id} />
                        </TabPane>
                      )
                    })
                  }
                </Tabs>
              </div>
            </TabPane>
            {/* <TabPane tab="标签生产配置" key="3">
              <div className={styles.scpzBox}>
                <Tabs defaultActiveKey="0">
                  {
                    tags.list && tags.list.length > 0 && tags.list.map((item, i) => {
                      return (
                        <TabPane tab={<span>{item.entityName}</span>} key={`${i}`}>
                          <TagConfig entityId={item.id} />
                        </TabPane>
                      )
                    })
                  }
                </Tabs>
              </div>
            </TabPane> */}
          </Tabs>
        </div>
      </div>
    );
  }
}
