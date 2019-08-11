import React, { Component, PropTypes } from 'react';
import { Row, Col, Card, Button, Spin, Pagination } from 'antd';
import classnames from 'classnames';
import styles from './index.less';
import { formatNumber } from '../../utils';

const ROW_NUM = 4;
class GroupList extends Component {
  state = {
    showRest: false,
    page:1
  }

  onSelect = (group) => {
    if (this.props.onChange) { this.props.onChange(group); }
  }

  toggleShowRest = () => {
    const { showRest } = this.state;
    this.setState({ showRest: !showRest });
  }

  renderRow = (groups) => {
    const { value, numLoading } = this.props;
    return groups && groups.length > 0 && groups.map((group, index) => {
      const cardStyle = classnames({
        [styles.selected]: value && (value.id === group.id) ? styles.selected : false,
        [styles.groupCard]: true,
      });
      if (!group.configValue) group.userNum = group.customerNum;

      return (
        <Col span={24 / ROW_NUM} key={index} onClick={this.onSelect.bind(null, group)}>
          <Card className={cardStyle}>
            <h4>{group.groupName}</h4>
            <div>用户数： {
              numLoading && <Spin />
            }
              {
                !numLoading && (group.userNum === -1 ? '加载中...' : formatNumber(group.userNum))
              }
            </div>
            {
              group.configValue && group.configValue !== '' &&  group.configValueName !== '' ? <div>{group.configValueName}数：
              {
                  numLoading && <Spin />
                }
                {
                  !numLoading && (group.customerNum === -1 ? '加载中...' : formatNumber(group.customerNum))
                }
              </div> : ''
            }
          </Card>
        </Col>);
    });
  }
  pageChange=(page,pageSize)=>{
    const { groupData,pageChange } = this.props;
    this.setState({
      page:page
    })
    const firstRow = groupData && groupData.length > 0 && groupData.slice((page-1)*ROW_NUM, page*ROW_NUM);
    // console.log(firstRow)
    pageChange && pageChange(firstRow,page)
  }
  render() {
    const { showRest,page } = this.state;
    const { groupData,current } = this.props; // numLoading

    const firstRow = groupData && groupData.length > 0 && groupData.slice(((current||page)-1)*ROW_NUM, (current||page)*ROW_NUM); // 默认展示第一行
    // const restRow = groupData && groupData.length > 0 && groupData.slice(ROW_NUM);

    return (
      <div>
      <Row gutter={16}>
        {
          this.renderRow(firstRow)
        }
        {
          showRest && this.renderRow(restRow)
        }

        {/*
          restRow.length &&
          <Col span={24} className={styles.moreBtnRow}>
            <Button
              shape="circle"
              size="small"
              icon={showRest ? 'up' : 'down'}
              onClick={this.toggleShowRest}
            />
          </Col>
        */}
      </Row>
      <Pagination current={current||page} pageSize={ROW_NUM} onChange={this.pageChange} total={groupData.length||0} />
      </div>
    );
  }
}

GroupList.propTypes = {
};

export default GroupList;
