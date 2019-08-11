import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Input, Select, InputNumber, Form } from 'antd';

const { TextArea } = Input;
const Option = Select.Option;
const FormItem = Form.Item;

class InputBox extends Component{
  constructor(props) {
    super();
    this.state={
      startBit:props.value.startBit||"",
      endBit:props.value.endBit||""
    }
  }
  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;

    this.setState({
      startBit:value.startBit||"",
      endBit:value.endBit||""
    });
  }
  onChonge(type,value){
    let { onChange } = this.props;
    let data = {...this.state};
    data[type] = value
    onChange && onChange(data);
  }
  render(){
    const { value , disabled} = this.props;
    return (
    <Input.Group compact>
      <InputNumber style={{ width: 100, textAlign: 'center',marginRight:0 ,borderRadius:'3px 0 0 3px'}} value={(value.startBit)||''} onChange={(value)=>{
        this.onChonge('startBit',value );
      }} disabled={disabled} placeholder="开始位置" />
      <Input style={{ width: 40, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#fff' }} placeholder="~" disabled />
      <InputNumber style={{ width: 100, textAlign: 'center',borderLeft: 0,borderRightWidth: 1,borderRadius:'0 3px 3px 0'}} onChange={(value)=>{
        this.onChonge('endBit',value);
      }} value={(value.endBit)||''} disabled={disabled} placeholder="结束位置" />
      <label style={{ display: 'inline-block',marginLeft:10 }}>位字符脱敏显示</label>
    </Input.Group>
    )
  }
}

@connect(state => ({
  resource: state['jurisdiction/modelConfig'],
}))
@Form.create()
export default class ControlModal extends Component {
  state = {
    data: {},
  }


  componentWillReceiveProps(nextProps) {
    // const data = this.state.data;
    // const { modalData, controlType } = nextProps.resource;

    // this.setState({ data: nextProps.resource.modalData });
  }

 

  // handeText = (e, type) => {
  //   const data = this.state.data;
  //   data[type] = e.target.value;
  //   this.setState({ data });
  // }

  // handleChange = (val) => {
  //   let data = this.state.data;
  //   data.type=val.label;
  //   data.nodeType=val.key;
  //   console.log(val);
  //   this.setState({ data });
  // }

  handleOk = () => {
    const { controlType,form,resource} = this.props;
    const {modalData} = resource;
    if(controlType=='view'){
      this.props.form.resetFields();
      this.props.dispatch({
        type: 'jurisdiction/modelConfig/handleCloseModal',
      });
    }else{

      form.validateFields((err, values) => {
        console.log(values);
        if (!err) {
          let inputbox = values.InputBox;
          delete values.InputBox;
          let data = {...inputbox,...values};
          if(controlType == 'edit'){
            data.id = modalData.id;
          }
          this.props.dispatch({
            type: 'jurisdiction/modelConfig/fetchAddData',
            payload:data,
            callback:()=>{
              form.resetFields()
            }
          });
        }
      });
    }
    
    // if(controlType == 'createFirst'){
    //   this.props.dispatch({
    //     type: 'jurisdiction/modelConfig/fetchAddData',
    //     payload:data
    //   });
    // }
    
  }
  handleCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'jurisdiction/modelConfig/handleCloseModal',
    });
  }

  render() {
    
    // const { data } = this.state;
    const { resource, form } = this.props;
    const {
      modalData,
      visible,
      controlType,
      classificationData
    } = resource;
    let data = modalData;
    const { getFieldDecorator, setFieldsValue } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };  

    return (
      <div>
        <Modal
          title="模板信息"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem label="模板名称" {...formItemLayout} >
              {getFieldDecorator(`templateName`, {
                initialValue: data.templateName||'',
                rules: [{
                  required: true, message: '请输入模板名称',
                }],
              })(
                <Input placeholder="请输入模板名称" disabled={controlType === 'view'} />
                )}
            </FormItem>
            <FormItem label="脱敏字符" {...formItemLayout} >
              {getFieldDecorator(`InputBox`, {
                initialValue: data||{},
                rules: [{
                  required: true, message: '请输入脱敏字符',
                },{
                  validator:(rule, value, callback)=>{
                        
                       if (value.startBit > value.endBit) {
                          callback('请输入正确形式！')
                        }
  
                      // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
                      callback()
                    }
                }],
              })(
                <InputBox placeholder="请输入脱敏字符" disabled={controlType === 'view'} />
                )}
            </FormItem>
            <FormItem label="脱敏前" {...formItemLayout} >
              {getFieldDecorator(`beforeExample`, {
                initialValue: data.beforeExample||'',
                rules: [{
                  required: true, message: '请输入脱敏前示例',
                }],
              })(
                <Input placeholder="请输入脱敏前示例" disabled={controlType === 'view'} />
                )}
            </FormItem>
            <FormItem label="脱敏后" {...formItemLayout} >
              {getFieldDecorator(`afterExample`, {
                initialValue: data.afterExample||'',
                rules: [{
                  required: true, message: '请输入脱敏后示例',
                }],
              })(
                <Input placeholder="请输入脱敏后示例" disabled={controlType === 'view'} />
                )}
            </FormItem>
            <FormItem label="选择分类" {...formItemLayout} >
              {getFieldDecorator(`templateClassification`, {
                initialValue: data.templateClassification||'',
                rules: [{
                  required: true, message: '请选择分类',
                }],
              })(
                <Select placeholder="选择所属类型" getPopupContainer={triggerNode => triggerNode.parentNode}  disabled={controlType === 'view'}>
                  <Option value={1} >手机号</Option>
                  <Option value={2} >资金账户</Option>
                  <Option value={3} >QQ号</Option>
                  <Option value={4} >身份证号</Option>
                  <Option value={5} >E-mail</Option>
                </Select>
                )}
            </FormItem>
            <FormItem label="模板描述" {...formItemLayout} >
              {getFieldDecorator(`templateDesc`, {
                initialValue: data.templateDesc||'',
                rules: [{
                  required: true, message: '请输入模板描述',
                }],
              })(
                <TextArea rows={4} placeholder="不超过200个字符"  disabled={controlType === 'view'} />
          
                )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
