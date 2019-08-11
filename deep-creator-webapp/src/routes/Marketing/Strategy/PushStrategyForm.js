import React, { PureComponent } from 'react';
import { Form, Checkbox, Input, Card, Button, Tag } from 'antd';
import uuid from 'uuid';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

import styles from './PushStrategyForm.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const Authorized = RenderAuthorized();

@Form.create()
export default class PushStrategyForm extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'marketing/strategy/fetchPushMembers',
      payload: {},
    })
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_clyx_tscl' },
    })
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.mailGroup = values.mailGroup ? values.mailGroup.join(',') : '';
        values.stratetyId = this.props.selectedRows.map(item => item.id.toString()).join(',')
        this.props.onSubmit(values);
      }
    })
  }

  handleCancel = () => {
    // this.props.form.resetForm();
    this.props.onCancel();
  }

  handelCloseTag = (record) => {
    this.props.onCloseTag(record);
  }

  handelCloseMember = (key) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const memberKeys = getFieldValue('mailGroup')
      .filter(_key => _key !== key);
    setFieldsValue({ mailGroup: memberKeys });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let { selectedRows, pushMembers, auths } = this.props;
    // const memberKeys = getFieldValue('mailGroup') || [];
    // const checkedMembers = pushMembers.filter(member => memberKeys.includes(member.id));
    return (
      <Card>
        <Form>
          <Card>
            <h4>推送对象</h4>
            <Authorized authority={() => auths.includes('yxcj_clyx_tscl_qyjk')}>
              <FormItem>
                {
                  getFieldDecorator('mailGroup', {})(
                    <CheckboxGroup>
                      {
                        pushMembers.map((member, index) => {
                          return (<Checkbox key={`channel_${index}`}
                            value={member.id}>
                            {member.mailGroupName}
                          </Checkbox>)
                        })
                      }
                    </CheckboxGroup>
                  )
                }
              </FormItem>
            </Authorized>
            <Authorized authority={() => auths.includes('yxcj_clyx_tscl_gxhtj')}>
              <FormItem>
                {
                  getFieldDecorator('rec', {
                    initialValue: 0,
                    normalize: value => (value ? 1 : 0),
                  })(
                    <Checkbox>系统-个性化推荐</Checkbox>
                  )
                }
              </FormItem>
            </Authorized>
            <Authorized authority={() => auths.includes('yxcj_clyx_tscl_yjz')}>
              <FormItem>{
                getFieldDecorator('mail', {})(
                  <Input placeholder={'邮件地址,多个邮件地址用","分隔'} />
                )
              }
              </FormItem>
            </Authorized>
          </Card>
          <h4>已选择:</h4>
          <FormItem label='策略内容'>
            {
              selectedRows.map((record) => {
                return (<Tag
                  closable
                  key={uuid.v1()}
                  onClose={this.handelCloseTag.bind(null, record)}>
                  {record.maketingName}
                </Tag>);
              })
            }
          </FormItem>
          <div>
            {/* <span>推送对象:</span>
            {
              checkedMembers.map((member) => {
                return (<Tag
                  closable
                  key={uuid.v1()}
                  onClose={this.handelCloseMember.bind(null, member.id)}>
                  {member.mailGroupName}</Tag>);
              })
            }
          */}
            <div className={styles.pushOperator}>
              <Button type='primary' onClick={this.handleSubmit}>确定推送</Button>
              <Button onClick={this.handleCancel}>取消</Button>
            </div>
          </div>
        </Form>
      </Card >
    );
  }
}
