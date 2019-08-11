import React, { PureComponent } from 'react'
import { connect } from 'dva'
import PageHeaderLayout from '../../layouts/PageHeaderLayout'
import { Row, Col, Icon, Popover, Button, Form, Input, Popconfirm, Modal } from 'antd'


const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  global: state.global,
}))
export default class Add extends PureComponent {

  handleSubmit(e){
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'global/checkMenuName',
          payload: {
            menuName: values.name
          },
          callback: () => {
            this.props.dispatch({
              type: 'global/saveCollectionMenu',
              payload: {
                menuName: values.name
              },
              callback: () => {
                this.props.form.resetFields();
                this.props.dispatch({
                  type: 'user/fetchCurrent',
                  payload: {},
                  callback: (user) => {
                    if (user.postId) {
                      this.props.dispatch({
                        type: 'user/fetchMenus',
                        payload: {}
                      });
                    }
                  },
                });
              }
            });
          }
        })
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '我的收藏' }, { title: '添加收藏' }]} />
        <Form style={{ background:'#fff',padding:'20px 30px'}}>
          <FormItem style={{ marginBottom: '10px' }}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '请输入收藏名' },{ max: 20, message: '最长不超过20个字符' },{
                validator: (rule, value, callback) => {
                  if (value && value.indexOf(' ') != -1) {
                    callback('不能输入空格');
                    return;
                  }
                  callback();
                },
              }],
            })(
              <Input placeholder="请填写收藏名" style={{width:'240px'}}/>
            )}
          </FormItem>
          <FormItem style={{ marginBottom: '0px' }}>
            <Button type="primary" onClick={::this.handleSubmit}>确定</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
