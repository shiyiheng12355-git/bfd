import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import {
  Modal, Form, Input, Button, Icon, Select, Checkbox, Col, Row,
} from 'antd';
import uuid from 'uuid';

const FormItem = Form.Item;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const { TextArea } = Input;

const TYPES = ['char', 'int', 'double', 'boolean', 'json'];

@Form.create()
class BehaviorParamModal extends PureComponent {
  state = { checked: [], selected: {} }

  handleCheckAll = (e) => {
    // e.preventDefault();
    const { behaviorParams = [], form: { setFieldsValue } } = this.props;
    const keys = e.target.checked ? behaviorParams.map(item => item.dictionaryCode) : [];
    setFieldsValue({ checked: keys });
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { checked } = values;
        this.props.onOk(lodash.pick(values, checked));
        this.props.form.resetFields();
      }
    })
  }

  render() {
    const { behaviorParams = [], form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { checked = [] } = getFieldsValue();
    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 20 } }

    return (
      <Modal {...this.props}
        maskClosable={false}
        width='60%'
        onOk={this.handleOk}>
        <Form>
          <h4>行为参数</h4>
          <FormItem {...layout} colon={false}>
            <Checkbox onChange={this.handleCheckAll}>
              全选/取消全选
            </Checkbox>
          </FormItem>
          <FormItem {...layout} colon={false}>
            {
              getFieldDecorator('checked', {
                initialValue: [],
              })(
                <CheckboxGroup onChange={this.handleCheckGroup} stype={{ width: '100%' }}>
                  {
                    behaviorParams.map((param) => {
                      return (
                        <Row key={param.dictionaryCode}>
                          <Checkbox key={param.dictionaryCode}
                            value={param.dictionaryCode}>{param.dictionaryCode}</Checkbox>
                          <span>权重:</span>
                          {
                            getFieldDecorator(`${param.dictionaryCode}`, {
                              initialValue: 1,
                            })(
                              <Select style={{ width: '64px' }}
                                disabled={!checked.includes(param.dictionaryCode)}>
                                {
                                  lodash.range(1, 9).map((num) => {
                                    return <Option value={num} key={num}>{num}</Option>
                                  })
                                }
                              </Select>
                            )
                          }
                        </Row>)
                    })
                  }
                </CheckboxGroup>
              )
            }
          </FormItem>
        </Form>
      </Modal >)
  }
}

