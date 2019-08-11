import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Row, Col, Icon, Popover, Button, Form, Input, Popconfirm, Modal } from 'antd'
import styles from './index.less'


const FormItem = Form.Item;


@Form.create()
@connect(state => ({
  global: state.global,
}))
export default class Enshrine extends PureComponent {

  state = {
    visible: false
  }

  handleSubmit = (e) => {
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
                this.setState({ visible: false });
                this.props.form.resetFields();
                if (this.props.onChange) {
                  this.props.onChange();
                }
              }
            });
          }
        })
      }
    });
  }

  del = () => {
    const { resourceUrl } = this.props;
    const id = Number(resourceUrl.replace('/enshirne/', ''));
    this.props.dispatch({
      type: 'global/delCollectionMenu',
      payload: { id },
      callback: () => {
        if (this.props.onChange) {
          this.props.onChange();
        }
      }
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, type } = this.props;
    return (
      <div className={styles.enshrine}>
        <Modal
          title="添加收藏列表"
          visible={this.state.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel} >
          <Form>
            <FormItem style={{ marginBottom: '10px' }}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入收藏名' }, { max: 20, message: '最长不超过20个字符' },{
                  validator: (rule, value, callback) => {
                    if (value && value.indexOf(' ') != -1) {
                      callback('不能输入空格');
                      return;
                    }
                    callback();
                  },
                }],
              })(
                <Input placeholder="请填写收藏名" />
              )}
            </FormItem>
          </Form>
        </Modal>
        {type == 'add' ? <span style={{ position: 'absolute', top: 0, left: '48px' }}>{name} </span> : <span>{name}</span>}

        {
          type == 'add' ? (
            <Icon type="plus-circle-o" className={styles.icon} onClick={() => {
              this.props.form.setFieldsValue({ name: '' });
              this.showModal();
            }} />
          ) : null
        }
        {
          type == 'del' ? (
            <Popconfirm title="确定删除吗？" okText="确定" cancelText="取消" onConfirm={this.del}>
              <Icon type="close" className={styles.icon} />
            </Popconfirm>
          ) : null
        }
      </div>
    );
  }
}
