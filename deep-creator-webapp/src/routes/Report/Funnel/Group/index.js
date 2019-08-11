import React, {
  Component
} from 'react'
import { browserHistory, Link } from 'react-router'

import Icon from 'bfd/Icon'

import { Radio } from 'antd'

const ButtonGroup = Radio.Group
const Button = Radio.Button

import ButtonBfd from 'bfd/Button'

import Checkbox, {
  CheckboxGroup
} from 'bfd/Checkbox'
import { Select, Option } from 'bfd/Select'
import Spinner from 'bfd/Spinner'
import Tooltip from 'bfd/Tooltip'
import DataTable from 'bfd/DataTable2'
import message from 'bfd/message'
import { Form, FormItem, FormSubmit, FormInput, FormSelect, FormTextarea } from 'bfd/Form'
import { Spin } from 'antd';
import Base64 from 'base-64'
import config from 'react-global-configuration'
import ReactEcharts from 'echarts-for-react'
import echarts from 'echarts'
import dcopy from 'deep-copy'
import uuidV4 from 'uuid/v4'
import { Breadcrumb } from 'antd'
import common from 'public/Common'
import Input from 'bfd/Input'
import xhr from 'public/pxhr'
import './index.less'

class Group extends Component {

  group_id = null
  funnel_name = null
  ranger = null
  res_data = {}
  option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} <br/>{c}'
    },
    legend: {
      show: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      data: []
    },
    series: [{
      name: '',
      type: 'pie',
      radius: ['30%', '70%'],
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: false
        },
        emphasis: {
          show: false
        }
      },
      labelLine: {
        normal: {
          show: false
        }
      },
      data: []
    }]
  }
  labelItem = {}
  columns1 = [{
    title: '营业部',
    key: 'name'
  }, {
    title: '用户数',
    key: 'user_count',
    sortable: true
  }, {
    title: '客户数',
    key: 'customer_count',
    sortable: true
  }]
  columns2 = [{
    title: '客户端',
    key: 'name'
  }, {
    title: '用户数',
    sortable: true,
    key: 'user_count'
  }, {
    title: '客户数',
    sortable: true,
    key: 'customer_count'
  }]
  state = {
    diylabel: '', // 自定义标签
    givenlabel: '', // 下啦标签
    ifshowlabel: true, // 是否显示自定义标签
    groupLabels: [],
    groupname: [], // 用户群名称
    iftableloading: true,
    ifreturndata: false,
    defaultIndexValue: 1,
    table_data: [],
    labels: [
      <Button key="100010000200002" value="100010000200002">
        普通账户-是否有效账户
        <div className="lable-del"><Icon type="remove" data-label_id="100010000200002" onClick={(e) => {
          this.handleRemoveLabel(e)
        }}/></div>
      </Button>,
      <Button key="100060000100002" value="100060000100002">
        近一个月日均资产
        <div className="lable-del"><Icon type="remove" data-label_id="100060000100002" onClick={(e) => {
          this.handleRemoveLabel(e)
        }}/></div>
      </Button>
    ],
    firstLabels: [],
    secondLabels: [],
    secondLabelsDisable: true,
    thirdLabels: [],
    thirdLabelsDisable: true,
    labelsButtonDisabled: true,
    addLabelsModal: false,
    option: {
      tooltip: {
        trigger: 'item',
        formatter: '{b} <br/>{c}'
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        top: 0,
        data: []
      },
      series: [{
        name: '',
        type: 'pie',
        radius: ['30%', '70%'],
        avoidLabelOverlap: false,
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: []
      }]
    },
    isMacroPortraitOption: false,
    macroPortraitOption: {
      tooltip: {
        trigger: 'axis',
        formatter: '{b} <br/>{c}',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: [],
        axisTick: {
          alignWithLabel: true
        }
      }],
      yAxis: [{
        type: 'value'
      }],
      series: [{
        type: 'bar',
        barWidth: '60%',
        data: []
      }]
    },
    usersListData: [],
    usersListParamsUserIds: ['gid', 'sid', 'fund_account', 'mobile'],
    usersListParamsUserAttr: [],
    userListColumns: [],
    customIndexShow: true,
    labelsCheckBox: [
      <Checkbox  key="100010000200002" value="100010000200002">
        普通账户-是否有效账户
      </Checkbox>,
      <Checkbox  key="100060000100002" value="100060000100002">
        近一个月日均资产
      </Checkbox>
    ],
    showSaveForm: false,
    columns: this.columns1
  }
  
  rules = {
    group_name(v) {
      if(!v) return '请填写用户群名称！'
      if(v.length > 30) return '30个字符以内'
    }
  }
 
  constructor(props) {
    super(props)
    if(!props.location.query.group_id || !props.location.state || !props.location.state.funnel_name || !props.location.state.ranger) {
      message.danger('系统错误')
      browserHistory.push(common.rebuildUrl('/analysis/funnel'))
      return
    }
    this.group_id = props.location.query.group_id
    this.funnel_name = props.location.state.funnel_name
    this.ranger = props.location.state.ranger
    this.pre_group_id = props.location.state.groupid
  }

  componentDidMount() {
    this.getFunnelUsersCount()
    this.getLabelList()
    this.getUsersList()
    this.getUserGroupsName()
    this.getMacroPortrait(100010000200002)
  }

  // 获得用户群名称
  getUserGroupsName() {
    xhr({
      url: '/user_group/config_exchange/user_group/',
      type: 'GET',
      success: (res) => {
        let temp = []
        for(let one of res.elements) {
          temp.push(one.group_name)
        }
        this.state.groupname = temp
      }
    })
  }

  // 切换统计来源（营业部、跨平台）
  handleChangeUsersCount(value) {
    this.setState({
      defaultIndexValue: 1,
      iftableloading: true
    })
    switch(value.target.value) {
      case 1:
        this.setState({
          columns: this.columns2
        })
        this.getFunnelUsersCount(1)
        break
      case 2:
        this.setState({
          columns: this.columns1
        })
        this.getFunnelUsersCount(2)
    }
  }

  // ajax获得统计结果数据
  getFunnelUsersCount(client_or_department = 2) {
    xhr({
      url: '/funnel/reports/ajax_query/',
      type: 'GET',
      data: {
        method: 'funnel_user',
        user_group_id: this.group_id,
        client_or_department: client_or_department,
        pre_user_group_id: this.pre_group_id
      },
      success: (res) => {
        this.setState({
          iftableloading: false
        })
        if(!res.elements) return
        this.res_data = res.elements
        this.setState({
          table_data: this.res_data,
          defaultIndexValue: 1
        })
        this.setUserCount()
      }
    })
  }

  // 设置指标为用户数
  setUserCount() {
    const option = dcopy(this.option)
    this.res_data.map(function(item) {
      option.legend.data.push(item.name)
      option.series[0].name = '用户数'
      option.series[0].data.push({
        value: item.user_count,
        name: item.name
      })
    })
    this.setState({
      option: option
    })
  }

  // 设置指标为客户数
  setCustomerCount() {
    const option = dcopy(this.option)
    this.res_data.map(function(item) {
      option.legend.data.push(item.name)
      option.series[0].name = '客户数'
      option.series[0].data.push({
        value: item.customer_count,
        name: item.name
      })
    })
    this.setState({
      option: option
    })
  }

  // 切换指标
  handleChangeIndex(value) {
    this.setState({
      defaultIndexValue: value
    })
    switch(value) {
      case 1:
        this.setUserCount();
        break
      case 2:
        this.setCustomerCount()
    }
  }

  // 切换一级标签
  handleChangeFirstLabels(value) {
    this.setState({
      secondLabels: [],
      thirdLabels: [],
      secondLabelsDisable: false,
      thirdLabelsDisable: true,
      labelsButtonDisabled: true
    }, () => {
      this.getLabelList(value, 2)
    })
  }

  // 切换二级标签
  handleChangeSecondLabels(value) {
    this.setState({
      thirdLabelsDisable: false,
      thirdLabels: [],
      labelsButtonDisabled: true
    }, () => {
      this.getLabelList(value, 3)
    })
  }

  // 切换三级标签
  handleChangeThirdLabels(value, item) {
    this.labelItem = item
    this.setState({
      labelsButtonDisabled: false
    })
  }

  // 确定选择的标签
  handleLabelsClick() {
    let isRepeat = false
    this.state.labels.map(function(item) {
      if(item.props.value == this.labelItem.label_id) {
        message.danger('标签已存在,请重新选择!')
        isRepeat = true
      }
    }, this)
    if(!isRepeat) {
      this.setState({
        labels: this.state.labels.concat(
          <Button key={this.labelItem.label_id} value={this.labelItem.label_id}>
            {this.labelItem.label_name}
            <div className="lable-del"><Icon type="remove" data-label_id={this.labelItem.label_id} onClick={(e) => {this.handleRemoveLabel(e)}}/></div>
          </Button>
        ),
        labelsCheckBox: this.state.labelsCheckBox.concat(
          <Checkbox key={this.labelItem.label_id} value={this.labelItem.label_id}>{this.labelItem.label_name}</Checkbox>
        ),
        secondLabels: [],
        secondLabelsDisable: true,
        thirdLabels: [],
        thirdLabelsDisable: true,
        labelsButtonDisabled: true,
        addLabelsModal: false
      })
    } else {
      this.setState({
        secondLabels: [],
        secondLabelsDisable: true,
        thirdLabels: [],
        thirdLabelsDisable: true,
        labelsButtonDisabled: true,
        addLabelsModal: false
      })

    }
  }

  // 删除自定义宏观画像标签
  handleRemoveLabel(e) {
    e.stopPropagation()
    const label_id = e.target.getAttribute('data-label_id')
    this.state.labels.map(function(item, index) {
      item.key == label_id && this.state.labels.splice(index, 1)
    }, this)
    this.state.labelsCheckBox.map((item, index) => {
      e.target.parentNode.parentNode.value === item.key && this.state.labelsCheckBox.splice(index, 1)
    })
    this.setState({ ...this.state})
  }

  // 切换宏观画像标签
  handleChangeMacroPortraitIndex(value) {
    this.getMacroPortrait(value.target.value)
  }

  handleCustomIndexClick() {
    this.setState({
      customIndexShow: true
    })
    this.getUsersList()
  }

  // ajax获得标签列表数据
  getLabelList(parent_id = null, level = 1) {
    const params = parent_id && {
      parent_id: parent_id
    }
    xhr({
      url: '/config_exchange/user_group_three_label/',
      type: 'GET',
      cache: 0,
      data: params,
      success: (res) => {
        switch(level) {
          case 1:
            this.setState({
              firstLabels: res.elements
            });
            break
          case 2:
            this.setState({
              secondLabels: res.elements
            });
            break
          case 3:
            this.setState({
              thirdLabels: res.elements
            });
            break
        }
      }
    })
  }

  // ajax获得宏观画像数据
  getMacroPortrait(label_id) {
    this.setState({
      isMacroPortraitOption: false
    })
    xhr({
      url: '/funnel/reports/ajax_query/',
      type: 'GET',
      data: {
        method: 'funnel_user_macro',
        user_group_id: this.group_id,
        label_id: label_id,
        pre_user_group_id: this.pre_group_id
      },
      success: (res) => {
        let xData = [],
          sData = []
        if(!!res.elements && res.elements.length>0){
          res.elements.map((item,i)=>{
            xData.push(item.attr_name)
            sData.push(item.attr_number)
          })
        } 
        // for(let one in res.elements[0]) {
        //   xData.push(one)
        //   sData.push(res.elements[0][one])
        // }      
        this.state.macroPortraitOption.xAxis[0].data = xData
        this.state.macroPortraitOption.series[0].data = sData
        this.setState({
          macroPortraitOption: this.state.macroPortraitOption,
          isMacroPortraitOption:true
        })
      }
    })
  }

  // ajax获得用户列表数据
  getUsersList() {
    xhr({
      url: '/funnel/reports/ajax_query/',
      type: 'GET',
      data: {
        method: 'funnel_user_list',
        user_ids: JSON.stringify(this.state.usersListParamsUserIds),
        user_attr: JSON.stringify(this.state.usersListParamsUserAttr ? this.state.usersListParamsUserAttr : []),
        user_group_id: this.group_id,
        pre_user_group_id: this.pre_group_id
      },
      success: (res) => {
        let columns = []
        if(res.columns) {
          columns = res.columns.map(function(item) {
            if(item.key == 'fund_account'){
              item.name = '客户号'
            }
            return({
              title: item.name,
              key: item.key
            })
          })
        }      
        columns.push({
          title: '操作',
          render: (item) => <a href={common.rebuildUrl('/user/detail/') + '?sid=' + item.superid + '&gid=' + item.gid + '&uid='+ item.uid} target="_blank">详情</a>
        })
        let arr = res.elements
        arr && arr.forEach((item)=>{
          if(!!item.mobile) item.mobile = item.mobile.substring(0,3) + '****'
          if(!!item.user_name)  item.user_name = item.user_name.substring(0,1) + '**'
         })
        this.setState({
          userListColumns: columns,
          usersListData: arr,
          ifreturndata: true
        })
      }
    })
  }

  handleClickSaveFromStateButton() {
    this.setState({
      showSaveForm: !this.state.showSaveForm,
      customIndexShow: true
    })
    const _this = this
    xhr({
      type: 'POST',
      url: '/user_group/config_exchange/user_group_label',
      success(data) {
        _this.setState({
          groupLabels: data.elements
        })
      }
    })
  }

  handleChangeIsShrotcut(e) {
    e.target.checked ? this.refs.saveGroupForm.state.data.is_shortcut = 1 : this.refs.saveGroupForm.state.data.is_shortcut = 0
  }

  handleSaveGroup(data) {
    const _this = this
    const state = this.state
    if(this.state.groupname.indexOf(data.group_name) > -1) {
      message.danger('用户群名称重复！')
      return
    }
    if(state.ifshowlabel && (!state.diylabel || state.diylabel.length > 30)) {
      message.danger('分类标签长度不符合规则，请输入1-30个字符')
      return
    }
    if(data.desc && (data.desc.length > 100)) {
      message.danger('描述大于100个字符，请修改')
      return
    }
    if(this.refs.saveGroupForm.validate(data)) {
      xhr({
        type: 'POST',
        url: '/funnel/config_exchange/funnel_save_user_group/',
        data: {
          user_group_id: this.group_id,
          group_name: data.group_name,
          desc: data.desc,
          label: state.ifshowlabel ? state.diylabel : state.givenlabel,
          is_shortcut: data.is_shortcut ? data.is_shortcut : 0
        },
        success(res) {
          res === 'success' ? message.success('保存成功') : message.error('保存失败')
          _this.setState({
            showSaveForm: false
          })
        }
      })
    }
  }

  // 判断选中指标
  totalNum(selects, type) {
    const num = this.state.usersListParamsUserAttr.length + this.state.usersListParamsUserIds.length
    const arrtype = type != 'base' ? this.state.usersListParamsUserIds : this.state.usersListParamsUserAttr
    if((num >= 6) && (selects.length + arrtype.length >= 6)) {
      this.setState({ ...this.state}, () => {
        message.danger('指标最多可选6个！')
      })
      return true
    } else {
      return false
    }
  }

  render() {
      const TOKEN_KEY = config.get('TOKEN_KEY')
      const TOKEN_VALIDATE = config.get('TOKEN_VALIDATE') === 'true' ? true : false
      return(
          <div className="funnel_group">
        <div className="bt">
          <div className="crumbs">
            <p>{this.funnel_name}用户列表</p>
            <Breadcrumb separator=">">
              <Breadcrumb.Item>首页</Breadcrumb.Item>
              <Breadcrumb.Item>自定义业务漏斗</Breadcrumb.Item>
              <Breadcrumb.Item>用户列表</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
        <div className="padding20">
          <div className="bfd-panel">
            <div className="purple_xian_bottom">
              <ButtonGroup defaultValue={2} onChange={::this.handleChangeUsersCount}>
                <Button value={2}>营业部用户分布</Button>
                <Button value={1}>跨平台用户分布</Button>
              </ButtonGroup>
            </div>
            <div className="panel-50 purple_xian_right">
              {/*    左侧饼图   */}
              <div className="left-pie">
              指标
                <Select
                  defaultValue={1}
                  value={this.state.defaultIndexValue}
                  onChange={::this.handleChangeIndex}
                >
                  <Option value={1}>用户数</Option>
                  <Option value={2}>客户数</Option>
                </Select>
              </div>
              <ReactEcharts
                option={this.state.option}
                style={{height: '300px', width: '100%'}}
              />
            </div>
            <div className="panel-50">
              {/*    右侧列表   */}
              <Spin spinning={this.state.iftableloading}>
              <DataTable
                columns={this.state.columns}
                data={this.state.table_data}
                pageSize={8}
                currentPage={1}
                onPageChange={()=>{}}
                // pagingDisabled
              />
              </Spin>
            </div>
          </div>
          <div className="bfd-panel">
            <h4>自定义宏观画像
              <Tooltip
                title="宏观画像！说明：系统默认显示两个标签“普通账户 – 是否有效账户”和“仅一个月日均资产”，用户可点击标签右侧的“+”符号，筛选并添加自己想要查看的标签，然后点击该标签即可查看相应数据。"             >
                <Icon type="question-circle" />
            </Tooltip>
            </h4>
            <ul className="tag-group">
              <ButtonGroup defaultValue={this.labelItem.label_id||(100010000200002 + '')} onChange={::this.handleChangeMacroPortraitIndex}>
              {this.state.labels}
              </ButtonGroup>
              <div className="tag-group-add">
                <Icon type="plus-circle" style={{cursor: 'pointer'}} onClick={() => {this.setState({addLabelsModal: true})}}/>
                {this.state.addLabelsModal &&
                  <div className="tag-group-add-tc">
                    <ul>
                      <li>
                        <label>一级标签</label>
                        <Select
                          ref="firstLabels"
                          noMatchingContent="请选择"
                          data={this.state.firstLabels}
                          onChange={::this.handleChangeFirstLabels}
                          render={item => <Option value={item.id}>{item.label_name}</Option>}
                        />
                      </li>
                      <li>
                        <label>二级标签</label>
                        <Select
                          ref="secondLabels"
                          noMatchingContent="请选择"
                          data={this.state.secondLabels}
                          onChange={::this.handleChangeSecondLabels}
                          disabled={this.state.secondLabelsDisable}
                          render={item => <Option value={item.id}>{item.label_name}</Option>}
                        />
                      </li>
                      <li>
                        <label>三级标签</label>
                        <Select
                          ref="thirdLabels"
                          noMatchingContent="请选择"
                          data={this.state.thirdLabels}
                          onChange={::this.handleChangeThirdLabels}
                          disabled={this.state.thirdLabelsDisable}
                          render={item => <Option value={item.label_id}>{item.label_name}</Option>}
                        />
                      </li>
                    </ul>
                    <div>
                      <Button onClick={::this.handleLabelsClick} disabled={this.state.labelsButtonDisabled}>确定</Button>
                      <Button onClick={() => {
                        this.setState({
                          addLabelsModal: false,
                          secondLabelsDisable: true,
                          secondLabels: [],
                          thirdLabelsDisable: true,
                          thirdLabels: []
                        })}}>取消</Button>
                    </div>
                  </div>
                }
              </div>
            </ul>
            {/*    柱图   */}
            {this.state.isMacroPortraitOption ? (
              <ReactEcharts
                option={this.state.macroPortraitOption}
                style={{height: '300px', width: '100%'}}
              />
              ):(<div style={{textAlign:'center'}}><Spin/></div>)}
            
          </div>
          <div className="bfd-panel">
            <div className="p-m20">
              {!this.state.customIndexShow && (
                <div className="zdy-tc">
                  <div className="zdy-tc-bt"><i className="fa fa-sliders"/>自定义指标</div>
                  <div className="zdy-tc-con">
                    <div className="zdy-tc-con-mb"><span>基础指标：</span>
                      <CheckboxGroup defaultSelects={this.state.usersListParamsUserIds}
                      selects={this.state.usersListParamsUserIds}
                      onChange={(selects) => {
                        if(this.totalNum(selects,'base')) return
                        this.setState({usersListParamsUserIds: selects})
                        }}>
                        <Checkbox disabled={true} value="gid">GID</Checkbox>
                        <Checkbox disabled={true} value="sid">SID</Checkbox>
                        <Checkbox value="fund_account">客户号</Checkbox>
                        <Checkbox value="mobile">手机号</Checkbox>
                        <Checkbox value="user_name">姓名</Checkbox>
                      </CheckboxGroup>
                    </div>
                    <div className="zdy-tc-con-mb"><span>自定义指标：</span>
                      <CheckboxGroup defaultSelects={this.state.usersListParamsUserAttr}
                      selects={this.state.usersListParamsUserAttr}
                      onChange={(selects) => {
                        if(this.totalNum(selects,'diy')) return
                        this.setState({usersListParamsUserAttr: selects})
                        }}>
                        {this.state.labelsCheckBox}
                      </CheckboxGroup>
                    </div>
                    <p><span style={{color: '#ff0000'}}>*</span>可同时选<span style={{color: '#7986cb'}}>6</span>项</p>
                    <div className="zdy-tc-con-but">
                      <Button onClick={::this.handleCustomIndexClick}>确认</Button>
                      <Button onClick={() => {this.setState({customIndexShow: true})}}>取消</Button>
                    </div>
                  </div>
                </div>
              )}
              <Button size="lg" onClick={() => {this.setState({customIndexShow: false, showSaveForm: false})}}><i className="fa fa-sliders"/>自定义指标</Button>
              <Button size="lg" onClick={::this.handleClickSaveFromStateButton}><i className="fa fa-group"/>保存为用户群</Button>
              {this.state.showSaveForm && (
                <div className="save_user_group zdy-tc">
                  <div className="zdy-tc-bt save_user_group-bt"><span><i className="fa fa-group"></i>保存为用户群</span></div>
                  <div className="zdy-tc-con">
                    <Form ref="saveGroupForm" rules={this.rules} onSubmit={::this.handleSaveGroup}>
                      <FormItem label="用户群名称" help="30个字符以内" required name="group_name">
                        <FormInput />
                      </FormItem>
                      <FormItem label="描述" name="desc" help="请输入描述,最多100个字符">
                        <FormTextarea />
                      </FormItem>
                      <FormItem label="分类标签" name="label">
                        <Select defaultValue='add_mark' className='halfwidth'  onChange={(value)=>{
                          value === 'add_mark' ? this.setState({ifshowlabel:true})
                          : this.setState({ifshowlabel:false, givenlabel:value})}}>
                          <Option  value='add_mark' style={{color:'red'}}>新建一个分类标签</Option>
                          {this.state.groupLabels.map((item)=>{
                            return <Option value={item} key={uuidV4()}>{item}</Option>
                          })}
                        </Select>
                        {this.state.ifshowlabel && (<Input className='halfwidth' placeholder="1-30个字符" onChange={(event)=>{this.state.diylabel = event.target.value}}/>)}
                      </FormItem>
                      <FormItem label="其他" name="is_shortcut">
                        <Checkbox value={1} onChange={::this.handleChangeIsShrotcut} />
                        <span className="bfd-checkbox-font">添加到全局查看报告快捷选择中</span>
                      </FormItem>
                      <FormSubmit>确定</FormSubmit>
                      <ButtonBfd onClick={() => {this.setState({showSaveForm: false})}}>取消</ButtonBfd>
                    </Form>
                  </div>
                </div>
              )}
              <div className='download-right'>
              <Link
                to={xhr.baseUrl + '/upload_export/'}
                query= {
                  TOKEN_VALIDATE?{
                  method: 'export_user_group',
                  user_group_id: this.group_id,
                  user_ids: JSON.stringify(this.state.usersListParamsUserIds),
                  user_attr: JSON.stringify(this.state.usersListParamsUserAttr ? this.state.usersListParamsUserAttr : []),
                  _: Base64.encode(sessionStorage.getItem(TOKEN_KEY))
                }:{
                  method: 'export_user_group',
                  user_group_id: this.group_id,
                  user_ids: JSON.stringify(this.state.usersListParamsUserIds),
                  user_attr: JSON.stringify(this.state.usersListParamsUserAttr ? this.state.usersListParamsUserAttr : [])
                }}
                target="_blank"
              >
              <Icon type="download"/>
              </Link>
              </div>
            </div>
            {/*    列表   */}
              {this.state.ifreturndata ? (
                <DataTable
                  columns={this.state.userListColumns}
                  data={this.state.usersListData}
                  pageSize={20}
                />) : (<Spinner className="spiner_bt"/>)}
          </div>
        </div>
      </div>
    )
  }
}
export default Group
