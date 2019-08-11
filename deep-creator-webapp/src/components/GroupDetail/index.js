import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Tabs, Spin, Button } from 'antd';
import { Link } from 'dva/router';

import BasicInfo from './BasicInfo'
import TagCharacter from './TagCharacter'
import TagDistribution from './TagDistribution'
import DetailList from './DetailList'
import GroupSave from './GroupSave'

const { TabPane } = Tabs;

class GroupDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupSaveModalVisible: false, // 保存用户群Modal 显示/隐藏
    }
  }

  handleGroupSaveModalShow = () => {
    this.setState({
      groupSaveModalVisible: true,
    })
  }

  handleGroupSaveModalCancel = () => {
    this.setState({
      groupSaveModalVisible: false,
    })
  }

  handleSaveGroup = (data, callback) => {
    this.handleGroupSaveModalCancel();
    this.props.handleGroupSave(data, callback);
  }

  render() {
    let {
      TGItype,
      tabKeys, // tab列表
      extraContentVisible = false, // 是否展示保存用户群
      BasicInfoProps = {}, // 基本信息
      TagCharacterProps = {}, // 标签特征
      TagDistributionProps = {}, // 标签分布
      DetailListProps = {}, // 详情列表
      GroupSaveProps = {}, // 保存用户群
      checkNameIsRepeat,
      handleTabChange, // tab切换
      // handleGroupSave, // 保存用户群的回调
      backPath,
      entityId,
      groupCategory,
      location = {},
    } = this.props;
    const { groupSaveModalVisible } = this.state;
    const { state = {} } = location;
    const { personNumber = '' } = state;

    GroupSaveProps = {
      // ...GroupSaveProps,
      entityId,
      groupCategory,
      checkNameIsRepeat,
      handleGroupSave: this.handleSaveGroup,
      groupSaveModalVisible,
      handleGroupSaveModalCancel: this.handleGroupSaveModalCancel,
    }

    console.log('index---------------tabKeys-------------->>>>>>>>>>>>>', tabKeys);

    let TABS = {};
    if (TGItype === 'GROUP') {
      TABS.BasicInfo = { title: '基本信息', TabComponent: BasicInfo, props: BasicInfoProps };
    }

    //南方基金-test 
    tabKeys.forEach((item) => {
      if (item === `qzgl_xqzgl_nzq_qxq_bqtz_${entityId}` || item === `qzgl_xqzgl_wdq_qxq_bqtz_${entityId}`) {
        TABS.TagCharacter = { title: '特征发现', TabComponent: TagCharacter, props: TagCharacterProps };
      } else if (item === `qzgl_xqzgl_nzq_qxq_bqfb_${entityId}` || item === `qzgl_xqzgl_wdq_qxq_bqfb_${entityId}`) {
        TABS.TagDistribution = { title: '标签分布', TabComponent: TagDistribution, props: TagDistributionProps };
      } else if (item === `qzgl_xqzgl_nzq_qxq_xqlb_${entityId}` || item === `qzgl_xqzgl_wdq_qxq_xqlb_${entityId}`) {
        TABS.DetailList = { title: '详情列表', TabComponent: DetailList, props: DetailListProps };
      }
    })

    //bak原版
    // tabKeys.forEach((item) => {
    //   if (item === `qzgl_xqzgl_nzq_qxq_bqtz_${entityId}` || item === `qzgl_xqzgl_wdq_qxq_bqtz_${entityId}`) {
    //     TABS.TagCharacter = { title: '显著特征', TabComponent: TagCharacter, props: TagCharacterProps };
    //   } else if (item === `qzgl_xqzgl_nzq_qxq_bqfb_${entityId}` || item === `qzgl_xqzgl_wdq_qxq_bqfb_${entityId}`) {
    //     TABS.TagDistribution = { title: '标签分布', TabComponent: TagDistribution, props: TagDistributionProps };
    //   } else if (item === `qzgl_xqzgl_nzq_qxq_xqlb_${entityId}` || item === `qzgl_xqzgl_wdq_qxq_xqlb_${entityId}`) {
    //     TABS.DetailList = { title: '详情列表', TabComponent: DetailList, props: DetailListProps };
    //   }
    // })

    const showTabsKeys = Object.keys(TABS);
    return (
      <div>

        <Tabs
          type="card"
          onChange={handleTabChange}
          tabBarExtraContent={
            <div>
              {
                extraContentVisible &&
                <div style={{ backgroundColor: '#ffffff' }}>
                  <span>{personNumber ? `人数: ${personNumber}` : ''}</span> &nbsp;&nbsp;
                <Button type='primary'
                    size='small'
                    onClick={this.handleGroupSaveModalShow}>
                    保存用户群
                </Button> &nbsp;&nbsp;
              </div>
              }
              {
                backPath &&
                <div>
                  <Link to={backPath} />
                </div>
              }
            </div>
          }
        >
          {
            showTabsKeys.map((key, index) => {
              const current = TABS[key] || {};
              const { title, TabComponent, props } = current;

              return (
                <TabPane style={{ marginTop: -2 }} tab={title} key={key} >
                  <TabComponent {...props} tabKeys={tabKeys} />
                </TabPane>
              )
            })
          }

        </Tabs>

        <GroupSave {...GroupSaveProps} ></GroupSave>
      </div >
    );
  }
}

GroupDetail.propTypes = {
  tabKeys: PropTypes.array,
  extraContentVisible: PropTypes.bool,
  BasicInfoProps: PropTypes.object,
  TagCharacterProps: PropTypes.object,
  TagDistributionProps: PropTypes.object,
  DetailListProps: PropTypes.object,
  GroupSaveProps: PropTypes.object,
  handleTabChange: PropTypes.func,
};


export default GroupDetail;

// const TABS = {
    //   BasicInfo: { title: '基本信息', TabComponent: BasicInfo, props: BasicInfoProps },
    //   TagCharacter: { title: '显著特征', TabComponent: TagCharacter, props: TagCharacterProps },
    //   TagDistribution: { title: '标签分布', TabComponent: TagDistribution, props: TagDistributionProps },
    //   DetailList: { title: '详情列表', TabComponent: DetailList, props: DetailListProps },
    // };