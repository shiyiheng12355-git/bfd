// let basePath = 'http://172.24.2.37:8888'; // 开发
// let basePath = 'http://172.24.8.214:8080'; // 开发
let basePath = 'http://172.18.1.151:29299'; // 开发

if (BUILD_ENV === 'production') { // 生产环境部署，相对目录
  basePath = window.location.origin;
} else if (BUILD_ENV === 'test') { // 测试
  basePath = 'http://172.18.1.165:8080';
}

console.log('当前的编译环境', BUILD_ENV);

const loginRedirectPath = `${basePath}/gotoLogin?backUrl=${window.location.origin}`;
const logoutRedirectPath = `${basePath}/logout?service=${loginRedirectPath}`;

export default {
  name: 'DEEPFINDER',
  prefix: 'DEEPCREATOR',
  footerText: 'Copyright©2016 Baifendian Corporation All Rights Reserved.',
  logo: '/logo.png',
  CORS: [],
  logoutRedirectPath,
  basePath,
  CODE_KEYS: [
    { key: 'USER_BEHAVIOR_PARAM', name: '用户行为参数配置' },
    { key: 'ALGORITHM_INSTANCE', name: '算法实例列表' },
    { key: 'RECOM_ID_ATTRIBUTE', name: '推荐内容ID及属性列表' },
  ], // 用户行为参数 算法实例 推荐ID属性 码表KEY
};