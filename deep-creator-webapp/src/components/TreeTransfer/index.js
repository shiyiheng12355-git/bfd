import React, { PureComponent } from 'react';
import { Row, Col, Tree,  Icon } from 'antd';
import styles from './index.less'
const TreeNode = Tree.TreeNode;


class TreeTransfer extends PureComponent {
  constructor(props) {
    super(props);

    const { value , data} = this.props;
    this.state = {
        // value:value,
        // data: data,
        rightData:{},
        cacheNode:null,
        selData:[]
    };
  }
  componentWillMount(){
    this.upDataRight(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.value.length != this.props.value.length){
      this.upDataRight(nextProps);
    }
    
  }
  /**
   * 递归处理数据
   */
  upDataRight=(props)=>{
    let { value , treeMap, rowKey, titleKey,formatValue } = props;
    formatValue&&(value=formatValue(value));
    let { pid, map } = treeMap;
    let data = {},
        path = '';
    value.map((item)=>{
      let t = item;
      if(map[t]){
        while(map[map[t][pid]]){
          if(path){
            path = `${map[t][titleKey||'name']}/${path}`
          }else{
            path = `${map[t][titleKey||'name']}`
          }
          t = map[t][pid];
        }
        if(data[map[t][titleKey||'name']]){
          data[map[t][titleKey||'name']].push({
            path:path
          })
        }else{
          data[map[t][titleKey||'name']]=[];
          data[map[t][titleKey||'name']].push({
            path:path
          })
        }
      }
      path = '';
    })
    this.setState({
      rightData:data
    });
  }
  /**
   * 获取选中值
   */
  getSelect=(value)=>{
    let {  treeMap, rowKey, titleKey,formatValue } = this.props;
    if(Object.prototype.toString.call(value) =='[object Object]'){
      value = value.checked;
    }
    let { pid, map } = treeMap;
    let selData = []
    value.map((item)=>{
      let t = item;
      if(map[t]){
        while(map[map[t][pid]]){
          if(selData.indexOf(map[t][rowKey||'id']) == -1){
            selData.push(map[t][rowKey||'id'])
          }
          t = map[t][pid];
        }
        if(selData.indexOf(map[t][rowKey||'id']) == -1){
          selData.push(map[t][rowKey||'id'])
        }
        
      }
    })
    return selData
  }
  /**
   * 序列化右侧路径
   * @param {Array} checkedArr 
   */
  getRightData=(checkedArr)=>{
    const {childrenKey} = this.props;
    checkedArr = checkedArr||[];
    let data = {};
    checkedArr.map((item)=>{
      if(!(item.props.dataRef[childrenKey?childrenKey:'children']&&item.props.dataRef[childrenKey?childrenKey:'children'].length>0)){
        let path = item.props.path.split('/');
        if(data[path[0]]){
          data[path[0]].push({
            path:path.slice(1).join('/')
          });
        }else{
          data[path[0]] = [];
          data[path[0]].push({
            path:path.slice(1).join('/')
          });
        }
      }
    });
    this.setState({
      rightData:data
    });
  }
  getTree=()=>{
    let { data , value, onChange, formatData,checkStrictly, formatValue } = this.props;
    
    formatValue&&(value=formatValue(value));
    return (
          <Tree
              checkable
              checkedKeys={value}
              checkStrictly={checkStrictly}
              onCheck={(value,e)=>{
                // console.log(value);
                //this.getRightData(e.checkedNodes)//为满足查看需求 弃用
                onChange && onChange((formatData?formatData(value,e,this.getSelect.bind(this),data):value))
              }}
              ref="tree"
              
            //   checkedKeys={value}
          >
              {this.renderTreeNodes(data||[])}
          </Tree>
        );
  }
  renderTreeNodes=(data,path,pid)=>{
    // 用于处理莫名其妙的接口数据
    const {childrenKey ,titleKey, rowKey, parentId, disabled} = this.props;
    return data.map((item,index) => {
      if (item[childrenKey?childrenKey:'children']&&item[childrenKey?childrenKey:'children'].length>0) {
        return (
          <TreeNode disableCheckbox={disabled}  title={item[titleKey?titleKey:'name']} path={path?`${path}/${item[titleKey?titleKey:'name']}`:item[titleKey?titleKey:'name']} key={item[rowKey?rowKey:'id']} dataRef={item}>
            {this.renderTreeNodes(item[childrenKey?childrenKey:'children'],path?`${path}/${item[titleKey?titleKey:'name']}`:item[titleKey?titleKey:'name'],parentId?item[parentId]:null)}
          </TreeNode>
        );
      }
      if(parentId&&pid){
        item[parentId] = pid;
      }
      return <TreeNode disableCheckbox={disabled} title={item[titleKey?titleKey:'name']} path={path?`${path}/${item[titleKey?titleKey:'name']}`:item[titleKey?titleKey:'name']} dataRef={item} key={item[rowKey?rowKey:'id']} />;
    });
  }
  render() {
    const { len, onConfirm, value } = this.props;
    // console.log('value',value)
    const {rightData} = this.state;
    let rightDataKeys = Object.keys(rightData);
    return (
        <div className={styles.TreeTransfer}>
            <Row >
                <Col span={8} style={{borderRight: '1px solid #EFEFEF'}}>
                    {this.getTree()}
                </Col>
                
                <Col span={16} style={{borderLeft: '1px solid #EFEFEF',marginLeft:-1}} className={styles.checkIcon}>
                    
                    <span className={styles.checkCon}><strong>已选</strong><Icon type="right-circle-o" /></span>
                    
                    <dl className={styles.TreeTransferRight}>
                      {rightDataKeys.length > 0 ? rightDataKeys.map((item,index)=>{
                        let node = [];
                        node.push(<dt key={index}><b></b>{item}</dt>);
                        rightData[item].map((ite,i)=>{
                          ite.path&&node.push(<dd key={`${index}-${i}`}>{ite.path}</dd>)
                        })
                        return node
                      }) :null }
                    </dl>
                </Col>
            </Row>
        </div>
    );
  }
}
export default TreeTransfer