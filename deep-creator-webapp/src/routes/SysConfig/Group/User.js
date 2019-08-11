import React, { PureComponent } from 'react';
import { List, Select, Form, Input, Row, message, Col, Checkbox, Button, Tag, Tree, InputNumber } from 'antd';
import uuid from 'uuid';
// import TagTree from '../../Tags/TagTree';
import styles from './User.less';


const Option = Select.Option;
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group;
const TreeNode = Tree.TreeNode;
const uuidv4 = uuid.v4;
class User extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dimensions: null,
    };
  }


  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            title={item.categoryName}
            key={item.categoryEnglishName}
            selectable={false}
            isLeaf={!!item.tagName}
            disableCheckbox={!item.tagName}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (<TreeNode
        title={item.categoryName || item.tagName}
        key={item.categoryEnglishName || item.tagEnglishName}
        selectable={false}
        isLeaf={!!item.tagName}
        disableCheckbox={!item.tagName}
      />);
    });
  }

  handleIdPullClick = (selectValue) => {
    this.props.form.setFieldsValue({
      idPulls: selectValue,
    })
  }

  handleTagsCheck = (checkedKeys, e) => {
    const { checked } = checkedKeys;
    const { checkedNodes } = e;
    let dimension = [];
    if (checkedNodes.length > 5) {
      message.info('不可超过5个');
      return false;
    }
    checkedNodes.forEach((item, index) => {
      let { title } = item.props;
      let { key } = item;
      dimension.push({
        key,
        title,
      })
    })
    this.props.form.setFieldsValue({
      tag: checked,
      dimension,
    })
    this.setState({
      dimensions: dimension,
    })
  }

  handleDimensiOnClose = (key, e) => {
    let { tag, dimension } = this.props.form.getFieldsValue();
    tag = tag.filter(item => item !== key);
    // debugger;
    dimension = dimension.filter(item => item.key !== key);

    this.props.form.setFieldsValue({
      tag,
      dimension,
    })
    this.setState({
      dimensions: dimension,
    })
  }

  handleIdAndProperty = (checkedValue) => {
    this.props.form.setFieldsValue({
      idAndProperty: checkedValue,
    })
  }

  handleOkClick = () => {
    // let arr = ['idPulls', 'groupNum', 'tgiNum', 'dimension', 'idAndProperty'];
    // const values = this.props.form.getFieldsValue();
    // const { idPulls } = values;
    // if (idPulls === '') {
    //   arr = arr.filter(item => item !== 'idPulls');
    // }
    // arr, {},
    this.props.form.validateFields((err, fieldsValue) => {
      if (!err) {
        let {
          groupNum,
          tgiNum,
          dimension,
          idAndProperty,
          idPulls,
        } = fieldsValue;

        let smGroupManagementInfo = {
          analysisDimension: dimension.map(item => item.key),
          baseInfo: idAndProperty,
          diffShow: idPulls,
          postCreateCimit: groupNum,
          tagShowNum: tgiNum,
        }
        this.props.handleGroupInfoCommit(smGroupManagementInfo);
      }
    })
  }

  handleCancelClick = () => {

  }


  render() {
    const { idPullList = [], auth = [], tagNameList = [], idAndPropertyList = [], groupInfo = {} } = this.props;
    const { getFieldDecorator } = this.props.form;
    // console.log('groupInfo-------------', groupInfo);
    const { smGroupManagementInfo = [], bizGroupAnalyzeDimensionPO = [] } = groupInfo;
    const { diffShow, postCreateCimit, tagShowNum, baseInfo } = smGroupManagementInfo;

    const idpullsInitial = diffShow || ''; // 个体是否ID拉通区别展示
    const groupNumInitial = postCreateCimit || ''; // 单个岗位创建群组数量上限
    const tgiNumInitial = tagShowNum || ''; // TGI显示个数
    const idAndPropertyInitial = baseInfo || []; // 微观画像基本信息配置

    const dimensionInitial = []; // 标签分布变化分析维度
    const tagInitial = []; // 已选维度
    if (bizGroupAnalyzeDimensionPO) {
      bizGroupAnalyzeDimensionPO.forEach((item, index) => {
        dimensionInitial.push({
          key: item.tagEnglishName,
          title: item.tagName,
        })
        tagInitial.push(item.tagEnglishName)
      })
    }

    const dimensions = this.state.dimensions || dimensionInitial;

    // console.log('this.props.form----------', this.props.form.getFieldsValue());
    // console.log('this.state.dimensions----------', this.state.dimensions);
    console.log('this.props.auth----------', auth);
    return (
      <Form className={styles.user} >
        {
          auth.includes('xtgl_qzpz_ltzs') &&
          <FormItem
            labelCol={{ span: 24 }}
            label={
              <Col style={{ width: '100%', borderBottom: '1px solid #0099FF', paddingBottom: '3px' }}>
                <span className={styles.fn12} >拉通展示配置</span>
              </Col>
            }
          >
            <Col>
              <FormItem
                label={
                  <span className={styles.fn12}>个体是否ID拉通区别展示</span>
                }
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
              >
                {
                  getFieldDecorator('idPulls', {
                    initialValue: idpullsInitial,
                    // rules: [{ required: true, message: '区分不能为空' }],
                  })(
                    <Select
                      onChange={this.handleIdPullClick}
                      style={{ width: 135, height: 20, fontSize: 12, marginLeft: '-10px' }}
                    >
                      <Option style={{ fontSize: 12 }} key='idpull_-1' value=''>不区分展示</Option>
                      {
                        idPullList.map((item, index) => {
                          return <Option style={{ fontSize: 12 }} key={`idpull${index}`} value={item.columnName}>{item.columnTitle}</Option>
                        })
                      }
                    </Select>
                    )
                }
              </FormItem>
            </Col>
          </FormItem>
        }

        {
          auth.includes('xtgl_qzpz_qzslpz') &&
          <FormItem
            style={{ marginTop: 20 }}
            labelCol={{ span: 24 }}
            label={
              <Col style={{ width: '100%', borderBottom: '1px solid #0099FF', paddingBottom: '3px' }}>
                <span className={styles.fn12} >群组数量配置</span>
              </Col>
            }
          >
            <Col>
              <FormItem
                className={styles.groupnum}
                label={
                  <span className={styles.fn12} >单个岗位创建群组数量上限</span>
                }
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
              >
                {
                  getFieldDecorator('groupNum', {
                    initialValue: groupNumInitial,
                    rules: [
                      { required: true, message: '数量不能为空' },
                      { pattern: /^[1-9]\d*$/, message: '数值须大于等于1' },
                    ],
                  })(
                    // <Input style={{ width: 135, marginLeft: '-28px' }} />
                    <InputNumber style={{ width: 115, marginLeft: '-28px' }} />
                    )
                }
              </FormItem>
            </Col>
          </FormItem>
        }

        {
          auth.includes('xtgl_qzpz_hgpz') &&
          <FormItem
            style={{ marginTop: 20 }}
            labelCol={{ span: 24 }}
            label={
              <Col style={{ width: '100%', borderBottom: '1px solid #0099FF', paddingBottom: '3px' }}>
                <span className={styles.fn12} >群组宏观画像配置</span>
              </Col>
            }
          >
            <Col>
              <FormItem
                className={styles.tgi}
                label={
                  <span className={styles.fn12} >TGI显示个数</span>
                }
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
              >
                {
                  getFieldDecorator('tgiNum', {
                    initialValue: tgiNumInitial,
                    rules: [
                      { required: true, message: '数量不能为空' },
                      { pattern: /^[1-9]\d*$/, message: '数值须大于等于1' },
                    ],
                  })(
                    // <Input style={{ width: 210, marginLeft: '-22px' }} />
                    <InputNumber style={{ width: 190, marginLeft: '-22px' }} />
                    )
                }
              </FormItem>
            </Col>
          </FormItem>
        }

        {
          auth.includes('xtgl_qzpz_hgpz') &&
          <FormItem
            label={
              <Col style={{ marginTop: 20 }}>
                <span className={styles.fn12}>标签分布变化分析维度</span>
              </Col>
            }
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            {
              getFieldDecorator('tag', {
                valuePropName: 'checkedKeys',
                initialValue: tagInitial,
              })(

                <Tree
                  className={styles.tag}
                  checkStrictly
                  checkable
                  onCheck={this.handleTagsCheck}
                // checkedKeys={tag}
                >
                  {this.renderTreeNodes(tagNameList)}
                </Tree>

                )
            }
          </FormItem>
        }


        {
          auth.includes('xtgl_qzpz_hgpz') &&
          <FormItem
            className={styles.dimension}
            label={
              <span
                className={styles.boxHeader}
                style={{ display: 'inline-block', width: '99%' }}
              >
                已选维度(不可超过5个)
           </span>
            }
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <div className={styles.boxContent} style={{ width: '100%' }}>
              {
                dimensions.map((item, index) => {
                  return (
                    <Tag
                      closable
                      size='large'
                      key={uuidv4()}
                      color="#108ee9"
                      onClose={this.handleDimensiOnClose.bind(this, item.key)}
                    >
                      {item.title}
                    </Tag>
                  )
                })
              }
            </div>
            { // 这个的作用主要是为了进行'分析维度为空'时候的提示操作
              getFieldDecorator('dimension', {
                initialValue: dimensionInitial,
                rules: [{ required: true, message: '分析维度不能为空' }],
              })(
                <Input type="hidden" />
                )
            }
          </FormItem>
        }


        {
          auth.includes('xtgl_qzpz_wgpz') &&
          <FormItem
            style={{ marginTop: 20 }}
            labelCol={{ span: 24 }}
            label={
              <Col style={{ width: '100%', borderBottom: '1px solid #0099FF', paddingBottom: '3px' }}>
                <span className={styles.fn12} >微观画像基本信息配置</span>
              </Col>
            }
          >
            <Col >
              <FormItem
                className={styles.idAndProperty}
                label={
                  <span
                    className={styles.boxHeader}
                    style={{ display: 'inline-block', width: '99%' }}
                  >
                    选中ID或属性可见
                </span>
                }
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
              >
                {
                  getFieldDecorator('idAndProperty', {
                    initialValue: idAndPropertyInitial,
                    rules: [{ required: true, message: 'ID或属性不能为空' }],
                  })(
                    <CheckboxGroup
                      className={styles.boxContent}
                      style={{ width: '100%' }}
                      onChange={this.handleIdAndProperty}
                    >
                      {
                        idAndPropertyList.map((item, index) => {
                          return <Checkbox key={`idAndProperty_${index}`} className={styles.fn12} value={item.id}>{item.columnTitle}</Checkbox>
                        })
                      }

                    </CheckboxGroup>,
                  )
                }
              </FormItem>
            </Col>
          </FormItem >
        }

        <FormItem
          style={{ marginTop: 15 }}
          wrapperCol={{ span: 24, offset: 9 }}
        >
          <Button style={{ margin: '0 15px' }} type="primary" htmlType="submit" onClick={this.handleOkClick}>确定</Button>
          <Button type="defalut" htmlType="submit" onClick={this.handleCancelClick}>取消</Button>
        </FormItem>
      </Form>
    );
  }
}


export default Form.create()(User);

