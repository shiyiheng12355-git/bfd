import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Modal, Input,
  Row, Col, Radio, DatePicker, notification,
} from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import uuid from 'uuid';
import lodash from 'lodash';

import { parseNodes } from './helper';

import { WorkFlowEditor, ButtonDragSource }
  from '../../../components/WorkFlowEditor';
import SelectGroupModal from './AutomationModal/SelectGroupModal';
import SelectTagModal from './AutomationModal/SelectTagModal';
import OnlineBehaviorModal from './AutomationModal/OnlineBehaviorModal';
import SendSmsModal from './AutomationModal/SendSmsModal';
import SendEmailModal from './AutomationModal/SendEmailModal';
// 添加微信推送
import SendWeiXinModal from './AutomationModal/SendWeiXinModal';
// 添加微信推送
import SendAppMessageModal from './AutomationModal/SendAppMessageModal';
import ConcurrentActionModal from './AutomationModal/ConcurrentActionModal';
import AutomationTagModal from './AutomationModal/AutomationTagModal';
import { LIMITLESS_TIMESTAMP, ANOTHER_LIMITLESS } from '../../../utils/utils';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

const DateFormat = 'YYYY-MM-DD HH:mm:ss';
import img1 from '../../../assets/imgs/diamond_70px.png';
import img2 from '../../../assets/imgs/button.png';

const Authorized = RenderAuthorized();

import styles from './AddAutomationModal.less';

const FormItem = Form.Item;
const TextArea = Input;
const RadioGroup = Radio.Group;

const modalProps = {
  width: '80%',
  height: '80%',
  // onCancel: () => this.setState({ showModal: null }),
};

class SiderBar extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_zdhyx_cj_lckz' },
    })
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_zdhyx_cj_yxtj' },
    })
  }

  render() {
    const { auths } = this.props;
    return (
      <div className={styles.siderBar}>
        <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_lckz')}>
          <Row><h3 className={styles.title}>流程控制</h3></Row>
          <Row>
            <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_lckz_bq')}>
              <Col span={24}>
                <ButtonDragSource
                  className={styles.rhombusBtn}
                  modal='SelectTagModal'
                  previewImg={img1}
                >标签</ButtonDragSource>
              </Col>
            </Authorized>
            <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_lckz_xxxw')}>
              <Col span={24}>
                <ButtonDragSource
                  className={styles.rhombusBtn}
                  modal='OnlineBehaviorModal'
                  previewImg={img1}
                >线上行为</ButtonDragSource>
              </Col>
            </Authorized>
          </Row>
        </Authorized>
        <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_yxtj')}>
          <Row>
            <h3 className={styles.title}>营销套件</h3>
          </Row>
          <Row>
            <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_yxtj_dx')}>
              <Col span={24}>
                <ButtonDragSource
                  className={styles.circleBtn}
                  modal='SendSmsModal'
                  previewImg={img2}
                >发送短信</ButtonDragSource>
              </Col>
            </Authorized>
            <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_yxtj_yyxx')}>
              <Col span={24}>
                <ButtonDragSource
                  className={styles.circleBtn}
                  modal='SendAppMessageModal'
                  previewImg={img2}
                >应用消息</ButtonDragSource>
              </Col>
            </Authorized>
            <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_yxtj_yj')}>
              <Col span={24}>
                <ButtonDragSource
                  className={styles.circleBtn}
                  modal='SendEmailModal'
                  previewImg={img2}
                >Email</ButtonDragSource>
              </Col>
            </Authorized>
            {/* 用于样式添加微信推送 权限并没有增加 */}
            <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_yxtj_yj')}>
              <Col span={24}>
                <ButtonDragSource
                  className={styles.circleBtn}
                  modal='SendWeiXinModal'
                  previewImg={img2}
                >微信推送</ButtonDragSource>
              </Col>
            </Authorized>
            {/* 用于样式添加微信推送 权限并没有增加===end */}
            <Col span={24}>
              <ButtonDragSource
                className={styles.circleBtn}
                modal='ConcurrentActionModal'
                previewImg={img2}
              >并发动作</ButtonDragSource>
            </Col>
            <Authorized authority={() => auths.includes('yxcj_zdhyx_cj_yxtj_zdbq')}>
              <Col span={24}>
                <ButtonDragSource
                  className={styles.circleBtn}
                  modal='AutomationTagModal'
                  previewImg={img2}
                >自动标签</ButtonDragSource>
              </Col>
            </Authorized>
          </Row>
        </Authorized>
      </div>)
  }
}

