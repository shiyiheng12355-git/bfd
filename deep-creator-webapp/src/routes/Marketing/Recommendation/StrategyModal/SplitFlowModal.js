import React, { Component, PropTypes } from 'react';
import {
  Form, Input, Select, Radio,
  Icon, InputNumber,
  Col, Modal, TreeSelect, Alert,
} from 'antd';
import uuid from 'uuid';
import _ from 'lodash';
import classnames from 'classnames';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import { arrayToTree } from '../../../../utils/utils';
import styles from './SplitFlowModal.less';

const FormItem = Form.Item;
const { Option } = Select;
const Authorized = RenderAuthorized()
const { SHOW_CHILD } = TreeSelect;

const RadioGroup = Radio.Group;

const defaultTagEnglish = JSON.stringify({ tag: [{ value: { tagEnglish: 'default', tagValue: 'default' } }] })

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
@Form.create({
  onValuesChange: (props, values) => {
    let { shuntUser } = values;
    if (shuntUser) {
      shuntUser = parseInt(shuntUser, 10)
      props.dispatch({
        type: 'marketing/recommendation/fetchEntityTags',
        payload: { entityId: shuntUser },
      })
      props.dispatch({
        type: 'marketing/recommendation/updateState',
        payload: { currentEntityId: shuntUser },
      })
    }
  },
})
class SplitFlowModal extends Component {
  state = {
    showWarn: false,
  }

