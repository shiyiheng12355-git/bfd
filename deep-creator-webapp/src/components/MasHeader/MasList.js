import React, { Component } from 'react';
import { Row, Col, Button, Card, Icon, Tooltip } from 'antd';
import { formatNumber,transTime } from '../../utils/utils';
import styles from './index.less';

const colorGroup = ['#f44336', '#f9ce1d', '#cddc39', '#20b6e5', '#37474f', '#f44336', '#f9ce1d', '#cddc39', '#20b6e5', '#37474f']
export default class MasList extends Component {
  render() {
    const colors = this.props.colorGroup || colorGroup
    const { mappingName, mappingDesc, dataList } = this.props
    return (
      <Row className={styles.MasList} gutter={16}>
        {
          mappingName && dataList.map((item, i) => {
            return (
              <Col span={parseInt(24 / dataList.length, 8)} key={i}>
                <Card title={<Tooltip title={mappingName[item.title]}>{mappingName[item.title]}</Tooltip> } extra={<Tooltip title={mappingDesc[item.title]}><Icon type="exclamation-circle-o" /></Tooltip>} style={{ background: colors[i] }}>
                  <div>{item['title']==='avgVisitorTime'?transTime(item.value):(item['title'].indexOf('Rate')!= -1?`${(item.value*100).toFixed(2)}%`:formatNumber(item.value))}</div>
                </Card>
              </Col>
            )
          })
        }
      </Row>
    )
  }
}