class AddAutomationModal extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_zdhyx_cj' },
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.dispatch({
        type: 'marketing/automation/fetchNodeLimit',
        payload: {}, // 查询决策树节点上限
      })
      const { editAutomation } = nextProps;
      if (editAutomation) {
        const json = JSON.parse(editAutomation.conditionJson);
        const nodes = json.node_list || [];
        this.props.dispatch({
          type: 'marketing/automation/updateState',
          payload: { nodes },
        })
      } else { // 新建
        const groupNode = {
          type: 'GROUP',
          node_id: uuid.v1(),
          modal: 'SelectGroupModal',
          extra_info: {},
          branch_list: [{ condition: '', child_id: uuid.v1() }],
        }
        this.props.dispatch({
          type: 'marketing/automation/updateState',
          payload: { nodes: [groupNode] },
        })
      }
    }
  }

  // 更新某一个节点的value
  updateNode = (values) => {
    const { nodes } = this.props;

    const index = lodash.findIndex(nodes, node => node.node_id === values.node.node_id);
    if (index >= 0) {
      const _node = nodes[index];
      const node = {
        type: values.type,
        extra_info: values.extra_info,
        branch_list: values.branch_list,
        node_id: _node.node_id,
        modal: _node.modal,
      };
      nodes.splice(index, 1, node);
      this.props.dispatch({
        type: 'marketing/automation/updateState',
        payload: { nodes: nodes.slice(0) },
      })
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      // console.log(values, 'values...', values.startDate.format(DateFormat))
      if (err) { return; }
      const { editAutomation, nodes, isCopy, isLife, nodeLimit } = this.props;
      const { startRadio, endRadio } = values;
      if (startRadio === '0') {
        values.startDate = moment().valueOf(); // 立即开始
      } else {
        values.startDate = values.startDate.valueOf();
      }
      if (endRadio === '0') {
        values.endDate = LIMITLESS_TIMESTAMP; // 不限
      } else {
        values.endDate = values.endDate.valueOf();
      }
      values.isMonitor = 1; // 默认监听
      const groupNode = nodes.find(node => node.type === 'GROUP');
      if (!groupNode || !groupNode.extra_info) {
        notification.error({ message: '请选择一个群组' })
        return;
      }
      if (nodes.length > nodeLimit) return notification.error({ message: '创建的决策树节点数量已经超过上限' });
      values.groupId = groupNode.extra_info.groupId;
      if (!values.groupId) return notification.error({ message: '必须选择受众群组' });
      if (nodes.length === 1) return notification.error({ message: '需要配置流程控制或营销动作才能保存' })
      values.conditionJson = JSON.stringify({ tree_id: values.treeId, node_list: nodes });
      values.maketingAuthorityType = 0;
      if (isLife) {
        this.props.onOk(values);
        this.props.form.resetFields();
        return
      }
      // console.log('经过组织的node_list:', nodes)
      if (editAutomation) {
        if (isCopy) { // 复制
          delete values.id; // 删除ID
          this.props.dispatch({
            type: 'marketing/automation/copy',
            payload: values,
            callback: () => {
              this.props.dispatch({
                type: 'marketing/automation/fetch',
                payload: {},
              })
              this.props.onOk(values);
              this.props.form.resetFields();
            },
          })
        } else { // 编辑
          this.props.dispatch({
            type: 'marketing/automation/update',
            payload: values,
            callback: () => {
              this.props.dispatch({
                type: 'marketing/automation/fetch',
                payload: {},
              })
              this.props.onOk(values);
              this.props.form.resetFields();
            },
          })
        }
      } else {
        this.props.dispatch({
          type: 'marketing/automation/add',
          payload: values,
          callback: () => {
            this.props.dispatch({
              type: 'marketing/automation/fetch',
              payload: {},
            })
            this.props.onOk(values);
            this.props.form.resetFields();
          },
        });
      }
    })
  }

  handleCancel = () => {
    this.props.onCancel();
    this.props.form.resetFields();
  }

  insertNodes = (values) => {
    const { nodes } = this.props;
    const tid = values.edge ? values.edge.target : null;
    const tNode = nodes.find(_node => _node.node_id === tid);
    const node = values;
    node.node_id = tid;
    if (tNode) tNode.node_id = node.branch_list[0].child_id;
    nodes.push(node);
    this.props.dispatch({
      type: 'marketing/automation/updateState',
      payload: { nodes: nodes.slice(0) },
    })
  }

  insertMessageNodes = (values) => {
    if (values.node) { // 点击的是节点,则只更新数据
      this.updateNode(values);
      return // 更新
    }

    // 添加数据
    const tid = values.edge ? values.edge.target : null;
    let { nodes } = this.props;

    const messageNode = {
      node_id: tid,
      type: values.type,
      deletable: true,
      locked: true,
      interval: values.interval,
      extra_info: values.extra_info,
    };

    let arr = [messageNode];
    if (messageNode.type !== 'SMS') {
      const openNode = {
        node_id: uuid.v1(),
        type: 'OPEN',
        label: '打开',
        interval: values.interval,
        locked: true,
        extra_info: { action: 'open' },
      };
      messageNode.branch_list = [{ child_id: openNode.node_id, condition: '' }];
      const clickNode = {
        node_id: uuid.v1(),
        type: 'CLICK',
        label: '点击',
        interval: values.interval,
        locked: true,
        extra_info: { action: 'click' },
      };
      openNode.branch_list = [{
        condition: 'done',
        child_id: clickNode.node_id,
      }, {
        condition: 'default',
        child_id: uuid.v1(),
      }]
      const arrNode = {
        node_id: uuid.v1(),
        type: 'ARRIVE',
        interval: values.interval,
        label: '到达',
        extra_info: { action: 'arrive' },
      }
      clickNode.branch_list = [{
        condition: 'done',
        child_id: arrNode.node_id,
      }, {
        condition: 'default',
        child_id: uuid.v1(),
      }]
      arrNode.branch_list = [{
        condition: 'done',
        child_id: uuid.v1(),
      }, {
        condition: 'default',
        child_id: uuid.v1(),
      }]
      arr = arr.concat([openNode, clickNode, arrNode]);
    } else {
      messageNode.branch_list = [{ child_id: uuid.v1() }]
    }
    messageNode.bindDelete = arr.map((n) => { return n.node_id });
    nodes = nodes.concat(arr);
    this.props.dispatch({
      type: 'marketing/automation/updateState',
      payload: { nodes: nodes.slice(0) },
    })
  }

  // 过滤掉节点和子节点
  filterNodes = (node, nodes) => {
    if (!nodes || !nodes.length || !node) return [];
    let leftNodes = nodes.filter(_node => node.node_id !== _node.node_id); // 删除节点
    if (node.branch_list) {
      node.branch_list.forEach((branch) => {
        const childNode = leftNodes.find(_node => _node.node_id === branch.child_id); // 子节点
        if (childNode) leftNodes = this.filterNodes(childNode, leftNodes); // 递归删除子节点
      })
    }
    return leftNodes || [];
  }

  handleDeleteNode = (node, nodes) => {
    this.props.dispatch({
      type: 'marketing/automation/updateState',
      payload: { nodes: this.filterNodes(node, nodes) },
    })
  }

  disableStartDate = (current) => {
    if (!current) return false;
    const { endDate } = this.props.form.getFieldsValue();
    return current && (current.format(DateFormat) < moment().format(DateFormat)
      || (endDate && current.format(DateFormat) > endDate.format(DateFormat)))
  }

  disableEndDate = (current) => {
    if (!current) return false;
    const { startDate } = this.props.form.getFieldsValue();
    return current && (current.format(DateFormat) < moment().format(DateFormat)
      || (startDate && current.format(DateFormat) < startDate.format(DateFormat)))
  }

  render() {
    let { userEntityList = [], dispatch, appKeys, events,
      eventParams, smsGroups, emailGroups, autoTagList, auths,
      recentMessageList,
      loading, editAutomation = {}, nodes, isCopy } = this.props;
    editAutomation = editAutomation || {};
    const { getFieldDecorator, getFieldsValue } = this.props.form;

    getFieldDecorator('treeId', { initialValue: editAutomation.treeId || uuid.v1() })
    getFieldDecorator('id', { initialValue: editAutomation.id })
    const { startRadio, endRadio } = getFieldsValue(['startRadio', 'endRadio']);
    const groupNode = nodes.find(node => node.type === 'GROUP');
    const isEdit = !isCopy && editAutomation.id;

    const modals = [{
      title: '条件选择',
      modalComponent: SelectGroupModal,
      id: 'SelectGroupModal',
      props: { userEntityList, ...modalProps, dispatch, loading },
      onOk: (values) => {
        this.props.dispatch({
          type: 'marketing/automation/updateState',
          payload: { nodes: [values] },
        })
      },
    },
    {
      title: '标签条件选择',
      modalComponent: SelectTagModal,
      id: 'SelectTagModal',
      props: { ...modalProps, dispatch, groupNode },
      onOk: (values) => {
        this.insertNodes(values);
      },
    },
    {
      title: '线上行为条件选择',
      modalComponent: OnlineBehaviorModal,
      id: 'OnlineBehaviorModal',
      props: { appKeys, dispatch, events, eventParams, nodes },
      onOk: (values) => {
        this.insertNodes(values)
      },
    },
    {
      title: '短信选择',
      modalComponent: SendSmsModal,
      id: 'SendSmsModal',
      props: { dispatch, smsGroups, recentMessageList },
      onOk: (values) => {
        this.insertMessageNodes(values);
      },
    },
    {
      title: '应用消息',
      modalComponent: SendAppMessageModal,
      id: 'SendAppMessageModal',
      props: { dispatch, recentMessageList },
      onOk: (values) => {
        this.insertMessageNodes(values);
      },
    },
    {
      title: 'Email选择',
      modalComponent: SendEmailModal,
      props: { dispatch, emailGroups, recentMessageList },
      id: 'SendEmailModal',
      onOk: (values) => {
        this.insertMessageNodes(values);
      },
    },
    {
      title: '微信推送选择',
      modalComponent: SendWeiXinModal,
      props: { dispatch, emailGroups, recentMessageList },
      id: 'SendWeiXinModal',
      onOk: (values) => {
        this.insertMessageNodes(values);
      },
    }, {
      title: '并发动作',
      modalComponent: ConcurrentActionModal,
      props: {},
      id: 'ConcurrentActionModal',
      onOk: (values) => {
        this.insertNodes(values);
      },
    }, {
      title: '自动标签',
      modalComponent: AutomationTagModal,
      props: { autoTagList, dispatch, groupNode },
      id: 'AutomationTagModal',
      onOk: (values) => {
        this.insertNodes(values);
      },
    }]

    const editorProps = {
      sider: <SiderBar auths={auths} dispatch={dispatch} />,
      ...parseNodes(this.props.nodes),
      modals,
      onDeleteNode: (node) => {
        Modal.confirm({
          title: '确认是否删除此节点，删除此节点也会删除该节点下的子节点',
          onOk: this.handleDeleteNode.bind(this, node, this.props.nodes),
        })
      },
    };

    return (
      <Modal
        title="新增自动化营销"
        width="80%"
        height="80%"
        visible
        {...this.props}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <FormItem
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 10 }}
          label="自动化营销名称"
        >{
            getFieldDecorator('maketingName', {
              initialValue: editAutomation.maketingName,
              rules: [{ required: true, message: '必填字段' }, { max: 30, message: '自动化营销名称不能超过30个字符' }],
            })(<Input />)
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 10 }}
          label="描述"
        >
          {
            getFieldDecorator('maketingDesc', {
              initialValue: editAutomation.maketingDesc,
              rules: [{ max: 100, message: '描述不能超过100个字符' }, { required: true, message: '必填字段' }],
            })(<TextArea rows={5} />)
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label="开始时间"
        >
          <Col span={8}>
            <FormItem>
              {
                getFieldDecorator('startRadio', {
                  initialValue: '1',
                })(
                  <RadioGroup disabled={isEdit}
                  ><Radio value='0'>立即开始</Radio>
                    <Radio value='1'>自定义</Radio>
                  </RadioGroup>
                )
              }
            </FormItem>
          </Col>
          {
            startRadio === '1' &&
            <Col span={8}>
              <FormItem>
                {
                  getFieldDecorator('startDate', {
                    initialValue: moment(editAutomation.startDate),
                    rules: [{ required: true, message: '必填字段' }],
                  })(
                    <DatePicker
                      disabled={isEdit}
                      showTime={false}
                      placeholder="自定义开始时间"
                      disabledDate={this.disableStartDate}
                      format="YYYY-MM-DD"
                    // showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    />
                  )
                }
              </FormItem>
            </Col>
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label="结束时间"
        ><Col span={8}>
            <FormItem>
              {
                getFieldDecorator('endRadio', {
                  initialValue: [LIMITLESS_TIMESTAMP, ANOTHER_LIMITLESS].includes(editAutomation.endDate) ? '0' : '1',
                })(
                  <RadioGroup disabled={isEdit}>
                    <Radio value='0'>不限</Radio>
                    <Radio value='1'>自定义</Radio>
                  </RadioGroup>
                )
              }
            </FormItem>
          </Col>
          {
            endRadio === '1' &&
            <Col span={8}>
              <FormItem>
                {
                  getFieldDecorator('endDate', {
                    initialValue: editAutomation.endDate ? moment(editAutomation.endDate) : undefined,
                    rules: [{ required: true, message: '必填字段' }],
                  })(
                    <DatePicker disabled={isEdit}
                      showTime={false}
                      placeholder="自定义结束时间"
                      disabledDate={this.disableEndDate}
                      format="YYYY-MM-DD"
                    />
                  )
                }
              </FormItem>
            </Col>
          }
        </FormItem>
        {
          !isEdit &&
          <div className={styles.container}>
            <WorkFlowEditor {...editorProps} />
          </div>
        }

      </Modal>
    );
  }
}

export default connect((state) => {
  return {
    ...state['marketing/automation'],
    conditionList: state.tagPicker.conditionList,
    loading: state.LOADING,
  };
})(Form.create()(AddAutomationModal));

