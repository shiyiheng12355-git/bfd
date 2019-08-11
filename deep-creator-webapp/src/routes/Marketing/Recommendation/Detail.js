import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, notification, Popconfirm } from 'antd';
import { connect } from 'dva';
import lodash from 'lodash';
import uuid from 'uuid';
import { Link, routerRedux } from 'dva/router';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

import { parseData } from './helper';
import { cutString } from '../../../utils/utils';

import { WorkFlowEditor, ButtonDragSource } from '../../../components/WorkFlowEditor';
import ProductModal from './StrategyModal/ProductModal';
import StrategyModal from './StrategyModal/StrategyModal';
import SplitFlowModal from './StrategyModal/SplitFlowModal';
import PriorityRecoModal from './StrategyModal/PriorityRecoModal';
import FilterModal from './StrategyModal/FilterModal';
import FillModal from './StrategyModal/FillModal';
import SortModal from './StrategyModal/SortModal';
import UniqModal from './StrategyModal/UniqModal';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const Authorized = RenderAuthorized();

class SiderBar extends PureComponent {
  render() {
    const { templateList } = this.props;
    return (
      <div>
        <h3>经典推荐场景</h3>
        {
          templateList.map((strategy, index) => {
            return (
              <ButtonDragSource
                modal={`StrategyModal${index}`}
                key={`strategy_${index}`}>
                {strategy.strategyName}
              </ButtonDragSource>)
          })
        }
      </div>)
  }
}
// 编辑推荐策略
@connect((state) => {
  return {
    ...state['sysconfig/marketing'],
    ...state['marketing/recommendation'],
    coding: { ...state.coding }, // 关于码表的配置
    user: state.user,
  }
})
class AddRecStrategy extends Component {
  state = {
    nodes: [],
    json: {
    },
    execDisabled: true,
  }

  backword = () => {
    this.props.dispatch(routerRedux.push('/marketing/recommendation'))
  }

  loadRecomCfg = () => {
    const _this = this;
    _this.props.dispatch({
      type: 'marketing/recommendation/fetchCurrentRecomCfg',
      payload: _this.currentRecom,
    })
  }

