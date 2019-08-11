import React, { PureComponent } from 'react'
import { Icon, Button, Tree, Popconfirm, Progress, Divider, Input, AutoComplete } from 'antd'
import { connect } from 'dva'
import { getPercent } from '../../../utils'
import { routerRedux } from 'dva/router'

import TagModal from './TagModal'
import ValueModal from './ValueModal'
import AddCateModal from './AddCateModal'
import EditCateModal from './EditCateModal'
import AutoComp from './AutoComp'

import RenderAuthorized from 'ant-design-pro/lib/Authorized'
import Ellipsis from 'ant-design-pro/lib/Ellipsis'
import styles from './index.less'


const TreeNode = Tree.TreeNode
const Authorized = RenderAuthorized()

@connect(state => ({
  tags: state['tags/tags'],
  user: state.user,
  loading: state.LOADING,
}))
export default class TagTree extends PureComponent {
  state = {
    isEdit: false, // 编辑模式
    tagOpen: false, // 标签的Modal框
    valueOpen: false, // 标签值的Modal框
    addCateOpen: false, // 新增Modal框
    editCateOpen: false, // 编辑分类Modal框
    expandAll: false,
    expandedKeys: [],
  }

  node = null
  expandedKeysByMine = false
  searchtimer = null;

  componentDidMount() {
    
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entityId !== this.props.entityId) {
      nextProps.dispatch({
        type: 'tags/tags/clear',
      });
      this.init(nextProps);
    }
  }

  init(props) {
    const { dispatch, entityId } = props || this.props;
    dispatch({
      type: 'tags/tags/clearDataSource',
    });

    this.expandedKeysByMine = true

    dispatch({
      type: 'tags/tags/fetch',
      payload: { entityId },
    });
   

    dispatch({
      type: 'user/fetchAuths',
      payload: {
        parentKey: `bqgl_xbqgl_${entityId}`,
      },
      callback: (newKeys) => {
        if (newKeys.includes(`bqgl_xbqgl_bqtxzs_${entityId}`)) {
          dispatch({
            type: 'user/fetchAuths',
            payload: {
              parentKey: `bqgl_xbqgl_bqtxzs_${entityId}`,
            },
          });
        }
      },
    });

    this.setState({expandedKeys: [], expandAll: false})
  }

  // 打开新增一级分类Modal框
  openCateModal = () => {
    this.setState({ addCateOpen: true })
    const { dispatch } = this.props;
    dispatch({
      type: 'tags/tags/setIsAddRootTag',
      payload: true,
    })
    this.node = null;
  }

  tagModalChange = (value) => {
    this.setState({ tagOpen: value })
  }

  valueModalChange = (value) => {
    this.setState({ valueOpen: value })
  }

  addCateModalChange = (value) => {
    this.setState({ addCateOpen: value })
  }

  editCateModalChange = (value) => {
    this.setState({ editCateOpen: value })
  }

  onSelect = (info) => { }

  onLoadData = (treeNode) => {
    const { eventKey, hasChild } = treeNode.props
    return new Promise((resolve) => {
      const arr = eventKey.split('@')
      if (arr[0] === 'tag' && !hasChild) {
        this.props.dispatch({
          type: 'tags/tags/fetchValue',
          payload: {
            tagEnglishName: arr[1],
            entityId: this.props.entityId,
          },
        })
      }
      resolve();
    });
  }

  editBtnClickHandler = () => {
    const { isEdit } = this.state
    this.setState({
      isEdit: !isEdit,
    })
  }

  // TODO click node event
  treeNodeClick(item) {
    const { isEdit } = this.state
    if (!isEdit && item.tagEnglishName) {
      if (item.isLast) {
        this.setState({ valueOpen: true })
        this.props.dispatch({
          type: 'tags/tags/fetchTagValue',
          payload: {
            tagEnglishValueTitle: item.tagEnglishValueTitle,
            entityId: this.props.entityId,
          },
        })
      } else {
        this.setState({ tagOpen: true })
        this.props.dispatch({
          type: 'tags/tags/fetchTagName',
          payload: {
            tagEnglishName: item.tagEnglishName,
            entityId: this.props.entityId,
          },
        })
      }
    }
  }

  addTag(item) {
    this.setState({ addCateOpen: true })
    const { dispatch } = this.props;
    dispatch({
      type: 'tags/tags/setIsAddRootTag',
      payload: false,
    })
    this.node = item;
  }

  editTag(item) {
    this.props.dispatch({
      type: 'tags/tags/setTagCateData',
      payload: { ...item },
    })
    this.node = item;
    if (item.categoryEnglishName) {
      this.setState({ editCateOpen: true })
    } else {
      if(item.tagEnglishName) {
        this.props.dispatch({
          type: 'tags/tags/isNewChange',
          payload: false,
        });
        this.props.dispatch(routerRedux.push({
          pathname: `/tags/tagenglishname/${item.tagEnglishName}/${item.entityId}`,
          state:{locationHistory:this.props.location.pathname}
        }))
      }   
    }
  }

  deleteTag(item) {
    if (item.tagType !== 3) {
      // 分类
      if (item.categoryEnglishName && item.categoryEnglishName) {
        this.props.dispatch({
          type: 'tags/tags/delTagCate',
          payload: {
            categoryEnglishName: item.categoryEnglishName,
            sysEntityId: item.entityId,
          },
          callback: () => {
            this.init();
          },
        });
      }
      // 标签
      if (item.tagEnglishName && item.tagEnglishName) {
        this.props.dispatch({
          type: 'tags/tags/delTagName',
          payload: {
            tagEnglishName: item.tagEnglishName,
            sysEntityId: item.entityId,
          },
          callback: () => {
            this.init();
          },
        });
      }
    } else {
      // 标签值删除
      this.props.dispatch({
        type: 'tags/tags/delTagValueByTagValueTitle',
        payload: {
          tagValueTitle: item.tagEnglishValueTitle,
          entityId: item.entityId,
        },
        callback: () => {
          this.init();
        },
      });
    }
  }

  // add cateTag or nameTag
  addCateModalCommit = (data) => {
    const { isAddRootTag } = this.props.tags;
    const params = this.getAddParams(data);
    // 调添加接口
    this.props.dispatch({
      type: (isAddRootTag || data.type === 1) ? 'tags/tags/insertTagCate' : 'tags/tags/insertTagName',
      payload: { ...params },
      callback: () => {
        if((isAddRootTag || data.type === 1)){
          this.setState({ addCateOpen: false });
          this.init();

        }else{
          this.props.dispatch({
            type: 'tags/tags/isNewChange',
            payload: true,
          });
          this.props.dispatch(routerRedux.push({
            pathname: `/tags/tagenglishname/${params.tagEnglishName}/${params.entityId}`,
            state:{isAddNewTag:true}
          }))
        } 
      },
    });
  }

  // 编辑标签分类
  editCateModalCommit = (data) => {
    let params = {};
    params.categoryEnglishName = this.node.categoryEnglishName;
    params.categoryName = data.name;
    params.entityId = this.node.entityId;
    params.levelNum = this.node.levelNum;
    params.parentCategoryEnglishName = this.node.parentCategoryEnglishName;
    params.path = this.node.path;
    params.tagType = this.node.tagType;
    params.id = this.node.id;
    this.props.dispatch({
      type: 'tags/tags/editTagCate',
      payload: { ...params },
      callback: () => {
        this.setState({ editCateOpen: false });
        this.init();
      },
    });
  }

  getAddParams(data) {
    const { isAddRootTag } = this.props.tags;
    let params = {};
    if (isAddRootTag) { // 一级分类
      params.categoryEnglishName = data.id;
      params.categoryName = data.name;
      params.entityId = this.props.entityId;
      params.levelNum = 1;
      params.parentCategoryEnglishName = "''";
      params.path = '/';
      params.tagType = 0;
    } else { // 二级及以下分类
      switch (data.type) {
        case 1: // 分类
          params.categoryEnglishName = data.id;
          params.categoryName = data.name;
          params.entityId = this.node.entityId;
          params.levelNum = this.node.levelNum + 1;
          params.parentCategoryEnglishName = this.node.categoryEnglishName;
          params.path = this.node.path + (this.node.path === '/' ? '' : '/') + this.node.categoryEnglishName;
          params.tagType = this.node.tagType;
          break;
        case 2: // 标签名
          params.business = '-';
          params.entityId = this.node.entityId;
          params.fullPath = this.node.path + (this.node.path === '/' ? '' : '/') + this.node.categoryEnglishName;
          params.isExhaustivity = true;
          params.isMutual = 0;
          params.paramConditionJson = '-';
          params.paramConstraintJson = '-';
          params.produceMethod = 0;
          params.tagCategoryEnglishName = this.node.categoryEnglishName;
          params.tagEnglishName = data.id;
          params.tagName = data.name;
          params.tagType = this.node.tagType;
          params.updateRate = 0;
          params.userPostId = 0;
          params.weightMergeDiffId = '-';
          params.weightMergeHistory = '-';
          break;
        default:
          break;
      }
    }
    return params;
  }

  isInArray = (ele, arr) => {
    let flag = false;
    arr.map((item) => {
      if (ele === item) flag = true;
    });
    return flag;
  }

  loop(data) {
    let kind = '产品';
    if (this.props.entityId === 1) kind = '人';
    return data.map((item, i) => {
      if(item.parentCategoryEnglishName === 'busines_tag' || item.categoryEnglishName === 'busines_tag'){
        return '';
      }
      let title;
      let treeNodeKey;
      const del = (
        <Popconfirm
          placement="top"
          title={
            <div style={{ width: '200px' }}>
              {`确定删除“${item.categoryName || item.tagName || item.tagValueTitle}”标签吗?${item.tagType === 3 ?
                '' : '如果删除该标签，将会导致该标签下所有子节点不可用。'} `}
            </div>
          }
          onConfirm={() => { this.deleteTag(item) }}
          okText="确定"
          cancelText="取消">
          <Icon type="delete" />
        </Popconfirm>
      )
      const icons = (
        <div className={styles.icons}>
          {item.tagType === 3 ? null : ( // tagType  0：普通标签，1：可调参标签，2：补充标签，3：定制化标签（自定义标签／自动化标签)
            item.categoryEnglishName ? (
              <span>
                <Icon type="plus-circle-o" onClick={this.addTag.bind(this, item)} />
                <Divider type="vertical" />
              </span>
            ) : null
          )}
          {item.tagType === 3 ? null : (<span>
            <Icon type="edit" onClick={this.editTag.bind(this, item)} />
            <Divider type="vertical" /></span>)}
          {item.tagType === 3 ? null : del}
        </div>
      )
      if (!item.isLast) { // 外层列表数据
        title = item.categoryEnglishName ?
          (<div onClick={this.treeNodeClick.bind(this, item)}>
            <span><Icon type="tags-o" style={{fontSize: 12,color:"#108ee9",marginRight:"5px"}}/></span>
            <span><Ellipsis tooltip length={18}>{item.categoryName}</Ellipsis></span>
            {this.state.isEdit ? icons : null}
          </div>) :
          (<div onClick={this.treeNodeClick.bind(this, item)}
            style={{ cursor: 'pointer',display:"flex" }}>
            <span><Icon type="tags-o" style={{fontSize: 12,color:"#108ee9",marginRight:"5px"}}/></span>
            <span className={styles.tagname}><Ellipsis tooltip length={18}>{item.tagName}</Ellipsis></span>
            {this.state.isEdit ? icons : (<span className={styles.mygxtj}>
              <span  style={{}} className={styles.gay}><Icon type="reload " style={{fontSize: 12,color:"#a4acb5"}}/>{item.updateRateName}</span>
              <span style={{ position:"absolute",top:"-1px",right:"18px",color:"rgba(0, 0, 0, 0.65)"}}  >{item.produceMethodName == "统计"?(<img style={{width:"22px",height:"35px"}} src="/imgs/tagType_quota.jpeg"></img>):(<img style={{width:"22px",height:"35px"}} src="/imgs/tagType_attribute.jpeg"></img>)}</span> 
              <span style={{ marginLeft:"10px"}}><Icon type="book" style={{fontSize: 12,color:"#108ee9"}}/>{item.business?'标签规则':(<span style={{color:"#B2B2B2"}}>暂无标签规则</span>)} </span>
              </span>)}
          </div>)
        treeNodeKey = item.tagEnglishName ?
          (`tag@${item.tagEnglishName}@${i}`) :
          (`cate@${item.categoryEnglishName}@${i}`)

        if(!this.expandedKeysByMine){ // 非手动展开/收起节点
          if (item.categoryEnglishName) {
            if (!this.isInArray(treeNodeKey, this.state.expandedKeys)){
              let expandedKeys = this.state.expandedKeys
              expandedKeys.push(treeNodeKey)
              this.setState({expandedKeys})
            }  
            
          }else if(item.children){
            if (!this.isInArray(treeNodeKey, this.state.expandedKeys)){
              let expandedKeys = this.state.expandedKeys
              expandedKeys.push(treeNodeKey)
              this.setState({expandedKeys})
            } 
          }


         
       }

      } else { // 内层列表数据
        title = (
          <div onClick={this.treeNodeClick.bind(this, item)} style={{ cursor: 'pointer' }}>
            <span>
            <Icon type="tag " style={{fontSize: 12,color:"#108ee9",marginRight:"5px"}}/>
            </span>
            <span style={{width:"30%"}} className={styles.tagname}><Ellipsis tooltip length={18}>{item.tagValueTitle}</Ellipsis></span>
            <span ><Icon type="book" style={{fontSize: 12,color:"#108ee9"}}/>{item.calculLogic?item.calculLogic:(<span style={{color:"#B2B2B2"}}>暂无计算规则</span>)} </span>
            {this.state.isEdit ?
              (<div className={styles.icons}>{(item.tagType === 3) ? del : null} </div>) :
              (<div  className={styles.valuesBox}>
                <span className={styles.counts}>{item.userNumber || 0}
                  <span className={styles.gay}>{kind}覆盖</span></span>
                <Progress percent={getPercent(item.userNumber, item.total)} strokeWidth={5} style={{ width: 170 }} />
              </div>)
            }
          </div>)
        treeNodeKey = `value@${item.tagEnglishValueTitle}@${i}`;
      }
      // 补充标签tagType是2，3：自定义标签和自动化标签tagType都是3
      if (item.children) {
        return (<TreeNode title={title} key={treeNodeKey} isLeaf={!!item.isLast} hit={item.hit} hasChild={true}>
          {this.loop(item.children)}
        </TreeNode>)
      }
      return <TreeNode title={title} key={treeNodeKey} isLeaf={!!item.isLast} hit={item.hit} hasChild={false}/>
    })
  }

  filterTreeNode(node){
    if(node.props.hit) {
      return true
    }
  } 

  onExpand = (expandedKeys) =>{
    this.expandedKeysByMine = true
    this.setState({expandedKeys})
  }

  // 返回整个树
  clearTree = () =>{    
    const { dispatch, entityId } = this.props
    dispatch({
      type: 'tags/tags/clearDataSource',
    });

    this.expandedKeysByMine = false

    dispatch({
      type: 'tags/tags/fetch',
      payload: { entityId },
    })

    this.setState({expandedKeys: [], expandAll: false})
  }

  render() {
    const { tags, user, entityId, loading } = this.props;
    return (
      <div className={styles.tagTree}>
        <div className={styles.isEditBtnBox}>
          <AutoComp entityId={entityId} clearTree={this.clearTree} />
          <div style={{float: 'right'}}>
            <Button disabled={!user.auths.includes(`bqgl_xbqgl_bjms_${entityId}`)}
              type="primary"
              onClick={this.editBtnClickHandler}>{this.state.isEdit ? '浏览模式' : '编辑模式'}</Button>
            {this.state.isEdit ? (
              <Authorized authority={() => user.auths.includes(`bqgl_xbqgl_bjms_${entityId}`)}>
                <Button type="primary"
                  onClick={this.openCateModal}
                  className={styles.addFirstCateBtn}>
                  新增一级分类
                </Button>
              </Authorized>
            ) : null
            }
          </div>
        </div>
        <div className={styles.tagsBox}>
          {
            loading.effects['tags/tags/fetch'] || loading.effects['tags/tags/fetchSearch'] ? 
                <div style={{ textAlign: 'center', padding: '20px' }}>数据加载中</div> :
              tags.list && tags.list.length > 0 ? (
                <Tree 
                  onSelect={this.onSelect}
                  loadData={this.onLoadData}
                  onExpand={this.onExpand}
                  expandedKeys={this.state.expandedKeys}
                  filterTreeNode={this.filterTreeNode}
                >
                  {this.loop(tags.list)}
                </Tree>
              ) : <div style={{ textAlign: 'center', padding: '20px' }}>暂无数据</div>
          }
        </div>
        {/* 标签的Modal框 */}
        <TagModal open={this.state.tagOpen} onChange={this.tagModalChange} entityId={entityId}/>
        {/* 标签值的Modal框 */}
        <ValueModal open={this.state.valueOpen} onChange={this.valueModalChange} entityId={entityId}/>
        {/* 新增Modal框 */}
        <AddCateModal open={this.state.addCateOpen}
          onChange={this.addCateModalChange}
          onCommit={this.addCateModalCommit} />
        {/* 编辑分类Modal框 */}
        <EditCateModal open={this.state.editCateOpen}
          onChange={this.editCateModalChange}
          onCommit={this.editCateModalCommit} />
      </div >
    )
  }
}

