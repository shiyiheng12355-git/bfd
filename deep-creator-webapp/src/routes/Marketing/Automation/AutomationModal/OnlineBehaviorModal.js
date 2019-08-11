import React, { Component, PropTypes } from 'react';
import { Form, Input, Select, Col, Modal, InputNumber, Button } from 'antd';
import { findActionAncestorNode } from '../helper';
import moment from 'moment';
import uuid from 'uuid';
import lodash from 'lodash';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;
import { DURATION, numberValidatorMsg } from '../../../../utils/utils';
import styles from './OnlineBehaviorModal.less';

const COMPARE = [{ name: '大于等于', value: '>=' }];

const PARAM_COMPARE = [
  { value: 'eq', name: '等于' },
  { value: 'neq', name: '不等于' },
  { value: 'in', name: '包含' },
  { value: 'nin', name: '不包含' },
  { value: 'be', name: '开头是' },
  { value: 'nbe', name: '开头不是' },
  { value: 'en', name: '结尾是' },
  { value: 'nen', name: '结尾不是' },
]

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const subLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 17 },
  },
};

@Form.create({
  onValuesChange: (props, values) => {
    const { params } = values;
    const extraInfo = values.extra_info || {};
    const { appkey, action } = extraInfo;

    if (appkey) {
      props.dispatch({
        type: 'marketing/automation/fetchAppEvents',
        payload: { appKey: appkey },
      })
    }
    if (action) {
      props.dispatch({
        type: 'marketing/automation/fetchEventParams',
        payload: { eventId: action },
      })
      props.dispatch({
        type: 'marketing/automation/updateState',
        payload: { actionName: action },
      })
    }
    if (params) {
      const { eventParams = [], actionName } = props;
      const param = Object.values(params)[0];

      const eventParam = eventParams.find(e => e.fieldName === param.param_name);
      if (eventParam) {
        props.dispatch({
          type: 'marketing/automation/fetchEventParamValue', // 获取线上参数值
          payload: { columnName: param.param_name, actionName, appkey: eventParam.appKey },
        })
      }
    }
  },
})
class OnlineBehaviorModal extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'marketing/automation/fetctAppKeys',
      payload: {},
    })
  }


  onSelectGroup = (group) => {
    if (this.props.onChange) this.props.onChange(group);
  }

  handleOk = () => {
    const { events = [] } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const node = { type: 'BEHAVE', deletable: true };
        if (!values.params) { values.params = [] } // 行为参数可以为空
        node.branch_list = [{
          relation: '&',
          condition: Object.values(values.params),
          child_id: uuid.v1(),
        }]
        if (values.intervalNum) { // 间隔时间可以为空
          const interval = moment.duration(
            parseInt(values.intervalNum, 10), values.duration).asSeconds();
          node.interval = interval.toString();
        } else {
          node.interval = '';
        }
        node.branch_list.push({ condition: 'default', child_id: uuid.v1() }) // 添加默认节点
        const { action } = values.extra_info;
        const eventAction = events.find(item => item.id === action);
        values.extra_info.action = eventAction.action_name;
        values.extra_info.action_name_cn = eventAction.action_name_cn;
        node.extra_info = values.extra_info;
        if (this.props.onOk) {
          this.props.onOk(node);
          this.props.form.resetFields();
        }
      }
    })
  }

  handleCancel = () => {
    this.props.onCancel();
    this.props.form.resetFields();
  }

  onChangeTag = (tag) => {
    if (this.props.onChange) this.props.onChange(tag);
  }

  addParamRow = () => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const { keys } = getFieldsValue();
    keys.push(uuid.v1());
    setFieldsValue({ keys })
  };

  deleteParamRow = (key) => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const { keys } = getFieldsValue();
    setFieldsValue({ keys: keys.filter(k => k !== key) });
  }

  toggleChangeRelation = (val) => {
    this.props.form.setFieldsValue({ relation: val })
  }

  errorMsg = () => {
    const { intervalNum, duration } = this.props.form.getFieldsValue();
    if (!intervalNum && !duration) return; // 还没有初始化
    let errMsg = intervalNum ? '' : '转换时间必填';
    if (intervalNum && !lodash.isNumber(intervalNum)) errMsg += '时间应该为自然数';
    const interval = moment.duration(parseInt(intervalNum, 10), duration).asSeconds();
    if (interval > 7 * 24 * 3600 || interval < 60) errMsg += '转换周期应该在1分钟以上，７天以内';
    return errMsg;
  }

  render() {
    let { form: { getFieldDecorator, getFieldsValue }, eventParams, edge, nodes } = this.props;
    if (edge) { // 该节点通往根节点的路径上已经有行为节点。
      const ancestorActionNode = findActionAncestorNode(edge.source, nodes);
      this.hasBehaviorNode = !!ancestorActionNode;
    }

    eventParams = eventParams || [];
    let { appKeys, events } = this.props;
    appKeys = appKeys || [];
    getFieldDecorator('keys', { initialValue: [] });
    getFieldDecorator('relation', { initialValue: '&' }) // & or |
    const { keys, relation } = getFieldsValue();

    const paramItems = keys.map((key) => {
      const isLast = lodash.last(keys) === key;

      return (
        <FormItem {...subLayout}
          key={key}
          label='参数'
          colon={false}>
          <Col span={8}>
            <FormItem>{
              getFieldDecorator(`params.${key}.param_name`, {
                rules: [{ required: true, message: '必填字段' }],
              })(
                <Select placeholder="请选择"
                  disabled={!eventParams.length}
                  dropdownClassName={styles.dropDown}>
                  {
                    eventParams.map((param) => {
                      return (
                        <Option value={param.fieldName} key={uuid.v1()}>
                          {param.paramBizDesc}
                        </Option>)
                    })
                  }
                </Select>)
            }
            </FormItem>
          </Col>

          <Col span={5}>
            <FormItem>
              {
                getFieldDecorator(`params.${key}.param_condition`, {
                  rules: [{ required: true, message: '必填字段' }],
                })(
                  <Select placeholder="请选择" disabled={!eventParams.length}>
                    {
                      PARAM_COMPARE.map((cmp) => {
                        return (
                          <Option
                            key={uuid.v1()}
                            value={cmp.value}
                          >{cmp.name}
                          </Option>);
                      })
                    }
                  </Select>)
              }
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem>{
              getFieldDecorator(`params.${key}.param_value`, {
                rules: [{ required: true, message: '必填字段' }],
              })(
                <Input disabled={!eventParams.length} />)
            }
            </FormItem>
          </Col>
          <Col span={2}>
            <span onClick={this.deleteParamRow.bind(this, key)}>删除</span>
          </Col>
          <Col span={1}>
            {relation === '&' && isLast &&
              <Button onClick={this.toggleChangeRelation.bind(this, '|')}>全部满足</Button>}
            {relation === '|' && isLast &&
              <Button onClick={this.toggleChangeRelation.bind(this, '&')}>部分满足</Button>}
          </Col>
        </FormItem>);
    })

    const errMsg = this.errorMsg();

    return (
      <Modal
        width='50%'
        height='60%'
        {...this.props}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        maskClosable={false}
      >
        <Form>
          {
            this.hasBehaviorNode &&
            <FormItem
              {...formItemLayout}
              validateStatus={errMsg ? 'error' : null}
              extra={<span style={{ color: '#f5222d' }}>{errMsg}</span>}
              label="与上一节点间隔时间"
            >
              {getFieldDecorator('intervalNum', {
                initialValue: 1,
              })(
                <InputNumber min={1} step={1} />
              )}
              {
                getFieldDecorator('duration', {
                  initialValue: 'minutes',
                })(
                  <Select style={{ width: '80px' }}>
                    {
                      DURATION.map((time, index) => {
                        return (
                          <Option
                            key={`{time_${index}`}
                            value={time.value}
                          >{time.name}
                          </Option>);
                      })
                    }
                  </Select>
                )}
              <div className={styles.tailLabel}>
                之内
                </div>
            </FormItem>
          }
          <FormItem
            label="客户端"
            {...formItemLayout}
            wrapperCol={{ sm: { span: 6 } }}
          > {
              getFieldDecorator('extra_info.appkey', {
                rules: [{ required: true, message: '必填字段' }],
              })(<Select placeholder="请选择">
                {
                  appKeys.map((appKey) => {
                    return (
                      <Option
                        key={appKey.appkey}
                        value={appKey.appkey}
                      >{appKey.appkeyName}
                      </Option>);
                  })
                }
              </Select>)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="行为组合"
          >
            <FormItem label='事件' colon={false} labelCol={{ sm: { span: 2 } }}>
              <Col span={10}>
                <FormItem>
                  {
                    getFieldDecorator('extra_info.action', {
                      rules: [{ required: true, message: '必填字段' }],
                    })(
                      // dropdownStyle={{ height: '120px', overflow: 'auto' }}
                      <Select placeholder="请选择" disabled={!events.length}>
                        {
                          events.map((event) => {
                            return (
                              <Option
                                key={uuid.v1()}
                                value={event.id}
                              >{event.action_name_cn}
                              </Option>);
                          })
                        }
                      </Select>)
                  }
                </FormItem>
              </Col>
              {
                <Col span={5}>
                  <FormItem>
                    {
                      getFieldDecorator('eventCondation', {
                        initialValue: '>=',
                        rules: [{ required: true, message: '必填字段' }],
                      })(
                        <Select placeholder="请选择" disabled={!events.length}>
                          {
                            COMPARE.map((cmp) => {
                              return (
                                <Option
                                  key={uuid.v1()}
                                  value={cmp.value}
                                >{cmp.name}
                                </Option>);
                            })
                          }
                        </Select>)
                    }
                  </FormItem>
                </Col>
              }
              <Col span={5}>
                <FormItem>
                  {
                    getFieldDecorator('extra_info.times', {
                      rules: [{
                        validator: (rule, value, callback) => {
                          const msg = numberValidatorMsg(value, 0, null, true);
                          return msg ? callback(msg) : callback();
                        },
                      }],
                    })(<InputNumber disabled={!events.length} min={0} step={1} />)
                  }
                </FormItem>
              </Col>
              <Col span={1}>
                次
            </Col>
            </FormItem>
          </FormItem>
          {paramItems}
          <FormItem {...subLayout} label=''>
            <a onClick={this.addParamRow}>添加参数条件</a>
          </FormItem>
        </Form>
      </Modal>);
  }
}

OnlineBehaviorModal.propTypes = {
};

export default OnlineBehaviorModal;
