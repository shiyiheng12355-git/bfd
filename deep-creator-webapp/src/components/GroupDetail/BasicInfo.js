import React, { PureComponent } from 'react';
import { Tabs, Tag, Button, Modal, Form, Input, Checkbox, Spin } from 'antd';
import _ from 'lodash';
import CreateConditionCnHtml from '../../routes/Groups/CreateConditionCnHtml';


const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const CheckboxGroup = Checkbox.Group;


import styles from './basicInfo.less';


class BasicInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tabKey: '1',
      checkedValues: null, // 选择的已有自定义标签
      regularVisible: false,
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const hash = location.hash;
    const entityId = Number(hash.substring('2').split('/')[1]);
    const groupId = Number(hash.substring('2').split('/')[2]);

    // dispatch({ // 获取标签
    //   type: 'tagPicker/getTagNameList',
    //   payload: { entityId },
    // })


    dispatch({
      type: 'entity/group/getEntityList',
      payload: {},
    })

    dispatch({ // 获取用户群基本信息
      type: 'group/profile/getGroupBasic',
      payload: { entityId, groupId },
    })

    dispatch({ // 获取群组的用户数和客户数
      type: 'entity/group/queryNumber',
      payload: { entityId, ids: groupId },
    })

    dispatch({ // 获取当前群的定制化标签
      type: 'group/profile/getCustomerTag',
      payload: { groupId },
    })

    dispatch({ // 获取当前岗位的已有的定制化指标
      type: 'group/profile/getExistCusTag',
      payload: { entityId },
    })
  }


  handleModalVisible = (visible) => {
    this.props.form.resetFields();
    this.setState({
      visible,
    })
  }

  handleTableChange = (tabKey) => {
    this.setState({
      tabKey,
    })
  }

  handleModalOk = () => {
    let { checkedValues } = this.state;

    if (this.state.tabKey === '1') {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const { newTagName } = values;
          this.props.handleAddCusTag(newTagName, (success) => {
            if (success) {
              const { customerTag } = this.props;// 取到所有的自定义标签(最新的)
              checkedValues = customerTag.map(item => item.tag_english_value_title);// 新增成功后重新设置checkedValues,确保已存在自定义标签的值是勾选状态
              this.setState({
                visible: false,
                checkedValues,
              })
            }
          });
        }
      })
    } else {
      const { customerTag } = this.props; // 取到所有的自定义标签(这个可不是最新的)
      if (!checkedValues || customerTag.length === checkedValues.length) { // 确保在没有勾选的情况下不执行以下的操作
        return false;
      }

      const disabledExistList = customerTag.map(item => item.tag_english_value_title);
      let newAddValues = checkedValues.filter(item => !disabledExistList.includes(item));// 过滤掉已经被勾选的

      this.props.handleAddExistCusTag(newAddValues, (success) => {
        if (success) {
          this.setState({
            visible: false,
          })
        }
      });
    }
  }


  handlecheckboxChange = (checkedValues) => {
    this.setState({
      checkedValues,
    })
  }

  handleCusTagDel = (tagEnglishValueTitle, e) => {
    e.preventDefault();
    let { checkedValues } = this.state;
    this.props.handleCusTagDel(tagEnglishValueTitle, (success) => {
      if (success) {
        this.setState({
          checkedValues: checkedValues.filter(item => item !== tagEnglishValueTitle),
        })
      }
    })
  }

  handleMouseEnter = () => {
    this.setState({
      regularVisible: true,
    })
  }

  handleMouseLeave = () => {
    this.setState({
      regularVisible: false,
    })
  }

  timestampToTime(timestamp) {
    let  date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    let D = date.getDate() + ' ';
    let h = date.getHours() + ':';
    let m = date.getMinutes() + ':';
    let s = date.getSeconds();
    return Y+M+D+h+m+s;
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      basicInfo = {}, customerTag, existCusTag, entityList,
      customerAndUserNum, queryNumberLoading, tabKeys,
     } = this.props;
    const { regularVisible, checkedValues } = this.state;
    let { groupName, groupType, categoryName, groupDesc, entityId,createTime,  } = basicInfo;
    let entityCategory = null
    let basicInfoConditonDescLength = basicInfo && basicInfo.conditonDesc && basicInfo.conditonDesc.length; //用来判断图像显示的位置
    //假如是所有群或者特别关注群 不显示标签规则
    if(groupType === 1 || groupType === 7 || groupType === 8){
      basicInfoConditonDescLength =0;
    }
    let timeToString ="" ;
    if(createTime){
      timeToString = this.timestampToTime(createTime);
    }

    // console.log('existCusTag-------1111111111111111------', existCusTag);
    // console.log('checkedValues-----111111111111--------', checkedValues);
   // console.log('basicInfo---------------tabKeys-------------->>>>>>>>>>>>>', tabKeys);
    // console.log('basicInfo-------------->>>>>>>>>>>>>', basicInfo);
    // console.log('queryNumberLoading-------------->>>>>>>>>>>>>', queryNumberLoading);

    const disabledExistList = customerTag.map(item => item.tag_english_value_title);

    const reg = /群$/;
    let entityName = '用户';
    entityList.forEach((item) => {
      if(entityId === item.id) {
        entityName = item.entityName;
        if (groupType === 7 || groupType === 8) { // 7所有群 8特别关注群
          groupName = groupName.replace(reg, `${item.entityName}群`);
        }
      }
      if (entityId === item.id) {
        entityCategory = item.entityCategory;
      }
    })

    return (
      <div className={styles.basic}>
        <div className={styles.left}>
          <div className={styles.bottom} style={{height:basicInfoConditonDescLength >0 ?"50%":"80%"}}>
            <div className={styles.groupimage} ></div>
            {
              entityCategory === 0 &&
              <ul className={styles.ulList} >
                <li>名称:{groupName}</li>
                {
                  basicInfo.configValue === ''
                    ? <li>{entityName}数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, basicInfo.id) && _.get(customerAndUserNum, basicInfo.id).customerNum}</li>
                    : (() => {
                      let arr = [
                        <li key={1}>{entityName}数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, basicInfo.id) && _.get(customerAndUserNum, basicInfo.id).userNum}</li>,
                        <li key={2}>{basicInfo.configValueName}数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, basicInfo.id) && _.get(customerAndUserNum, basicInfo.id).customerNum}</li>,
                      ];
                      return arr;
                    })()
                }
                <li>分类:{categoryName}</li>
                {groupDesc ? <li>描述:{groupDesc}</li> : ''}
                {createTime? <li>创建时间:{timeToString}</li> : ''}
              </ul>
            }
            {
              entityCategory !== 0 &&
              <ul className={styles.ulList} >
                <li>名称:{groupName}</li>
                {
                  basicInfo.configValue === ''
                    ? <li>产品数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, basicInfo.id) && _.get(customerAndUserNum, basicInfo.id).customerNum}</li>
                    : (() => {
                      let arr = [
                        <li key={1}>产品数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, basicInfo.id) && _.get(customerAndUserNum, basicInfo.id).userNum}</li>,
                        <li key={2}>商品数:{queryNumberLoading ? <Spin size='small' /> : _.get(customerAndUserNum, basicInfo.id) && _.get(customerAndUserNum, basicInfo.id).customerNum}</li>,
                      ];
                      return arr;
                    })()
                }
                <li>分类:{categoryName}</li>
                {groupDesc ? <li>描述:{groupDesc}</li> : ''}
                {createTime? <li>创建时间:{timeToString}</li> : ''}
              </ul>
            }
          </div>
          {
            groupType === 0 &&
            <div className={styles.top}
              onMouseEnter={this.handleMouseEnter.bind(this)}
              onMouseLeave={this.handleMouseLeave.bind(this)}
            >
              <span style={{ cursor: 'pointer' }}>
                用户群生成规则:
              </span>
              {/* {
                regularVisible
                  ? <div className={styles.regular} >
                    <CreateConditionCnHtml curEditGroup={basicInfo} />
                  </div>
                  : ''
              } */}
              {
                 <div className={styles.regular} >
                    <CreateConditionCnHtml curEditGroup={basicInfo} />
                  </div>
              }

            </div>
          }
        </div>
        <div className={styles.right} style={{ display: tabKeys.includes(`qzgl_xqzgl_nzq_qxq_dzhbq_${entityId}`) || tabKeys.includes(`qzgl_xqzgl_wdq_qxq_dzhbq_${entityId}`) ? 'block' : 'none' }}>
          <div className={styles.top}>
            <Button type='primary' onClick={this.handleModalVisible.bind(this, true)}>自定义标签</Button>
          </div>
          <div className={styles.tag}>
            {
              customerTag.map((tag, index) => {
                return (<Tag
                  closable
                  color="blue"
                  key={`tag${index}`}
                  style={{ margin: 10 }}
                  onClick={(e) => { e.preventDefault() }}
                  onClose={this.handleCusTagDel.bind(this, tag.tag_english_value_title)}
                >
                  {tag.tag_value_title}
                </Tag>)
              })
            }
          </div>

          <Modal
            width='350px'
            title='新增自定义标签'
            maskClosable={false}
            visible={this.state.visible}
            onOk={this.handleModalOk}
            onCancel={this.handleModalVisible.bind(this, false)}
          >
            <Tabs type="card" onChange={this.handleTableChange}>
              <TabPane tab="新增标签" key="1">
                <FormItem
                  labelCol={{ span: 7 }}
                  wrapperCol={{ span: 15 }}
                  label="标签名称"
                >
                  {
                    getFieldDecorator('newTagName', {
                      rules: [
                        { required: true, message: '请输入标签名称!' },
                        { max: 15, message: '15个字符以内' },
                      ],
                    })(
                      <Input placeholder="15个字符以内" />
                      )
                  }
                </FormItem>
              </TabPane>
              <TabPane tab="选择已有标签" key="2">
                <FormItem
                  wrapperCol={{ span: 24 }}
                >
                  {
                    <CheckboxGroup
                      onChange={this.handlecheckboxChange}
                      // value={disabledExistList}
                      value={checkedValues || disabledExistList}
                      options={
                        (() => {
                          return existCusTag.map((item) => {
                            return {
                              label: item.tag_value_title,
                              value: item.tag_english_value_title,
                              disabled: disabledExistList.includes(item.tag_english_value_title),
                            }
                          })
                        })()
                      }
                    >
                    </CheckboxGroup>
                  }
                </FormItem>
              </TabPane>
            </Tabs>
          </Modal>
        </div>
      </div>
    );
  }
}


export default Form.create()(BasicInfo);
