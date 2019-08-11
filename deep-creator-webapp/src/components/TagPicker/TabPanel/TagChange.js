import React, { Component, PropTypes } from 'react';
import { Form } from 'antd';
import TimeSelector from './TimeSelector';

const FormItem = Form.Item;
@Form.create()
class TagChange extends Component {
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { customTags } = this.props;
    return (
      <Form>
        <FormItem label="标签变化时间"><TimeSelector /></FormItem>
        <FormItem label="标签变化时间"><TimeSelector /></FormItem>
      </Form>);
  }
}

TagChange.propTypes = {
};

export default TagChange;
