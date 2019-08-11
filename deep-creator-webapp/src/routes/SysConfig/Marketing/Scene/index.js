import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Form, Button, Divider, Tooltip, Popconfirm, Popover } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import HeaderTitle from '../../../../components/HeaderTitle';
import AddNodeModal from './AddNodeModal';

const Authorized = RenderAuthorized();
@connect((state) => {
  return {
    auto: state['marketing/automation'],
    user: state.user,
  }
})
class Scene extends Component {
  state = {
    showModal: false,
    data: null,
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'xtgl_yxpz_jdyx' },
    })
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchLifeNodes',
      payload: {},
    })
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchEntityTags',
      payload: {},
    })
  }


  handleMove = (record, type = 'up') => {
    const { lifeNodes, dispatch } = this.props;
    const index = _.findIndex(lifeNodes, record);
    // console.log(index, 'index.....', lifeNodes, record)
    if (index < 0) { return }
    switch (type) {
      case 'up': {
        const preItem = lifeNodes[index - 1];
        lifeNodes[index - 1] = record;
        lifeNodes[index] = preItem;
        break;
      }
      case 'down': {
        const nextItem = lifeNodes[index + 1];
        lifeNodes[index + 1] = record;
        lifeNodes[index] = nextItem;
        break;
      }
      default:
        break;
    }
    dispatch({
      type: 'sysconfig/marketing/updateState',
      payload: { lifeNodes: lifeNodes.slice(0) },
    });
    // sort
    let arr = [];
    lifeNodes && lifeNodes.length > 0 && lifeNodes.map((m, n) => {
      arr.push(m.bizLifeInfo.id);
    });
    dispatch({
      type: 'sysconfig/marketing/saveSortIndex',
      payload: { list: arr },
    });
  }

  handleToggleModal = () => {
    this.setState({
      data: null,
      showModal: !this.state.showModal,
    }, () => {
      this.init();
    });
  }

  edit(record) {
    this.setState({
      data: record,
      showModal: !this.state.showModal,
    });
  }

  del(record) {
    this.props.dispatch({
      type: 'sysconfig/marketing/delLifeNode',
      payload: { id: record.bizLifeInfo.id },
      callback: () => {
        this.init();
      },
    })
  }

  render() {
    const { lifeNodes, marketingOp, keyEvents, conditionList, outsideRelation, entityListNoTags, user: { auths } } = this.props;
    const { showModal } = this.state;
    const lastRecord = _.last(lifeNodes);
    const firstRecord = _.first(lifeNodes);

    const columns = [
      { title: '节点名称', key: '0', dataIndex: 'bizLifeInfo.nodeName' },
      // { title: '用户群', key: '1', dataIndex: 'bizLifeInfo.groupId' },
      {
        title: '关键时刻',
        key: '2',
        dataIndex: 'keyEvents',
        render: (text, record) => {
          if (record && record.bizLifeInfo && record.bizLifeInfo.conditonDesc) {
            const { conditionsDesc } = JSON.parse(record.bizLifeInfo.conditonDesc)
            const { onlineActionDesc } = conditionsDesc && conditionsDesc.length > 0 && conditionsDesc[0];
            let a = [];
            let b = [];
            conditionsDesc && conditionsDesc.length > 0 && conditionsDesc.map((item, i) => {
              let temp = (<div>
                {i > 0 ? <div>{item.relationDesc}</div> : null}
                <div>{`条件${i + 1}:`}</div>
                <div>
                  {
                    item.onlineActionDesc && item.onlineActionDesc.length > 0 && item.onlineActionDesc.map((k, j) => {
                      a.push(k.appkeyDesc);
                      return <div>{`客户端:${k.appkeyDesc} 行为组合时间: ${k.dateDesc} 事件:${k.eventDesc.actionname}${k.eventDesc.condition}${k.eventDesc.count}`}</div>
                    })
                  }
                </div>
              </div>);
              b.push(temp);
            })
            return (<Popover trigger="hover" placement="topLeft" content={b.map((m, n) => <div key={n}>{m}</div>)}>
              <div>{a.join(',') || '-'}</div>
            </Popover>)
          }
        },
      },
      {
        title: '营销动作',
        key: '3',
        dataIndex:
          'marketingOp',
        render: (text, record) => {
          let a = [];
          let b = [];
          record && record.bizAutoMarketingPOLists && record.bizAutoMarketingPOLists.length > 0 && record.bizAutoMarketingPOLists.map((m, n) => {
            a.push(m.maketingName);
          });
          record && record.bizFunnelVOList && record.bizFunnelVOList.length > 0 && record.bizFunnelVOList.map((k, j) => {
            b.push(k.funnelName);
          })
          return (<Popover placement="topLeft"
            content={
              <div>
                <div>决策树： {a.join(',')}</div>
                <div>漏斗： {b.join(',')}</div>
              </div>
            }>
            <div>{a.concat(b).join(',')}</div>
          </Popover>)
        },
      },
      {
        title: '操作',
        key: '4',
        render: (text, record, index) => {
          return (
            <div>
              {index > 0 && <a onClick={this.handleMove.bind(this, record, 'up')}>上移</a>}
              {index > 0 ? <Divider type='vertical' /> : null}
              {index === lifeNodes.length - 1 ? null : <a onClick={this.handleMove.bind(this, record, 'down')}>下移</a>}
              {index === lifeNodes.length - 1 ? null : <Divider type='vertical' />}
              <Authorized authority={() => auths.includes('xtgl_yxpz_jdyx_cj_bjgz')}><a onClick={() => this.edit(record)}>编辑</a><Divider type='vertical' /></Authorized>
              <Popconfirm title="确认删除吗?" onConfirm={() => this.del(record)} okText="确定" cancelText="取消">
                <a>删除</a>
              </Popconfirm>
            </div>
          )
        },
      },
    ]


    const modalProps = {
      keyEvents,
      marketingOp,
      conditionList,
      outsideRelation,
      visible: showModal,
      dispatch: this.props.dispatch,
      data: this.state.data,
      onCancel: () => this.handleToggleModal(),
      entityList: entityListNoTags,
      auths,
    }

    return (
      <div>
        <AddNodeModal {...modalProps} />
        <HeaderTitle>客户生命旅程相关</HeaderTitle>
        <Authorized authority={() => auths.includes('xtgl_yxpz_jdyx_cj')}>
          <Button style={{ margin: '10px 0' }}
            type='primary'
            onClick={this.handleToggleModal}>新增节点</Button>
        </Authorized>
        <Table
          columns={columns}
          dataSource={lifeNodes}
          rowKey={(record, index) => index}
        />
      </div>
    );
  }
}

Scene.propTypes = {

};

export default Scene;