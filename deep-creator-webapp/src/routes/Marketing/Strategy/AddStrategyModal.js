import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'dva/router';
import {
  Modal, Form, Steps,
  Radio, Input, Spin,
  Tabs, Button, notification,
} from 'antd';
import lodash from 'lodash';
import GroupList from '../../../components/GroupList';
import RecomListPane from './TabPane/RecomListPane';
import styles from './AddStrategyModal.less';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

const FormItem = Form.Item;
const { Step } = Steps;
const { TabPane } = Tabs;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Authorized = RenderAuthorized();

const formItemLayout = {
  labelCol: { sm: { span: 4 } },
  wrapperCol: { sm: { span: 20 } },
}

@Form.create({
  onValuesChange: (props, values) => {
    let { objectEntityId, contentEntityId } = values;
    let entityId = objectEntityId || contentEntityId;
    if (entityId) {
      entityId = parseInt(entityId, 10);
      const entity = props.entityList.find(e => e.id === entityId);
      if (!entity) return;
      let ids = entity.groups.map(g => g.id) || [];
      ids = ids.slice(0, 4).join(',');
      if (!ids) return;
      props.dispatch({
        type: 'marketing/strategy/fetchGroupNum',
        payload: { entityId, ids },
        callback: (err, groupNum = {}) => {
          entity.groups = entity.groups.map((g) => {
            const num = groupNum[g.id] || {};
            return { ...g, ...num }
          })
          props.dispatch({
            type: 'marketing/strategy/updateState',
            payload: { entityList: props.entityList.slice(0) },
          })
        },
      })
    }
  },
})
class AddStrategyModal extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_clyx_cj' },
    })
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'marketing/strategy/fetchEntityGroups',
      payload: {},
    });
    this.props.dispatch({
      type: 'marketing/strategy/fetchRuleList',
      payload: {},
    });
  }

  componentWillReceiveProps(nextProps) {
    const { strategy, visible, form: { getFieldDecorator, setFieldsValue } } = nextProps;
    getFieldDecorator('fromGroup');
    getFieldDecorator('toGroup');
    getFieldDecorator('toRuleId');
    getFieldDecorator('objectEntityId');
    getFieldDecorator('contentEntityId');
    if (visible && visible !== this.props.visible) { // 打开时选择第一个实体
      const { userEntityList, productEntityList } = this.filterEntity();
      let fromGroup;
      let toGroup;
      if (!strategy) {
        const firstObjectEntity = lodash.first(userEntityList) || {};
        const firstContentEntity = lodash.first(productEntityList) || {};
        fromGroup = firstObjectEntity.groups[0];
        toGroup = firstContentEntity.groups[0];
        setFieldsValue({
          objectEntityId: firstObjectEntity.id,
          contentEntityId: firstContentEntity.id,
          fromGroup,
          toGroup,
        });
      } else { // 编辑时根据策略对象回填
        const formGroupEntity = this.findGroupEntity(userEntityList, strategy.fromGroupId);
        fromGroup = formGroupEntity.group;
        const objectEntityId = formGroupEntity.entity.id;
        let toGroupEntity = {};
        if (strategy.toGroupId) {
          toGroupEntity = this.findGroupEntity(productEntityList, strategy.toGroupId);
        }
        toGroup = toGroupEntity.group;
        const contentEntityId = toGroupEntity.entity ? toGroupEntity.entity.id : undefined;

        setFieldsValue({ // 初始化表单
          fromGroup,
          objectEntityId,
          contentEntityId,
          toGroup,
          toRuleId: strategy.toRuleId,
        })
      }
    }
  }

  filterEntity = () => {
    let userEntityList = [];
    let productEntityList = [];
    this.props.entityList.forEach((entity) => {
      if (entity.isRecommendObject === 1) {
        userEntityList.push(entity); // 推荐对象
      }
      if (entity.isRecommendContent === 1) {
        productEntityList.push(entity); // 推荐内容
      }
    });
    return { userEntityList, productEntityList }
  }

  // 根据groupID反查此group的实体
  findGroupEntity = (entityList = [], groupId) => {
    let entity;
    let group;
    if (!groupId || !entityList.length) return { entity, group }
    entityList.forEach((_entity) => {
      const _group = _entity.groups.find(item => item.id === groupId);
      if (_group) { entity = _entity; group = _group }
    })
    return { entity, group }
  }

  handleResetForm = () => {
    this.setState({ current: 0, ruleRadio: 0, cached: {} });
    this.props.form.resetFields();
  }

  state = {
    current: 0,
    cached: {},
  }

  next() {
    const { getFieldsValue } = this.props.form;
    const current = this.state.current + 1;
    const { fromGroup, toGroup, toRuleId, ruleRadio, column } = getFieldsValue();

    switch (current) {
      case 1: {
        const cached = { ...this.state.cached, fromGroup };
        if (!fromGroup || !fromGroup.id) { notification.error({ message: '必须选择一个推荐对象组' }); return }
        this.setState({ cached })
        break;
      }
      case 2: {
        const param = {
          toRuleId: ruleRadio === 0 ? toRuleId : null,
          toGroup: ruleRadio === 1 ? toGroup : null,
        }
        if (!toRuleId && !toGroup) { notification.error({ message: '必须选择一个推荐内容组或者推荐策略' }); return }
        const cached = { ...this.state.cached, ...param };
        this.setState({ cached })
        break;
      }
      case 3: {
        const { firstColumns, secondColumns } = column;
        if (!firstColumns.length && !secondColumns) {
          return notification.warning({ message: '推荐的列不存在，请尝试其他推荐配置' });
        }
        const cached = { ...this.state.cached, column };
        this.setState({ cached })
        break;
      }
      default:
        break;
    }
    this.setState({ current });
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      const { strategy } = this.props;
      if (!err) {
        const { cached: { fromGroup, toGroup, toRuleId, column } } = this.state;
        values.fromGroupId = fromGroup.id;
        // toGroupId和toRuleID为互斥条件,当toRuleId存在时,toGroupId置0，当toGroupId存在时,toRuleId置空
        if (toGroup) {
          values.toGroupId = toGroup.id;
        } else {
          values.toGroupId = 0;
        }
        values.toGroupName = fromGroup.groupName; // 奇怪的接口
        values.toGroupId = toGroup ? toGroup.id : 0;
        values.toRuleId = toRuleId || '';
        values.firstColumns = column && column.firstColumns ? column.firstColumns.join(',') : [];
        values.secondColumns = column && column.secondColumns ? column.secondColumns : '';
        strategy ?
          this.props.dispatch({
            type: 'marketing/strategy/update',
            payload: values,
            callback: (_err) => {
              if (_err) return;
              this.props.onOk();
              this.handleResetForm();
            },
          }) :
          this.props.dispatch({
            type: 'marketing/strategy/add',
            payload: values,
            callback: (_err) => {
              if (_err) return;
              this.props.onOk();
              this.handleResetForm();
            },
          })
      }
    })
  }

  handleCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
      this.handleResetForm();
    }
  }

  fetchGroupNum = (entityId, groups) => {
    const entity = this.props.entityList.find(e => e.id === entityId);
    if (!entity || !groups) return;
    const ids = groups.map(g => g.id).join(',');
    this.props.dispatch({
      type: 'marketing/strategy/fetchGroupNum',
      payload: { entityId, ids },
      callback: (err, groupNum = {}) => {
        entity.groups = entity.groups.map((g) => {
          const num = groupNum[g.id] || {};
          return { ...g, ...num }
        })
        this.props.dispatch({
          type: 'marketing/strategy/updateState',
          payload: { entityList: this.props.entityList.slice(0) },
        })
      },
    })
  }

  render() {
    let {
      form, strategy, ruleList, groupColumns,
      recomList, dispatch, loading, auths } = this.props;
    const { userEntityList = [], productEntityList = [] } = this.filterEntity();

    strategy = strategy || {};
    const { getFieldDecorator, getFieldsValue } = form;
    const { current, cached: { fromGroup, toGroup, toRuleId } } = this.state;
    let { ruleRadio } = getFieldsValue();
    const loadingFromGroup = loading.effects['marketing/strategy/fetchEntityGroups'];

    const steps = [
      {
        title: '选择推荐对象',
        content: (<div>
          {userEntityList.length === 0 && <div>无可用的推荐对象</div>}
          {userEntityList.length > 0 &&
            <div>
              <h4>选择用户群：</h4>
              {getFieldDecorator('objectEntityId')(
                <Tabs type="card"
                // tabBarExtraContent={
                //  <Authorized authority={() => auths.includes('yxcj_clyx_cj_mb_cjqz')}>
                //    <Button><Link to={`/groups/${objectEntityId}`}>
                //      {'新增推荐对象群'}</Link>
                //    </Button>
                //  </Authorized>
                // }
                >
                  {
                    loadingFromGroup && <TabPane key='loading' tab=' '><Spin /></TabPane>
                  }
                  {
                    !loadingFromGroup && userEntityList.map((entity) => {
                      return (
                        <TabPane tab={entity.entityName} key={entity.id}>
                          <FormItem>
                            {
                              getFieldDecorator('fromGroup', {
                              })(
                                <GroupList
                                  pageChange={(data) => {
                                    this.fetchGroupNum(entity.id, data);
                                  }}
                                  groupData={entity.groups} />)
                            }
                          </FormItem>
                        </TabPane>)
                    })
                  }
                </Tabs>)}
            </div>}
        </div>),
      },
      {
        title: '选择推荐内容',
        content: (
          <FormItem {...formItemLayout}>{
            getFieldDecorator('ruleRadio', {
              initialValue: strategy.toGroupId ? 1 : 0,
            })(
              <RadioGroup
              >
                <Authorized authority={() => auths.includes('yxcj_clyx_cj_tjyqgz')}>
                  <Radio value={0}>推荐引擎规则
                    <span className={styles.notice}>
                      例如：给“高价值客户群”推荐每个客户可能喜欢的产品（内置适当性条件过滤）
                    </span>
                  </Radio>
                  {
                    ruleRadio === 0 && !!ruleList.length &&
                    <FormItem {...formItemLayout} label=' ' colon={false}>
                      {
                        getFieldDecorator('toRuleId', {
                          initialValue: strategy.toRuleId || ruleList[0].fieldId,
                        })(
                          <RadioGroup>
                            {
                              ruleList.map(rule => <Radio key={rule.fieldId} value={rule.fieldId}>{rule.ruleName}</Radio>)
                            }
                          </RadioGroup>
                        )
                      }
                    </FormItem>

                  }
                </Authorized>
                <Radio value={1}>手动匹配规则

                    <span className={styles.notice}>
                    例如：给“近一个月注册客户群”推荐“高收益中低风险基金”
                    </span>
                </Radio>
                {ruleRadio === 1 && productEntityList.length === 0 && <div>无可用的推荐内容</div>}
                {ruleRadio === 1 && productEntityList.length > 0 &&
                  <div>
                    <h4>选择产品群：</h4>
                    {
                      getFieldDecorator('contentEntityId', {
                      })(
                        <Tabs type='card'
                        // tabBarExtraContent={
                        //  <Authorized authority={() => auths.includes('')}>
                        //    <Button><Link to={`/groups/${contentEntityId}`}>
                        //      {'新增推荐内容群'}</Link>
                        //    </Button>
                        //  </Authorized>
                        // }
                        >
                          {
                            productEntityList.map((entity) => {
                              return (
                                <TabPane tab={entity.entityName}
                                  key={entity.id}
                                >
                                  {
                                    <FormItem>
                                      {
                                        getFieldDecorator('toGroup', {
                                        })(
                                          <GroupList
                                            pageChange={(data) => {
                                              this.fetchGroupNum(entity.id, data);
                                            }}
                                            groupData={entity.groups} />)
                                      }
                                    </FormItem>
                                  }
                                </TabPane>)
                            })
                          }
                        </Tabs>)
                    }
                  </div>
                }
              </RadioGroup>)
          }
          </FormItem>
        ),
      },
      {
        title: '生成推荐名单',
        content:
          (<FormItem >
            {
              getFieldDecorator('column', {
                initialValue: {
                  firstColumns: strategy && strategy.firstColumns ? strategy.firstColumns.split(',') : [],
                  secondColumns: strategy && strategy.secondColumns ? strategy.secondColumns : '',
                },
              })(
                <RecomListPane
                  strategy={strategy}
                  dispatch={dispatch}
                  groupColumns={groupColumns}
                  recomList={recomList}
                  fromGroup={fromGroup}
                  toGroup={toGroup}
                  toRuleId={toRuleId}
                  loading={loading}
                />
              )
            }
          </FormItem>),
      },
      {
        title: '完善推荐信息',
        content: (
          <div>
            <FormItem label="策略名称"
              labelCol={{ sm: { span: 3 } }}
              wrapperCol={{ sm: { span: 15 } }}
            >
              {
                getFieldDecorator('maketingName', {
                  initialValue: strategy.maketingName,
                  rules: [
                    { required: true, message: '必填字段' },
                    { max: 30, message: '最长应为30个字符' }],
                })(<Input />)
              }

            </FormItem>
            <FormItem label="策略描述"
              labelCol={{ sm: { span: 3 } }}
              wrapperCol={{ sm: { span: 15 } }}
            >
              {
                getFieldDecorator('maketingDesc', {
                  initialValue: strategy.maketingDesc,
                  rules: [
                    { max: 100, message: '最长应为100个字符' },
                  ],
                })(<TextArea rows={5} />)
              }
            </FormItem>
            <FormItem>{getFieldDecorator('id', {
              initialValue: strategy.id,
            })(<Input type='hidden' />)}</FormItem>
          </div>),
      },
    ];

    return (
      <Modal
        maskClosable={false}
        footer={null}
        {...this.props}
        onCancel={this.handleCancel}>
        <Form onSubmit={this.handleSubmit}>
          <Steps progressDot current={current}>
            {
              steps.map(step => <Step key={step.title} title={step.title} />)
            }
          </Steps>
          <div className={styles.stepContent}>
            {
              steps[current].content
            }
          </div>
          <div className={styles.action}>
            {
              this.state.current < steps.length - 1
              &&
              <Button type="primary" onClick={() => this.next()}>下一步</Button>
            }
            {
              this.state.current === steps.length - 1
              &&
              <Button type="primary"
                htmlType='submit'>完成</Button>
            }
            {
              this.state.current > 0
              &&
              <Button style={{ marginLeft: 8 }}
                onClick={() => this.prev()}>
                上一步
            </Button>
            }
          </div>
        </Form>
      </Modal>
    );
  }
}

AddStrategyModal.propTypes = {

};

export default AddStrategyModal;