import React, { Component } from 'react';
import { Modal, Form, Input, Select, Row, message, Col, Icon, Checkbox } from 'antd';
import moment from 'moment';
import CreateConditionCnHtml from './CreateConditionCnHtml'
import TagPicker from '../../components/TagPicker/';

import styles from './GroupEdit.less';


const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

// 其实群组的编辑/新增/复制可以共用一个组件,但是逻辑判断既多又复杂,所以把新增单独开发了一个组件,编辑和复制共用了一个组件
class GroupEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: 0, // 用户群分类的option值
      modalConditionVisible: false, // 控制条件选择Modal的显示隐藏
      isCopyHandle: false, // 控制是否重置TagPicker组件的initialValue
      copyBecomeAdd: false, // 控制是否有复制转变为新增,因为群组复制的最终结果其实就是新增
      conditionJson: {}, // 给后端组织的JSON数据
      conditionCn: {}, // 给后端组织的中文数据
      tagpickerTabKeys: [],
    };
  }


  // componentDidMount() {
  //   const hash = location.hash;
  //   const entityId = Number(hash.substring('2').split('/')[1]);
  //   const { dispatch } = this.props;
  //   this.getTagpickerTabKeyAuth(entityId, dispatch);
  // }


  componentWillReceiveProps(nextProps) {
    if (nextProps.curEditGroup !== this.props.curEditGroup) { // 显示的时候设置this.state.selectValue为要编辑用户群的分类ID
      this.setState({
        selectValue: nextProps.curEditGroup.groupCategoryId || 0,
      })
    }

    // if (this.props.entityId !== nextProps.entityId) {
    //   const { dispatch } = this.props;
    //   this.getTagpickerTabKeyAuth(nextProps.entityId, dispatch);
    // }
  }


  // getTagpickerTabKeyAuth=(entityId, dispatch) => {
  //   dispatch({
  //     type: 'user/fetchAuths',
  //     payload: { parentKey: `qzgl_xqzgl_nzq_cj_${entityId}` },
  //     callback: (data) => {
  //       console.log('tagpicker------复制群------标签/定制化标签/线上行为-------权限----', data);
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


  handleEditOrSaveGroupOk = (e) => {
    e.preventDefault();
    const { selectValue, copyBecomeAdd, conditionJson, conditionCn } = this.state;
    let arr = ['groupName', 'groupDesc', 'groupCategoryId', 'isAddReport'];
    if (selectValue === 0) {
      arr.push('groupCategory');
    }
    this.props.form.validateFields(arr, {}, (err, values) => {
      if (!err) {
        const { groupName, groupDesc, groupCategoryId, groupCategory, isAddReport } = values;
        const { id } = this.props.curEditGroup;
        const bizGroupInfo = {
          id,
          groupName,
          groupDesc,
          groupCategoryId,
        }
        if (groupCategory) {
          bizGroupInfo.groupCategory = groupCategory;
        }

        const { copyCoditionVisible } = this.props;

        if (copyCoditionVisible === false) { // 编辑操作
          this.props.handleGroupEdit(bizGroupInfo, (success) => {
            if (success) {
              this.props.handleEditGroupModalCancel();
            }
          });
        } else { // 复制操作,最终也是新增操作
          // debugger;
          if (!Object.keys(conditionJson).length && !Object.keys(conditionCn).length) {
            const { curEditGroup } = this.props;
            bizGroupInfo.conditionJson = curEditGroup.conditionJson;
            bizGroupInfo.conditonDesc = curEditGroup.conditonDesc;
          } else {
            bizGroupInfo.conditionJson = JSON.stringify(conditionJson);
            bizGroupInfo.conditonDesc = JSON.stringify(conditionCn);
          }

          bizGroupInfo.isAddReport = isAddReport ? 1 : 0;
          this.props.handleGroupSave(bizGroupInfo, (success) => {
            if (success) {
              this.setState({
                selectValue: 0,
                copyBecomeAdd: false,
              }, () => {
                // this.props.form.resetFields();
                this.props.handleEditGroupModalCancel();
              })
            }
          });
        }
      }
    });
  }


  handleGroupCategoryChange = (selectValue) => {
    this.setState({
      selectValue,
    });
  }


  handleEditGroupModalCancel = () => {
    const { curEditGroup } = this.props;
    const { groupCategoryId = 0 } = curEditGroup;
    this.props.form.resetFields();
    this.setState({ // 隐藏的时候设置this.state.selectValue为要编辑用户群的分类ID
      selectValue: groupCategoryId,
      copyBecomeAdd: false,
    })
    this.props.handleEditGroupModalCancel();
  }

  handleConditionModalVisible = () => {
    this.setState({
      modalConditionVisible: true,
      isCopyHandle: true,
    })
  }

  handleConditionModalCancel = () => {
    this.setState({
      modalConditionVisible: false,
      isCopyHandle: false,
    })
  }

  handleConditionOk = () => {
    const tagPickerValue = this.tagPicker.getFieldsValue();
    const { conditionList, outsideRelation } = this.props;
    let [conditions, conditionsDesc] = [[], []];

    const { length } = conditionList;
    const lastCondition = conditionList[length - 1];

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
          let cusArr = customerTag.map(cus => cus.tagValueTitle);
          tag.custom_tag = cusArr;
          customTagDesc.custom_tag = cusArr.join(',').replace(',', '或');
        }
        if (automaticTag.length) {
          let autoArr = automaticTag.map(auto => auto.tagValueTitle);
          tag.automatic_tag = autoArr;
          customTagDesc.automatic_tag = autoArr.join(',').replace(',', '或');
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

    this.setState({
      conditionJson: finalResult,
      conditionCn: finalResultDesc,
      modalConditionVisible: false,
      copyBecomeAdd: true,
    })
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      entityId, entityCategory, entityName, groupCategory, dispatch,
      curEditGroup, editGroupModalVisible, copyCoditionVisible,
    } = this.props;

    let { isCopyHandle, copyBecomeAdd, tagpickerTabKeys } = this.state;

    // const tabKeys = entityCategory === 0
    //   ? ['UserTag', 'CustomTag', 'OnlineBehavior']
    //   : ['UserTag'];
    let filterTabKey = [];
    if (entityCategory !== 0) {
      // tagpickerTabKeys = tagpickerTabKeys.filter(item => item !== 'OnlineBehavior');
      filterTabKey = ['OnlineBehavior'];
    }

    const { groupName, groupDesc, groupCategoryId } = curEditGroup;

    const modalTitlePre = copyCoditionVisible ? '新增' : '编辑';

    // console.log('copyBecomeAdd----------------', copyBecomeAdd);
    // console.log('this.11111111111----------------', isCopyHandle);


    return (
      <div className={styles.groupEdit}>
        <Modal
          title={`${modalTitlePre}${entityName}群`}
          width="700px"
          maskClosable={false}
          visible={editGroupModalVisible}
          onOk={this.handleEditOrSaveGroupOk}
          onCancel={this.handleEditGroupModalCancel}
        >
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
            style={{ marginBottom: 10 }}
            label={`${entityName}群名称`}
          >
            {getFieldDecorator('groupName', {
              initialValue: groupName || '',
              rules: [
                { required: true, message: `${entityName}群名不能为空` },
                { max: 15, message: '15个字符以内' },
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
              <Input placeholder="15个字符以内" />
              )}
          </FormItem>
          <FormItem
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
            style={{ marginBottom: 10 }}
            label={`${entityName}群描述`}
          >
            {getFieldDecorator('groupDesc', {
              initialValue: groupDesc || '',
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
            style={{ marginBottom: 10 }}
            required
            label={`${entityName}群分类`}
          >
            <Col span={6} >
              <FormItem>
                {getFieldDecorator('groupCategoryId', {
                  initialValue: groupCategoryId || this.state.selectValue,
                  rules: [
                    { required: true, message: '请选择分类' },
                  ],
                })(
                  <Select
                    style={{ width: 200 }}
                    onChange={this.handleGroupCategoryChange}
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
            <Col span={10} offset={6}>
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
          {
            copyCoditionVisible &&
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
          }
          {
            copyCoditionVisible &&
            <Col
              offset={2}
              style={{ background: '#EEE', minHeight: 125, paddingTop: 10 }}
            >
              <Row>
                <Col span={2} style={{ color: '#000', textAlign: 'center' }}>条件:</Col>
                <Col span={copyBecomeAdd ? 21 : 20} style={{ background: '#fff', minHeight: 105, maxHeight: 105, overflow: 'auto', padding: 5 }}>
                  <CreateConditionCnHtml curEditGroup={copyBecomeAdd ? this.state.conditionCn : curEditGroup} />
                </Col>
                {
                  !copyBecomeAdd && <Col span={2}><a href='javascript:;' onClick={this.handleConditionModalVisible}>编辑</a></Col>
                }

              </Row>
            </Col>
          }

          <Modal
            title="条件选择"
            width="900px"
            height="80%"
            style={{ top: 50 }}
            bodyStyle={{ padding: '8px 15px' }}
            maskClosable={false}
            onOk={this.handleConditionOk}
            visible={this.state.modalConditionVisible}
            onCancel={this.handleConditionModalCancel}
          >
            <TagPicker
              SelectedConditionVisible
              entityId={entityId}
              // tabKeys={tagpickerTabKeys}
              filterTabKey={filterTabKey}
              ref={this.getTagPicker}
              curEditGroup={curEditGroup}
              dispatch={dispatch}
              isCopyHandle={isCopyHandle}
            />
          </Modal>

        </Modal>
      </div>
    );
  }
}


export default Form.create()(GroupEdit);

