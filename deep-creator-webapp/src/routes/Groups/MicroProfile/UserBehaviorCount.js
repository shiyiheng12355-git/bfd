import React, { Component } from 'react';
import { Radio, Spin } from 'antd';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';

import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/tooltip';

// const RadioGroup = Radio.Group;
// const RadioButton = Radio.Button;

class UserBehaviorCount extends Component {
  // handleRadioChange = (e) => {
  //   console.log(`radio checked:${e.target.value}`);
  // }

  render() {
    let { actionCounts = [], actionCountsByTime = [], countLoading, byTimeLoading, selectPieName } = this.props;

    // console.log('actionCounts---------------', actionCounts);
    // console.log('actionCountsByTime---------------', actionCountsByTime);

    if (selectPieName === '') {
      let maxCount = actionCounts.reduce((pre, cur) => {
        if (pre.num > cur.num) {
          return pre;
        } else {
          return cur;
        }
      }, { num: -1000 })
      selectPieName = maxCount.actionNameCn;
    }

    actionCounts = actionCounts.map((item) => {
      let selected = false;
      if (selectPieName === item.actionNameCn) {
        selected = true;
      }
      return {
        selected,
        value: item.num,
        name: item.actionNameCn,
      }
    })

    const barXData = [];
    const barYData = [];

    actionCountsByTime.forEach((item) => {
      barXData.push(item.time);
      barYData.push(item.num)
    })


    const pieOpion = {
      tooltip: {
        trigger: 'item',
        // formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      series: [
        {
          // name: '访问来源',
          type: 'pie',
          radius: ['30%', '70%'],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
            },
          },
          data: actionCounts,
        },
      ],
    };

    const barOption = {
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      grid: {
        left: '15%',
        right: '15%',
        // bottom: '3%',
        // containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: barXData.map(item => item.replace(/-/g, '/')),
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
      },
      dataZoom: [{
        show: actionCountsByTime.length > 7,
        start: actionCountsByTime.length > 7 ? 15 : 0,
        end: actionCountsByTime.length > 7 ? 45 : 100,
      }, {
        type: 'inside',
        filterMode: 'filter',
      }, {
        show: false,
        yAxisIndex: 0,
        filterMode: 'empty',
        showDataShadow: false,
        // width: 30,
        // height: '80%',
        // left: '93%'
      }],
      series: [{
        name: selectPieName,
        type: 'bar',
        data: barYData,
      }],
    };


    return (

      <div style={{ marginTop: 10 }}>
        <h4>用户行为信息统计</h4>
        <div style={{ display: 'flex', minHeight: actionCounts.length <= 0 && actionCountsByTime.length <= 0 ? 200 : 300, alignItems: 'center' }}>
          <div style={{ width: '45%' }}>
            {
              countLoading
                ? <div style={{ textAlign: 'center' }}><Spin /></div>
                : (actionCounts.length > 0
                  ? <ReactEchartsCore
                    echarts={echarts}
                    option={pieOpion}
                    notMerge
                    lazyUpdate
                    onEvents={{
                      click: this.props.handleActionCountClick,
                    }}
                  />
                  : <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>暂无数据</div>)
            }
          </div>

          <div style={{ width: '55%' }}>
            {
              byTimeLoading
                ? <div style={{ textAlign: 'center' }}><Spin /></div>
                : (actionCountsByTime.length > 0
                  ? <ReactEchartsCore
                    echarts={echarts}
                    option={barOption}
                    notMerge
                    lazyUpdate
                  />
                  : <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>暂无数据</div>)
            }
          </div>
        </div>
      </div>

    );
  }
}


export default UserBehaviorCount;

// <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
//          <span>最小时间单位:</span>
//          <RadioGroup onChange={this.handleRadioChange} defaultValue="day">
//            <RadioButton value="day">日</RadioButton>
//            <RadioButton value="week">周</RadioButton>
//            <RadioButton value="month">月</RadioButton>
//          </RadioGroup>
//        </div>