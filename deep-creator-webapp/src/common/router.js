import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import lodash from 'lodash';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) => (
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  })
);

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return (props) => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () => models.filter(
      model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)
      ),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return props => createElement(Component, {
          ...props,
          routerData: routerDataCache,
        });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach((item) => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

// 前端路由配置
export const getRouterData = (app, menuData = []) => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/config/resources': {
      component: dynamicWrapper(app, ['resource'], () => import('../routes/Dashboard/Resource')),
    },
    '/config/coding': {
      component: dynamicWrapper(app, ['coding'], () => import('../routes/Dashboard/Coding')),
    },
    '/config/coding/:id': {
      component: dynamicWrapper(app, ['coding'], () => import('../routes/Dashboard/Coding/Detail')),
    },
    '/config/global': {
      component: dynamicWrapper(app, ['globalConfig/apiConfig', 'globalConfig/detailConfig', 'globalConfig/organizeConfig', 'globalConfig/paramsConfig', 'globalConfig/basicUserConfig', 'globalConfig/sysConfig'], () => import('../routes/Dashboard/Global')),
    },
    '/config/global/baseconfig': {
      component: dynamicWrapper(app, ['globalConfig/basicUserConfig'], () => import('../routes/Dashboard/Global/BaseConfig')),
    },
    '/config/global/detailconfig': {
      component: dynamicWrapper(app, ['globalConfig/detailConfig'], () => import('../routes/Dashboard/Global/DetailConfig')),
    },
    '/config/global/apiconfig': {
      component: dynamicWrapper(app, ['globalConfig/apiConfig'], () => import('../routes/Dashboard/Global/ApiConfig')),
    },
    '/config/global/paramconfig': {
      component: dynamicWrapper(app, ['globalConfig/paramsConfig'], () => import('../routes/Dashboard/Global/ParamConfig')),
    },
    '/config/global/organizeconfig': {
      component: dynamicWrapper(app, ['globalConfig/organizeConfig'], () => import('../routes/Dashboard/Global/OrganizeConfig')),
    },
    '/config/reportconfig': {
      component: dynamicWrapper(app, ['reportconfig'], () => import('../routes/Dashboard/ReportConfig')),
    },
    // '/jurisdiction/organization/details/:id': {
    //   component: dynamicWrapper(app, ['Jurisdiction/details'], import('../routes/Jurisdiction/organization')),
    // },
    '/config/tags': {
      component: dynamicWrapper(app, ['sysconfig/tags'], () => import('../routes/SysConfig/Tags')),
    },
    '/config/marketing': {
      component: dynamicWrapper(app, ['report/funnelAdd', 'sysconfig/marketing/index', 'marketing/automation', 'tagPicker'], () => import('../routes/SysConfig/Marketing')),
    },
    '/config/group': {
      component: dynamicWrapper(app, ['sysconfig/group', 'tagPicker'], () => import('../routes/SysConfig/Group')),
    },

    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    // '/exception/trigger': {
    //   component: dynamicWrapper(app, ['error'], () => import('../routes/Exception/triggerException')),
    // },
    '/marketing/automation': {
      component: dynamicWrapper(app, ['marketing/automation', 'tagPicker'],
        () => import('../routes/Marketing/Automation')),
    },
    '/marketing/automation/:id': {
      component: dynamicWrapper(app, ['marketing/automation', 'tagPicker'],
        () => import('../routes/Marketing/Automation/Detail')),
    },
    '/marketing/strategy': {
      component: dynamicWrapper(app, ['marketing/strategy', 'sysconfig/marketing/index'],
        () => import('../routes/Marketing/Strategy')),
    },
    '/marketing/recommendation': {
      component: dynamicWrapper(app, ['marketing/recommendation', 'sysconfig/marketing/index'],
        () => import('../routes/Marketing/Recommendation')),
    },
    '/marketing/recommendation/:fieldId': {
      component: dynamicWrapper(app, ['marketing/recommendation', 'sysconfig/marketing/index', 'coding'],
        () => import('../routes/Marketing/Recommendation/Detail')),
    },
    '/marketing/scene': {
      component: dynamicWrapper(app, ['marketing/scene'], () => import('../routes/Marketing/Scene')),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/jurisdiction/organization': {
      component: dynamicWrapper(app, ['Jurisdiction/organization'],
        () => import('../routes/Jurisdiction/organization')
      ),
    },
    '/jurisdiction/userManage': {
      component: dynamicWrapper(app, ['Jurisdiction/userManage', 'Jurisdiction/userManageModal'],
        () => import('../routes/Jurisdiction/userManage')
      ),
    },
    '/jurisdiction/postManage': { 
      component: dynamicWrapper(app, ['Jurisdiction/postManage'], () => import('../routes/Jurisdiction/PostManage')),
    },
    '/jurisdiction/postManage/add': { 
      component: dynamicWrapper(app, ['Jurisdiction/postManage'], () => import('../routes/Jurisdiction/PostManage/AddPost')),
    },
    '/jurisdiction/postManage/postDetail/:type/:record': { 
      component: dynamicWrapper(app, ['Jurisdiction/postManage'], () => import('../routes/Jurisdiction/PostManage/PostDetail')),
    },
    '/jurisdiction/template': {
      component: dynamicWrapper(app, ['Jurisdiction/template', 'Jurisdiction/templateModal', 'Jurisdiction/template/template1', 'Jurisdiction/template/template2', 'Jurisdiction/template/template3'],
        () => import('../routes/Jurisdiction/template')),
    },
    '/jurisdiction/template/modelConfig': {
      name: '脱敏模板',
      component: dynamicWrapper(app, ['Jurisdiction/modelConfig'],
        () => import('../routes/Jurisdiction/template/ModelConfig')
      ),
    },
    '/report/funnel': {
      component: dynamicWrapper(app, ['report/funnel', 'report/funnelAdd'],
        () => import('../routes/Report/Funnel')
      ),
    },
    '/report/funnel/detail': {
      name: '漏斗详情',
      component: dynamicWrapper(app, ['report/funneldetail', 'report/funnel', 'report/funnelAdd'],
        () => import('../routes/Report/Funnel/Detail')
      ),
    },
    '/userconfig/personalcenter': {
      component: dynamicWrapper(app, ['userconfig/personalcenter'], () => import('../routes/UserConfig/PersonalCenter')),
    },
    // '/enshrine': {
    //   component: dynamicWrapper(app, ['userconfig/personalcenter'], () => import('../routes/UserConfig/PersonalCenter')),
    // },
    '/groups/:id': {
      component: dynamicWrapper(app, ['group/entityGroup', 'user', 'tagPicker'], () => import('../routes/Groups/EntityGroup')),
    },
    '/groups/microPortrait': {
      component: dynamicWrapper(app, ['microPortrait/index'], () => import('../routes/Groups/MicroPortrait')),
    },
    '/groups/:entityId/:groupId': {
      component: dynamicWrapper(app, ['group/groupProfile', 'tagPicker', 'group/entityGroup'], () => import('../routes/Groups/GroupProfile')),
    },
    '/portrait': {
      component: dynamicWrapper(app, [], () => import('../layouts/BlankLayout')),
    },
    '/portrait/profile': {
      component: dynamicWrapper(app, ['microPortrait/index', 'tagPicker', 'user'], () => import('../routes/Groups/MicroProfile')),
    },
    '/sites': {
      component: dynamicWrapper(app, [], () => import('../layouts/IframeLayout')),
    },
    '/tags/:id': {
      component: dynamicWrapper(app, ['tags/tags'], () => import('../routes/Tags')),
    },
    '/tags/tagenglishname/:tagEnglishName/:entityId': {
      component: dynamicWrapper(app, ['tags/tags'], () => import('../routes/Tags/EditTagEnglishName')),
    },
    '/tags/count/tagCount': {
      component: dynamicWrapper(app, ['tagCount'], () => import('../routes/TagCount')),
    },
    '/report/operate': {
      component: dynamicWrapper(app, ['report/operation', 'report/Mobile/trend', 'report/Mobile/abstract', 'report/Mobile/top', 'report/Mobile/userAnalysis', 'report/Mobile/timeAnalysis', 'report/Mobile/areaAnalysis', 'report/Mobile/terminalAnalysis', 'report/Mobile/operatorAnalysis', 'report/Mobile/channelAnalysis', 'report/Mobile/versionAnalysis', 'report/Mobile/visitedPages', 'report/PC/FlowAnalysis', 'report/PC/guest', 'report/PC/PageVisited', 'report/PC/PageEntry', 'report/Mobile/errorAnalysis', 'report/Mobile/userLoyal'], () => import('../routes/Report/Operate')),
    },
    '/report/eventReport': {
      component: dynamicWrapper(app, ['report/eventReport'], () => import('../routes/Report/EventReport')),
    },
    '/enshirne/:id': {
      component: dynamicWrapper(app, ['collect/collect'], () => import('../routes/Collect')),
    },
    '/collect/add': {
      component: dynamicWrapper(app, ['collect/collect'], () => import('../routes/Collect/Add')),
    },
    '/approval/apply': {
      component: dynamicWrapper(app, ['approval'], () => import('../routes/Approval/Apply')),
    },
    '/approval/approval': {
      component: dynamicWrapper(app, ['approval'], () => import('../routes/Approval/Approval')),
    },
    '/approval/develop': {
      component: dynamicWrapper(app, ['approval'], () => import('../routes/Approval/Develop')),
    },
    '/approval/release': {
      component: dynamicWrapper(app, ['approval'], () => import('../routes/Approval/Release')),
    },
  };
  // Get name from ./menu.js or just set it in the router data.
  // const menuData = getFlatMenuData(getMenuData());
  const routerData = {};
  Object.keys(routerConfig).forEach((item) => {
    const menuItem = menuData[item.replace(/^\//, '')] || {};
    routerData[item] = {
      ...routerConfig[item],
      name: routerConfig[item].name || menuItem.name, // menu覆盖name属性
      authority: routerConfig[item].authority || menuItem.authority, // menu覆盖authority属性
    };
  });
  return routerData;
};

export const convertRouterData = (routerData, menus) => {
  const keyMenus = lodash.keyBy(menus, 'resourceUrl');
  const mergedRouteData = {};
  // 用户自定义的外站链接
  const outerLinks = menus.filter(menu => isOuterLink(menu));
  outerLinks.forEach((menu) => { // 给外站链接构建前端路由
    const path = `/sites/${menu.resourceKey}`;
    mergedRouteData[path] = {
      ...menu,
      path,
      name: menu.resourceTitle,
      src: menu.resourceUrl,
    }
  })

  Object.keys(routerData).forEach((item) => {
    const menuItem = keyMenus[item] || {};
    mergedRouteData[item] = {
      ...routerData[item],
      name: menuItem.resourceTitle || routerData[item].name, // menu覆盖name属性
      authority: routerData[item].authority || menuItem.authority, // menu覆盖authority属性
    };
  });
  return mergedRouteData;
}

export const getRedirectData = () => { // 面包屑使用
  return {
    '/config': {
      name: '系统管理',
    },
    '/jurisdiction': {
      name: '权限管理',
    },
    '/tags': {
      name: '标签管理',
    },
    '/groups': {
      name: '群组管理',
    },
    '/marketing': {
      name: '营销场景',
    },
    '/report': {
      name: '报表管理',
    },
    '/enshirne': {
      name: '我的收藏',
    },
    '/userconfig': {
      name: '个人中心',
    },
  }
}

// 是否是外站链接
export const isOuterLink = (menu) => {
  return menu.resourceSign === 2 && /^https?:\/\//.test(menu.resourceUrl);
}