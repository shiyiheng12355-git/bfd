import React, { PureComponent } from 'react'
import { connect } from 'dva'
import PageHeaderLayout from '../../layouts/PageHeaderLayout'
import { Carousel,Radio } from 'antd';
import { Spin } from 'antd';
import echarts from 'echarts';
import styles from './index.less'
import { div } from 'gl-matrix/src/gl-matrix/vec3';
const RadioGroup = Radio.Group;

@connect(state => ({
  tagCount: state['tagCount'],
  user: state.user,
}))
export default class tagCount extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
        openPictureCarousel:true //是否显示图片轮播
    };
    this.chartDataLength = 0;
    this.chartMap = {
      cover: {
        color: '#44b1ec',
        name: '总覆盖人数'
      },
      increase: {
        color: '#aa90e1',
        name: '新增覆盖人数'
      },
      label: {
        color: '#58d2d4',
        name: '有效标签数'
      }
    };
    this.specialChartMap= {
        cover: {
            color: '#44b1ec',
            name: '总覆盖'
          },
          increase: {
            color: '#aa90e1',
            name: '新增覆盖'
          },
          label: {
            color: '#58d2d4',
            name: '有效标签数'
          }
    }

    this.option = {
        backgroundColor: '#29363C',
        color: ['#38b4ee',"#00BFFF","#FF00FF","#ffffff","#000000"],
        legend: {
            data: ['1', '2', '3', '4', '5', '6']
        },
        grid: {
            left: '3%',
            right: '3%',
            bottom: '3%',
        },
        toolbox: {
            feature: {
                
            }
        },
        title: {
            text: '',
            textStyle: {
                color: 'white'
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#dededf'
                },
                interval: 0,
                show:false
            },
            axisLine: {
                show: false,
                //    onZero:false
            },
            splitLine: { //网格线
                show: true,
                lineStyle: {
                    color: ['#ffffff'],
                    type: 'solid'
                }
            },
            data: ['2013', '2014', '2015', '2016', '2017', '2018']
        },
        yAxis: {
            axisTick: {
                show: false
            },
            axisLine: {
                show: false,
                //    onZero:false
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                },
                show:false
            },
            splitLine: { //网格线
                show: true,
                lineStyle: {
                    color: ['#ffffff'],
                    type: 'solid'
                }
            }
        },
        series: [{
            name: '',
            type: 'line',
            smooth: true,
            symbolSize: 8,
            color:["#ffffff"],
            data: ['48', '43', '41', '40', '24', '53', '47', '50', '49'],
            label: {
                normal: {
                    show: false,
                    position: 'top' //值显示
                }
            }
        
        }
        ]
    };
  }
  
  //function start
  //渲染echart
  chartRender(data){
    let chartData = data;
    let chartDataLength = Object.keys(chartData).length //判断chartData里面属性的个数
    if(chartData){
        
        //对特殊的实体进行特殊处理
        let special="";
        this.props.tagCount && this.props.tagCount.entityList && this.props.tagCount.entityList.length >0 && this.props.tagCount.entityList.map((items)=>{
            if(this.props.tagCount.entityId_chart == items.id && items.entityName == "产品"){
                special = items.entityName;
            }
        })

        //判断是否需要特殊处理
        if(special){
            for(var key in this.specialChartMap){
                if(chartData[key] && chartData[key].now == 0){
                    chartData[key].now ="0"
                }
                let now = chartData[key] && chartData[key].now || ""; //是否又覆盖人数
                let title ="";
                if(key == "label"){
                    title = now?(this.specialChartMap[key].name + ":"+now):this.specialChartMap[key].name ;  
                }
                if(key != "label"){
                    title = now?(this.specialChartMap[key].name + special + ":"+now):this.specialChartMap[key].name + special;   
                }
                let target = document.getElementById(`${key}Tag`)
                if(target){
                    let myChart =target  && echarts.init(target);
                    let option = this.option;
                    option.backgroundColor = this.specialChartMap[key].color;
                    option.title.text = title;
                    option.series[0].data= (chartData[key] && chartData[key].series)||[];
                    option.xAxis.data= (chartData[key] && chartData[key].xAxis)||[];
                    myChart.setOption(option, true)
                    window.onresize = myChart.resize
                }
               
              }
        }
        else{
            for(var key in this.chartMap){
                if(chartData[key] && chartData[key].now == 0){
                    chartData[key].now ="0"
                }
                let now = chartData[key] && chartData[key].now || "";  //是否又覆盖人数
                let title = now?(this.chartMap[key].name + ":"+now):this.chartMap[key].name;
                let target = document.getElementById(`${key}Tag`)
                if(target){
                    let myChart =target  && echarts.init(target);
                    let option = this.option;
                    option.backgroundColor = this.chartMap[key].color;
                    option.title.text = title;
                    option.series[0].data= (chartData[key] && chartData[key].series)||[];
                    option.xAxis.data= (chartData[key] && chartData[key].xAxis)||[];
                    myChart.setOption(option, true)
                    window.onresize = myChart.resize
                }
               
              }
        }
    }
    else{
        console.log("接口没有返回三个指标chartData");
    }

  }

  componentDidMount() {
    this.props.dispatch({
      type: 'tagCount/init',
      payload: {},
    }).then(res => {
      let chartData = this.props.tagCount.chartData;
      this.chartRender(chartData);
    })
  }

  //换一个实体
  chartChange = (e) => {
    this.props.dispatch({
      type: 'tagCount/chartChange',
      payload: { entityId: e.target.value },
    }).then(res => {
      let chartData = this.props.tagCount.chartData;
      this.chartRender(chartData);
    })   
  }

  render() {
    let title = '';
    const { entityId_chart,entityList }=this.props.tagCount;
    const { openPictureCarousel } = this.state;
    const chartMap = this.chartMap;
    const chartDataLength = this.chartDataLength;
    const radioOptions =entityList && entityList.length>0 && entityList.map(v => {
      return { label: v.entityName, value: v.id }
    })
    return (
      <div >
        {title ? <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '标签管理' }, { title }]} /> : <PageHeaderLayout />}
        <div className={styles.tagCount}>
          {
            openPictureCarousel?<div className={styles.contentTop}>
            <Carousel autoplay >
              <div><img  src="/imgs/pic-0.png" alt=""/></div>
              <div><img  src="/imgs/pic-1.png" alt=""/></div>
              <div><img  src="/imgs/pic-2.png" alt=""/></div>
            </Carousel>
        </div>:null
          }
          <div style={{flex:1}}>
            <RadioGroup options={radioOptions} onChange={this.chartChange} value={entityId_chart} style={{ marginBottom: 10 }}/>
            <div className={styles.echartGroup}>
              <div id="coverTag" className={styles.chart}></div> 
              <div id="increaseTag" className={styles.chart}></div> 
              <div id="labelTag" className={styles.chart} ></div> 
            </div>
          </div>
        </div>
      </div>
    );
  }
}
