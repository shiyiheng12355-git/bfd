import React from 'react';
import { Route, Switch } from 'dva/router';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';

const { AuthorizedRoute } = Authorized;

export default (props) => {
  const { routerData, match } = props;

  return (
    <div style={{ height: '100%' }}>
      <Switch>
        <Route exact path='/portrait/profile' component={routerData['/portrait/profile'].component} />
        {
          getRoutes(match.path, routerData).map(item =>
            (
              <AuthorizedRoute
                key={item.key}
                path={item.path}
                component={item.component}
                exact={item.exact}
                authority={item.authority}
                redirectPath="/exception/403"
              />
            )
          )
        }
      </Switch>
    </div>)
}
