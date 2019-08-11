import React, { Component } from 'react';
import { Modal, Button, Form, Input, Select, Checkbox, Row, Col, message } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import TagPicker from '../../components/TagPicker/';
import CreateConditionCnHtml from './CreateConditionCnHtml';
import uuid from 'uuid';

const uuidv4 = uuid.v4;

import styles from './GroupAdd.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
class GroupAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // tagpickerTabKeys: [], // 新增用户群的时候 tagpicker组件的页签列表
      selectValue: 0, // 用户群分类的option值
      isResetTagPickerForm: false, // 控制是否重置TagPicker组件的initialValue
      conditionDescVisible: false, // 控制是展示'点击设置条件'还是展示'已经选择好的条件' false=>点击设置条件  true=>展示已经选择好的条件
      modalConditionVisible: false, // 控制条件选择Modal的显示隐藏
      conditionJson: {}, // 给后端组织的JSON数据
      conditionCn: {}, // 给后端组织的中文数据
    };
  }

  // componentDidMount() {
  //   const hash = location.hash;
  //   const entityId = Number(hash.substring('2').split('/')[1]);
  //   const { dispatch } = this.props;
  //    this.getTagpickerTabKeyAuth(entityId, dispatch);
  // }

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.entityId !== nextProps.entityId) {
  //     const { dispatch } = this.props;
  //     this.getTagpickerTabKeyAuth(nextProps.entityId, dispatch);
  //   }
  // }


  // getTagpickerTabKeyAuth=(entityId, dispatch) => {
  //   dispatch({
  //     type: 'user/fetchAuths',
  //     payload: { parentKey: `qzgl_xqzgl_nzq_cj_${entityId}` },
  //     callback: (data) => {
  //       console.log('tagpicker-----新增群--------标签/定制化标签/线上行为-------权限----', data);
  //       if (!data) data = [];
  //       const tagpickerTabKeys = [];
  //       if (data.includes(`qzgl_xqzgl_nzq_cj_bq_${entityId}`)) {
  //         tagpickerTabKeys.push('UserTag')
  //       }
  //       if (data.includes(`qzgl_xqzgl_nzq_cj_dzh_${entityId}`)) {
  //         tagpickerTabKeys.push('CustomTag')
  //       }
  //       if (data.includes(`qzgl_xqzgl_nzq_cj_xsxw_${entityId}`)) {
  //         tagpickerTabKeys.push('OnlineBehavior')
  //       }
  //       this.setState({
  //         tagpickerTabKeys,
  //       })
  //     },
  //   })
  // }


  getTagPicker = (v) => {
    this.tagPicker = v;
  }

  handleSaveGroupOk = (e) => {
    e.preventDefault();
    let arr = ['groupName', 'groupDesc', 'groupCategoryId', 'condition', 'isAddReport'];
    const { selectValue, conditionJson, conditionCn } = this.state;
    if (selectValue === 0) {
      arr.push('groupCategory')
    }

    this.props.form.validateFields(arr, {}, (err, values) => {
      if (!err) {
        const { groupName, groupDesc, groupCategoryId, groupCategory, isAddReport } = values;
        const bizGroupInfo = {
          groupDesc,
          groupName,
          groupCategoryId,
          conditionJson: JSON.stringify(conditionJson),
          conditonDesc: JSON.stringify(conditionCn),
          isAddReport: isAddReport ? 1 : 0,
        }
        if (groupCategory) {
          bizGroupInfo.groupCategory = groupCategory;
        }
        this.props.handleGroupSave(bizGroupInfo, () => {
          this.setState({
            selectValue: 0,
            conditionDescVisible: false,
          }, () => {
            this.props.form.resetFields();
            this.props.handleGroupAddModalCancel()
          })
        });
      }
    });
  }


  handleSelectChange = (selectValue) => {
    this.setState({
      selectValue,
    });
  }

  handleGroupAddModalCancel = () => {
    this.props.form.resetFields();
    this.props.handleGroupAddModalCancel(() => {
      this.setState({
        selectValue: 0,
        conditionDescVisible: false,
      })
    });
  }

  handleSetConditionClick = () => {
    this.setState({
      modalConditionVisible: true,
      isResetTagPickerForm: true,
    });

    this.props.handleResetConditionList();
  }

  handleConditionModalCancel = () => {
    const { dispatch } = this.props;
    this.setState({
      modalConditionVisible: false,
      conditionDescVisible: false,
      isResetTagPickerForm: false,
    }, () => {
      this.props.handleResetConditionList();
    });
  }


  formatPeriodDate = (start, end) => {
    let dateDesc = {};
    if (!start && end) {
      dateDesc = {
        key: '之前',
        value: end,
      }
    } else if (start && !end) {
      dateDesc = {
        key: '之后',
        value: start,
      }
    } else if (start && end) {
      if (moment(start).valueOf() === moment(end).valueOf()) {
        dateDesc = {
          key: '发生于',
          value: start,
        }
      } else {
        dateDesc = {
          key: '介于',
          value: [start, end],
        }
      }
    } else if (!start && !end) {
      dateDesc = null;
    }
    return dateDesc;
  }


  handleConditionOk = () => {
    const tagPickerValue = this.tagPicker.getFieldsValue();
    const { conditionList, outsideRelation } = this.props;

    const { length } = conditionList;
    const lastCondition = conditionList[length - 1];
    // && !lastCondition.CounterTrade.isReady
    if (
      !lastCondition.UserTag.isChannelReady && !lastCondition.UserTag.isReady
      && !lastCondition.CustomTag.isReady && !lastCondition.OnlineBehavior.isReady
    ) {
      message.error('条件不能为空!');
      return false;
    }

    if (lastCondition.UserTag.isChannelReady && !lastCondition.UserTag.isReady) {
      message.error('对不起,如果你选择了渠道,就必须选择标签!');
      return false;
    }

    let [conditions, conditionsDesc] = [[], []];

    conditionList.forEach((conditionItem, index) => {
      // CounterTrade
      const { UserTag, CustomTag, OnlineBehavior } = conditionItem;
      let [tag, action, trade] = [{}, [], []];
      let [userTagDesc, channelDesc, customTagDesc, onlineActionDesc] = [{}, {}, {}, []];

      const relation = conditionItem.relation || 'and'; // 全部满足 任意满足 |
      const relationDesc = conditionItem.relation === 'and' ? '且' : '或';

      if (UserTag.isChannelReady) { // 渠道
        tag.channel = UserTag.checkedChannels.map(item => item.dictionaryCode);
        channelDesc = {
          key: '渠道',
          value: UserTag.checkedChannels.map(channel => channel.dictionaryLabel).join(',').replace(',', '或'),
        }
      }
      // else { // 渠道不限
      //   tag.channels = [];
      // }

      if (UserTag.isReady) { // 用户标签
        const result = _.groupBy(UserTag.checkedTags, 'tagEnglishName');
        Object.keys(result).forEach((key) => {
          const current = result[key];
          const title = current[0].ptitle;
          const val = [];
          current.forEach((cur) => {
            val.push(cur.tagValueTitle);
          });
          tag[key] = val;
          userTagDesc[title] = val.join(',').replace(',', '或');
        })
      }

      if (CustomTag.isReady) { // 自定义标签
        const { checkedCusTags } = CustomTag;
        const { customerTag, automaticTag } = checkedCusTags;
        if (customerTag.length) {
          let cusArr = customerTag.map(cus => cus.tagEnglishValueTitle);
          let cusArrCn = customerTag.map(cus => cus.tagValueTitle);
          tag.custom_tag = cusArr;
          customTagDesc.custom_tag = cusArrCn.join(',').replace(',', '或');
        }
        if (automaticTag.length) {
          let autoArr = automaticTag.map(auto => auto.tagEnglishValueTitle);
          let autoArrCn = automaticTag.map(auto => auto.tagValueTitle);
          tag.automatic_tag = autoArr;
          customTagDesc.automatic_tag = autoArrCn.join(',').replace(',', '或');
        }
      }


      if (OnlineBehavior.isReady && OnlineBehavior.action.length) { // 线上行为
        OnlineBehavior.action.forEach((actionItem) => {
          const appkey = [actionItem.appkey.appkey];
          const appkeyDesc = actionItem.appkey.appkeyName;
          const date = actionItem.date.point ? { point: actionItem.date.point.key } : actionItem.date;
          const dateDesc = actionItem.date.point
            ? actionItem.date.point.name
            : this.formatPeriodDate(actionItem.date.period.start_date, actionItem.date.period.end_date);
          const event = {
            condition: actionItem.event.condition,
            actionname: actionItem.event.actionname,
            count: actionItem.event.count,
          }
          const eventDesc = {
            condition: actionItem.event.condition_cn,
            actionname: actionItem.event.actionname_cn,
            count: actionItem.event.count,
          }
          const eventParams = [];
          const eventParamsDesc = [];
          if (actionItem.event_params.length) {
            actionItem.event_params.forEach((param) => {
              eventParams.push({
                param_condition: param.param_condition,
                param_name: param.param_name,
                param_value: param.param_value,
              })
              eventParamsDesc.push({
                paramCondition: param.param_condition_cn,
                paramName: param.param_name_cn,
                paramValue: param.param_value,
              })
            })
          }
          const paramRelation = actionItem.relation;
          const paramRelationDesc = actionItem.relation === 'and' ? '且' : '或';
          const firstTimeDesc = this.formatPeriodDate(actionItem.first_time.start_date, actionItem.first_time.end_date);
          const lastTimeDesc = this.formatPeriodDate(actionItem.last_time.start_date, actionItem.last_time.end_date);

          action.push({
            appkey,
            date,
            event,
            relation: paramRelation,
            event_params: eventParams,
            first_time: actionItem.first_time,
            last_time: actionItem.last_time,
          })
          onlineActionDesc.push({
            appkeyDesc,
            dateDesc,
            eventDesc,
            eventParamsDesc,
            firstTimeDesc,
            lastTimeDesc,
            relationDesc: paramRelationDesc,
          })
        })
      }

      conditions.push({
        relation,
        tag,
        action,
        trade,
      })

      conditionsDesc.push({
        relationDesc,
        channelDesc,
        userTagDesc,
        customTagDesc,
        onlineActionDesc,

      })
    })

    const finalResult = { // 传给后台的英文JSON
      conditions,
      relation: outsideRelation,
    }

    const finalResultDesc = { // 传给后台的中文描述
      conditionsDesc,
      tagPickerValue,
      conditionList,
      relationDesc: outsideRelation === 'and' ? '且' : '或',
    }

    console.log('finalResultDesc--------------------', finalResultDesc)
    this.setState({
      conditionJson: finalResult,
      conditionCn: finalResultDesc,
      modalConditionVisible: false,
      conditionDescVisible: true,
      isResetTagPickerForm: false,
    }, () => {
      this.props.handleResetConditionList()
    })
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { entityId, entityCategory, entityName, addGroupModalVisible, groupCategory = [] } = this.props;
    // let { tagpickerTabKeys } = this.state;
    let filterTabKey = [];
    if (entityCategory !== 0) {
      // tagpickerTabKeys = tagpickerTabKeys.filter(item => item !== 'OnlineBehavior');
      filterTabKey = ['OnlineBehavior'];
    }

    // tagpickerTabKeys = entityCategory === 0
    //   ? ['UserTag', 'CustomTag', 'OnlineBehavior']
    //   : ['UserTag'];

    return (
      <div className={styles.addGroup}>
        <Modal
          title={`新增${entityName}群`}
          width="900px"
          maskClosable={false}
          visible={addGroupModalVisible}
          onOk={this.handleSaveGroupOk}
          onCancel={this.handleGroupAddModalCancel}
        >
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
            label={`${entityName}群名称`}
            style={{ marginBottom: 10 }}
          >
            {getFieldDecorator('groupName', {
              initialValue: '',
              rules: [
                { required: true, message: `${entityName}群名不能为空` },
                { max: 15, message: '15个字符以内' },
                {
                  validator: (rule, value, callback) => {
                    if (value.indexOf(' ') !== -1) {
                      callback('不能输入空格');
                      return false;
                    }
                    const patrn = /[`~!@#$%^&*\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*\+={}|？：“”、；‘’，。、]/im;
                    if(patrn.test(value)) {
                      callback('不能输入特殊字符');
                      return false;
                    }
                    callback();
                  },
                },
              ],
            })(
              <Input placeholder="15个字符以内" />
              )}
          </FormItem>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
            label={`${entityName}群描述`}
            style={{ marginBottom: 10 }}
          >
            {getFieldDecorator('groupDesc', {
              initialValue: '',
              rules: [
                { max: 50, message: '50个字符以内' },
                {
                  validator: (rule, value, callback) => {
                    if (value.indexOf(' ') !== -1) {
                      callback('不能输入空格');
                      return false;
                    }
                    callback();
                  },
                },
              ],
            })(
              <TextArea placeholder="50个字符以内" />
              )}
          </FormItem>

          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            required
            label={`${entityName}群分类`}
            style={{ marginBottom: 10 }}
          >
            <Col span={6} >
              <FormItem>
                {getFieldDecorator('groupCategoryId', {
                  initialValue: this.state.selectValue,
                  rules: [
                    { required: true, 
                      message: '请选择分类' },
                  ],
                })(
                  <Select
                    style={{ width: 200 }}
                    onChange={this.handleSelectChange}
                  >
                    <Option key="-1" value={0}>新增分类</Option>
                    {
                      groupCategory.map((item, index) => {
                        return <Option key={item.id} value={item.id}>{item.categoryName}</Option>;
                      })
                    }
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col span={10} offset={4}>
              {
                this.state.selectValue === 0
                  ? <FormItem >
                    {
                      getFieldDecorator('groupCategory', {
                        initialValue: '',
                        rules: [
                          { required: true, message: '新增分类不能为空' },
                          { max: 10, message: '10个字符以内' },
                          {
                            validator: (rule, value, callback) => {
                              if (value.indexOf(' ') !== -1) {
                                callback('不能输入空格');
                                return false;
                              }
                              callback();
                            },
                          },
                        ],
                      })(<Input placeholder="10个字符以内" />)
                    }
                  </FormItem>
                  : ''
              }
            </Col>
          </FormItem>

          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
            label="其它"
            style={{ marginBottom: 10,display:"none" }}
          >
            {getFieldDecorator('isAddReport', {
              valuePropName: 'checked',
              initialValue: false,
            })(
              <Checkbox style={{ fontSize: '12px' }}>添加到全局查看</Checkbox>
              )}
          </FormItem>

          {
            !this.state.conditionDescVisible &&
            <Col
              offset={2}
              style={{ background: '#EEE', minHeight: 125, paddingTop: 10 }}
            >
              <FormItem
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                label="条件"
              >
                <Button
                  className={styles.condition}
                  style={{ height: 95, background: '#fff', width: '90%', color: '#0099FF', border: 'none' }}
                  onClick={this.handleSetConditionClick}
                >
                  点击设置条件
                    </Button>
                {getFieldDecorator('condition', {
                  initialValue: '',
                  rules: [
                    { required: true, message: '条件不能为空' },
                  ],
                })(
                  <Input type="hidden" />
                  )}
              </FormItem>
            </Col>
          }

          {
            this.state.conditionDescVisible &&
            <Col
              offset={2}
              style={{ background: '#EEE', minHeight: 125, paddingTop: 10 }}
            >
              <Row>
                <Col span={2} style={{ color: '#000', textAlign: 'center' }}>条件:</Col>
                <Col span={22} style={{ background: '#fff', width: '90%', minHeight: 105, maxHeight: 105, overflow: 'auto', padding: 5 }}>
                  <CreateConditionCnHtml curEditGroup={this.state.conditionCn} />
                </Col>
              </Row>
            </Col>
          }

        </Modal>
        <div className={styles.conditionSelect}>
          <Modal
            title="条件选择"
            width="900px"
            height="80%"
            maskClosable={false}
            style={{ top: 50 }}
            bodyStyle={{ padding: '8px 15px' }}
            onOk={this.handleConditionOk}
            visible={this.state.modalConditionVisible}
            onCancel={this.handleConditionModalCancel}
          >
            <TagPicker
              SelectedConditionVisible
              isGroup
              entityId={entityId}
              entityName={entityName}
              // tabKeys={tagpickerTabKeys}
              filterTabKey={filterTabKey}
              dispatch={this.props.dispatch}
              ref={this.getTagPicker}
              isResetTagPickerForm={this.state.isResetTagPickerForm}
            />
          </Modal>
        </div>

      </div >
    );
  }
}


export default Form.create()(GroupAdd);

