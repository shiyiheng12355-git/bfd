import React, { Component } from 'react';
import { Modal, Button, message, Form, Input, Tag, Select, Spin, Checkbox, Row, Col, Upload, Icon } from 'antd';
import Q from 'bluebird';
import styles from './GroupImportAdd.less';
import { webAPICfg } from '../../utils';
import { downloadFailed } from '../../services/api'
import ImportFileList from './ImportFileList'

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
class GroupImportAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: 0,
      fileList: [],
      fileIdList: [],
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.addImportGroupModalVisible !== nextProps.addImportGroupModalVisible && nextProps.addImportGroupModalVisible) {
      this.setState({
        fileList: [],
      }, () => {
        // console.log('重置fileList----------------', this.state.fileList);
      })
    }
  }


  handleSaveImportGroupOk = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!this.state.fileList.length) {
          message.error('请上传文件');
          return false;
        }
        const { groupDesc, groupName, isAddReport, groupCategoryId, groupCategory } = values;
        const bizGroupInfo = {
          groupDesc,
          groupName,
          groupCategoryId,
          conditionJson: '',
          conditonDesc: '',
          isAddReport: isAddReport ? 1 : 0,
        }
        if (groupCategory) {
          bizGroupInfo.groupCategory = groupCategory;
        }
        this.props.handleSaveImportGroupOk(bizGroupInfo, () => {
          this.props.form.resetFields();
          this.setState({
            selectValue: 0,
            fileList: [],
          })
        });
      }
    });
  }


  handleSelectChange = (selectValue) => {
    this.setState({
      selectValue,
    });
  }


  handleGroupAddModalCancel = () => {
    this.props.form.resetFields();
    this.setState({
      selectValue: 0,
      fileList: [],
    })

    this.props.handleGroupAddModalCancel();
  }

  handleCheckFile = (file, fileList) => {
    const excelReg = /\.xl(s|sx)$/;
    const { fileNameList } = this.props;

    if (!excelReg.test(file.name)) {
      message.info(`${file.name} 格式错误,请上传excel文件!`);
      return false;
    } else if (file.size > 10 * 1024 * 1024) {
      message.info(`${file.name} 超过10M!`);
      return false;
    } else if (fileNameList.includes(file.name)) {
      message.info(`${file.name} 已存在,请勿重复上传!`);
      return false;
    } else {
      return true;
    }
  }


  handleUploadFileChange = (info) => {
    const { fileList } = info;
    // console.log('fileList-----',fileList)
    this.setState({
      fileList,
    })
    if (this.handleCheckFile) {
      this.props.handleUploadFileChange(info, (ok, fileNameList, fileIdList) => {
        // let arr = fileList.filter(item => fileNameList.includes(item.name));
        // arr = arr.map((item) => {
        //   return {
        //     name: item.name,
        //     status: 'done',
        //   }
        // })
        this.setState({
          fileList: fileList.filter(item => fileNameList.includes(item.name)),
          fileIdList: fileIdList ? fileIdList : []
          // fileList: arr,
        })
      });
    }
  }

  handleDeleteFile = (item) => {
    this.props.handleDeleteFile(item, (fileNameList) => {
      const { fileList } = this.state;
      this.setState({
        fileList: fileList.filter(file => fileNameList.includes(file.name)),
      })
    })
  }

  downloadFailed = () => {
    let params = {
      fileNameList: this.props.fileNameList.join(','),
      fileIdList: this.state.fileIdList.join(','),
      entityId: this.props.entityId
    }

    // console.log('申请下载失败名单参数-----',params)
    downloadFailed(params).then(res => {
      if(res.success){
        message.success('申请下载成功，可前往个人中心-下载文件列表进行文件下载')
      }else {
        message.error('申请下载失败')
      }
    }) 
  }

  openFileLis = () => {
    this.setState({ visible: true })
  }

  handleOk = (selectedRows) => {
    this.setState({ 
      visible: false, 
      fileList: selectedRows.map(item => item.fileName),
      fileIdList: selectedRows.map(v => v.fileUrl.split('/')[2]),
    })
    this.props.handleOk(selectedRows)
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let {
      entityName, groupCategory, matchCount, matchCountLoading, fileResolveLoaidng,
      addImportGroupModalVisible, fileNameList, entityId, entityCategory,
    } = this.props;

    let variedName = entityCategory === 0 ? '人' : '产品';

    const ImportFileListProps = {
      entityId,
      visible: this.state.visible,
      handleClose: () => { this.setState({ visible: false }) },
      handleOk: this.handleOk,
      handleUploadFileChange: this.props.handleUploadFileChange,
    }
    // console.log('this.state.fileList----------------------render----------------->>>>>>>>>>>>>>', this.state.fileList);
    // console.log('this.props.fileNameList----------------------render----------------->>>>>>>>>>>>>>', fileNameList);

    return (
      <Modal
        title={`导入${entityName}群`}
        width="700px"
        maskClosable={false}
        style={{ top: 50 }}
        bodyStyle={{ padding: 10 }}
        visible={addImportGroupModalVisible}
        onOk={this.handleSaveImportGroupOk}
        onCancel={this.handleGroupAddModalCancel}
      >
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 10 }}
          style={{ marginBottom: 8 }}
          label={`${entityName}群名称`}
        >
          {getFieldDecorator('groupName', {
            initialValue: '',
            rules: [
              { required: true, message: `${entityName}群名不能为空` },
              { max: 15, message: '15个字符以内' },
              {
                validator: (rule, value, callback) => {
                  if (value.indexOf(' ') !== -1) {
                    callback('不能输入空格');
                    return false;
                  }
                  const patrn = /[`~!@#$%^&*\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*\+={}|？：“”、；‘’，。、]/im;
                  if(patrn.test(value)) {
                    callback('不能输入特殊字符');
                    return false;
                  }
                  callback();
                },
              },
            ],
          })(
            <Input placeholder="15个字符以内" />
            )}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 10 }}
          style={{ marginBottom: 8 }}
          label={`${entityName}群描述`}
        >
          {getFieldDecorator('groupDesc', {
            initialValue: '',
            rules: [
              { max: 100, message: '50个字符以内' },
              {
                validator: (rule, value, callback) => {
                  if (value.indexOf(' ') !== -1) {
                    callback('不能输入空格');
                    return false;
                  }
                  callback();
                },
              },
            ],
          })(
            <TextArea placeholder="50个字符以内" />
            )}
        </FormItem>


        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          required
          style={{ marginBottom: 8 }}
          label={`${entityName}群分类`}
        >
          <Col span={6} >
            <FormItem>
              {getFieldDecorator('groupCategoryId', {
                initialValue: this.state.selectValue,
                rules: [
                  { required: true, message: '请选择分类' },
                ],
              })(
                <Select
                  style={{ width: 200 }}
                  onChange={this.handleSelectChange}
                >
                  <Option key="-1" value={0}>新增分类</Option>
                  {
                    groupCategory.map((item, index) => {
                      return <Option key={item.id} value={item.id}>{item.categoryName}</Option>;
                    })
                  }
                </Select>
                )}
            </FormItem>
          </Col>
          <Col span={10} offset={6}>
            {
              this.state.selectValue === 0
                ? <FormItem>
                  {
                    getFieldDecorator('groupCategory', {
                      initialValue: '',
                      rules: [
                        { required: true, message: '新增分类不能为空' },
                        { max: 30, message: '10个字符以内' },
                        {
                          validator: (rule, value, callback) => {
                            if (value.indexOf(' ') !== -1) {
                              callback('不能输入空格');
                              return false;
                            }
                            callback();
                          },
                        },
                      ],
                    })(<Input placeholder="10个字符以内" />)
                  }
                </FormItem>
                : ''
            }
          </Col>
        </FormItem>

        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 10 }}
          style={{ marginBottom: 8,display:"none" }}
          label="其它"
        >
          {getFieldDecorator('isAddReport', {
            valuePropName: 'checked',
            initialValue: false,
          })(
            <Checkbox style={{ fontSize: '12px' }}>添加到全局查看</Checkbox>
            )}
        </FormItem>

        <Col
          offset={2}
          style={{ background: '#EEE', padding: 15 }}
        >
          <FormItem
            className={styles.upload}
            style={{ marginBottom: 0 }}
          >
            <Row style={{textAlign: 'center'}}>
              <Button type="primary" onClick={this.openFileLis}>
                <Icon type="upload" /> 选择导入文件
              </Button>

                <a style={{ margin: '0 10px' }} href={`${webAPICfg.basePath}/bizGroup/${entityId}/downloadTemplate`}>
                  <Button type="primary" icon="download">模板下载</Button>
                </a>


              （说明：单个文件需小于10M）
              {/* <Col span={10} style={{ textAlign: 'right' }}>
                <Upload
                  // multiple
                  withCredentials
                  action={`${webAPICfg.basePath}/file/upload`}
                  beforeUpload={this.handleCheckFile}
                  onChange={this.handleUploadFileChange}
                  fileList={this.state.fileList}
                >
                  <Button type="primary">
                    <Icon type="upload" /> 选择导入文件
                   </Button>
                </Upload>
              </Col> */}
            </Row>

            <div style={{ fontSize: '14px' }}>
              <div>
                <span>已导入文件：</span>
                {
                  (() => {
                    return fileNameList.map((item) => {
                      return (
                        <span key={item} type='primary' style={{ margin: '0 5px' }}>
                          {item}
                          <Icon
                            type="close-circle-o"
                            style={{ marginLeft: 5, fontSize: 12, cursor: 'pointer' }}
                            onClick={this.handleDeleteFile.bind(this, item)}
                          />
                        </span>
                      )
                    })
                  })()
                }
              </div>
              <div>
                {
                  fileNameList.length
                    ? <span>{`匹配成功${variedName}数`}：{matchCountLoading ? <Spin size='small' /> : matchCount.match_success}</span>
                    : <span>{`匹配成功${variedName}数`}：</span>
                }
              </div>
              <div>
                {
                  fileNameList.length ? 
                    <span>
                      { `匹配失败${variedName}数` }：
                      { matchCountLoading ? <Spin size='small' /> : matchCount.match_failed }
                      { 
                        (!matchCountLoading) &&  matchCount.match_failed > 0 ? 
                          <Button type="primary" style={{ float: 'right' }} onClick={this.downloadFailed}>申请下载</Button> : ''
                      }
                    </span>
                    : <span>{`匹配失败${variedName}数`}：</span>
                }
              </div>
              <div>
                {
                  fileNameList.length
                    ? <span>{`匹配重复${variedName}数`}：{matchCountLoading ? <Spin size='small' /> : matchCount.match_repeat}</span>
                    : <span>{`匹配重复${variedName}数`}：</span>
                }
              </div>
            </div>
          </FormItem>

        </Col>

        <ImportFileList {...ImportFileListProps}/>
      </Modal>

    );
  }
}


export default Form.create()(GroupImportAdd);

// let arr = [];
        // debugger;
        // for (let i = 0; i < fileList.length; i++) {
        //   let out = fileList[i];
        //   for (let k = 0; k < fileNameList.length; k++) {
        //     let inner = fileNameList[k];
        //     if (out.name === inner.name) {
        //       arr.push(inner);
        //     }
        //   }
        // }