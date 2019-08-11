import React, { Component, PropTypes } from 'react';
import { Tabs, Form, message } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import uuid from 'uuid';


import UserTag from './TabPanel/UserTag';
import CustomTag from './TabPanel/CustomTag';
import CounterTrade from './TabPanel/CounterTrade';
import OfflineBehavior from './TabPanel/OfflineBehavior';
import OnlineBehavior from './TabPanel/OnlineBehavior';
import TagChange from './TabPanel/TagChange';
import SelectedCondition from './SelectedCondition/';

const { TabPane } = Tabs;
const FormItem = Form.Item;


class TagPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabKey: null,
    };
  }


  componentWillMount() {
    const { dispatch, entityId } = this.props;
    console.log('willmount---------------entityId---------------tagpicker----------------', entityId);
    this.getTabKeysAuth(dispatch, entityId);
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.isResetTagPickerForm !== this.props.isResetTagPickerForm) { // 进行新增时候的重置
      if (this.props.isResetTagPickerForm) {
        this.props.form.resetFields();
      }
    }

    if (this.props.entityId !== nextProps.entityId) {
      const { dispatch } = this.props;
      this.getTabKeysAuth(dispatch, nextProps.entityId);
    }

    // if (nextProps.isCopyHandle !== this.props.isCopyHandle) { // 进行复制时候的重置
    //   if (!this.props.isCopyHandle) {
    //     this.props.form.resetFields();
    //   }
    // }
  }


  getTabKeysAuth = (dispatch, entityId) => {
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: `qzgl_xqzgl_nzq_cj_${entityId}` },
      callback: (data) => {
        if (!data) data = [];
        this.setState({
          tabKeyAuth: data,
        })
      },
    })
  }


  handleResetfiledsValues = () => {
    this.props.form.resetFields();
  }

  handleUpdateFilesValue = (item, type) => {
    if (type === 'UserTag') {
      this.props.form.setFieldsValue({ UserTag: item });
    } else if (type === 'CustomTag') {
      this.props.form.setFieldsValue({ CustomTag: item });
    } else if (type === 'OnlineBehavior') {
      this.props.form.setFieldsValue({ OnlineBehavior: item });
    }
  }

  handleTabChange = (tabKey) => {
    const { UserTag = {} } = this.props.form.getFieldsValue();
    const { isChannelReady, isReady } = UserTag;
    if (tabKey !== 'UserTag') {
      if (isChannelReady && !isReady) {
        message.error('对不起,如果你选择了渠道,就必须选择标签!');
        this.setState({
          tabKey: 'UserTag',
        })
      } else {
        this.setState({
          tabKey,
        })
      }
    } else {
      this.setState({
        tabKey,
      })
    }
    if (this.props.onTabChange) this.props.onTabChange(tabKey);
  }

  render() {
    const { filterTabKey, form, curEditGroup, isCopyHandle, entityId, entityName, isCopyAdd } = this.props;
    const { getFieldDecorator } = form;
    const { tabKeyAuth = [] } = this.state;
    let tagPickerValue = null;
    let isRestCopyTagpickerValue = false;
    let initValue = { isReady: false };
    // console.log('isResetTagPickerForm----------', this.props.isResetTagPickerForm)
    // console.log('isCopyHandle----------------', isCopyHandle);
    // console.log('conditionList----------------', this.props.conditionList);
    // console.log('isCopyHandle----------------', isCopyHandle);
    // console.log('isCopyAdd----------------', isCopyAdd);

    console.log('tagpicker---------------------------tabKeyAuth----------------------', tabKeyAuth)
    console.log('tagpicker---------------------------entityId------------------------', entityId);
    console.log('tagpicker---------------------------filterTabKey---------------------', filterTabKey)

    if (isCopyHandle && !isCopyAdd) { // 复制操作的initValue重置 复制刚点进去的时候重置,新增的时候通过isCopyAdd判断是否需要再次重置
      isRestCopyTagpickerValue = true;
      const conditonDesc = curEditGroup.conditonDesc ? JSON.parse(curEditGroup.conditonDesc) : {};
      // console.log('conditonDesc----------------', conditonDesc);
      tagPickerValue = conditonDesc.tagPickerValue || {
        UserTag: { isReady: false, isChannelReady: false },
        CustomTag: { isReady: false },
        CounterTrade: { isReady: false },
        OnlineBehavior: { isReady: false },
        OfflineBehavior: { isReady: false },
        TagChange: { isReady: false },
      };
      // console.log('tagPickerValue----------------', tagPickerValue);
    }


    let TABS = {};
    if (tabKeyAuth.includes(`qzgl_xqzgl_nzq_cj_bq_${entityId}`)) {
      TABS.UserTag = { title: entityName ? `${entityName}标签` : '用户标签', component: UserTag, initValue: isRestCopyTagpickerValue ? tagPickerValue.UserTag : { ...initValue, isChannelReady: false } };
    }
    if (tabKeyAuth.includes(`qzgl_xqzgl_nzq_cj_dzh_${entityId}`)) {
      TABS.CustomTag = { title: '定制化标签', component: CustomTag, initValue: isRestCopyTagpickerValue ? tagPickerValue.CustomTag : initValue };
    }
    if (tabKeyAuth.includes(`qzgl_xqzgl_nzq_cj_xsxw_${entityId}`)) {
      TABS.OnlineBehavior = { title: '线上行为', component: OnlineBehavior, initValue: isRestCopyTagpickerValue ? tagPickerValue.OnlineBehavior : initValue };
    }

    let showTabsKeys = Object.keys(TABS);
    if (filterTabKey instanceof Array && filterTabKey.length > 0) { // 过滤掉不需要的TAB页签
      showTabsKeys = showTabsKeys.filter(item => !filterTabKey.includes(item));
    }
    console.log('tagpicker---------------------------showTabsKeys---------------------', showTabsKeys)

    const defaultActiveKey = showTabsKeys.length ? showTabsKeys[0] : 'UserTag';

    return (
      <Form>
        <Tabs
          type="card"
          activeKey={this.state.tabKey || defaultActiveKey}
          onChange={this.handleTabChange}
        >
          {
            showTabsKeys.map((key, index) => {
              const tab = TABS[key];
              const Content = tab.component;
              const props = {
                ...this.props,
              };
              if (key === 'OnlineBehavior') {
                props.updateFilesValue = this.handleUpdateFilesValue;
              }

              const initialValue = tab.initValue;

              return (
                <TabPane
                  tab={tab.title}
                  key={key}
                >
                  <FormItem style={{ marginBottom: 5 }}>
                    {
                      getFieldDecorator(key, { initialValue })(<Content {...props} />)
                    }
                  </FormItem>
                </TabPane>);
            })
          }
        </Tabs>

        <SelectedCondition
          dispatch={this.props.dispatch}
          visible={this.props.SelectedConditionVisible}
          conditionList={this.props.conditionList}
          currentCondition={this.props.currentCondition}
          outsideRelation={this.props.outsideRelation}
          updateFilesValue={this.handleUpdateFilesValue}
          resetfiledsValues={this.handleResetfiledsValues}
        />
      </Form>
    );
  }
}

