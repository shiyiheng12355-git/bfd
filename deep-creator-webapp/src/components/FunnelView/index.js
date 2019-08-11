import React, { PureComponent } from 'react';
import { Popconfirm, Switch, Tooltip ,  Icon } from 'antd';
import moment from 'moment';
import styles from './index.less'


class FunnelView extends PureComponent {
  constructor(props) {
    super(props);

    const { value , data} = this.props;
    this.state = {
        value:value,
        data: data,
    };
  }


  render() {
    const { len, ondel, onState, onClick , value, data, counts } = this.props,isCounts = this.props.hasOwnProperty('counts');
    return (
        <div className={styles["eachfunel-left"]}>
            <div className={styles["eachfunel"]}>
                <div className={styles["eachfunel-bt"]}>
                <h4>{data.funnelName}</h4>
                <div className={styles["eachfunel-fun"]}>
                    <Popconfirm title={(Boolean(data.isMonitor)&&!this.props.hideBtn)?'该漏斗正在监听，确认删除？':"确定删除?"} onConfirm={() => {
                        ondel && ondel(data);
                    } }  okText="确定" cancelText="取消">
                    {/* <Icon type="delete"  style={{'cursor': 'pointer'}}/> */}
                    <Icon type="close" />
                    </Popconfirm>
                    {
                        this.props.hideBtn ? null : <div><span style={{verticalAlign:'-1px',marginRight:5}}>监听：</span><Switch checked={Boolean(data.isMonitor)} onChange={() => {
                            onState && onState(data);
                        }} checkedChildren="监听" unCheckedChildren="失效" /></div>
                    }
                </div>
                </div>
                <div className={styles["main-contaner-table"]} onClick={() => {
                    onClick && onClick(data)
                }}>
                <div className={styles["main-contaner"]}>
                    {data.bizFunnelStepPO.map(function(item, index) {
                    index = index + 1;
                    let entry_count = '暂无',
                        entry_ratio = '暂无',
                        trans_ratio = '暂无';
                    if (counts && Object.keys(counts)['length']>0 && item) {
                        entry_count = counts[item.id + ''];
                        if (entry_count != undefined) {
                            if (index == 0) {
                                entry_ratio = '100%';
                                trans_ratio = '100%';
                            } else {
                                entry_ratio = `${(counts[item.id + ''] * 100 / counts[data.bizFunnelStepPO[index - 1].id + '']).toFixed(2)}%`;
                                trans_ratio = `${(counts[item.id + ''] * 100 / counts[[data.bizFunnelStepPO[0].id + '']]).toFixed(2)}%`;
                            }
                        }
                    }
                    return (
                        <div className={`${styles['eachfunel-list']} ${styles['eachfunel-list0' + (index<8?index:'8')]} ${styles['eachfunel-list-width0' + (index<8?index:'8')]} ${styles['list']}`} key={index}>
                            <div style={{ marginTop: isCounts ?'-54px':'-45px'}} className={styles["eachfunel-list-font"]}>
                                <Tooltip placement="top" title={`步骤${index}: ${item.stepName}`}>
                                <div>
                                    <h5 style={{maxWidth: 270}}>步骤{index}: {item.stepName}</h5>
                                    {
                                        isCounts ? (<p title={`人数:${entry_count} 转化率:${entry_ratio} 到达率:${trans_ratio}`} style={{color:'#fff',maxWidth: 270,overflow: 'hidden',textOverflow: 'ellipsis',whiteSpace: 'nowrap'}}>
                                            <span>人数:{entry_count}</span>
                                            <span>转化率:{entry_ratio}</span>
                                            <span>到达率:{trans_ratio}</span>
                                        </p>): null
                                    }
                                </div>
                                </Tooltip>
                            </div>
                        </div>
                    )
                    })}
                </div>
                </div>
                <div className={styles["eachfunel-footer"]}>创建时间: {moment(data.traceBackStartDate).format('YYYY-MM-DD')}</div>
            </div>
        </div>
    );
  }
}
export default FunnelView