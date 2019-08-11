import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Button, Input, Icon, Checkbox, Table, Modal, Form, Pagination, Popconfirm, Popover } from 'antd'
import { formatMoment } from '../../../utils'
import styles from './index.less'

const FormItem = Form.Item;

@Form.create()
@connect(state => ({
  personalcenter: state['userconfig/personalcenter']
}))
export default class Email extends React.Component {
  state = {
    address: [''],
    emailModal: false,
    shortMessageGroupName: '',
    isAdd: true
  }

  node = null;

  componentDidMount() {
    this.init({ pageNum: 1, pageSize: 10 });
  }

  init(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'userconfig/personalcenter/queryPhone',
      payload: { ...params }
    })
  }

  onChange(pageNum, pageSize) {
    this.init({ pageNum, pageSize });
  }

  phoneColumns = [{
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    render: (text, record, index) => {
      const { phoneData } = this.props.personalcenter;
      return (phoneData.pageNum - 1) * phoneData.pageSize + index + 1
    }
  }, {
    title: '短信组名称',
    dataIndex: 'shortMessageGroupName',
    key: 'shortMessageGroupName',
  }, {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    render: text => formatMoment(text)
  }, {
    title: '操作',
    key: 'action',
    render: (text, record) => {
      const list = record.phones && record.phones.split(',');
      const content = list.length > 0 && list.map((item, i) => {
        return <div style={{ float: 'left', width: '200px', textAlign: 'left' }} key={i}>{item}</div>
      });
      return (
        <span>
          <Popover
            content={<div style={{ width: '400px' }}>{content||'暂无'}<div style={{ clear: 'both' }}></div></div>}
            title="组内手机号"
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


  addEmail() {
    this.node = null;
    this.setState({
      emailModal: true,
      address: [''],
      shortMessageGroupName: '',
      isAdd: true
    });
  }
  
  edit(item){
    this.node = item;
    this.setState({
      emailModal: true,
      address: item.phones.split(','),
      shortMessageGroupName: item.shortMessageGroupName,
      isAdd: false
    })
  }

  del(item){
    this.props.dispatch({
      type: 'userconfig/personalcenter/delPhoneGroup',
      payload: {
        id: item.id
      },
      callback: () => {
        this.init({ pageNum: 1, pageSize: 10 });
      }
    })
  }

  handleEmailOk() {
    this.props.form.validateFields((err, values) => {
      let arr = [];
      values.address && values.address.length > 0 && values.address.map((m, n) => {
        if (m) arr.push(m);
      });
      if (!err) {
        //console.log('Received values of form: ', values);
        if (this.state.isAdd) { // add
          this.props.dispatch({
            type: 'userconfig/personalcenter/addPhoneGroup',
            payload: {
              shortMessageGroupName: values.email,
              phones: arr.join(',')
            },
            callback: () => {
              this.handleEmailCancel();
              this.init({ pageNum: 1, pageSize: 10 });
            }
          });
        }else{ // edit
          this.props.dispatch({
            type: 'userconfig/personalcenter/editPhoneGroup',
            payload: {
              id: this.node.id,
              nameIsChange: values.email !== this.node.shortMessageGroupName,
              shortMessageGroupName: values.email,
              phones: arr.join(',')
            },
            callback: () => {
              this.handleEmailCancel();
              this.init({ pageNum: 1, pageSize: 10 });
            }
          })
        }
      }
    });
  }

  handleEmailCancel() {
    this.props.form.resetFields();
    this.setState({ emailModal: false });
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
    let { address } = this.state
    address.splice(index, 1)
    this.setState({ address })
    this.props.form.setFieldsValue({ address })
  }


  render() {
    const { address } = this.state
    const { getFieldDecorator } = this.props.form;
    const { phoneData } = this.props.personalcenter;
    return (
      <div className={styles.box}>
        <div className={styles.add}>
          <Button type="primary" onClick={::this.addEmail}>新增短信组</Button>
        </div>
        {
          phoneData && phoneData.list && phoneData.list.length > 0 ? (
            <div>
              <Table columns={this.phoneColumns} dataSource={phoneData.list} pagination={false} rowKey={(record, index) => index} />
              <Pagination className={styles.pager}
                current={phoneData.pageNum}
                total={phoneData.total}
                onChange={::this.onChange}
                pageSize = {phoneData.pageSize} />
            </div>
          ) : (<Table columns={this.phoneColumns} dataSource={[]} pagination={false} rowKey={(record, index) => index} />)
        }
        <Modal title={this.state.isAdd ? '新增短信组' :'编辑短信组'} 
          visible={this.state.emailModal}
          onOk={::this.handleEmailOk}
          onCancel= {::this.handleEmailCancel} >
          <Form className="login-form">
            <FormItem
              label="短信组名称"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              {getFieldDecorator('email', {
                initialValue: this.state.shortMessageGroupName,
                rules: [{ required: true, message: '请输入短信组名称' },{
                  validator: (rule, value, callback) => {
                    if (value.indexOf(' ') != -1) {
                      callback('短信组名称不能有空格');
                      return;
                    }
                    if (value.length>30) {
                      callback('短信组名称不能超过30个字符');
                      return;
                    }
                    const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
                    if (!reg.test(value)) {
                      callback('请输入中文、数字、英文');
                      return;
                    }
                    callback();
                  }
                }],
              })(
                <Input style={{ width: '200px', marginRight: '8px' }}/>
                )}
              <span className="ant-form-text" style={{ color: '#ccc' }}> 30个字符以内</span>
            </FormItem>
            {
              this.state.address.map((item, i) => {
                return (<FormItem
                  label={`手机号${i + 1}`}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                  key={i}>
                  {getFieldDecorator(`address[${i}]`, {
                    initialValue: item,
                    rules: [{
                      validator: (rule, value, callback) => {
                        if (value && !(/^1[0-9]\d{4,9}$/.test(value))) {
                          callback('手机号格式不正确');
                          return;
                        } 
                        if (value && value.length<11){
                          callback('手机号位数不够11');
                          return;
                        }
                        let flag = false;
                        this.state.address.map((m, n) => {
                          if (n !== i && m == value) flag = true;
                        });
                        if (value && flag) {
                          callback('手机号不能重复');
                          return;
                        }
                        callback();
                      }
                    }],
                  })(
                    <Input style={{ width: '200px', marginRight: '8px' }}
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
