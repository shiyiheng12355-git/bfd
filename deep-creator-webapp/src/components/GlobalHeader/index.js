import React, { PureComponent } from 'react';
import { Layout, Menu, Icon, Spin, Tag, Dropdown, Avatar, Divider } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import { Link, routerRedux } from 'dva/router';
import styles from './index.less';

const { Header } = Layout;


@connect(state => ({
  user: state.user,
}))
export default class GlobalHeader extends PureComponent {
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetchCurrent',
      callback: (currentUser) => {
        dispatch({
          type: 'user/fetchPostList',
          callback: (list) => {
            let a = [];
            let flag = false;
            list && list.length > 0 && list.map((item) => {
              if (item.enableStatus === 1) a.push(item);
              if (item.id === currentUser.postId) flag = true;
            });
            if (!flag && a.length>0) this.changePost(a[0]);
          },
        })
      },
    });
  }
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  }
  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  changePost(item) {
    const { dispatch } = this.props;
    // console.log(item.id)
    dispatch({
      type: 'user/changePost',
      payload: {
        postId: item.id,
      },
      callback: () => {
        dispatch({
          type: 'user/fetchMenus',
          callback: () => {
            dispatch(routerRedux.push({
              pathname: '/',
            }))
          },
        })
      },
    })
  }

  render() {
    const {
      currentUser, collapsed, isMobile, logo, onMenuClick, user,
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        {
          user && user.postList && user.postList.length > 0 && user.postList.map((item, i) => {
            return (<Menu.Item key={i} className={currentUser.postId === item.id ? styles.selected : ''}>
              <div onClick={() => this.changePost(item)}>{item.postName}</div>
            </Menu.Item>)
          })
        }
        <Menu.Divider />
        <Menu.Item><Link to="/userconfig/personalcenter"><Icon type="user" />个人中心</Link></Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout"><Icon type="logout" />退出登录</Menu.Item>
      </Menu>
    );

    return (
      <Header className={styles.header}>
        {isMobile && (
          [
            (
              <Link to="/" className={styles.logo} key="logo">
                <img src={logo} alt="logo" width="32" />
              </Link>
            ),
            <Divider type="vertical" key="line" />,
          ]
        )}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <div className={styles.right}>
          {currentUser.userName ? (
            <Dropdown overlay={menu}>
              <span className={`${styles.action} ${styles.account}`}>
                <Avatar size="small" className={styles.avatar} src={currentUser.avatar || '/imgs/BiazfanxmamNRoxxVxka.png'} />
                <span className={styles.name}>{currentUser.userName}</span>
              </span>
            </Dropdown>
          ) : <Spin size="small" style={{ marginLeft: 8 }} />}
        </div>
      </Header>
    );
  }
}
