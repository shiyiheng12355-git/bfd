import React, { Component } from 'react';
import { Row, Col, Spin, Icon, Button, Timeline, Select } from 'antd';
import moment from 'moment';
import uuid from 'uuid';

import styles from './index.less';

const uuidv4 = uuid.v4;
const TimelineItem = Timeline.Item;
const Option = Select.Option;
class UserBehaviorDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingMore: false,
      indexList: [],
    }
  }

  handleQueryMoreDetail = () => {
    this.setState({
      isLoadingMore: true,
    }, () => {
      this.props.handleQueryMoreDetail(() => {
        this.setState({
          isLoadingMore: false,
        })
      });
    })
  }


  handleTimeItemVisible = (timestamp) => {
    let { indexList } = this.state;
    if (!indexList.includes(timestamp)) {
      indexList.push(timestamp);
    } else {
      const index = indexList.indexOf(timestamp);
      indexList.splice(index, 1)
    }
    this.setState({
      indexList,
    })
  }

  render() {
    let { actionCounts = [], actionDetails = [], userActionList = [], actionName = 'all', actionDetailLoading } = this.props;

    const { indexList = [], isLoadingMore = false } = this.state;

    // console.log('userActionList----------------------', userActionList);
    console.log('actionDetails----------------------', actionDetails);


    return (
      <div className={styles.detail}>
        <div className={styles.header}>
          <h4 style={{ margin: 0 }}>用户行为详情</h4>
          <div>
            <span>选择用户行为：</span>
            <Select
              style={{ width: 120 }}
              value={actionName}
              onChange={this.props.handleActionNameChange}
            >
              <Option key='-1' value='all'>全部</Option>
              {
                userActionList.map((item) => {
                  return <Option key={item.id} value={item.action_name}>{item.action_name_cn}</Option>
                })
              }
            </Select>
          </div>
        </div>

        {
          actionDetailLoading && !isLoadingMore
            ? <div style={{ textAlign: 'center', lineHeight: '100px' }}><Spin /></div>
            : (actionDetails.length <= 0
             ? <div style={{ textAlign: 'center', lineHeight: '100px', color: 'rgba(0, 0, 0, 0.45)' }}>暂无数据</div>
              : <div>
                <Timeline style={{ padding: '0px 0 0px 30px' }}>
                  {
                    actionDetails.map((detail, index) => {
                      return (
                        <Row key={uuidv4()}>
                          <Col span={4} style={{ bottom: '5px' }}>{moment(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Col>
                          <Col span={20}>
                            <TimelineItem >
                              <div className={styles.timeItem}>
                                <div className={styles.top}>
                                  <span style={{ marginLeft: 10, display: 'flex', flexWrap: 'wrap' }}>
                                    <span style={{ padding: '2px 3px' }}>{detail.actionNameCn.split('&')[0]}</span>
                                    {
                                      detail.actionNameCn.split('&').slice(1).map((item) => {
                                        let key = item.indexOf(':');
                                        return (
                                          <span style={{ padding: '2px 3px' }}>
                                            <span style={{ fontWeight: 700 }}>{item.substr(0, key)}</span>
                                            <span>{item.substr(key)}</span>
                                          </span>
                                        )
                                      })
                                    }
                                  </span>
                                  <span style={{ cursor: 'pointer' }} onClick={this.handleTimeItemVisible.bind(this, detail.index)} >
                                    <Icon type="down-circle" color='#fff' />
                                  </span>
                                </div>
                                <div className={styles.bottom} style={{ display: indexList.includes(detail.index) ? 'flex' : 'none' }}>
                                  {
                                    Object.keys(detail).map((key) => {
                                      if (key !== 'actionName' && key !== 'actionNameCn' && key !== 'actionColumnNames' && key !== 'appkey' && key !== 'appkey' && key !== 'timestamp' && key !== 'index') {
                                        const value = detail[key];
                                        return <span key={key}>{`${key}: ${value}`}</span>
                                      }
                                    })
                                  }
                                </div>
                              </div>
                            </TimelineItem>
                          </Col>
                        </Row>
                      )
                    })
                  }
                </Timeline>
                {isLoadingMore ? <Spin size='small' style={{ marginLeft: 182 }} /> : ''}
              </div>
            )


        }
        {
          actionDetails.length
            ? <Button style={{ margin: '15px 0 0 30px' }} onClick={this.handleQueryMoreDetail.bind(this)}>加载更多</Button>
            : ''
        }

      </div>

    );
  }
}


export default UserBehaviorDetail;

