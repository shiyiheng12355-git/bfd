import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Tabs, Card } from 'antd';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Automation from './Automation';
import Recommendation from './Recommendation';
import Scene from './Scene';

const { TabPane } = Tabs;
const Authorized = RenderAuthorized();
@connect((state) => {
  return {
    ...state['sysconfig/marketing'],
    conditionList: state.tagPicker.conditionList,
    outsideRelation: state.tagPicker.outsideRelation,
    user: state.user,
  }
})
class Marketing extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'xtgl_yxpz' },
    })
  }

  render() {
    const { customerLife, conditionList, outsideRelation, user: { auths } } = this.props;
    // console.log('this.props.conditionlist-==================', this.props.conditionList);

    const tabs = [
      { title: '自动化营销', component: Automation, auth: 'xtgl_yxpz_zdhyx' },
      { title: '个性化推荐', component: Recommendation, auth: 'xtgl_yxpz_gxhtj', props: { auths } },
      {
        title: '经典营销场景',
        component: Scene,
        auth: 'xtgl_yxpz_jdyx',
        props: { customerLife, conditionList, outsideRelation },
      },
    ];
    return (
      <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '系统管理' }, { title: '营销场景配置' }]}>
        <Card>
          <Tabs type='card'>
            {
              tabs.map((tab, index) => {
                const Content = tab.component;
                return (
                  Authorized.check(() => { return auths.includes(tab.auth) },
                    <TabPane tab={tab.title} key={`tab_${index}`}>
                      <Content {...this.props} {...tab.props} />
                    </TabPane>)
                )
              })
            }
          </Tabs>
        </Card>
      </PageHeaderLayout>
    );
  }
}

Marketing.propTypes = {

};

export default Marketing;