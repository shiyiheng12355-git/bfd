import React, { PureComponent } from 'react'
import { connect } from 'dva'
import PageHeaderLayout from '../../layouts/PageHeaderLayout'
import TagTree from './TagTree'
import { Spin } from 'antd'

@connect(state => ({
  loading: state.LOADING,
  user: state.user,
}))
export default class Tags extends PureComponent {
  render() {
    let title = '';
    const { params } = this.props.match;
    const { loading, user } = this.props;
    user && user.menus && user.menus.length > 0 && user.menus.map((item) => {
      if (item.resourceUrl === `/tags/${params.id}`) title = item.resourceTitle;
    });
    //为编辑模式 增加来源哪个实体
    const TagTreeProps = {
      location:this.props.location
    }
    // console.log(user.menus)
    return (
      <div>
        {title ? <PageHeaderLayout breadcrumbList={[{ title: '首页', href: '/' }, { title: '标签管理' }, { title }]} /> : <PageHeaderLayout />}
        {params && params.id
          ? (<TagTree entityId={Number(params.id)} {...TagTreeProps}/>)
          : null}
        <Spin spinning={loading.global} tip="Loading..." style={{ position: 'fixed', margin: 'auto', top: '30%', left: 0, right: 0, zIndex: 100 }} />
      </div>
    );
  }
}
