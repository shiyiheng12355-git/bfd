English | [简体中文](./README.zh-CN.md)

## 基于Ant Design Pro
## 开发: Clone项目　-> npm install -> npm start

## 自定义开发的公共组件
组件都放在 src/components目录下，为了方便组件共享，大家把自己开发的公共组件列在下面，并附上简单的文档

## 产品原型地址　
http://172.24.5.69:10081/%E4%BA%A7%E5%93%81%E8%9E%8D%E5%90%88/%E5%8E%9F%E5%9E%8B/ admin/123456

## 产品UI地址
http://172.24.5.69:10081/%E4%BA%A7%E5%93%81%E8%9E%8D%E5%90%88/UI/

## Dev Jenkins地址
http://172.24.2.37:3780

## 如何使用API SDK进行API调用
后台API接口调用封装在 deep-creator-sdk中,当前sdk集成了对 
[主API，deepcreatorweb](http://git.baifendian.com/G331/deepcreatorweb)。
[查询引擎，queryengine](http://git.baifendian.com/G331/queryengine)服务的API调用。

### 封装的API有函数式调用和面对对象调用两种方式，我们推荐用函数式调用，函数式调用函数以"Fp"结尾
### 建议使用 vscode IDE,使用API时有良好的代码提示功能，方便开发

    例如使用deepwebcreator的API,获取标签分类列表

    import { deepcreatorweb } from 'deep-creator-sdk'; // 引用SDK模块　deepwebcreator/queryengine
    import { webAPICfg } from '../utils'; // 引用该API配置模块　目前有　webAPICfg 和　qeAPICfg
    const TagApiFp = deepcreatorweb.BiztagcategorycontrollerApiFp(webAPICfg); // 选择要使用的API,重新赋值减少长度 

    const promise = TagApiFp.bizTagCategoryList(params)； // 使用API，注意传入request对象
    promise.then() // 取返回值
    // #ES6生成器取值
    const res = yield TagApiFp.bizTagCategoryList(params)；
    
#开发时本地域名配置
开发环境配置:
1 src/utils/config.js bashPath配置API服务地址(ip或域名)，注意如果配置域名，确保域名能被访问和解析
2 本地npm start,确保本地服务启动在 http://localhost:8000