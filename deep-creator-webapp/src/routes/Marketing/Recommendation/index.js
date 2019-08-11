import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {
  Row, Col, Card, Form, Table,
  Select, Divider, Button,
  DatePicker,
} from 'antd';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import moment from 'moment';
import uuid from 'uuid';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import lodash from 'lodash';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TrendModal from './TrendModal';
import { webAPICfg } from '../../../utils'
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { basePath } = webAPICfg;

const Authorized = RenderAuthorized();

@connect((state) => {
  return {
    rule: state['marketing/recommendation'],
    config: state['sysconfig/marketing'],
    loading: state.LOADING,
    user: state.user,
  }
})
@Form.create({})
export default class Recommendation extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    editRec: null,
    showTrend: null,
    siteId: null,
    appKey: null,
    fieldId: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'marketing/recommendation/fetch',
      payload: {},
    });
    dispatch({
      type: 'sysconfig/marketing/fetchSites',
      payload: {},
    })
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_gxhtj' },
    })
  }

  handleTableChange = (pagination) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'marketing/recommendation/updatePagination',
      payload: { pageNum: pagination.current, pageSize: pagination.pageSize },
    })

    dispatch({
      type: 'marketing/recommendation/fetch',
      payload: {},
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'marketing/recommendation/fetch',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'marketing/recommendation/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  handleEditRec = (record) => {
    this.setState({ modalVisible: true, editRec: record });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleOnChange = (values) => {
    let { siteId, appKey, fieldId, period } = values;
    const { rule: { query } } = this.props;
    if (siteId) {
      if (siteId === 'all') siteId = '';
      this.props.dispatch({
        type: 'marketing/recommendation/updateQuery',
        payload: { siteId, appKey: undefined, fieldId: undefined },
      })
      if (siteId) {
        this.props.dispatch({
          type: 'marketing/recommendation/fetchAppKeys',
          payload: { siteId },
          callback: (apps) => {
            this.props.dispatch({
              type: 'marketing/recommendation/updateState',
              payload: { appKeyList: apps, fieldList: [] },
            })
          },
        })
      } else {
        this.props.dispatch({
          type: 'marketing/recommendation/updateState',
          payload: { appKeyList: [], fieldList: [] },
        })
      }
    }
    if (appKey) {
      if (appKey === 'all') appKey = '';
      this.props.dispatch({
        type: 'marketing/recommendation/updateQuery',
        payload: { appKey, fieldId: undefined },
      })
      if (appKey) {
        this.props.dispatch({
          type: 'sysconfig/marketing/fetchAppFields',
          payload: { appKey, siteId: query.siteId },
          callback: (fields) => {
            this.props.dispatch({
              type: 'marketing/recommendation/updateState',
              payload: { fieldList: fields },
            })
          },
        })
      } else {
        this.props.dispatch({
          type: 'marketing/recommendation/updateState',
          payload: { fieldList: [] },
        })
      }
    }
    if (fieldId) {
      if (fieldId === 'all') fieldId = '';
      this.props.dispatch({
        type: 'marketing/recommendation/updateQuery',
        payload: { fieldId },
      })
    }
    if (period) {
      const startTime = period[0].format('YYYY-MM-DD');
      const endTime = period[1].format('YYYY-MM-DD');
      this.props.dispatch({
        type: 'marketing/recommendation/updateQuery',
        payload: { startTime, endTime },
      })
    }
    this.handleSearch();
  }

  handleSearch = () => {
    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };

      dispatch({
        type: 'marketing/recommendation/fetch',
        payload: { query: values },
      });
      this.props.dispatch({
        type: 'marketing/recommendation/updateQuery',
        payload: values,
      })
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  renderSimpleForm() {
    const { config: { siteList },
      rule: {
        data: { pagination: { pageNum, pageSize } },
        query: { startTime, endTime, siteId, appKey, fieldId },
        appKeyList, fieldList }, user: { auths } } = this.props;
    const period = [moment(startTime), moment(endTime)];
    let exportParam = {
      pageNum,
      pageSize,
      startTime,
      endTime,
      header: 'show_pv,click_pv,order_num,item_total,item_day,item_new',
      siteId,
      appKey,
      fieldId,
    };
    exportParam = lodash.pickBy(exportParam, e => !!e); // 去掉不存在的参数
    const str = Object.entries(exportParam).map(([key, value]) => `${key}=${value}`).join('&');
    const exportPath = `${basePath}/bizPerRecom/export?${str}`
    return (
      <Form layout="inline">
        <Row>
          <Col md={8} sm={24}>
            <FormItem label="客户资源筛选">
              <Select style={{ width: '200px' }}
                onChange={key => this.handleOnChange({ siteId: key })}
                placeholder='请选择'
                value={siteId || 'all'} >
                <Option value="all" key="all">全部</Option>
                {
                  siteList.map((site) => {
                    return (<Option value={site.siteId}
                      key={site.siteId}>{site.siteName}</Option>)
                  })
                }
              </Select>
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            {
              <FormItem label="客户端筛选">
                <Select placeholder="请选择"
                  style={{ width: '200px' }}
                  disabled={!appKeyList.length}
                  onChange={key => this.handleOnChange({ appKey: key })}
                >
                  <Option value="all" key="all">全部</Option>
                  {
                    appKeyList.map((appKey) => {
                      return (
                        <Option value={appKey.appKey}
                          key={appKey.appKey}
                        >{appKey.appKeyName}
                        </Option>)
                    })
                  }
                </Select>
              </FormItem>
            }
          </Col>
          <Col md={8} sm={24}>
            {
              <FormItem label="栏位筛选">
                <Select placeholder="请选择"
                  style={{ width: '200px' }}
                  disabled={!fieldList.length}
                  onChange={key => this.handleOnChange({ fieldId: key })}
                >
                  <Option value="all" key="all">全部</Option>
                  {
                    fieldList.map((field) => {
                      return (
                        <Option value={field.fieldId}
                          key={field.fieldId}
                        >{field.fieldName}
                        </Option>)
                    })
                  }
                </Select>
              </FormItem>
            }
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="选择查看时段">
              <RangePicker value={period}
                onChange={_period => this.handleOnChange({ period: _period })} />
            </FormItem>
          </Col>
          <Col md={4} offset={20} className={styles.tableListOperator}>
            <Authorized authority={() => auths.includes('yxcj_gxhtj_dc')}>
              <Button type='primary' href={exportPath} >导出</Button>
            </Authorized>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  toggleTrend = (record) => {
    const { showTrend } = this.state;
    this.setState({ showTrend: showTrend ? null : record })
  }
  render() {
    let { rule: { data, query: { startTime, endTime }, currentTrend },
      dispatch, loading, user: { auths } } = this.props;
    const loadingRecom = loading.global;

    const { showTrend } = this.state;
    const isSameDay = startTime === endTime;
    const columns = [
      {
        title: '客户资源',
        dataIndex: 'siteName',
        key: 0,
        width: '10%',
        render: text => <Ellipsis length={8} tooltip>{text}</Ellipsis>,
      },
      {
        title: '客户端',
        dataIndex: 'appKeyName',
        key: 12,
        width: '10%',
        render: text => <Ellipsis length={8} tooltip>{text}</Ellipsis>,
      },
      {
        title: '栏位',
        dataIndex: 'fieldName',
        key: 1,
        width: '10%',
        render: text => <Ellipsis length={8} tooltip>{text}</Ellipsis>,
      },
      {
        title: '分流占比',
        width: '8%',
        render: (record) => { if (record.shuntRate) return `${100 * record.shuntRate}%` },
        key: 2,
      },
      {
        title: '当前策略名称',
        dataIndex: 'policyName',
        key: 3,
        width: '12%',
        render: text => <Ellipsis length={8} tooltip>{text}</Ellipsis>,
      },
      {
        title: '曝光',
        dataIndex: 'dFeedBack',
        key: 4,
        width: '8%',
      },
      {
        title: '点击',
        dataIndex: 'feedBack',
        key: 13,
        width: '8%',
      },
      {
        title: '转化',
        dataIndex: 'transform',
        key: 5,
        width: '8%',
      },
      {
        title: '实时率',
        key: 6,
        width: '8%',
        render: (record) => {
          if (isSameDay) {
            const rate = (record.realTimeRate * 100).toFixed(2);
            return `${rate}%`
          }
          return '-';
        },
      },
      {
        title: '覆盖率',
        key: 7,
        width: '8%',
        render: (record) => {
          if (isSameDay) {
            const rate = (record.coverageRate * 100).toFixed(2);
            return `${rate}%`
          }
          return '-';
        },
      },
      {
        title: '操作',
        key: 8,
        width: '10%',
        render: record => (
          <div>
            <Authorized authority={() => auths.includes('yxcj_gxhtj_bj')}>
              <Link to={{
                pathname: `/marketing/recommendation/${record.fieldId}`,
                state: record,
              }}>
                编辑</Link>
            </Authorized>
            <Authorized authority={() => auths.includes('yxcj_gxhtj_ckqst')}>
              <Divider type='vertical' />
              <a onClick={this.toggleTrend.bind(this, record)}>趋势图</a>
            </Authorized>
          </div>
        ),
      },
    ];

    const trendModalProps = {
      dispatch,
      visible: showTrend !== null,
      onCancel: () => this.setState({ showTrend: null }),
      onOk: () => this.setState({ showTrend: null }),
      width: 520,
      height: 260,
      rec: showTrend,
      startTime,
      endTime,
      currentTrend,
    }

    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' },
      { title: '营销场景' }, { title: '个性化推荐' }]}>
        <TrendModal {...trendModalProps} />
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <Table
              loading={loadingRecom}
              rowKey={record => uuid.v1()}
              dataSource={data.list}
              columns={columns}
              pagination={data.pagination}
              onChange={this.handleTableChange}
              scroll={{ x: 1100 }}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
