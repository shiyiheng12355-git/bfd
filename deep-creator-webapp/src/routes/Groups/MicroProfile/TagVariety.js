import React, { Component } from 'react';
import { DatePicker, Timeline, Row, Col, Button } from 'antd';
import uuid from 'uuid';
import styles from './TagVariety.less'


const { RangePicker } = DatePicker;
const TimelineItem = Timeline.Item;
const uuidv4 = uuid.v4;
class TagVariety extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  handleChange = (value, dateString) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
  }

  handleOk = (value) => {
    console.log('onOk: ', value);
  }


  render() {
    return (

      <div style={{ marginTop: 10 }} className={styles.tagVariety}>
        <h4 >用户标签变化</h4>
        <div style={{ display: 'flex' }}>
          <div style={{ lineHeight: '32px' }}>自定义时间段:</div> &nbsp;&nbsp;
          <RangePicker
          style={{ width: 195 }}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          placeholder={['Start Time', 'End Time']}
          onChange={this.handleChange}
          onOk={this.handleOk}
        />
        </div>

        <Timeline style={{ padding: '10px 0 10px 30px' }}>
          <Row >
            <Col span={4} style={{ top: '15px' }}>2018-01-11 下午3:37:46</Col>
            <Col span={20}>
              <TimelineItem>Create a services site 2015-09-01</TimelineItem>
            </Col>
          </Row>

          <Row >
            <Col span={4} style={{ top: '15px' }}>2018-01-11 下午3:37:46</Col>
            <Col span={20}>
              <TimelineItem>Create a services site 2015-09-01</TimelineItem>
            </Col>
          </Row>

          <Row >
            <Col span={4} style={{ top: '15px' }}>2018-01-11 下午3:37:46</Col>
            <Col span={20}>
              <TimelineItem
                last='true'
                dot={<span style={{ backgroundColor: '#d7d7d7' }}>2018-01-11</span>}
              >
                Create a services site 2015-09-01
               </TimelineItem>
            </Col>
          </Row>
        </Timeline>
        <Button>加载更多</Button>
      </div>

    );
  }
}


export default TagVariety;

