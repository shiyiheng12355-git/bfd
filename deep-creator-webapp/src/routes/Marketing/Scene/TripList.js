import React, { PureComponent } from 'react';
import { Link } from 'dva/router'
import { Button, Tooltip, Popover } from 'antd';

import styles from './TripList.less';

export default class TripList extends PureComponent {
  state = {
    data: [],
    current: this.props.current,
    open: false,
  }

  componentDidMount() {
    const { dispatch } = this.props;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    })
  }

  numClick(i, item) {
    let open = false
    if (i + 1 === this.state.current) {
      open = !this.state.open
    }
    this.setState({
      current: i + 1,
      open,
    })
    if (this.props.numChange) {
      this.props.numChange({
        current: i + 1,
        item,
        open,
      })
    }
  }

  btnClick(i, item) {
    if (this.props.btnClick) {
      this.props.btnClick({
        current: i + 1,
        item,
      })
    }
  }

  toThousands = (num) => {
    return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  }

  buildGroupInfo = (item) => { // 构建接口需要的ID
    return {
      bizLifeTripGroupId: item.bizLifeInfo.groupId, //
      bizLifeTripGroupIncludePreGroupConditionJson: '',
      bizLifeTripId: item.bizLifeInfo.id,
      entityId: item.bizLifeInfo.entityId,
      groupId: this.props.groupId,
      groupIncludePreGroupConditionJson: '',
    }
  }

  render() {
    const { data, current, open } = this.state;
    return (
      <div className={styles.tripList}>
      {
        data.map((item, i) => {
          const { bizAutoMarketingPOLists, bizFunnelVOList, bizLifeInfo } = item;
          const { conditionsDesc } = JSON.parse(bizLifeInfo.conditonDesc);
          let gksk = [];
          conditionsDesc && conditionsDesc.length > 0 && conditionsDesc.map((x, y) => {
            let temp = (<div key={y+'@'}>
              {y > 0 ? <div>{x.relationDesc}</div> : null}
              <div>{`• 条件${y + 1}:`}</div>
              <div>
                {
                  x.onlineActionDesc && x.onlineActionDesc.length > 0 && x.onlineActionDesc.map((k, j) => {
                    return <div>{'客户端:' + k.appkeyDesc + ' 行为组合时间: ' + k.dateDesc + ' 事件:' + k.eventDesc.actionname + k.eventDesc.condition + k.eventDesc.count}</div>
                  })
                }
              </div>
            </div>);
            gksk.push(temp);
          });
          return (
            <div className={`${styles.flexItem} ${current - 1 == i ? styles.active : null} ${current - 1 === i && open ? styles.open : null}` } key={i+'_a'}>
              <div className={styles.numb}>
                <span className={styles.numWrap}>
                  <div className={styles.num}
                      onClick={() => { this.numClick(i, item) }}>
                      <img src={require('../../../assets/imgs/users.png')}/>
                  </div>
                </span>
              </div>
              <Popover
                content={<div className={styles.tripSeeMore}>
                    <div className={styles.item} style={{ marginBottom: '4px' }}>
                      <div>关键时刻：</div>
                     {gksk && gksk.length > 0 ? gksk.map((m, n) => <div key={n+'_b'}>{m}</div>) :'• 暂无'}
                      <div style={{marginTop:'10px'}}>营销动作:</div>
                      <div className={styles.name}>• 决策树:</div>
                      {
                        bizAutoMarketingPOLists && bizAutoMarketingPOLists.length > 0 ? (
                          bizAutoMarketingPOLists.map((m, n) => {
                            return (<Button key={n+'_c'}
                            type="primary"
                            size="small"
                            >
                            <Link to={{
                              pathname: `/marketing/automation/${m.id}`,
                              state: {
                                TGItype: 'LIFE_AUTOMATION',
                                ...m,
                                extraParams: { bizLifeTripInfoParam: this.buildGroupInfo(item) },
                              },
                              }} >{m.maketingName}</Link>
                            </Button>)
                          })
                        ) : '暂无'
                      }
                    </div>
                    <div className={styles.item}>
                      <div className={styles.name}>• 漏斗:</div>
                      {
                        bizFunnelVOList && bizFunnelVOList.length > 0 ? (
                          bizFunnelVOList.map((m, n) => {
                            return (<Button key={n+'_e'}
                            type="primary"
                            size="small"
                            onClick={() => {
                              if (this.props.btnClick) {
                                this.props.btnClick({
                                  current: i + 1,
                                  type: 'funnel',
                                  item: m,
                                  bizLifeInfo,
                                })
                              }
                            }}>
                            {m.funnelName}
                            </Button>)
                          })
                        ) : '暂无'
                      }
                    </div>
                  </div>}
                trigger="hover">
                <div> {bizLifeInfo.nodeName}</div>
                <div>{this.toThousands(item.bizLifeInfo.peopleSum)}</div>
              </Popover>
            </div>
          )
        })
      }
      </div>
    )
  }
}
