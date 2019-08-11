import React, { PureComponent } from 'react';
import { Form, Checkbox, Button, Icon, Col, Table, Spin, message } from 'antd';
// import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import uuid from 'uuid'
import Tags from './Tags';
import styles from './detailList.less';

const uuidv4 = uuid.v4;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
class DetailList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dropDoiwnVisible: false, // 下拉 展示
      quotaVisible: false, // 自定义指标Modal 展示
      basicQuotaVal: null, // 已经勾选的基础指标
      customerQuotaVal: null, // 已经勾选的自定义指标
      tableColumnItems: null, // table的表头列表
      basicAndCusQuotaAuth: [], // 基础指标和自定义指标的权限
      downloadText: '下载', // 下载按钮的文字
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    let { dispatch, entityId, groupId, location, detailCusQuotaAuth = [] } = this.props;
    const { state } = location;
    let { TGItype, TGIParams } = state;
    dispatch({ // 获取标签
      type: 'tagPicker/getTagNameList',
      payload: { entityId },
    })

    let parentKey = '';
    if (detailCusQuotaAuth.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_${entityId}`)) { // 内置群 或 临时群
      parentKey = `qzgl_xqzgl_nzq_qxq_xqlb_zdy_${entityId}`;
    } else if (detailCusQuotaAuth.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_${entityId}`)) { // 外导群
      parentKey = `qzgl_xqzgl_wdq_qxq_xqlb_zdy_${entityId}`;
    }

    if (parentKey) {
      dispatch({
        type: 'user/fetchAuths',
        payload: { parentKey },
        callback: (data) => {
          this.state.basicAndCusQuotaAuth = data || [];
          let [onlyBasicYes, onlyCusYes, bothYes] = [false, false, false];
          if (
            (data.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_jczb_${entityId}`) && !data.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_zdyzb_${entityId}`))
            || (data.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_jczb_${entityId}`) && !data.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_zdyzb_${entityId}`))
          ) {
            onlyBasicYes = true;
          } else if (
            (!data.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_jczb_${entityId}`) && data.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_zdyzb_${entityId}`))
            || (!data.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_jczb_${entityId}`) && data.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_zdyzb_${entityId}`))
          ) {
            onlyCusYes = true;
          } else if (
            (data.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_jczb_${entityId}`) && data.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_zdyzb_${entityId}`))
            || (data.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_jczb_${entityId}`) && data.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_zdyzb_${entityId}`))
          ) {
            bothYes = true;
          }

          if (onlyBasicYes) {
            dispatch({ // 获取基础指标
              type: 'group/profile/getBasicQuota',
              payload: {
                entityId,
                callback: (basicQuota) => {
                  const columnNames = [];
                  const { customerQuota } = this.props;
                  const totalQuota = basicQuota.concat(customerQuota);
                  totalQuota.slice(0, 5).forEach((item) => {
                    columnNames.push(item.columnName || item.tagEnglishName);
                  })
                  if (!columnNames.includes('super_id')) {
                    columnNames.push('super_id');
                  }

                  dispatch({ // 获取用户列表
                    type: 'group/profile/getGroupDetailInfo',
                    payload: {
                      entityId,
                      TGItype,
                      groupId,
                      limit: 200,
                      expression: TGIParams,
                      columnNames: columnNames.join(','),
                    },
                  })
                },
              },
            })
          } else if (onlyCusYes) {
            dispatch({ // 获取已有的自定义指标
              type: 'group/profile/getCustomerQuota',
              payload: {
                entityId,
                groupAnalyzeDimensionTypeEnum: 'CUSTOM_INDEX',
                callback: (customerQuota) => {
                  const { basicQuota } = this.props;
                  const columnNames = [];
                  const totalQuota = basicQuota.concat(customerQuota);
                  totalQuota.slice(0, 5).forEach((item) => {
                    columnNames.push(item.columnName || item.tagEnglishName);
                  })
                  if (!columnNames.includes('super_id')) {
                    columnNames.push('super_id');
                  }
                  dispatch({ // 获取用户列表
                    type: 'group/profile/getGroupDetailInfo',
                    payload: {
                      entityId,
                      TGItype,
                      groupId,
                      limit: 200,
                      expression: TGIParams,
                      columnNames: columnNames.join(','),
                    },
                  })
                },
              },
            })
          } else if (bothYes) {
            dispatch({ // 获取基础指标
              type: 'group/profile/getBasicQuota',
              payload: {
                entityId,
                callback: (basicQuota) => {
                  dispatch({ // 获取已有的自定义指标
                    type: 'group/profile/getCustomerQuota',
                    payload: {
                      entityId,
                      groupAnalyzeDimensionTypeEnum: 'CUSTOM_INDEX',
                      callback: (customerQuota) => {
                        const columnNames = [];
                        const totalQuota = basicQuota.concat(customerQuota);
                        totalQuota.slice(0, 5).forEach((item) => {
                          columnNames.push(item.columnName || item.tagEnglishName);
                        })
                        if (!columnNames.includes('super_id')) {
                          columnNames.push('super_id');
                        }
                        dispatch({ // 获取用户列表
                          type: 'group/profile/getGroupDetailInfo',
                          payload: {
                            entityId,
                            TGItype,
                            groupId,
                            limit: 200,
                            expression: TGIParams,
                            columnNames: columnNames.join(','),
                          },
                        })
                      },
                    },
                  })
                },
              },
            })
          }
        },
      })
    }
  }


  checkIsMoreThanNum = (num, values, type) => {
    const { basicQuotaVal, customerQuotaVal } = this.state;
    const { basicQuota = [], customerQuota = [] } = this.props;
    const { initialBasicQuotaVal, initialCustomerQuotaVal } = this.createInitialQuota(basicQuota, customerQuota)
    let totalLength = 0;
    let { length } = values;

    if (type === 'basic') { // 点击的是基础指标
      if (!customerQuotaVal) { // 自定义指标未被污染
        totalLength = length + initialCustomerQuotaVal.length;
      } else { // 自定义指标已经被污染
        totalLength = length + customerQuotaVal.length;
      }
    } else if (type === 'customer') { // 点击的是自定义指标
      if (!basicQuotaVal) { // 自定义指标未被污染
        totalLength = length + initialBasicQuotaVal.length;
      } else { // 自定义指标已经被污染
        totalLength = length + basicQuotaVal.length;
      }
    }

    if (totalLength > num) {
      return true;
    } else {
      return false;
    }
  }

  handlebasicQuotaChange = (values) => {
    if (this.checkIsMoreThanNum(10, values, 'basic')) {
      message.info('最多可同时选择10项');
      return false;
    }
    this.setState({
      basicQuotaVal: values,
    })
  }

  handleCustomerQuotaChange = (values) => {
    if (this.checkIsMoreThanNum(10, values, 'customer')) {
      message.info('最多可同时选择10项');
      return false;
    }

    this.setState({
      customerQuotaVal: values,
    })
  }


  handleDropDownShow = () => {
    this.setState({
      dropDoiwnVisible: true,
    })
  }

  handleDropDownHide = () => {
    this.setState({
      dropDoiwnVisible: false,
    })
  }


  handleProfileList = () => {
    const { basicQuotaVal, customerQuotaVal } = this.state;
    // if (!basicQuotaVal && !customerQuotaVal) {
    //   return false;
    // }
    const { basicQuota = [], customerQuota = [] } = this.props;
    const { initialBasicQuotaVal, initialCustomerQuotaVal } = this.createInitialQuota(basicQuota, customerQuota)
    let [basic, customer, tableColumnItems] = [[], [], []];

    if (!basicQuotaVal && customerQuotaVal) {
      basic = initialBasicQuotaVal;
      customer = customerQuotaVal;
    }

    if (!customerQuotaVal && basicQuotaVal) {
      basic = basicQuotaVal;
      customer = initialCustomerQuotaVal;
    }

    if (basicQuotaVal && customerQuotaVal) {
      basic = basicQuotaVal;
      customer = customerQuotaVal;
    }

    const columnNames = basic.concat(customer);

    basicQuota.forEach((item) => {
      if (columnNames.includes(item.columnName)) {
        tableColumnItems.push(item)
      }
    })

    customerQuota.forEach((item) => {
      if (columnNames.includes(item.tagEnglishName)) {
        tableColumnItems.push(item)
      }
    })


    this.setState({
      tableColumnItems,
      dropDoiwnVisible: false,
    }, () => {
      this.props.handleProfileList(columnNames);
    })
  }

  handleQuotaShowClick = () => {
    this.setState({
      quotaVisible: true,
    })
  }

  handleAddtCustomerQuota = (checked, callback) => {
    const { customerQuota = [] } = this.props;
    const totalCustomerQuota = customerQuota.map(item => item.tagEnglishName);
    let checkdTags = [];
    checked.forEach((item) => {
      if (!totalCustomerQuota.includes(item)) {
        checkdTags.push(item)
      }
    })

    this.props.handleAddtCustomerQuota(checkdTags, (success) => {
      if (success) {
        message.success('增加成功');
        this.handleQuotaHideClick();
        if (callback) callback(success);
      } else {
        message.error('增加失败');
      }
    });
  }

  handleQuotaHideClick = () => {
    this.setState({
      quotaVisible: false,
    })
  }

  createInitialQuota = (basicQuota = [], customerQuota = []) => {
    let [initialBasicQuotaVal, initialCustomerQuotaVal] = [[], []];
    if (basicQuota.length >= 5) {
      initialBasicQuotaVal = basicQuota.slice(0, 5).map(item => item.columnName);
    } else {
      initialBasicQuotaVal = basicQuota.map(item => item.columnName);
      initialCustomerQuotaVal = customerQuota.slice(0, 5 - basicQuota.length).map(item => item.tagEnglishName)
    }
    return {
      initialBasicQuotaVal,
      initialCustomerQuotaVal,
    }
  }

  handleDelCustomerQuota = (id, tagEnglishName, e) => { // 删除自定义指标
    e.preventDefault();
    const { basicQuota = [], customerQuota = [] } = this.props;
    const { tableColumnItems } = this.state;
    let [canDelete, columnList] = [false, null];
    if (tableColumnItems === null) {
      columnList = basicQuota.concat(customerQuota).slice(0, 5);
    } else {
      columnList = tableColumnItems.slice(0);
    }
    columnList.forEach((item) => {
      if (item.tagEnglishName === tagEnglishName) {
        canDelete = true;
      }
    })

    if (canDelete) {
      message.info('该指标在表格中被使用,不能删除,请取消选中并确定后再删除!');
      return false;
    }

    if (e.target.id === 'delete') {
      this.props.handleDelCustomerQuota(id, (success) => {
        if (success) {
          message.success('删除成功');
          let { customerQuotaVal } = this.state;
          if (customerQuotaVal !== null) { // 自定义指标已经被污染
            customerQuotaVal = customerQuotaVal.filter(item => item !== tagEnglishName);
            this.setState({
              customerQuotaVal,
            })
          }
        } else {
          message.error('删除失败');
        }
      });
    }
  }

  handleApplyDownloadGroup = () => {
    const { basicQuota = [], customerQuota = [] } = this.props;
    const { tableColumnItems } = this.state;
    const { initialBasicQuotaVal, initialCustomerQuotaVal } = this.createInitialQuota(basicQuota, customerQuota)
    let columnNames = [];
    let columnCHNames = [];


    if (tableColumnItems === null) {
      columnNames = initialBasicQuotaVal.concat(initialCustomerQuotaVal);
      columnCHNames = basicQuota.concat(customerQuota).slice(0, 5).map(item => item.tagName || item.columnTitle);
    } else {
      columnNames = tableColumnItems.map(item => item.tagEnglishName || item.columnName);
      columnCHNames = tableColumnItems.map(item => item.tagName || item.columnTitle);
    }

    // console.log('columnNames--------------', columnNames);
    // console.log('columnCHNames--------------', columnCHNames);


    this.props.handleApplyDownloadGroup(columnNames, columnCHNames);
  }


  goToPortraitDetail = (superId) => {
    // const { entityId, history } = this.props;
    // history.push({
    //   pathname: '/portrait/profile',
    //   search: `id=${entityId}&sid=${superId}`,
    // })
    const { entityId } = this.props;
    window.open(`/#/portrait/profile?id=${entityId}&sid=${superId}`);
  }

  render() {
    const { basicQuota = [], entityId, detailCusQuotaAuth = [], downloadBtnVisible = false, customerQuota = [], tagNameList = [], infoList = [], detailTableLoading, detailDownloadLoading } = this.props;
    const { quotaVisible, dropDoiwnVisible, tableColumnItems, basicAndCusQuotaAuth = [] } = this.state;
    let totalQuota = basicQuota.concat(customerQuota).slice(0, 5);// 取基础指标和自定义指标的前十个 作为列表的columns
    if (tableColumnItems) {
      totalQuota = tableColumnItems.slice(0, 10);
    }
    let columns = [];
    const { initialBasicQuotaVal, initialCustomerQuotaVal } = this.createInitialQuota(basicQuota, customerQuota);
    const width = 100 / (totalQuota.length + 1);
    totalQuota.forEach((item) => {
      columns.push({
        width: `${width}%`,
        dataIndex: item.columnName || item.tagEnglishName,
        title: item.columnTitle || item.tagName, // <Ellipsis tooltip lines={1}>{item.columnTitle || item.tagName}</Ellipsis>,
        key: uuidv4(),
      })
    })
    columns.push({
      title: '操作',
      dataIndex: '',
      key: uuidv4(),
      width,
      render: (text, record) => {
        const superId = record.super_id;
        return superId
          ? <a key={uuidv4()} onClick={this.goToPortraitDetail.bind(this, superId)} href="javascript:;">详情</a>
          : ''
      },
    })

    const tagProps = {
      tagNameList,
      quotaVisible,
      customerQuota,
      defaultcheckedTags: customerQuota.map(item => item.tagEnglishName),
      handleQuotaHideClick: this.handleQuotaHideClick,
      handleAddtCustomerQuota: this.handleAddtCustomerQuota,
    }
    // console.log('this.props.detailCusQuotaAuth---------6666666666---------', detailCusQuotaAuth);
    // console.log('basicQuota-----------', basicQuota);
    // console.log('customerQuota-----------', customerQuota);
    // console.log('infoList----------------', infoList);
    // console.log('downloadBtnVisible----------------', downloadBtnVisible);
    // console.log('this.state.basicAndCusQuotaAuth---------777777777---------', basicAndCusQuotaAuth);
    // console.log('this.props.infoList---------888888888---------', infoList);

    return (
      <div className={styles.list}>
        <div className={styles.top} style={{ display: basicAndCusQuotaAuth.length > 0 ? 'flex' : 'none' }}>
          {
            detailCusQuotaAuth.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_${entityId}`) || detailCusQuotaAuth.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_${entityId}`)
              ? <Button type='primary' onClick={this.handleDropDownShow}>自定义指标</Button>
              : ''
          }
          {
            downloadBtnVisible && (
              detailCusQuotaAuth.includes(`qzgl_xqzgl_nzq_qxq_xqlb_xz_${entityId}`) || 
              detailCusQuotaAuth.includes(`qzgl_xqzgl_wdq_qxq_xqlb_xz_${entityId}`)
            ) ? <Button
                title={this.props.location.state.userNum/1 > 1000000 ? '群人数超过最大限制额度，无法下载' : null}
                type='primary'
                size='samll'
                disabled={detailDownloadLoading || this.props.location.state.userNum/1 > 1000000}
                onClick={this.handleApplyDownloadGroup}
              >
                {detailDownloadLoading ? '下载中' : '下载'}
              </Button>
              : ''
          }
        </div>
        <div className={styles.config} style={{ display: dropDoiwnVisible ? 'block' : 'none' }}>
          {
            basicAndCusQuotaAuth.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_jczb_${entityId}`) || basicAndCusQuotaAuth.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_jczb_${entityId}`)
              ? <FormItem
                labelCol={{ span: 2, offset: 1 }}
                wrapperCol={{ span: 20 }}
                style={{ marginBottom: 0 }}
                label="基础指标"
              >
                <CheckboxGroup
                  style={{ width: '100%' }}
                  value={this.state.basicQuotaVal || initialBasicQuotaVal}
                  onChange={this.handlebasicQuotaChange}
                >
                  {
                    basicQuota.map((item, index) => {
                      return (
                        <Checkbox
                          key={item.columnName}
                          value={item.columnName}
                          style={{ margin: '0 5px 5px 5px' }}
                        >
                          {item.columnTitle}
                        </Checkbox>
                      )
                    })
                  }
                </CheckboxGroup>
              </FormItem>
              : ''
          }
          {
            basicAndCusQuotaAuth.includes(`qzgl_xqzgl_nzq_qxq_xqlb_zdy_zdyzb_${entityId}`) || basicAndCusQuotaAuth.includes(`qzgl_xqzgl_wdq_qxq_xqlb_zdy_zdyzb_${entityId}`)
              ? <FormItem
                labelCol={{ span: 2, offset: 1 }}
                wrapperCol={{ span: 21 }}
                style={{ marginBottom: 0 }}
                label="自定义指标"
              >
                <div style={{ display: 'flex', minHeight: '39px' }}>
                  <CheckboxGroup
                    style={{ width: '90%' }}
                    onChange={this.handleCustomerQuotaChange}
                    value={this.state.customerQuotaVal || initialCustomerQuotaVal}
                  >
                    {
                      customerQuota.map((item) => {
                        return (
                          <Checkbox
                            key={item.tagEnglishName}
                            value={item.tagEnglishName}
                            style={{ margin: '0 5px 5px 5px', paddingTop: 10 }}
                          >
                            {item.tagName}
                            {
                              item.dimensionType === 'CUSTOM_INDEX' &&
                              <Icon
                                type="close-circle-o"
                                id='delete'
                                style={{ marginLeft: 3, fontSize: 12, position: 'relative', top: '-6px' }}
                                onClick={this.handleDelCustomerQuota.bind(this, item.id, item.tagEnglishName)}
                              />
                            }
                          </Checkbox>
                        )
                      })
                    }

                  </CheckboxGroup>
                  <Button type='primary' size='small' style={{ marginLeft: 10 }} onClick={this.handleQuotaShowClick}>新建</Button>
                  <Tags {...tagProps} />
                </div>
              </FormItem>
              : ''
          }

          <FormItem
            wrapperCol={{ span: 23, offset: 1 }}
            style={{ marginBottom: 0 }}
            label=''
          >
            <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}>（说明：最多可同时选10项）</div>
          </FormItem>

          <div style={{ display: 'flex', height: '39px', justifyContent: 'center', alignItems: 'center' }}>
            <Button type='primary' onClick={this.handleProfileList}>确认</Button>
            <Button style={{ marginLeft: 10 }} onClick={this.handleDropDownHide}>取消</Button>
          </div>
        </div>
        <div style={{ display: basicAndCusQuotaAuth.length > 0 ? 'block' : 'none' }}>
          <Table
            loading={detailTableLoading}
            columns={columns}
            dataSource={infoList}
          />
        </div>
      </div>

    );
  }
}


export default Form.create()(DetailList);

