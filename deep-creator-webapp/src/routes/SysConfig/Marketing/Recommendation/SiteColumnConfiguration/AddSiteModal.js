import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: { sm: { span: 6 } },
  wrapperCol: { sm: { span: 12 } },
}
@Form.create()
class AddSiteModal extends Component {
  componentWillReceiveProps(nextProps) {
    const { editSite } = nextProps;
    if (nextProps.visible && nextProps.visible !== this.props.visible) {
      if (!editSite) {
        this.props.dispatch({
          type: 'sysconfig/marketing/fetchAppKeys',
          payload: {},
        })
      }
    }
    if (editSite && editSite !== this.props.editSite) {
      this.props.dispatch({
        type: 'sysconfig/marketing/fetchSiteApps',
        payload: { siteId: editSite.id },
        callback: (appKeys) => {
          editSite.appKeys = appKeys.map((appKey) => {
            return { appkey: appKey.appKey, appkeyName: appKey.appKeyName }
          });
        },
      })
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { editSite, dispatch } = this.props;
        editSite ? // 编辑
          dispatch({
            type: 'sysconfig/marketing/editSite',
            payload: values,
            callback: () => {
              this.props.dispatch({
                type: 'sysconfig/marketing/fetchSites',
                payload: {},
              });
              this.props.onOk();
              this.props.form.resetFields();
            },
          }) :
          dispatch({
            type: 'sysconfig/marketing/addSite',
            payload: values,
            callback: () => {
              this.props.dispatch({
                type: 'sysconfig/marketing/fetchSites',
                payload: {},
              });
              this.props.onOk();
              this.props.form.resetFields();
            },
          });
      }
    })
  }

  handleCancel = () => {
    this.props.onCancel();
    this.props.form.resetFields();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let { editSite, appKeys = [] } = this.props;
    editSite = editSite || {};

    const _appKeys = editSite.appKeys ? editSite.appKeys : appKeys;

    return (
      <Modal
        maskClosable={false}
        {...this.props}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
      >
        <FormItem label='客户资源名称' {...formItemLayout}>
          {
            getFieldDecorator('siteName', {
              initialValue: editSite.siteName,
              rules: [
                { required: true, message: '必填字段' },
                { max: 20, message: '最长20个字符' }],
            })(<Input />)
          }
        </FormItem>
        <FormItem label='客户资源ID' {...formItemLayout}>
          {
            getFieldDecorator('siteId', {
              initialValue: editSite.siteId,
              rules: [{ required: true, message: '必填字段' }, {
                validator: (rule, value, callback) => {
                  const reg = /^[A-Za-z0-9]+$/;
                  if (!reg.test(value)) {
                    callback('请输入英文、数字');
                    return;
                  }
                  if (value && value.length > 20) {
                    callback('只能输入20个字符');
                    return;
                  }
                  callback();
                },
              }],
            })(<Input disabled={!!editSite.siteId} />)
          }
        </FormItem>
        <FormItem label='客户端' {...formItemLayout}>
          {
            getFieldDecorator('appKey', {
              initialValue: editSite.appKeys ?
                editSite.appKeys.map(key => key.appkey) : [],
              rules: [{ required: true, message: '必填字段' }],
            })(
              <Select placeholder='请选择'
                disabled={!!editSite.siteId}
                style={{ width: 200 }}
                mode='multiple'
                dropdownMatchSelectWidth={false}>
                {
                  _appKeys.map((appKey) => {
                    return (<Option
                      key={appKey.appkey}
                      value={appKey.appkey}>
                      {appKey.appkeyName}
                    </Option>)
                  })
                }
              </Select>)
          }
        </FormItem>
      </Modal>
    );
  }
}

AddSiteModal.propTypes = {

};

export default AddSiteModal;