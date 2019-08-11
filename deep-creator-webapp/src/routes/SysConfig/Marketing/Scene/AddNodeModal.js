import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Checkbox, Col, Button, Tag, Select, Popconfirm, message } from 'antd';

import AddAutomationModal from '../../../Marketing/Automation/AddAutomationModal';
import AddGroupModal from './AddGroupModal';
import AddFunnelModal from './AddFunnelModal';
import CreateEventsHtml from './CreateEventsHtml';
import cloneDeep from 'lodash/cloneDeep';
import uuid from 'uuid';


import styles from './index.less'
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

const uuidv4 = uuid.v4;
const FormItem = Form.Item;
const Authorized = RenderAuthorized();

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}

@Form.create()
class AddNodeModal extends Component {
  state = {
    showModal: null,
    entityId: null,
    conditionJson: {}, // 群组的JSON数据
    conditionCn: {}, // 群组的中文数据
    isResetTagPickerForm: false, // 是否要重置TagPicker的表单值
    isCopyHandle: false, // 是否在进行编辑操作
    keyEvents: [],
    // tagpickerTabKeys: [], // tagpicker组件的页签列表
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'xtgl_yxpz_jdyx_cj' },
    })
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'xtgl_yxpz_jdyx_cj_yxdz' },
    })
  }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { dispatch, data } = this.props;
        if (data) {
          let params = values;
          params.bizLifeInfo.groupId = data.bizLifeInfo.groupId;
          params.bizLifeInfo.id = data.bizLifeInfo.id;
          dispatch({
            type: 'sysconfig/marketing/updateLifeNode',
            payload: params,
            callback: () => {
              this.props.onCancel();
            },
          })
        } else {
          dispatch({
            type: 'sysconfig/marketing/addLifeNode',
            payload: values,
            callback: () => {
              this.props.onCancel();
            },
          })
        }
      }
    })
  }

  // getTagpickerTabKeyAuth = (dispatch) => {
  //   dispatch({
  //     type: 'user/fetchAuths',
  //     payload: { parentKey: 'xtgl_yxpz_jdyx_cj_bjgz' },
  //     callback: (data) => {
  //       console.log('tagpicker-----生命旅程--------标签/定制化标签/线上行为-------权限----', data);
  //       if (!data) data = [];
  //       const tagpickerTabKeys = [];
  //       if (data.includes('xtgl_yxpz_jdyx_cj_bjgz_yhbq')) {
  //         tagpickerTabKeys.push('UserTag');
  //       }
  //       if (data.includes('xtgl_yxpz_jdyx_cj_bjgz_xsxw')) {
  //         tagpickerTabKeys.push('CustomTag');
  //       }
  //       if (data.includes('xtgl_yxpz_jdyx_cj_bjgz_dzhbq')) {
  //         tagpickerTabKeys.push('OnlineBehavior');
  //       }
  //       this.setState({
  //         tagpickerTabKeys,
  //       })
  //     },
  //   })
  // }


  handleToggleModal = (model) => {
    const { dispatch, data } = this.props;
    let { isResetTagPickerForm, isCopyHandle } = this.state;
    if (model === null) {
      isResetTagPickerForm = false;
      isCopyHandle = false;
    }
    this.setState({
      showModal: model,
      isResetTagPickerForm,
      isCopyHandle,
    }, () => {
      if (model === 'groupModal') {
        // this.getTagpickerTabKeyAuth(dispatch);

        if (data) { //   data存在 编辑
          let [bizLifeInfo, conditonDesc] = [null, null];
          bizLifeInfo = data.bizLifeInfo || {};
          if (bizLifeInfo) {
            conditonDesc = JSON.parse(bizLifeInfo.conditonDesc) || {};
          }
          this.setState({
            curEditGroup: bizLifeInfo,
            isCopyHandle: true,
          }, () => {
            const {
              conditionList = [{
              id: uuidv4(),
              UserTag: {},
              CustomTag: {},
              OnlineBehavior: {},
              relation: 'and',
            }],
              relationDesc = '或',
            } = conditonDesc;
            dispatch({
              type: 'tagPicker/changeConditionList',
              payload: {
                conditionList,
                outsideRelation: relationDesc === '且' ? 'and' : 'or',
              },
            })
          })
        } else { // data不存在 新建
          this.setState({
            isResetTagPickerForm: true,
            isCopyHandle: false,
          }, () => {
            dispatch({
              type: 'tagPicker/resetConditionList',
            })
          })
        }
      }
    });
  }

  delFunnel(item) {
    let bizFunnelVOList = cloneDeep(this.props.form.getFieldsValue().bizFunnelVOList) || []
    if (item.hasOwnProperty('isDelete')) {
      bizFunnelVOList && bizFunnelVOList.length > 0 && bizFunnelVOList.map((m, n) => {
        if (m.id === item.id) m.isDelete = 1;
      });
    } else {
      let index = -1;
      bizFunnelVOList && bizFunnelVOList.length > 0 && bizFunnelVOList.map((m, n) => {
        if (JSON.stringify(m) == JSON.stringify(item)) index = n;
      });
      if (index > -1) {
        bizFunnelVOList.splice(index, 1);
      }
    }
    this.props.form.setFieldsValue({ bizFunnelVOList: bizFunnelVOList.slice(0) });
  }

  delMarketing(item) {
    let bizAutoMarketingPOLists = cloneDeep(this.props.form.getFieldsValue().bizAutoMarketingPOLists) || []
    if (item.hasOwnProperty('isDelete')) {
      bizAutoMarketingPOLists && bizAutoMarketingPOLists.length > 0 && bizAutoMarketingPOLists.map((m, n) => {
        if (m.id === item.id) m.isDelete = 1;
      });
    } else {
      let index = -1;
      bizAutoMarketingPOLists && bizAutoMarketingPOLists.length > 0 && bizAutoMarketingPOLists.map((m, n) => {
        if (JSON.stringify(m) === JSON.stringify(item)) index = n;
      });
      if (index > -1) {
        bizAutoMarketingPOLists.splice(index, 1);
      }
    }
    this.props.form.setFieldsValue({ bizAutoMarketingPOLists: bizAutoMarketingPOLists.slice(0) });
  }

  handleChangeEntityId = (entityId) => {
    this.setState({
      entityId,
    })
  }

  handleGroupData = (finalResult, finalResultDesc) => {
    const { form: { getFieldsValue, setFieldsValue } } = this.props;
    const { bizLifeInfo } = getFieldsValue();
    setFieldsValue({
      bizLifeInfo: {
        ...bizLifeInfo,
        conditionJson: JSON.stringify(finalResult),
        conditonDesc: JSON.stringify(finalResultDesc),
      },
    });
    this.setState({
      isCopyHandle: false,
    })
    this.handleKeyEvents(finalResultDesc);
  }

  handleKeyEvents = (finalResultDesc) => {
    const { conditionsDesc = [] } = finalResultDesc;
    const keyEvents = conditionsDesc.map((item) => {
      return {
        onlineActionDesc: item.onlineActionDesc,
        innerRelation: item.relationDesc,
      }
    })
    this.setState({
      keyEvents,
      isResetTagPickerForm: false,
    }, () => {
      this.handleToggleModal(null);
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      const { getFieldDecorator, setFieldsValue } = nextProps.form;
      const { data } = nextProps;
      setFieldsValue({ bizFunnelVOList: (data && data.bizFunnelVOList) || [] });
      setFieldsValue({ bizAutoMarketingPOLists: (data && data.bizAutoMarketingPOLists || []) });
      setFieldsValue({ 'bizLifeInfo.nodeName': (data && data.bizLifeInfo.nodeName) || '' });
      setFieldsValue({ 'bizLifeInfo.entityId': (data && data.bizLifeInfo.entityId) || '' });
      let keyEvents = [];
      if (data) { // 处理编辑时群组的 关键时刻 展示
        let [bizLifeInfo, conditonDesc] = [null, null];
        bizLifeInfo = data.bizLifeInfo || {};
        if (bizLifeInfo) {
          conditonDesc = JSON.parse(bizLifeInfo.conditonDesc) || {};
        }
        const conditionsDesc = conditonDesc.conditionsDesc || [];
        keyEvents = conditionsDesc.map((item) => {
          return {
            onlineActionDesc: item.onlineActionDesc,
            innerRelation: item.relationDesc,
          }
        })
        this.setState({
          keyEvents,
        })
      } else {
        this.setState({
          keyEvents,
        })
      }
    }
  }


  render() {
    const { getFieldDecorator, setFieldsValue, getFieldsValue } = this.props.form;
    const { bizLifeInfo = {} } = getFieldsValue();
    const { marketingOp, dispatch, entityList, conditionList, outsideRelation = 'or', auths } = this.props;
    const { showModal, funnelList, entityId, keyEvents, curEditGroup, isResetTagPickerForm, isCopyHandle, tagpickerTabKeys } = this.state;
    const userEntityList = entityList.filter((item) => {
      return item.entityCategory === 0;
    })
    const userEntityinitialId = userEntityList.length ? userEntityList[0].id : '';

    const autoModalProps = {
      visible: showModal === 'autoModal',
      dispatch: this.props.dispatch,
      onOk: (values) => {
        const { bizAutoMarketingPOLists } = getFieldsValue();
        bizAutoMarketingPOLists.push(values);
        setFieldsValue({ bizAutoMarketingPOLists: bizAutoMarketingPOLists.slice(0) });
        this.setState({ showModal: null });
      },
      onCancel: () => this.handleToggleModal(null),
      isLife: true,
      auths,
    }

    const groupModalProps = {
      dispatch,
      conditionList,
      outsideRelation,
      curEditGroup,
      isResetTagPickerForm,
      isCopyHandle,
      entityId: entityId || userEntityinitialId,
      tagpickerTabKeys,
      visible: showModal === 'groupModal',
      onCancel: () => this.handleToggleModal(null),
      handleGroupData: this.handleGroupData,
    }

    const funnelModalProps = {
      title: '漏斗',
      visible: showModal === 'funnelModal',
      onCancel: () => this.handleToggleModal(null),
      onChange: (data) => {
        let { bizFunnelVOList } = getFieldsValue() || [];
        bizFunnelVOList.push(data);
        setFieldsValue({ bizFunnelVOList: bizFunnelVOList.slice(0) });
      },
      auths,
    }

    const data = cloneDeep(this.props.data) || null;

    // 初始化
    getFieldDecorator('bizLifeInfo.conditionJson', { initialValue: '' }) // 用户群
    getFieldDecorator('bizLifeInfo.conditonDesc', { initialValue: '' }) // 用户群
    getFieldDecorator('bizFunnelVOList', { initialValue: (data && data.bizFunnelVOList) || [] }) // 漏斗
    getFieldDecorator('bizAutoMarketingPOLists', { initialValue: (data && data.bizAutoMarketingPOLists || []) }) // 决策树

    let maketingCounts = 0;
    getFieldsValue() &&
      getFieldsValue().bizAutoMarketingPOLists &&
      getFieldsValue().bizAutoMarketingPOLists.length > 0 &&
      getFieldsValue().bizAutoMarketingPOLists.map((item, i) => {
        if (!item.isDelete) {
          maketingCounts += 1;
        }
      })

    return (
      <Modal
        {...this.props}
        maskClosable={false}
        height='80%'
        width='80%'
        title='创建生命旅程节点'
        onOk={this.onOk}
        className={styles.addNode}
      >
        <Form>
          <AddAutomationModal {...autoModalProps} />
          <AddGroupModal {...groupModalProps} />
          <AddFunnelModal {...funnelModalProps} />

          <FormItem
            {...formItemLayout}
            label='节点名称:'>{
              getFieldDecorator('bizLifeInfo.nodeName', {
                initialValue: (data && data.bizLifeInfo.nodeName) || '',
                rules: [{ required: true, message: '必填字段' }, {
                  validator: (rule, value, callback) => {
                    if (value.length > 10) {
                      callback('节点名称不能超过10个字符');
                      return;
                    }
                    callback();
                  },
                }],
              })(
                <Input style={{ width: 300 }} />
                )
            }
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='用户群:'
          >
            {
              getFieldDecorator('bizLifeInfo.entityId', {
                initialValue: (data && data.bizLifeInfo.entityId) || '',
                rules: [{ required: true, message: '必填字段' }],
              })(<Select
                disabled={!!data}
                placeholder='请选择用户实体'
                style={{ width: 300, marginRight: 10 }}>
                {userEntityList.map(entity => <Select.Option value={entity.id} key={entity.id}>{entity.entityName}</Select.Option>)}
              </Select>
                )
            }
            <Authorized authority={() => auths.includes('xtgl_yxpz_jdyx_cj_bjgz')}>
              {bizLifeInfo && bizLifeInfo.entityId ? <Button disabled={!!data} onClick={this.handleToggleModal.bind(this, 'groupModal')}>编辑规则</Button> : null}
            </Authorized>
          </FormItem>

          <FormItem {...formItemLayout} label='关键时刻:'>
            <div style={{ minHeight: 20 }}>
              <CreateEventsHtml keyEvents={keyEvents} outsideRelation={outsideRelation} />
            </div>
          </FormItem>

        </Form>
        <Authorized authority={() => auths.includes('xtgl_yxpz_jdyx_cj_yxdz')}>
          <div className={styles.title}>营销动作</div>
          <Authorized authority={() => auths.includes('xtgl_yxpz_jdyx_cj_yxdz_ld')}>
            <div className={styles.box}>
              <label className={styles.name}>实时行为漏斗:</label>
              {
                getFieldsValue() &&
                getFieldsValue().bizFunnelVOList &&
                getFieldsValue().bizFunnelVOList.length > 0 &&
                getFieldsValue().bizFunnelVOList.map((item, i) => {
                  if (!item.isDelete) {
                    return (<Popconfirm title="确认删除吗?" okText="确定" cancelText="取消" key={i} onConfirm={() => this.delFunnel(item)} >
                      <Tag closable onClose={e => e.preventDefault()}>{item.funnelName}</Tag>
                    </Popconfirm>)
                  }
                }
                )
              }
              <Button size="small"
                style={{ display: 'block', marginTop: '10px' }}
                onClick={this.handleToggleModal.bind(this, 'funnelModal')}>新增</Button>
            </div>
          </Authorized>
          <Authorized authority={() => auths.includes('xtgl_yxpz_jdyx_cj_yxdz_zdhyx')}>
            <div className={styles.box} style={{ marginTop: '20px' }}>
              <label className={styles.name}>自动化营销:</label>

              {
                getFieldsValue() &&
                getFieldsValue().bizAutoMarketingPOLists &&
                getFieldsValue().bizAutoMarketingPOLists.length > 0 &&
                getFieldsValue().bizAutoMarketingPOLists.map((item, i) => {
                  if (!item.isDelete) {
                    return (<Popconfirm title="确认删除吗?" okText="确定" cancelText="取消" key={i} onConfirm={() => this.delMarketing(item)} >
                      <Tag closable onClose={e => e.preventDefault()}>{item.maketingName}</Tag>
                    </Popconfirm>)
                  }
                })
              }
              <Button size="small"
                disabled={!(maketingCounts < 5)}
                style={{ display: 'block', marginTop: '10px' }}
                onClick={this.handleToggleModal.bind(this, 'autoModal')}>新增</Button>
            </div>
          </Authorized>
        </Authorized>
      </Modal>
    );
  }
}

AddNodeModal.propTypes = {

};

export default AddNodeModal;