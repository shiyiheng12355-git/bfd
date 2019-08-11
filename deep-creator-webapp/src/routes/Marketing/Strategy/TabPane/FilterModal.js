import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Radio, Form, Modal } from 'antd';

const FormItem = Form.Item;

@Form.create()
class FilterModal extends Component {
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.firstColumns = values.firstColumns;
        values.secondColumns = values.secondColumns;
        this.props.onOk(values);
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, groupColumns, formatColumn } = this.props;
    const { fromColumns, toColumns } = groupColumns;

    return (
      <Modal
        title='自定义指标'
        {...this.props}
        onOk={this.handleOk}
        maskClosable={false}
      >
        <Form>
          {fromColumns &&
            <FormItem label='推荐对象群'>
              {
                getFieldDecorator('firstColumns', {
                  initialValue: formatColumn.firstColumns,
                  rules: [{ required: true, message: '必填字段' }],
                })(
                  <Checkbox.Group>
                    {
                      Object.keys(fromColumns).map((en) => {
                        const chn = fromColumns[en];
                        return <Checkbox key={en} value={en}>{chn}</Checkbox>;
                      })
                    }
                  </Checkbox.Group>
                  )
              }
            </FormItem>
          }
          {toColumns &&
            <FormItem label='推荐内容群'>
              {
                getFieldDecorator('secondColumns', {
                  initialValue: formatColumn.secondColumns,
                  rules: [{ required: true, message: '必填字段' }],
                })(
                  <Radio.Group>
                    {
                      Object.keys(toColumns).map((en) => {
                        const chn = toColumns[en];
                        return <Radio key={en} value={en}>{chn}</Radio>;
                      })
                    }
                  </Radio.Group>
                  )
              }
            </FormItem>
          }
        </Form>
      </Modal>
    );
  }
}

FilterModal.propTypes = {

};

export default FilterModal;