const handleFieldsChange = (props, fields) => { // 进行表单操作的同时,同步更新redux中conditionList
  const { dispatch } = props;
  const key = _.findKey(fields);
  if (!fields[key].value) {
    return false;
  }
  if (key === 'OnlineBehavior' && !fields[key].value.isTrigger) {
    return false;
  }
  dispatch({
    type: 'tagPicker/getConditionList',
    payload: {
      fields,
    },
  })
}


export default Form.create({ onFieldsChange: handleFieldsChange })(connect(state => state.tagPicker)(TagPicker));


// const TABS = {
//   UserTag: { title: entityName ? `${entityName}标签` : '用户标签', component: UserTag, initValue: isRestCopyTagpickerValue ? tagPickerValue.UserTag : { ...initValue, isChannelReady: false } },
//   CustomTag: { title: '定制化标签', component: CustomTag, initValue: isRestCopyTagpickerValue ? tagPickerValue.CustomTag : initValue },
//   CounterTrade: { title: ' 线下交易', component: CounterTrade, initValue: isRestCopyTagpickerValue ? tagPickerValue.CounterTrade : initValue },
//   OnlineBehavior: { title: '线上行为', component: OnlineBehavior, initValue: isRestCopyTagpickerValue ? tagPickerValue.OnlineBehavior : initValue },
//   OfflineBehavior: { title: '线下行为', component: OfflineBehavior, initValue: isRestCopyTagpickerValue ? tagPickerValue.OfflineBehavior : initValue },
//   TagChange: { title: '标签变化', component: TagChange, initValue: isRestCopyTagpickerValue ? tagPickerValue.TagChange : initValue },
// };

// const showTabsKeys = tabKeys || Object.keys(TABS); // 默认全部展示
// const defaultActiveKey = tabKeys.length ? tabKeys[0] : 'UserTag';