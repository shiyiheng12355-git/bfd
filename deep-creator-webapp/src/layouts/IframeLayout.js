import React, { Component } from 'react';
import { Route, Switch } from 'dva/router';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';

const { AuthorizedRoute } = Authorized;

export default class extends Component {
  constructor(props){
    super(props);
    this.website="";
  }
  componentDidMount() {
     // iframe窗口大小根据内容确定
     let website = this.website;
     let ifm = document.getElementById('outerlink');
     let subWeb = document.frames ? document.frames.outerlink.document : ifm.contentDocument;
     if (ifm != null && subWeb != null) {
      if(website != "IE" ){
        ifm.height = subWeb.body.scrollHeight;
      }
      if(website == "IE"){
        console.log(subWeb.body,"subWeb.body");
        //ifm.height="500px";
      }
    }


  }
  componentWillMount(){
    let website = this.getWeb();
    console.log(website,"website_test");
    if(website == "IE"){
      this.website = website;
    }
  }
  //判断浏览器类型
  getWeb(){
    if((!!window.ActiveXObject || "ActiveXObject" in window)){
      return "IE";
    }
    if(navigator.userAgent.indexOf("Firefox")!=-1){
      return "Firefox";
    }
    if(navigator.userAgent.indexOf("Chrome")!=-1){
      return "Chrome";
    }
    if(navigator.userAgent.indexOf("Safari")!=-1){
      return "Safari";
    }
  }
  render() {
    const { router, match } = this.props;
    const matchRoute = router[match.url];
    return (
      <iframe 
        id='outerlink'
        src={matchRoute.src}
        // scrolling='no'
        frameBorder="0"
        style={{ width: '100%', height: '100%', minHeight: '480px' }}
        title={matchRoute.name} />
    )
  }
}
