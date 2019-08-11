import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'dva';
import { Button, Select, Input, Form, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './MicroPortrait.less';

const { Option } = Select;
const { Search } = Input;

class MicroPortrait extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entityId: 1,
      entityCategory: 0,
      options: [], // 展示Select的Option
      queryValue: '', // 搜索的输入值
      columnName: '', // 当前选中的列
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'microPortrait/getEntityList',
      payload: {},
    }).then(() => {
      const { entityList = [] } = this.props.microPortrait;
      console.log('entityList--------------', entityList)
      const entityId = entityList.length ? entityList[0].id : 1;
      // const entityCategory = entityList.length ? entityList[0].entityCategory : 0;

      dispatch({
        type: 'microPortrait/getIdsfromEntity',
        payload: {
          entityId,
          configType: 1,
          callback: (success, ids) => {
            const columnName = ids.length ? ids[0].columnName : '';
            this.setState({
              entityId,
              columnName,
              // entityCategory,
            })
          },
        },
      })
    })
  }

  // handleUserValidator = (value) => {
  //   let nameReg = /^[\u4E00-\u9FA5]+$/; // 只匹配中文姓名
  //   let phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/; // 手机

  //   if (!nameReg.test(value) && !phoneReg.test(value)) {
  //     message.error('查询格式不正确');
  //     return null;
  //   }
  //   if (nameReg.test(value)) {
  //     return 'name';
  //   }
  //   if (phoneReg.test(value)) {
  //     return 'phone'
  //   }
  // }


  handleEntityIdChange = (value) => {
    const { dispatch } = this.props;
    // this.setState({
    //   entityId: value,
    // }, () => {
    //   // console.log('this.state.entityId--------------', this.state.entityId)
    //   dispatch({
    //     type: 'microPortrait/getIdsfromEntity',
    //     payload: {
    //       entityId: value,
    //       configType: 1,
    //     },
    //   })
    // });

    dispatch({
      type: 'microPortrait/getIdsfromEntity',
      payload: {
        entityId: value,
        configType: 1,
        callback: (success, ids) => {
          if (success) {
            const columnName = ids.length ? ids[0].columnName : '';
            this.setState({
              columnName,
              entityId: value,
              queryValue: '',
            })
          }
        },
      },
    })
  }

  handleQueryValueChange = (e) => {
    // const { ids = [] } = this.props.microPortrait;
    // const options = ids.map((item) => {
    //   const optionVal = `${item.columnTitle}:${value}`
    //   return (
    //     <Option
    //       // key={optionVal}
    //       key={item.id}
    //       value={optionVal}
    //     >
    //       {optionVal}
    //     </Option>
    //   )
    // })
    const { value } = e.target;
    this.setState({
      queryValue: value,
    })
  }

  handleSearch = (value) => {
    const { dispatch } = this.props;
    const { entityId, columnName } = this.state;

    message.destroy()
    message.config({top: 200, duration: 3})

    if (!value || !value.trim()) {
      message.error('查询内容不能为空');
      return false;
    }

    // if(columnName === 'khh'){
    //   let reg= /^[a-zA-Z0-9]{6}$/
    //   if(!reg.test(value)){
    //     message.error('请输入正确的客户号');
    //     return false;
    //   }
    // }

    if(columnName === 'id_card'){
      let reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/
      if(!reg.test(value)){
        message.error('请输入正确的身份证号');
        return false;
      }
    }

    if(columnName === 'phone_number'){
      let reg= /^[1][3,4,5,7,8][0-9]{9}$/
      if(!reg.test(value)){
        message.error('请输入正确的手机号');
        return false;
      }
    }

    if(columnName === 'iid'){
      let reg= /^[a-zA-Z0-9]{6}$/
      if(!reg.test(value)){
        message.error('请输入正确的产品id');
        return false;
      }
    }

    // const queryName = ids[0].columnName;
    const queryName = columnName;
    const queryValue = value.trim();
    dispatch({
      type: 'microPortrait/getSearchInfo',
      payload: {
        queryName,
        queryValue,
        entityId,
      },
    }).then(() => {
      const { searchInfo = [] } = this.props.microPortrait;
      if (searchInfo.length) {
        // history.push({
        //   pathname: '/portrait/profile',
        //   search: `id=${entityId}&sid=${searchInfo[0].super_id}`,
        // })
        window.open(`/#/portrait/profile?id=${entityId}&sid=${searchInfo[0].super_id}`);
      } else {
        message.error('查询信息在系统中不存在');
      }
    })
  }

  // handlePageChange = (queryName, option) => {
  //   debugger;
  //   const { history, dispatch } = this.props;
  //   const { entityId } = this.state;
  //   const queryValue = this.state.queryValue;

  //   dispatch({
  //     type: 'microPortrait/getSearchInfo',
  //     payload: {
  //       queryName,
  //       queryValue,
  //       entityId,
  //     },
  //   }).then(() => {
  //     const { searchInfo = [] } = this.props.microPortrait;

  //     console.log('searchInfo=====', searchInfo);
  //     if (searchInfo.length) {
  //       // history.push({
  //       //   pathname: '/portrait/profile',
  //       //   search: `id=${entityId}&sid=${searchInfo[0].super_id}`,
  //       // })
  //       window.open(`/#/portrait/profile?id=${entityId}&sid=${searchInfo[0].super_id}`);
  //     } else {
  //       message.error('查询失败');
  //     }
  //     // this.setState({
  //     //   queryValue: '',
  //     // })
  //   })
  // }


  // handleFocus = () => {
  //   const { queryValue } = this.state;
  //   // const { ids = [] } = this.props.microPortrait;
  //   if (!queryValue) {
  //     this.setState({
  //       options: [],
  //     })
  //   }
  // }

  handleColumnNameChange = (columnName) => {
    this.setState({
      columnName,
    })
  }


  render() {
    const { entityList = [], ids = [] } = this.props.microPortrait;
    const { entityId, columnName, queryValue } = this.state;

    let defaultEntityId = entityList.length ? entityList[0].id : 1;
    let defaultColumnName = ids.length ? ids[0].columnName : '';


    console.log('ids============', ids);
    console.log('columnName============', columnName);
    console.log('entityId============', entityId);


    return (
      <div className={styles.microPortrait}>
        <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '群组管理' }, { title: '微观画像查询' }]} />
        <div className={styles.content}>
          <Select
            style={{ width: 100, marginRight: 10 }}
            value={entityId || defaultEntityId}
            onChange={this.handleEntityIdChange}
          >
            {
              entityList.map((item, index) => {
                return <Option key={item.id} value={item.id}>{item.entityName}</Option>;
              })
            }
          </Select>

          <Select
            style={{ width: 120, marginRight: 10 }}
            value={columnName || defaultColumnName}
            onChange={this.handleColumnNameChange}
          >
            {
              ids.map((item, index) => {
                return <Option key={item.id} value={item.columnName}>{item.columnTitle}</Option>;
              })
            }
          </Select>

          <Search
            style={{ width: 400 }}
            placeholder="请输入查询内容"
            enterButton="查询"
            value={queryValue}
            onChange={this.handleQueryValueChange}
            onSearch={this.handleSearch}
          />
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    microPortrait: state.microPortrait,
  };
}

export default connect(mapStateToProps)(MicroPortrait);


// <Select
//            mode="combobox"
//            style={{ width: 300 }}
//            value={this.state.queryValue}
//            onFocus={this.handleFocus}
//            onChange={this.handleQueryValueChange}
//            filterOption={false}
//            placeholder='请输入查询内容'
//            onSelect={this.handlePageChange}
//          >
//            {this.state.options}
//          </Select>
//          <Button type='primary' onClick={this.handleSearch.bind(this, queryValue)}>查询</Button>