import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select } from 'antd';
import { PROTECTED_FIELDS } from '../../../../../utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: { sm: { span: 6 } },
  wrapperCol: { sm: { span: 12 } },
}

@Form.create({
  onValuesChange: (props, { siteId }) => {
    if (siteId) {
      props.dispatch({
        type: 'sysconfig/marketing/fetchSiteAppKeys',
        payload: { siteId },
      });
    }
  },
})
class AddColumnModal extends Component {
  componentWillReceiveProps(nextProps) {
    const { editField } = nextProps;
    if (editField && editField !== this.props.editField) {
      const { form: { setFieldsValue } } = this.props;
      setFieldsValue({ siteId: editField.siteId, fieldId: editField.fieldId });
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { editField, dispatch, siteList } = this.props;
        const site = siteList.find(item => item.siteId === values.siteId) || {};
        const appKeys = site.appKeys || [];
        const { appKey } = values;
        values.appKeyName = appKeys.find(item => item.appKey === appKey).appKeyName;

        editField ? // 编辑
          dispatch({
            type: 'sysconfig/marketing/editField',
            payload: values,
            callback: () => {
              this.props.dispatch({
                type: 'sysconfig/marketing/fetchSites',
                payload: {},
              });
              this.props.form.resetFields();
              this.props.onOk();
            },
          }) :
          dispatch({
            type: 'sysconfig/marketing/addField',
            payload: values,
            callback: () => {
              this.props.dispatch({
                type: 'sysconfig/marketing/fetchSites',
                payload: {},
              });
              this.props.form.resetFields();
              this.props.onOk();
            },
          });
      }
    })
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    let { editField, siteList, loading } = this.props;
    const createLoading = loading.effects['sysconfig/marketing/addField'];
    getFieldDecorator('fieldId');

    editField = editField || {};
    const siteId = getFieldValue('siteId');

    const filteredSiteList = siteList.filter(_site => !PROTECTED_FIELDS.siteId.includes(_site.siteId))
    const site = siteList.find(item => item.siteId === siteId) || {};
    const appKeys = site.appKeys || [];

    return (
      <Modal
        maskClosable={false}
        {...this.props}
        onOk={this.handleOk}
        confirmLoading={createLoading}
      >
        <Form>
          <FormItem label='客户资源名称' {...formItemLayout}>
            {
              getFieldDecorator('siteId', {
                initialValue: editField.siteId,
                rules: [{ required: true, message: '必填字段' }],
              })(<Select placeholder='请选择' style={{ width: 200 }}>
                {
                  filteredSiteList.map((_site, index) => {
                    return (
                      <Option
                        key={`site_${index}`}
                        title={_site.siteName}
                        value={_site.siteId}
                      >
                        {_site.siteName}
                      </Option>
                    )
                  })
                }
              </Select>)
            }
          </FormItem>
          <FormItem label='客户端' {...formItemLayout}>
            {
              getFieldDecorator('appKey', {
                initialValue: editField.appKey,
                rules: [{ required: true, message: '必填字段' }],
              })(
                <Select placeholder='请选择' style={{ width: 200 }}>
                  {
                    appKeys.map((appKey) => {
                      return <Option key={appKey.appKey} value={appKey.appKey}>{appKey.appKeyName}</Option>
                    })
                  }
                </Select>)
            }
          </FormItem>
          <FormItem label='栏位名称' {...formItemLayout}>
            {
              getFieldDecorator('fieldName', {
                initialValue: editField.fieldName,
                rules: [
                  { required: true, message: '必填字段' },
                  { max: 20, message: '最长为20个字符' }],
              })(<Input />)
            }
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

AddColumnModal.propTypes = {

};

export default AddColumnModal;