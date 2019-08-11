import React, { PureComponent } from 'react'
import { Input, Select, Checkbox, Radio} from 'antd'
import Range from './Range'

const Option = Select.Option

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export default class EditableCell extends React.Component {

  state = {
    value: this.props.value,
    editable: this.props.editable || false,
  }

  componentWillReceiveProps(nextProps) {
    this.setState({value:nextProps.value});
    if (nextProps.editable !== this.state.editable) {
      this.setState({ editable: nextProps.editable });
    }
    if (nextProps.status && nextProps.status !== this.props.status) {
      if (nextProps.status === 'save') {
        this.props.onChange(this.state.value);
      }
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
    //console.log(nextProps, nextState, this.state, 'haha...');
    // return !(nextProps.editable !== this.state.editable ||
    //   nextState.value !== this.state.value);
  // }

  handleChange(e) {
    const value = `${e.target.value}`;
    this.setState({ value });
    if (typeof this.props.onChange == 'function') this.props.onChange(value);
  }

  handleSelectChange(value){
    this.setState({ value });
    if (typeof this.props.onChange == 'function') this.props.onChange(value);
    if (typeof this.props.onSelectChange == 'function') this.props.onSelectChange();
  }

  handleCheckboxChange(e){
    const value = e.target.checked;
    this.setState({ value });
  }

  rangeChange(value){
    this.setState({ value });
    if (typeof this.props.onChange == 'function') this.props.onChange(value);
  }

  radioChange({target}){
    this.setState({ value: `${target.value}`});
    if (typeof this.props.onChange == 'function') this.props.onChange(`${target.value}`);
  }

  render() {
    const { value, editable } = this.state;
    const { itemType, itemData, tz } = this.props;
    let temp;
    switch (itemType) {
      case 'select':
        temp = (
          <Select size="small" style={{ width: 120 }} value={value} onChange={::this.handleSelectChange}>
            { itemData.map((item) => <Option key={item.value} value={item.value}>{item.option}</Option>) }
          </Select>
        ) 
        break;
      default:
        if(tz == 'int'){
          temp = <Range value={value} onChange={::this.rangeChange} />
        }else if(tz=='boolean'){
          temp =(
            <RadioGroup size="small" onChange={::this.radioChange} value = {value||"false"}>
              <RadioButton value="true">true</RadioButton>
              <RadioButton value="false">false</RadioButton>
            </RadioGroup>
          )  
        }else if(tz == 'string'){
          temp = <Input value={value} size="small" onChange={e => this.handleChange(e)} />
        }
        break;
    }
    if (itemType == 'checkbox'){
      return <Checkbox checked={value} disabled={!editable} onChange={::this.handleCheckboxChange}> { itemData }</Checkbox>
    }
    return (
      <div>{editable ? (<div>{temp}</div>) : (<div className="editable-row-text">{value ? value.toString() : (tz == 'boolean' ? 'false' :'')}</div>)}</div>
    )
  }
}
