import React, { PureComponent } from 'react'
import { Input } from 'antd';
const InputGroup = Input.Group;
import styles from './index.less';

export default class Range extends React.Component {

  state = this.init(this.props);

  componentWillReceiveProps(nextProps) {
    this.setState(this.init(nextProps));
  }

  init(props){
    let _state = {
      gte: '',
      lte: ''
    }
    if (!!props.value.trim()) {
      const a = props.value.split('~');
      _state = {
        gte: a[0],
        lte: a[1]
      }
    }
    return _state;
  }

  gteChange({ target }) {
    let value = target.value;
        value = value.replace(/[^\d.]/g, '');

    this.setState({ gte: value }, () => {
      this.transmit();
    });
  }

  lteChange({ target }) {
    let value = target.value;
        value = value.replace(/[^\d.]/g, '');
    this.setState({ lte: value }, () => {
      this.transmit();
    });
  }

  transmit() {
    const { gte, lte } = this.state;
    this.props.onChange && this.props.onChange(gte+'~'+lte);
  }
  

  render() {
    const { gte, lte } = this.state;
    //console.log(this.state,'.......')
    return (
      <InputGroup className={styles.inputGroup} compact>
        <Input style={{ width: '60px' }} value={gte} size="small" onChange={::this.gteChange}/>
        <Input style={{ width: '60px' }} value={lte} size="small" onChange={::this.lteChange}/>
      </InputGroup>
    )
  }
}