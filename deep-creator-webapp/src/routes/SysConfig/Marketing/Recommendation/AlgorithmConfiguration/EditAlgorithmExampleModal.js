import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import {
  Modal, Form, Input, Button, Select, Checkbox, Col, Row, InputNumber,
} from 'antd';

const FormItem = Form.Item;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const { TextArea } = Input;

@Form.create()
class BehaviorParamModal extends PureComponent {
  state = { checked: [], selected: {} }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editAction && nextProps.editAction !== this.props.editAction) {
      const { form: { getFieldDecorator, setFieldsValue }, editAction } = nextProps;
      const values = Object.values(editAction)[0] || {};
      getFieldDecorator('checked');
      const keys = Object.keys(values);
      setFieldsValue({ checked: keys, ...values });
    }
  }

  handleCheckAll = (e) => {
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
            <Checkbox onChange={this.handleCheckAll}
              checked={checked.length === behaviorParams.length}>
              全选/取消全选
            </Checkbox>
          </FormItem>
          <FormItem {...layout} colon={false}>
            {
              getFieldDecorator('checked', {
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
                                  lodash.range(1, 10).map((num) => {
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
    }
  }

  handleEditAction = (action) => {
    this.setState({ showParamModal: true, editAction: action });
  }

  handleOk = () => {
    const { editAlogrithm, dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { actions = [], parameter = {}, algorithmName } = values;
        const jsonTypeParameters = this.json.parameter.filter(p => p.type === 'json').map(p => p.name);
        jsonTypeParameters.forEach((name) => {
          if (parameter[name]) parameter[name] = JSON.parse(parameter[name]);
          // 将json字符串转换成js对象
        })
        // const algorithmTemplate = this.props.algorithmTemplateList.find(i => i.id === algorithmTemplateId)
        let json = { [algorithmName]: { ...parameter, ...actions } }
        // "alg_path": "hotlist",TODO alg_path字段决定是否显示热榜信息
        // json.templateParamJson = algorithmTemplate.templateParamJson;
        values.algorithmParamJson = JSON.stringify(json);
        editAlogrithm ?
          dispatch({
            type: 'sysconfig/marketing/editPerRecomAlgorithm',
            payload: values,
            callback: () => {
              dispatch({
                type: 'sysconfig/marketing/fetchPerRecomAlgorithm',
                payload: {},
              })
              this.props.onOk(values);
              this.props.form.resetFields();
            },
          }) :
          dispatch({
            type: 'sysconfig/marketing/addPerRecomAlgorithm',
            payload: values,
            callback: () => {
              dispatch({
                type: 'sysconfig/marketing/fetchPerRecomAlgorithm',
                payload: {},
              })
              this.props.onOk(values);
              this.props.form.resetFields();
            },
          });
      }
    });
  }

  handleCancel = () => {
    this.props.onCancel();
    this.props.form.resetFields();
  }

  renderActionRows = (actions = []) => {
    const { form: { getFieldsValue, getFieldDecorator } } = this.props;
    const fields = getFieldsValue();
    const formItemLayout = {
      labelCol: { sm: { span: 4 } },
      wrapperCol: { sm: { span: 16 } },
    }
    return (<div>
      {
        actions.map((action, index) => {
          if (!Object.keys(action).length) return false;
          const actionName = Object.keys(action)[0];
          getFieldDecorator(`actions.${actionName}`, { initialValue: action[actionName] });
          const actionValues = (fields.actions || {})[actionName] || action[actionName] || {};
          return (
            <FormItem label={actionName}
              key={index}
              {...formItemLayout}>
              <Col span={6}>
                <Button onClick={this.handleEditAction.bind(this, action)}>选择</Button>
              </Col>
              <Col span={6}>
                {Object.keys(actionValues).map(key => `${key}:${actionValues[key]}`).join(',')}
              </Col>
            </FormItem>)
        })
      }
    </div>)
  }

  renderParamRows = (params = []) => {
    const { form: { getFieldDecorator } } = this.props;

    const formItemLayout = {
      labelCol: { sm: { span: 2 } },
      wrapperCol: { sm: { span: 22 } },
    }

    return (<div>
      <FormItem
        {...formItemLayout}
        label=" "
        colon={false}>
        <Col span={6}>参数英文名称：</Col>
        <Col span={4}>参数中文名称：</Col>
        <Col span={4}>参数类型：</Col>
        <Col span={6}>参数值：</Col>
      </FormItem>
      {
        params.map((param, index) => {
          let InputItem = <Input style={{ width: '200px' }} />
          if (param.option_list && param.option_list.length) {
            InputItem = (<Select style={{ width: '200px' }}>
              {param.option_list.map((option, _index) => {
                return <Option key={_index} value={option}>{option}</Option>
              })}</Select>)
          } else if (param.type === 'boolean') {
            InputItem = <Checkbox />
          }
          let initialValue = param.default;
          let type = param.type;
          if (param.type === 'json') {
            type = 'string';
            initialValue = initialValue ? JSON.stringify(initialValue) : '';
          }
          if (param.type === 'int') {
            InputItem = <InputNumber style={{ width: '200px' }} />
            type = 'integer';
          }
          if (param.type === 'double') {
            InputItem = <InputNumber style={{ width: '200px' }} />
            type = 'float';
          }
          return (
            <FormItem {...formItemLayout} label=" " colon={false} key={index}>
              <Col span={6}>{param.name}</Col>
              <Col span={4}>{param.description}</Col>
              <Col span={4}>{param.type}</Col>
              <Col span={10}>
                <FormItem
                  label=" "
                  labelCol={{ span: 1 }}
                  wrapperCol={{ span: 23 }}
                  colon={false}>
                  {
                    getFieldDecorator(`parameter.${param.name}`, {
                      initialValue,
                      rules: [{
                        required: !!param.required,
                        message: '必填字段',
                      }, {
                        validator: (rule, value, callback) => {
                          if (param.type === 'json' && value) {
                            try {
                              JSON.parse(value);
                            } catch (e) {
                              return callback('json格式错误')
                            }
                          }
                          return callback();
                        },
                      }, {
                        type,
                        message: `输入数据不是${param.type}类型`,
                      }],
                    })(InputItem)
                  }
                </FormItem>
              </Col>
            </FormItem>
          )
        })
      }
    </div>)
  }

  render() {
    const { getFieldDecorator, setFieldsValue, getFieldsValue } = this.props.form;
    const { showParamModal, editAction } = this.state;

    let { editAlogrithm, algorithmTemplateList,
      recomContentEntityList, behaviorParams } = this.props;

    const _editAlogrithm = editAlogrithm || {};

    const formItemLayout = {
      labelCol: { sm: { span: 4 } },
      wrapperCol: { sm: { span: 18 } },
    }
    const { algorithmTemplateId } = getFieldsValue();
    const algorithmTemplate = algorithmTemplateList.find(i => i.id === algorithmTemplateId) || {};
    const templateParamJson = algorithmTemplate.templateParamJson ?
      JSON.parse(algorithmTemplate.templateParamJson) : { parameter: [], actions: [] }; // 模板配置

    let json = templateParamJson;
    getFieldDecorator('templateName', { initialValue: json.alg_name });
    getFieldDecorator('id', { initialValue: _editAlogrithm.id });
    if (editAlogrithm) { // 如果是编辑的话， 实例数据和模板数据合并
      const algorithmParamJson = _editAlogrithm.algorithmParamJson ?
        JSON.parse(_editAlogrithm.algorithmParamJson) : {}; // 编辑配置
      const values = algorithmParamJson[_editAlogrithm.algorithmName] || {};

      json.parameter = json.parameter.map((p) => {
        return { ...p, default: values[p.name] }
      })
      json.actions = json.actions.map((action) => {
        const actionName = Object.keys(action)[0];
        return { [actionName]: values[actionName] }
      })
      json.item_type = values.item_type;
    }
    this.json = json; // 保存时用
    const paramProps = {
      behaviorParams,
      editAction,
      visible: showParamModal,
      onOk: (values) => {
        const actionName = Object.keys(editAction)[0];
        getFieldDecorator(`actions.${actionName}`);
        setFieldsValue({ [`actions.${actionName}`]: values });
        this.setState({ showParamModal: false, editAction: null })
      },
      onCancel: () => this.setState({ showParamModal: false, editAction: null }),
    }
    return (
      <Modal
        {...this.props}
        width='60%'
        onOk={this.handleOk}
        maskClosable={false}
        onCancel={this.handleCancel}
      >
        <Form>
          <BehaviorParamModal {...paramProps} />
          <FormItem
            {...formItemLayout}
            label='算法模板'>
            {
              getFieldDecorator('algorithmTemplateId', {
                initialValue: _editAlogrithm.algorithmTemplateId,
                rules: [{ required: true, message: '必填字段' }],
              })(<Select disabled={!!editAlogrithm}>
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
                initialValue: _editAlogrithm.algorithmName,
                rules: [{ required: true, message: '必填字段' },
                { max: 20, message: '最长不超过20个字符' }, {
                  validator: (rule, value, callback) => {
                    const reg = /^[A-Za-z0-9]+$/;
                    if (!reg.test(value)) {
                      callback('请输入英文或数字组合');
                      return;
                    }
                    callback();
                  },
                }],
              })(
                <Input />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='算法介绍'>
            {
              getFieldDecorator('algorithmDescription', {
                initialValue: _editAlogrithm.algorithmDescription,
                rules: [
                  { required: true, message: '必填字段' },
                  { max: 100, message: '最长不超过100个字符' }],
              })(
                <TextArea placeholder='' />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='作用实体'>
            {
              getFieldDecorator('parameter.item_type', {
                initialValue: json.item_type || [],
                rules: [{ required: true, message: '必填字段' }],
              })(
                <CheckboxGroup>
                  {
                    recomContentEntityList.map((entity) => {
                      return (<Checkbox value={entity.entityEnglishName} key={entity.id}>
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
            <FormItem label='输入行为'
              wrapperCol={{ span: 20 }}
              labelCol={{ span: 4 }}
            >
              {
                this.renderActionRows(json.actions)
              }
            </FormItem>
            {
              this.renderParamRows(json.parameter)
            }
          </FormItem>
        </Form>
      </Modal >
    );
  }
}

EditAlgorithmExampleModal.propTypes = {

};
