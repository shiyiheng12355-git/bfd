import React, { Component } from 'react';
import { Icon,Spin,Row,Col,Tooltip,Tag } from 'antd';
import styles from './UserPortrait.less';

let timesWatch = "";
//用户画像
class UserPortrait extends Component {
  constructor(props){
    super(props);
    this.state = {
      inmageLoadFinsh:false,
      //维度最多只展示6个
      // customerTag:[
      //   {"name":"客户基本信息","id":"basic_info"},
      //   {"name":"客户区域位置","id":"geo_location"},
      //   {"name":"客户渠道特征","id":"cus_channel"},
      //   {"name":"客户业务偏好","id":"busi_prefer"},
      //   {"name":"客户价值属性","id":"valueAttribute"},
      //   {"name":"客户交易情况","id":"trade_situ"},
      // ],//客户标签定的展示纬度

      // productTag:[
      //   {"name":"市场销售特征","id":"pro_attribute"},
      //   {"name":"产品基本属性","id":"market_char"},
      //   {"name":"投研能力","id":"research_ability"},
      // ],//产品标签定的展示纬度
    }
    // this.testData={
    //   "sex":"男",
    //   "survy":[
    //   {"cate":"客户业务偏好","cateEng":"busi_prefer","info":[{"path":"风险偏好/持有风险偏好","name":"纯持有中低风险基金客户","pathEng":"/busi_prefer/risk_prefer/holdrisk_pref"},{"path":"交易行为偏好/操作风格偏好","name":"纯短线交易型客户","pathEng":"/busi_prefer/transbeha_prefer/follow_cust"},{"path":"风险偏好/交易风险偏好","name":"纯交易中低风险基金","pathEng":"/busi_prefer/risk_prefer/traderisk_pref"}]},
    //   {"cate":"客户价值属性","cateEng":"valueAttribute","info":[{"path":"客户价值评估/交易活跃度","name":"中活跃度","pathEng":"/valueAttribute/value_assess/trade_active"},{"path":"客户价值评估/持有忠诚度","name":"短时间持有客户","pathEng":"/valueAttribute/value_assess/hold_loyal"}]},
    //   {"cate":"客户交易情况","cateEng":"trade_situ","info":[{"path":"最近一次交易情况/最近一次交易类型_客户","name":"快速过户出","pathEng":"/trade_situ/last_trade/neartrade_type1"},{"path":"最近一次交易情况/最近一次交易产品","name":"南方现金通E","pathEng":"/trade_situ/last_trade/neartrade_prod"}]},
    //   {"cate":"客户区域位置","cateEng":"geo_location","info":[{"path":"户籍地/市","name":"葫芦岛市","pathEng":"/geo_location/domi_place/city"},{"path":"手机号码归属地/市","name":"哈尔滨市","pathEng":"/geo_location/phone_adress/city_1"}]},
    //   {"cate":"客户基本信息","cateEng":"basic_info","info":[{"path":"人口属性/性别-ces","name":"男","pathEng":"/basic_info/popu_attr/sex"},{"path":"人口属性/年龄段","name":"25-34岁","pathEng":"/basic_info/popu_attr/age"}]}
    //   ]
    // }
    //this.testData={"sex":"女","survy":[{"cate":"客户业务偏好","cateEng":"busi_prefer","info":[{"path":"风险偏好/持有风险偏好","name":"纯持有中低风险基金客户","pathEng":"/busi_prefer/risk_prefer/holdrisk_pref"},{"path":"风险偏好/交易风险偏好","name":"纯交易中低风险基金","pathEng":"/busi_prefer/risk_prefer/traderisk_pref"}]},{"cate":"客户渠道特征","cateEng":"cus_channel","info":[{"path":"代销渠道/银行","name":"工商银行","pathEng":"/cus_channel/con_channel/bank"},{"path":"自有渠道/自有渠道","name":"南方基金","pathEng":"/cus_channel/own_channel/own_channel1"},{"path":"自有渠道/合作渠道","name":"上海天天","pathEng":"/cus_channel/own_channel/coop_channel"}]},{"cate":"客户价值属性","cateEng":"valueAttribute","info":[{"path":"客户价值评估/持有忠诚度","name":"短时间持有客户","pathEng":"/valueAttribute/value_assess/hold_loyal"},{"path":"客户价值评估/交易活跃度","name":"高活跃度","pathEng":"/valueAttribute/value_assess/trade_active"}]},{"cate":"客户基本信息","cateEng":"basic_info","info":[{"path":"人口属性/性别","name":"女","pathEng":"/basic_info/popu_attr/sex"},{"path":"人口属性/年龄段","name":"35-49岁","pathEng":"/basic_info/popu_attr/age"}]},{"cate":"客户区域位置","cateEng":"geo_location","info":[{"path":"手机号码归属地/市","name":"济南市","pathEng":"/geo_location/phone_adress/city_1"},{"path":"户籍地/市","name":"东营市","pathEng":"/geo_location/domi_place/city"}]},{"cate":"客户交易情况","cateEng":"trade_situ","info":[{"path":"最近一次交易情况/最近一次交易类型_客户","name":"快速过户出","pathEng":"/trade_situ/last_trade/neartrade_type1"},{"path":"最近一次交易情况/最近一次交易产品","name":"南方现金通E","pathEng":"/trade_situ/last_trade/neartrade_prod"},{"path":"最近一次交易情况/最近一次交易渠道_客户","name":"南方基金","pathEng":"/trade_situ/last_trade/neartrade_channel1"}]}]}
    //this.testData2={"sex":"男","survy":[{"cate":"客户业务偏好","cateEng":"busi_prefer","info":[{"path":"风险偏好/持有风险偏好","name":"纯持有中低风险基金客户","pathEng":"/busi_prefer/risk_prefer/holdrisk_pref"},{"path":"风险偏好/交易风险偏好","name":"纯交易中低风险基金","pathEng":"/busi_prefer/risk_prefer/traderisk_pref"}]},{"cate":"客户价值属性","cateEng":"valueAttribute","info":[{"path":"客户价值评估/交易活跃度","name":"高活跃度","pathEng":"/valueAttribute/value_assess/trade_active"},{"path":"客户价值评估/持有忠诚度","name":"短时间持有客户","pathEng":"/valueAttribute/value_assess/hold_loyal"}]},{"cate":"客户交易情况","cateEng":"trade_situ","info":[{"path":"最近一次交易情况/最近一次交易类型_客户","name":"申购","pathEng":"/trade_situ/last_trade/neartrade_type1"},{"path":"最近一次交易情况/最近一次交易产品","name":"南方天天利B","pathEng":"/trade_situ/last_trade/neartrade_prod"},{"path":"最近一次交易情况/最近一次交易渠道_客户","name":"华泰证券","pathEng":"/trade_situ/last_trade/neartrade_channel1"}]},{"cate":"客户区域位置","cateEng":"geo_location","info":[{"path":"户籍地/市","name":"上海市","pathEng":"/geo_location/domi_place/city"},{"path":"手机号码归属地/市","name":"南京市","pathEng":"/geo_location/phone_adress/city_1"}]},{"cate":"客户基本信息","cateEng":"basic_info","info":[{"path":"人口属性/性别","name":"男","pathEng":"/basic_info/popu_attr/sex"},{"path":"人口属性/年龄段","name":"35-49岁","pathEng":"/basic_info/popu_attr/age"}]}]}
  }

