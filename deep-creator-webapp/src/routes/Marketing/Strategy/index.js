import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Modal, Divider, Popover, notification } from 'antd';
import moment from 'moment';

import RenderAuthorized from 'ant-design-pro/lib/Authorized';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import AddStrategyModal from './AddStrategyModal';
import PushStrategyForm from './PushStrategyForm';
import StandardTable from '../../../components/StandardTable';
import { TIME_FORMAT } from '../../../utils/utils';
import lodash from 'lodash';

import styles from './index.less';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';

const Authorized = RenderAuthorized();

@connect(state => ({
  rule: state['marketing/strategy'],
  config: state['sysconfig/marketing'],
  loading: state.LOADING,
  user: state.user,
}))
export default class Strategy extends PureComponent {
  state = {
    modalVisible: false,
    addModalVisible: false,
    editStrategy: null, // 正在被编辑的策略
    showStrategyForm: false,
    selectedRows: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'marketing/strategy/fetch',
      payload: {},
    });
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_clyx' },
    })
  }

  handleTableChange = (pagination) => {
    const { dispatch } = this.props;

    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    };

    dispatch({
      type: 'marketing/strategy/save',
      payload: { pagination: params },
    });
    dispatch({
      type: 'marketing/strategy/fetch',
      payload: {},
    })
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'marketing/strategy/fetch',
      payload: {},
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows.slice(0),
    });
  }

  handleUnselectRow = (record) => {
    const { selectedRows } = this.state;
    let rows = selectedRows.filter(row => row.key !== record.key);
    this.handleSelectRows(rows);
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;

    switch (e.key) {
      case 'remove':
        Modal.confirm({
          title: `是否删除策略营销"${e.record.maketingName}"`,
          onOk: (close) => {
            dispatch({
              type: 'marketing/strategy/remove',
              payload: { id: e.record.id },
            }); close()
          },
        })

        break;
      case 'download':
        dispatch({
          type: 'marketing/strategy/download',
          payload: { id: e.record.id },
        })
        break;
      default:
        break;
    }
  }

  handleModalVisible = (flag) => {
    this.setState({
      addModalVisible: !!flag,
    });
  }

  handlePushStrategy = (values) => {
    const { stratetyId, rec } = values;
    if (!stratetyId) return notification.warning({ message: '请选择要推送的策略' });
    const ids = stratetyId.split(',').map(id => parseInt(id, 10));
    const selectedList = this.props.rule.data.list.filter(i => ids.includes(i.id));
    if (rec === 1) {
      const ruleMatchList = selectedList.filter(i => i.matchType === '规则匹配')
        .map(i => i.maketingName);
      if (ruleMatchList.length) {
        return notification.warning({
          message: '推送的规则不满足要求',
          description: `推送到[系统推荐－个性化推荐]的规则中类型不能是[规则匹配]，[${ruleMatchList.join(',')}]类型为[规则匹配]`,
        })
      }
    }
    this.props.dispatch({
      type: 'marketing/strategy/pushCheck',
      payload: { ids: stratetyId },
      callback: (err, pushStatus) => {
        const noPush = lodash.intersection(pushStatus || [], ids);
        if (noPush.length) {
          const noPushList = selectedList.filter(i => noPush.includes(i.id))
            .map(i => i.maketingName);
          return notification.warning({
            message: '规则不能重复推送',
            description: `规则[${noPushList.join(',')}]不能重复推送`,
          })
        } else {
          this.props.dispatch({
            type: 'marketing/strategy/pushStrategy',
            payload: values,
            callback: (err) => {
              if (!err) this.handleSelectRows([]);
            },
          })
        }
      },
    })
  }

  render() {
    const { rule: { data, ruleList,
      groupColumns, recomList,
      entityList, pushMembers }, dispatch, user: { auths }, loading } = this.props;
    const { selectedRows, showStrategyForm } = this.state;
    const columns = [
      {
        title: '名称',
        dataIndex: 'maketingName',
        render: text => <Ellipsis length={16} tooltip={text}>{text}</Ellipsis>,
      },
      {
        title: '推荐对象',
        dataIndex: 'toGroupName',
      },
      {
        title: '规则类型',
        dataIndex: 'matchType',
      },
      {
        title: '查看详情',
        render: record => (<Popover
          content={
            <div>
              <p>创建人：{record.createUser || ''}</p>
              <p>创建时间：{moment(record.createTime).format(TIME_FORMAT)}</p>
              <p>最近修改人：{record.updateUser || ''}</p>
              <p>最近修改时间：{record.updateTime ? moment(record.updateTime).format(TIME_FORMAT) : ''}</p>
            </div>}>
          <a>详情</a>
        </Popover>),
      },
      {
        title: '操作',
        render: record => (
          <div>
            <a onClick={() => this.setState({
              editStrategy: record,
              addModalVisible: true,
            })}>编辑</a>
            <Divider type='vertical' />
            <Authorized authority={() => auths.includes('yxcj_clyx_xz')}>
              <a onClick={this.handleMenuClick.bind(this,
                { key: 'download', record })}>
                下载</a>
              <Divider type='vertical' />
            </Authorized>
            <a onClick={this.handleMenuClick.bind(this,
              { key: 'remove', record })} >
              删除</a>
          </div>
        ),
      },
    ];

    const addModelProps = {
      loading,
      destroyOnClose: true,
      title: this.state.editStrategy ? '编辑推荐' : '新增推荐',
      dispatch,
      ruleList,
      visible: this.state.addModalVisible,
      width: '80%',
      height: '80%',
      strategy: this.state.editStrategy,
      auths,
      onOk: () => {
        this.setState({ addModalVisible: false, editStrategy: null })
        this.props.dispatch({
          type: 'marketing/strategy/fetch',
          payload: {},
        })
      },
      onCancel: () => this.setState({
        addModalVisible: false,
        editStrategy: null,
      }),
      groupColumns,
      entityList,
      recomList,
    };
    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '营销场景' }, { title: '策略营销' }]}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Authorized authority={() => auths.includes('yxcj_clyx_cj')}>
                <Button
                  type="primary"
                  onClick={() => this.handleModalVisible(true)}>
                  新增策略
              </Button>
              </Authorized>
              <Authorized authority={() => auths.includes('yxcj_clyx_tscl')}>
                <Button
                  type="primary"
                  onClick={() => this.setState({ showStrategyForm: true })}>
                  推送策略
            </Button>
              </Authorized>
            </div>
            {
              showStrategyForm &&
              <PushStrategyForm
                dispatch={dispatch}
                auths={auths}
                pushMembers={pushMembers}
                onSubmit={this.handlePushStrategy}
                onCancel={() => {
                  this.handleSelectRows([]);
                  this.setState({ showStrategyForm: false });
                }
                }
                onCloseTag={this.handleUnselectRow}
                selectedRows={selectedRows} />
            }
            <StandardTable
              selectedRows={selectedRows}
              loading={loading.global}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleTableChange}
            />
          </div>
        </Card >
        <AddStrategyModal {...addModelProps} />
      </PageHeaderLayout >
    );
  }
}
