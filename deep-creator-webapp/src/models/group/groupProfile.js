import { deepcreatorweb } from 'deep-creator-sdk';
import modelExtend from 'dva-model-extend';
import { message, notification } from 'antd';
import { model } from '../common';

import { webAPICfg } from '../../utils';

import _ from 'lodash';

const GroupApiFp = deepcreatorweb.BizgroupcontrollerApiFp(webAPICfg);
const GroupCusTagApiFp = deepcreatorweb.BizgrouptagmapcontrollerApiFp(webAPICfg);
const GroupAnalyzeApiFp = deepcreatorweb.BizgroupanalyzedimensioncontrollerApiFp(webAPICfg);
const SmGroupManageApiFp = deepcreatorweb.SmgroupmanagementcontrollerApiFp(webAPICfg);
const AutoFp = deepcreatorweb.BizautomarketingcontrollerApiFp(webAPICfg);
const FunFp = deepcreatorweb.BizfunnelcontrollerApiFp(webAPICfg);
const ReportApiFp = deepcreatorweb.BizreportcontrollerApiFp(webAPICfg);
const LifeFp = deepcreatorweb.BizlifetripcontrollerApiFp(webAPICfg)
// const GroupCategoryApiFp = deepcreatorweb.BizgroupcategorycontrollerApiFp(webAPICfg);

const listParam = {
  groupAuthorityType: 0, // 0个人 1生命旅程
  isAddReport: 2, // 0未添加到全局 1添加到全局 2所有
}