  componentWillMount() {
    const { location: { state }, dispatch, history } = this.props;
    if (!state) { history.push('/marketing/recommendation'); return }
    const currentRecom = state;
    this.currentRecom = currentRecom || {};
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_gxhtj_bj' },
    })
    dispatch({ // 查询策略模板列表
      type: 'sysconfig/marketing/fetchTemplateList',
      payload: {},
    })

    dispatch({
      type: 'marketing/recommendation/fetchCurrentRecomCfg',
      payload: currentRecom,
      callback: (err, currentRecomCfg) => {
        this.parseNodes(currentRecomCfg, currentRecom);
      },
    })
    this.props.dispatch({
      type: 'marketing/recommendation/fetchRecContentEntityList',
      payload: {},
    })
  }

  parsePolicyValue = () => { // 从节点中解析接口需要的数据结构
    const { nodes } = this.state;
    const { value: { fieldId, appKey } } = nodes.find(({ type }) => type === 'lwNode');
    const flNode = nodes.find(({ type }) => type === 'flNode');
    let { policyList } = flNode.value;
    const policyNodes = nodes.filter(({ type }) => type === 'policyNode');
    const groups = lodash.groupBy(policyNodes, 'policyId'); // 按照policyId对节点分组
    return Object.keys(groups).map((_policyId) => {
      const policyId = parseInt(_policyId, 10);
      const _nodes = groups[policyId];
      const tcNode = _nodes.find(_node => _node.subType === 'tcNode');
      const qcNode = _nodes.find(_node => _node.subType === 'qcNode');
      const glNode = _nodes.find(_node => _node.subType === 'glNode');
      const pxNode = _nodes.find(_node => _node.subType === 'pxNode');
      const clNode = _nodes.find(_node => _node.subType === 'clNode')
      const flSubNode = policyList.find(({ id }) => id === policyId) || {};
      const item = {
        ...flSubNode,
        addition: tcNode ? tcNode.value.addition : '',
        deduplication: qcNode ? qcNode.value.deduplication : '',
        filter: glNode ? glNode.value.filter : '',
        sort: pxNode ? pxNode.value.sort : '',
        valueJson: clNode ? clNode.value.valueJson : '',
        templateId: clNode ? clNode.value.templateId : 0,
        policyId,
      };
      return { ...item, fieldId };
    })
  }

  // 将前端数据格式转换成服务端格式
  converData = (nodes) => {
    const { value: { fieldId, appKey } } = nodes.find(({ type }) => type === 'lwNode');
    const rcNode = nodes.find(({ type }) => type === 'rcNode');
    const flNode = nodes.find(({ type }) => type === 'flNode');
    if (!rcNode.value || !rcNode.value.recommendEnglishName) return notification.error({ message: '未配置推荐内容节点，请先配置' })
    if (!flNode.value) return notification.error({ message: '未配置分流节点，请先配置' })

    const policyList = this.parsePolicyValue();
    if (policyList.length === 0) { notification.warn({ message: '未使用任何推荐策略' }); return }

    const data = { appKey, list: [], fieldId }
    const rulePolicy = {};
    let { firstRecommend } = rcNode.value;

    // 从本地节点缓存里读取各个策略分支的配置数据
    data.list = policyList;
    policyList.forEach((policy) => {
      rulePolicy[policy.policyId] = { rule: '' };
      let { valueJson, filter, sort, deduplication, addition } = policy;
      let ruleStr = '';
      if (firstRecommend) { // 优先推荐
        ruleStr += `preferred[groupsids="${firstRecommend}",num=0];`;
      }
      if (valueJson) {
        const _valueJson = JSON.parse(valueJson);
        const { templateRule } = _valueJson; // 模板字符串
        delete _valueJson.templateRule;
        const other = _valueJson; // 其他变量
        if (other) {
          const compiled = lodash.template(templateRule);
          ruleStr += compiled(other);
        }
      }

      if (filter) { // 过滤
        const _filter = JSON.parse(filter);

        const { black, attribute, tags, outerCondition, condition = {} } = _filter;
        let f = attribute.reduce((pre, cur) => {
          const isOk = cur.attribute && cur.connect && cur.value; // 数据完整
          if (pre && isOk) {
            return `(${pre} ${cur.condition} (${cur.attribute} ${cur.connect} ${cur.value}))`
          } else if (isOk) {
            return `(${cur.attribute} ${cur.connect} ${cur.value})`;
          } else {
            return pre;
          }
        }, '');
        let str = ''; // (条件1)and/or(条件2))and/or标签值
        if (tags && outerCondition) {
          const keys = Object.keys(tags);
          const tagStr = keys.reduce((pre, engName, index) => {
            const hasNext = !!keys[index + 1];
            const tStr = `${engName} in [${tags[engName].map(i => `'${i}'`).join(',')}]`;
            const conStr = hasNext ? condition[engName] : '';
            if (pre) {
              return `(${pre} (${tStr})) ${conStr}`;
            } else {
              return `( ${tStr}) ${conStr}`;
            }
          }, '')
          const outerStr = f ? outerCondition : '';
          if (tagStr) {
            if (keys.length > 1) {
              f = `${f} ${outerStr} (${tagStr})`
            } else {
              f = `${f} ${outerStr} ${tagStr}`
            }
          }
        }
        const dayStr = _filter.day ? `,day="${_filter.day}"` : '';
        const hourStr = _filter.hour ? `,hour="${_filter.hour}"` : '';
        const fStr = f ? `f="${f}"` : '';
        str += `filter[${fStr} ${dayStr} ${hourStr}]`;
        if (black.length) {
          const filterBlack = black.filter(i => !!i).join('|'); // |分割
          if (filterBlack) str = `${str} > filter_black[iid="${filterBlack}"]`
        }
        ruleStr += `> ${str}`;
      }
      if (sort) { // 排序
        const _sort = JSON.parse(sort);
        let { random, topn, algorithm } = _sort;
        const sortStrArr = [];
        if (_sort.sort.by) {
          sortStrArr.push(`by="${_sort.sort.by}"`);
        }
        if (_sort.sort.weight) {
          sortStrArr.push(`weight="${_sort.sort.weight}"`)
        }
        if (_sort.sort.order) {
          sortStrArr.push(`order="${_sort.sort.order}"`)
        }
        let sortStr = `sort[${sortStrArr.join(',')}]`;
        if (random.num) {
          sortStr = `${sortStr} > random[num="${random.num}"]`;
        }
        if (topn.num) {
          sortStr = `${sortStr} > topn[num="${topn.num}"]`;
        }
        // sortStr = `${sortStr} > ${algorithm.type}[weight=${algorithm.weight}]`; 算法暂时未实现
        ruleStr += `> ${sortStr}`;
      }
      if (deduplication) { // 去重
        const _deduplication = JSON.parse(deduplication);
        if (_deduplication.field) {
          ruleStr += `> unique[field="${_deduplication.field}"]`;
        }
      }
      if (addition) { // 填充 TODO
        const _addition = JSON.parse(addition);
        const mosthotStrArr = [];
        if (_addition.mosthot.app) {
          mosthotStrArr.push(`app="${_addition.mosthot.app}"`)
        }
        if (_addition.mosthot.minute) {
          mosthotStrArr.push(`minute="${_addition.mosthot.minute}"`)
        }
        if (_addition.mosthot.property) {
          mosthotStrArr.push(`property="${_addition.mosthot.property}"`)
        }
        if (mosthotStrArr.length) {
          ruleStr += `;mosthot[${mosthotStrArr.join(',')}]`;
        }
      }
      rulePolicy[policy.id] = {// 推荐策略ID，系统生成
        rule: ruleStr, // 策略规则
      }
    })

    const firstPolicy = policyList[0];
    let flowStr = '';
    if (firstPolicy.type === 0) { // abflow
      const flShuts = policyList.map(p => `${p.id}=${p.shuntRate}`).join(',');
      flowStr = `abflow[flowtype="gid",${flShuts}]`;
    } else if (firstPolicy.type === 1) { // tagflow
      const flTags = policyList.map((p) => {
        const tagStr = p.tagEnglish;
        const json = JSON.parse(tagStr).tag;
        let tags = {};
        json.forEach((_tag) => {
          const { value: { tagEnglish }, label } = _tag;
          tags[tagEnglish] = tags[tagEnglish] || [];
          tags[tagEnglish].push(label);
        });
        const str = Object.keys(tags).map((t) => {
          if (t === 'default') return t;
          return `${t}:${tags[t].join(',')}`;
        }).join('|')
        return `${p.id}="${str}"`;
      }).join(',');
      flowStr = `tagflow[es_index="rec",es_type="item",${flTags}]`;
    } else {
      console.error('错误数据', firstPolicy);
    }

    const resultFormat = rcNode.value.resultFormat ? JSON.parse(rcNode.value.resultFormat) : {};
    const format = Object.keys(resultFormat).map((key) => {
      return `"${key}":$${key}`
    }).join(',')
    const recEntityId = parseInt(rcNode.value.recommendEnglishName, 10);
    const recEntity = this.props.recContentEntityList.find(i => i.id === recEntityId);
    if (!recEntityId) return notification.error({ message: '没有选择任何推荐内容' })
    data.rule = JSON.stringify({ // 推荐规则，将会写入zk中
      [fieldId]: {// 推荐栏ID，系统生成
        update_time: new Date().getTime(), // 更新时间
        fmt: `{${format}}`, // 返回结果字段，多个字段之前逗号分隔，现阶段返回字段的key值必须与返回商品属性字段相同。
        output_num: rcNode.value.resultNum, // 返回结果数，不同策略返回结果数一致
        item_type: recEntity.entityEnglishName, // 资源库
        rule: flowStr, // 分流规则
        policy: rulePolicy,
      },
    })
    delete data.policyList; // 减少干扰
    return data;
  }
  // 将服务端数据转换成前端需要的格式
  // currentRecomCfg 当前个性化推荐配置信息
  // currentRecom 当前个性化推荐元信息
  parseNodes = (currentRecomCfg, currentRecom) => {
    const value = { ...currentRecomCfg, ...currentRecom } // 合并
    const { siteName, appKeyName, fieldName, policyList } = value;
    const lwNode = {
      type: 'lwNode',
      value,
      id: uuid.v1(),
      label: '推荐栏位',
      shape: 'circle',
      info: '',
      tooltip: [['客户资源名称', siteName], ['客户端名称', appKeyName], ['栏位名称', fieldName]],
    };

    const rcNode = {
      type: 'rcNode',
      id: uuid.v1(),
      label: '推荐内容',
      shape: 'circle',
      pid: lwNode.id,
      info: '',
      modal: 'ProductModal',
      value,
    };

    const yxtjNode = {
      type: 'yxtjNode',
      id: uuid.v1(),
      label: '优先推荐',
      shape: 'rect',
      pid: rcNode.id,
      info: '',
      modal: 'PriorityRecoModal',
      value,
    };

    const flNode = {
      type: 'flNode',
      id: uuid.v1(),
      label: '分流',
      pid: yxtjNode.id,
      shape: 'rhombus',
      info: '',
      modal: 'SplitFlowModal',
      value,
    };

    if (!this.props.user.auths.includes('yxcj_gxhtj_bj_yxtj')) { // 不展示优先推荐节点
      flNode.pid = rcNode.id;
      this.setState({ nodes: [lwNode, rcNode, flNode] });
    } else {
      this.setState({ nodes: [lwNode, rcNode, yxtjNode, flNode] });
    }
    policyList ? policyList.map((policy) => {
      this.insertStrategyNode(flNode.id, policy);
    }) : [];
  }

  // 添加策略流程点，后面自动添加去重，排序等节点
  insertStrategyNode = (pid, policy) => {
    if (!policy.id) {
      console.error('错误数据，没有policyId', policy);
      return;
    }
    // 添加新的策略节点
    const policyId = policy.id;
    const policyName = policy.policyName || '未配置策略';
    const stgNode = {
      type: 'policyNode',
      subType: 'clNode',
      policyId,
      id: uuid.v1(),
      pid,
      label: cutString(policyName),
      tooltip: [['策略名称', policyName]],
      modal: 'StrategyModal',
      shape: 'rect',
      value: policy,
    }
    const glNode = {
      subType: 'glNode',
      type: 'policyNode',
      policyId,
      id: uuid.v1(),
      label: '过滤',
      shape: 'rect',
      pid: stgNode.id,
      modal: 'FilterModal',
      value: policy,
    } // 过滤
    const pxNode = {
      subType: 'pxNode',
      type: 'policyNode',
      policyId,
      id: uuid.v1(),
      label: '排序',
      shape: 'rect',
      pid: glNode.id,
      modal: 'SortModal',
      value: policy,
    } // 排序
    const qcNode = {
      subType: 'qcNode',
      type: 'policyNode',
      policyId,
      id: uuid.v1(),
      label: '去重',
      pid: pxNode.id,
      shape: 'rect',
      modal: 'UniqModal',
      value: policy,
    } // 去重
    const tcNode = {
      subType: 'tcNode',
      type: 'policyNode',
      policyId,
      id: uuid.v1(),
      label: '填充',
      shape: 'rect',
      pid: qcNode.id,
      modal: 'FillModal',
      value: policy,
    } // 填充

    this.setState({
      nodes: this.state.nodes.concat(
        [stgNode, glNode, pxNode, qcNode, tcNode]),
    });
  }

  handleDeleteNode = (node) => {
    // do nothing
  }

  onCommit = () => {
    const data = this.converData(this.state.nodes);
    this.props.dispatch({
      type: 'marketing/recommendation/execPolicy',
      payload: data,
      callback: () => this.setState({ execDisabled: true }),
    })
  }

  // 更新某一个节点的value
  updateNode = (values) => {
    if (!values.node) { console.error(values, '异常数据'); values.node = {} }
    const { nodes } = this.state;
    const index = lodash.findIndex(nodes, node => node.id === values.node.id);
    if (index >= 0) {
      const value = { ...nodes[index].value, ...values };
      nodes.splice(index, 1, { ...nodes[index], value });
      this.setState({ nodes: nodes.slice(0), execDisabled: false })
    }
  }

  render() {
    let { currentRecomCfg, templateList, coding, paramSources, entityList, entityTags,
      dispatch, priorityRecmdList, recContentEntityList, userEntityList, algorithmList,
      currentEntityId, user: { auths } } = this.props;
    currentRecomCfg = currentRecomCfg || {};
    // 配置项中 recommendEnglishName实际存储的是entityId
    const entityId = currentRecomCfg.recommendEnglishName ? parseInt(currentRecomCfg.recommendEnglishName, 10) : undefined;
    currentRecomCfg = { ...this.currentRecom, ...currentRecomCfg, entityId } // 将配置和列表中的数据合并
    this.currentRecomCfg = currentRecomCfg;

    const { nodes, execDisabled } = this.state;

    let modals = [
      {
        title: '设置推荐内容',
        modalComponent: ProductModal,
        props: {
          width: '50%',
          height: '50%',
          ...coding,
          dispatch,
          recContentEntityList,
          currentRecomCfg,
        },
        id: 'ProductModal',
        onOk: (values) => {
          this.updateNode(values);
        },
      },
      {
        title: '设置分流策略',
        modalComponent: SplitFlowModal,
        props: {
          width: '60%',
          height: '50%',
          dispatch,
          currentRecomCfg,
          userEntityList,
          entityTags,
          currentEntityId,
          auths,
        },
        id: 'SplitFlowModal',
        onOk: (values) => {
          const pid = values.node ? values.node.id : null;
          this.updateNode(values) // 更新分流节点数据
          const policyValues = this.parsePolicyValue() || [];
          // 删除旧的策略节点
          const filteredNodes = this.state.nodes.filter(n => !n.policyId);
          this.setState({ nodes: filteredNodes })
          // 添加新的
          values.policyList.map((branch) => {
            const cachedPolicy = policyValues.find(policy => policy.policyId === branch.id) || {};
            this.insertStrategyNode(pid, { ...cachedPolicy, ...branch }); // 将缓存的数据和更新的数据合并
          })
          // 添加分流节点
        },
      },
      {
        title: '过滤',
        props: {
          dispatch,
          paramSources,
          auths,
          entityList,
          currentRecomCfg,
          entityTags,
        },
        modalComponent: FilterModal,
        id: 'FilterModal',
        onOk: (values) => {
          this.updateNode(values);
        },
      },
      {
        title: '排序',
        modalComponent: SortModal,
        props: { dispatch, paramSources, currentRecomCfg },
        id: 'SortModal',
        onOk: (values) => {
          this.updateNode(values);
        },
      },

      {
        title: '去重',
        modalComponent: UniqModal,
        props: { dispatch, paramSources, currentRecomCfg },
        id: 'UniqModal',
        onOk: (values) => {
          this.updateNode(values);
        },
      },

      {
        title: '填充',
        modalComponent: FillModal,
        id: 'FillModal',
        props: { dispatch, algorithmList },
        onOk: (values) => {
          this.updateNode(values);
        },
      },

      {
        title: '优先推荐',
        modalComponent: PriorityRecoModal,
        id: 'PriorityRecoModal',
        props: { priorityRecmdList, ...coding, dispatch, currentRecomCfg, auths },
        onOk: (values) => {
          this.updateNode(values);
          this.loadRecomCfg();
        },
      },
      {
        title: '选择策略',
        modalComponent: StrategyModal,
        props: {
          templateList,
          width: '50%',
          height: '50%',
          paramSources,
          dispatch,
          currentRecomCfg,
        },
        id: 'StrategyModal',
        onOk: (values) => {
          this.updateNode(values);
        },
      },
    ]

    const header = (
      <div style={{ padding: '16px' }}>
        <Authorized authority={() => auths.includes('yxcj_gxhtj_bj_zx')}>
          <Button onClick={this.onCommit} type='primary' disabled={execDisabled}>立即执行</Button>
          <span>（* 所有节点内容全部设置完毕后，点击立即执行按钮才会生效）</span>
        </Authorized>
        {execDisabled &&
          <Button onClick={this.backword}>返回</Button>
        }
        {
          !execDisabled &&
          <Popconfirm title='未点击立即执行按钮，更改内容不会生效。确定离开页面吗？'
            onConfirm={this.backword}><Button>返回</Button></Popconfirm>
        }

      </div>
    )

    return (
      <PageHeaderLayout title="个性化推荐" breadcrumbList={[{ title: '首页', href: '/' }, { title: '个性化推荐', href: '/marketing/recommendation' }, { title: '个性化推荐详情页' }]}>
        <Card style={{ height: '100%' }}>
          <WorkFlowEditor
            {...parseData(nodes)}
            modals={modals}
            header={header}
            onDeleteNode={this.handleDeleteNode}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}

// 编辑推荐策略
AddRecStrategy.propTypes = {

};

// 编辑推荐策略
export default AddRecStrategy;