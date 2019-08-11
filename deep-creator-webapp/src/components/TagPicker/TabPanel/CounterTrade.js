import React, { Component } from 'react';
import { Row, Col, Checkbox, Form, Select, DatePicker, Input, Button, Tag, message } from 'antd';
import uuid from 'uuid';

import styles from './CounterTrade.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const uuidv4 = uuid.v4;


class CounterTrade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      relation: '&',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'atgPicker/getPurchaseVal',
    })
  }


  formatDate = (key, dateStrings) => {
    let time = [];
    switch (key) {
      case 0:// 不限
        time = ['', ''];
        break;
      case '1':// 介于
        time = dateStrings;
        break;
      case '2':// 发生于
        time = [dateStrings, dateStrings];
        break;
      case '3':// 之前
        time = ['', dateStrings];
        break;
      case '4':// 之后
        time = [dateStrings, ''];
        break;
      default:
        break;
    }
    return time;
  }


  handleCompareChange = (compares, type, key) => {
    const { value, onChange } = this.props;
    const name = `${type}Compare`;
    value[name] = compares.find(item => item.key === key);
    onChange(value);
  }

  handleValueChange = (values, key) => {
    const { value, onChange } = this.props;
    const name = 'purchaseVal';
    value[name] = values.find(item => item.name === key);
    onChange(value);
  }

  handleDateChange = (compareKey, date, dateString) => {
    const { value, onChange } = this.props;
    const time = this.formatDate(compareKey, dateString);
    value.time = time
    onChange(value);
  }


  handleParamListChange = (...arg) => {
    const [paramId, list, type, selectKey] = [...arg]; // selectKey 在Select组件下是key,在Input组件下是事件参数e
    const { value, onChange } = this.props;
    const { proParamList } = value;
    let paramList;
    if (type === 'updateType') {
      paramList = proParamList.map((item, index) => {
        if (paramId === item.id) {
          item.type = selectKey;
          if (selectKey === '0') item.typeName = '';
          item.typeName = list.find(i => i.name === selectKey).name_cn;
        }
        return item;
      });
    } else if (type === 'updateCompare') {
      paramList = proParamList.map((item, index) => {
        if (paramId === item.id) {
          item.compare = selectKey;
          if (selectKey === '0') item.compareName = '';
          item.compareName = list.find(i => i.key === selectKey).name;
        }
        return item;
      });
    } else if (type === 'updateValue/input') {
      paramList = proParamList.map((item, index) => {
        if (paramId === item.id) {
          item.value = selectKey.target.value;
          delete item.valueName;
        }
        return item;
      });
    } else if (type === 'updateValue/select') {
      paramList = proParamList.map((item, index) => {
        if (paramId === item.id) {
          if (selectKey === '0') item.value = '';
          item.value = list.find(i => i.name === selectKey).name;
          item.valueName = list.find(i => i.name === selectKey).name_cn;
        }
        return item;
      });
    } else if (type === 'delete') {
      paramList = proParamList.filter((item, index) => {
        return paramId !== item.id;
      });
    }
    this.setState({
      proParamList,
    }, () => {
      value.proParamList = paramList;
      onChange(value);
    });
  }

  handleJudgeConditionIsOk = (value) => {
    const { timeCompare = {}, time, purchaseVal = {}, proParamList = [] } = value;
    const timeCompareKey = timeCompare.key || '0';
    const purchaseValKey = purchaseVal.id || '0';
    if (timeCompareKey !== '0' && !time) {
      message.error('请选择订单时间')
      return false;
    }


    if (purchaseValKey === '0') {
      message.error('请选择购买类型')
      return false;
    }

    const { length } = proParamList;

    if (length >= 1) {
      const last = proParamList[length - 1];
      if (!last.typeName) {
        message.error('请选择参数类型')
        return false;
      }
      if (!last.compareName) {
        message.error('请选择参数条件')
        return false;
      }
      if (!last.value) {
        message.error('请输入参数值')
        return false;
      }
    }
    return true;
  }

  handleAddParam = () => {
    const { value, onChange } = this.props;
    const { proParamList = [] } = value;
    if (!this.handleJudgeConditionIsOk(value)) {
      return false;
    }

    const param = {
      id: uuidv4(),
      type: '0',
      typeName: '',
      compare: '0',
      compareName: '',
      value: '',
    };
    proParamList.push(param);
    value.proParamList = proParamList;
    onChange(value);
  }

  handleParamLogicClick = () => {
    const { value, onChange } = this.props;
    this.setState({
      relation: this.state.relation === '&' ? '|' : '&',
    }, () => {
      value.relation = this.state.relation;
      onChange(value)
    });
  }

  queryParamChild = (key, list) => {
    if (key === 0) return;
    let child;
    let current = list.find(item => item.id === key)
    child = current.child || [];
    return child;
  }

  handleJoinClick = () => {
    const { value, onChange, handleAddTradeClick } = this.props;
    const { timeCompare = {}, relation, trade = [] } = value;
    const timeCompareKey = timeCompare.key || '0';
    if (timeCompareKey === '0') {
      value.timeCompare = { name: '不限', key: '0' };
      value.time = ['', ''];
    }
    if (!relation) {
      value.relation = this.state.relation; // 不设置的话默认值为全部满足
    }
    if (!this.handleJudgeConditionIsOk(value)) {
      return false;
    }

    value.isReady = true;

    if (value.isReady) trade.push(this.organizeServerData(value));
    value.trade = trade;
    // onChange(value);
    this.props.updateFilesValue({ trade: value.trade, isReady: value.isReady }, 'CounterTrade')
  }

  organizeServerData = (value) => {
    const {
      // timeCompare = {},
      time,
      purchaseVal,
      proParamList = [],
      relation = '&',
    } = value;
    // const timeCompareKey = timeCompare.key || '0';
    let date = {};
    let tradeType = {};
    let tradeParams = [];

    date = {
      start_date: time[0],
      end_date: time[1],
    }

    if (purchaseVal) {
      tradeType = {
        column_name: 'product_type',
        column_value: purchaseVal.name,
        column_value_cn: purchaseVal.name_cn,
      }
    }

    proParamList.forEach((item) => {
      let obj = {
        param_name: item.type,
        param_condition: item.compare,
        param_value: item.value,
        param_name_cn: item.typeName,
        param_condition_cn: item.compareName,
      }
      if (item.valueName) {
        obj.valueName = item.valueName;
      }
      tradeParams.push(obj)
    })

    const option = {
      id: uuidv4(),
      date,
      trade_type: tradeType,
      trade_params: tradeParams,
      relation,
    };
    return option;
  }


  render() {
    const timeCompares = [
      { name: '不限', key: '0' },
      { name: '介于', key: '1' },
      { name: '发生于', key: '2' },
      { name: '之前', key: '3' },
      { name: '之后', key: '4' },
    ];
    const paramCompares = [
      { name: '请选择', key: '0' },
      { name: '等于', key: '=' },
      { name: '大于', key: '>' },
      { name: '小于', key: '<' },
      { name: '不等于', key: '!=' },
    ];


    // purchaseValues 和 params 前端暂时写死,后期需要定制化开发
    const purchaseValues = [
      { name_cn: '基金产品', name: 'jijin', id: 1 },
      { name_cn: '理财产品', name: 'licai', id: 2 },
    ];

    const params = [
      { name_cn: '产品编号', name: 'chanpinbianhao', id: 1 },
      {
        name_cn: '成交状态',
        name: 'chengjiaozhuangtai',
        id: 2,
        child: [
          { name_cn: '未成交', name: 'weichengjiao', id: 1, pid: 2 },
          { name_cn: '已成交', name: 'yichengjiao', id: 2, pid: 2 },
        ],
      },
      { name_cn: '成交金额', name: 'chengjiaojine', id: 3 },
    ];

    const { value } = this.props;
    const {
      timeCompare = {},
      purchaseVal = {},
      proParamList = [],
    } = value;
    const timeCompareKey = timeCompare.key || '0';
    const purchaseValKey = purchaseVal.name || '0';

    return (
      <div className={styles.trade}>
        <FormItem
          labelCol={{ span: 2 }}
          label="订单时间"
        >
          <Col span={3}>

            <Select
              value={timeCompareKey}
              style={{ width: 100, marginRight: 10 }}
              onChange={this.handleCompareChange.bind(this, timeCompares, 'time')}
            >

              {
                timeCompares.map((item, index) => {
                  return <Option key={uuidv4()} value={item.key}>{item.name}</Option>;
                })
              }
            </Select>
          </Col>
          <Col span={7} style={{ display: timeCompareKey === '0' ? 'none' : 'block' }}>

            {
              timeCompareKey === '1' ?
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  onChange={this.handleDateChange.bind(this, timeCompareKey)}

                /> :
                <DatePicker
                  onChange={this.handleDateChange.bind(this, timeCompareKey)}
                />
            }

          </Col>
        </FormItem>

        <FormItem
          labelCol={{ span: 2 }}
          label="购买类型"
        >
          <Select
            value={purchaseValKey}
            style={{ width: 120 }}
            onChange={this.handleValueChange.bind(this, purchaseValues)}
          >
            <Option key="purchaseValue_-1" value='0'>请选择</Option>

            {
              purchaseValues.map((item, index) => {
                return <Option key={`purchaseValue_${index}`} value={item.name}>{item.name_cn}</Option>
              })
            }
          </Select>
        </FormItem>

        {
          proParamList.map((param, k) => {
            return (
              <FormItem
                key={param.id}
                labelCol={{ span: 2 }}
                wrapperCol={{ span: 18 }}
                label="产品参数"
              >
                <Col span={4}>
                  <Select
                    value={param.type}
                    style={{ width: 100 }}
                    onChange={this.handleParamListChange.bind(this, param.id, params, 'updateType')}
                  >
                    <Option key="params_-1" value='0'>请选择</Option>
                    {
                      params.map((item, index) => {
                        return <Option key={`params_${index}`} value={item.name}>{item.name_cn}</Option>
                      })
                    }
                  </Select>

                </Col>

                <Col span={4} >
                  <Select
                    disabled={param.type === '0'}
                    value={param.compare}
                    style={{ width: 100 }}
                    onChange={this.handleParamListChange.bind(this, param.id, paramCompares, 'updateCompare')}
                  >

                    {
                      paramCompares.map((item, index) => {
                        return <Option key={`paramCompares_${index}`} value={item.key}>{item.name}</Option>
                      })
                    }
                  </Select>
                </Col>

                <Col span={4} >
                  {
                    (() => {
                      let [hasChildren, child] = [false, []];

                      params.forEach((item, index) => {
                        if (item.name === param.type && item.child) {
                          hasChildren = true;
                          child = item.child;
                        }
                      })
                      return !hasChildren ?
                        <Input
                          disabled={param.type === '0' || param.compare === '0'}
                          onChange={this.handleParamListChange.bind(this, param.id, [], 'updateValue/input')}
                        /> :
                        <Select
                          disabled={param.type === '0' || param.compare === '0'}
                          value={param.value || '0'}
                          style={{ width: 100 }}
                          onChange={this.handleParamListChange.bind(this, param.id, child, 'updateValue/select')}
                        >
                          <Option key="child_-1" value='0'>请选择</Option>
                          {
                            child.map((item, index) => {
                              return <Option key={`child_${index}`} value={item.name}>{item.name_cn}</Option>
                            })
                          }
                        </Select>
                    })()
                  }
                </Col>

                <Col span={2} style={{ marginLeft: 5 }}>
                  <Tag
                    color="red"
                    style={{ border: 'none', background: 'none' }}
                    onClick={this.handleParamListChange.bind(this, param.id, [], 'delete')}
                  >删除
                  </Tag>
                </Col >
                {
                  k === 0 && proParamList.length > 1
                    ? (
                      <Button
                        onClick={this.handleParamLogicClick}
                      >
                        {this.state.relation === '|' ? '任意满足' : '全部满足'}
                      </Button>
                    )
                    : ''
                }
              </FormItem>
            );
          })
        }
        <a href="javascript:;" onClick={this.handleAddParam}> 增加产品参数条件</a>
        <div className={styles.join}>
          <Button type='primary' onClick={this.handleJoinClick}>加入条件</Button>
        </div>
      </div>);
  }
}


export default CounterTrade;


// (param.type === '' || param.type === 'chanpinbianhao' || param.type === 3) ?
// <Input
//  disabled={param.type === 0 || param.compare === 0}
//  onChange={this.handleParamListChange.bind(this, param.id, [], 'updateValue/input')}
// /> :
// <Select
//  disabled={param.type === 0 || param.compare === 0}
//  value={param.value || 0}
//  style={{ width: 100 }}
//  onChange={this.handleParamListChange.bind(this, param.id, this.queryParamChild(param.type, params), 'updateValue/select')}
// >
//  <Option key="child_-1" value={0}>请选择</Option>
//  {
//    (() => {
//      const child = this.queryParamChild(param.type, params);
//      return child.map((item, index) => {
//        return <Option key={`child_${index}`} value={item.id}>{item.name_cn}</Option>
//      })
//    })()
//
//  }
// </Select>