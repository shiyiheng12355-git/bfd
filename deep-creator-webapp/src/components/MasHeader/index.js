import React, { Component } from 'react';
import { Row, Col, Button, DatePicker, Checkbox, Card, Icon } from 'antd';
import moment from 'moment';
import MasTitle from './MasTitle';
import MasDatePicker from './MasDatePicker';
import MasList from './MasList'
import MasGranularity from './MasGranularity'
import MasFilterParams from './MasFilterParams'
import styles from './index.less';


/* const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const colorGroup = ['#f44336', '#f9ce1d', '#cddc39', '#20b6e5', '#37474f'] */
class MasHeader extends Component {
  /* renderGroup = (dataList) => {
    const colors = this.props.colorGroup || colorGroup
    return dataList.map((item, i) => {
      return (
        <Col span={parseInt(24 / dataList.length, 8)} key={i}>
          <Card title={item.title} extra={<Icon type="exclamation-circle-o" />} style={{ background: colors[i] }}>
            <div>{formatNumber(item.value)}</div>
          </Card>
        </Col>
      )
    })
  } */

  render() {
    return (
      <Row className={styles.masHeader}>
        <Col span={24}>
          <MasTitle {...this.props} />
        </Col>
        <MasDatePicker {...this.props} />
        <MasList {...this.props} />
      </Row>
    )
  }
}
export { MasHeader, MasTitle, MasDatePicker, MasList, MasGranularity, MasFilterParams }