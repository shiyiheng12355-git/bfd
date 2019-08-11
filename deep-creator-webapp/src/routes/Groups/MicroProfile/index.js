import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Button, Row, Col, Tabs, message } from 'antd';
import UserPortrait from './UserPortrait';
import DateSelect from './DateSelect';
import UserBehaviorCount from './UserBehaviorCount';
import UserBehaviorDetail from './UserBehaviorDetail';
// import TagVariety from './TagVariety';
// import TagTree from '../../Tags/TagTree';
import UserTagInfo from './UserTagInfo';
// import AnthorTagInfo from './AnthorTagInfo';

import styles from './index.less';

const TabPane = Tabs.TabPane;
class MicroProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entityId: Number(this.getQueryVariable('id')), // 实体ID
      superId: this.getQueryVariable('sid'),
      microAuths: [], // 微观画像页面的权限
      cusTagAuth: [], // 自定义标签权限
      entityCategory: -1, // 实体类别 0用户类实体 1非用户类实体
      entityName: '', // 实体名
      appkey: '',
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      actionName: 'all', // 当前事件名称
      selectPieName: '',
      changeIndex: 0, // 换一批的索引
      // recProducts: [
      //   { iid: '9999340这是假数据', name: '诺德择时量化对冲20号分级资产管理计划' },
      //   { iid: 'otc321这是假数据', name: '方正封闭式产品-138616' },
      //   { iid: '1380这是假数据', name: '泰达宏利聚利分级债券' },
      //   { iid: '99993771这是假数据', name: '中融新机遇灵活配置混合型证券投资基金' },
      //   { iid: '99992860这是假数据', name: '国泰生益灵活配置混合型证券投资基金' },
      //   { iid: '612这是假数据', name: '长城保本' },
      //   { iid: '889这是假数据', name: '光大添益A' },
      //   { iid: '99992703这是假数据', name: '新华专户' },
      //   { iid: '99993322这是假数据', name: '华安安禧保本混合型证券投资基金A' },
      //   { iid: 'otc216这是假数据', name: '光大预约认购测试3号' },
      //   { iid: '1057这是假数据', name: '汇添富添富通货币市场基金A级' },
      //   { iid: '1275这是假数据', name: '华商领先企业' },
      //   { iid: '236这是假数据', name: '鹏华行业成长' },
      //   { iid: '716这是假数据', name: '景顺长城中小板创业板精选股票型证券投资基金' },
      //   { iid: '99992747这是假数据', name: '景顺长城量化精选股票型证券投资基金' },
      //    { iid: '99992703这是假数据', name: '新华专户' },
      // ],
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    const { entityId, superId } = this.state;
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'qzgl_wghx' },
      callback: (data) => {
        if (!data) data = [];
        console.log('data===================微观画像权限=========================', data);
        this.setState({ microAuths: data });
        this.initData(dispatch, entityId, superId, data);
        if (data.includes('qzgl_wghx_yhbqxx')) {
          dispatch({
            type: 'user/fetchAuths',
            payload: { parentKey: 'qzgl_wghx_yhbqxx' },
            callback: (data1) => {
              if (!data1) data1 = [];
              console.log('data1===================微观画像/标签信息权限=========================', data1);
              this.setState({ cusTagAuth: data1 });
            },
          })
        }
      },
    })
  }


  initData = (dispatch, entityId, superId, microAuths) => {
    dispatch({
      type: 'tagPicker/getEntityList',
      payload: {
        callback: (entityList) => {
          entityList.forEach((item) => {
            if (item.id === entityId) {
              this.setState({
                entityCategory: item.entityCategory,
                entityName: item.entityName,
              })
              if (item.entityCategory === 0) { // 用户类实体,只有用户类实体才发送if里边的请求
                dispatch({ // 客户端
                  type: 'tagPicker/getAppKey',
                  payload: {
                    callback: (AppKeys) => {
                      const appkey = AppKeys.length ? AppKeys[0].appkey : '';
                      this.setState({ appkey });
                      if (microAuths.includes('qzgl_wghx_yhxwxq')) {
                        dispatch({ // 用户行为详情
                          type: 'tagPicker/getUserActionDetails',
                          payload: {
                            entityId,
                            superId,
                          },
                        })
                        dispatch({ //  选择用户行为：
                          type: 'tagPicker/getUserActionList',
                          payload: {
                            appkey,
                          },
                        })
                      }
                    },
                  },
                }).then(() => {
                  dispatch({ // 饼图
                    type: 'tagPicker/getActionCounts',
                    payload: {
                      entityId,
                      superId,
                    },
                  })
                }).then(() => {
                  dispatch({ // 柱图
                    type: 'tagPicker/getActionCountsByTime',
                    payload: {
                      entityId,
                      superId,
                    },
                  })
                })

                if (microAuths.includes('qzgl_wghx_gxqdcp')) {
                  dispatch({ // 可能感兴趣的产品
                    type: 'tagPicker/getRecommendProducts',
                    payload: {
                      entityId,
                      superId,
                    },
                  })
                }
              }
            }
          })
        },
      },
    })

    dispatch({ // 基本信息
      type: 'tagPicker/getUserBaseInfo',
      payload: {
        entityId,
        superId,
      },
    })
    dispatch({ //标签用户画像
      type:'tagPicker/getMicroSurvey',
      payload: {
        entityId,
        superId,
      },
    })
    dispatch({ // 是否已经属于特别关注群
      type: 'tagPicker/isInSpecialGroup',
      payload: {
        entityId,
        superId,
      },
    })

    dispatch({ // 标签信息
      type: 'tagPicker/getUserTagInfo',
      payload: {
        entityId,
        superId,
      },
    })


  }


  getQueryVariable = (variable) => {
    let index = location.href.indexOf('?') + 1;
    let search = location.href.substring(index);
    let reg = new RegExp(`(^|&)${variable}=([^&]*)(&|$)`);
    let r = search.match(reg);
    if (r != null) return r[2]; return '';
  }


  handleTabChange = (key) => {
    console.log('key------', key);
  }

  handleSaveSpecialGroup = () => {
    const { dispatch } = this.props;
    const { isSpecialGroup } = this.props.tagPicker
    const { entityId, superId } = this.state;
    if (isSpecialGroup) { // 要取消关注
      dispatch({
        type: 'tagPicker/deleteSpecialGroup',
        payload: {
          entityId,
          superId,
          callback: (success) => {
            if (success) {
              message.info('取消成功');
            } else {
              message.info('取消失败')
            }
          },
        },
      })
    } else { // 要关注
      dispatch({
        type: 'tagPicker/saveSpecialGroup',
        payload: {
          entityId,
          superId,
          callback: (success) => {
            if (success) {
              message.info('关注成功');
            } else {
              message.info('关注失败');
            }
          },
        },
      })
    }
  }

  queryConutAndTimeAndDetail = () => { // 获取 actionCount(饼图) actionCountByTime(柱图) 用户行为详情
    const { dispatch } = this.props;
    const { entityId, superId, startDate, endDate, appkey } = this.state;
    const payload = {
      entityId,
      superId,
      startDate,
      endDate,
      appkey,
    };
    dispatch({
      type: 'tagPicker/getActionCounts',
      payload,
    }).then(() => {
      const { actionCounts } = this.props.tagPicker;
      actionCounts.sort((cur, next) => {
        return next.num - cur.num;
      })
      const actionName = actionCounts.length ? actionCounts[0].actionName : '';
      dispatch({
        type: 'tagPicker/getActionCountsByTime',
        payload: { ...payload, actionName },
      })
    })
    if (this.state.actionName !== 'all') {
      payload.actionName = this.state.actionName;
    }
    dispatch({
      type: 'tagPicker/getUserActionDetails',
      payload,
    })
  }

  handleDateChange = (startDate, endDate) => {
    this.setState({
      startDate,
      endDate,
    }, () => {
      this.queryConutAndTimeAndDetail();
    })
  }

  handleClientChange = (appkey) => {
    const { dispatch } = this.props;
    this.setState({
      appkey,
    }, () => {
      dispatch({
        type: 'tagPicker/getUserActionList',
        payload: {
          appkey,
        },
      })
      this.queryConutAndTimeAndDetail();
    })
  }

  handleActionCountClick = (clicked) => {
    // console.log('clicked-------------', clicked);
    const { data } = clicked;
    this.setState({
      selectPieName: data.name,
    })
    const { actionCounts = [] } = this.props.tagPicker;
    let actionName = '';
    actionCounts.forEach((item) => {
      if (item.actionNameCn === data.name) {
        actionName = item.actionName;
      }
    })

    const { dispatch } = this.props;
    const { entityId, superId, startDate, endDate, appkey } = this.state;
    const payload = {
      entityId,
      superId,
      startDate,
      endDate,
      appkey,
      actionName,
    }
    dispatch({
      type: 'tagPicker/getActionCountsByTime',
      payload,
    })
  }


  handleActionNameChange = (value) => {
    const { dispatch } = this.props;
    this.setState({
      actionName: value,
    }, () => {
      const { entityId, superId, startDate, endDate, appkey, actionName } = this.state;

      const payload = {
        entityId,
        superId,
        startDate,
        endDate,
        appkey,
      };

      if (actionName !== 'all') {
        payload.actionName = actionName;
      }

      dispatch({
        type: 'tagPicker/getUserActionDetails',
        payload,
      })
    })
  }


  handleQueryMoreDetail = (callback) => {
    const { dispatch } = this.props;
    const { actionDetails } = this.props.tagPicker;
    const { entityId, superId, startDate, endDate, appkey, actionName } = this.state;
    const payload = {
      entityId,
      superId,
      startDate,
      endDate,
      appkey,
      isloadingMore: true,
      callback: () => {
        if (callback) callback();
      },
    };
    if (actionName !== 'all') {
      payload.actionName = actionName;
    }
    if (actionDetails.length) {
      payload.timestamp = actionDetails[actionDetails.length - 1].timestamp
    }

    dispatch({
      type: 'tagPicker/getUserActionDetails',
      payload,
    })
  }


  handleQueryExistCustomtag = () => {
    const { dispatch } = this.props;
    const { entityId } = this.state;

    dispatch({
      type: 'tagPicker/queryExistCustomtag',
      payload: {
        entityId,
      },
    })
  }

  handleAddNewCustomtag = (tagValueTitle, callback) => {
    const { dispatch } = this.props;
    const { entityId, superId } = this.state;
    dispatch({
      type: 'tagPicker/addNewCustomtag',
      payload: {
        superId,
        entityId,
        tagValueTitle,
        callback: (success, errorMsg) => {
          if (success) {
            message.success('新增成功');
            if (callback) callback(true);
          } else {
            message.error(errorMsg || '新增失败');
          }
        },
      },
    })
  }

  handleAddOldCustomtag = (tagValueTitle, callback) => {
    const { dispatch } = this.props;
    const { entityId, superId } = this.state;
    dispatch({
      type: 'tagPicker/addOldCustomtag',
      payload: {
        superId,
        entityId,
        tagValueTitle: tagValueTitle.join(','),
        callback: (success) => {
          if (success) {
            message.success('新增成功');
            if (callback) callback(true);
          } else {
            message.error('新增失败');
          }
        },
      },
    })
  }

  handleDeleteCustomtag = (tagValueTitle, callback) => {
    const { dispatch } = this.props;
    const { entityId, superId } = this.state;
    dispatch({
      type: 'tagPicker/deleteCustomtag',
      payload: {
        superId,
        entityId,
        tagValueTitle,
        callback: (success) => {
          if (success) {
            message.success('删除成功');
            if (callback) callback(true);
          } else {
            message.error('删除失败');
          }
        },
      },
    })
  }

  handleChangeRecommedProduct = () => {
    let { recommendProduct = [] } = this.props.tagPicker;
    if (!recommendProduct.length) return false;
    let { changeIndex } = this.state;
    changeIndex += 5;
    if (changeIndex >= recommendProduct.length) { // 说明已经截取到最后五个了
      changeIndex = 0;
    }
    this.setState({
      changeIndex,
    })
  }


  render() {
    const { dispatch } = this.props;
    let {
      userBaseInfo = {}, recommendProduct = [], AppKeys = [],
      actionCounts = [], isSpecialGroup = false,
      actionCountsByTime = [], actionDetails = [], userTagInfo = [],
      existCustomtag = [], userActionList = [],
    } = this.props.tagPicker;

    const { selectPieName, actionName, entityName, entityCategory, cusTagAuth, recProducts, changeIndex, microAuths } = this.state;

    if (userBaseInfo.super_id) {
      delete userBaseInfo.super_id;
    }

    // console.log('isSpecialGroup-----------------', isSpecialGroup);

    const { appkey } = this.state;

    const { effects } = this.props.loadings;
    const actionDetailLoading = effects['tagPicker/getUserActionDetails'];
    const countLoading = effects['tagPicker/getActionCounts'];
    const byTimeLoading = effects['tagPicker/getActionCountsByTime'];
    const detailLoading = effects['tagPicker/getUserActionDetails'];
    const saveSpecialLoading = effects['tagPicker/saveSpecialGroup'];
    const deleteSpecialLoading = effects['tagPicker/deleteSpecialGroup'];

    // console.log('actionDetailLoading--------------', actionDetailLoading);
    // console.log('userBaseInfo---------------', userBaseInfo);
    //  console.log('saveSpecialLoading------------', saveSpecialLoading);
    // console.log('actionDetails----------', actionDetails);
    // console.log('userTagInfo----------', userTagInfo);
    // console.log('actionCounts----------', actionCounts);
    console.log('this.state.microAuths----------------', this.state.microAuths);
    console.log('this.state.cusTagAuth----------------', this.state.cusTagAuth);


    recommendProduct = recommendProduct.slice(changeIndex, changeIndex + 5);


    const dateSelectProps = {
      AppKeys,
      appkey,
      handleDateChange: this.handleDateChange,
      handleClientChange: this.handleClientChange,
    }

    const actionCountProps = {
      actionCounts,
      actionCountsByTime,
      countLoading,
      byTimeLoading,
      selectPieName,
      handleActionCountClick: this.handleActionCountClick,
    };
    const actionDetailProps = {
      actionName,
      actionCounts,
      userActionList,
      actionDetails,
      detailLoading,
      actionDetailLoading,
      handleActionNameChange: this.handleActionNameChange,
      handleQueryMoreDetail: this.handleQueryMoreDetail,
    };
    const UserPortraitProps = {
      entityId:this.props.entityId,
      superId:this.props.superId,
      microSurvey:this.props.tagPicker && this.props.tagPicker.microSurvey, //标签用户画像
    };
    const UserTagInfoProps = {
      entityId:this.state.entityId,
      superId:this.state.superId,
      // microSurvey:this.props.tagPicker && this.props.tagPicker.microSurvey,
      dispatch,
      cusTagAuth,
      userTagInfo,
      existCustomtag,
      entityCategory,
      handleQueryExistCustomtag: this.handleQueryExistCustomtag,
      handleAddNewCustomtag: this.handleAddNewCustomtag,
      handleAddOldCustomtag: this.handleAddOldCustomtag,
      handleDeleteCustomtag: this.handleDeleteCustomtag,
    };


    console.log('recommendProduct------------', recommendProduct);
    console.log('this.state.entityId--------------', this.state.entityId);
    console.log('this.state.superId--------------', this.state.superId);


    return (
      <div className={styles.microProfile}>
        {/* <div className={styles.left} style={{ display: entityCategory === 0 && microAuths.includes('qzgl_wghx_gxqdcp') ? 'block' : 'none' }}>
          <h4>可能感兴趣的产品</h4>
          {
            recommendProduct.length
              ? recommendProduct.map((item, index) => {
                return (<div key={index} style={{ marginBottom: 10 }}>
                  {
                    Object.keys(item).map((key) => {
                      const value = item[key];
                      return (
                        <div keu={key}>
                          <span style={{ fontWeight: 700 }}>{key}:</span>
                          <span>{value}</span>
                        </div>
                      )
                    })
                  }
                </div>)
              })
              : <div style={{ padding: 30, textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>暂无数据</div>
          }
          <div className={styles.recProBtn} >
            <Button type='primary' onClick={this.handleChangeRecommedProduct}>换一批</Button>
          </div>
        </div> */}
        <div className={styles.right}>
          <Row type="flex" justify="start" align="middle" gutter={16} className={styles.topBasic}>
              <Col span={8}>
                <div className={styles.rightTop}>
                  <Row type="flex" justify="start" align="middle" className={styles.topBorder}>
                    <Col span={18} className={styles.tLeft}>
                      <span className={styles.tLeftTitle}>{`${entityName}基本信息`}</span>
                    </Col>
                    <Col span={6} className={styles.tRight}>
                      <Button
                        className="speicalWatch"
                        type='primary'
                        size='small'
                        disabled={isSpecialGroup ? deleteSpecialLoading : saveSpecialLoading}
                        onClick={this.handleSaveSpecialGroup}
                      >
                        {isSpecialGroup ? '取消特别关注' : '特别关注'}
                      </Button>
                    </Col>
                  </Row>
                  <Row className={styles.basicRow}>
                    {
                      Object.keys(userBaseInfo).length > 0
                        ? Object.keys(userBaseInfo).map((key) => {
                          const value = userBaseInfo[key];
                          return <Col key={key} span={24} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}><span>{key}</span>: <b>{value}</b></Col>
                        })
                        : <div style={{ textAlign: 'center', lineHeight: '30px', color: 'rgba(0, 0, 0, 0.45)' }}>暂无数据</div>
                    }
                  </Row>
                </div>
              </Col>
              <Col span={16}>
                <div className={styles.rightBasicGraph}>
                    { microAuths.includes('qzgl_wghx_yhbqxx')?<UserPortrait {...UserPortraitProps} />:null}
                </div>
              </Col>
          </Row>
         
          <div className={styles.rightBottom}>

            {
              entityCategory === 0
                ? <Tabs defaultActiveKey="1" style={{ minHeight: 750 }} onChange={this.handleTabChange} type="card" >
                   {
                    microAuths.includes('qzgl_wghx_yhbqxx')
                      ? <TabPane
                        tab={`${entityName}标签信息`}
                        key="1"
                        style={{ padding: '0 20px 10px' }}>
                        <div>
                          <h4>{`${entityName}标签详情`}</h4>
                          <div 
                          //  style={{ maxHeight: 900, overflow: 'auto' }}
                          >
                            <UserTagInfo {...UserTagInfoProps} />
                          </div>
                        </div>
                      </TabPane>
                      : null
                  }
                  {
                    microAuths.includes('qzgl_wghx_yhxwxq') &&
                    <TabPane
                      tab={`${entityName}行为信息`}
                      key="2"
                      style={{ padding: '10px 20px 10px' }}>
                      <DateSelect {...dateSelectProps} />
                      <UserBehaviorCount {...actionCountProps} />
                      <UserBehaviorDetail {...actionDetailProps} />
                    </TabPane>
                  }
                 
                  
                  
                </Tabs>
                : (
                  microAuths.includes('qzgl_wghx_yhbqxx')
                    ? <Tabs defaultActiveKey='11' style={{ minHeight: 750 }} type="card" >
                      <TabPane
                        tab={`${entityName}标签信息`}
                        key="11"
                        style={{ padding: '0 20px 10px' }}>
                        <div >
                          <h4>{`${entityName}标签详情`}</h4>
                          <div >
                            <UserTagInfo {...UserTagInfoProps} />
                          </div>
                        </div>
                      </TabPane>
                    </Tabs>
                    : null
                )
            }
          </div>
        </div>
      </div>

    );
  }
}


