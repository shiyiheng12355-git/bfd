import React, { PureComponent } from 'react'
import { Input } from 'antd';
const InputGroup = Input.Group;
import styles from './index.less';

export default class RangeInput extends React.Component {

  state = {
    gte: null,
    lte: null
  }
  
  componentWillReceiveProps(nextProps){
    const gte = nextProps && nextProps.value && nextProps.value.gte;
    const lte = nextProps && nextProps.value && nextProps.value.lte;
    this.setState({ gte, lte });
  }

  gteChange({ target }){
    this.setState({ gte: Number(target.value) },()=>{
      this.transmit();
    });
  }

  lteChange({ target }){
    this.setState({ lte: Number(target.value) },()=>{
      this.transmit();
    });
  }

  transmit(){
    this.props.onChange &&
    this.props.onChange({ ...this.state });
  }
  
  render() {
    const { gte, lte } = this.state;
    return (
      <InputGroup className={styles.inputGroup} compact>
        <Input style={{ width: '80px' }} value={gte} size="small" onChange={::this.gteChange}/>
        <Input style={{ width: '80px' }} value={lte} size="small" onChange={::this.lteChange}/>
      </InputGroup>
    )
  }
}