import React, { Component, PropTypes } from 'react';
import { Form, notification, Modal, Checkbox, Radio, Row, Col, Popover } from 'antd';
import moment from 'moment';
import { TIME_FORMAT } from '../../../../utils/utils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};
@Form.create()
class PriorityRecoModal extends Component {
  componentWillMount() {
    const { currentRecomCfg: { entityId } } = this.props;
    this.props.dispatch({
      type: 'marketing/recommendation/fetchPriorityRecmdList',
      payload: { entityId },
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.visible && nextProps.visible !== this.props.visible) {
  //     const { currentRecomCfg: { entityId } } = nextProps;
  //     this.props.dispatch({
  //       type: 'marketing/recommendation/fetchPriorityRecmdList',
  //       payload: { entityId },
  //     })
  //   }
  // }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { enable } = values;
        values.firstRecommend = enable ? values.firstRecommend.join('|') : '';
        let { currentRecomCfg } = this.props;
        if (!currentRecomCfg || !currentRecomCfg.resultFormat || !currentRecomCfg.resultNum) {
          return notification.error({ message: '请先配置推荐内容节点' })
        }
        this.props.dispatch({
          type: 'marketing/recommendation/savePolicy',
          payload: { ...currentRecomCfg, ...values },
          callback: () => {
            this.props.onOk(values);
            this.props.form.resetFields();
          },
        });
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

    let { priorityRecmdList, node, auths } = this.props;
    if (!node) return false;
    const { value = {} } = node;
    const enable = getFieldValue('enable');

    return (
      <Modal
        maskClosable={false}
        {...this.props}
        onOk={this.onOk}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label='是否启用优先推荐'>
            {
              getFieldDecorator('enable', {
                initialValue: !!value.firstRecommend,
              })(
                <RadioGroup>
                  <Radio value={false}>否</Radio>
                  <Radio value>是</Radio>
                </RadioGroup>
              )
            }
          </FormItem>
          {
            enable &&
            <FormItem>
              <Row>
                <Col span={10}>策略</Col>
                <Col span={6}>创建人</Col>
                <Col span={8}>详情</Col>
              </Row>
              {
                getFieldDecorator('firstRecommend', {
                  initialValue: value.firstRecommend ? value.firstRecommend.split('|') : [],
                })(
                  <CheckboxGroup style={{ width: '100%' }}>
                    {
                      priorityRecmdList.map((pri) => {
                        return (
                          <Row key={pri.id}>
                            <Col span={10}>
                              <Checkbox
                                value={pri.id.toString()}
                              >
                                {pri.maketingName}
                              </Checkbox>
                            </Col>
                            <Col span={6}>{pri.createUser}</Col>
                            <Col span={6}>
                              <Popover
                                content={
                                  <div>
                                    <p>推荐对象:{pri.toGroupName}</p>
                                    <p>规则类型:{pri.matchType}</p>
                                    <p>最近修改时间：{pri.updateTime ? moment(pri.updateTime).format(TIME_FORMAT) : ''}</p>
                                  </div>}>
                                <a onClick={() => false}>详情</a>
                              </Popover></Col>
                          </Row>
                        )
                      })
                    }
                  </CheckboxGroup>
                )
              }
            </FormItem>
          }
        </Form>
      </Modal>);
  }
}

PriorityRecoModal.propTypes = {
};

export default PriorityRecoModal;
