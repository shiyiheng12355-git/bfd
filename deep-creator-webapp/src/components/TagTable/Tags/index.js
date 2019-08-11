import React, { Component, PropTypes } from 'react';
import Styles from './style.less';
import {Button, Row, Col, message,Icon} from 'antd';
import { connect } from 'dva';
import { routerRedux,Router, Route, Switch } from 'dva/router';
import TagTree from './../TagTree';
import BusinessTagTree from './../BusinessTagTree';
import uuid from 'uuid';
const uuidv4 = uuid.v4;
class Tags extends Component {
  constructor(props) {
    super(props);
    this.state={
      open: props.open !== undefined ? props.open : true, //是否折叠
    }
  }

  componentDidMount(){

  }
  changeCollapse=(index, e)=>{
    // e.cancelBubble = true;
    if(e.target.type === 'button'){
      return; 
    }
    e.stopPropagation();
    this.setState({open:!this.state.open});
    this.props.updateOpenStatus(index, !this.state.open);

  }
  secondTagTreeRender=(datas)=>{
    const {open} = this.props.open !== undefined ? this.props : this.state;
    let nodes=[];
    return datas.map((item)=>{
      return (
        <div  className={`${Styles.listBody} ${open?Styles.show:Styles.hidden} `} key={uuidv4()}>
        <TagTree  key={uuidv4()} tagData={item}/>
        </div>
      )
    });
  }
  //自定义标签渲染
  secondBusinessTagTreeRender=(datas)=>{
    const {open} = this.props.open !== undefined ? this.props : this.state;
    let nodes=[];
    return (
      <div  className={`${Styles.listBody} ${open?Styles.show:Styles.hidden} `} key={uuidv4()}>
      <BusinessTagTree onTagParentDeleteCustomtag={this.props.onParentHandleDeleteCustomtag}  key={uuidv4()} tagData={datas}/>
      </div>
    )
  }
  tagTreeRender=(obj, index)=>{
    let nodes =obj.children;
    const open = this.props.open !== undefined ? this.props.open : this.state.open;
    if( obj.tagCategoryEnglishName !=="busines_tag"){
      return (
        <div className={Styles.list} key={uuidv4()}>
        <Row className={Styles.listHeader} onClick={this.changeCollapse.bind(this, index)}>
          <Col span={24} className={Styles.listHeaderTitle} key={uuidv4()}>
             {obj.categoryName?obj.categoryName:obj.tagName}<i className={Styles.collapse}><Icon  type={`${open?"up":"down"}`}/></i>
          </Col>
        </Row>
          {
            nodes && nodes.length>0?this.secondTagTreeRender(nodes):null
          }
        </div>
      )
    }else{ // 自定义标签
      return (
        <div className={Styles.list} key={uuidv4()}>
        <Row className={Styles.listHeader} onClick={this.changeCollapse.bind(this, index)}>
          <Col span={24} className={Styles.listHeaderTitle} key={uuidv4()}>
             {obj.categoryName?obj.categoryName:obj.tagName}<Button type="primary" size='small' style={{ marginLeft: 5 }} onClick={this.props.onParentModalShow}>自定义标签</Button><i className={Styles.collapse}><Icon  type={`${open?"up":"down"}`}/></i>
          </Col>
        </Row>
          {
            nodes && nodes.length>0?this.secondBusinessTagTreeRender(nodes):null
          }
        </div>
      )
    }
    
  }
  
  render(){
    const self =this;
    const {treeData, index}=this.props;
    return (
          <div className={Styles.tags} key={uuidv4()}>
             <Row>
               <Col span={24}>
                  <div className={Styles.lists}>
                      {
                        treeData?this.tagTreeRender(treeData, index):null
                      }
                  </div>
               </Col>
             </Row>
          </div>
    );
  }
}

// export default MemberTrack

// 指定订阅数据
function mapStateToProps({  }) {
  return {
    
  };
}

// 建立数据关联关系
export default connect(mapStateToProps)(Tags);
