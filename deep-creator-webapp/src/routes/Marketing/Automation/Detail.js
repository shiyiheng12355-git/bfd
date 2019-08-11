import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Switch, Card, Form, Spin, Col } from 'antd';
import moment from 'moment';
import lodash from 'lodash';

import { WorkFlowEditor } from '../../../components/WorkFlowEditor';
import GroupDataFilter from '../../../components/GroupDataFilter';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './Detail.less';
import { parseNodes } from './helper';
import { LIMITLESS_TIMESTAMP, ANOTHER_LIMITLESS } from '../../../utils/utils';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

@connect(state => ({
  tagPicker: state.tagPicker,
  ...state['marketing/automation'],
  loading: state.LOADING,
}))
export default class Detail extends PureComponent {
  state = {
    date: null,
    currentAutomation: null,
    nodes: [],
  }

  componentWillMount() {
    const { history, location: { state }, match: { params: { id } } } = this.props;
    // this.props.dispatch({
    //   type: 'marketing/automation/fetchCurrentAutomation',
    //   payload: { id: parseInt(id, 10) },
    // })
    if (!state) { history.push('/marketing/automation'); return false }
    this.props.dispatch({
      type: 'marketing/automation/updateState',
      payload: { currentAutomation: state },
    })
    this.automation = state;
    const today = moment().format('YYYY-MM-DD');
    this.handleLoadData({ range: [today, today] });
    let nodes = JSON.parse(this.automation.conditionJson).node_list;
    nodes = nodes.map((node) => { return { ...node, deletable: false } });
    this.setState({ nodes }); // 先渲染
    this.groupNode = nodes.find(_node => _node.type === 'GROUP');
    const extraInfo = this.groupNode.extra_info;
    this.props.dispatch({
      type: 'marketing/automation/fetchGroupNum',
      payload: { entityId: extraInfo.entity_id, ids: extraInfo.groupId.toString() },
      callback: (err, groupNum = {}) => {
        const cover = groupNum[extraInfo.groupId];
        let num = '-';
        if (cover) num = cover.userNum + cover.customerNum;
        nodes = nodes.map((node) => {
          if (node.type === 'GROUP') return { ...node, num }
          return node;
        })
        this.setState({ nodes: nodes.slice(0) });
      },
    })
  }

  handleLoadData = (date) => {
    this.setState({ date })
    const [startDate, endDate] = date.range;
    const payload = {
      startDate,
      endDate,
      TGItype: this.automation.TGItype || 'AUTOMATION',
    };

    if (payload.TGItype === 'AUTOMATION') {
      payload.id = this.automation.id;
    } else {
      payload.treeId = this.automation.treeId;
      payload.bizLifeTripInfoParam = this.automation.extraParams.bizLifeTripInfoParam;
    }
    this.props.dispatch({
      type: 'marketing/automation/fetchNodeCountList',
      payload,
    })
  }

  handleClickCount = (model) => {
    const TGIParams = this.TGIParams(model);
    this.props.dispatch(routerRedux.push({
      pathname: `/groups/${TGIParams.entityId}/temp`,
      state: {
        TGItype: this.automation.TGItype || 'AUTOMATION',
        TGIParams: { ...TGIParams, ...(this.automation.extraParams || {}) },
        personNumber: model.coverNum,
      },
    }))
  }

  TGIParams = (model) => { // 历史群组查询参数
    const { treeId, groupId } = this.automation;
    const extraInfo = this.groupNode.extra_info;
    const { point, period } = this.state.date || {};
    const date = point ? { point } : (period ? {
      start_date: period['start-date'],
      end_date: period['end-date'],
    } : { point: 'today' });

    return {
      entityId: extraInfo.entity_id,
      entity_english_name: extraInfo.entity_name,
      group_expression: {
        date,
        node: {
          node_id: model.target,
        },
        tree_id: treeId,
      },
      group_id: '',
      longGroupId: groupId,
      prev_group_expression: '',
      type: 'decision',
    }
  }

  handleChangeMonitor = (record, checked) => {
    const isMonitor = checked ? 1 : 0;
    this.props.dispatch({
      type: 'marketing/automation/changeMonitor',
      payload: { id: record.id, isMonitor },
      callback: () => {
        this.props.dispatch({
          type: 'marketing/automation/updateState',
          payload: { currentAutomation: { ...this.props.currentAutomation, isMonitor } },
        })
      },
    })
  }


  render() {
    const { loading, nodeCountList = [], currentAutomation } = this.props;
    if (!currentAutomation) return false;
    this.automation = currentAutomation;
    const loadingData = loading.effects['marketing/automation/fetchDecisionTreeData'];

    const nodeKeys = lodash.keyBy(nodeCountList, 'node_id');
    const editorProps = {
      modals: [],
      ...parseNodes(this.state.nodes, nodeKeys),
      onClickCount: this.handleClickCount,
    }

    const isLimitlessTime = [LIMITLESS_TIMESTAMP, ANOTHER_LIMITLESS].includes(this.automation.endDate); // 是否展示不限
    const endTimeStr = isLimitlessTime ? '不限' : moment(this.automation.endDate).format(DATE_FORMAT);
    const disableSwitch = this.automation.endDate < moment().valueOf(); // 过了结束时间的自动话营销不再监听

    return (
      <div className={styles.detail}>
        <PageHeaderLayout
          breadcrumbList={[{ title: '营销场景' }, { title: '自动化营销' }, { title: '自动化营销列表页' }, { title: '自动化营销详情页' }]}>

          <Card bordered={false}>
            {/*
          <Form.Item label='选择查看时段'
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 16 }}>
            <Col span={20}>
              <GroupDataFilter
                selected="today"
                onChange={this.handleLoadData}
              />
            </Col>
            <Col span={4}>
              {loadingData && <Spin />}
            </Col>
          </Form.Item>
          */}

            <div className={styles.time}>
              <div className={styles.title}>选择查看时段:</div>
              <div className={styles.gfer}>
                <GroupDataFilter
                  selected="today"
                  onChange={this.handleLoadData}
                />
              </div>
            </div>
            <h1>{this.automation.maketingName}</h1>
            <Link to='/marketing/automation'>返回</Link>
            <p>
              <span>有效期至: {endTimeStr}</span>
              <span className={styles.info}>创建时间： {moment(this.automation.createTime).format(TIME_FORMAT)}</span>
              <span className={styles.info}>监听：
                <Switch
                  disabled={disableSwitch}
                  checked={this.automation.isMonitor === 1}
                  onChange={this.handleChangeMonitor.bind(this, this.automation)}
                />
              </span>
            </p>
            <p>说明： {this.automation.maketingDesc}</p>
            {
              !loadingData &&
              <WorkFlowEditor {...editorProps} />
            }
          </Card>
        </PageHeaderLayout>
      </div>);
  }
}