function mapStateToProps(state) {
  return {
    tagPicker: state.tagPicker,
    loadings: state.LOADING,
  };
}

export default connect(mapStateToProps)(MicroProfile);

// className={styles.flex}
// style={{ width: '50%', whiteSpace: 'nowrap' }}
// style={{ width: entityCategory === 0 ? 'calc( 100% - 250px )' : '100%' }}
 // componentDidMount() {
    // const { dispatch } = this.props;
    // const { entityId, superId } = this.state;
    // const entityId = Number(this.getQueryVariable('id'));
    // const superId = this.getQueryVariable('sid');
    // this.state.entityId = entityId;
    // this.state.superId = superId;

    // dispatch({
    //   type: 'tagPicker/getEntityList',
    //   payload: {
    //     callback: (entityList) => {
    //       entityList.forEach((item) => {
    //         if (item.id === entityId) {
    //           this.state.entityCategory = item.entityCategory;
    //           this.state.entityName = item.entityName;
    //           if (item.entityCategory === 0) { // 用户类实体,只有用户雷实体才发送if里边的请求
    //             dispatch({ // 客户端
    //               type: 'tagPicker/getAppKey',
    //               payload: {
    //                 callback: (AppKeys) => {
    //                   const appkey = AppKeys.length ? AppKeys[0].appkey : ''
    //                   this.setState({ appkey })
    //                   dispatch({ // 用户行为详情
    //                     type: 'tagPicker/getUserActionDetails',
    //                     payload: {
    //                       entityId,
    //                       superId,
    //                     },
    //                   })
    //                   dispatch({ // 用户行为详情
    //                     type: 'tagPicker/getUserActionList',
    //                     payload: {
    //                       appkey,
    //                     },
    //                   })
    //                 },
    //               },
    //             }).then(() => {
    //               dispatch({ // 饼图
    //                 type: 'tagPicker/getActionCounts',
    //                 payload: {
    //                   entityId,
    //                   superId,
    //                 },
    //               })
    //             }).then(() => {
    //               dispatch({ // 柱图
    //                 type: 'tagPicker/getActionCountsByTime',
    //                 payload: {
    //                   entityId,
    //                   superId,
    //                 },
    //               })
    //             })

    //             dispatch({ // 可能感兴趣的产品
    //               type: 'tagPicker/getRecommendProducts',
    //               payload: {
    //                 entityId,
    //                 superId,
    //               },
    //             })
    //           }
    //         }
    //       })
    //     },
    //   },
    // })


    // dispatch({ // 基本信息
    //   type: 'tagPicker/getUserBaseInfo',
    //   payload: {
    //     entityId,
    //     superId,
    //   },
    // })

    // dispatch({ // 是否已经属于特别关注群
    //   type: 'tagPicker/isInSpecialGroup',
    //   payload: {
    //     entityId,
    //     superId,
    //   },
    // })

    // dispatch({ // 标签信息
    //   type: 'tagPicker/getUserTagInfo',
    //   payload: {
    //     entityId,
    //     superId,
    //   },
    // })
  // }