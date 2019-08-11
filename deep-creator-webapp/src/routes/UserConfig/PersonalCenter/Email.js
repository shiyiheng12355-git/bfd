import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Button, Input, Icon, Checkbox, Table, Modal, Form, Pagination, Popconfirm, Popover, Tooltip } from 'antd'
import { formatMoment } from '../../../utils'
import styles from './index.less'

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  personalcenter: state['userconfig/personalcenter'],
}))
export default class Email extends React.Component {
  state = {
    address: [''],
    emailModal: false,
    mailGroupName: '',
    isAdd: true,
  }

  node = null;

  emailColumns = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (text, record, index) => {
      const { emailData } = this.props.personalcenter;
      return (emailData.pageNum - 1) * emailData.pageSize + index + 1
    },
  }, {
    title: '邮件组名称',
    dataIndex: 'mailGroupName',
    key: 'mailGroupName',
  }, {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    render: text => formatMoment(text),
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      const list = record.mailAddresses && record.mailAddresses.split(',');
      const content = list.length > 0 && list.map((item, i) => {
        return <div style={{ float: 'left', width: '200px', textAlign: 'left', overflow: 'hidden',textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '20px' }} key={i}>
          <Popover placement="topLeft" trigger="hover" content={item}>
            <span>{item}</span>
          </Popover>
        </div>
      });
      return (
        <span>
          <Popover
            content={<div style={{ width: '400px' }}>{content || '暂无'}<div style={{ clear: 'both' }}></div></div>}
            title="组内邮箱"
            trigger="hover"
            placement="left">
            <a>详情</a>
          </Popover>

          <a style={{ margin: '0 10px' }} onClick={() => this.edit(record)}>编辑</a>
          <Popconfirm title="确认删除吗?" onConfirm={() => this.del(record)} okText="确定" cancelText="取消">
            <a>删除</a>
          </Popconfirm>
        </span>
      )
    },
  }]

  componentDidMount() {
    this.init({ pageNum: 1, pageSize: 10 });
  }

  init(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'userconfig/personalcenter/queryEmail',
      payload: { ...params },
    })
  }

  edit(item) {
    this.node = item;
    this.setState({
      emailModal: true,
      address: item.mailAddresses.split(','),
      mailGroupName: item.mailGroupName,
      isAdd: false,
    })
  }

  onChange(pageNum, pageSize) {
    this.init({ pageNum, pageSize });
  }

  addEmail() {
    this.node = null;
    this.setState({
      emailModal: true,
      address: [''],
      mailGroupName: '',
      isAdd: true,
    });
  }

  del(item) {
    this.props.dispatch({
      type: 'userconfig/personalcenter/delEmailGroup',
      payload: {
        id: item.id,
      },
      callback: () => {
        this.init({ pageNum: 1, pageSize: 10 });
      },
    })
  }

  handleEmailOk() {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values,this.node);
        let arr = [];
        values.address && values.address.length > 0 && values.address.map((m, n) => {
          if (m) arr.push(m);
        });
        // add
        if (this.state.isAdd) {
          this.props.dispatch({
            type: 'userconfig/personalcenter/addEmailGroup',
            payload: {
              mailGroupName: values.email,
              mailAddresses: arr.join(','),
            },
            callback: () => {
              this.handleEmailCancel();
              this.init({ pageNum: 1, pageSize: 10 });
            },
          })
        } else { // edit
          this.props.dispatch({
            type: 'userconfig/personalcenter/editEmailGroup',
            payload: {
              id: this.node.id,
              nameIsChange: values.email !== this.node.mailGroupName,
              mailGroupName: values.email,
              mailAddresses: arr.join(','),
            },
            callback: () => {
              this.handleEmailCancel();
              this.init({ pageNum: 1, pageSize: 10 });
            },
          })
        }
      }
    });
  }

  handleEmailCancel() {
    this.props.form.resetFields();
    this.setState({ emailModal: false })
  }

  addRowEmail() {
    let { address } = this.state
    address.push('')
    setTimeout(() => {
      this.props.form.setFieldsValue({ address })
    });
    this.setState({ address })
  }

  deleteRowEmail(index) {
    let { address } = this.state;
    address.splice(index, 1);
    this.setState({ address });
    this.props.form.setFieldsValue({ address });
  }

  render() {
    const { address } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { emailData } = this.props.personalcenter;
    return (
      <div className={styles.box}>
        <div className={styles.add}>
          <Button type="primary" onClick={::this.addEmail}>新增邮件组</Button>
        </div>
        { emailData && emailData.list && emailData.list.length > 0 ? (
        <div>
          <Table columns={this.emailColumns} dataSource={emailData.list} pagination={false} rowKey={(record, index) => index} />
          <Pagination className={styles.pager}
            current={emailData.pageNum}
            total={emailData.total}
            onChange={::this.onChange}
            pageSize={emailData.pageSize} />
        </div>) : (<Table columns={this.emailColumns} dataSource={[]} pagination={false} rowKey={(record, index) => index} />)}
          <Modal title={this.state.isAdd ? '新增邮件组' : '编辑邮件组'}
                visible={this.state.emailModal}
                onOk={::this.handleEmailOk}
                onCancel={::this.handleEmailCancel}>
          <Form className="login-form">
            <FormItem
              label="邮件组名称"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              >
              {getFieldDecorator('email', {
                initialValue: this.state.mailGroupName,
                rules: [{ required: true, message: '请填写邮件名称' }, {
                  validator: (rule, value, callback) => {
                    if (value.indexOf(' ') != -1) {
                      callback('邮件名称不能有空格');
                      return;
                    }
                    if (value.length > 30) {
                      callback('邮件名称不能超过30个字符');
                      return;
                    }
                    const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
                    if (!reg.test(value)) {
                      callback('请输入中文、数字、英文');
                      return;
                    }
                    callback();
                  },
                }],
              })(
                <Input style={{ width: '200px', marginRight: '8px' }} />
                )}
              <span className="ant-form-text" style={{ color: '#ccc' }}> 30个字符以内</span>
            </FormItem>
            {
              this.state.address.map((item, i) => {
                return (<FormItem
                  label={`邮件地址${i + 1}`}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  key={i}>
                  {getFieldDecorator(`address[${i}]`, {
                    initialValue: item,
                    rules: [{ type: 'email', message: '邮件格式不正确' }, {
                      validator: (rule, value, callback) => {
                        let flag = false;
                        this.state.address.map((m, n) => {
                          if (n !== i && m == value) flag = true;
                        });
                        if (value && flag) {
                          callback('邮件地址不能重复');
                          return;
                        }
                        callback();
                      },
                    }],
                  })(
                    <Input
                      type="email"
                      style={{ width: '200px', marginRight: '8px' }}
                      maxLength="50"
                      onChange={(e) => {
                        let { address } = this.state
                        address[i] = e.target.value
                        this.setState({ address })
                      }} />
                    )}
                  <span className="ant-form-text">
                    <Icon type="plus-circle-o" style={{ margin: '0 4px', cursor: 'pointer' }} onClick={this.addRowEmail.bind(this)} />
                    {this.state.address.length > 1 ? (<Icon style={{ cursor: 'pointer' }} type="minus-circle-o" onClick={this.deleteRowEmail.bind(this, i)} />) : null}
                  </span>
                </FormItem>)
              })
            }
          </Form>
        </Modal>
      </div>
    )
  }
}
