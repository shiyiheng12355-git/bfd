import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, InputNumber, Row, Col, Button } from 'antd';
import HeaderTitle from '../../../components/HeaderTitle';
import { numberValidatorMsg } from '../../../utils/utils';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
  },
};
@Form.create()
class Automation extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'sysconfig/marketing/fetchSceneCfg',
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'sysconfig/marketing/updateSceneCfg',
          payload: values,
        })
      }
    })
  }

  render() {
    const { sceneCfg, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSubmit}>
        <HeaderTitle>自动化营销</HeaderTitle>
        <FormItem>
          <Col span={12}>
            <FormItem
              label='单个决策树节点上限'
              {...formItemLayout}
            >{getFieldDecorator('nodeUpperLimit', {
              initialValue: sceneCfg.nodeUpperLimit,
              rules: [{
                validator: (rule, value, callback) => {
                  const msg = numberValidatorMsg(value, 1, 100, true);
                  return msg ? callback(msg) : callback();
                },
              }],
            })(
              <InputNumber min={1} max={100} />
            )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label='单个用户创建决策树数量上限'
              labelCol={{
                sm: { span: 14 },
              }}
              wrapperCol={{
                sm: { span: 10 },
              }}
            >
              {
                getFieldDecorator('createUpperLimit', {
                  initialValue: sceneCfg.createUpperLimit,
                  rules: [{
                    validator: (rule, value, callback) => {
                      const msg = numberValidatorMsg(value, 1, 100, true);
                      return msg ? callback(msg) : callback();
                    },
                  }],
                })(<InputNumber min={1} max={100} />)
              }

            </FormItem>
          </Col>
        </FormItem>
        <Row>
          <Col span={10} style={{ paddingLeft: '20px', paddingTop: '10px' }}>
            <Button
              type='primary'
              htmlType='submit'>保存</Button>
            <Button style={{ marginLeft: 16 }}
              onClick={() => this.props.form.resetFields()}>
              重置</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

Automation.propTypes = {

};

export default Automation;