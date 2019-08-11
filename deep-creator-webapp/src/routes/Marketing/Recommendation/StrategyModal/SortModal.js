import React, { Component, PropTypes } from 'react';
import { Form, Select, Radio, Col, Modal, InputNumber } from 'antd';
import _ from 'lodash';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;


const headerLayout = {
  labelCol: { sm: { span: 0 } },
  wrapperCol: { sm: { span: 24 } },
}

@Form.create()
class SortModal extends Component {
  componentWillMount() {
    const { currentRecomCfg: { entityId },
      form: { getFieldDecorator, setFieldsValue },
      node,
    } = this.props;
    if (!entityId) return;
    this.props.dispatch({
      type: 'marketing/recommendation/fetchParamSource',
      payload: { key: 'RECOM_ID_ATTRIBUTE', entityId },
    })

    const sort = node && node.value && node.value.sort;
    let _sort = sort ? JSON.parse(sort) : { sort: {}, random: {}, topn: {}, algorithm: {} };
    getFieldDecorator('enable');
    getFieldDecorator('id'); // 注册
    getFieldDecorator('sort.by');
    getFieldDecorator('sort.weight');
    getFieldDecorator('sort.order');
    getFieldDecorator('algorithm.weight');
    getFieldDecorator('topn.num');
    getFieldDecorator('random.num');
    setFieldsValue({
      enable: sort ? '1' : '0',
      id: node.value.id,
      'sort.by': _sort.sort.by,
      'sort.weight': _sort.sort.weight,
      'sort.order': _sort.sort.order,
      'algorithm.weight': _sort.algorithm.weight,
      'topn.num': _sort.topn.num,
      'random.num': _sort.random.num,
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.visible && nextProps.visible !== this.props.visible) {
  //     const { currentRecomCfg: { entityId } } = nextProps;
  //     if (!entityId) return;
  //     this.props.dispatch({
  //       type: 'marketing/recommendation/fetchParamSource',
  //       payload: { key: 'RECOM_ID_ATTRIBUTE', entityId },
  //     })
  //   }
  //   let { form: { getFieldDecorator, setFieldsValue }, node } = nextProps;
  //   if (node && node !== this.props.node) { // 编辑
  //     const { value = {} } = node;
  //     const { sort } = value;
  //     let _sort = sort ? JSON.parse(sort) : { sort: {}, random: {}, topn: {}, algorithm: {} };
  //     getFieldDecorator('enable');
  //     getFieldDecorator('id'); // 注册
  //     getFieldDecorator('sort.by');
  //     getFieldDecorator('sort.weight');
  //     getFieldDecorator('sort.order');
  //     getFieldDecorator('algorithm.weight');
  //     getFieldDecorator('topn.num');
  //     getFieldDecorator('random.num');
  //     setFieldsValue({
  //       enable: sort ? '1' : '0',
  //       id: value.id,
  //       'sort.by': _sort.sort.by,
  //       'sort.weight': _sort.sort.weight,
  //       'sort.order': _sort.sort.order,
  //       'algorithm.weight': _sort.algorithm.weight,
  //       'topn.num': _sort.topn.num,
  //       'random.num': _sort.random.num,
  //     })
  //   }
  // }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { sort, random, topn, algorithm, enable } = values;
        values.sort = JSON.stringify({ sort, random, topn, algorithm });
        if (enable === '0') values.sort = '';
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
    let { form: { getFieldDecorator, getFieldsValue }, paramSources, node } = this.props;
    const formLayout = { labelCol: { span: 6 }, wrapperCol: { span: 16 } }
    const { enable } = getFieldsValue();

    return (
      <Modal
        maskClosable={false}
        title='排序'
        {...this.props}
        onOk={this.onOk}
      >
        <Form>
          <FormItem
            {...headerLayout}
            label='是否排序'
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
                {...headerLayout}
              >
                <h4>按属性排序</h4>
              </FormItem>
              <FormItem>
                <Col span='12'>
                  <FormItem
                    label='排序属性'
                  >{getFieldDecorator('sort.by', {
                    // rules: [{ required: true, message: '必填字段' }],
                  })(
                    <Select>
                      {
                        (paramSources.RECOM_ID_ATTRIBUTE || []).map((param) => {
                          return (<Option
                            value={param.key}
                            key={param.key}>
                            {param.label}
                          </Option>)
                        })
                      }
                    </Select>
                  )}
                  </FormItem>
                </Col>
                <Col span='12'>
                  <FormItem label='权重'>
                    {getFieldDecorator('sort.weight', {
                      rules: [{
                        validator: (rule, value, callback) => {
                          if (value === '' || value === undefined) return callback();
                          if (!_.isNumber(value)) {
                            return callback('应为数字');
                          }
                          if (value < 0) {
                            return callback('最小应不小于0');
                          }
                          return callback();
                        },
                      }],
                    })(<InputNumber min={0} />)}
                  </FormItem>
                </Col>
              </FormItem>
              <FormItem
                label="排序方式"
              >
                {getFieldDecorator('sort.order', {
                })(
                  <RadioGroup>
                    <Radio value={0}> 降序</Radio>
                    <Radio value={1}> 升序</Radio>
                  </RadioGroup>)}

              </FormItem>
              <FormItem
                label='随机排序'
              >
              </FormItem>
              <FormItem
                {...formLayout}
                label='随机返回结果个数'
              >{
                  getFieldDecorator('random.num', {
                  })(<InputNumber min={0} />)}
              </FormItem>
              <FormItem
                label='取topN'
              >
              </FormItem>
              <FormItem
                {...formLayout}
                label='topN个数'
              > {getFieldDecorator('topn.num', {
              })(<InputNumber min={0} step={1} />)}
              </FormItem>
              {/*
                暂时后端不支持，注释掉该功能
              <FormItem
                {...headerLayout}
              >
                <h4>按算法排序</h4>
              </FormItem>
              <FormItem
              >
                <Col span='16'>
                  <FormItem
                    label='选择算法'
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                  > {getFieldDecorator('algorithm.type', {
                    initialValue: 'sort_by_lr',
                  })(
                    <Select>
                      <Option value='sort_by_lr'>LR逻辑回归</Option>
                    </Select>
                  )}
                  </FormItem>
                </Col>
                <Col span='8'>
                  <FormItem
                    label='权重'
                    {...formLayout}
                  >{getFieldDecorator('algorithm.weight', {
                  })(<InputNumber min={0} max={1} step={0.1} />)}
                  </FormItem>
                </Col>
              </FormItem>
                */}
            </div>
          }
        </Form>
      </Modal>);
  }
}

SortModal.propTypes = {
};

export default SortModal;
