import React, { PureComponent } from 'react'
import { Row, Col, Icon, Button, Modal, AutoComplete, Progress, Input } from 'antd'
import { connect } from 'dva'

import styles from './index.less'

@connect(state => ({
  tags: state['tags/tags'],
  LOADING: state.LOADING,
}))
export default class AutoComp extends PureComponent {
  state = {
    open: false,
    AutoValue: '',
    searchValue: '', // 搜索框值
    isSearch: false, // 是否可以搜索
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entityId !== this.props.entityId) {
      this.setState({ AutoValue: '' });
    }
  }

  // 标签名称模糊搜索 选择
  handleSelect = (value) => {
    this.setState({ searchValue: value, isSearch: true, AutoValue: value })
  }

  handleChangeAuto = (value) => {
    this.setState({ AutoValue: value });
  }

  // 标签名称模糊搜索 输入
  handleSearch = (value) => {
    const { dispatch, entityId } = this.props;
    clearTimeout(this.searchtimer);
    this.searchtimer = setTimeout(function(){
      dispatch({
        type: 'tags/tags/fetchKeySearch',
        payload: { entityId, value },
        callback: () => {
        }
      })
    }, 800);
    
  }

  // 标签名称模糊搜索 搜索
  treeListSearch = () => {
    this.expandedKeysByMine = false

    const { dispatch, entityId } = this.props
    dispatch({
      type: 'tags/tags/fetchSearch',
      payload: { entityId, value: this.state.searchValue },
    })

    this.setState({ searchValue: '', isSearch: false, expandedKeys: [], expandAll: true })
  }

  clearTree = () => {
    this.setState({ AutoValue: '' });
    this.props.clearTree();
  }

  render() {
    const { tags, entityId, loading } = this.props;
    return (
        <div className={styles.autoCompTagTree}>
          标签搜索：
          <AutoComplete
            className="global-search"
            value={this.state.AutoValue}
            dataSource={tags.dataSource}
            onSelect={this.handleSelect}
            onSearch={this.handleSearch}
            onChange={this.handleChangeAuto}
          />
          <Button className="search-btn" type="primary" disabled={!this.state.isSearch} onClick={this.treeListSearch}><Icon type="search" /></Button>
          <Button type="primary" onClick={this.clearTree} style={{marginLeft: 10}}>返回</Button>
        </div>
    );
  }
}
