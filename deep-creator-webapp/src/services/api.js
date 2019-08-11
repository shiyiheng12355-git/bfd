import api from './deepcreatorweb/api';

export const deepcreatorweb = api;

import { stringify } from 'qs';
import request from '../utils/request';
import config from '../utils/config';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export function queryMenus() {
  return request('/api/menus');
}

export async function queryResource() {
  return request('/api/resouceTableData');
}

export async function queryCoding() {
  return request('/api/codingTableData');
}

export async function queryCodingDetail() {
  return request('/api/codingDetail');
}

export async function getApiConfig() {
  return request('/api/apiConfig');
}

export async function getParamsConfig() {
  return request('/api/paramsConfigData');
}

export function queryUsergroupCategory() {
  return request('/api/group/category/user');
}

export function queryProductgroupCategory() {
  return request('/api/group/category/product');
}

export function queryUserGroupList() {
  return request('/api/group/list/user');
}

export function queryProductGroupList() {
  return request('/api/group/list/product');
}

export async function organizationList() {
  return request('/api/organizationList');
}

export async function organizationDetail() {
  return request('/api/organizationDetail');
}

export async function organizationType() {
  return request('/api/organizationType');
}

export async function classification() {
  return request('/api/classification');
}

export async function userListData() {
  return request('/api/userListData');
}

export async function getTreeData() {
  return request('/api/treeData');
}
export async function getFunnel() {
  return request('/api/funnelList')
}
export async function getFunnelDetail() {
  return request('/api/funneldetail')
}
export async function getOrganizeConfigData() {
  return request('/api/organizeConfigData');
}

export async function getOrganizeLoadData() {
  return request('/api/organizeLoadData');
}

export async function getDetailOfflineData() {
  return request('/api/detailOffline');
}

export async function getDetailOnlineData() {
  return request('/api/detailOnline');
}

export async function getBasicUserPropsData() {
  return request('/api/basicUserProps');
}

export async function getBasicUserIDData() {
  return request('/api/basicUserID');
}

export async function getClientData() {
  return request('/api/getReportClientData');
}

// 标签名称关键词模糊搜索
export async function fetchKeySearch(params) {
  return request(config.basePath + `/bizTagName/queryTagTitlesByKey?${stringify(params)}`);
}

// 标签查询
export async function fetchSearch(params) {
  return request(config.basePath + `/bizTagName/queryTagsByTagTitle?${stringify(params)}`);
}

// 实体查询
export async function queryConfigEntityList(params) {
  return request(config.basePath + `/smConfigEntity/queryConfigEntityList`);
}

// 柱形图查询
export async function queryAuditsBars(params) {
  return request(config.basePath + `/bizTagAudit/queryAuditsBars?entityId=${params}`);
}

// 申请类型查询
export async function queryApplyTypeList(params) {
  return request(config.basePath + `/bizTagAudit/queryApplyTypeList`);
}

// 审批状态查询
export async function queryApplyStatusList(params) {
  return request(config.basePath + `/bizTagAudit/queryApplyStatusList`);
}

// 表格查询
export async function queryAuditsByCons(params) {
  return request(config.basePath + `/bizTagAudit/queryAuditsByCons?${stringify(params)}`);
}

// 取消申请
export async function deleteApply(params) {
  return request(config.basePath + `/bizTagAudit/deleteApply?id=${params}`);
}

// 查询标签开发者用户名
export async function queryDevUser(params) {
  return request(config.basePath + `/bizTagAudit/queryDevUser`);
}

// 更新审批结果
export async function updateAuditResult(params) {
  return request(config.basePath + `/bizTagAudit/updateAuditResult?${stringify(params)}`);
}
//标签首页三个指标统计
export async function queryHomePage(params){
  return request(config.basePath+`/bizHomePage/queryHomePage?${stringify(params)}`);
}

//新增标签名称 进入编辑模式 假如选择取消 需要重新发接口  删除改标签名称
//参数要求： id
export async function cancelAddTag(params){
  return request(config.basePath+`/bizTagName/cancelAddTag?${stringify(params)}`);
}

//新增微观画像 用户画像接口
//参数要求： entityId=1&superId=super_id:113f8053-fb1f-4136-af85-6b79934d143b&ietime=1531969106702
export async function queryMicroSurvey(params){
  return request(config.basePath+`/bizMicroscopicPicture/queryMicroSurvey?${stringify(params)}`);
}

async function fetchData(url, options) {
  let response = await request(url, options)
  let data = await response.json()
  return data
}

// 申请下载失败名单
export async function downloadFailed(params) {
  let url = config.basePath + `/bizGroup/downloadMatchFailedIds?${stringify(params)}`
  return fetchData(url)
}

// 请求所有客户端
export async function queryAppkey(params) {
  return request(config.basePath+`/smTemplate/queryAppKey`);
}

// 查询岗位信息
export async function queryPostList(params) {
  return request(config.basePath + `/smRole/page?${stringify(params)}`);
}

// 删除岗位
export async function deletePost(params) {
  return request(config.basePath + `/smRole/delete/${params}`, {
    method: 'DELETE',
  });
}

// 新增岗位
export async function addPost(params) {
  return request(config.basePath + `/smRole/batchAdd`, {
    method: 'POST',
    body: params,
  });
}

// 功能
export async function queryOptionOfGN(params) {
  return request(config.basePath + `/smTemplate/queryAppKey`);
}

// 行
export async function queryOptionOfHang(params) {
  return request(config.basePath + `/smTemplate/queryAppKey`);
}

// 列
export async function queryOptionOfLie(params) {
  return request(config.basePath + `/smTemplate/queryAppKey`);
}

// 修改岗位
export async function updatePost(params) {
  return request(config.basePath + `/smRole/update`, {
    method: 'POST',
    body: params,
  });
}

// 查询岗位用户
export async function queryPostUser(params) {
  return request(config.basePath + `/smRole/getUserByRoleId?${stringify(params)}`);
}

// 岗位名称查重
export async function queryPostExist(params) {
  return request(config.basePath + `/smRole/exist?${stringify(params)}`);
}

// 查询已导入文件
export async function queryImportFiles(params) {
  return request(config.basePath + `/smFileRecord/getImportFileList?${stringify(params)}`);
}