import moment from 'moment';
import _ from 'lodash';
import { webAPICfg } from './index';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
export const arrayToTree = (array, id = 'id', pid = 'pid', children = 'children', map) => {
  const data = array || [] // _.cloneDeep(array);
  const result = [];
  let hash = map || {};
  data.forEach((item, index) => {
    hash[data[index][id]] = data[index];
    // if (data[index]) { hash[data[index][id]] = data[index]; }//造成侧边栏消失
  });

  data.forEach((item) => {
    // if (item && item[pid]) {//造成侧边栏消失
    let hashVP = hash[item[pid]];

    if (hashVP) {
      if (!hashVP[children]) hashVP[children] = [];
      hashVP[children].push(item);
    } else {
      result.push(item);
    }
    // }
  });
  return result;
};
// 获取子级的key
export const getChildrenKey = (array, id = 'id', pid = 'pid', map) => {
  const data = _.cloneDeep(array);
  const result = {};
  let hash = map || {};
  data.forEach((item, index) => {
    hash[data[index][id]] = data[index];
  });
  function pushData(item, nodeId) {
    let hashVP = hash[item[pid]];
    if (hashVP) {
      if (!result[hashVP[id]]) {
        result[hashVP[id]] = [nodeId];
      } else {
        result[hashVP[id]].push(nodeId);
      }
      pushData(hashVP, nodeId);
    } else if (!result[nodeId]) {
      result[nodeId] = [nodeId];
    } else {
      result[nodeId].push(nodeId);
    }
  }
  data.forEach((item) => {
    pushData(item, item[id]);
  });
  return result;
};
// 从一个树中查找子树
// tree 父级树 Array
// id 待查找的子树节点id

