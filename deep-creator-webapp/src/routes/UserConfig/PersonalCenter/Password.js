import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Table, Progress, Input, Button, Form } from 'antd'
import config from '../../../utils/config'

import styles from './index.less'

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  personalcenter: state['userconfig/personalcenter'],
}))
export default class Password extends PureComponent {
  state = {
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'userconfig/personalcenter/updatePassword',
          payload: {
            oldPassword: values.old_password,
            newPassword: values.new_password,
          },
          callback: () => {
            window.location.href = config.logoutRedirectPath;
          },
        })
      }
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    return (
      <div className={styles.box} style={{ padding: '40px 25%' }}>
        <Form onSubmit={::this.handleSubmit}>
          <FormItem
          label="旧密码"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          {getFieldDecorator('old_password', {
            rules: [{ required: true, message: '请填写旧密码' }, {
              validator: (rule, value, callback) => {
                if (value && value.indexOf(' ') != -1) {
                  callback('不能输入空格');
                }
                callback();
              },
            }],
          })(
            <Input style={{ width: '450px' }} placeholder="请输入旧密码" type="password" />
            )}
        </FormItem>
        <FormItem
          label="新密码"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          {getFieldDecorator('new_password', {
            rules: [{ required: true, message: '请填写新密码' }, {
              validator: (rule, value, callback) => {
                if (value && value.indexOf(' ') != -1) {
                  callback('不能输入空格');
                }
                if (value == getFieldValue('old_password')) {
                  callback('新密码不能和旧密码相同');
                }
                const reg = /^(?=.*[A-Z])(?![\d]+$)(?![a-zA-Z]+$)(?![+=_!@#%&*-]+$)[\da-zA-Z+=_!@#%&*-]{8,30}$/;
                if (!reg.test(value)) {
                  callback('大小写字母或数字或特殊符号（+=_!@#%&*-）任意两项的组合，长度8~30之间，不能与用户名相同，至少包含一个大写字母并区分大小写');
                }
                callback();
              },
            }],
          })(
            <Input style={{ width: '450px' }} placeholder="请输入新密码" type="password" />
            )}
        </FormItem>
        <FormItem
          label="再次输入新密码"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          {getFieldDecorator('repeat_new_password', {
            rules: [{ required: true, message: '再次输入新密码不能为空' }, {
              validator: (rule, value, callback) => {
                if (value !== getFieldValue('new_password')) {
                  callback('再次输入密码和新密码不一致');
                }
                callback();
              },
            }],
          })(
            <Input style={{ width: '450px' }} placeholder="请再次输入新密码" type="password" />
            )}
        </FormItem>
        <FormItem labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit">确认修改</Button>
        </FormItem>
        </Form>
      </div>
    )
  }
}
