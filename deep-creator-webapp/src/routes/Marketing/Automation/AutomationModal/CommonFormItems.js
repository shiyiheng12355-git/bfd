import React from 'react';
import PropTypes from 'prop-types';
import {
  Form, Select, Col, Radio, DatePicker, InputNumber,
} from 'antd';
import moment from 'moment';
import lodash from 'lodash';

import { DURATION } from '../../../../utils/utils';

const RadioGroup = Radio.Group;
const defaultLayout = {
  labelCol: { sm: { span: 5 } },
  wrapperCol: { sm: { span: 15 } },
}
const FormItem = Form.Item;
const { Option } = Select;

// 一些FormItem公用
const CommonFormItems = (props) => {
  let { form: { getFieldDecorator, getFieldsValue },
    messageGroupList = [],
    formItemLayout = defaultLayout, messageGroupDisabled = false } = props;

  const values = getFieldsValue();
  const extraInfo = values.extra_info || {};
  const sendType = extraInfo.send_type;
  const targetType = extraInfo.target_type;

  const disableDate = (current) => { // 30天以后 当天以前不能选择
    if (!current) return false;
    return current.valueOf() > moment().add(30, 'days').valueOf() ||
      current.valueOf() < moment().subtract(1, 'days').valueOf();
  }

  const errorMsg = () => {
    const { intervalNum, duration } = props.form.getFieldsValue();
    if (!intervalNum && !duration) return; // 还没有初始化
    let errMsg = intervalNum ? '' : '转换时间必填';
    if (intervalNum && !lodash.isNumber(intervalNum)) errMsg += '时间应该为自然数';
    const interval = moment.duration(parseInt(intervalNum, 10), duration).asSeconds();
    if (interval > 7 * 24 * 3600 || interval < 60) errMsg += '转换周期应该在1分钟以上，７天以内';
    return errMsg;
  }

  const errMsg = errorMsg();

  return (
    <div>
      <FormItem
        {...formItemLayout}
        label="发送对象">
        {
          getFieldDecorator('extra_info.target_type', {
            initialValue: extraInfo.target_type || 'USER',
            rules: [{ required: true, message: '必填字段' }],
          })(
            <RadioGroup>
              <Radio value='USER'>当前节点用户</Radio>
              {!messageGroupDisabled && <Radio value='GROUP'>消息组</Radio>}
            </RadioGroup>
          )
        }
      </FormItem>
      {
        targetType === 'GROUP' &&
        <FormItem
          {...formItemLayout}
          colon={false}
          label=" ">
          {
            getFieldDecorator('extra_info.target_group', {
              // initialValue: messageGroupList.map(i => i.id), // 默认全选
            })(<Select>
              {
                messageGroupList.map((group, index) => {
                  return (<Option key={`group_${index}`}
                    value={group.id}>{group.shortMessageGroupName || group.mailGroupName}</Option>);
                })
              }
            </Select>)
          }
        </FormItem>
      }
      <FormItem
        labelCol={{ sm: { span: 5 } }}
        wrapperCol={{ sm: { span: 16 } }}
        label='发送方式'
      >
        {
          getFieldDecorator('extra_info.send_type', {
            initialValue: extraInfo.send_type || 'NOW',
            rules: [{ required: true, message: '必填字段' }],
          })(<RadioGroup>
            <Radio value='NOW'>及时发送</Radio>
            <Radio value="DELAY">延后发送</Radio>
            <Radio value='TIMER'>自定义时间</Radio>
          </RadioGroup>)
        }
      </FormItem>
      {
        sendType === 'DELAY' &&
        <FormItem {...formItemLayout} label=' ' colon={false}>
          {
            getFieldDecorator('extra_info.send_delay_num', {
              initialValue: (extraInfo.send_delay || 60) / 60,
            })(<InputNumber min={1} />)
          }
          {
            getFieldDecorator('extra_info.send_delay_type', {
              initialValue: 'minutes',
            })(
              <Select style={{ width: '72px' }}>
                <Option key="minutes">分钟</Option>
                <Option key="hours">小时</Option>
              </Select>)
          }
          <span style={{ marginLeft: '8px' }}>之后</span>
        </FormItem>
      }
      {
        sendType === 'TIMER' &&
        <FormItem {...formItemLayout} label=' ' colon={false}>
          {
            getFieldDecorator('extra_info.send_timer', {
              initialValue: extraInfo.send_timer ? moment(extraInfo.send_timer) : moment(),
            })(<DatePicker
              style={{ width: '176px' }}
              showTime
              disabledDate={disableDate}
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="自定义时间" />)
          }
        </FormItem>
      }
      <FormItem
        {...formItemLayout}
        validateStatus={errMsg ? 'error' : null}
        extra={<span style={{ color: '#f5222d' }}>{errMsg}</span>}
        label='转化周期'>
        {getFieldDecorator('intervalNum', {
          initialValue: 1,
        })(<InputNumber min={1} step={1} />)}
        {
          getFieldDecorator('duration', {
            initialValue: 'minutes',
          })(
            <Select style={{ width: '80px' }} placeholder='请输入'>
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
      </FormItem>
    </div>
  );
};

// 一些FormItem公用
CommonFormItems.propTypes = {

};

CommonFormItems.parseData = (node, values) => {
  const extraInfo = values.extra_info;
  node.interval = moment.duration(
    parseInt(values.intervalNum, 10), values.duration).asSeconds();
  if (extraInfo.send_type === 'DELAY') {
    node.extra_info.send_delay = moment.duration(
      parseInt(extraInfo.send_delay_num, 10),
      extraInfo.send_delay_type).asSeconds();
  } else if (extraInfo.send_type === 'TIMER') {
    node.extra_info.send_timer = extraInfo.send_timer.unix();
  } else if (extraInfo.send_type === 'NOW') {
    node.extra_info.send_delay = 1;
  }
}


// 一些FormItem公用
export default CommonFormItems;