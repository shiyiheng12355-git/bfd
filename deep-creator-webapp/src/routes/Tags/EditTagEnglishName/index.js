import React, { PureComponent } from 'react'
import { Row, Col, Icon, Button, Input, Select, Radio, Modal, Form, Tree, Table, Popconfirm, message, Spin, DatePicker  } from 'antd'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout'
import HeaderTitle from '../../../components/HeaderTitle'
import EditableCell from './EditableCell'
import { connect } from 'dva'
import { formatMoment } from '../../../utils'
import { routerRedux } from 'dva/router'
import RangeInput from './RangeInput'
import uuidV4 from 'uuid/v4'
import cloneDeep from 'lodash/cloneDeep'
import moment from 'moment';

import styles from './index.less'

const FormItem = Form.Item
const TreeNode = Tree.TreeNode

@Form.create()
@connect(state => ({
  loading: state['LOADING'],
  tags: state['tags/tags'],
  user: state.user,
}))
export default class EditTagEnglishName extends React.Component {

  state = {
    visible: false,
    selectedRowKeys: []
  }

  //select tag value rows
  selectedTagValueRows = [];

  //全局参数 colums
  tagValueColumns = [{
    title: '标签值',
    dataIndex: 'tagValueTitle',
    width: '30%',
    render: (text, record, index) => (
      <EditableCell
        value={text}
        isAdd={record.isAdd}
        onChange={this.onCellChange(index, 'tagValueTitle')}
      />
    ),
  }, {
    title: '标签值ID',
    dataIndex: 'tagEnglishValueTitle',
    render: (text, record, index) =>{
      return (
        !record.isAdd ? <div>{text}</div> :
        <EditableCell
          value={text}
          isAdd={record.isAdd}
          onChange={this.onCellChange(index, 'tagEnglishValueTitle')}
        />)
    } 
  }, {
    title: '业务定义',
    dataIndex: 'business',
    render: (text, record, index) =>{
      return (
        <EditableCell
          title='business'
          value={text}
          isAdd={record.isAdd}
          onChange={this.onCellChange(index, 'business')}
        />)
    } 
  }, {
    title: '计算逻辑',
    dataIndex: 'calculLogic',
    render: (text, record, index) =>{
      return (
        <EditableCell
          title='calculLogic'
          value={text}
          isAdd={record.isAdd}
          onChange={this.onCellChange(index, 'calculLogic')}
        />)
    } 
  }]

  //标签值参数 colums
  globalParamsColumns = [{
    title: '参数名称',
    dataIndex: 'param_cn',
    width:'20%',
    key: 'param_cn'
  }, {
    title: '参数值',
    width: '20%',
    dataIndex: 'value',
    key: 'value',
    render: (text, record, index) =>{
      //console.log(record,'record.....')
      switch (record.type) {
        case 'value':
          const list = record.all_value && record.all_value.split(',') || [];
          return (
            <Select defaultValue={record.value} size="small" onChange={this.globalParamsChange(index, 'value')}>
              {list.map((item, i) => <Select.Option key={i} value={item}>{item}</Select.Option>)}
            </Select>
          )
          break;
        case 'range':
          return <RangeInput value={record.range} onChange={::this.globalParamsChange(index, 'range') }/>
          break;
        default:
          break;
      }
    } 
  }, {
    title: '注释',
    dataIndex: 'param_explain',
    key: 'param_explain',
  }];

  componentDidMount() {
    this.init();
  }

  //init
  init(){
    const { dispatch, match } = this.props;
    if (match.params){
      dispatch({
        type: 'tags/tags/fetchTagInfoExceptCover',
        payload: { ...match.params, isNew: this.props.tags.isNew },
        callback:()=>{
          const { tags } = this.props
          if (tags.tagNameData.tagType != 3){
            dispatch({
              type: 'tags/tags/queryValueListByTagName',
              payload: { ...match.params }
            });
          }
        }
      });
    }
  }
  
  //可编辑表格的onCellChange事件
  onCellChange(index, key){
    return (flag, value) => {
      this.props.dispatch({
        type: 'tags/tags/onCellChange',
        payload: { index, key, value, flag }
      });
    };
  }
  
