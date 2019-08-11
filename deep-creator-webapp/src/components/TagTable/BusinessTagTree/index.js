import React, { PureComponent } from 'react';
import { routerRedux,Router, Route, Switch } from 'dva/router';
import { Row, Col, message,Icon, Collapse,Popconfirm} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import PropTypes from 'prop-types';
import styles from './index.less';
import ReactDOM from 'react-dom';
import uuid from 'uuid';
const uuidv4 = uuid.v4;
export default  class BusinessTagTree extends PureComponent {
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
  
  deleteCustomer=(tagEnglishValueTitle)=>{
    this.props.onTagParentDeleteCustomtag(tagEnglishValueTitle)
  }


  customTagRender=(datas)=>{
    return datas.map((item)=>{
      return (
        <span className={styles.tags} key={uuidv4()}>
          {
            (<Popconfirm
              title={`确认是否删除自定义标签值"${item.tagValueTitle}"`}
              onConfirm={this.deleteCustomer.bind(this,item.tagEnglishValueTitle)}
            >
               <b>{item.tagValueTitle}</b>
              <Icon style={{ marginLeft: 5, cursor: 'pointer', fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}
                type="delete"
              />
            </Popconfirm>)
            // item.tagValueTitle.split(",").map((its)=>{
            //   if(its || its ===0){
            //     return (<b>{its}</b>)
            //   }
            // })
          }
          </span>
      )
    })
  }
  render() {
    const {tagData} =this.state;
    const {show,open,reRender} = this.state;
    return (
      <div className={styles.tagTree}>
        {
            tagData?(
              <div>
              <Row style={{cursor:"pointer"}} >
                <Col span={4} className={styles.tagTreeHeader}>
                    自定义标签值:
                </Col>
                <Col span={20} className={`${styles.tagTreeBody} ${open?styles.show:styles.hidden} `} >
                  <span ref="tagTreeBody">
                    {
                      reRender?this.customTagRender(tagData):null
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



