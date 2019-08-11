import React, { Component } from 'react';
import { connect } from 'dva';
import { Spin, message, Alert, notification } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import GroupChannel from './GroupChannel';
import GroupHeader from './GroupHeader';
import GroupContent from './GroupContent';
import GroupAdd from './GroupAdd';
import GroupImportAdd from './GroupImportAdd';

import styles from './EntityGroup.less';


class EntityGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      systemAndImprotAuth: [], // 内置和外导群权限
      systemCreAndProAuth: [], // 内置群 创建群和查看群详情权限
      importCreAndProAuth: [], // 外导群 导入群和查看群详情权限
      entityId: 1,
      entityCategory: 0, // 0 用户实体类 非0 非用户实体类
      entityName: '',
      current: 1, // 当前页码
      searchName: '', // 用户群名称搜索值  点击搜索的时候用
      inputValue: '', // 用户群名称搜索值  受控 控制input框的显示内容用
      groupCategoryId: 0, // 根据群组分类进行搜索
      handleType: '1', // 1:新增 2:编辑
      groupChannel: '1', // 1:系统内 2:外接
      curGroupInfo: {}, // 当前要编辑的用户群
      addGroupModalVisible: false,
      addImportGroupModalVisible: false,
      addConditionVisible: false, // 已经选择的条件是否展示
      modalInsideVisible: false, // 系统内 新增/编辑 Modal true=>显示 false=>隐藏
      modalImportVisible: false, // 外接内 新增/编辑 Modal true=>显示 false=>隐藏
      fileNameList: [], // 已经上传的文件名列表
      fileResponseList: [], // 上传文件成功后的相应列表(带id) 删除时候用
    };
  }

  componentDidMount() {
    const entityId = Number(this.props.match.params.id);
    const { dispatch } = this.props;
    this.initAuth(dispatch, entityId);
    this.initData(dispatch, entityId);
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const currentId = this.props.match.params.id;
    const nextId = nextProps.match.params.id;
    if (currentId !== nextId) {
      this.state.groupChannel = '1';
      this.initAuth(dispatch, Number(nextId));
      this.initData(dispatch, Number(nextId));
    }
  }


  initAuth=(dispatch, entityId) => {
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: `qzgl_xqzgl_${entityId}` },
      callback: (data) => {
        this.state.systemAndImprotAuth = data || [];
        if (data.length === 1 && data[0] === `qzgl_xqzgl_nzq_${entityId}`) { // 只有内置群的权限
          this.state.groupChannel = '1';
          dispatch({
            type: 'user/fetchAuths',
            payload: { parentKey: `qzgl_xqzgl_nzq_${entityId}` },
            callback: (data1) => {
              this.state.systemCreAndProAuth = data1 || [];
            },
          })
        } else if (data.length === 1 && data[0] === `qzgl_xqzgl_wdq_${entityId}`) { // 只有外导群的权限
          this.state.groupChannel = '2';
          dispatch({
            type: 'user/fetchAuths',
            payload: { parentKey: `qzgl_xqzgl_wdq_${entityId}` },
            callback: (data2) => {
              this.state.importCreAndProAuth = data2 || [];
            },
          })
        } else if (data.length <= 0 || !data) { // 既没有内置群的权限也没有外导群的权限,给this.state.groupChannel随便赋个值(除了1和2)
          this.state.groupChannel = '3';
        } else { // 既有内置群的权限 又有外导群的权限
          dispatch({
            type: 'user/fetchAuths',
            payload: { parentKey: `qzgl_xqzgl_nzq_${entityId}` },
            callback: (data1) => {
              this.state.systemCreAndProAuth = data1 || [];
            },
          })

          dispatch({
            type: 'user/fetchAuths',
            payload: { parentKey: `qzgl_xqzgl_wdq_${entityId}` },
            callback: (data2) => {
              this.state.importCreAndProAuth = data2 || [];
            },
          })
        }
      },
    })
  }


  initData = (dispatch, entityId) => {
    dispatch({
      type: 'entity/group/getEntityList',
      payload: {
        callback: (entityList) => {
          for (let i = 0; i < entityList.length; i++) {
            let current = entityList[i];
            if (current.id === entityId) {
              this.setState({
                entityId,
                current: 1,
                entityName: current.entityName,
                entityCategory: current.entityCategory,
              })
              dispatch({
                type: 'entity/group/getGroupList',
                payload: {
                  entityId,
                  callback: () => {
                    const {groupCategoryId,searchName} = this.state;
                    this.getQueryNumber(1,groupCategoryId,searchName);
                  },
                },
              })
              dispatch({
                type: 'entity/group/getGroupCategory',
                payload: { entityId },
              });
              break;
            }
          }
        },
      },
    });
  }
  getQueryNumber = (current,groupCategoryId,searchName)=>{
    const entityId = Number(this.props.match.params.id);
    const { groupList } = this.props.entityGroup;
    let groupSearch = groupList;
    // console.log('搜索',groupCategoryId,searchName)
    if (groupCategoryId !== 0) {
      groupSearch = groupSearch.filter(item => item.groupCategoryId === groupCategoryId);
    }

    
    if(searchName){
      groupSearch = groupSearch.filter(item => item.groupName.indexOf(searchName||"") >= 0);
    }
    
    //修复默认加载8个用户群
    const ids = groupSearch.map(item => item.id).slice((current - 1) * 4, current * 8);
    //bak原版
    //const ids = groupSearch.map(item => item.id).slice((current - 1) * 4, current * 4);
    // console.log('ids',groupSearch)
    this.props.dispatch({
      type: 'entity/group/queryNumber',
      payload: {
        ids,
        entityId,
      },
    })
  }

  handlegroupNameSearch = (searchName) => {
    const {current,groupCategoryId} = this.state;
    this.setState({
      current: 1,
      searchName,
    })
    this.getQueryNumber(current,groupCategoryId,searchName);
  }

  handlegroupNameChange = (value) => {
    this.setState({
      inputValue: value,
    })
    if (value === '') {
      this.handlegroupNameSearch(value);
    }
  }

  handlegroupCategoryIdChange = (groupCategoryId) => {
    this.setState({
      groupCategoryId,
      current: 1,
      searchName: '',
      inputValue: '',
    })
    this.getQueryNumber(1,groupCategoryId,"");
  }


  handleGroupSave = (bizGroupInfo, callback) => {
    const { dispatch } = this.props;
    const { entityId } = this.state;
    bizGroupInfo.entityId = entityId;
    dispatch({
      type: 'entity/group/checkNameIsRepeat',
      payload: {
        entityId,
        groupName: bizGroupInfo.groupName,
        callback: (groupNameIsRepeat) => {
          if (!groupNameIsRepeat) {
            dispatch({
              type: 'entity/group/saveCommonGroup',
              payload: {
                bizGroupInfo,
                callback: (response) => {
                  if (response && response.success) {
                    message.success('创建群组成功');
                    this.setState({
                      current: 1,
                      searchName: '',
                      inputValue: '',
                      groupCategoryId: 0,
                    })
                    const { groupList } = this.props.entityGroup;
                    const ids = groupList.map(item => item.id);
                    dispatch({
                      type: 'entity/group/queryNumber',
                      payload: {
                        ids,
                        entityId,
                      },
                    })
                    if (callback) callback(response.success);
                  } else {
                    const msg = response.errorMsg || response.resultBody || '创建群组失败'
                    message.error(msg);
                  }
                  
                },
              },
            })
          } else {
            message.error('群组名已存在,请重新命名!');
            return false;
          }
        },
      },
    })
  }


  handleGroupEdit = (bizGroupInfo, callback) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'entity/group/updateGroup',
      payload: {
        bizGroupInfo,
        entityId: this.state.entityId,
        callback: (success) => {
          if (success) {
            message.success('修改群组成功');
            dispatch({
              type: 'entity/group/getGroupCategory',
              payload: {
                entityId: this.state.entityId,
                callback: () => {
                  if (callback) callback(success);
                },
              },
            })
          } else {
            message.error('修改群组失败');
          }
        },
      },
    });
  }

  handleGroupCopy = (bizGroupInfo) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'entity/group/updateGroup',
      payload: {
        bizGroupInfo,
        entityId: this.state.entityId,
      },
    });
  }


  handleGroupDelete = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'entity/group/deleteGroup',
      payload: {
        id,
        entityId: this.state.entityId,
        callback: (success, errorMsg) => {
          if (success) {
            message.success('删除群组成功');
            this.setState({
              current: 1,
            })
            dispatch({
              type: 'entity/group/getGroupCategory',
              payload: {
                entityId: this.state.entityId,
                callback: () => {

                },
              },
            })
          } else {
            message.error(errorMsg);
          }
        },
      },
    });
  }


  handlePaginationChange = (current) => {
    this.setState({
      current,
    })
    const {groupCategoryId,searchName} = this.state;
    this.getQueryNumber(current,groupCategoryId,searchName);
  }


  handleAddOrEditShow = (type, item) => { // type 1新增 2 编辑 string
    let { modalInsideVisible, modalImportVisible } = this.state;
    if (this.state.groupChannel === '1') { // 系统内
      modalInsideVisible = true;
    } else { // 2 外接
      modalImportVisible = true;
    }
    this.setState({
      handleType: type,
      modalInsideVisible,
      modalImportVisible,
      curGroupInfo: item || {},
    });
  }


  handleGroupModalCancel = () => {
    let { modalInsideVisible, modalImportVisible } = this.state;
    if (this.state.groupChannel === '1') { // 系统内
      modalInsideVisible = false;
    } else { // 2 外接
      modalImportVisible = false;
    }
    this.setState({
      modalInsideVisible,
      modalImportVisible,
      handleType: '1',
    });
  }

  handleGroupChannelChange = (value) => { // value=> 1:系统内 2:外接
    this.setState({
      searchName: '',
      inputValue: '',
      current: 1,
      groupCategoryId: 0,
      groupChannel: value,
    })
  }


  handleGroupAddModalShow = () => {
    if (this.state.groupChannel === '1') { // 系统内用户群
      this.setState({
        addGroupModalVisible: true,
      })
    } else { // 外导用户群
      this.setState({
        addImportGroupModalVisible: true,
      })
    }
  }

  handleGroupAddModalCancel = (callback) => {
    if (this.state.groupChannel === '1') { // 系统内用户群
      this.setState({
        addGroupModalVisible: false,
      })
    } else { // 外导用户群
      this.setState({
        addImportGroupModalVisible: false,
        fileNameList: [],
        fileResponseList: [],
      })
    }
    if (callback) callback();
  }


  handleUploadFileChange = (info, callback) => {
    const { file, fileList } = info;
    const { dispatch } = this.props;
    const { entityId } = this.state;
    let [fileNameList, fileResponseList, fileIdList] = [[], [], []];

    if (file.status === 'done') {
      let fileUrlList = fileList[fileList.length - 1].response
      if(fileUrlList && typeof fileUrlList === 'string'){
        notification.success({ message: '申请上传成功！', description: '等待上传完成后即可进行导入，可点击刷新列表按钮刷新状态' })
      }else{
        notification.error({ message: '申请上传失败！' })
        return
      }
      dispatch({ // 文件解析
        type: 'entity/group/saveDateGroupInput',
        payload: {
          entityId,
          fileUrlList,
          callback: (res) => {
            if(res && !res.success){ //解析失败
              notification.error({ message: res.errorMsg || '解析上传文件失败，请确认文件格式是否正确！' })
            }
            callback()
            // if (success) { // 文件解析成功
            //   fileNameList = fileList.map(item => item.name);

            //   fileResponseList = fileList.map(item => item.response);
            //   fileResponseList.forEach((item) => {
            //     if (item) {
            //       fileIdList.push(item.split('/')[2]);
            //     }
            //   })

              // dispatch({ // 获取匹配数
              //   type: 'entity/group/getMatchCount',
              //   payload: {
              //     entityId,
              //     fileIdList: fileIdList.join(','),
              //     callback: (ok) => {
              //       if (callback) callback(ok, fileNameList, fileIdList);
              //     },
              //   },
              // })
            // } else { // 文件解析失败
            //   message.error(`${fileList[fileList.length - 1].name} 解析失败`);
            //   fileNameList = this.state.fileNameList;
            //   fileResponseList = this.state.fileResponseList;
            //   if (callback) callback(false, fileNameList);
            // }

            // this.setState({
            //   fileNameList,
            //   fileResponseList,
            // })
          },
        },
      })
    }
  }

  handleOk = (selectedRows) => {
    const { entityId } = this.state
    let fileNameList = selectedRows.map(item => item.fileName)
    let fileResponseList = selectedRows.map(v => v.fileUrl)
    let fileIdList = selectedRows.map(v => v.fileUrl.split('/')[2])
    
    this.props.dispatch({ // 获取匹配数
      type: 'entity/group/getMatchCount',
      payload: {
        entityId,
        fileIdList: fileIdList.join(','),
      },
    })
    this.setState({ fileNameList, fileResponseList })
  }

  handleDeleteFile = (fileName, callback) => {
    const { dispatch } = this.props;
    const { fileNameList = [], fileResponseList = [], entityId } = this.state;
    let arr = [];
    // console.log('fileName-----',fileName)
    // console.log('fileNameList-----',fileNameList)
    // console.log('fileResponseList-----',fileResponseList)
    const fileUrl = fileResponseList.find((item) => {
      return item.includes(fileName);
    })
    const id = fileUrl.split('/')[2];
    fileResponseList.forEach((item) => {
      if (item) {
        arr.push(item.split('/')[2]);
      }
    })
    const fileIdList = arr.filter((fileId) => {
      return fileId !== id;
    })


    dispatch({
      type: 'entity/group/deleteFile',
      payload: {
        id,
        fileName,
        entityId,
        fileIdList: fileIdList.join(','),
        callback: (success) => {
          if (success) {
            message.success('删除成功!');
            this.setState({
              fileNameList: fileNameList.filter(item => item !== fileName),
              fileResponseList: fileResponseList.filter(item => !item.includes(fileName)),
            }, () => {
              if (callback) callback(this.state.fileNameList);
            })
          } else {
            message.success('删除失败!');
          }
        },
      },
    })
  }

  handleSaveImportGroupOk = (bizGroupInfo, callback) => {
    const { dispatch } = this.props;
    const { fileResponseList = [], entityId } = this.state;

    const fileIdList = fileResponseList.map((item) => {
      return item.split('/')[2];
    });
    bizGroupInfo.entityId = this.state.entityId;

    dispatch({
      type: 'entity/group/checkNameIsRepeat',
      payload: {
        entityId,
        groupName: bizGroupInfo.groupName,
        callback: (groupNameIsRepeat) => {
          if (!groupNameIsRepeat) {
            dispatch({
              type: 'entity/group/saveImportGroup',
              payload: {
                bizGroupInfo,
                fileIdList: fileIdList.join(','),
                callback: (res) => {
                  if (res && res.success) {
                    message.success('外导群创建成功');
                    this.setState({
                      addImportGroupModalVisible: false,
                      groupChannel: '2',
                      current: 1,
                      fileNameList: [],
                      fileResponseList: [],
                    }, () => {
                      const { groupList } = this.props.entityGroup;
                      const ids = groupList.map(item => item.id);
                      dispatch({
                        type: 'entity/group/queryNumber',
                        payload: {
                          ids,
                          entityId,
                        },
                      })
                      if (callback)callback(res.success);
                    })
                  } else {
                    const msg = res && res.errorMsg || res.resultBody || '外导群创建失败'
                    message.error(msg);
                  }
                },
              },
            })
          } else {
            message.error('群组名已存在,请重新命名!');
            return false;
          }
        },
      },
    })
  }

  handleChangeConditionList = (conditionList, relationDesc) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tagPicker/changeConditionList',
      payload: {
        conditionList,
        outsideRelation: relationDesc === '且' ? 'and' : 'or',
      },
    })
  }

  handleResetConditionList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tagPicker/resetConditionList',
    })
  }


  render() {
    const {
      groupCategory, groupList, total,
      customerAndUserNum, matchCount,
    } = this.props.entityGroup;
    const { conditionList, outsideRelation } = this.props.tagPicker;
    const { effects } = this.props.loadings;
    const queryNumberLoading = effects['entity/group/queryNumber'];
    const matchCountLoading = effects['entity/group/getMatchCount'];
    const groupListLoading = effects['entity/group/getGroupList'];
    const fileResolveLoaidng = effects['entity/group/saveDateGroupInput']

    // console.log('entityGroup++++conditionList----------------', conditionList);

    const {
      entityId, groupChannel, addImportGroupModalVisible, systemAndImprotAuth,
      curGroupInfo, searchName, inputValue, addConditionVisible, handleType,
      groupCategoryId, addGroupModalVisible, fileNameList, systemCreAndProAuth,
      modalImportVisible, entityCategory, entityName, current, importCreAndProAuth,
     } = this.state;

    const { history, dispatch } = this.props;
    let [handleTypeName] = [''];
    if (handleType === '1') handleTypeName = '新增';
    if (handleType === '2') handleTypeName = '编辑';

    const channelProps = {
      entityId,
      groupChannel,
      entityName,
      systemAndImprotAuth,
      handleGroupChannelChange: this.handleGroupChannelChange,
    }
    const headerProps = {
      systemCreAndProAuth,
      importCreAndProAuth,
      entityId,
      entityName,
      inputValue,
      groupChannel,
      groupCategory,
      groupCategoryId,
      handleGroupAddModalShow: this.handleGroupAddModalShow,
      handlegroupNameSearch: this.handlegroupNameSearch,
      handlegroupNameChange: this.handlegroupNameChange,
      handlegroupCategoryIdChange: this.handlegroupCategoryIdChange,
    };


    const contentProps = {
      systemCreAndProAuth,
      importCreAndProAuth,
      entityId,
      entityCategory,
      groupList,
      total,
      current,
      entityName,
      handleTypeName,
      outsideRelation,
      searchName,
      groupCategoryId,
      groupChannel,
      groupCategory,
      customerAndUserNum,
      queryNumberLoading,
      history,
      dispatch,
      conditionList,
      handleGroupEdit: this.handleGroupEdit,
      handleAddOrEditShow: this.handleAddOrEditShow,
      handleGroupDelete: this.handleGroupDelete,
      handleGroupCopy: this.handleGroupCopy,
      handleChangeConditionList: this.handleChangeConditionList,
      handleGroupSave: this.handleGroupSave,
      handlePaginationChange: this.handlePaginationChange,
    };

    const addProps = {
      entityId,
      entityCategory,
      entityName,
      groupChannel,
      groupCategory,
      conditionList,
      outsideRelation,
      addGroupModalVisible,
      addConditionVisible,
      dispatch,
      handleGroupSave: this.handleGroupSave,
      handleGroupEdit: this.handleGroupEdit,
      handleGroupAddModalCancel: this.handleGroupAddModalCancel,
      handleResetConditionList: this.handleResetConditionList,
      handleChangeConditionList: this.handleChangeConditionList,
    };

    const importProps = {
      entityId,
      entityCategory,
      entityName,
      handleType,
      curGroupInfo,
      groupCategory,
      handleTypeName,
      fileNameList,
      matchCount,
      matchCountLoading,
      fileResolveLoaidng,
      modalImportVisible,
      addImportGroupModalVisible,
      dispatch,
      handleGroupSave: this.handleGroupSave,
      handleGroupEdit: this.handleGroupEdit,
      handleDownloadTemplate: this.handleDownloadTemplate,
      handleGroupAddModalCancel: this.handleGroupAddModalCancel,
      handleUploadFileChange: this.handleUploadFileChange,
      handleDeleteFile: this.handleDeleteFile,
      handleSaveImportGroupOk: this.handleSaveImportGroupOk,
      handleOk: this.handleOk,
    };

    return (
      <div className={styles.entityGroup}>
        <PageHeaderLayout
          breadcrumbList={
            [
              { href: '/', title: '首页' },
              { title: '群组管理' },
              { title: `${entityName}群组管理` },
            ]
          }
        />
        <div>
          <GroupChannel {...channelProps} />
          <GroupHeader {...headerProps} />
          {
            groupListLoading
              ? <div className={styles.loading}><Spin /></div>
              : <GroupContent {...contentProps} />
          }
        </div>
        {groupChannel === '1' && <GroupAdd {...addProps} />}
        {groupChannel === '2' && <GroupImportAdd {...importProps} />}
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    entityGroup: state['entity/group'],
    tagPicker: state.tagPicker, // 标签数据
    loadings: state.LOADING,
    user: state.user,
  };
}

export default connect(mapStateToProps)(EntityGroup);
