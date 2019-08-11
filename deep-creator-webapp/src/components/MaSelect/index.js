import React, { Component } from 'react';
import { Row, Col, Button, Checkbox } from 'antd';
import classnames from 'classnames';
import styles from './index.less';

/* window.addEventListener('click', (event) => {
  console.log(event)
}) */
const CheckboxGroup = Checkbox.Group;
export default class MaSelect extends Component {
  state = {
    visible: false,
    checkedGroup: [],
    showName: '',
  }
  componentWillMount() {
    if (this.props.type === 'table') {
      this.setState({
        checkedGroup: this.props.value,
        showName: '自定义指标',
      })
    } else if (this.props.type === 'charts') {
      const temp = []
      this.props.checkGroup && this.props.checkGroup.map((item) => {
        item.checkData.map((groups) => {
          if (this.props.value.indexOf(groups.value) !== -1) {
            temp.push(groups.label)
          }
        })
        return temp
      })
      this.setState({
        checkedGroup: this.props.value,
        showName: temp.join('，'),
      })
    } else if (this.props.type === 'filter') {
      this.setState({
        checkedGroup: this.props.value,
        showName: this.props.showName,
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.type === 'table') {
      this.setState({
        checkedGroup: nextProps.value,
        showName: '自定义指标',
      })
    } else if (nextProps.type === 'charts') {
      const temp = []
      nextProps.checkGroup && nextProps.checkGroup.map((item) => {
        item.checkData.map((groups) => {
          if (nextProps.value.indexOf(groups.value) !== -1) {
            temp.push(groups.label)
          }
        })
        return temp
      })
      this.setState({
        checkedGroup: nextProps.value,
        showName: temp.join('，'),
      })
    } else if (this.props.type === 'filter') {
      this.setState({
        checkedGroup: this.props.value,
        showName: this.props.showName,
      })
    }
  }

  /**
  * checkedValue 为当前checkGroup上次的值，group为本次的值
  */
  onChange = (checkedValue, group) => {
    const { limit, checkGroup } = this.props;
    let groupOld = this.state.checkedGroup;
    let temps = [];
    //找出正在操作的数组
    for(let i in checkGroup){
      let flag = false;
      let groupTemp = checkGroup[i];
      let gcDatas = groupTemp.checkData;
      for(let g in gcDatas){
        let v = gcDatas[g].value;
        if(group.includes(v)){
          temps = gcDatas;
          flag = true;
          break;
        }
      }
      if(flag) {
        break;
      }
    }
    //循环temps中的数据，group和old中存在，不做操作；
    //old中不存在且group存在，添加到old中；old中存在而group不存在，从old中删除
    for(let i in temps){
      let temp = temps[i].value;
      if(group.includes(temp) && !groupOld.includes(temp)){
        groupOld.push(temp);
      } else if (!group.includes(temp) && groupOld.includes(temp)){
        groupOld.splice(groupOld.indexOf(temp),1);
      }
    }

    //本次修改后值为空，则从选择列表中删除checkedValue的值
    if((!group || group.length < 1) && checkedValue && checkedValue.length > 0 ){
      for(let i in checkedValue){
        groupOld.splice(groupOld.indexOf(checkedValue[i]),1);
      }
    }

    if (groupOld.length > limit) {
      groupOld = groupOld.splice(1)
    }

    this.setState({ checkedGroup: groupOld })
  }

  onOK = () => {
    this.props.onChange({
      status: 'ok',
      checked: this.state.checkedGroup,
    })
    this.setState({ visible: false })
  }

  onCancel = () => {
    this.setState({
      visible: false,
      checkedGroup: this.props.value,
    })
  }

  handleCheck = () => {
    const { visible } = this.state
    this.setState({ visible: !visible })
  }

  renderSelect = (list) => {
    const { visible, showName } = this.state
    const { value, checkGroup } = list
    return (
      <div>
        {
          list.label ? <span>{list.label}：</span> : ''
        }
        <Button disabled={!value && !checkGroup} onClick={this.handleCheck}>{showName || '暂无数据'}</Button>
        {
          visible ? this.renderCheck(list) : ''
        }
        {this.props.extra}
      </div>
    )
  }

  renderCheck = (list) => {
    const { checkedGroup } = this.state;
    return (
      <Row className={styles.selectModal}>
        <Col span={20}>
          {
            list.checkGroup && list.checkGroup.map((groups, index) => {
              let labelCheckedValue = [];
              for(let i in groups.checkData){
                if(checkedGroup.includes(groups.checkData[i].value)){
                  labelCheckedValue.push(groups.checkData[i].value);
                }
              }
              
              return (
                <div key={index}>
                  <label>{groups.label}：</label>
                  <CheckboxGroup value={labelCheckedValue} className={styles.checkGroup} 
                    options={groups.checkData} 
                    onChange={this.onChange.bind(this, labelCheckedValue)} />
                </div>
              )
            })
          }
        </Col>
        <Col span={4}>
          <div>
            <Button className={styles.onOK} onClick={this.onOK}>确定</Button>
            <Button onClick={this.onCancel}>取消</Button>
          </div>
          <div className={styles.tips}>可同时选{list.limit}项</div>
        </Col>
      </Row>
    )
  }
  render() {
    return (
      <div style={this.props.style} className={styles.MaSelect}>
        { this.renderSelect(this.props) }
      </div>
    )
  }
}