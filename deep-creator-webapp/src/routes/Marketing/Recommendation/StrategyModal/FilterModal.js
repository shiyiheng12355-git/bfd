import React, { Component, PropTypes } from 'react';
import {
  Form, Input, Select, Radio, Icon,
  Tabs, Modal, InputNumber, Col, Tree, notification,
} from 'antd';
import uuid from 'uuid';
import lodash from 'lodash';
import Q from 'bluebird';
import classnames from 'classnames';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import { arrayToTree } from '../../../../utils/utils';
import styles from './FilterModal.less';

const Authorized = RenderAuthorized()
const FormItem = Form.Item;
const { Option } = Select;
const { TabPane } = Tabs;
const RadioGroup = Radio.Group;
const { TreeNode } = Tree;
const DIVITER = '====';

const CONNECT = ['like', 'in', '<', '<=', '>', '>=', '=='];
@Form.create({
  onValuesChange: (props, values) => {
    const { filterType } = values;
    if (filterType === 'tag') {
      const { currentRecomCfg: { entityId } } = props;
      props.dispatch({
        type: 'marketing/recommendation/fetchEntityTags',
        payload: { entityId },
      })
    }
  },
})
class FilterModal extends Component {
  state = {
    checkedKeys: { checked: [], halfChecked: [] },
  }
  componentWillMount() {
    // if (nextProps.visible && nextProps.visible !== this.props.visible) {
    const entityId = this.props.currentRecomCfg.entityId;
    if (!entityId) return;
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'yxcj_gxhtj_bj_gl' },
    })
    this.props.dispatch({
      type: 'marketing/recommendation/fetchParamSource',
      payload: { key: 'RECOM_ID_ATTRIBUTE', entityId },
    })
    this.props.dispatch({
      type: 'marketing/recommendation/fetchEntityList',
      payload: {},
    })
    // }
    let { form: { getFieldDecorator, setFieldsValue, getFieldsValue },
      node } = this.props;
    const filter = node && node.value && node.value.filter;
    getFieldDecorator('attributes');// 注册
    getFieldDecorator('keys');// 注册
    setFieldsValue({
      attributes: [],
      keys: [],
    });

    if (!filter) { // 新建，添加默认值
      const { attributes, keys } = getFieldsValue();
      if (!attributes.length) setFieldsValue({ attributes: [uuid.v1()] });
      if (!keys.length) setFieldsValue({ keys: [uuid.v1()] });
    }

    if (filter) { // 编辑,用传入的数据填充表单
      let attributes = [];
      let keys = [];
      const { attribute = [], black = [],
        day, hour, tags = {}, outerCondition } = filter ? JSON.parse(filter) : {};
      getFieldDecorator('day', { initialValue: day });
      getFieldDecorator('hour', { initialValue: hour });
      attribute.map((attr) => {
        const key = uuid.v1();
        attributes.push(key);
        getFieldDecorator(`attribute.${key}.attribute`, { initialValue: attr.attribute })
        getFieldDecorator(`attribute.${key}.connect`, { initialValue: attr.connect })
        getFieldDecorator(`attribute.${key}.value`, { initialValue: attr.value })
      })
      black.map((name) => {
        const key = uuid.v1();
        keys.push(key);
        getFieldDecorator(`black.${key}`, { initialValue: name })
      })
      if (tags) {
        let checked = [];
        this.initTags = tags;
        Object.keys(tags).forEach((engName) => {
          const values = tags[engName];
          const _keys = values.map(v => `TAGVALUE_${engName}${DIVITER}${v}`); // 标签值的唯一KEY由标签名和标签值共同决定
          checked = checked.concat(_keys);
        })
        this.setState({ checkedKeys: { checked, halfChecked: [] } })
      }
      getFieldDecorator('outerCondition');
      setFieldsValue({
        attributes,
        keys,
        outerCondition: outerCondition || 'and',
      });
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.visible && nextProps.visible !== this.props.visible) {
  //     const entityId = nextProps.currentRecomCfg.entityId;
  //     if (!entityId) return;
  //     this.props.dispatch({
  //       type: 'user/fetchAuths',
  //       payload: { parentKey: 'yxcj_gxhtj_bj_gl' },
  //     })
  //     this.props.dispatch({
  //       type: 'marketing/recommendation/fetchParamSource',
  //       payload: { key: 'RECOM_ID_ATTRIBUTE', entityId },
  //     })
  //     this.props.dispatch({
  //       type: 'marketing/recommendation/fetchEntityList',
  //       payload: {},
  //     })
  //   }
  //   let { form: { getFieldDecorator, setFieldsValue, getFieldsValue }, node } = nextProps;
  //   const { attributes, keys } = getFieldsValue();
  //   if (!attributes.length) setFieldsValue({ attributes: [uuid.v1()] });
  //   if (!keys.length) setFieldsValue({ keys: [uuid.v1()] });

  //   if (node && node !== this.props.node) { // 编辑
  //     getFieldDecorator('attributes') // 注册
  //     getFieldDecorator('keys')// 注册
  //     setFieldsValue({
  //       attributes: [],
  //       keys: [],
  //     })
  //     const { value = {} } = node;
  //     const { filter } = value;
  //     const { attribute = [], black = [],
  //       day, hour, tags = {}, outerCondition } = filter ? JSON.parse(filter) : {};
  //     getFieldDecorator('day', { initialValue: day });
  //     getFieldDecorator('hour', { initialValue: hour });
  //     const attributes = [];
  //     const keys = [];
  //     attribute.map((attr) => {
  //       const key = uuid.v1();
  //       attributes.push(key);
  //       getFieldDecorator(`attribute.${key}.attribute`, { initialValue: attr.attribute })
  //       getFieldDecorator(`attribute.${key}.connect`, { initialValue: attr.connect })
  //       getFieldDecorator(`attribute.${key}.value`, { initialValue: attr.value })
  //     })
  //     black.map((name) => {
  //       const key = uuid.v1();
  //       keys.push(key);
  //       getFieldDecorator(`black.${key}`, { initialValue: name })
  //     })
  //     if (tags) {
  //       let checked = [];
  //       this.initTags = tags;
  //       Object.keys(tags).forEach((engName) => {
  //         const values = tags[engName];
  //         const keys = values.map(v => `TAGVALUE_${engName}${DIVITER}${v}`); // 标签值的唯一KEY由标签名和标签值共同决定
  //         checked = checked.concat(keys);
  //       })
  //       this.setState({ checkedKeys: { checked, halfChecked: [] } })
  //     }
  //     getFieldDecorator('outerCondition');
  //     setFieldsValue({
  //       attributes,
  //       keys,
  //       outerCondition: outerCondition || 'and',
  //     });
  //   }
  // }

  parseTags = () => {
    const { checkedKeys: { checked = [] } } = this.state;
    const tags = this.props.entityTags.filter((tag) => {
      const key = `TAGVALUE_${tag.tagEnglishName}${DIVITER}${tag.tagValueTitle}`;
      return checked.includes(key)
    }); // 值标签
    const groups = lodash.groupBy(tags, 'tagEnglishName');
    const parsedTags = {}
    Object.keys(groups).forEach((englishName) => {
      parsedTags[englishName] = groups[englishName].map(tag => tag.tagValueTitle);
      parsedTags
    })
    // 此时可能是初始化时,页面数据还没有收集完
    if (this.initTags && checked.length && lodash.isEmpty(parsedTags)) {
      return this.initTags;
    }
    return parsedTags;
  }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { black = {}, attribute, enable, attributes, keys } = values;
        if (enable) {
          const filterBlack = Object.values(lodash.pick(black, keys)).filter(i => !!i);
          const filterAttribute = Object.values(lodash.pick(attribute, attributes)).filter((i) => {
            return i.attribute && i.value && i.connect; // 完整数据
          });
          const filter = {
            ...values,
            black: filterBlack,
            attribute: filterAttribute,
            tags: {},
          }
          delete values.attributes;
          delete values.keys;
          delete values.attribute;
          delete values.black;
          delete filter.attributes;
          delete filter.keys;
          filter.tags = this.parseTags();
          values.filter = JSON.stringify(filter);
        } else {
          values.filter = '';
        }

        this.props.dispatch({
          type: 'marketing/recommendation/updateRecomPolicy',
          payload: values,
        })
        this.props.onOk(values);
        this.props.form.resetFields();
      }
    });
  }

  handleAddField = (key) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('keys');
    if (keys.length === 10) return notification.warning({ message: '最多可添加10个黑名单' }); // 最大20个
    const index = keys.indexOf(key);
    keys.splice(index + 1, 0, uuid.v1());
    setFieldsValue({ keys: keys.slice(0) });
  }

  handleDeleteField = (key) => {
    const { getFieldsValue, setFieldsValue } = this.props.form;
    const { keys, black } = getFieldsValue();
    if (keys.length <= 1) return;
    const index = keys.indexOf(key);
    keys.splice(index, 1);
    delete black[key];
    setFieldsValue({ keys: keys.slice(0), black });
  }

  handleAddAttribute = (key) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const attributes = getFieldValue('attributes');
    const index = attributes.indexOf(key);
    attributes.splice(index + 1, 0, uuid.v1());
    setFieldsValue({ attributes: attributes.slice(0) });
  }

  handleDeleteAttribute = (key) => {
    const { getFieldsValue, setFieldsValue } = this.props.form;
    const { attributes, attribute } = getFieldsValue();
    if (attributes.length <= 1) return;
    const index = attributes.indexOf(key);
    attributes.splice(index, 1);
    delete attribute[key];
    setFieldsValue({ attributes: attributes.slice(0), attribute });
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      const nodeClass = classnames({
        [styles.hiddenCheck]: !item.key.startsWith('TAGVALUE_'),
        [styles.showCheck]: item.key.startsWith('TAGVALUE_'),
      })
      if (item.children) {
        return (
          <TreeNode title={item.title}
            key={item.key}
            dataRef={item}
            className={nodeClass}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (<TreeNode title={item.title}
        key={item.key}
        dataRef={item}
        isLeaf={item.isLeaf}
        className={nodeClass} />);
    });
  }


  render() {
    let { form: { getFieldDecorator, getFieldsValue },
      paramSources = {}, node, entityTags, auths } = this.props;
    entityTags = entityTags || [];
    const { checkedKeys } = this.state;
    const parsedTags = this.parseTags();
    node = node || {};
    const { value = {} } = node;
    const { filter } = value;

    getFieldDecorator('id', { initialValue: value.id });
    getFieldDecorator('keys', { initialValue: [] }); // register
    getFieldDecorator('attributes', { initialValue: [] }) // 注册

    const { keys, attributes, enable } = getFieldsValue();

    const subLayout = { labelCol: { sm: 3 }, wrapperCol: { sm: 16 } };

    const treeData = entityTags.map((tag) => {
      let fid; let fpid; let title; let key; let isLeaf = false; let value;
      if (tag.categoryEnglishName) { // 标签分类
        fid = tag.categoryEnglishName;
        fpid = tag.parentCategoryEnglishName;
        title = tag.categoryName;
        key = `TAGCATE_${fid}`;
        value = fid;
      } else if (tag.tagCategoryEnglishName && tag.tagEnglishName) { // 标签名
        fid = tag.tagEnglishName;
        fpid = tag.tagCategoryEnglishName;
        title = tag.tagName;
        key = `TAGNAME_${fid}`;
        value = fid;
      } else if (tag.tagEnglishName && tag.tagEnglishValueTitle) { // 标签值
        fid = tag.tagValueTitle;
        fpid = tag.tagEnglishName;
        title = tag.tagValueTitle;
        key = `TAGVALUE_${fpid}${DIVITER}${fid}`; // 标签值的唯一KEY由标签名和标签值共同决定
        value = JSON.stringify({ tagEnglish: fpid, tagValue: tag.tagValueTitle })
        isLeaf = true;
      }
      return {
        title,
        key,
        value,
        fid,
        fpid,
        isLeaf,
        ...tag,
      }
    });

    const tProps = {
      autoExpandParent: true,
      checkable: true,
      showLine: true,
      checkStrictly: true,
      checkedKeys,
      onCheck: val => this.setState({ checkedKeys: val }),
    };


    const formItems = keys.map((key) => {
      return (
        <FormItem key={key}
          label="黑名单"
          {...subLayout}
        >
          <Col span='22'>
            <FormItem>
              {
                getFieldDecorator(`black.${key}`, {
                })(<Input />)
              }
            </FormItem>
          </Col>
          <Col span='2'>
            <Icon type='plus-circle-o' onClick={this.handleAddField.bind(this, key)} />
            <Icon type='minus-circle-o' onClick={this.handleDeleteField.bind(this, key)} />
          </Col>
        </FormItem>)
    })

    const attributeItems = attributes.map((attr, index) => {
      return (<FormItem colon={false} key={attr}>
        <Col span={2}>
          {
            index !== 0 &&
            <FormItem>
              {getFieldDecorator(`attribute.${attr}.condition`, {
                initialValue: 'and',
                // rules: [{ required: true, message: '必填字段' }],
              })(<Select>
                <Option value='and'>且</Option>
                <Option value='or'>或</Option>
              </Select>)}
            </FormItem>
          }

        </Col>
        <Col span={6}>
          <FormItem>
            {getFieldDecorator(`attribute.${attr}.attribute`, {
              // rules: [{ required: true, message: '必填字段' }],
            })(<Select>
              {
                (paramSources.RECOM_ID_ATTRIBUTE || []).map((param) => {
                  return (<Option
                    value={param.key}
                    key={param.key}>
                    {param.label}
                  </Option>)
                })
              }
            </Select>)}
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem>
            {getFieldDecorator(`attribute.${attr}.connect`, {
            })(<Select>{
              CONNECT.map((con) => {
                return (<Option
                  value={con}
                  key={con}>
                  {con}</Option>)
              })
            }</Select>)
            }
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem>
            {getFieldDecorator(`attribute.${attr}.value`, {
              // rules: [{ required: true, message: '必填字段' }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col span={4}>
          <Icon type='plus-circle-o' onClick={this.handleAddAttribute.bind(this, attr)} />
          <Icon type='minus-circle-o' onClick={this.handleDeleteAttribute.bind(this, attr)} />
        </Col>
      </FormItem>)
    })

    return (
      <Modal
        maskClosable={false}
        title='过滤'
        {...this.props}
        width='50%'
        onOk={this.onOk}
      >
        <Form>
          <FormItem
            label='是否过滤'
          >{
              getFieldDecorator('enable', {
                initialValue: filter ? 1 : 0,
              })(
                <RadioGroup>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </RadioGroup>
              )
            }
          </FormItem>
          {
            enable === 1 &&
            getFieldDecorator('filterType', {})(
              <Tabs type='card'>
                <TabPane tab='规则参数' key='rule'>
                  <FormItem
                    label="按属性过滤"
                  ></FormItem>
                  <FormItem colon={false}>
                    <Col span={4}></Col>
                    <Col span={6}>过滤属性：</Col>
                    <Col span={4}>连接符号：</Col>
                    <Col span={6}>过滤属性值：</Col>
                  </FormItem>
                  {
                    attributeItems
                  }
                  <FormItem
                    labelCol={{ span: 3 }}
                    label="时间">
                    <div style={{ display: 'inline-block' }}>
                      {getFieldDecorator('day', {
                      })(<InputNumber min={0} />)}<span style={{ marginRight: '8px' }}>天</span>
                    </div>
                    <div style={{ display: 'inline-block' }}>
                      {
                        getFieldDecorator('hour', {
                        })(<InputNumber min={0} />)}<span style={{ marginRight: '8px' }}>小时</span>
                    </div>
                  </FormItem>
                  <FormItem
                    label="按iid黑名单过滤"
                  >
                    <Col offset={1}>
                      {formItems}
                    </Col>
                  </FormItem>
                </TabPane>
                {
                  Authorized.check(() => { return auths.includes('yxcj_gxhtj_bj_gl_bq') },
                    <TabPane tab='标签' key='tag'>
                      <FormItem label=' ' colon={false}>
                        按属性过滤{
                          getFieldDecorator('outerCondition', {
                            initialValue: 'and',
                          })(<Select style={{ width: '100px' }}>
                            <Option value='and'>且</Option>
                            <Option value='or'>或</Option>
                          </Select>
                          )}按标签过滤
                  </FormItem>
                      <Tree {...tProps}>
                        {this.renderTreeNodes(arrayToTree(treeData, 'fid', 'fpid'))}
                      </Tree>
                      <div>
                        {
                          Object.keys(parsedTags).map((engName, index) => {
                            const values = parsedTags[engName];
                            const _keys = Object.keys(parsedTags);
                            const hasNext = !!_keys[index + 1];
                            const tag = this.props.entityTags.find(_tag => _tag.tagEnglishName === engName && !_tag.tagValueTitle); // 查询标签名
                            if (!tag) return false;
                            return (<div key={uuid.v1()}
                              className={styles.conditionBox}
                            >{tag.tagName}:{values.join(',')}
                              {
                                hasNext &&
                                <FormItem className={styles.condition}>
                                  {
                                    getFieldDecorator(`condition.${engName}`, {
                                      initialValue: 'and',
                                    })(
                                      <Select style={{ width: '60px' }} size='small'>
                                        <Option value='and'>且</Option>
                                        <Option value='or'>或</Option>
                                      </Select>
                                    )
                                  }
                                </FormItem>
                              }
                            </div>)
                          })
                        }
                      </div>
                    </TabPane>)
                }
              </Tabs>)
          }
        </Form>
      </Modal >);
  }
}

FilterModal.propTypes = {
};

export default FilterModal;
