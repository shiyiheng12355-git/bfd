const Mock = require('mockjs');

const userGroupCategory = [
  {
    id: 0,
    categoryName: '激进型用户群',
    createUser: 'zhangleilei',
  },
  {
    id: 1,
    categoryName: '双十一活动用户群',
    createUser: 'zhangleilei',
  },
  {
    id: 2,
    categoryName: '高价值用户群',
    createUser: 'zhangleilei',
  },
];

const productGroupCategory = [
  {
    id: 0,
    categoryName: '卖的最快',
    createUser: '京东',
  },
  {
    id: 1,
    categoryName: '卖的最贵',
    createUser: '京东',
  },
  {
    id: 2,
    categoryName: '卖不出去',
    createUser: '京东',
  },
];

const userGroupList = Mock.mock({
  'data|8': [
    {
      'id|+1': 1,
      groupId: '@id',
      'userNumber|100-10000': 200,
      'customerNumber|100-10000': 200,
      groupName: '所有用户群',
      groupDesc: '我是用户群组',
    },
  ],
}).data;

const productGroupList = Mock.mock({
  'data|8': [
    {
      'id|+1': 1,
      groupId: '@id',
      'productNumber|100-10000': 100,
      groupName: '所有产品群',
      groupDesc: '我是产品群组',
    },
  ],
}).data;


export function getUsergroupCategory(req, res) {
  res.json(userGroupCategory);
}

export function getProductgroupCategory(req, res) {
  res.json(productGroupCategory);
}


export function getUsergroupList(req, res) {
  res.json(userGroupList);
}


export function getProductgroupList(req, res) {
  res.json(productGroupList);
}


export default {
  getUsergroupCategory,
  getProductgroupCategory,
};
