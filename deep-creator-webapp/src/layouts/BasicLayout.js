import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon, Modal, Select, Form, Button, message } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import uuid from 'uuid';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../routes/Exception/404';
import './BasicLayout.less';
import { getRoutes, arrayToTree } from '../utils/utils';
import Authorized from '../utils/Authorized';
import { getMenuData } from '../common/menu';
import { convertRouterData, getRedirectData, isOuterLink } from '../common/router';
import Enshirne from '../components/Enshirne';
import logo from '../assets/logo.svg';

const { Content } = Layout;
const { AuthorizedRoute } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = getRedirectData();
// const getRedirect = (item) => {
//   if (item && item.children) {
//     if (item.children[0] && item.children[0].path) {
//       redirectData.push({
//         from: `/${item.path}`,
//         to: `/${item.children[0].path}`,
//       });
//       item.children.forEach((children) => {
//         getRedirect(children);
//       });
//     }
//   }
// };
// getMenuData().forEach(getRedirect);

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

@Form.create()
class ChosePostModal extends PureComponent {
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchPostList',
    });
  }

  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (err) { return }
      this.props.onOk(values);
    });
  }
  render() {
    const { postList = [], visible } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (<Modal
      title='岗位选择'
      onOk={this.handleOk}
      visible={visible}
      footer={null}
      closable={false}
      maskClosable={false}>
      <Form onSubmit={this.handleSubmit}>
        <div>当前登录用户拥有多个岗位，请选择一个岗位登录</div>
        <Form.Item>
          {
            getFieldDecorator('postId', {
              rules: [{ required: true, message: '必填字段' }],
            })(
              <Select style={{ width: '200px' }}
                placeholder='请选择岗位'
              >{
                  postList.map((post) => {
                    return <Select.Option key={post.id} value={post.id}>{post.postName}</Select.Option>
                  })
                }</Select>)
          }
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>确定</Button>
        </Form.Item>
      </Form>
    </Modal>);
  }
}
let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  }
  state = {
    isMobile,
    menuData: [],
    routerData: null,
  };
  getChildContext() {
    const { location } = this.props;
    const breadcrumbNameMap = { ...this.state.routerData, ...redirectData };// 面包屑路由配置
    return {
      location,
      breadcrumbNameMap,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { menus } = nextProps;
    if (menus && menus !== this.props.menus) {
      // console.log('rrr')
      // console.log(menus)
      // menus[4].resourceUrl = '/approval'
      const menuData = this.convertMenuData(menus);
      const routerData = convertRouterData(this.props.routerData, menus);
      this.setState({ menuData, routerData });
    }
  }

  componentDidMount() {
    // enquireScreen((mobile) => {
    //   this.setState({
    //     isMobile: mobile,
    //   });
    // });
  }

  convertMenuData = (menus) => {
    return arrayToTree(menus.filter(menu => !!menu.resourceUrl).map(
      (menu) => {
        const formathPath = menu.resourceUrl.replace(/^\//, '').replace(/\/$/, '');
        if (menu.resourceKey === 'xtgl') {
          menu.icon = 'setting';
        } else if (menu.resourceKey === 'qxgl') {
          menu.icon = 'user';
        } else if (menu.resourceKey === 'bqgl') {
          menu.icon = 'tags';
        } else if (menu.resourceKey === 'qzgl') {
          menu.icon = 'usergroup-add';
        } else if (menu.resourceKey === 'wdsc') {
          menu.icon = 'star';
        } else if (menu.resourceKey === 'bbgl') {
          menu.icon = 'area-chart';
        } else if (menu.resourceKey === 'yxcj') {
          menu.icon = 'profile';
        } else if (menu.resourceType === 1 && menu.resourceSign === 2) { // 用户自己定义的一级菜单
          menu.icon = 'global';
        }
        const item = {
          name: menu.resourceTitle,
          path: isOuterLink(menu) ? `/sites/${menu.resourceKey}` : formathPath, // from /a/b to a/b
          key: isOuterLink(menu) || formathPath,
          authority: undefined,
          ...menu,
        }
        if (menu.resourceUrl === '/enshirne' && !this.props.collapsed) { // 特殊处理
          item.name = (<Enshirne name={menu.resourceTitle}
            type="add"
            onChange={this.enshirneChange} />)
        }
        if (menu.resourceUrl !== '/enshirne' && menu.resourceUrl.startsWith('/enshirne') && !this.props.collapsed) {
          item.name = (<Enshirne name={menu.resourceTitle}
            type="del"
            resourceUrl={menu.resourceUrl}
            onChange={this.enshirneChange} />)
        }
        return item;
      }),
      'resourceKey', 'parentResourceKey')
  }

  componentWillMount() {
    this.init();
  }

  enshirneChange = () => {
    this.init();
  }

  init = () => {
    this.props.dispatch({
      type: 'user/fetchCurrent',
      payload: {},
      callback: (user) => {
        if (user.postId) {
          this.props.dispatch({
            type: 'user/fetchMenus',
            payload: {},
          });
        }
        // else{
        //   this.props.dispatch({ // 查询所有岗位
        //     type: 'user/fetchPostList',
        //     payload: {},
        //     callback: (postList) => {
        //       if(postList && postList[0]){
        //         this.props.dispatch({ // 默认切换第一个岗位
        //           type: 'user/changePost',
        //           payload: { postId: postList[0].id },
        //           callback: () => {
        //             this.props.dispatch({ // 查询导航
        //               type: 'user/fetchMenus',
        //               callback: () => {
        //                 this.props.dispatch(routerRedux.push({
        //                   pathname: '/',
        //                 }))
        //               },
        //             })
        //           },
        //         });
        //       }
        //     }
        //   });
        // }
      },
    });
  }

  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = '南方基金标签画像系统';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - 南方基金标签画像系统`;
    }
    return title;
  }
  handleMenuCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  }
  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }
  handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      this.props.dispatch({
        type: 'login/logout',
      });
    }
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }

  getDefaultRedirect = (menuData) => {
    let a = [];
    menuData && menuData.length > 0 && menuData.map((item) => {
      if (item.children && item.children.length > 0) a.push(item.children[0].path);
    })
    return a;
  }

  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, match, location, menus,
    } = this.props;

    const { routerData, menuData } = this.state;

    if (!routerData) return false;

    const hasMenu = !!menuData.length;

    const redirect = this.getDefaultRedirect(menuData);
    const IframeLayout = routerData['/sites'].component; // Iframe框架
    const hasOuterLink = !!Object.keys(routerData).find(key => !!routerData[key].src);

    const layout = (
      <Layout>
        {hasMenu &&
          <SiderMenu
            logo={logo}
            // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
            // If you do not have the Authorized parameter
            // you will be forced to jump to the 403 interface without permission
            Authorized={Authorized}
            menuData={menuData}
            collapsed={collapsed}
            location={location}
            isMobile={this.state.isMobile}
            onCollapse={this.handleMenuCollapse}
          />
        }
        <Layout>
          <GlobalHeader
            logo={logo}
            currentUser={currentUser}
            fetchingNotices={fetchingNotices}
            notices={notices}
            collapsed={collapsed}
            isMobile={this.state.isMobile}
            onNoticeClear={this.handleNoticeClear}
            onCollapse={this.handleMenuCollapse}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
          />
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            <div style={{ minHeight: 'calc(100vh - 260px)' }}>
              <Switch>
                <Route exact path="/config/global/baseconfig" component={routerData['/config/global/baseconfig'].component} />
                <Route exact path="/config/global/detailconfig" component={routerData['/config/global/detailconfig'].component} />
                <Route exact path="/config/global/apiconfig" component={routerData['/config/global/apiconfig'].component} />
                <Route exact path="/config/global/paramconfig" component={routerData['/config/global/paramconfig'].component} />
                <Route exact path="/config/global/organizeconfig" component={routerData['/config/global/organizeconfig'].component} />
                <Route exact path="/jurisdiction/template/modelConfig" component={routerData['/jurisdiction/template/modelConfig'].component} />
                <Route exact path="/config/coding/:id" component={routerData['/config/coding/:id'].component} />
                <Route exact path="/marketing/automation/:id" component={routerData['/marketing/automation/:id'].component} />
                <Route exact path="/marketing/recommendation/:fieldId" component={routerData['/marketing/recommendation/:fieldId'].component} />
                <Route exact path="/groups/microPortrait" component={routerData['/groups/microPortrait'].component} />
                <Route exact path="/report/funnel/detail" component={routerData['/report/funnel/detail'].component} />
                <Route exact path="/jurisdiction/postManage/add" component={routerData['/jurisdiction/postManage/add'].component} />
                <Route exact path="/jurisdiction/postManage/postDetail/:type/:record" component={routerData['/jurisdiction/postManage/postDetail/:type/:record'].component} />
                {hasOuterLink &&
                  <AuthorizedRoute
                    path="/sites/:key"
                    render={(props) => {
                      return <IframeLayout {...props} router={routerData} />
                    }}
                    authority=""
                  />
                }
                {
                  getRoutes(match.path, routerData).map((item) => {
                    return (
                      <AuthorizedRoute
                        key={item.key || uuid.v1()}
                        path={item.path}
                        component={item.component}
                        exact={item.exact}
                        authority={item.authority}
                        redirectPath="/exception/403"
                      />
                    )
                  })
                }
                {redirect && redirect.length > 0 ? (<Redirect exact from="/" to={redirect[0]} />) : null}
                <Redirect exact from="/enshirne" to="/collect/add" />
                {/* <Route render={NotFound} /> */}
              </Switch>
            </div>
            <GlobalFooter
              links={[{
                href: 'https://github.com/ant-design/ant-design-pro',
                blankTarget: true,
              }, {
                key: 'github',
                title: <Icon type="github" />,
                href: 'https://github.com/ant-design/ant-design-pro',
                blankTarget: true,
              }, {
                key: 'Ant Design',
                title: 'Ant Design',
                href: 'http://ant.design',
                blankTarget: true,
              }]}
              //  copyright={
              //   <div>
              //     <Icon type="copyright" /> 2018 百分点科技有限公司
              //   </div>
              // }
            />
          </Content>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(state => ({
  currentUser: state.user.currentUser,
  postList: state.user.postList,
  menus: state.user.menus,
  collapsed: state.global.collapsed,
  fetchingNotices: state.global.fetchingNotices,
  notices: state.global.notices,
  logoUrl: state.global.logoUrl,
}))(BasicLayout);
