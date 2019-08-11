const { config, queryArray } = require('./common');
const Mock = require('mockjs');

const { apiPrefix } = config;

let database = [
  { id: 1, entityId: 1, name: '客户价值' },
  { id: 2, entityId: 1, name: '资产信息', pid: 1 },
  { id: 3, entityId: 1, name: '价值评估', pid: 1 },
  { id: 4, entityId: 1, name: '产品偏好' },
  { id: 5, entityId: 1, name: '出差旅游', pid: 4 },
  { id: 6, entityId: 1, name: '出境游', pid: 5 },
  { id: 7, entityId: 1, name: '自助游', pid: 6 },
  { id: 8, entityId: 1, name: '跟团游', pid: 6 },
  { id: 9, entityId: 1, name: '车产', pid: 2 },
  { id: 10, entityId: 1, name: '车产估值', pid: 2 },
  { id: 11, entityId: 1, name: '10-12W', pid: 10, period: '每日更新', value: true },
  { id: 12, entityId: 1, name: '20-50w', pid: 10, period: '每日更新' },
  { id: 13, entityId: 1, name: '50-100w', pid: 10, period: '每日更新' },
  { id: 14, entityId: 1, name: '100+w', pid: 10, period: '每日更新' },
  { id: 15, entityId: 1, name: '有车', pid: 9, period: '每日更新', value: true },
  { id: 16, entityId: 1, name: '无车', pid: 9, period: '每日更新' },
  { id: 17, entityId: 1, name: '价值度', pid: 3 },
  { id: 18, entityId: 1, name: '购买力', pid: 17, period: '每日更新' },
  { id: 19, entityId: 1, name: '高价值', pid: 17, period: '每日更新', value: true },
  { id: 20, entityId: 1, name: '中价值', pid: 17, period: '每日更新' },
  { id: 21, entityId: 1, name: '低价值', pid: 17, period: '每日更新' },
  { id: 22, entityId: 1, name: '高购买力', pid: 18, period: '每日更新', value: true },
  { id: 23, entityId: 1, name: '中购买力', pid: 18, period: '每日更新' },
  { id: 24, entityId: 1, name: '低购买力', pid: 18, period: '每日更新' },
];

let combineTags = [
  { id: 1, entityId: 1, name: '运动爱好者' },
  { id: 2, entityId: 1, name: '文艺客户' },
  { id: 3, entityId: 1, name: '大宗交易' },
  { id: 4, entityId: 1, name: '球类', pid: 1, period: '每日更新' },
  { id: 5, entityId: 1, name: '极限运动', pid: 1, period: '每日更新' },
  { id: 6, entityId: 1, name: '影视', pid: 2, period: '每日更新' },
  { id: 7, entityId: 1, name: '音乐', pid: 2, period: '每日更新' },
  { id: 8, entityId: 1, name: '期货', pid: 3, period: '每日更新' },
  { id: 9, entityId: 1, name: '现货', pid: 3, period: '每日更新' },
];


module.exports = {
  tags: database,
  [`GET ${apiPrefix}/entities/:entityId/tags`](req, res) {
    const { query } = req;
    const { entityId } = req.params;
    let { pageSize, page } = query;
    pageSize = pageSize || 100;
    page = page || 1;

    const tags = database;
    const data = tags.filter(item => item.entityId === +entityId);

    res.status(200).json({
      data: data.slice((page - 1) * pageSize, page * pageSize),
      total: tags.length,
    });
  },

  [`POST ${apiPrefix}/entities/:entityId/tags`](req, res) {
    const tag = req.body;
    const { entityId } = req.params;

    tag.entityId = +entityId;
    tag.id = Mock.mock('@id');
    database.push(tag);
    res.status(200).json({
      data: tag,
    });
  },

  [`DELETE ${apiPrefix}/entities/:entityId/tags/:tagId`](req, res) {
    const { tagId } = req.params;
    database = database.filter((item) => {
      return item.id !== parseInt(tagId, 10);
    });
    res.status(200).json({
      data: {},
    });
  },

  [`PUT ${apiPrefix}/entities/:entityId/tags/:tagId`](req, res) {
    const tag = req.body;
    const { tagId } = req.params;
    database = database.map((item) => {
      if (item.id === parseInt(tagId, 10)) return tag;
      return item;
    });
    res.status(200).json({
      data: tag,
    });
  },

  [`GET ${apiPrefix}/entities/:entityId/combineTags`](req, res) {
    res.status(200).json({
      data: combineTags,
    });
  },

  [`DELETE ${apiPrefix}/entities/:entityId/combineTags/:tagId`](req, res) {
    const { tagId } = req.params;
    combineTags = combineTags.filter(item => item.id !== parseInt(tagId, 10));
    res.status(200).json({
      data: {},
    });
  },

  [`POST ${apiPrefix}/entities/:entityId/combineTags`](req, res) {
    const newCombineTag = { ...req.body.combineTag, id: combineTags.length + 1 };
    combineTags.unshift(newCombineTag);
    res.status(200).json({
      data: newCombineTag,
    });
  },
};
