import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Tabs, Card, Form, Select, Icon, Spin, Steps } from 'antd';
import { Pie, TagCloud } from '../../../components/Charts';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import GroupList from '../../../components/GroupList';
import ReactEcharts from 'echarts-for-react';
import 'echarts-wordcloud';
import TripList from './TripList'

import styles from './index.less';


const { TabPane } = Tabs;
const { Option } = Select;

@connect(state => ({ secne: state['marketing/scene'] }))
export default class Scene extends PureComponent {
  state = {
    open: false,
    selected: null,
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'marketing/scene/queryConfigEntityList',
      callback: () => {
        const { secne } = this.props;
        const { entityList } = secne;
        const entityId = entityList[0].id;
        const groupList = secne[`groupList_${entityId}`];
        if (groupList && groupList.length > 0) {
          this.groupListChange(groupList[0]);
        }
      },
    });
    dispatch({
      type: 'marketing/scene/queryTripList',
      payload: {
        pageNum: 1,
        pageSize: 10,
      },
    });
  }

  numChange = (data) => {
    const { open, item } = data;
    this.setState({ open });
    if (open) {
      this
        .props
        .dispatch({
          type: 'marketing/scene/queryTGI',
          payload: {
            bizLifeTripGroupId: item.bizLifeInfo.groupId,
            bizLifeTripGroupIncludePreGroupConditionJson: '{}',
            bizLifeTripId: item.bizLifeInfo.id,
            entityId: item.bizLifeInfo.entityId,
            groupId: this.state.selected.id,
            groupIncludePreGroupConditionJson: '{}',
          },
          callback: (data) => { },
        });
    }
  }

  btnClick = (data) => {
    if (data.type === 'funnel') {
      const { history } = this.props;
      history.push({
        pathname: '/report/funnel/detail',
        search: `?id=${data.item.id}&GROUPID=${this.state.selected.id}&ENTITYID=${this.state.selected.entityId}&bizLifeTripGroupId=${data.bizLifeInfo.groupId}&bizLifeTripId=${data.bizLifeInfo.id}`,
      })
    }
  }

  groupListChange = (item) => {
    const { tripList } = this.props.secne;
    tripList && tripList.length > 0 && tripList.map((m, n) => {
      this
        .props
        .dispatch({
          type: 'marketing/scene/queryPeopleSum',
          payload: {
            bizLifeTripGroupId: m.bizLifeInfo.groupId,
            bizLifeTripGroupIncludePreGroupConditionJson: '{}',
            bizLifeTripId: m.bizLifeInfo.id,
            entityId: item.entityId,
            groupId: item.id,
            groupIncludePreGroupConditionJson: '{}',
          },
        });
    });
    this.setState({ selected: item });
  }

  getPieData = (tripList) => {
    let flag = true;
    let a = [];
    tripList && tripList.length > 0 && tripList.map((item, i) => {
      if (!item.bizLifeInfo.hasOwnProperty('peopleSum')) flag = false;
    });
    if (flag) {
      tripList.map((item, i) => {
        const o = item.bizLifeInfo;
        a.push({
          x: o.nodeName,
          y: o.peopleSum,
        })
      })
    }
    return a;
  }

  getTgiData = (data) => {
    let a = [];
    if (data) {
      if (typeof data === 'string') data = JSON.parse(data);
      if (data && data.length > 0) {
        data.map((item) => {
          a.push({
            name: `${item.tagName}(${item.tagValueTitle})`,
            value: item.tgi,
          })
        });
      }
    }
    return a;
  }

  pageChange(data){
    this.props.dispatch({
      type:'marketing/scene/setNumGroupList',
      payload: {
        list: data,
        selected: this.state.selected
      }
    })
  }

  render() {
    const { secne } = this.props;
    const { tripList, entityList } = secne;
    const pieData = this.getPieData(tripList);
    const tgiData = this.getTgiData(secne.tgiList);
    return (
      <div className={styles.scene}>
        <Spin spinning={secne.loading} tip="Loading..." style={{ position: 'fixed', margin: 'auto', top: '30%', left: 0, right: 0, zIndex: 100 }} />
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '营销场景' }, { title: '客户生命旅程' }]} />
        <div className={styles.container}>
          <div style={{ fontSize: '14px',color: '#108de7'}}>第一步 ：选择用户群</div>
          {entityList && entityList.length > 0
            ? (
              <Tabs>
                {entityList.map((item, i) => {
                  return (<TabPane tab={item.entityName} key={i}>
                    {secne[`groupList_${item.id}`] && secne[`groupList_${item.id}`].length > 0
                      ? (<GroupList
                        onChange={this.groupListChange}
                        value={this.state.selected}
                        pageChange={::this.pageChange}
                        groupData={secne[`groupList_${item.id}`]} />)
                      : <div style={{
                        textAlign: 'center',
                        padding: '20px 0px',
                      }}>暂无用户群</div>
                    }
                  </TabPane>)
                })
                }
              </Tabs>
            )
            : null
          }
          <div style={{ fontSize: '14px', color: '#108de7',margin:'30px 0' }}>第二步 ：选择客户生命旅程</div>
          {
            tripList && tripList.length > 0 ? (
              <TripList
                groupId={!this.state.selected ? undefined : this.state.selected.id}
                data={tripList}
                current={1}
                numChange={this.numChange}
                btnClick={this.btnClick} />
            ) : null
          }
          <div className={styles.box}>
            {this.state.open
              ? (
                <div>
                  <Row className={styles.detail}>
                    <Col span={24} className={styles.leftTagCloud}>
                      {
                        tgiData && tgiData.length > 0 ?
                          (<ReactEcharts style={{ height: 400 }}
                            option={{
                              title: {
                                text: '显著特征：',
                              },
                              // tooltip: {},
                              series: [{
                                type: 'wordCloud',
                                gridSize: 20,
                                sizeRange: [12, 50],
                                rotationRange: [0, 0],
                                shape: 'circle',
                                textStyle: {
                                  normal: {
                                    color() {
                                      return `rgb(${[
                                        Math.round(Math.random() * 160),
                                        Math.round(Math.random() * 160),
                                        Math.round(Math.random() * 160),
                                      ].join(',')})`;
                                    },
                                  },
                                  emphasis: {
                                    shadowBlur: 10,
                                    shadowColor: '#333',
                                  },
                                },
                                data: tgiData,
                              }],
                            }} />) :
                          <div style={{ textAlign: 'center' }}>暂无数据</div>
                      }
                    </Col>
                  </Row>
                </div>
              )
              : (pieData && pieData.length > 0
                ? (<Pie
                  hasLegend
                  title="销售额"
                  data={pieData}
                  valueFormat={val => val}
                  height={300} />)
                : <div style={{
                  textAlign: 'center',
                }}>暂无数据</div>)
            }
          </div>
        </div>
      </div>
    )
  }
}