  initData = () => { // 根据传入的值初始化表单
    let { node: { value }, form: { setFieldsValue, getFieldDecorator } } = this.props;
    value = value || {};
    const { policyList = [] } = value;
    const flowtype = policyList.length ? (policyList[0].type === 0 ? 'abflow' : 'tagflow') : 'abflow';
    this.flowtype = flowtype;// 保存原来的分流类型
    let shuntUser = policyList.length ? policyList[0].shuntUser : undefined;
    const branches = {};
    policyList.map((policy) => { branches[uuid.v1()] = policy });
    const data = {
      flowtype,
    }
    if (Object.keys(branches).length === 0) branches[uuid.v1()] = {};
    const keys = Object.keys(branches);
    data[flowtype] = { branches }

    this.data = data;
    getFieldDecorator('keys');
    getFieldDecorator('shuntUser');
    getFieldDecorator('flowtype');
    setFieldsValue({ keys, shuntUser, flowtype }); // 初始化表单
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_gxhtj_bj_fl' },
    })
    this.initData();
    this.props.dispatch({
      type: 'marketing/recommendation/fetchUserEntityList',
      payload: {},
    });
  }

  handleChangeFlowType = (e) => {
    const flowtype = e.target.value;
    const { form: { setFieldsValue } } = this.props;
    if (this.flowtype === flowtype) {
      this.initData();
    } else {
      // DO NOTHING
      // setFieldsValue({ keys: [uuid.v1()] }); // 重置表单
    }
    if (flowtype === 'tagflow') {
      this.setState({ showWarn: false })
    }
  }
  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { node: { value } } = this.props;
        value = value || {};
        let { flowtype, shuntUser } = values;
        const { branches = [] } = values[flowtype];
        const type = flowtype === 'tagflow' ? 1 : 0;
        shuntUser = flowtype === 'tagflow' ? shuntUser : '';
        let policyList = Object.values(branches).map((branch) => {
          const policy = { fieldId: value.fieldId, ...branch };
          if (flowtype === 'tagflow') {
            const tag = (branch.tag || []).map((t) => {
              return { ...t, value: JSON.parse(t.value) }
            })
            delete policy.tag;
            return {
              ...policy,
              shuntUser,
              type,
              tagValue: '',
              tagEnglish: JSON.stringify({ tag }),
            };
          } else {
            return {
              ...policy,
              shuntRate: branch.shuntRate / 100.0,
              type,
              shuntUser,
              tagValue: '',
              tagEnglish: '',
            };
          }
        });
        const cachedPolicyList = value.policyList || [];
        if (flowtype === 'tagflow') {
          const defaultItem = cachedPolicyList
            .find(p => p.tagEnglish === defaultTagEnglish || p.policyName === '默认分支') || {};

          // 先前的分支中已经有默认分支的配置,将复用这个配置的ID
          policyList.push({ // 添加一个名为默认分支的策略
            fieldId: value.fieldId,
            id: defaultItem.id,
            type,
            shuntUser,
            tagValue: '',
            tagEnglish: defaultTagEnglish,
            policyName: '默认分支',
          })
        }

        this.props.dispatch({
          type: 'marketing/recommendation/savePolicys',
          payload: { param: policyList.filter(item => !!item.policyName) }, // 过滤掉policyName为空的数据
          callback: (err, _branches) => {
            this.props.onOk({
              policyList: _branches.map((b) => {
                return { ...b, type, shuntUser }; // 合并数据
              }), // 奇怪的事情。接口返回没有type字段
            })
          },
        })
      }
    });
  }

  handleChangeItem = (key, type) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('keys');

    const index = _.indexOf(keys, key);
    if (index < 0) { return }

    switch (type) {
      case 'add': {
        keys.splice(index + 1, 0, uuid.v1());
        setFieldsValue({ keys: keys.slice(0) });
        this.setState({ showWarn: true }) // 添加时必然会出发异常提示
        break;
      }
      case 'delete': {
        if (keys.length <= 1) return;
        keys.splice(index, 1);
        setFieldsValue({ keys: keys.slice(0) });
        this.shuntRateMsg(); // 是否展示分流和异常提示
        break;
      }
      default:
        break;
    }
  }

  shuntRateValidator = (rule, value, callback) => {
    if (value === '' || value === undefined) return callback('必填字段')
    if (!_.isNumber(value)) return callback('应该为整数');
    if (value > 100 || value < 10) return callback('10~100整数');
    this.shuntRateMsg(); // 是否展示分流和异常提示
    callback();
  }

  shuntRateMsg = () => {
    const values = this.props.form.getFieldsValue();
    const { flowtype, keys } = values;
    if (flowtype === 'abflow') {
      if (!values[flowtype]) return;
      const { branches } = values[flowtype];
      if (!branches) return;
      this.sum = 0;
      Object.values(_.pick(branches, keys)).map((branch) => {
        this.sum += branch.shuntRate;
      });
      this.setState({ showWarn: this.sum !== 100 });
    }
  }

  parseTreeData = () => {
    let { entityTags } = this.props;
    entityTags = entityTags || [];
    return entityTags.map((tag) => {
      let fid; let fpid; let label; let key; let isLeaf = false; let value;
      let nodeClass = classnames({
        [styles.hiddenCheck]: true,
      })
      if (tag.categoryEnglishName) { // 标签分类
        fid = tag.categoryEnglishName;
        fpid = tag.parentCategoryEnglishName;
        label = tag.categoryName;
        key = `TAGCATE_${fid}`;
        value = fid;
      } else if (tag.tagCategoryEnglishName && tag.tagEnglishName) { // 标签名
        fid = tag.tagEnglishName;
        fpid = tag.tagCategoryEnglishName;
        label = tag.tagName;
        key = `TAGNAME_${fid}`;
        value = fid;
      } else if (tag.tagEnglishName && tag.tagEnglishValueTitle) { // 标签值
        fid = tag.tagEnglishValueTitle;
        fpid = tag.tagEnglishName;
        label = tag.tagValueTitle;
        key = `TAGVALUE_${fid}`;
        value = JSON.stringify({ tagEnglish: fpid, tagValue: tag.tagEnglishValueTitle }) // 必须为字符串
        isLeaf = true;
        nodeClass = classnames({
          [styles.hiddenCheck]: false,
          [styles.showCheck]: true,
        })
      }
      return {
        label,
        key,
        value,
        fid,
        fpid,
        isLeaf,
        ...tag,
        className: nodeClass,
      }
    });
  }

  render() {
    let { form: { getFieldDecorator, getFieldsValue }, auths,
      userEntityList = [] } = this.props;
    getFieldDecorator('keys', { initialValue: [] });
    const { keys, flowtype, shuntUser } = getFieldsValue();
    let treeData = [];
    if (flowtype === 'tagflow' && shuntUser) { // 标签分流时
      treeData = this.parseTreeData();
    }
    const tProps = {
      treeData: arrayToTree(treeData, 'fid', 'fpid'),
      treeCheckable: true,
      showCheckedStrategy: SHOW_CHILD,
      searchPlaceholder: '请选择标签',
      treeCheckStrictly: true,
      labelInValue: true,
      dropdownClassName: styles.treeDropdown,
      style: {
        width: 240,
      },
    };

    const data = this.data || {};

    const branchItems = keys.map((key, index) => {
      const num = index + 1;
      const { branches = {} } = data[data.flowtype];
      const branch = branches[key] || {};
      let tagEnglish;
      if (flowtype === 'abflow') {
        getFieldDecorator(`abflow.branches[${key}].type`, { initialValue: 0 });
        getFieldDecorator(`abflow.branches[${key}].id`, { initialValue: branch.id })
      } else {
        getFieldDecorator(`tagflow.branches[${key}].type`, { initialValue: 1 })
        getFieldDecorator(`tagflow.branches[${key}].id`, { initialValue: branch.id });
        if (branch.tagEnglish === defaultTagEnglish) { //
          return false; // 默认分支 不展示任何内容
        }
        const tagEnglishJson = branch.tagEnglish ? JSON.parse(branch.tagEnglish).tag : []; // 别扭的数据结构
        tagEnglish = tagEnglishJson.map((tag) => {
          return {
            ...tag, value: JSON.stringify(tag.value),
          }
        })
      }
      return (
        <div key={key}>
          {
            flowtype === 'abflow' &&
            <FormItem
              {...formItemLayout}
              style={{ marginBottom: 15 }}
              label={`分流${num}`}
            >
              <Col span={10}>
                <FormItem>
                  {
                    getFieldDecorator(`abflow.branches[${key}].policyName`, {
                      initialValue: branch.policyName,
                      rules: [{ required: true, message: '必填字段' }, {
                        max: 20, message: '最长不超过20个字符',
                      }, {
                        pattern: /^[-_.A-Za-z0-9\u4e00-\u9fa5]+$/,
                        message: '只能输入中文、英文、数字、-、_、.',
                      }],
                    })(<Input placeholder='请输入策略名称' />)
                  }
                </FormItem>
              </Col>
              <Col span={14}>
                <FormItem style={{ display: 'inline-block' }}>
                  {
                    getFieldDecorator(`abflow.branches[${key}].shuntRate`, {
                      initialValue: branch.shuntRate ? branch.shuntRate * 100 : 100,
                      rules: [{ validator: this.shuntRateValidator }],
                    })(
                      <InputNumber
                        style={{ width: '60px' }}
                        min={10}
                        max={100}
                        step={10}
                      />)
                  }％
                </FormItem>
                <span style={{ marginLeft: '8px' }}>
                  <Icon type='plus-circle-o' onClick={this.handleChangeItem.bind(this, key, 'add')} />
                  <Icon type='minus-circle-o' onClick={this.handleChangeItem.bind(this, key, 'delete')} />
                </span>
              </Col>
            </FormItem>
          }

          {
            flowtype === 'tagflow' &&
            <FormItem
              {...formItemLayout}
              label={`分流标签值${num}`}
            >
              <Col span={7}>
                <FormItem>
                  {
                    getFieldDecorator(`tagflow.branches[${key}].policyName`, {
                      initialValue: branch.policyName,
                      rules: [{ requreid: true, message: '必填字段' }, {
                        max: 20, message: '最长不超过20个字符',
                      }, {
                        pattern: /^[-_.A-Za-z0-9\u4e00-\u9fa5]+$/,
                        message: '只能输入中文、英文、数字、-、_、.',
                      }, {
                        validator: (r, value, callback) => {
                          if (value === '默认分支') return callback('默认分支是系统保留策略，不允许自定义创建');
                          return callback();
                        },
                      }],
                    })(<Input placeholder='请输入策略名称' />)
                  }
                </FormItem>
              </Col>
              <Col span={17}>
                <FormItem style={{ display: 'inline-block' }}>
                  {
                    getFieldDecorator(`tagflow.branches[${key}].tag`, {
                      initialValue: tagEnglish,
                    })(<TreeSelect
                      {...tProps}
                      dropdownStyle={{ maxHeight: '160px', overflow: 'auto' }} />)
                  }
                </FormItem>
                <span style={{ marginLeft: '8px' }}>
                  <Icon type='plus-circle-o' onClick={this.handleChangeItem.bind(this, key, 'add')} />
                  <Icon type='minus-circle-o' onClick={this.handleChangeItem.bind(this, key, 'delete')} />
                </span>
              </Col>
            </FormItem>
          }
        </div>)
    });

    return (
      <Modal
        // title='设置分流'
        maskClosable={false}
        {...this.props}
        onOk={this.onOk}
      >
        <Form style={{ maxHeight: 300, overflow: 'auto' }}>
          <FormItem
            {...formItemLayout}
            style={{ marginBottom: 5 }}
            label="分流方式"
          >
            {
              getFieldDecorator('flowtype', {
              })(
                <RadioGroup onChange={this.handleChangeFlowType}>
                  <Radio value='abflow'>AB分流</Radio>
                  {
                    Authorized.check(() => { return auths.includes('yxcj_gxhtj_bj_fl_jybq') }, <Radio value='tagflow'>基于标签</Radio>)
                  }
                </RadioGroup>
              )
            }
          </FormItem>
          {
            flowtype === 'abflow' &&
            getFieldDecorator('abflow.flowtype', {
              initialValue: 'gid',
            })
          }
          {
            flowtype !== 'abflow' &&
            <FormItem
              label='分流用户实体'
              labelCol={{ span: 4 }}
              style={{ marginBottom: 5 }}
              wrapperCol={{ span: 10 }}
            >
              {
                getFieldDecorator('shuntUser', {
                  rules: [{ requreid: true }],
                })(
                  <Select>
                    {
                      userEntityList.map(entity =>
                        (<Option value={entity.id.toString()}
                          key={entity.id}>
                          {entity.entityName}
                        </Option>))
                    }
                  </Select>
                )
              }
            </FormItem>
          }
          {
            this.state.showWarn && flowtype === 'abflow'
              ? <FormItem
                label=' '
                style={{ marginBottom: 5 }}
                colon={false}
                {...formItemLayout}
              >
                <Alert type='warning' message='各个分流方式的分流占比之和应为100' />
              </FormItem>
              : null
          }
          {
            branchItems
          }
          {
            flowtype !== 'abflow' &&
            <FormItem
              {...formItemLayout}
              style={{ marginBottom: 5 }}
              label={`分流标签值${branchItems.length + 1}`}
            >
              <Col span={10}>默认分支，以上条件都不具备</Col>
            </FormItem>
          }
        </Form>
      </Modal>);
  }
}

SplitFlowModal.propTypes = {
};

export default SplitFlowModal;
