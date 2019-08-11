import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
  Card, Form, Table, Button, Divider, Switch, Modal,
} from 'antd';
import moment from 'moment';

import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';

import AddAutomationModal from './AddAutomationModal';
import { formatMoment } from '../../../utils/utils';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';

const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const Authorized = RenderAuthorized(); // 创建自动化营销

@connect(state => ({
  automation: state['marketing/automation'],
  user: state.user,
}))
@Form.create()
export default class Automation extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    isCopy: false, // 当前是否复制
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'marketing/automation/fetch',
    });
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_zdhyx' },
    })
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'marketing/automation/fetch',
      payload: params,
    });
  }


  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  handelEdit = (automation) => {
    this.setState({ editAutomation: automation });
    this.handleModalVisible(true)
  }

  handelCopy = (automation) => {
    this.setState({ isCopy: true });
    this.handelEdit(automation);
  }

  handleAdd = (values) => {
    this.setState({
      modalVisible: false,
      editAutomation: null,
      isCopy: false,
    });
  }

  handleRemove = (record) => {
    Modal.confirm({
      title: '删除确认',
      content: `是否删除"${record.maketingName}"策略`,
      onOk: (close) => {
        this.props.dispatch({
          type: 'marketing/automation/remove',
          payload: record,
          callback: () => {
            this.props.dispatch({
              type: 'marketing/automation/fetch',
              payload: {},
            })
            close();
          },
        });
      },
    });
  }

  handleChangeMonitor = (record, checked) => {
    this.props.dispatch({
      type: 'marketing/automation/changeMonitor',
      payload: { id: record.id, isMonitor: checked ? 1 : 0 },
      callback: () => {
        this.props.dispatch({
          type: 'marketing/automation/fetch',
          payload: {},
        })
      },
    })
  }

  render() {
    const { automation: { data, userEntityList }, user: { auths } } = this.props;
    const { modalVisible, editAutomation, isCopy } = this.state;
    const columns = [
      {
        title: '名称',
        dataIndex: 'maketingName',
        render: text => <Ellipsis length={12} tooltip={text}>{text}</Ellipsis>,
      },
      {
        title: '描述',
        dataIndex: 'maketingDesc',
        render: text => <Ellipsis length={18} tooltip={text}>{text}</Ellipsis>,
      },
      {
        title: '创建人',
        dataIndex: 'createUser',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: createTime => formatMoment(createTime),
      },
      {
        title: '操作',
        render: record => (
          <div>
            <Switch checked={record.isMonitor !== 0}
              disabled={record.endDate < moment().valueOf()}
              onChange={this.handleChangeMonitor.bind(this, record)}>监听</Switch>
            <Divider type='vertical' />
            <Link to={{
              pathname: `/marketing/automation/${record.id}`,
              state: record,
            }} >详情</Link>
            <Divider type='vertical' />
            <a onClick={this.handelEdit.bind(this, record)}>编辑</a>
            <Divider type='vertical' />
            <a onClick={this.handelCopy.bind(this, record)}>复制</a>
            <Divider type='vertical' />
            <a onClick={this.handleRemove.bind(this, record)}>删除</a>
          </div>),
      },
    ];

    const modalProps = {
      title: editAutomation ? '编辑自动化营销' : '新增自动化营销',
      userEntityList,
      visible: modalVisible,
      onCancel: () => {
        this.setState({ modalVisible: false },
          () => this.setState({ editAutomation: null, isCopy: false }))
      },
      onOk: this.handleAdd,
      editAutomation,
      isCopy,
      auths,
    };

    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '营销场景' }, { title: '自动化营销' }]}>
        <Authorized authority={() => auths.includes('yxcj_zdhyx_cj')}>
          <AddAutomationModal
            {...modalProps}
          />
        </Authorized>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Authorized authority={() => auths.includes('yxcj_zdhyx_cj')}>
                <Button type="primary" onClick={() => this.handleModalVisible(true)}>
                  新增自动化推荐
                </Button>
              </Authorized>
            </div>
            <Table
              rowKey="id"
              columns={columns}
              onChange={this.handleStandardTableChange}
              dataSource={data.list} />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}