import React from 'react';
import { Router, Switch } from 'dva/router';


import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import Authorized from './utils/Authorized';

import styles from './index.less';
import { getRouterData } from './common/router';

const { AuthorizedRoute } = Authorized;

dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const UserLayout = routerData['/user'].component;
  const BasicLayout = routerData['/'].component;
  const BlankLayout = routerData['/portrait'].component;

  return (
    <LocaleProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <AuthorizedRoute
            path="/portrait"
            render={props => <BlankLayout {...props} />}
            authority=""
          />
          <AuthorizedRoute
              path="/user"
              render={props => <UserLayout {...props} />}
              authority=""
              redirectPath="/"
            />
            <AuthorizedRoute
              path="/"
              render={props => <BasicLayout {...props} />}
              authority=""
              redirectPath="/user/login"
            />
        </Switch>
      </Router>
    </LocaleProvider>
      );
}

export default RouterConfig;
