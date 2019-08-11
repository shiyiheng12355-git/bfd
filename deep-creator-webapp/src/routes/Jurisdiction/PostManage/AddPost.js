import React from 'react';
import { connect } from 'dva';
import { Button, Input, Select, notification } from 'antd';
import styles from './AddPost.less';
import AnimateTable from '../../../components/AnimateTable'
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import uuidV4 from 'uuid/v4'
import { routerRedux } from 'dva/router'

const Option = Select.Option;

@connect(state => ({
  postManage: state['jurisdiction/postManage'],
  loading: state.LOADING,
}))

class AddPost extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: [{
        key: uuidV4(),
        roleName: '',
        operTemplateId: undefined,
        rowTemplateId: undefined,
        columnTemplateId: undefined,
      }],
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
        className: 'width-20',
        render: (text, record, index) => (
          <Input onBlur={() => {this.existName(text,index)}} placeholder="请输入岗位名称" value={text} onChange={(ev) => { this.selectChange(ev, 'roleName', index) }}/>
        ), 
      },
      { 
        title: '功能模版', 
        dataIndex: 'operTemplateId', 
        key: 'operTemplateId', 
        align: 'center',
        className: 'width-20',
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
        className: 'width-20',
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
        className: 'width-20',
        render: (text, record, index) => (
          <Select placeholder="请选择" value={text} style={{ width: '100%' }} onChange={(value) => { this.selectChange(value, 'columnTemplateId', index) }}>
            {this.state.option_lie}
          </Select>
        ),  
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        className: styles.action,
        render: (text, record) => <a onClick={(e) => { this.onDelete(record.key, e) }}>删除</a>,
      },
    ]
  }

  componentDidMount() {
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

  existName = (name,index) => {
    if(name){
      let data = this.state.data
      let logo
      data.map((v,i) => {
        if(v.roleName === name && i !== index){
          logo = true
        }
      })

      if(logo){
        notification.error({ message: '该岗位名称与本次新建其他岗位名称重复！' })
        data[index].roleName = ''
        this.setState({ data })
        return
      }

      this.props.dispatch({
        type: 'jurisdiction/postManage/queryPostExist',
        payload: { roleName: name },
        callback: (res) => {
          if(res){
            notification.error({ message: '该岗位名称已创建！' })
            data[index].roleName = ''
            this.setState({ data })
          }
        }
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

  // 添加数据
  onAdd = () => {
    let { data } = this.state

    data.push({
      key: uuidV4(),
      roleName: '',
      operTemplateId: undefined,
      rowTemplateId: undefined,
      columnTemplateId: undefined,
    })

    this.setState({ data })
  }

  // 删除数据
  onDelete = (key, e) => {
    e.preventDefault();
    const data = this.state.data.filter(item => item.key !== key)
    this.setState({ data })
  }

  onSave = () => {
    let data = this.state.data
    if(data.length === 0) notification.error({ message: '至少新建一个岗位！' })

    let logo, nameLogo
    let reg = /^[^ ]+$/
    data.map(v => {
      !reg.test(v.roleName) && (nameLogo = true);
      (Object.values(v).includes(undefined) || Object.values(v).includes('')) && (logo = true);
    })

    if(logo){
      notification.error({ message: '请先全部填写完毕再进行保存！'})
      return false
      
    }else if(nameLogo){
      notification.error({ message: '岗位名称不允许含有空格！'})
      return false

    }else{
      this.props.dispatch({
        type: 'jurisdiction/postManage/addPost',
        payload: JSON.stringify(data),
        callback: () => {
          this.onCancel()
        }
      })
    }
  }

  onCancel = () => {
    this.props.dispatch(routerRedux.push({
      pathname: `/jurisdiction/postManage`,
    }))
  }

  render() {
    const {  } = this.props
    const { data } = this.state

    return ( 
      <div className={styles.AddPost}>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '权限管理' }, { title: '岗位管理' }]} />

        <div className={styles.content}>
          <div className={styles['table-title']}><strong>新增岗位</strong></div>
          <AnimateTable 
            bordered
            dataSource={data}
            pagination={false}
            columns={this.columns}
          />
          <div style={{marginTop: 16}}>
            <Button type="primary" onClick={::this.onAdd} style={{marginRight: 10}}>添加</Button>
            <Button type="primary" onClick={::this.onSave} style={{marginRight: 10}}>保存</Button>
            <Button onClick={::this.onCancel}>取消</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default AddPost