  //add valueList
  handleAddTag(){
    this.props.dispatch({
      type:'tags/tags/addRowToValueList'
    });
  }

  //del valueList
  handleDelTag(){
    this.props.dispatch({
      type: 'tags/tags/delFromValueList',
      payload: this.selectedTagValueRows
    });
    this.selectedTagValueRows = [];
    this.setState({selectedRowKeys: []});
  }

  handleVisibleChange = visible => {
    if (!visible) {
      this.setState({ visible });
      return;
    }
    if (this.selectedTagValueRows && this.selectedTagValueRows.length > 0) {
      this.setState({ visible }); // show the popconfirm
    } else {
      message.error('请选择要删除的标签')
    }
  };

  globalParamsChange(index,key){
    return (value) => {
      this.props.dispatch({
        type: 'tags/tags/changeGlobalParams',
        payload: { index, key, value }
      });
    }
  }
  
  getUpdateRateName(updateRate){
    if (updateRate == 0) return '每日更新';
    if (updateRate == 1) return '每周更新';
    if (updateRate == 2) return '每月更新';
  }

  getProduceMethodName(produceMethod){
    if (produceMethod == 0) return '统计';
    if (produceMethod == 1) return '填充';
    if (produceMethod == 2) return '统算法模型计';
  }

  getTagValue(list){
    let a = [];
    list && list.map((item,i)=>{
      if (item.tagEnglishValueTitle && item.tagValueTitle){
        const { tagEnglishValueTitle, tagValueTitle, business, calculLogic} = item;
        a.push({ tagEnglishValueTitle, tagValueTitle, business, calculLogic });
      }
    });
    return JSON.stringify(a);
  }

  getParamConditionJson(tagNameData){
    const _ = tagNameData;
    let paramConditionJson = _ && _.paramConditionJson && JSON.parse(_.paramConditionJson);
    paramConditionJson.global && 
    paramConditionJson.global.length > 0 && 
    paramConditionJson.global.map((item)=>{
      if (item.hasOwnProperty('all_value')) delete item.all_value;
    })
    return JSON.stringify(paramConditionJson);
  }

  getChangedParams(tagNameData, values) {
    let o = {}
    o.isMutualName = !!values.isMutual ? '是' : '否';
    o.produceMethodName = this.getProduceMethodName(values.produceMethod);
    o.updateRateName = this.getUpdateRateName(values.updateRate);
    o.paramConditionJson = this.getParamConditionJson(tagNameData);
    return Object.assign(tagNameData, values, o);
  }

  getNotChangedParams(tagNameData, valueList, values) {
    let params = {};
    params.business = values.business;
    params.businessDept = values.businessDept;
    params.dataTime = values.dataTime ? values.dataTime['_d'].getTime() : null;
    params.isExhaustivity = values.isExhaustivity;
    params.isExhaustivityName = !!values.isExhaustivity ? '是' : '否';
    params.isMutual = values.isMutual;
    params.isMutualName = !!values.isMutual ? '是' : '否';
    params.produceMethod = values.produceMethod;
    params.produceMethodName = this.getProduceMethodName(values.produceMethod);
    params.tagName = values.tagName;
    params.tagValue = this.getTagValue(valueList);
    params.total = tagNameData.total;
    params.updateRate = values.updateRate;
    params.updateRateName = this.getUpdateRateName(values.updateRate);
    return Object.assign(tagNameData, params);
  }

