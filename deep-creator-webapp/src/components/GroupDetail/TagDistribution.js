import React, { Component } from 'react';
import { Radio, Form, Spin, Input, message, Checkbox, Button, Icon } from 'antd';
import { routerRedux } from 'dva/router';
import _ from 'lodash';
import Tags from './Tags';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';


import styles from './tagDistribution.less';
import { div } from 'gl-matrix/src/gl-matrix/vec3';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class TagDistribution extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quotaVisible: false, // 添加指标的Modal
      checkedCustomerQuota: null, // 选中的指标
      checkdTags: null, // 所有的指标
      entityList: [],
    }
  }

  componentDidMount() {
    const hash = window.location.hash;
    const entityId = Number(hash.substring('2').split('/')[1]);

    const { dispatch } = this.props;
    // const { state } = location;
    // let { groupInfo = {} } = state;// TGIParams查询TGI的参数 TagDistributionParams查询标签分布的参数

    let { TagDistributionParams, TGItype } = this.props;
    // console.log(TagDistributionParams, TGItype, 'AAAAAAAAAAAAAAAAAAAAAAAAAAA');

    dispatch({
      type: 'entity/group/getEntityList',
      payload: {
        callback: (data) => {
          
          this.setState({entityList: data});
        }
      },
    })

    dispatch({ // 获取标签
      type: 'tagPicker/getTagNameList',
      payload: { entityId },
    })
    // console.log('TagDistributionParams---------------------', TagDistributionParams);

    dispatch({ // 获取已有的自定义指标
      type: 'group/profile/getDistriCustomerQuota',
      payload: {
        entityId,
        groupAnalyzeDimensionTypeEnum: 'TAG_DISTRIBUTION',
        callback: (distriCustomerQuota) => {
          const tagEnglishName = distriCustomerQuota.length ? distriCustomerQuota[0].tagEnglishName : '';
          dispatch({ // 柱状图数据
            type: 'group/profile/getTagDistribution',
            payload: { ...TagDistributionParams, tagEnglishName, TGItype },
          })
        },
      },
    })
  }

  handleQuotaShowClick = () => {
    this.setState({
      quotaVisible: true,
    })
  }

  handleQuotaHideClick = () => {
    this.setState({
      quotaVisible: false,
    })
  }

  handleCustomerQuotaChange = (e) => {
    const { value } = e.target;
    this.setState({
      checkedCustomerQuota: value,
    }, () => {
      this.props.handleChangetagDistribution(value);
    })
  }

  handleAddtCustomerQuota = (checked, callback) => {
    const { distriCustomerQuota = [] } = this.props;
    let initialCustomerQuotaVal = distriCustomerQuota.map(item => item.tagEnglishName);
    let checkdTags = [];
    checked.forEach((item) => {
      if (!initialCustomerQuotaVal.includes(item)) { // 过滤掉初始化的指标
        checkdTags.push(item)
      }
    })
    this.props.handleAddtCustomerQuota(checkdTags, (success) => {
      if (success) {
        message.success('增加成功');
        this.setState({
          quotaVisible: false,
          checkdTags: checked,
        })
        if (callback) callback(success);
      } else {
        message.error('增加失败');
      }
    });
  }

  handleDelCustomerQuota = (id, value, e) => { // value
    // debugger;
    e.preventDefault();
    const { distriCustomerQuota = [] } = this.props;
    const { checkedCustomerQuota = [], checkdTags } = this.state;
   // if (e.target.id === 'delete') {
      this.props.handleDelCustomerQuota(id, (success) => {
        if (success) {
          message.success('删除成功');

          let tags = checkdTags || distriCustomerQuota.map(item => item.tagEnglishName);
          this.setState({
            checkdTags: tags.filter(item => item !== value),
          })

          if (checkedCustomerQuota !== value) { // 说明要删除的是不当前选中的button,这时候不再执行下面的逻辑
            return false;
          }

          this.setState({
            checkedCustomerQuota: distriCustomerQuota.length ? distriCustomerQuota[0].tagEnglishName : '',
          }, () => {
            this.props.handleChangetagDistribution(this.state.checkedCustomerQuota);
          })
        } else {
          message.error('删除失败');
        }
      });
    //}
  }

  render() {
    const { quotaVisible, checkdTags, entityList } = this.state;
    const { distriCustomerQuota = [], tagDistribution = [], tagNameList = [], tagDistributionLoading, size = 'small' } = this.props;
    const defaultCheckedCustomerQuota = distriCustomerQuota.length ? distriCustomerQuota[0].tagEnglishName : '';
    const defaultcheckedTags = distriCustomerQuota.map(item => item.tagEnglishName);
    const customerAndUserNum  = this.props.customerAndUserNum?this.props.customerAndUserNum:"";
    const basicInfo = this.props.basicInfo?this.props.basicInfo:"";
    let { groupName, groupType, categoryName, groupDesc, entityId,createTime } = basicInfo;
    const tagProps = {
      tagNameList,
      quotaVisible,
      defaultcheckedTags: checkdTags || defaultcheckedTags,
      handleQuotaHideClick: this.handleQuotaHideClick,
      handleAddtCustomerQuota: this.handleAddtCustomerQuota,
    }
    // console.log('tagDistribution--------------', tagDistribution);
    // console.log('distriCustomerQuota--------------', distriCustomerQuota);
    // console.log('tagDistributionLoading-----------', tagDistributionLoading);

    let [barXData, barYData] = [[], []];

    tagDistribution.length !== 0 && tagDistribution.forEach((item) => {
      if (item.tagValueTitle === '') item.tagValueTitle = '未知';
      barXData.push(item.tagValueTitle);
      barYData.push(item.num);
    })

    const barOption = {
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: barXData,
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: '60%',
          data: barYData,
        },
      ],
    };

    let entityName = '用户';
    entityList.forEach((item) => {
      if (entityId === item.id) { // 7所有群 8特别关注群
        entityName = item.entityName;
      }
    })
    // console.log('tagDistribution-------------------', tagDistribution);

    return (


      <div className={styles.distribution}>
        <div>
          {
            
            basicInfo?<div><p>所在群组：<b>{basicInfo.groupName}</b></p></div>:null
            
            
          }
          {/* {
            customerAndUserNum && basicInfo && customerAndUserNum[basicInfo.id]?<div><span>客户数：<b>{customerAndUserNum[basicInfo.id].customerNum}</b></span><span style={{marginLeft:"5px"}}>用户数：<b>{customerAndUserNum[basicInfo.id].userNum}</b></span></div>:null
          } */}
           {
            customerAndUserNum && basicInfo && customerAndUserNum[basicInfo.id]?<div><span>{entityName}数：<b>{customerAndUserNum[basicInfo.id].customerNum}</b></span></div>:null
          }
        </div>
        <div style={{ display: 'flex' }}>
          <FormItem>
            {
              <RadioGroup
                size={size}
                onChange={this.handleCustomerQuotaChange}
                value={this.state.checkedCustomerQuota || defaultCheckedCustomerQuota}
              >
                {
                  distriCustomerQuota.map((item, index) => {
                    return (
                      <RadioButton key={item.tagEnglishName} value={item.tagEnglishName}>
                        {item.tagName}
                        {
                          item.dimensionType === 'TAG_DISTRIBUTION' &&
                          <Icon
                            type="close-circle-o"
                            id='delete'
                            style={{ marginLeft: 5, fontSize: 12 }}
                            onClick={this.handleDelCustomerQuota.bind(this, item.id, item.tagEnglishName)}
                          />
                        }
                      </RadioButton>
                    )
                  })
                }
              </RadioGroup>
            }
          </FormItem>

          <FormItem>
            <Button type='primary' size='small' onClick={this.handleQuotaShowClick} >新建</Button>
            <Tags {...tagProps} />
          </FormItem>
        </div>
        <div >

          <div style={{ width: '90%' }}>
            {
              tagDistributionLoading
                ? <div style={{ textAlign: 'center' }}><Spin /></div>
                : (tagDistribution.length > 0
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


export default Form.create()(TagDistribution);

