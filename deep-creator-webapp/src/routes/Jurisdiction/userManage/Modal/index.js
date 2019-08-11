import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Icon, Popconfirm, Button,Row, Col, Table, Input, Select, Form, Switch, TreeSelect,Spin,notification  } from 'antd';
import DropdownTree from '../../../../components/DropdownTree';
import styles from './index.less'
import uuidV4 from 'uuid/v4'
const TreeNode = TreeSelect.TreeNode;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;

@connect(state => ({
  userManageModal: state['userManage/modal'],
  userMange: state['userManage'],
  Global: state['LOADING']
}))
@Form.create()
class Basic extends Component {
  constructor(props) {
    super();
  }
  /**
   * [handleConfirmPassword 确认密码的校验]
   * @param  {[type]}   rule     [description]
   * @param  {[type]}   value    [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  handleConfirmPassword (rule, value, callback)  {
    const { form , index , data,controlType } = this.props;
    const { getFieldValue } = form;
    const reg = /^(?=.*[A-Z])(?![\d]+$)(?![a-zA-Z]+$)(?![+=_!@#%&*-]+$)[\da-zA-Z+=_!@#%&*-]{8,30}$/;
                        
    if (value && value !== getFieldValue(`userData[${index}].userPsw`)) {
        callback('两次输入不一致！')
    }else if(!value){
        callback('请确认密码!')
    }else if(!reg.test(value) && value !='******') {
      callback('大小写字母或数字或特殊符号（+=_!@#%&*-）任意两项的组合，长度8~30之间，不能与用户名相同，至少包含一个大写字母并区分大小写');
    }

    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
    callback()
  }
  render(){
    const { form, index, data, delCallback, isView,controlType } = this.props;
    const self = this;
    const { getFieldDecorator } = form;
    return <div className={styles.userFormLi}>
            <h3>{`用户${index+1}`}{isView===false?<Icon type="close" onClick={()=>{delCallback('del',index)}} className={styles.userFormLiBtn} />:null}</h3>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem label={'用户名称：'}>
                  {getFieldDecorator(`userData[${index}].userName`,{
                    initialValue:data.userName||'',
                    rules: [{ required: true, message: '请输入用户名!' },{
                      pattern:/^[a-zA-Z0-9_\-.]{4,16}$/,message: '4到16位（字母，数字，下划线，减号)'
                    },{
                      validator:(rule, value, callback)=>{
                        const { getFieldValue } = this.props.form
                        let userData = getFieldValue('userData');
                        if(isView === undefined && value== data.userName ) callback()
                        for( let i = 0 ,len = userData.length; i < len ; i++ ){
                          if(i != index && userData[i].userName == value){
                            callback('用户名已存在')
                            return 
                          }
                        }
                        this.props.dispatch({
                          type:'userManage/modal/fetchUserName',
                          payload:value,
                          callback:(t)=>{
                            if(t){
                              callback('用户名已存在')
                            }else{
                              callback();
                            }
                          }
                        })
                      }
                    }],
                  })(
                    <Input disabled={isView||controlType=='edit'} placeholder="请输入用户名" />
                  )}
                </FormItem>
              </Col>
              <Col span={8} >
                <FormItem label={`真实姓名：`}>
                  {getFieldDecorator(`userData[${index}].userFullname`,{
                    initialValue:data.userFullname||'',
                    rules: [{ required: true, message: '请输入姓名!' },
                    {
                      max:10,message: '姓名不得超过10个字节！'
                    }],
                  })(
                    <Input disabled={isView} placeholder="请输入姓名" />
                  )}
                </FormItem>
              </Col>
              <Col span={8} >
                <FormItem label={`邮箱：`}>
                  {getFieldDecorator(`userData[${index}].userEmail`,{
                    initialValue:data.userEmail||'',
                    rules: [{ required: true, message: '请输入邮箱!' },
                            { max: 30, message: 'Email不得超过10个字节！'},
                            { type: 'email', message: '请输入正确的邮箱格式!'}],
                  })(
                    <Input disabled={isView} placeholder="请输入邮箱" />
                  )}
                </FormItem>
              </Col>
              </Row>
              <Row gutter={24}>
              <Col span={8} >
                <FormItem label={`手机：`}>
                  {getFieldDecorator(`userData[${index}].userTel`,{
                    initialValue:data.userTel||'',
                    rules: [{ required: true, message: '请输入电话!' },
                    {pattern:/^1\d{10}$/, message: '请输入正确的手机格式!'}
                    ],
                  })(
                    <Input disabled={isView} placeholder="请输入电话" />
                  )}
                </FormItem>
              </Col>
              {
                // controlType!='edit'?
                // [<Col span={8} key="1">
                //   <FormItem label={`初始密码：`}>
                //     {getFieldDecorator(`userData[${index}].userPsw`,{
                //       initialValue:data.userPsw||'',
                //       rules: [{ required: true, message: '请输入密码!' }],
                //     })(
                //       <Input disabled={isView} type="password" placeholder="请输入密码" />
                //     )}
                //   </FormItem>
                // </Col>,
                // <Col span={8} key='2'>
                //   <FormItem label={`确定密码：`}>
                //     {getFieldDecorator(`userData[${index}].confirmWord`,{
                //       initialValue:data.confirmWord||'',
                //       rules: [{ required: true, message: '请确认密码!' },
                //               { validator:self.handleConfirmPassword.bind(self)}],
                //     })(
                //       <Input disabled={isView} type="password" placeholder="请确认密码" />
                //     )}
                //   </FormItem>
                // </Col>]:null
              }
                <Col span={8} key="1">
                  <FormItem label={`初始密码：`}>
                    {getFieldDecorator(`userData[${index}].userPsw`, {
                      initialValue: data.userPsw || (controlType=='edit'?'******':""),
                      rules: [
                      {validator:(rule, value, callback)=>{
                        const reg = /^(?=.*[A-Z])(?![\d]+$)(?![a-zA-Z]+$)(?![+=_!@#%&*-]+$)[\da-zA-Z+=_!@#%&*-]{8,30}$/;
                        
                        if(!value){
                          callback('请输入密码!');
                        }else if(!reg.test(value)&& value !='******') {
                          callback('大小写字母或数字或特殊符号（+=_!@#%&*-）任意两项的组合，长度8~30之间，不能与用户名相同，至少包含一个大写字母并区分大小写');
                        }else{
                          callback()
                        }
                      }}
                      ],
                    })(
                      <Input disabled={isView} type="text" onFocus={(e)=>{e.target.type='password';}} placeholder="请输入密码" />
                    )}
                  </FormItem>
                </Col>
                <Col span={8} key='2'>
                  <FormItem label={`确定密码：`}>
                    {getFieldDecorator(`userData[${index}].confirmWord`, {
                      initialValue: data.confirmWord || (controlType=='edit'?'******':""),
                      rules: [
                      { validator: self.handleConfirmPassword.bind(self) }],
                    })(
                      <Input disabled={isView} type="text" onFocus={(e)=>{e.target.type='password';}} placeholder="请确认密码" />
                    )}
                  </FormItem>
                </Col>
            </Row>
          </div>
  }
}
// Basic.contextTypes = {
//   form: React.PropTypes.object
// };
@connect(state => ({
  userManageModal: state['userManage/modal'],
  userMange: state['userManage'],
  Global: state['LOADING']
}))
@Form.create()
class UserModal extends Component {
  constructor(props) {
    super();
    const self = this;
    this.state = {
      tableData:props.userManageModal.formData.stationData,
      columns: [{
        title: '岗位名称',
        dataIndex: 'postName',
        key: 'postName',
        width:120,
        render:(item,row,index)=>{
          const {  form, isView,userMange } = self.props;
          const { FormData } = userMange
          return (
            <Select
              placeholder="请选择"
              value={item} 
              style={{width:'100%'}} 
              onChange={(value)=>{ this.changeTableData(index,'postName',value) }}
              disabled={isView} 
              
            >
              {FormData['5'] && FormData['5'].map((t,i)=>{
                return <Option key={i} value={t.roleName}>{t.roleName}</Option>
              })}
            </Select>
          )

          // return <Input disabled={isView} style={{width:'100%'}} defaultValue={item||''} placeholder="请输入岗位名称"  onBlur={(e)=>{
          //   this.changeTableData(index,'postName',e.target.value);
          // }} />
        }
      },
      // {
      //   title: '功能权限',
      //   dataIndex: 'operTemplateId',
      //   key: 'operTemplateId',
      //   width:120,
      //   render:(item,row,index)=>{
      //     const {  form, isView,userMange } = self.props;
      //     const {
      //       FormData
      //     } = userMange;
          
          // return <Select value={item||''} dropdownMatchSelectWidth={false} style={{width:85}} onChange={(value)=>{
          //     this.changeTableData(index,'operTemplateId',value);
          //   }} 
          //   disabled={isView} placeholder="请选择">
          //   {FormData['2']&&FormData['2'].map((t,i)=>{
          //     return <Option key={i} value={t.id}>{t.templateName}</Option>
          //   })}
          // </Select>
            
      //   }
      // },
      {
        title: '组织/部门',
        dataIndex: 'orgCode',
        key: 'orgCode',
        width:120,
        render:(item,row,index)=>{
          const { userMange,isView, form } = self.props;
          const {getFieldDecorator} = form;
          let d=[];
          const {
            FormData
          } = userMange;
          
          return <TreeSelect 
                placeholder="请选择"
                value={item||''}
                disabled={isView}
                onChange={(value)=>{
                  
                  if(FormData['1']&&value){
                    d = FormData['1'].childKey[value];
                  }
                  this.changeTableData(index,['orgCode','subNode'],[value,d]);
                }} 
                dropdownStyle={{padding:'5px 15px'}}
                dropdownMatchSelectWidth={false}
                style={{width: '100%'}}
                >
                {FormData['1']?self.renderTreeNodes(FormData['1'].treeData):[]}
              </TreeSelect>
        }
      },
      // {
      //   title: '列字段权限',
      //   dataIndex: 'columnTemplateId',
      //   key: 'columnTemplateId',
      //   width:120,
      //   render:(item,row,index)=>{
      //     const { userMange, form, isView,controlType } = self.props;
      //     const {getFieldDecorator} = form;
      //     const {
      //       FormData
      //     } = userMange;
      //     return <Select style={{width:85}} value={item||''} dropdownMatchSelectWidth={false}
      //         onChange={(value)=>{
                  
      //             if(controlType=='edit'){
      //               confirm({
      //                 title: '警告',
      //                 content: '该操作将会使相应岗位数据丢失，是否修改',
      //                 onOk() {
      //                   self.changeTableData(index,'columnTemplateId',value);
      //                 },
      //                 onCancel() {
                        
      //                 },
      //               });
      //             }else{
      //               self.changeTableData(index,'columnTemplateId',value);
      //             }
      //           }} 
      //         disabled={isView} placeholder="请选择">
      //         <Option key={-1} value={-1}>请选择</Option>
      //         {FormData['4']&&FormData['4'].map((t,i)=>{
      //           return <Option key={i} value={t.id}>{t.templateName}</Option>
      //         })}
      //       </Select>
            
      //   }
      // },
      // {
      //   title: '行字段权限',
      //   dataIndex: 'rowTemplateId',
      //   key: 'rowTemplateId',
      //   width:120,
      //   render:(item,row,index)=>{
      //     const { userMange, form, isView, controlType } = self.props;
      //     const {getFieldDecorator} = form;
      //     const {
      //       FormData
      //     } = userMange;
      //     return <Select style={{width:85}} value={item||''} disabled={isView}
      //           onChange={(value)=>{
      //             if(controlType=='edit'){
      //               confirm({
      //                 title: '警告',
      //                 content: '该操作将会使相应岗位数据丢失，是否修改',
      //                 onOk() {
      //                   self.changeTableData(index,'rowTemplateId',value);
      //                 },
      //                 onCancel() {
                        
      //                 },
      //               });
      //             }else{
      //               self.changeTableData(index,'rowTemplateId',value);
      //             }
                  
      //           }}
      //           dropdownMatchSelectWidth={false} placeholder="请选择">
      //           <Option key={-1} value={-1}>请选择</Option>
      //           {FormData['3']&&FormData['3'].map((t,i)=>{
      //             return <Option key={i} value={t.id}>{t.templateName}</Option>
      //           })}
      //         </Select>
            
      //   }
      // },
      {
        title: '组织/部门数据',
        dataIndex: 'orgdataEnableStatus',
        key: 'orgdataEnableStatus',
        width:120,
        render: (item,row,index) => {
          const { form, isView } = self.props;
          const {getFieldDecorator} = form;
          
          return <Switch disabled={isView}  checkedChildren="开"
                  onChange={(value)=>{
                    this.changeTableData(index,'orgdataEnableStatus',value?1:0);
                  }}
                  unCheckedChildren="关" defaultChecked={item==1}  />
           
        },
      },
      {
        title: '子节点数据',
        dataIndex: 'subNode',
        key: 'subNode',
        width:120,
        render:(item,row,index)=>{
          const {tableData} = this.state;
          const { userMange, form, isView } = self.props;
          // let len = 0,d=[];
          const {
            FormData
          } = userMange;
          let select = tableData[index]['orgCode'];
          // if(FormData['1']&&select){
          //   len = FormData['1'].childKey[select].length;
          //   d = FormData['1'].childKey[select];
          // }
          
          return  <DropdownTree 
                value={item||[]}
                len={row.orgCode?(FormData['1'].childKey[row.orgCode]?FormData['1'].childKey[row.orgCode].length:0):0} 
                titleKey={'orgName'}
                rowKey={'orgCode'}
                onConfirm={(value)=>{
                  this.changeTableData(index,'subNode',value);
                }}
                checkStrictly={true}
                disabled={isView}
                data={FormData['1']?(select?[FormData['1'].map[select]]:[]):[]} />
            
         
        }
      },
      {
        title: '状态',
        dataIndex: 'enableStatus',
        key: 'enableStatus',
        width:80,
        render: (item,row,index) => {
          const { form, isView } = self.props;
          const {getFieldDecorator} = form;
          if(item == 1 || item == 0){
            return <Switch  disabled={isView}
                    onChange={(value)=>{
                      this.changeTableData(index,'enableStatus',value?1:0);
                    }}          
                    checkedChildren="开" unCheckedChildren="关" defaultChecked={item==1}  />
          }else{
            return item == 20 ? '创建中' : '创建失败'
          }
           
        },
      },
      {
        title: '操作',
        key: 'operation',
        width:80,
        // fixed: 'right',
        render: (item,row,index) => {
          let {isView} = self.props;
          return (<Popconfirm placement="left" title="是否删除该岗位?" onConfirm={()=>{
              if(row.id){
                this.props.dispatch({
                  type:'userManage/modal/fetchDelInfo',
                  payload:row.id,
                  callback:()=>{
                    self.updateItem('del',index)
                  }
                })
              }else{
                self.updateItem('del',index)
              }
              
            }}>
            <a style={{ marginRight: '10px' }} disabled={isView} href="javascript:void(0);">删除</a>
          </Popconfirm>);
        },
      }],
    }
  }
  componentWillMount() {

    // this.props.dispatch({
    //   type: 'userManage/modal/fetchTreeData',
    // });
  }
  componentWillReceiveProps(nextProps){
    const { userManageModal } = nextProps;
    const {
      formData,
    } = userManageModal;
    if(nextProps.id){
      this.setState({
        tableData:nextProps.data.smPostInfoVO
      })
    }else{

      this.setState({
        tableData:formData.stationData
      })
    }
  }
  changeTableData(index,text,item){
    let {tableData} = this.state;
    let data = tableData[index] ;
    if(Object.prototype.toString.call(text)=='[object Array]'){
      text.map((i,n)=>{
        data[i] = item[n]
      })
    }else{
      data[text] = item
    }
    tableData[index] = data;
    this.setState({
      tableData
    })
  }
  /**
   * 递归渲染树状节点
   * @param {} data 
   */
  renderTreeNodes (data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.orgName} key={item.orgCode} value={item.orgCode+''}  dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.orgName} key={item.orgCode} value={item.orgCode+''} />;
    });
  }
  handleModal(param,type){
    if(type == "submit"){
      let {controlType,id} = this.props;
      this.props.form.validateFields((err, values) => {
        if (!err) {
          let data = {},
              num = 0;
          data['smUserInfo'] =  values.userData;
          if(controlType == 'edit'){
            data['smUserInfo'][0].id = id;
            if(data['smUserInfo'].userPsw=='******'){
              delete data['smUserInfo'].userPsw 
            }
          }
          data['smPostInfo'] = this.state.tableData.map(item=>{
            delete item.key;
            // if(item.id){
            //   delete item.id;
            //   delete item.updateUser;
            //   delete item.userId;
            // }
            if(!item.postName){
              num = '岗位名称不能为空'
            }else if(item.postName.length>20){
              num = '岗位名称不得超过20个字符!'
            }else{
              const { userMange } = this.props
              const { FormData } = userMange
              let postData = FormData['5'].find(v => item.postName === v.roleName)
              item.operTemplateId = postData.operTemplateId
              item.rowTemplateId = postData.rowTemplateId
              item.columnTemplateId = postData.columnTemplateId
              item.roleId = postData.id
            }
            
            return item
          });
          if(num){
            notification.open({
              message: '提示',
              description: num,
              icon:  <Icon type="exclamation-circle" style={{ color: 'red' }} />,
            });
            return false
          }
          if(data['smPostInfo'].length == 0){
            notification.open({
              message: '提示',
              description: '岗位不能为空',
              icon:  <Icon type="exclamation-circle" style={{ color: 'red' }} />,
            });
            return false
          }
          
          this.props.dispatch({
            type:'userManage/fetchSaveUser',
            payload:data,
            callback:()=>{
              this.props.form.resetFields()
              this.props.dispatch({
                type: 'userManage/modal/resetFormData',
              });
            }
          })
        }
      });
    }else{
      this.props.dispatch({
        type: 'userManage/modal/resetFormData',
      });
      this.props.dispatch({
        type: 'userManage/handleCloseModal',
      });
      this.props.form.resetFields()
    }
    
    
  }
  updateUserData=(type,index)=>{
    
    let userData = this.props.form.getFieldValue('userData')||[];
    if(type == 'add' ){
      userData.push({
        userName : "",
        name : "", 
        email : '', 
        phone : "", 
        password : "", 
        confirmWord : ""
      })
      
    } else if(type == 'del'){
      if(userData.length==1){
        notification.open({
          message: '提示',
          description: '至少添加一个用户',
          icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
        });
      }else{
        userData.splice(index,1)
        this.props.form.setFieldsValue({userData});
      }
    }
    this.props.dispatch({
        type: 'userManage/modal/updateUserData',
        payload: userData,
      });
  }
  updateItem(type,index){
    let {tableData} = this.state;
    if(type == 'add' ){
      tableData.push({
        postName:undefined,//岗位名称
        operTemplateId:"",//功能权限
        orgCode:"",//组织名称
        columnTemplateId:"",
        rowTemplateId:"",
        orgdataEnableStatus:1,
        enableStatus:20,
        subNode:[]
      })
      
    } else if(type == 'del'){
      tableData.splice(index,1)
    }
    this.setState({
      tableData
    })
  }
  render() {
    
    const { tableData,columns} = this.state;
    const self = this;
    const { form,visible,userManageModal,isView,userMange,id,data,controlType,Global} = this.props;
    const { getFieldDecorator, getFieldValue } = form;
   
    let {
      formData,
      TreeData,
      treeMap
    } = userManageModal;
    let{
      global
    } = Global
    if(id){
      formData.userData = [data.smUserInfoVO];
    }

    return (
      <div className={`${styles.userModal}`} style={{display:visible?'block':'none'}}>
        <Spin spinning={global}>
        <Form
          className="ant-advanced-search-form"
          onSubmit={this.handleSearch}
        >
          <h2>基本信息</h2>
          <div className={styles.userCon}>
            <div className={styles.userForm}>
              {formData&&formData.userData.map((item,index)=>{
                return <Basic isView={isView} form={form} key={index} controlType={controlType} delCallback={this.updateUserData} data={item} index={index} />
              })}
              
            </div>
          </div>
          {isView?null:(controlType=='edit'?null:<div className={styles.userCon} style={{ overflow: 'hidden', margin: '20px 0' }}>
              <Button onClick={()=>{this.updateUserData('add')}}  type="primary" style={{ fontSize:'12px' }}>新增用户</Button>
          </div>)}
          <h2>岗位分配</h2>
          {isView?null:<div className={styles.userCon} style={{ overflow: 'hidden', margin: '20px 0' }}>
              <Button  type="primary" onClick={()=>{this.updateItem('add')}} style={{ fontSize:'12px' }}>新增岗位</Button>
          </div>}
          <div className={styles.userCon}>
            <Table
              columns={columns}
              dataSource={tableData}
              loading={false}
              rowKey={(recode)=>{return uuidV4()}}
              scroll={{ x: 1000 }}
            />
            
          </div>
          <div className={styles.userCon} style={{ overflow: 'hidden', padding: '30px 24px' }}>
              {
                isView?null:<Button  type="primary" style={{ fontSize:'12px' }} onClick={() => { this.handleModal({}, 'submit'); }}>确定</Button>
              }
              <Button style={{ fontSize:'12px',marginLeft:'10px' }} onClick={() => { this.handleModal({}, 'close'); }}>取消</Button>
          </div>
        </Form>
        </Spin>
      </div>
    );
  }
}

export default UserModal