import React, { PureComponent } from 'react';
import { Spin, Tag } from 'antd';
import echarts from 'echarts';
import styles from './tagCharacter.less';
import { div } from 'gl-matrix/src/gl-matrix/vec3';

class TagCharacter extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      option : {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          },
          formatter: '{b}<br />标签占比:{c}',
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            data: [],
        },
        series: [
            {
                name: 'tgi',
                type: 'bar',
                data: [],
                color:["#108EE9"],
                barWidth:"20%"
            }
        ]
      }
    };

  }
  componentDidMount() {
    const { dispatch } = this.props;
    const hash = location.hash;
    const groupId = Number(hash.substring('2').split('/')[2]);
    dispatch({// 获取标签特征 TGI
      type: 'group/profile/getTGI',
      payload: { 
        groupId, 
        TGItype: 'GROUP',
        callback:(success) =>{
          console.log(this.props.TGIList,"调用tgi接口成功");
          console.log(success,"调用tgi接口成功success");
          let TGIList  = this.props.TGIList;
          this.chartRender(TGIList);
        }
      },
    })
  }
  
  chartRender(data){
    console.log("开始准备渲染数据->>>>>>>>>>>>>>>>");
    if(data && data.length >0){
      let chartData = [];
      let chartDataLabel = [];
      data.map((items)=>{
        chartData.unshift(items.tgi);
        let label= items.tagName +":" + items.tagValueTitle;
        chartDataLabel.unshift(label);
      });

      console.log("开始渲染->>>>>>>>>>>>>>>>");
      let target = document.getElementById("chartBar");
      console.log(target,"target ->>>>>>>>>>>>");
      if(target){
          let myChart =target  && echarts.init(target);
          let option = this.state.option;
          option.series[0].data= chartData;
          option.yAxis.data = chartDataLabel;
          myChart.setOption(option, true)
          window.onresize = myChart.resize
      }
    }
  }

  render() {
    let { TGIList } = this.props;
    // if (!TGIList.length) {
    //   TGIList = [
    //     {
    //       tagEnglishName: 'balancefunds',
    //       tgi: '9900.85646179093918',
    //       tagName: '资金余额--假的',
    //       tagValueTitle: '10万-50万',
    //     },
    //     {
    //       tagEnglishName: 'sex',
    //       tgi: '600.01248751248752',
    //       tagName: '性别',
    //       tagValueTitle: '男',
    //     },
    //     {
    //       tagEnglishName: 'edu',
    //       tgi: '1597.01248751248752',
    //       tagName: '学历',
    //       tagValueTitle: '高中',
    //     },
    //     {
    //       tagEnglishName: 'risk_level',
    //       tgi: '2398.01248751248752',
    //       tagName: '投资者风险类型',
    //       tagValueTitle: '稳健型',
    //     },
    //     {
    //       tagEnglishName: 'monthlyassets',
    //       tgi: '799.01248751248752',
    //       tagName: '当月日均资产',
    //       tagValueTitle: '30万以上',
    //     },
    //     {
    //       tagEnglishName: 'constellation',
    //       tgi: '3596.01248751248752',
    //       tagName: '星座',
    //       tagValueTitle: '金牛座',
    //     },
    //     {
    //       tagEnglishName: 'country',
    //       tgi: '7895.01248751248752',
    //       tagName: '证件省',
    //       tagValueTitle: '上海市',
    //     },
    //     {
    //       tagEnglishName: 'edu',
    //       tgi: '19900.01248751248752',
    //       tagName: '学历',
    //       tagValueTitle: '本科',
    //     },
    //     {
    //       tagEnglishName: 'age',
    //       tgi: '347.01248751248752',
    //       tagName: '年龄',
    //       tagValueTitle: '25-35岁',
    //     },
    //     {
    //       tagEnglishName: 'yearlyassets',
    //       tgi: '5478.01248751248752',
    //       tagName: '当年日均资产',
    //       tagValueTitle: '1万-2万',
    //     },
    //   ];
    // }

    console.log('TGIList------------', TGIList);

    return (
      <div className={styles.tagCharacter}>
              <div>特征发现报告：反映在特定研究范围内（如地理区域、人口统计学领域、媒体受众、产品消费者），目标群体的最主要特征</div>
              {
                TGIList.length > 0? <div id="chartBar" style={{ width: '100%', height: "500px" }}></div> :<div style={{ padding: 30, textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>暂无数据</div>
              }
      </div>
    );
  }
}


export default TagCharacter;

// {
//   TGIList.map((item, index) => {
//     return (
//       <Tag
//         key={item.tagEnglishName}
//         color="blue"
//         style={{ margin: 5 }}
//       >
//         {item.tagName}:{item.tagValueTitle}
//       </Tag>
//     )
//   })
// }

// TGIList: [
//   {
//     tagEnglishName: 'balancefunds',
//     tgi: '99.85646179093918',
//     tagName: '资金余额--假的',
//     tagValueTitle: '10万-50万',
//   },
//   {
//     tagEnglishName: 'sex',
//     tgi: '100.01248751248752',
//     tagName: '性别',
//     tagValueTitle: '男',
//   },
//   {
//     tagEnglishName: 'edu',
//     tgi: '97.01248751248752',
//     tagName: '学历',
//     tagValueTitle: '高中',
//   },
//   {
//     tagEnglishName: 'risk_level',
//     tgi: '98.01248751248752',
//     tagName: '投资者风险类型',
//     tagValueTitle: '稳健型',
//   },
//   {
//     tagEnglishName: 'monthlyassets',
//     tgi: '99.01248751248752',
//     tagName: '当月日均资产',
//     tagValueTitle: '30万以上',
//   },
//   {
//     tagEnglishName: 'constellation',
//     tgi: '96.01248751248752',
//     tagName: '星座',
//     tagValueTitle: '金牛座',
//   },
//   {
//     tagEnglishName: 'country',
//     tgi: '95.01248751248752',
//     tagName: '证件省',
//     tagValueTitle: '上海市',
//   },
//   {
//     tagEnglishName: 'edu',
//     tgi: '99.01248751248752',
//     tagName: '学历',
//     tagValueTitle: '本科',
//   },
//   {
//     tagEnglishName: 'age',
//     tgi: '97.01248751248752',
//     tagName: '年龄',
//     tagValueTitle: '25-35岁',
//   },
//   {
//     tagEnglishName: 'yearlyassets',
//     tgi: '98.01248751248752',
//     tagName: '当年日均资产',
//     tagValueTitle: '1万-2万',
//   },
// ],