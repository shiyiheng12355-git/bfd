import React from 'react';
import styles from './index.less';
import { Table } from 'antd';
import { TweenOneGroup } from 'rc-tween-one';

class AnimateTable extends React.Component {

  static defaultProps = {
    className: 'table-enter-leave-demo',
  }

  constructor(props) {
    super(props)
    this.state = {
      currentPage: 1,
      page: 1,
    }

    // 入场动画
    this.enterAnim = [
      {
        opacity: 0, x: 30, backgroundColor: '#fffeee', duration: 0,
      },
      {
        height: 0,
        duration: 200,
        type: 'from',
        delay: 250,
        ease: 'easeOutQuad',
        onComplete: this.onEnd,
      },
      {
        opacity: 1, x: 0, duration: 250, ease: 'easeOutQuad',
      },
      { delay: 1000, backgroundColor: 'transparent' },
    ]

    // 出场动画
    this.leaveAnim = [
      { duration: 250, opacity: 0 },
      { height: 0, duration: 200, ease: 'easeOutQuad' },
    ]
  }

  getBodyWrapper = (body) => {
    // 切换分页去除动画
    let { currentPage, page } = this.state
    if (page !== currentPage) {
      this.setState({ page: currentPage })
      return body
    }

    return (
      <TweenOneGroup
        component="tbody"
        className={body.props.className}
        enter={this.enterAnim}
        leave={this.leaveAnim}
        appear={false}
        exclusive
      >
        {body.props.children}
      </TweenOneGroup>
    )
  }

  // 入场动画结束回调
  onEnd = (e) => {
    const dom = e.target
    dom.style.height = 'auto'
  }

  // 分页
  pageChange = (pagination) => {
    this.setState({
      currentPage: pagination.current
    })
  }

  render() {
    const { data } = this.state
    const { className, bordered, columns, pagination, dataSource } = this.props

    return ( 
      <div className={styles.AnimateTable}>
        <Table
          bordered
          columns={columns}
          pagination={pagination}
          dataSource={dataSource}
          className={`${className}-table`}
          getBodyWrapper={this.getBodyWrapper}
          // components={{ body }}
          onChange={this.pageChange}
          locale={{emptyText: '暂未添加'}}
        />
      </div>
    )
  }
}

export default AnimateTable
