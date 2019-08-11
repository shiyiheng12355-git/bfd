import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Button, Table, Upload, Icon, Tooltip, Popconfirm, Divider,
  message, notification,
} from 'antd';
import EditPolicyTemplateModal from './EditPolicyTemplateModal';
import styles from './index.less';
import HeaderTitle from '../../../../../components/HeaderTitle';
import { webAPICfg } from '../../../../../utils';
import PriorityRecomModal from './PriorityRecomModal';

class SceneConfiguration extends Component {
  state = {
    showEditModal: false,
    editTemplate: null,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchTemplateList',
      payload: {},
    });
  }

  handleDeleteTemplate = (record) => {
    this.props.dispatch({
      type: 'sysconfig/marketing/removeStrategyTemplate',
      payload: record,
    })
  }

  render() {
    const { templateList, dispatch, priorityRecmdList } = this.props;
    const priorityItem = { strategyName: '优先推荐', id: 'priority', type: 'priority' };
    const list = templateList.slice(0);
    list.unshift(priorityItem);

    const { showEditModal, editTemplate } = this.state;
    const props = {
      name: 'file',
      action: `${webAPICfg.basePath}/smMarketingScene/importStrategyTemplate`,
      withCredentials: true,
      onChange: ({ file }) => {
        if (file.response) {
          if (file.response.success) {
            message.success(`文件”${file.name}“上传成功`);
            this.props.dispatch({
              type: 'sysconfig/marketing/fetchTemplateList',
              payload: {},
            });
          } else {
            notification.error({ message: `文件”${file.name}“上传失败`, description: file.response.errorMsg });
          }
        }
      },
    };

    const modalProps = {
      width: '60%',
      title: editTemplate ? '编辑策略模板' : '添加策略模板',
      editTemplate,
      dispatch,
      visible: showEditModal,
      priorityRecmdList,
      onOk: () => {
        this.setState({ showEditModal: false, editTemplate: null });
      },
      onCancel: () => {
        this.setState({ showEditModal: false, editTemplate: null });
      },
    }

    const showPriority = editTemplate && editTemplate.type === 'priority';

    return (
      <div>
        <HeaderTitle>推荐场景配置</HeaderTitle>
        <Row className={styles.operator}>
          <Button type='primary'
            className={styles.button}
            onClick={() => this.setState({ showEditModal: true })}
            size='small'>新增策略模板</Button>
          <Upload type='primary'
            size='small'
            className={styles.button}
            {...props}>
            <Icon type="upload" />导入策略模板
                    </Upload>
          <Tooltip title='导入文件只支持JSON格式' >
            <Icon type='info-circle-o' className={styles.button} /></Tooltip>
        </Row>
        {!showPriority && modalProps.visible && <EditPolicyTemplateModal {...modalProps} />}
        {showPriority && <PriorityRecomModal {...modalProps} />}
        <Table
          pagination={false}
          rowKey='id'
          columns={[
            { title: '策略模板名称', key: '0', dataIndex: 'strategyName' },
            {
              title: '操作',
              key: '3',
              render: (record) => {
                const exportPath = `${webAPICfg.basePath}/smMarketingScene/exportStrategyTemplate/${record.id}`;
                const isPriority = record.type === 'priority';
                return (<div>
                  {
                    !isPriority && <a href={exportPath}>下载</a>
                  }
                  {
                    !isPriority && <Divider type='vertical' />
                  }
                  <a onClick={() =>
                    this.setState({ showEditModal: true, editTemplate: record })}>编辑</a>
                  {
                    !isPriority && <Divider type='vertical' />
                  }
                  { !isPriority &&
                    <Popconfirm
                      title={`确定是否删除策略模板"${record.strategyName}"`}
                      onConfirm={this.handleDeleteTemplate.bind(this, record)}
                    ><a onClick={() => false}>删除</a></Popconfirm>
                  }
                </div>)
              },
            }]}
          dataSource={list}
        />
      </div >
    );
  }
}

SceneConfiguration.propTypes = {

};

export default SceneConfiguration;