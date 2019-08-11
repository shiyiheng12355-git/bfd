import React, {
  Component,
} from 'react'
import { connect } from 'dva';
// import { AppkeyFilter, SuggestInput } from 'public/comp'
import uuidV4 from 'uuid/v4'
import SelectCondition from '../SelectCondition'
import { Select, Spin, Modal, Button, Popover, Icon, Row, Col, Tooltip, Input, InputNumber, Form, notification } from 'antd'
import styles from './index.less'

const InputGroup = Input.Group;
const Option = Select.Option;
const FormItem = Form.Item;
const TextArea = Input.TextArea;
/**
 *
 *
 * @class InputSelect
 * @extends {Component}
 */
class InputSelect extends Component {
  render() {
    const { value, onChange } = this.props;

    return (<InputGroup compact>
      <InputNumber style={{ width: '50%', marginRight: 0 }}
        onChange={(v) => {
          onChange && onChange({
            value: v,
            until: value.until,
          });
        }}
        precision={0}
        value={value.value} />
      <Select value={value.until}
        onChange={(v) => {
          onChange && onChange({
            value: value.value,
            until: v,
          })
        }}>
        <Option value="1">小时</Option>
        <Option value="2">天</Option>
      </Select>
    </InputGroup>)
  }
}

@connect(state => ({
  funelAdd: state['report/funelAdd'],
  Global: state.LOADING,
}))
@Form.create()
class Add extends Component {
  constructor(props) {
    super(props)
    this.props = props;
    this.state = {
      acrossPlatformData: {
        cross_last: '',
        cross_next: '',
      },
      bizFunnelStepPO: props.data ? props.data.bizFunnelStepPO : [// 步骤数据
        {
          acrossPlatformJson: '', // 跨平台参数
          appkey: 0, // 客户端
          eventParamJson: '', // 查询语句
          isAcrossPlatform: 0, // 是否跨平台
          stepName: '', // 步骤名
          stepNum: 0, // 步骤号 表示第几步
        },
      ],
      formData: {
        funnelName: '', // 漏斗名字
        funnelDesc: '', // 漏斗注释
        isAcrossPlatform: 0, // 是否跨平台
        isMonitor: 1,
        windowPeriod: 1, // 窗口期(小时)
        funnelAuthorityType: 1, // 漏斗权限类型（0个人1生命旅程）
      },
    }
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'report/funelAdd/fetchGetAppList',
    });
    this.props.dispatch({
      type: 'report/funelAdd/fetchGetFunnelLevel',
    });
  }

  // 初始化数据
  componentDidMount() {

  }
  /**
   * 数据校验
   */
  dataFormat(data) {
    let num = 0,errorNum = 0;
    let {funelAdd} = this.props;
    let { maxStep } = funelAdd;
    data.map((item, i) => {
      data.stepNum = i + 1;
      if(item.stepName==''){
        errorNum++
      }
      if (item.eventParamJson) {
        num++
      }
    })
    if (num < 3) {
      notification.open({
        message: '提示',
        description: '漏斗步骤不少于3步！',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      return false
    }else if( num > maxStep*1 ){
      notification.open({
        message: '提示',
        description: `漏斗步骤不多于${maxStep}步！`,
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      return false
    }else if(errorNum != 0){
      notification.open({
        message: '提示',
        description: '请漏斗步骤信息补充完整！',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      return false
    } else {
      return true
    }
  }
  /**
   * 保存漏斗数据
   * @param {*} data
   */
  saveAddFrom(data) {
    if (!this.dataFormat(data)) {
      return false;
    }
    const self = this;
    const { form, onCancel, isList, onChange } = this.props;
    const { formData } = this.state;
    let data2 = {};
    form.validateFields((err, values) => {
      if (!err) {
        values.windowPeriod = values.windowPeriod.until == '2' ? values.windowPeriod.value * 24 : values.windowPeriod.value
        data2 = {
          ...formData,
          ...values,
          bizFunnelStepPO: data,
        }
        
        console.log(JSON.stringify(data2));
        // 生命周期调用组件只返回表单数据
        if (onChange) {
          onChange(data2);
          self.props.form.resetFields()
          self.state.bizFunnelStepPO = [// 步骤数据
            {
              acrossPlatformJson: '', // 跨平台参数
              appkey: 0, // 客户端
              eventParamJson: '', // 查询语句
              isAcrossPlatform: 0, // 是否跨平台
              stepName: '', // 步骤名
              stepNum: 0, // 步骤号 表示第几步
            },
          ]
        } else {
          this.props.dispatch({
            type: 'report/funelAdd/fetchAddFunnel',
            payload: data2,
            callback: () => {
              // 重置数据

              isList && this.props.dispatch({
                type: 'report/funnel/fetchFunnelaList',
                payload: 1,
                callback: () => {
                  self.props.form.resetFields()
                  self.state.bizFunnelStepPO = [// 步骤数据
                    {
                      acrossPlatformJson: '', // 跨平台参数
                      appkey: 0, // 客户端
                      eventParamJson: '', // 查询语句
                      isAcrossPlatform: 0, // 是否跨平台
                      stepName: '', // 步骤名
                      stepNum: 0, // 步骤号 表示第几步
                    },
                  ]
                },
              })
              !isList && onCancel()
            },
          })
        }
      }
    })
  }
  /**
   * 設置跨平台參數
   *
   * @memberof Add
   */
  setAcrossPlatformJson(index, type) {
    let { acrossPlatformData, bizFunnelStepPO, formData } = this.state;
    let num = 0;
    // 保存跨平台
    if (type) {
      Object.keys(acrossPlatformData).map((item) => {
        if (!acrossPlatformData[item]) {
          num++;
        }
      })
      if (num !== 0) {
        notification.open({
          message: '提示',
          description: '请选择参数',
          icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
        });
        return false
      }
      bizFunnelStepPO[index].acrossPlatformJson = JSON.stringify(acrossPlatformData);
      bizFunnelStepPO[index].isAcrossPlatform = 1;
      formData.isAcrossPlatform = 1;
      // 清除跨平台
    } else {
      bizFunnelStepPO[index].acrossPlatformJson = '';
      bizFunnelStepPO[index].isAcrossPlatform = 0;
      formData.isAcrossPlatform = 0;
    }
    this.setState({
      acrossPlatformData: {
        cross_last: '',
        cross_next: '',
      },
      formData,
      bizFunnelStepPO,
    });
    this.props.dispatch({
      type: 'report/funelAdd/closeStrideData',
    })
  }
  /**
   * 更新步骤
   * @param {*} value
   * @param {*} index
   */
  upBizFunnelStepPO(value, index) {
    let { bizFunnelStepPO } = this.state;
    let num = 0,
        m = true;
    bizFunnelStepPO.map((item,i)=>{
      if(item.stepName == value.stepName && index != i){
        num++
      }
    })
    if(/^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_])*$/.test(value.stepName) == false){
      notification.open({
        message: '提示',
        description: '步骤名称不得包含特殊符号和空格,保存将剔除不合法的步骤，请修改步骤名',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      m = false
    }
    if(!value.stepName){
      notification.open({
        message: '提示',
        description: '步骤名称不得为空',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      m = false
    }
    if(num > 0){
      
      notification.open({
        message: '提示',
        description: '步骤名称不得相同,保存将剔除相同名称的步骤，请修改步骤名',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
      
      m = false
    }
    if(m){
      bizFunnelStepPO[index] = value;
    }

    this.setState({
      bizFunnelStepPO,
    })
    return m
  }
  // 打开跨平台弹框
  openStrideBox(index) {
    const { bizFunnelStepPO } = this.state;
    let a = bizFunnelStepPO[index],
      b = bizFunnelStepPO[index + 1];
    let aData = JSON.parse(a.eventParamJson), // 选择条件
      bData = JSON.parse(b.eventParamJson);// 选择条件
    let aAData = a.acrossPlatformJson ? JSON.parse(a.acrossPlatformJson) : {};// 跨平台数据
    this.state.acrossPlatformData.cross_last = aAData.cross_last||"";
    this.state.acrossPlatformData.cross_next = aAData.cross_next||"";
    this.props.dispatch({
      type: 'report/funelAdd/fetchStrideData',
      payload: [{
        stepName: a.stepName, // 步骤名称
        eventId: aData.action.eventId, // 事件
        eventName: aData.action.eventName, // 事件名
        cross: aAData.cross_last || '',
        paramList: [], // 参数列表
      }, {
        stepName: b.stepName, // 步骤名称
        eventId: bData.action.eventId, // 事件
        eventName: bData.action.eventName, // 事件名
        cross: aAData.cross_next || '',
        paramList: [], // 参数列表
      }, index],
    })
  }
  render() {
    const { bizFunnelStepPO } = this.state
    let { form, data, funelAdd, Global, onCancel } = this.props;
    const { getFieldValue, setFieldsValue, getFieldDecorator } = form;
    const {
      showStride,
      strideData,
    } = funelAdd;
    const {
      global,
    } = Global;
    data = data || {};
    return (
      <div className={styles.add} id="mark">
        <Spin spinning={global}>
          <Form>
            <Row className={styles['add-screen']}>
              <Col span={10}>
                <FormItem style={{ margin: 0 }} label="转化漏斗名称：" >
                  {getFieldDecorator('funnelName', {
                    initialValue: data.funnelName || '',
                    rules: [{
                      required: true, message: '请输入漏斗名称',
                    },{
                      max: 30, message: '漏斗名称不超过30个字节',
                    }, {
                      validator: (rule, value, callback) => {
                        this.props.dispatch({
                          type: 'report/funelAdd/fetchReName',
                          payload: value,
                          callback: (type) => {
                            if (type) {
                              callback('漏斗已存在，请重新输入!')
                            } else {
                              callback();
                            }
                          },
                        });
                      },
                    }],
                  })(
                    <Input placeholder="请输入漏斗名称" />
                  )}
                </FormItem>
              </Col>
              <Col span={14}>
                <FormItem style={{ margin: 0 }} label="设置窗口期" >
                  {getFieldDecorator('windowPeriod', {
                    initialValue: {
                      value: data.windowPeriod || 1,
                      until: '1',
                    },
                    rules: [{
                      required: true, message: '设置窗口期',
                    },{
                      validator: (rule, value, callback) => {
                        if(value.value <= 0  ){
                          callback('窗口期应大于0')
                        }else if(value.value===''|| value.value===undefined){
                          callback('设置窗口期')
                        }else if(value.until==2&&value.value>100){
                          callback('窗口期不得超过100天！')
                        }else if(value.until==1&&value.value>24){
                          callback('窗口期选择小时不得超过24小时！')
                        }else{
                          callback()
                        }
                      }
                    }],
                  })(
                    <InputSelect />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <FormItem label="漏斗描述" >
                {getFieldDecorator('funnelDesc', {
                  initialValue: data.funnelDesc || '',
                  rules: [{
                    max: 100, message: '漏斗描述不得超过100个字节 ',
                  }],
                })(
                  <TextArea />
                )}
              </FormItem>
            </Row>
            {/* 漏斗步骤添加========================================================================== */}
            <div className={styles['add-step']}>
              {/* {this.funnelContainer()} */}

              {bizFunnelStepPO && bizFunnelStepPO.map((item, i) => {
                let stepData = bizFunnelStepPO[i + 1] && bizFunnelStepPO[i + 1].eventParamJson && JSON.parse(bizFunnelStepPO[i + 1].eventParamJson);
                let stepData1 = bizFunnelStepPO[i] && bizFunnelStepPO[i].eventParamJson && JSON.parse(bizFunnelStepPO[i].eventParamJson);
                if (stepData && stepData1) {
                  stepData = stepData.action.eventId;
                  stepData1 = stepData1.action.eventId;
                }
                return (<SelectCondition
                  key={i}
                  data={item}
                  index={i + 1}
                  isStride={(stepData && stepData1) ? (() => {
                    this.openStrideBox(i);
                  }) : false}
                  removeBox={() => {
                    let { bizFunnelStepPO } = this.state;
                    bizFunnelStepPO.splice(i);
                    this.setState({
                      bizFunnelStepPO,
                    })
                  }}
                  onChange={(value) => {
                    // 更新步骤数据
                    return this.upBizFunnelStepPO(value, i);
                  }} />)
              })}
              <Modal
                closable={false}
                title="选择不同平台事件通过相同值进行关联的参数"
                visible={showStride}
                okText="保存"
                footer={[
                  <Button key="back" type="primary" onClick={() => { this.setAcrossPlatformJson(strideData[2], true) }}>保存</Button>,
                  <Button key="submit"
                    type="minor"
                    onClick={() => {
                      this.setAcrossPlatformJson(strideData[2], false)
                    }}>取消</Button>,
                ]}
                wrapClassName={styles['second-model']}
              >
                <div className={styles['second-model-graybg']}>
                  <p>上一步：<span className={styles['font-gray']}>{strideData[0] ? strideData[0].stepName : ''}</span></p>
                  <div className={styles['second-model-graybg-second']}>事件：{strideData[0] ? strideData[0].eventName : ''}
                    <span className={styles['second-model-de']}>的</span>
                    <Select
                      getPopupContainer={d => d.parentNode}
                      dropdownMatchSelectWidth={false}
                      className={styles['crossparam-left']}
                      value={strideData[0] ? strideData[0].cross : ''}
                      onSelect={(value, item) => {
                        this.state.acrossPlatformData.cross_last = value;
                        // 更新跨平台弹框数据
                        strideData[0].cross = value;
                        this.props.dispatch({
                          type: 'report/funelAdd/setStrideData',
                          payload: strideData,
                        })
                      }}
                    >
                    <Option value="">请选择</Option>
                      {strideData[0] ? strideData[0].paramList.map((item, i) => {
                        return <Option key={i} value={item.fieldName} refData={item}>{item.paramBizDesc}</Option>
                      }) : null}
                    </Select>参数
                </div>
                </div>
                <div className={styles['second-model-graybg']}>
                  <p>下一步：<span className={styles['font-gray']}>{strideData[1] ? strideData[1].stepName : ''}</span></p>
                  <div className={styles['second-model-graybg-second']}>事件：{strideData[1] ? strideData[1].eventName : ''}
                    <span className={styles['second-model-de']}>的</span>
                    <Select
                      getPopupContainer={d => d.parentNode}
                      className={styles['crossparam-left']}
                      dropdownMatchSelectWidth={false}
                      value={strideData[1] ? strideData[1].cross : ''}
                      onSelect={(value, item) => {
                        this.state.acrossPlatformData.cross_next = value;
                        // 更新跨平台弹框数据
                        strideData[1].cross = value;
                        this.props.dispatch({
                          type: 'report/funelAdd/setStrideData',
                          payload: strideData,
                        })
                      }}
                    >
                    <Option value="">请选择</Option>
                      {strideData[1] ? strideData[1].paramList.map((item, i) => {
                        return <Option key={i} value={item.fieldName} refData={item}>{item.paramBizDesc}</Option>
                      }) : null}
                    </Select>参数
                </div>
                </div>
              </Modal>
            </div>
            <div className={styles.addfunnelstep}
              style={{cursor:'pointer',float: 'left'}}
              onClick={() => {
                let { bizFunnelStepPO } = this.state;
                let len = bizFunnelStepPO.length;
                if(len && ((!bizFunnelStepPO[len-1].stepName)||(!bizFunnelStepPO[len-1].appkey)||(!bizFunnelStepPO[len-1].eventParamJson))){
                  notification.open({
                    message: '提示',
                    description: '请完善前一步骤信息',
                    icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
                  });
                  return 
                }
                bizFunnelStepPO.push({
                  acrossPlatformJson: '', // 跨平台参数
                  appkey: 0, // 客户端
                  eventParamJson: '', // 查询语句
                  isAcrossPlatform: 0, // 是否跨平台
                  stepName: '', // 步骤名
                  stepNum: 0,
                })
                this.setState({
                  bizFunnelStepPO,
                })
              }}>增加步骤</div>

          </Form>
          <div className={styles['add-button']}>
            <Button type="primary"
              onClick={() => {
                console.log('funnel data====', this.state.bizFunnelStepPO)
                this.saveAddFrom(this.state.bizFunnelStepPO);
              }}
              style={{ marginRight: 10 }}>保存</Button>
            <Button onClick={() => {
              onCancel()
            }}>取消</Button>
          </div>
        </Spin>
      </div>
    )
  }
}

export default Add
