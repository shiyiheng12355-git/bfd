import React, { Component, PropTypes } from 'react';
import { Form, Radio, Select, Modal } from 'antd';
import lodash from 'lodash';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 15 },
  },
};
@Form.create()
class ProductModal extends Component {
  componentWillMount() {
    // if (nextProps.visible && nextProps.visible !== this.props.visible) {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchPerRecomAlgorithm',
      payload: {},
    })
    // }
    let { form: { getFieldDecorator, setFieldsValue }, node } = this.props;
    const addition = node && node.value && node.addition;
    const _addition = addition ? JSON.parse(addition) : { mosthot: {} };
    getFieldDecorator('enable');
    getFieldDecorator('id'); // 注册
    getFieldDecorator('mosthot.app');
    getFieldDecorator('mosthot.minute');
    getFieldDecorator('mosthot.property');
    setFieldsValue({
      enable: addition ? '1' : '0',
      id: node.value.id,
      'mosthot.app': _addition.mosthot.app,
      'mosthot.minute': _addition.mosthot.minute,
      'mosthot.property': _addition.mosthot.property,
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.visible && nextProps.visible !== this.props.visible) {
  //     this.props.dispatch({
  //       type: 'sysconfig/marketing/fetchPerRecomAlgorithm',
  //       payload: {},
  //     })
  //   }
  //   let { form: { getFieldDecorator, setFieldsValue }, node } = nextProps;
  //   if (node && node !== this.props.node) { // 编辑
  //     const { value = {} } = node;
  //     const { addition } = value;
  //     const _addition = addition ? JSON.parse(addition) : { mosthot: {} };
  //     getFieldDecorator('enable');
  //     getFieldDecorator('id'); // 注册
  //     getFieldDecorator('mosthot.app');
  //     getFieldDecorator('mosthot.minute');
  //     getFieldDecorator('mosthot.property');
  //     setFieldsValue({
  //       enable: addition ? '1' : '0',
  //       id: value.id,
  //       'mosthot.app': _addition.mosthot.app,
  //       'mosthot.minute': _addition.mosthot.minute,
  //       'mosthot.property': _addition.mosthot.property,
  //     })
  //   }
  // }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      const { enable } = values;
      if (enable === '0') {
        values.addition = '';
      } else {
        values.addition = JSON.stringify({ mosthot: values.mosthot })
      }
      if (!err) {
        this.props.dispatch({
          type: 'marketing/recommendation/updateRecomPolicy',
          payload: values,
        })
        this.props.onOk(values);
        this.props.form.resetFields();
      }
    });
  }

  render() {
    let { form: { getFieldDecorator, getFieldsValue },
      algorithmList } = this.props;
    const { enable, mosthot = {} } = getFieldsValue();
    const algo = algorithmList.find(i => i.algorithmName === mosthot.app) || {};
    let algorithmParamJson = algo.algorithmParamJson ? JSON.parse(algo.algorithmParamJson)[algo.algorithmName] : {};
    // templateParamJson = templateParamJson ? JSON.parse(templateParamJson) : {};
    let { property = [], time = [] } = algorithmParamJson;
    property = lodash.isString(property) ? JSON.parse(property) : property;
    time = lodash.isString(time) ? JSON.parse(time) : time;
    return (
      <Modal
        maskClosable={false}
        title='填充'
        {...this.props}
        onOk={this.onOk}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label='是否填充'
          >{
              getFieldDecorator('enable', {
              })(
                <RadioGroup>
                  <Radio value='1'>是</Radio>
                  <Radio value='0'>否</Radio>
                </RadioGroup>
              )
            }
          </FormItem>
          {
            enable === '1' &&
            <div>
              <FormItem
                {...formItemLayout}
                label="按算法填充"
              >
              </FormItem>
              <FormItem
                label="算法实例"
                {...formItemLayout}
              >
                {
                  getFieldDecorator('mosthot.app', {
                    // rules: [{ required: true, message: '必填字段' }],
                  })(<Select>
                    {
                      algorithmList.map((algorithm) => {
                        return (<Option
                          value={algorithm.algorithmName}
                          key={algorithm.id}>
                          {algorithm.algorithmName}
                        </Option>)
                      })
                    }
                  </Select>)}
              </FormItem>
              {time.length > 0 &&
                <FormItem
                  label="热榜时段"
                  {...formItemLayout}
                >
                  {
                    getFieldDecorator('mosthot.minute', {})(
                      <Select>
                        {
                          time.map((t) => {
                            return <Option key={t} value={t}>{t}</Option>
                          })
                        }
                      </Select>
                    )}
                  <span style={{ position: 'absolute', top: '0', right: '-40px' }}>分钟</span>
                </FormItem>
              }
              {
                property.length > 0 &&
                <FormItem
                  label="获取热榜字段"
                  {...formItemLayout}
                >
                  {
                    getFieldDecorator('mosthot.property', {
                      // rules: [{ required: true, message: '必填字段' }],
                    })(<Select>
                      {
                        property.map((p) => {
                          return <Option key={p} value={p}>{p}</Option>
                        })
                      }
                    </Select>)}
                </FormItem>
              }
            </div>
          }
        </Form>
      </Modal>);
  }
}

ProductModal.propTypes = {
};

export default ProductModal;
