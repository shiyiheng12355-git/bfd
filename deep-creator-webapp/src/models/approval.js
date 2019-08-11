import { 
  queryConfigEntityList, 
  queryAuditsBars, 
  queryApplyTypeList, 
  queryApplyStatusList, 
  queryAuditsByCons, 
  deleteApply,
  queryDevUser, 
  updateAuditResult,
} from '../services/api';
import { message } from 'antd';

function* getData (api, params, call){
  let response = yield call(api, params)
  let promise = response.json()
  let data = yield promise.then(res => res)
  return data
}

export default {
  namespace: 'approval',
  state: {
    currentPage    : '',                // 当前页面
    tagType        : '',                // 标签类型 1: 标签分类 2: 标签名称
    modalTitle     : '',                // 审批弹框标题
    approvalType   : '',                // 申请类型 1: 新增 2: 修改 3: 废弃
    data           : {},                // 标签数据
    radioValue     : '1',               // 审批弹框 通过/不通过
    selectValue    : undefined,         // 审批弹框 指派开发人员
    entityList     : [],                // 实体列表
    entityId_chart : '',                // 柱状图实体
    entityId_table : '',                // 表格实体
    chartData      : [],                // 柱状图数据
    xAxis          : [],                // 柱状图横坐标
    applyTypeList  : [],                // 申请类型列表
    applyType      : '',                // 申请类型
    applyStatusList: [],                // 申请状态列表
    applyStatus    : '',                // 申请状态
    applyTagName   : '',                // 申请名称
    tableData      : [],                // 表格数据
    total          : '',                // 数据总数
    current        : 1,                 // 当前页数
    searchOption   : {},                // 搜索条件
    devUserList    : [],                // 开发者列表
  },
  effects: {
    *init({ payload }, { call, put, select }) {
      // 实体查询
      let response_entity = yield getData(queryConfigEntityList, '', call)
      response_entity.resultBody.map(v => {
        v.entityName === '客户' && (v.entityName = '客户标签申请')
        v.entityName === '产品' && (v.entityName = '产品标签申请')
      })
      response_entity.resultBody.unshift({ entityName: '全部申请', id: '' })

      
      if(response_entity.success) {
        yield put({
          type: 'save',
          payload: { 
            entityList: response_entity.resultBody, 
            entityId_chart: '', 
            entityId_table: '' 
          },
        });
      }

      // 申请类型查询
      let response_applyType = yield getData(queryApplyTypeList, '', call)
      response_applyType.resultBody.unshift({ applyTypeName: '全部类型', applyType: '' })

      if(response_applyType.success) {
        yield put({
          type: 'save',
          payload: { 
            applyTypeList: response_applyType.resultBody, 
            applyType: '',
          },
        });
      }

      // 审批状态查询
      let applyStatusList = payload.page === 'Apply' ? [
        {applyStatus: '', applyStatusName: '全部状态'},
        {"applyStatus":1,"applyStatusName":"审批中"},
        {"applyStatus":2,"applyStatusName":"开发中"},
        {"applyStatus":3,"applyStatusName":"发布中"},
        {"applyStatus":4,"applyStatusName":"已上线"},
        {"applyStatus":5,"applyStatusName":"已废止"},
        {"applyStatus":6,"applyStatusName":"审批拒绝"},
        {"applyStatus":7,"applyStatusName":"发布拒绝"}
      ] : payload.page === 'Approval' ? [{"applyStatus":1,"applyStatusName":"审批中"}] 
        : payload.page === 'Develop' ? [{"applyStatus":2,"applyStatusName":"开发中"}] 
        : [{"applyStatus":3,"applyStatusName":"发布中"}]

      let applyStatus = payload.page === 'Apply' ? '' :
                        payload.page === 'Approval' ? 1 : 
                        payload.page === 'Develop' ? 2 : 3

      yield put({
        type: 'save',
        payload: { 
          applyStatusList, 
          applyStatus,
        },
      });

      // 申请名称,开发者
      yield put({
        type: 'save',
        payload: { 
          applyTagName: '', 
          selectValue: undefined
        },
      });

      // 表格查询及查询条件
      let data = {
        entityId    : '',
        applyType   : '',
        aduitStatus : applyStatus,
        applyTagName: '',
        pageNum     : 1,
        pageSize    : 10,
        nodeId      : payload.page === 'Apply' ? 1 : ''
      }
      let response_table = yield getData(queryAuditsByCons, data, call)
		
      if(response_table.success) {
        response_table.resultBody.list.forEach((v,i) => { v.key = i })
        yield put({
          type: 'save',
          payload: { 
            searchOption: data,
            tableData: response_table.resultBody.list, 
            total: response_table.resultBody.total,
            current: 1,
          },
        });
      }

      // 获取图表数据
      if(payload.page === 'Apply'){  
        let { resultBody, success } = yield getData(queryAuditsBars, '', call)

        if(success) {
          yield put({
            type: 'save',
            payload: { 
              chartData: resultBody.series && resultBody.series.length > 0 ? resultBody.series : [[], []], 
              xAxis: resultBody.xAxis,
            },
          });
        }
      }
    },
    *chartChange({ payload }, { call, put, select }) {
      let { resultBody, success } = yield getData(queryAuditsBars, payload.entityId, call)

      if(success) {
        yield put({
          type: 'save',
          payload: { 
            entityId_chart: payload.entityId,
            chartData: resultBody.series && resultBody.series.length > 0 ? resultBody.series : [[], []], 
            xAxis: resultBody.xAxis,
          },
        });
      }
    },
    *handleSearch({ payload }, { call, put, select }) {
      const approval = yield select(state => state['approval'])
      const { entityId_table, applyType, applyStatus, applyTagName } = approval

      let data = {
        entityId: entityId_table,
        applyType,
        aduitStatus: applyStatus,
        applyTagName,
        pageNum    : 1,
        pageSize   : 10,
        nodeId     : payload || '',
      }

      let { success, resultBody } = yield getData(queryAuditsByCons, data, call)

      if(success) {
        resultBody.list.forEach((v,i) => { v.key = i })
        yield put({
          type: 'save',
          payload: { 
            searchOption: data,
            tableData: resultBody.list, 
            total: resultBody.total,
            current: 1,
          },
        });
      }
    },
    *pageChange({ payload }, { call, put, select }) {
      const approval = yield select(state => state['approval'])
      let data = approval.searchOption
      data.pageNum = payload.page

      let response_table = yield getData(queryAuditsByCons, data, call)
 
      if(response_table.success) {
        response_table.resultBody.list.forEach((v,i) => { v.key = i })
        yield put({
          type: 'save',
          payload: { 
            searchOption: data,
            tableData: response_table.resultBody.list, 
            total: response_table.resultBody.total,
            current: payload.page,
          },
        });
      }
    },
    *deleteOk({ payload }, { call, put, select }) {
      let { success, resultBody } = yield getData(deleteApply, payload.id, call)

      if(success) {
        message.success(resultBody)
        
      }else{
        message.error(resultBody)
      }
    },
    *openModal({ payload }, { call, put, select }) {
      console.log(payload)
      console.log(JSON.parse(payload.record.tagContent))
      yield put({
        type: 'save',
        payload: { 
          currentPage: payload.page,
          tagType: payload.record.tagType,
          modalTitle: payload.record.applyDemand + '申请', 
          approvalType: payload.record.applyType,
          data: payload.record
        },
      })
    },
    *radioChange({ payload }, { call, put, select }) {
      yield put({
        type: 'save',
        payload: { 
          radioValue: payload.value,
        },
      })
    },
    *selectChange({ payload }, { call, put, select }) {
      yield put({
        type: 'save',
        payload: { 
          [payload.key]: payload.value,
        },
      })
    },
    *queryDevUser({ payload }, { call, put, select }) {
      let { success, resultBody } = yield getData(queryDevUser, '', call)
      if(success) {
        yield put({
          type: 'save',
          payload: { 
            devUserList: resultBody,
            selectValue: resultBody[0].userName || undefined
          },
        })
      }
    },
    *modalOk({ payload }, { call, put, select }) {
      const approval = yield select(state => state['approval'])

      if(approval.currentPage !== 'Apply') {
        let data = {
          id: approval.data.id,
          auditResult: approval.radioValue,
          auditStatus: approval.data.auditStatus,
          devUser: approval.selectValue,
        }

        let { success, resultBody } = yield getData(updateAuditResult, data, call)

        if(success) {
          message.success('更新成功')
        }else{
          message.error('更新失败')
        }
      }
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
  },
};
