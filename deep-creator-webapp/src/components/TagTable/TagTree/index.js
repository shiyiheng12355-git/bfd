import React, { PureComponent } from 'react';
import { routerRedux,Router, Route, Switch } from 'dva/router';
import { Row, Col, message,Icon, Collapse} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import PropTypes from 'prop-types';
import styles from './index.less';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
const uuidv4 = uuid.v4;
export default  class TagTree extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open:false, //是否折叠
      show:false, //是否出现折叠按钮
      tagData:this.props.tagData,
      reRender:1, //强制让页面刷新
    };
    this.dateFormat= 'YYYY-MM';
  }
  componentDidMount(){
    let node = this.refs.tagTreeBody;
    if(node && node.offsetHeight && node.offsetHeight>33){ //判断需要折叠 再添加点击事件
      node.parentNode.parentNode.onclick=this.changeCollapse.bind(this);
      this.setState({show:true});
    }
  }

  changeCollapse=(e)=>{
    e.stopPropagation();
    this.setState({open:!this.state.open});
  }
  
  specialRender(data,path) {
    let tmpPath = path;
    return data.map((item, i) => {
      let tPath= tmpPath;
      if(item.categoryName){
        tPath= tPath+"-"+item.categoryName;
      }
      if(item.tagName){
        tPath= tPath+"-"+item.tagName;
      }

      if (item.children) {
          return this.specialRender(item.children,tPath);
      }else{
        return (
          <span className={styles.tags} key={uuidv4()}>
            <i>{tPath}:</i> {
              item.tagvalue.split(",").map((its)=>{
                if(its || its ===0){
                  return (<b>{its}</b>)
                }
              })
              }
            </span>
        )
      }
    })
  }

  tagValueRender=(datas,parent)=>{
    let parentNode=parent;
    return datas.map((item)=>{
        if(item.tagName){ //只有三级的 (不包含标签值)
          return (
            <span className={styles.tags} key={uuidv4()}>
              <i>{item.tagName}:</i> {
                item.tagValueTitle.split(",").map((its)=>{
                  if(its || its ===0){
                    return (<b>{its}</b>)
                  }
                })
                }
              </span>
          )
        }else{
          let path = item.categoryName;
         return (this.specialRender(item.children,path));//超过三级的渲染
        }
    });
  }
  render() {
    const {tagData} =this.state;
    const {show,open,reRender} = this.state;
    return (
      <div className={styles.tagTree}>
        {
          tagData && (tagData.tagName||tagData.categoryName)?
          ( 
            <div>
              <Row style={{cursor:"pointer"}} >
                <Col span={4} className={styles.tagTreeHeader}>
                    {tagData.tagName?tagData.tagName:tagData.categoryName}:
                </Col>
                <Col span={20} className={`${styles.tagTreeBody} ${open?styles.show:styles.hidden} `} >
                  <span ref="tagTreeBody">
                     {
                      reRender && tagData.children && tagData.children.length>0?this.tagValueRender(tagData.children,tagData):null
                      }
                  </span>
                  {show? <i  className={styles.collapse} ><Icon type={`${open?"left":"right"}`} /></i>:null}
                </Col>
              </Row>
            </div>
          ):""
        }
      </div>
    );
  }
}



