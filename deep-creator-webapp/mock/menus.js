const menus = [
  {
    id: 0, name: '首页', path: '/',
  },
  {
    id: 1, name: '系统配置', path: '/config', pid: 0,
  },

  {
    path: '/config/resources',
    name: '资源管理',
    id: 2,
    pid: 1,
  },
  {
    name: '快速编码',
    path: '/config/coding',
    id: 3,
    pid: 1,
  },
  {
    name: '全局配置',
    path: '/config/global',
    id: 4,
    pid: 1,
  },
  {
    name: '标签管理配置',
    path: '/config/tags',
    id: 5,
    pid: 1,
  },
  {
    name: '群组管理配置',
    path: '/config/groups',
    pid: 1,
    id: 6,
    // icon: 'table',
  },
  {
    name: '报表管理配置',
    path: '/config/reports',
    id: 7,
    pid: 1,
    // icon: 'table',
  },
  {
    name: '营销管理配置',
    path: '/config/marketing',
    id: 8,
    pid: 1,
  },
  {
    id: 8, name: '我的收藏', path: '/collections', pid: 0,
  },
  {
    id: 9, name: '我的页面', path: '/collections/#', pid: 8,
  },
  {

    id: 30, name: '权限设置', path: 'jurisdiction', pid: 0,
  },
  {
    id: 31, name: '组织架构管理', path: 'organization', pid: 30,
  },
  {
    id: 32, name: '用户管理', path: 'userManagement', pid: 30,
  },
  {
    id: 33, name: '模板管理', path: 'templateManagement', pid: 30,
  },{
    name: '报表管理',
    path: 'report',
    id: 1000,
    pid: 0,
  },
  {
    name: '在线运营指标',
    path: 'operate',
    id: 1001,
    pid: 1000,
  },
  {
    name: '在线事件报表',
    path: 'events',
    id: 1002,
    pid: 1000,
  },
  {
    name: '实时行为漏斗',
    path: 'funnel',
    id: 1003,
    pid: 1000,
  },
  {
    name: '业务报表',
    path: 'business',
    id: 1004,
    pid: 1000,
  },
];

export default {
  getMenus: (req, res) => {
    res.json(menus);
  },
};

