const menuData = [{
  name: '系统配置',
  icon: 'dashboard',
  path: 'config',
  children: [
    {
      path: 'resources',
      name: '资源管理',
    },
],
}]; // 菜单数据从接口获得

function formatter(data, parentPath = '', parentAuthority) {
  return data.map((item) => {
    const result = {
      ...item,
      path: `${parentPath}${item.path}`,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);