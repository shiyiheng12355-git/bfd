import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Radio, Form, Spin } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import User from './User';


import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item

// @Form.create()
class Group extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingVisible: true,
      entityId: 1,
      auth: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'xtgl_qzpz' },
      callback: (data) => {
        this.state.auth = data || [];
        console.log('群组管理配置权限-----------------', data);
        dispatch({
          type: 'sysconfig/group/getEntityList',
          payload: {
            callback: (entityList) => {
              const entityId = entityList[0].id;
              dispatch({
                type: 'tagPicker/getTagNameList',
                payload: { entityId },
              }).then(() => {
                dispatch({
                  type: 'sysconfig/group/fetchInitData',
                  payload: {
                    entityId,
                    callback: () => {
                      this.setState({
                        entityId,
                        loadingVisible: false,
                      })
                    },
                  },
                })
              })
            },
          },
        })
      },
    })
  }


  handleEntityChange = (e) => {
    const entityId = e.target.value;

    const { dispatch } = this.props;
    this.setState({
      loadingVisible: true,
    })

    dispatch({
      type: 'tagPicker/getTagNameList',
      payload: { entityId },
    }).then(() => {
      dispatch({
        type: 'sysconfig/group/fetchInitData',
        payload: {
          entityId,
          callback: () => {
            this.setState({
              entityId,
              loadingVisible: false,
            })
          },
        },
      })
    })
  }

  handleGroupInfoCommit = (smGroupManagementInfo) => {
    const { dispatch } = this.props;
    smGroupManagementInfo.entityId = this.state.entityId;
    dispatch({
      type: 'sysconfig/group/saveGroupInfo',
      payload: {
        smGroupManagementInfo,
      },
    })
  }


  render() {
    let { tagNameList } = this.props.tagTree;
    const { entityList, idPullList, idAndPropertyList, groupInfo } = this.props.groupConfig;
    const { auth } = this.state;

    const userProps = {
      tagNameList,
      idPullList,
      idAndPropertyList,
      groupInfo,
      auth,
      handleGroupInfoCommit: this.handleGroupInfoCommit,
    }
    return (
      <div className={styles.group}>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '系统管理' }, { title: '群组管理配置' }]} />
        <div className={styles.content}>
          <RadioGroup
            defaultValue={entityList.length ? entityList[0].id : 1}
            style={{ marginBottom: 20 }}
            onChange={this.handleEntityChange}
          >
            {
              entityList.map((item, index) => {
                return <RadioButton key={`entity_${index}`} style={{ fontSize: 13 }} value={item.id}>{item.entityName}</RadioButton>
              })
            }
          </RadioGroup>

          {
            this.state.loadingVisible === false ? <User {...userProps} /> : <div className={styles.spin}><Spin size="large" /></div>
          }

        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    groupConfig: state['sysconfig/group'],
    tagTree: state.tagPicker,
  };
}

export default connect(mapStateToProps)(Group);

