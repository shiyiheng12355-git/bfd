import config from './config';

import {
  getPercent, toTree,
  TIME_FORMAT, formatNumber, TIME_PERIOD,
  getSubTree, getChildrenKey, arrayToTree,
  formatMoment, getRoutes,
} from './utils';
import request from './request';

const webAPICfg = { // webAPI配置
  fetch: request,
  basePath: config.basePath,
}

const qeAPICfg = { // 查询引擎配置
  fetch: request,
  basePath: config.basePath,
}

const basePath = config.basePath;

export {
  webAPICfg,
  qeAPICfg,
  getPercent,
  toTree,
  TIME_FORMAT,
  formatNumber,
  TIME_PERIOD,
  getSubTree,
  getChildrenKey,
  arrayToTree,
  formatMoment,
  getRoutes,
  basePath,
}
export default { ...config }
// export default {
//   default: {
//     ...config,
//     ...utils,
//     webAPICfg,
//     qeAPICfg,
//   },
// };