export default modelExtend(model, {
  namespace: 'group/profile',
  state: {

    basicInfo: {}, // 用户群基本信息
    customerTag: [], // 当前群的自定义标签
    existCusTag: [], // 当前实体的所有的自定义标签
    TGIList: [], // 标签特征
    basicQuota: [], // 基础指标
    distriCustomerQuota: [], // 标签分布下的 自定义指标
    customerQuota: [], // 详情列表下的 自定义指标
    tagDistribution: [], // 标签分布 根据自定义指标查询
    infoList: [],
  },

  effects: {
    *getGroupBasic({ payload }, { put, call, select }) {
      const { entityId, groupId } = payload;
      let basicInfo = {};
      const groupListParam = {
        ...listParam,
        entityId,
      }
      const listResponse = yield GroupApiFp.bizGroupListGet(groupListParam);
      if (listResponse.success) {
        basicInfo = listResponse.resultBody.find(item => item.id === groupId);
      }

      yield put({
        type: 'updateState',
        payload: { basicInfo },
      })
    },
    // 名称校验
    *checkNameIsRepeat({ payload, callback }, { put, call, select }) {
      const { entityId, groupName } = payload;
      const params = {
        entityId,
        groupName,
      }
      const response = yield call(GroupApiFp.bizGroupIsRepetitiveGroupNamePost, params);
      let groupNameIsRepeat = false;
      if (response.success) {
        groupNameIsRepeat = response.resultBody;
        if (callback) callback(groupNameIsRepeat);
      }
    },
    *getCustomerTag({ payload }, { put, call, select }) {
      const { groupId, callback } = payload;
      let customerTag = [];
      const tagResponse = yield GroupCusTagApiFp.bizGroupTagMapCustomTagByIdGroupIdGet({ groupId });

      if (tagResponse.success) {
        customerTag = tagResponse.resultBody;
        yield put({
          type: 'updateState',
          payload: { customerTag },
        })
        if (callback) callback();
      } else {
        notification.error({
          message: '获取自定义标签失败',
          description: tagResponse.errorMsg,
        })
      }
    },
    *getExistCusTag({ payload }, { put, call, select }) {
      const { entityId } = payload;

      let existCusTag = [];
      const response = yield GroupCusTagApiFp.bizGroupTagMapQueryCustomTagByUserPostIdGet({ entityId });

      if (response.success) {
        existCusTag = response.resultBody;
      }
      yield put({
        type: 'updateState',
        payload: { existCusTag },
      })
    },
    *addCustomTag({ payload }, { put, call, select }) {
      const { entityId, groupId, tagValueTitle, callback } = payload;
      const params = {
        // entityId,
        tagValueTitle,
        id: groupId,
        sysEntityId: entityId,

      }
      const response = yield GroupCusTagApiFp.bizGroupTagMapSysEntityIdAddCustomtagValuePost(params);
      let success = false;
      if (response.success) {
        success = true;
        yield put({
          type: 'getExistCusTag',
          payload: { entityId },
        })
        yield put({
          type: 'getCustomerTag',
          payload: {
            groupId,
            callback: () => {
              if (callback) callback(success);
            },
          },
        })
      } else {
        const { errorMsg } = response;
        if (callback) callback(success, errorMsg);
        notification.error({
          message: '添加自定义标签失败',
          description: response.errorMsg,
        })
      }
    },
    *addExistCusTag({ payload }, { put, call, select }) {
      const { groupId, checkedValues, callback } = payload;
      const params = {
        id: groupId,
        tagEnglishValueTitles: checkedValues.join(','),
      }
      let success = false;
      const response = yield GroupCusTagApiFp.bizGroupTagMapAddChooseCustomtagValuePost(params);
      if (response.success) {
        success = true;
        yield put({
          type: 'getCustomerTag',
          payload: { groupId },
        })
      }
      if (callback) callback(success);
    },

    *delCustomTag({ payload }, { put, call, select }) {
      const { groupId, tagEnglishValueTitle, callback } = payload;
      const params = {
        groupId,
        tagEnglishValueTitle,
      }
      const response = yield GroupCusTagApiFp.bizGroupTagMapDelGroupIdDelete(params);
      let success = false;
      if (response.success) {
        success = true;
        yield put({
          type: 'getCustomerTag',
          payload: { groupId },
        })
      } else {
        notification.error({
          message: '删除自定义标签失败',
          description: response.errorMsg,
        })
      }
      if (callback) callback(success);
    },

    *getTGI({ payload }, { put, call, select }) {
      const { groupId, TGItype ,callback} = payload;
      let TGIList = [];
      let response = null;
      switch (TGItype) {
        case 'GROUP':
          response = yield GroupApiFp.bizGroupQueryTGIByIdIdGet({ id: groupId });
          break;
        case 'AUTOMATION': {
          const bizAutoMarketingVO = payload;
          response = yield AutoFp.bizAutoMarketingQueryTGIByIdPost({ bizAutoMarketingVO });// 查询TGI
          break;
        }
        case 'FUNNEL': {
          // 查询TGI TODO
          let bizFunnelExpression = _.cloneDeep(payload);
          delete bizFunnelExpression.TGItype
          response = yield FunFp.bizFunnelTagFeaturePost({ bizFunnelExpression });// 查询TGI
          bizFunnelExpression = null;
          break;
        }
        case 'REPORT': {
          response = yield ReportApiFp.bizPerRecomTagFeaturePost({ reportExpression: payload })
          break;
        }
        default:
          break;
      }
      
      if (response.success) {
        TGIList = JSON.parse(response.resultBody);
        yield put({
          type: 'updateState',
          payload: { TGIList },
        })
        //调用接口成功 回调
        callback && callback(response.success);
      } else {
        notification.error({
          message: '获取TGI列表失败',
          description: response.errorMsg,
        })
      }
    },
    *saveGroup({ payload, callback }, { put, call, select }) {
      const { data, TGItype, TGIParams } = payload;
      try {
        let response = null;
        // debugger;
        switch (TGItype) {
          case 'GROUP':
            break;
          case 'AUTOMATION': {
            let bizAutoMarketGroupVo = _.cloneDeep({ ...data, bizAutoMarketingVO: { ...TGIParams } });
            delete bizAutoMarketGroupVo.bizAutoMarketingVO.group_expression.date.end_date;
            delete bizAutoMarketGroupVo.bizAutoMarketingVO.group_expression.date.start_date;
            bizAutoMarketGroupVo.conditionJson = '';
            bizAutoMarketGroupVo.conditonDesc = '';
            bizAutoMarketGroupVo.groupAuthorityType = 0;
            bizAutoMarketGroupVo.categoryName = bizAutoMarketGroupVo.groupCategory;
            bizAutoMarketGroupVo.entityId = TGIParams.entityId;
            response = yield AutoFp.bizAutoMarketingSaveDecisionGroupPost({ bizAutoMarketGroupVo });// 保存
            bizAutoMarketGroupVo = null;
            break;
          }
          case 'LIFE_AUTOMATION': {
            let bizLifeTripGroupInfo = _.cloneDeep({
              bizGroupInfo: {
                ...data,
                entityEnglishName: '',
                entityId: TGIParams.bizLifeTripInfoParam.entityId,
                conditionJson: JSON.stringify(TGIParams.group_expression),
                conditonDesc: JSON.stringify(TGIParams.group_expression),
              },
              bizLifeTripInfoParam: TGIParams.bizLifeTripInfoParam,
              type: TGIParams.type,
            });
            response = yield LifeFp.bizLifeTripSaveDecisionGroupPost({ bizLifeTripGroupInfo });
            bizLifeTripGroupInfo = null;
            break
          }
          case 'FUNNEL': {
            // 查询TGI TODO
            let bizFunnelGroupVo = _.cloneDeep({ ...data, groupExpression: { ...TGIParams } });
            bizFunnelGroupVo.conditionJson = bizFunnelGroupVo.conditionJson === '{}' ? '' : bizFunnelGroupVo.conditionJson;
            bizFunnelGroupVo.conditonDesc = bizFunnelGroupVo.conditonDesc === '{}' ? '' : bizFunnelGroupVo.conditonDesc;
            bizFunnelGroupVo.groupAuthorityType = 0
            if (bizFunnelGroupVo.groupExpression.type === 'funnel') {
              bizFunnelGroupVo.groupType = 5
              console.log(JSON.stringify(bizFunnelGroupVo))
              response = yield FunFp.bizFunnelSaveFunnelStepGroupPost({ bizFunnelGroupVo });// 保存
            } else {
              bizFunnelGroupVo.groupType = 6
              response = yield FunFp.bizFunnelSaveFunnelLoseGroupPost({ bizFunnelGroupVo });// 保存流失
            }
            console.log(bizFunnelGroupVo);
            bizFunnelGroupVo = null;
            break;
          }
          case 'LIFEFUNNEL': {
            // 查询TGI TODO
            let bizLifeTripGroupInfo = _.cloneDeep({
              bizGroupInfo: {
                ...data,
                entityEnglishName: '',
                entityId: TGIParams.bizLifeTripInfoParam.entityId,
                conditionJson: JSON.stringify(TGIParams.groupExpression),
                conditonDesc: JSON.stringify(TGIParams.groupExpression),
              },
              bizLifeTripInfoParam: TGIParams.bizLifeTripInfoParam,
              type: TGIParams.type,
            });

            if (TGIParams.type === 'funnel') {
              // console.log(JSON.stringify(bizLifeTripGroupInfo))
              response = yield LifeFp.bizLifeTripSaveFunnelStepGroupPost({ bizLifeTripGroupInfo });// 保存
            } else {
              response = yield LifeFp.bizLifeTripSaveFunnelLoseGroupPost({ bizLifeTripGroupInfo });// 保存流失
            }
            // console.log(bizLifeTripGroupInfo);
            bizLifeTripGroupInfo = null;
            break;
          }
          case 'REPORT': {
            let bizReportGroupVo = _.cloneDeep({ ...data, groupExpression: { ...TGIParams } });
            // bizReportGroupVo.conditionJson = bizReportGroupVo.conditionJson === '{}' ? '' : bizReportGroupVo.conditionJson;
            bizReportGroupVo.conditonDesc = bizReportGroupVo.conditonDesc === '{}' ? '' : bizReportGroupVo.conditonDesc;
            // bizReportGroupVo.expression = JSON.stringify(bizReportGroupVo.groupExpression)
            bizReportGroupVo.categoryName = bizReportGroupVo.groupCategory
            bizReportGroupVo.reportExpression = bizReportGroupVo.groupExpression
            delete bizReportGroupVo.groupExpression
            delete bizReportGroupVo.conditionJson
            delete bizReportGroupVo.groupCategory
            // console.log('bizReportGroupVo---', bizReportGroupVo)
            response = yield ReportApiFp.bizPerRecomSaveReportGroupPost({ bizReportSaveReportGroupParam: bizReportGroupVo })
            break;
          }
          default:
            break;
        }
        if (response.success) {
          callback && callback();
          message.success('保存群组成功');
        } else {
          notification.error({
            message: '保存群组失败',
            description: response.errorMsg,
          })
        }
      } catch (e) {
        console.log(e, '请求错误');
      }
    },
    * getBasicQuota({ payload }, { put, call, select }) {
      const { entityId, callback } = payload;
      let basicQuota = [];
      // debugger
      const response = yield call(SmGroupManageApiFp.smGroupManagementQueryBaseInfoGet, { entityId });
      if (response.success) {
        basicQuota = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { basicQuota },
        })
        if (callback) callback(basicQuota);
      } else {
        notification.error({
          message: '获取基础指标失败',
          description: response.errorMsg,
        });
      }
    },

    * getDistriCustomerQuota({ payload }, { put, call, select }) {
      const { entityId, groupAnalyzeDimensionTypeEnum, callback } = payload;
      let distriCustomerQuota = [];
      // debugger;
      const params = {
        entityId,
        groupAnalyzeDimensionTypeEnum,
      }
      const response = yield call(GroupAnalyzeApiFp.bizGroupAnalyzeDimensionListGet, params); // GroupAnalyzeApiFp.bizGroupAnalyzeDimensionListGet({ entityId });
      // debugger;
      if (response.success) {
        distriCustomerQuota = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { distriCustomerQuota },
        })

        if (callback) callback(distriCustomerQuota);
      }
    },

    * getCustomerQuota({ payload }, { put, call, select }) {
      const { entityId, groupAnalyzeDimensionTypeEnum, callback } = payload;
      let customerQuota = [];
      // debugger;
      const params = {
        entityId,
        groupAnalyzeDimensionTypeEnum,
      }
      const response = yield call(GroupAnalyzeApiFp.bizGroupAnalyzeDimensionListGet, params); // GroupAnalyzeApiFp.bizGroupAnalyzeDimensionListGet({ entityId });
      if (response.success) {
        customerQuota = response.resultBody || [];
        yield put({
          type: 'updateState',
          payload: { customerQuota },
        })

        if (callback) callback(customerQuota);
      } else {
        notification.error({
          message: '获取自定义指标失败',
          description: response.errorMsg,
        });
      }
    },


    * getTagDistribution({ payload }, { put, call }) {
      let tagDistribution = [];
      const { tagEnglishName, expression } = payload;
      let response = null;
      switch (payload.TGItype) {
        case 'GROUP': {
          const params = {
            id: payload.groupId,
            tagEnglishName,
          }
          response = yield call(GroupApiFp.bizGroupQueryGroupTagDistributionIdGet, params);
          break;
        }
        case 'AUTOMATION': {
          const params = {
            tagEnglishName,
            bizAutoMarketingVO: expression,
          }
          response = yield AutoFp.bizAutoMarketingQueryGroupTagDistributionPost(params);
          break
        }
        case 'LIFE_AUTOMATION': {
          let { bizLifeTripInfoParam, groupExpression, type } = payload;
          response = yield LifeFp.bizLifeTripQueryGroupTagDistributionPost({
            bizLifeTripInfoParam,
            groupExpression,
            type,
            tagEnglishName,
          });
          break
        }
        case 'FUNNEL': {
          response = yield FunFp.bizFunnelTagDistributePost({
            expression,
            tagEnglishName,
          });
          break;
        }
        case 'LIFEFUNNEL': {
          let { bizLifeTripInfoParam, groupExpression, type } = payload;
          response = yield LifeFp.bizLifeTripQueryGroupTagDistributionPost({
            bizLifeTripInfoParam,
            groupExpression,
            type,
            tagEnglishName,
          });
          break;
        }
        case 'REPORT': {
          response = yield ReportApiFp.bizPerRecomTagDistributePost({ tagEnglishName, reportExpression: JSON.parse(expression) })
          break;
        }
        default:
          break;
      }
      if (response.success) {
        tagDistribution = Object.prototype.toString.call(response.resultBody) === '[object String]'
          ? JSON.parse(response.resultBody)
          : response.resultBody;

        yield put({
          type: 'updateState',
          payload: { tagDistribution },
        })
      } else {
        notification.error({
          message: '获取标签分布失败',
          description: response.errorMsg,
        });
      }
    },
    * getGroupDetailInfo({ payload }, { put }) {
      const { groupId, limit, columnNames, TGItype, entityId, expression } = payload;
      const params = {
        limit,
        columnNames,
        id: groupId,
      }
      let infoList = [];
      yield put({ // 初始化数据
        type: 'updateState',
        payload: { infoList },
      })
      let response = null;
      switch (TGItype) {
        case 'GROUP':
          response = yield GroupApiFp.bizGroupQueryGroupTagDetailInformationIdGet(params);
          break;
        case 'FUNNEL': {
          let TGIParamsCopy = _.cloneDeep(expression);
          delete TGIParamsCopy.TGItype
          response = yield FunFp.bizFunnelTagDetailPost({
            entityId,
            expression: JSON.stringify(TGIParamsCopy),
            columnNames,
          })
          TGIParamsCopy = null;
          break;
        }
        case 'LIFEFUNNNEL': {
          let TGIParamsCopy = _.cloneDeep(expression);
          delete TGIParamsCopy.TGItype;
          response = yield LifeFp.bizLifeTripQueryGroupTagDetailInformationPost({
            entityId,
            limit,
            type: TGIParamsCopy.type,
            groupExpression: JSON.stringify(TGIParamsCopy.groupExpression),
            bizLifeTripInfoParam: TGIParamsCopy.bizLifeTripInfoParam,
            columnNames,
          })
          TGIParamsCopy = null;
          break;
        }
        case 'REPORT': {
          response = yield ReportApiFp.bizPerRecomTagDetailPost({ columnNames, entityId, reportExpression: expression })
          break;
        }
        case 'AUTOMATION': {
          response = yield AutoFp.bizAutoMarketingQueryGroupTagDetailInformationPost({
            columnNames,
            entityId,
            bizAutoMarketingVO: JSON.stringify(expression),
          })
          break;
        }
        case 'LIFE_AUTOMATION': {
          let TGIParamsCopy = _.cloneDeep(expression);
          delete TGIParamsCopy.TGItype;
          response = yield LifeFp.bizLifeTripQueryGroupTagDetailInformationPost({
            entityId,
            limit,
            type: TGIParamsCopy.type,
            groupExpression: JSON.stringify(TGIParamsCopy.group_expression),
            bizLifeTripInfoParam: TGIParamsCopy.bizLifeTripInfoParam,
            columnNames,
          })
          break
        }
        default:
          break;
      }
      if (response.success) {
        infoList = response.resultBody;
        if (typeof infoList === 'string') infoList = JSON.parse(infoList)
        yield put({
          type: 'updateState',
          payload: { infoList },
        })
      } else {
        notification.error({
          message: '获取群组详情列表失败',
          description: response.errorMsg,
        });
      }
    },
    * addCustomQuota({ payload }, { put, call, select }) {
      const { entityId, dimensionType, bizGroupAnalyzeDimensionPOList, callback } = payload;
      const params = {
        bizGroupAnalyzeDimensionPOList,
      }
      const response = yield GroupAnalyzeApiFp.bizGroupAnalyzeDimensionAddPost(params);
      if (response.success) {
        // console.log('标签分布---添加成功');
        let type = 'getCustomerQuota';
        if (dimensionType === 'TAG_DISTRIBUTION') {
          type = 'getDistriCustomerQuota';
        }
        yield put({
          type,
          payload: {
            entityId,
            groupAnalyzeDimensionTypeEnum: dimensionType,
          },
        })
        if (callback) callback(true);
      } else {
        notification.error({
          message: '添加自定义指标失败',
          description: response.errorMsg,
        });
      }
    },
    * delCustomQuota({ payload }, { put, call, select }) {
      const { entityId, id, dimensionType, callback } = payload;
      const response = yield GroupAnalyzeApiFp.bizGroupAnalyzeDimensionDelIdDelete({ id });
      let success = false;
      if (response.success) {
        success = true;
        let type = 'getCustomerQuota';
        if (dimensionType === 'TAG_DISTRIBUTION') {
          type = 'getDistriCustomerQuota';
        }
        yield put({
          type,
          payload: {
            entityId,
            groupAnalyzeDimensionTypeEnum: dimensionType,
          },
        })
        if (callback) callback(success);
      } else {
        notification.error({
          message: '删除自定义指标失败',
          description: response.errorMsg,
        });
      }
    },
    * applyDownloadGroup({ payload }, { put, call, select }) {
      const { entityId, groupId, columnNames, columnCHNames, callback } = payload;
      const params = {
        columnNames,
        columnCHNames,
        id: groupId,
        sysEntityId: entityId,
      }
      const response = yield call(GroupApiFp.bizGroupSysEntityIdDownloadGroupTagDetailInformationIdGet, params);
      if (response.success) {
        callback(true);
      } else {
        notification.error({
          message: '申请下载群组数据失败',
          description: response.errorMsg,
        });
      }
    },
  },

  reducers: {
    updateState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});
