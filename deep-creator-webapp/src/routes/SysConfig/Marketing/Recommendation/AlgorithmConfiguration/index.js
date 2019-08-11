import React, { Component } from 'react';

import {
  Row, Table, Button, Upload, Icon, Tooltip,
  Divider, Modal, message, notification, Popconfirm,
} from 'antd';
import EditAlgorithmExampleModal from './EditAlgorithmExampleModal';
import HeaderTitle from '../../../../../components/HeaderTitle';
import { webAPICfg } from '../../../../../utils';
import styles from './index.less';

class AlgorithmConfiguration extends Component {
  state = {
    showEditModal: false,
    editAlogrithm: null,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchPerRecomAlgorithm',
      payload: {},
    })
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchAlgorithmTemplate',
      payload: {},
    })
  }

  handleEdit = (record) => {
    this.setState({
      editAlogrithm: record,
      showEditModal: true,
    })
  }

  handleDelete = (record) => {
    Modal.confirm({
      title: '删除确认',
      content: '请确保该算法实例没有在使用中。确定删除吗？',
      onOk: () => {
        this.props.dispatch({
          type: 'sysconfig/marketing/removePerRecomAlgorithm',
          payload: record,
        })
      },
    })
  }

  handleDeleteTemplate = (record) => {
    this.props.dispatch({
      type: 'sysconfig/marketing/removeAlgorithmTemplate',
      payload: record,
    })
  }

  render() {
    const { showEditModal, editAlogrithm } = this.state;
    const { dispatch, algorithmList, algorithmTemplateList,
      recomContentEntityList, behaviorParams } = this.props;

    const props = {
      name: 'file',
      action: `${webAPICfg.basePath}/smMarketingScene/importBizPerRecomAlgorithmTemplate`,
      withCredentials: true,
      onChange: ({ file }) => {
        if (file.response) {
          if (file.response.success) {
            message.success(`算法模板文件”${file.name}“上传成功`);
            this.props.dispatch({
              type: 'sysconfig/marketing/fetchAlgorithmTemplate',
              payload: {},
            })
          } else {
            notification.error({ message: `文件”${file.name}“上传失败`, description: file.response.errorMsg });
          }
        }
      },
    };

    const templateColumns = [
      { title: '算法模板名称', key: '1', dataIndex: 'templateName' },
      {
        title: '操作',
        key: 2,
        render: (record) => {
          return (<Popconfirm
            title={`确定是否删除算法模板"${record.templateName}"`}
            onConfirm={this.handleDeleteTemplate.bind(this, record)}
          ><a onClick={() => false}>删除</a></Popconfirm>)
        },
      },
    ]

    const columns = [
      { title: '算法实例', key: '0', dataIndex: 'algorithmName' },
      { title: '算法模板', key: '1', dataIndex: 'templateName' },
      { title: '算法简介', key: '3', dataIndex: 'algorithmDescription' },
      {
        title: '操作',
        key: '4',
        render: record => (
          <div>
            <a onClick={this.handleEdit.bind(this, record)}>编辑</a>
            <Divider type='vertical' />
            <a onClick={this.handleDelete.bind(this, record)}>删除</a>
          </div >),
      },
    ];

    const modalProps = {
      visible: showEditModal,
      title: editAlogrithm ? '编辑算法实例' : '添加算法实例',
      dispatch,
      onOk: (values) => {
        this.setState({ showEditModal: false, editAlogrithm: null });
      },
      onCancel: () => {
        this.setState({ showEditModal: false, editAlogrithm: null });
      },
      editAlogrithm,
      algorithmTemplateList,
      recomContentEntityList,
      behaviorParams,
    }

    return (
      <div>
        <HeaderTitle>算法模板配置</HeaderTitle>
        <Row className={styles.operator}>
          <Upload type='primary'
            size='small'
            {...props}
            className={styles.button}
          >
            <Icon type="upload" />导入算法模板
                      </Upload>
          <Tooltip title='导入文件只支持JSON格式'>
            <Icon type='info-circle-o' className={styles.button} />
          </Tooltip>
        </Row>
        <Table
          columns={templateColumns}
          dataSource={algorithmTemplateList}
          pagination={false}
          rowKey={record => record.id} />

        <HeaderTitle>算法实例配置</HeaderTitle>
        <div>
          <EditAlgorithmExampleModal {...modalProps} />
          <Row className={styles.operator}>
            <Button type='primary'
              className={styles.button}
              onClick={() => this.setState({ showEditModal: true })}
              size='small'>新增算法实例</Button>
          </Row>
          <Table
            columns={columns}
            dataSource={algorithmList}
            pagination={false}
            rowKey={record => record.id} />
        </div>
      </div>
    );
  }
}

AlgorithmConfiguration.propTypes = {

};

export default AlgorithmConfiguration;