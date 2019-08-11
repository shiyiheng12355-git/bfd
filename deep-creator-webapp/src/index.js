import '@babel/polyfill';
import dva from 'dva';
import createHistory from 'history/createHashHistory';
import createLoading from 'dva-loading';
import 'moment/locale/zh-cn';
import FastClick from 'fastclick';
// import './rollbar';
import onError from './error';
import './index.less';

// import './g2';

// 1. Initialize
const app = dva({
  history: createHistory(),
  onError,
});

// 2. Plugins
app.use(createLoading({ namespace: 'LOADING' }));

// 3. Register global model
app.model(require('./models/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

FastClick.attach(document.body);

export default app._store;  // eslint-disable-line