  componentWillMount(){

    // timesWatch = window.setTimeout(this.imageOnload.bind(this),500);//使用字符串执行方法
    
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.microSurvey != this.props.microSurvey){
      this.setState({microSurvey: nextProps.microSurvey });
    }
  }
  componentDidMount(){
    const {microSurvey} = this.props;
    this.setState({microSurvey: microSurvey});
  }
  changeSexChinesToEnglish(sex){
    if(!sex){
      return "product"
    }
    if(sex == "女"){
      return "woman"
    }
    if(sex == "男"){
      return "man"
    }
    if(sex == "其他"){
      return "man"
    }
  }
  // imageOnload(){
  //   var img=new Image();
  //   img.src='/imgs/man.png';
  //   img.src='/imgs/woman.png';
  //   img.src='/imgs/unknown.png';
  //   img.src='/imgs/product.png';
  //   if(img.width==0){
  //   }else{
  //       window.clearTimeout(timesWatch);
  //       this.setState({inmageLoadFinsh:true});
  //   }
  // }
  formatterDataToAllArr=(data)=>{
    let tmpArr=[];
    data.map((items)=>{
        let tmparr=items.info;
        tmparr.map((item)=>{
          let obj ={};
          let parent = items;
          obj.path= item.path;
          obj.name=item.name;
          obj.cate = parent.cate;
          obj.cateEng = parent.cateEng;
          obj.title = item.path.split("/")[item.path.split("/").length-1];
          tmpArr.push(obj);
        })
    });
    return tmpArr;
  }
  formatterDataTo8Group=(data)=>{
    let datas =this.formatterDataToAllArr(data);//先把数据 处理成一个数组
    let tmpArr= [];
    datas.map((item,i)=>{
      let num = Math.ceil(i%8);
      if(!tmpArr[num]){
        tmpArr[num] = [];
        tmpArr[num].push(item);
      }else{
        tmpArr[num].push(item);
      }
    });
    return tmpArr;
  }
  tagPortraitRender=(data,direction)=>{
    let arr=this.formatterDataTo8Group(data);
    return arr.map((items,nums)=>{
      let parentWidh = this.refs.userPortrait.offsetWidth/2-10;
      if(direction ==0){
        if(nums%2==0){
          return (
            <div className={`list ${nums%2==0?"left":"right"} list${nums} ${items.length ==1?"fullTag":""}`}>
                <Row type="flex" justify={`${nums%2==0?"end":"start"}`}>
                  <Col>
                    {
                     items.map((item,i)=>{
                      var isNeedCut = false;
                      let num,nextNum,width,maxwidth;
                      num = item.title.length + item.name.length+1; //每个字16px
                      if(items[i+1]){
                        nextNum = items[i+1].title.length + items[i+1].name.length+1; //每个字16px
                        if(num > nextNum){
                          width = nextNum *16
                          maxwidth =  parentWidh * 0.83 -width-items.length*8-3*16;
                          isNeedCut = true;
                        }else{
                          width = num *16
                          maxwidth =  parentWidh * 0.83 -width-items.length*8-3*16;
                          isNeedCut = true;
                        }
                      }else{

                      }
                       if(!isNeedCut){
                        return (
                          <Tooltip placement="top" title={`${item.path}:${item.name}`}>
                            <Tag color="blue"><i>{item.title}:</i><b>{item.name}</b></Tag>
                          </Tooltip>
                        )
                       }else{
                        return (
                          <Tooltip placement="top" title={`${item.path}:${item.name}`}>
                            <Tag style={{maxWidth:maxwidth+"px"}} color="blue"><i>{item.title}:</i><b>{item.name}</b></Tag>
                          </Tooltip>
                        )
                       }
                      })
                    }
                  </Col>
                </Row>   
            </div>
          )
        }
      }else{
        if(nums%2!=0){
          return (
            <div className={`list ${nums%2==0?"left":"right"} list${nums} ${items.length ==1?"fullTag":""}`}>
                <Row type="flex" justify={`${nums%2==0?"end":"start"}`}>
                  <Col>
                  {
                     items.map((item,i)=>{
                      var isNeedCut = false;
                      let num,nextNum,width,maxwidth;
                      num = item.title.length + item.name.length+1; //每个字16px
                      if(items[i+1]){
                        nextNum = items[i+1].title.length + items[i+1].name.length+1; //每个字16px
                        if(num > nextNum){
                          width = nextNum *16
                          maxwidth =  parentWidh * 0.83 -width-items.length*8-3*16;
                          isNeedCut = true;
                        }else{
                          width = num *16
                          maxwidth =  parentWidh * 0.83 -width-items.length*8-3*16;
                          isNeedCut = true;
                        }
                      }else{

                      }
                       if(!isNeedCut){
                        return (
                          <Tooltip placement="top" title={`${item.path}:${item.name}`}>
                            <Tag color="blue"><i>{item.title}:</i><b>{item.name}</b></Tag>
                          </Tooltip>
                        )
                       }else{
                        return (
                          <Tooltip placement="top" title={`${item.path}:${item.name}`}>
                            <Tag style={{maxWidth:maxwidth+"px"}} color="blue"><i>{item.title}:</i><b>{item.name}</b></Tag>
                          </Tooltip>
                        )
                       }
                      })
                    }
                  </Col>
                </Row>   
            </div>
          )
        }
      }
      
    })
  }

  render() {
    //const {microSurvey} = this.props;
    const {microSurvey} =this.state;
    let microSurveyObject = "";
    let picture = ""
    if(microSurvey ){
      microSurveyObject = microSurvey;
      picture = this.changeSexChinesToEnglish(microSurveyObject.sex);
    }
    return (
      <div className={styles.userPortrait} ref="userPortrait">
       {
         microSurveyObject && microSurveyObject.survy && microSurveyObject.survy.length >0?(
          <div className={`userGraph ${picture}`}>
            <Row >
              <Col span={12} style={{height:200 ,position:"relative"}}>
                {this.tagPortraitRender(microSurveyObject.survy,0)} 
              </Col>
              <Col span={12} style={{height:200 ,position:"relative"}}>
                {this.tagPortraitRender(microSurveyObject.survy,1)} 
              </Col>
            </Row>
          </div> 
         ):(<div style={{ display:"flex",justifyContent:"center",alignItems:"center",height:200, color: 'rgba(0, 0, 0, 0.45)' }}>暂无数据</div>)
       }   
      </div>
    );
  }
}


export default UserPortrait;
