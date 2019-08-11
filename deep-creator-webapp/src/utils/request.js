import fetch from 'dva/fetch';
import { notification } from 'antd';
import config from './config';

const { logoutRedirectPath } = config;
let hasShow401 = false;

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  if (response.status === 401) { // 单点登录集成
    if (hasShow401) return;
    hasShow401 = true; // 只展示一次
    const { statusText } = response;
    if (statusText) {
      notification.warn({ message: `${statusText},将会跳转到登录页` })
    }

    setTimeout(() => {
      window.location.href = logoutRedirectPath;
    }, 1 * 1000);
    return;
  } // 用户未登录

  if (response.status === 403) {
    const { statusText } = response;
    if (statusText) {
      notification.warn({ message: `无访问权限,${statusText}` })
    } else {
      notification.warn({ message: '无访问权限' })
    }
  }

  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
    newOptions.body = newOptions.body; // SDK中已经对body对象进行Json.stringfiy.
    // console.log(newOptions.body)
    // let body = JSON.parse(newOptions.body)
    // body.time = '333'
    // console.log(JSON.stringify(body))
    // newOptions.body = JSON.stringify(body)

  }
  if (newOptions.method === 'GET' || !newOptions.method) { // 解决IE GET请求缓存BUG,添加时间戳
    const hasQuery = url.includes('?');
    url = hasQuery ? `${url}&ietime=${new Date().getTime()}` :
      `${url}?ietime=${new Date().getTime()}`;
  }
  return fetch(url, newOptions)
    .then(checkStatus)
    .catch((error) => {
      console.error('请求错误', error);

      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      if ('stack' in error && 'message' in error) {
        notification.error({
          message: `请求错误: ${url}`,
          description: error.message,
        });
      }
      // SDK中如果检测到response.status状态异常，会抛出异常，
      // 但是我们在这这里已经处理过了异常状态。不想再次处理,
      // 所以构建假response对象欺骗SDK框架。
      const fakeResponse = {
        status: 200,
        json: () => { return { success: false } }
      };
      return fakeResponse;
      // if (newOptions.method === 'DELETE' || response.status === 204) {
      //   return response.text();
      // }
      // return response.json();
    });
}