export const getSubTree = (tree, id, ID = 'id', children = 'children') => {
  let _tree = tree;
  let subTree = null;
  if (!(_tree instanceof Array)) {
    _tree = [_tree];
  }
  let nodes = _tree;
  while (nodes.length) {
    const node = nodes.find(_node => _node[ID] === id);
    if (node) {
      subTree = node;
      break;
    } else {
      nodes = nodes.reduce((pre, current) => {
        if (current[children]) return pre.concat(current[children]);
        return pre;
      }, []);
    }
  }
  return subTree;
};
export const download = (head, data, fileName) => {
  let form = document.createElement('form');
  form.action = `${webAPICfg.basePath}/globalConfiguration/downloadBdi`;
  form.enctype = 'multipart/form-data';
  form.method = 'post';
  form.style.display = 'none';

  let input2 = document.createElement('input');
  input2.name = 'head';
  input2.value = JSON.stringify(head);
  form.appendChild(input2);
  console.log(JSON.stringify(head))

  let input3 = document.createElement('input');
  input3.name = 'fileName';
  input3.value = fileName;
  form.appendChild(input3);

  let input = document.createElement('input');
  input.name = 'data';
  input.value = JSON.stringify(data);
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export const TIME_PERIOD = [
  { name: '秒' },
  { name: '分钟' },
  { name: '小时' },
  { name: '天' },
  { name: '月' },
  { name: '日' },
  { name: '年' },
];

export function formatNumber(num, precision, separator) {
  let parts;
  let _num = num;
  // 判断是否为数字
  if (!isNaN(parseFloat(_num)) && isFinite(_num)) {
    // 把类似 .5, 5. 之类的数据转化成0.5, 5, 为数据精度处理做准, 至于为什么
    // 不在判断中直接写 if (!isNaN(num = parseFloat(num)) && isFinite(num))
    // 是因为parseFloat有一个奇怪的精度问题, 比如 parseFloat(12312312.1234567119)
    // 的值变成了 12312312.123456713
    _num = Number(_num);
    // 处理小数点位数
    _num = (typeof precision !== 'undefined' ? _num.toFixed(precision) : _num).toString();
    // 分离数字的小数部分和整数部分
    parts = _num.split('.');
    // 整数部分加[separator]分隔, 借用一个著名的正则表达式
    parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${separator || ','}`);

    return parts.join('.');
  }
  return NaN;
}

export const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
// 格式化显示时间戳
export const formatMoment = (timestamp, timeFormat = TIME_FORMAT) => {
  const date = moment(timestamp);
  return date.format(timeFormat);
};

// 生成一个tree形式的对象
export function toTree(data, id = 'id', pid = 'pid', anotherid, format, map) {
  data.forEach((item) => {
    delete item.children;
  });
  map = map || {};
  data.forEach((item) => {
    if (format) {
      item = format(item);
    }

    if(item['tagEnglishValueTitle']){
      map[item['tagEnglishValueTitle']] = item
    }else{
      map[item[id] || item[anotherid]] = item;
    }
  });

  let val = [];
  data.forEach((item) => {
    let parent
    if(item['tagEnglishValueTitle']){
      parent = map[item['tagEnglishName']]
    }else{
      parent = map[item[pid]]
    }

    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      val.push(item);
    }
  });
  return val;
}

// get  百分比
export function getPercent(num, total, type = 'num') {
  switch (type) {
    case 'num':
      if (!total) return 0
      return Number((((num || 0) / total) * 100).toFixed(2))
      break;
    case '%':
      if (!total) return '0%'
      return `${Number((((num || 0) / total) * 100).toFixed(2))}%`
      break;
    default:
      break;
  }
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!');  // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(routePath =>
    routePath.indexOf(path) === 0 && routePath !== path);
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map((item) => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact,
    };
  });
  return renderRoutes;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl(path) {
  return reg.test(path);
}

// 报表模块格式化时间
// today 今天
// yestoday 昨天
// 7days  7天前
// 30days 30天前
export function getDateFormat(type) {
  const dateFormat = 'YYYY-MM-DD';
  let startDateStr = null
  let endDateStr = null
  if (typeof type === 'object') {
    startDateStr = moment(type.startTime).format(dateFormat)
    endDateStr = moment(type.endTime).format(dateFormat)
  } else {
    switch (type) {
      case 'today':
        startDateStr = moment().format(dateFormat)
        endDateStr = moment().format(dateFormat)
        break;
      case 'yestoday':
        startDateStr = moment().subtract(1, 'days').format(dateFormat)
        endDateStr = moment().subtract(1, 'days').format(dateFormat)
        break;
      case '7days':
        startDateStr = moment().subtract(7, 'days').format(dateFormat)
        endDateStr = moment().subtract(1, 'days').format(dateFormat)
        break;
      case '30days':
        startDateStr = moment().subtract(30, 'days').format(dateFormat)
        endDateStr = moment().subtract(1, 'days').format(dateFormat)
        break;
      default:
        startDateStr = moment().format(dateFormat)
        endDateStr = moment().format(dateFormat)
        break;
    }
  }

  return { startDateStr, endDateStr }
}

export function formatCurrentValue(dateType) {
  let currentValue = null
  if (typeof dateType === 'object') {
    const { startTime, endTime } = dateType
    const range = moment(endTime).diff(moment(startTime), 'days')
    if (range === 0) {
      currentValue = 'hour'
    }
    if (range > 0 && range <= 30) {
      currentValue = 'day'
    }
    if (range > 30) {
      currentValue = 'week'
    }
  } else if (dateType === 'today' || dateType === 'yestoday') {
    currentValue = 'hour'
  } else if (dateType === '7days' || dateType === '30days') {
    currentValue = 'day'
  }
  return currentValue
}
/**
 *
 * @param {list数据} data
 * @param {关键字} id
 * @param {父ID} pid
 * @param {搜索关键字} searchKey
 * @param {搜索值} searchVal
 * @param {hash表} map
 */
export function searchTree(data, id = 'id', pid = 'pid', searchKey = 'id', searchVal, map) {
  if (searchVal) {
    data = _.cloneDeep(data);
    data.forEach((item) => {
      delete item.children;
    });
    map = map || {};
    let hash = {};
    data.forEach((item) => {
      map[item[id]] = item;
    });
    let val = [];
    data.forEach((item) => {
      if (item[searchKey].indexOf(searchVal) != -1) {
        (function aaa(item) {
          const parent = map[item[pid]];
          if (!hash[item[id]]) { // 保证每项只push一次
            if (parent) {
              if (parent.children) {
                parent.children.push(item);
                hash[item[id]] = item;
              } else {
                (parent.children = []).push(item);
                aaa(parent);
                hash[item[id]] = item;
              }
            } else {
              val.push(item);
              hash[item[id]] = item;
            }
          }
        }(item))
      }
    });
    data = null
    return val;
  } else {
    return false
  }
}

//  秒数转化成hh:mm:ss
export function transTime(params) {
  params = Number(params)
  if (isNaN(params)) return '00:00:00'

  let hours = String(Math.floor(params / 3600))
  let minutes = String(Math.floor((params / 60 % 60)))
  let seconds = String(Math.floor((params % 60)))
  if (hours.length < 2) hours = `0${hours}`
  if (minutes.length < 2) minutes = `0${minutes}`
  if (seconds.length < 2) seconds = `0${seconds}`
  return `${hours}:${minutes}:${seconds}`
}

export const DURATION = [
  { name: '分钟', value: 'minutes' },
  { name: '小时', value: 'hours' },
  { name: '天', value: 'days' },
];

export const FIELDS = {
  required: '必填字段',
}

export const numberValidatorMsg = (value, min = 0, max, required = false) => {
  if (required && value === '') {
    return '必填字段';
  }
  if (!_.isInteger(value)) {
    return '应为整数';
  }
  if (value < min) {
    return `最小应不小于${min}`;
  }
  if (max && value > max) {
    return `最大应不大于${max}`
  }
  return '';
}

export const LIMITLESS_TIMESTAMP = 7999948800000; // 代表无限的时间戳
export const ANOTHER_LIMITLESS = 7999920000000; // 偏移8个时区
export const PROTECTED_FIELDS = { // 受保护的站点栏位客户端ID，不允许编辑和删除
  siteId: ['5936473878509AF'],
  appkey: ['microcosmic_portrait_001'],
  fieldId: ['5936409773115AF'],
}

export const getStringLength = (str) => {
  // /<summary>获得字符串实际长度，中文2，英文1</summary>
  // /<param name="str">要获得长度的字符串</param>
  let realLength = 0;
  const len = str.length;
  let charCode = -1;
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) realLength += 1;
    else realLength += 2;
  }
  return realLength;
}

// 截取长字符串，超过部分用...
export const cutString = (str = '', maxLen = 5) => {
  // const len = getStringLength(str);
  const len = str.length;
  if (len <= maxLen) return str;
  return `${str.substring(0, maxLen)}...`
}