@Form.create()
export default class EditAlgorithmExampleModal extends PureComponent {
  state = {
    showParamModal: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      this.props.dispatch({
        type: 'sysconfig/marketing/fetchAlgorithmTemplate',
        payload: {},
      })
      this.props.dispatch({
        type: 'sysconfig/marketing/fetchRecomContentEntityList',
        payload: {},
      });
      this.props.dispatch({
        type: 'sysconfig/marketing/fetchCodeByCategoryCode',
        payload: { categoryCode: 'USER_BEHAVIOR_PARAM' },
        callback: (err, code) => {
          this.props.dispatch({
            type: 'sysconfig/marketing/updateState',
            payload: { behaviorParams: code },
          })
        },
      })
      const { editAlogrithm, form: { getFieldDecorator, getFieldsValue, setFieldsValue } } = nextProps;
      getFieldDecorator('inputs');
      getFieldDecorator('params')
      const { inputs = [], params = [] } = getFieldsValue();
      if (!inputs.length) setFieldsValue({ inputs: [uuid.v1()] }); // 初始化
      if (!params.length) setFieldsValue({ params: [uuid.v1()] });
      if (editAlogrithm && editAlogrithm !== this.props.editAlogrithm) {
        const json = JSON.parse(editAlogrithm.algorithmParamJson);
        const { parameter = [], action = {} } = json;
        parameter.forEach((param) => {
          const key = uuid.v1();
          params.push(key);
          getFieldDecorator(`parameter.${key}.param_name`, { initialValue: param.param_name });
          getFieldDecorator(`parameter.${key}.param_type`, { initialValue: param.param_type })
          getFieldDecorator(`parameter.${key}.param_value`, { initialValue: param.param_value })
        })
        Object.keys(action).forEach((actionName) => {
          const input = uuid.v1()
          // const item = action[actionName];
          inputs.push(input)
          getFieldDecorator(`action.${input}.actionName`, { initialValue: actionName });
        })
        setFieldsValue({ params, inputs })
      }
    }
  }

  handleEditAction = (actionId) => {
    this.setState({ showParamModal: true, editAction: actionId });
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { action = [], parameter = [], algorithmTemplateId } = values;
        const algorithmTemplate = this.props.algorithmTemplateList.find(i => i.id === algorithmTemplateId)
        let json = { parameter: [], item_type: values.item_type, action: {} }
        // 转化action
        Object.values(action).forEach((act) => { json.action[act.actionName] = act.actionParam || {} });
        // 转换parameter
        json.parameter = Object.values(parameter).map((param) => { return param });
        json.templateParamJson = algorithmTemplate.templateParamJson;
        values.algorithmParamJson = JSON.stringify(json);
        this.props.onOk(values);
        this.props.form.resetFields();
      }
    });
  }

  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onCancel();
  }

  addAction = (key) => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const { inputs = [] } = getFieldsValue();
    const index = inputs.indexOf(key);
    inputs.splice(index + 1, 0, uuid.v1());
    setFieldsValue({ inputs });
  }

  deleteAction = (key) => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const { inputs = [] } = getFieldsValue();
    const index = inputs.indexOf(key);
    inputs.splice(index, 1);
    setFieldsValue({ inputs });
  }

  renderActionRows = () => {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    let { inputs } = getFieldsValue();

    const formItemLayout = {
      labelCol: { sm: { span: 6 } },
      wrapperCol: { sm: { span: 16 } },
    }

    return (<div>
      {
        inputs.map((input) => {
          getFieldDecorator(`action.${input}.actionParam`, {});
          const actionParam = lodash.get(getFieldsValue(), ['action', `${input}`, 'actionParam']) || {};
          return (
            <FormItem label='input'
              key={input}
              {...formItemLayout}>
              <Col span={8}>
                <FormItem>
                  {
                    getFieldDecorator(`action.${input}.actionName`, {
                      rules: [{ required: true, message: '必填字段' }],
                    })(<Input />)
                  }
                </FormItem>
              </Col>
              <Col span={6}>
                <Button onClick={this.handleEditAction.bind(this, input)}>选择</Button>
              </Col>
              <Col span={6}>
                {Object.keys(actionParam).map(key => `${key}:${actionParam[key]}`).join(',')}
              </Col>
              <Col span={2}>
                <Icon type='plus-circle-o' onClick={this.addAction.bind(this, input)} />
                <Icon type='minus-circle-o' onClick={this.deleteAction.bind(this, input)} />
              </Col>
            </FormItem>)
        })
      }
    </div>)
  }

  renderParamRows = () => {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    let { params = [] } = getFieldsValue();
    const formItemLayout = {
      labelCol: { sm: { span: 6 } },
      wrapperCol: { sm: { span: 16 } },
    }

    return (<div>
      {
        params.map((param) => {
          return (
            <FormItem label=' '
              colon={false}
              key={param}
              {...formItemLayout}>
              <Col span={8}>
                <FormItem>
                  {
                    getFieldDecorator(`parameter.${param}.param_name`, {
                      rules: [{ required: true, message: '必填字段' }],
                    })(<Input />)
                  }
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem>
                  {
                    getFieldDecorator(`parameter.${param}.param_type`, {
                      initialValue: 'char',
                      rules: [{ required: true, message: '必填字段' }],
                    })(<Select>{
                      TYPES.map((type) => {
                        return <Option value={type} key={type}>{type}</Option>
                      })
                    }</Select>)
                  }
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  {
                    getFieldDecorator(`parameter.${param}.param_value`, {
                      rules: [{ required: true, message: '必填字段' }],
                    })(<Input />)
                  }
                </FormItem>
              </Col>
              <Col span={2}>
                <Icon type='plus-circle-o' onClick={this.addParam.bind(this, param)} />
                <Icon type='minus-circle-o' onClick={this.deleteParam.bind(this, param)} />
              </Col>
            </FormItem>)
        })
      }
    </div>)
  }

  addParam = (key) => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const { params = [] } = getFieldsValue();
    const index = params.indexOf(key);
    params.splice(index + 1, 0, uuid.v1());
    setFieldsValue({ params });
  }

  deleteParam = (key) => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const { params = [] } = getFieldsValue();
    const index = params.indexOf(key);
    params.splice(index, 1);
    setFieldsValue({ params });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { showParamModal, editAction } = this.state;

    let { editAlogrithm, visible, algorithmTemplateList,
      recomContentEntityList, behaviorParams } = this.props;

    getFieldDecorator('inputs', { initialValue: [] }) // 注册
    getFieldDecorator('params', { initialValue: [] }) // 注册
    editAlogrithm = editAlogrithm || {};
    const json = editAlogrithm.algorithmParamJson ?
      JSON.parse(editAlogrithm.algorithmParamJson) : {};
    getFieldDecorator('id', { initialValue: editAlogrithm.id });
    getFieldDecorator('algorithmInstanceType', { initialValue: 1 }); // TODO将来会删除
    const formItemLayout = {
      labelCol: { sm: { span: 6 } },
      wrapperCol: { sm: { span: 16 } },
    }

    const paramProps = {
      behaviorParams,
      visible: showParamModal,
      onOk: (values) => {
        this.props.form.setFieldsValue({ [`action.${editAction}.actionParam`]: values });
        this.setState({ showParamModal: false, editAction: null })
      },
      onCancel: () => this.setState({ showParamModal: false, editAction: null }),
    }
    return (
      <Modal
        title='编辑算法实例'
        width='60%'
        maskClosable={false}
        onOk={this.handleOk}
        visible={visible}
        onCancel={this.handleCancel}
      >
        <Form>
          <BehaviorParamModal {...paramProps} />
          <FormItem
            {...formItemLayout}
            label='算法模板'>
            {
              getFieldDecorator('algorithmTemplateId', {
                initialValue: editAlogrithm.algorithmTemplateId,
                rules: [{ required: true, message: '必填字段' }],
              })(<Select>
                {
                  algorithmTemplateList.map((tmp) => {
                    return <Option value={tmp.id} key={tmp.id}>{tmp.templateName}</Option>
                  })
                }
              </Select>)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='算法名称'>
            {
              getFieldDecorator('algorithmName', {
                initialValue: editAlogrithm.algorithmName,
                rules: [{ required: true, message: '必填字段' }],
              })(
                <Input />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='算法介绍'>
            {
              getFieldDecorator('algorithmDescription', {
                initialValue: editAlogrithm.algorithmDescription,
                rules: [{ required: true, message: '必填字段' }],
              })(
                <TextArea placeholder='' />)
            }

          </FormItem>
          <FormItem
            {...formItemLayout}
            label='作用实体'>
            {
              getFieldDecorator('item_type', {
                initialValue: json.item_type,
                rules: [{ required: true, message: '必填字段' }],
              })(
                <CheckboxGroup>
                  {
                    recomContentEntityList.map((entity) => {
                      return (<Checkbox value={entity.id} key={entity.id}>
                        {entity.entityName}
                      </Checkbox>)
                    })
                  }
                </CheckboxGroup>)
            }
          </FormItem>
          <FormItem
          >
            <h4>可配置参数:</h4>
            {
              this.renderActionRows()
            }
            {
              this.renderParamRows()
            }
          </FormItem>
        </Form>
      </Modal >
    );
  }
}

EditAlgorithmExampleModal.propTypes = {

};
