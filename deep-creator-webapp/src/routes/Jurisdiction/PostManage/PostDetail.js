import React from 'react';
import { connect } from 'dva';
import { Button, Table, Input, Select, notification, Row, Col, Tag, Spin } from 'antd';
import styles from './PostDetail.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { routerRedux } from 'dva/router'
import Texty from 'rc-texty';
import 'rc-texty/assets/index.css';
import QueueAnim from 'rc-queue-anim';
import uuidV4 from 'uuid/v4'
import Ellipsis from 'ant-design-pro/lib/Ellipsis'

const Option = Select.Option;

@connect(state => ({
  postManage: state['jurisdiction/postManage'],
  loading: state.LOADING,
}))

class PostDetail extends React.Component {

  constructor(props) {
    super(props)
    this.state = { 
      data: [],
      type: '',
      option_gn: [],
      option_hang: [],
      option_lie: [],
    }

    this.columns = [
      {
        title: '岗位名称',
        dataIndex: 'roleName',
        key: 'roleName',
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      }, {
        title: '功能模版',
        dataIndex: 'operTemplateName',
        key: 'operTemplateName',
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      }, {
        title: '行权限模版',
        dataIndex: 'rowTemplateName',
        key: 'rowTemplateName',
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      }, {
        title: '列权限模版',
        dataIndex: 'columnTemplateName',
        key: 'columnTemplateName',
        align: 'center',
        render: (text) => <Ellipsis tooltip length={12}>{text}</Ellipsis>,
      },
    ]

    this.columns_edit = [
      { 
        title: '岗位名称', 
        dataIndex: 'roleName', 
        key: 'roleName', 
        align: 'center',
        width: '25%',
        render: (text, record, index) => (
          <Input placeholder="请输入岗位名称" value={text} onChange={(ev) => { this.selectChange(ev, 'roleName', index) }}/>
        ), 
      },
      { 
        title: '功能模版', 
        dataIndex: 'operTemplateId', 
        key: 'operTemplateId', 
        align: 'center',
        width: '25%',
        render: (text, record, index) => (
          <Select placeholder="请选择" value={text} style={{ width: '100%' }} onChange={(value) => { this.selectChange(value, 'operTemplateId', index) }}>
            {this.state.option_gn}
          </Select>
        ), 
      },
      { 
        title: '行权限模版', 
        dataIndex: 'rowTemplateId', 
        key: 'rowTemplateId', 
        align: 'center', 
        width: '25%',
        render: (text, record, index) => (
          <Select placeholder="请选择" value={text} style={{ width: '100%' }} onChange={(value) => { this.selectChange(value, 'rowTemplateId', index) }}>
            {this.state.option_hang}
          </Select>
        ), 
      },
      { 
        title: '列权限模版', 
        dataIndex: 'columnTemplateId', 
        key: 'columnTemplateId', 
        align: 'center',
        width: '25%',
        render: (text, record, index) => (
          <Select placeholder="请选择" value={text} style={{ width: '100%' }} onChange={(value) => { this.selectChange(value, 'columnTemplateId', index) }}>
            {this.state.option_lie}
          </Select>
        ),  
      },
    ]
  }

  componentDidMount() {
    let { match } = this.props
    let { type, record } = match.params
    this.setState({ 
      type,
      data: [JSON.parse(record)],
    })

    this.props.dispatch({
      type: 'jurisdiction/postManage/queryPostUser',
      payload: {
        id: JSON.parse(record).id,
      },
    })
    
    if(type === 'edit'){
      this.props.dispatch({
        type: 'jurisdiction/postManage/queryOptionOfGN',
        callback: (res) => {
          let option = res.map(v => (
            <Option key={uuidV4()} value={v.id}>{v.templateName}</Option>
          ))
          this.setState({ option_gn: option })
        },
      })
  
      this.props.dispatch({
        type: 'jurisdiction/postManage/queryOptionOfHang',
        callback: (res) => {
          let option = res.map(v => (
            <Option key={uuidV4()} value={v.id}>{v.templateName}</Option>
          ))
          this.setState({ option_hang: option })
        },
      })
  
      this.props.dispatch({
        type: 'jurisdiction/postManage/queryOptionOfLie',
        callback: (res) => {
          let option = res.map(v => (
            <Option key={uuidV4()} value={v.id}>{v.templateName}</Option>
          ))
          this.setState({ option_lie: option })
        },
      })
    }
  }

  selectChange = (value, key, index) => {
    if(key === 'roleName'){
      value = value.target.value
    }
    let data = this.state.data
    data[index][key] = value
    this.setState({ data })
  }

  onSave = () => {
    let data = this.state.data
    let reg = /^[^ ]+$/

    if(!data[0].roleName){
      notification.error({ message: '岗位名称不能为空！' })
    }else if(!reg.test(data[0].roleName)){
      notification.error({ message: '岗位名称不允许含有空格！'})
    }else{
      this.props.dispatch({
        type: 'jurisdiction/postManage/queryPostExist',
        payload: { roleName: data[0].roleName, id: data[0].id },
        callback: (res) => {
          if(res){
            notification.error({ message: '该岗位名称已创建！' })
          }else{
            let { id, roleName, rowTemplateId, columnTemplateId, operTemplateId } = data[0]
            let params = { id, roleName, rowTemplateId, columnTemplateId, operTemplateId }
            this.props.dispatch({
              type: 'jurisdiction/postManage/updatePost',
              payload: JSON.stringify(params),
              callback: () => {
                this.onCancel()
              }
            })
          }
        }
      })
    }
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'jurisdiction/postManage/update',
      payload: { postUser: [] },
    })
    this.props.dispatch(routerRedux.push({
      pathname: `/jurisdiction/postManage`,
    }))
  }

  render() {
    const { postManage, loading } = this.props
    const { postUser } = postManage
    const { data, type } = this.state

    return ( 
      <div className={styles.PostDetail}>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '权限管理' }, { title: '岗位管理' }]} />

        <div className={styles.content}>
          <QueueAnim type={['right', 'left']} interval={200} >
            <div key='1' className={styles['table-title']}><strong>岗位详情</strong></div>

            <Table
              key='2'
              bordered
              dataSource={data}
              columns={type === 'edit' ? this.columns_edit : this.columns}
              pagination={false}
              style={{marginBottom: 10}}
            />

            <div key='3' className={styles['table-title']}><strong>岗位用户</strong></div>

            <Row key="box" style={{marginBottom: 10}}>
              <Spin spinning={loading.effects['jurisdiction/postManage/queryPostUser']}>
                {
                  postUser.length !== 0 ? (
                    postUser.map((v,i) => <Tag  key={i} color="orange" style={{marginBottom: 10}}>{v.userName}</Tag>)
                  ) : <span style={{marginBottom: 10}}>暂无用户使用该岗位</span>
                }
              </Spin>
            </Row>
            
            <div key='footer'>
              {type === 'edit' ? <Button type="primary" onClick={::this.onSave} style={{marginRight: 10}}>保存</Button> : null}
              <Button onClick={::this.onCancel}>返回</Button>
            </div>
          </QueueAnim>
        </div>
      </div>
    )
  }
}

export default PostDetail
