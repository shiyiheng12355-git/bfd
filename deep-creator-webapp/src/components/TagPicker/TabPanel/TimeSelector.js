import React, { Component } from 'react';
import { DatePicker, Row, Col, Select } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;
class TimeSelector extends Component {
    state = {
      value: 1,
    }
    render() {
      const timeCompare = [
        { name: '介于' },
        { name: '发生于', period: true, value: 1 },
        { name: '之前' },
        { name: '之后' },
      ];
      const { value } = this.state;
      return (
        <Row>
          <Col span={4}>
            <Select>{
                        timeCompare.map((cmp, index) => {
                            return <Option key={`cpm_${index}`}>{cmp.name}</Option>;
                        })
                    }
            </Select>
          </Col>
          <Col span={6}>
            {
                        value === 1 && <RangePicker />
                    }
            {
                        value !== 1 && <DatePicker />
                    }
          </Col>
        </Row>
      );
    }
}

export default TimeSelector;