  // submit form.
  ok(){
    const { tagNameData, valueList } = cloneDeep(this.props.tags);
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let params;
        if (tagNameData.tagType == 1) { // 可调参标签 
          params = this.getChangedParams(tagNameData, values);
        } else { // 不可调参标签
          params = this.getNotChangedParams(tagNameData, valueList, values);
        }

        params.isNew = this.props.tags.isNew
        
        this.props.dispatch({
          type: 'tags/tags/editTagName',
          payload: {
            bizTagNameVO: { ...params },
            sysEntityId: params.entityId
          },
          callback: () => {
            this.goToTag({isAdd:true}); //true代表是确定的
          }
        });
      }
    });
  }

  goToTag(obj){
    const { params } = this.props.match;
    const { tagNameData} = cloneDeep(this.props.tags);
    //增加判断 是否是新增标签名称
    if(!obj.isAdd){//判断是点击确定过来 还是取消过来
      if(this.props.location && this.props.location.state && this.props.location.state.isAddNewTag){
        this.props.dispatch({
          type: 'tags/tags/cancelAddTag',
          payload: {
            id: tagNameData.id,
          }
        });
      }
    }
    this.props.dispatch(routerRedux.push({
      pathname: '/tags/' + params.entityId
    }));
  }
  
  tagChange(row,key){
    return ({ target })=>{
      this.props.dispatch({
        type:'tags/tags/changeTagsParams',
        payload:{
          row,
          key,
          value:target.value,
          isChild:false
        }
      })
    }
  }
  
  tagEnChange(row,key){
    return ({ target })=>{
      this.props.dispatch({
        type: 'tags/tags/changeTagsParams',
        payload: {
          row,
          key,
          value: target.value,
          isChild: false
        }
      });
    }
  }

  rangeInputChange(row, col, key) {
    return (data) => {
      this.props.dispatch({
        type: 'tags/tags/changeTagsParams',
        payload: {
          row,
          col,
          key,
          value: data,
          isChild: true
        }
      });
    }
  }

  valueChange(row, col, key){
    return ({ target })=>{
      this.props.dispatch({
        type: 'tags/tags/changeTagsParams',
        payload: {
          row,
          col,
          key,
          value: Number(target.value),
          isChild: true
        }
      });
    }
  }

  addTagValue(){
    this.props.dispatch({
      type: 'tags/tags/addTagValue'
    });
  }

  delTagValue(index){
    return ()=>{
      this.props.dispatch({
        type: 'tags/tags/delTagValue',
        payload: index
      });
    }
  }
  
  loop(data){
    return data.map((item,i)=>{
      return (
        <TreeNode title={
          <div className={styles.pRow}>
            {
              data && data.length>1?(
                <Popconfirm title="确认删除吗?" onConfirm={:: this.delTagValue(i)} okText="确定" cancelText="取消">
                  <Icon className={styles.del} type="delete" />
                </Popconfirm>
              ): <Icon className={styles.del} type="delete" style={{color:'#9e9e9e',cursor:'not-allowed'}}/>
            }
            <Input size="small" value={item.tag} onChange={::this.tagChange(i,'tag')}/>
            <Input size="small" style={{ margin: '0 10px' }} value={item.tag_english_name||''} onChange={::this.tagEnChange(i,'tag_english_name')}/>
          </div>} 
          key={i} dataRef={item}>
          {
          item.condition && item.condition.length>0 ?(
            item.condition.map((_item,_i)=>{
              return (
                <TreeNode title={
                  <div className={styles.cRow}>
                    <Input size="small" className={styles.jj} value={_item.param_cn} disabled/>
                    { _item.type == 'value' ?
                      (<Input size="small" className={styles.jj} value={_item.value} onChange={::this.valueChange(i,_i,'value')}/>):
                      (<RangeInput value={_item.range} onChange={::this.rangeInputChange(i,_i,'range')}/>)
                    }
                    <Input size="small" style={{ width: '434px' }} value={_item.param_explain} disabled/>
                  </div>
                } key={i+'@'+_i} dataRef={_item}></TreeNode>
              )
            })
          ):null
        }
        </TreeNode>
      )
    })
  }


  valueListIsEdit(array){
    let flag = false;
    array && array.length > 0 && array.map((item, i) => {
      if (item.tagEnglishValueTitle_edit || item.tagValueTitle_edit) flag = true;
    });
    return flag;
  }

  render() {
    //tags data
    const { tags, loading } = this.props;
    //node data
    const _ = tags.tagNameData;
    //paramConditionJson data
    let paramConditionJson;
    try {
     paramConditionJson = _ && _.paramConditionJson && JSON.parse(_.paramConditionJson);
    } catch (error) {
     paramConditionJson = null;
    }
    let title = '';
    let locationHistory = this.props.location && this.props.location.state && this.props.location.state.locationHistory;
    const { user } = this.props;
    user && user.menus && user.menus.length > 0 && user.menus.map((item) => {
      if (item.resourceUrl === locationHistory ) title = item.resourceTitle;
    });

    //form
    const { getFieldDecorator } = this.props.form;
    return (
      _ &&
      <div>
        <Spin spinning={loading.global} tip="Loading..." style={{ position: 'fixed', margin: 'auto', top: '30%', left: 0, right: 0, zIndex: 100 }} />
        <Form>
        <div className={styles.tagvalue}>
        {title ? <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '标签管理' }, { title }]} /> : <PageHeaderLayout />}
          <div className={styles.box}>
            <div className={styles.top}>
              <FormItem
                label="标签名称"
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 22 }}
                >
                {getFieldDecorator('tagName', {
                  initialValue: _.tagName,
                  rules: [{ required: true, message: '请填写标签名称' }, { max: 50, message: '最长不超过50个字符' }],
                })(
                  <Input placeholder="最长不超过50个字符" maxLength={50} style={{ width: '200px' }}/>
                )}
              </FormItem>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>基本属性</div>
              <Row>
                <Col span={8} className={styles.col}><span className={styles.cb}>父级分类：{_.fullPathName}</span></Col>
                <Col span={8} className={styles.col}>
                  <span className={styles.cb}>更新周期：
                    <FormItem
                      style={{
                        display: 'inline-block',
                        position: 'relative',
                        bottom: '10px'}}
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}>
                      {getFieldDecorator('updateRate', {
                        initialValue: _.updateRate
                      })(
                        <Select size="small" style={{ width: '200px' }}>
                          <Select.Option value={0}>每日更新</Select.Option>
                          <Select.Option value={1}>每周更新</Select.Option>
                          <Select.Option value={2}>每月更新</Select.Option>
                        </Select>
                      )}
                    </FormItem>
                  </span>
                </Col>
                <Col span={8} className={styles.col}><span className={styles.cb}>最新更新：{formatMoment(_.updateTime,'YYYY-MM-DD')}</span></Col>
              </Row>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>业务属性</div>
              <div className={styles.content}>
                <Row>
                  <Col span={8} style={{paddingLeft: 20}}>
                    <FormItem
                      label="标签类型"
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 12 }}
                    >
                      <span>{_.tagTypeName}</span>
                    </FormItem>
                  </Col>
                  <Col span={8} style={{paddingLeft: 20}}>
                    <FormItem
                      label="数据日期"
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 12 }}
                    >
                      {getFieldDecorator('dataTime', {
                          initialValue: _.dataTime ? moment(_.dataTime) : null
                        })(
                          <DatePicker size="small"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8} style={{paddingLeft: 14}}>
                    <FormItem
                      label="业务需求部门"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 12 }}
                    >
                      {getFieldDecorator('businessDept', {
                        initialValue: _.businessDept || '客户关系部'
                      })(
                        <Select size="small" style={{ width: '200px' }}>
                          <Select.Option value='客户关系部'>客户关系部</Select.Option>
                          <Select.Option value='互联网金融部'>互联网金融部</Select.Option>
                          <Select.Option value='运作保障部'>运作保障部</Select.Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                
                <Row className={styles.business}>
                  <FormItem
                  label="业务含义"
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 16 }}
                  >
                    {getFieldDecorator('business', {
                      initialValue: _.business
                    })(
                      <Input.TextArea  rows={3} size="small"/>
                      )}
                  </FormItem>
                </Row>
                
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.title}>生产属性</div>
              <div>
                <Row>
                  <Col span={8} className={styles.col} style={{paddingLeft: 14}}>
                    <FormItem
                      label="生产方法类型"
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                    >
                      {getFieldDecorator('produceMethod', {
                        initialValue: _.produceMethod
                        //rules: [{ required: true, message: '请填写邮件名称' }],
                      })(
                        <Radio.Group>
                          <Radio value={0}>统计</Radio>
                          <Radio value={1}>填充</Radio>
                          <Radio value={2}>算法模型</Radio>
                        </Radio.Group>
                        )}
                    </FormItem>
                  </Col>
                  <Col span={8} className={styles.col} style={{paddingLeft: 14}}>
                    <FormItem
                      label="同纬度是否互斥"
                      labelCol={{ span: 7 }}
                      wrapperCol={{ span: 17 }}
                    >
                      {getFieldDecorator('isMutual', {
                        initialValue: _.isMutual
                        //rules: [{ required: true, message: '请填写邮件名称' }],
                      })(
                        <Radio.Group>
                          <Radio value={1}>是</Radio>
                          <Radio value={0}>否</Radio>
                        </Radio.Group>
                        )}
                    </FormItem>
                  </Col>
                  <Col span={8} className={styles.col} style={{paddingLeft: 14}}>
                    <FormItem
                      label="维度和是否唯一"
                      labelCol={{ span: 7 }}
                      wrapperCol={{ span: 17 }}
                    >
                      {getFieldDecorator('isExhaustivity', {
                        initialValue: _.isExhaustivity
                        //rules: [{ required: true, message: '请填写邮件名称' }],
                      })(
                        <Radio.Group>
                          <Radio value={true}>是</Radio>
                          <Radio value={false}>否</Radio>
                        </Radio.Group>
                        )}
                    </FormItem>
                  </Col>
                </Row>
              </div>
            </div>
            {
              _.tagType == 1?(
                <div className={styles.row}>
                  <div className={styles.title}>参数调整</div>
                  <div className={styles.bbt}>
                    <div style={{ marginBottom: '10px' }}>全局参数:</div>
                    {
                      paramConditionJson && paramConditionJson.global ?(
                      <Table
                        pagination={false}
                        columns={this.globalParamsColumns}
                        rowKey="value"
                        dataSource={paramConditionJson.global} />
                      ):null
                    }
                  </div>
                  <div className={styles.bbt}>
                    <div>标签值参数：</div>
                    <div className={styles.tagParamsTree}>
                      <div className={styles.topDesc}>
                        <span className={styles.jj}>标签值：</span>
                        <span className={styles.jj}>英文名：</span>
                        <span className={styles.jj} style={{ marginLeft: '30px' }}>参数名称：</span>
                        <span className={styles.jj}>调整范围：</span>
                        <span>参数说明：</span>
                      </div>
                      {
                        paramConditionJson && paramConditionJson.tags && paramConditionJson.tags.length > 0 ?(
                          <Tree expandedKeys={paramConditionJson.tags.map((item, i) => `${i}`)}>
                                {this.loop(paramConditionJson.tags)}
                                <TreeNode title={ 
                                  <Button type="primary" size="small" style={{ fontSize: '12px' }} onClick={::this.addTagValue}>新增标签值</Button>
                                } key={uuidV4()}></TreeNode>
                        </Tree>
                        ): null
                      } 
                    </div>
                  </div>
                </div>
              ):(
                <div className={styles.row}>
                    <div className={styles.title}>标签值</div>
                    <div className={styles.bb}>
                      <div className={styles.btns}>
                      <Popconfirm title="确认批量删除吗?" onConfirm={::this.handleDelTag}  okText="确定" cancelText="取消"
                        visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
                        <Button className={styles.del}>批量删除</Button>
                      </Popconfirm>
                      <Button type="primary" onClick={::this.handleAddTag}>新增标签值</Button>
                  </div>
                  {
                    tags.valueList && tags.valueList.length>0?(
                      <Table
                        pagination={false}
                        rowSelection={{ selectedRowKeys: this.state.selectedRowKeys, onChange: (selectedRowKeys, selectedRows) => {
                          this.selectedTagValueRows = selectedRows;
                          this.setState({selectedRowKeys: selectedRowKeys});
                        }}}
                        dataSource={tags.valueList}
                        columns={this.tagValueColumns}
                        rowKey={(record, index) => index}
                      />
                    ) : <div style={{ textAlign: 'center' }}>{loading['effects']['tags/tags/queryValueListByTagName'] ? <Spin /> : '暂无数据'}</div>  
                  }
                </div>
              </div>
              )
            }
            <div className={styles.footerBtns}>
              <Button onClick={::this.goToTag}>取消</Button>
              <Button type="primary" className={styles.ok} disabled={this.valueListIsEdit(tags.valueList)} onClick={::this.ok}>确定</Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
    )
  }
}
