import React, { Component } from 'react';
import { Tabs, Modal, Table, Button, Select, Checkbox, Icon, Radio, Input, message } from 'antd';
import uuidV4 from 'uuid/v4'
import { connect } from 'dva';
import AddBasicModal from './CreateModal';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const confirm = Modal.confirm;

/* @connect(state => (
	{
		tabData: state['gloablConfig/basicUserConfig'].tabData,
		detailList: state['gloablConfig/basicUserConfig'].detailList,
		idList: state['gloablConfig/basicUserConfig'].idList,
		categoryList: state['gloablConfig/basicUserConfig'].categoryList,
		templateList: state['gloablConfig/basicUserConfig'].templateList,
	}
)) */

@connect(state => (
  {
    data: state['gloablConfig/basicUserConfig'],
    auths: state.user.auths,
  }
))

export default class BaseConfig extends Component {
  state = {
    columnsID: [
      {
        title: '数据库字段名称',
        dataIndex: 'columnName',
        width: '18%',
        render: (text, record) => {
          if (record.newId) {
            return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnName', 'input') }} />
          } else {
            return text
          }
        },
      },
      {
        title: '页面字段显示名称',
        dataIndex: 'columnTitle',
        width: '18%',
        render: (text, record) => {
          if (record.newId) {
            return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnTitle', 'input') }} />
          } else {
            return text
          }
        },
      },
      {
        title: '字段类型',
        dataIndex: 'dbColumnType',
        width: '10%',
        render: (text, record) => {
          if (record.newId) {
            return (
              <Select style={{ width: 120 }} defaultValue='int' onChange={(e) => { this.handleChangeCoulmn(e, record, 'dbColumnType', '') }}>
                <Option value='int'>int</Option>
                <Option value='float'>float</Option>
                <Option value='bool'>bool</Option>
                <Option value='string'>string</Option>
              </Select>
            )
            // return <Input style={{ width: 60 }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'dbColumnType', 'input') }} />
          } else {
            return text
          }
        },
      },
      {
        title: '权限控制',
        dataIndex: 'operation',
        width: '18%',
        render: (text, record) => {
          const { saveData } = this.state
          let savedCheckedRow = null
          let savedCheckedColumn = null
          saveData.map((item) => {
            if (item.id === record.id && item.configType === record.configType) {
              savedCheckedRow = item.isRowAuthor
              savedCheckedColumn = item.isColumnAuthor
            }
          })
          return (<div>
            {/* <Checkbox
							checked={savedCheckedRow !== null ? savedCheckedRow : record.isRowAuthor}
							onChange={(e) => { this.handleChangeCoulmn(e, record, 'isRowAuthor', 'checkbox') }}>行权限</Checkbox> */}
            <Checkbox
              checked={savedCheckedColumn !== null ? savedCheckedColumn : record.isColumnAuthor}
              onChange={(e) => { this.handleChangeCoulmn(e, record, 'isColumnAuthor', 'checkbox') }}>列权限</Checkbox>
          </div>)
        },
      },
      {
        title: '系统脱敏模板',
        dataIndex: 'safteTemplateId',
        width: '18%',
        render: (text, record) => {
          return this.renderTableSelect(text, record, 'safteTemplateId')
        },
      },
      {
        title: '操作',
        dataIndex: 'rowAuthorRootCode',
        width: '18%',
        render: (text, record, index) => {
          return <a href="javascript:;" onClick={() => { this.handleDel(record, index) }}>删除</a>
          // return this.renderTableSelect(text, record, 'rowAuthorRootCode', index)
        },
      },
    ],
    columnsPro: [
      {
        title: '数据库字段名称',
        dataIndex: 'columnName',
        width: '18%',
        render: (text, record) => {
          if (record.newId) {
            return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnName', 'input') }} />
          } else {
            return text
          }
        },
      },
      {
        title: '页面字段显示名称',
        dataIndex: 'columnTitle',
        width: '18%',
        render: (text, record) => {
          if (record.newId) {
            return <Input style={{ width: '100%' }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'columnTitle', 'input') }} />
          } else {
            return text
          }
        },
      },
      {
        title: '字段类型',
        dataIndex: 'dbColumnType',
        width: '10%',
        render: (text, record) => {
          if (record.newId) {
            return (
              <Select style={{ width: 120 }} defaultValue='int' onChange={(e) => { this.handleChangeCoulmn(e, record, 'dbColumnType', '') }}>
                <Option value='int'>int</Option>
                <Option value='float'>float</Option>
                <Option value='bool'>bool</Option>
                <Option value='string'>string</Option>
              </Select>
            )
            // return <Input style={{ width: 60 }} onChange={(e) => { this.handleChangeCoulmn(e, record, 'dbColumnType', 'input') }} />
          } else {
            return text
          }
        },
      },
      {
        title: '权限控制',
        dataIndex: 'operation',
        width: '18%',
        render: (text, record) => {
          const { saveData } = this.state
          let savedCheckedRow = null
          let savedCheckedColumn = null
          saveData.map((item) => {
            if (item.id === record.id && item.configType === record.configType) {
              savedCheckedRow = item.isRowAuthor
              savedCheckedColumn = item.isColumnAuthor
            }
          })
          return (<div>
            <Checkbox
              checked={savedCheckedRow !== null ? savedCheckedRow : record.isRowAuthor}
              onChange={(e) => { this.handleChangeCoulmn(e, record, 'isRowAuthor', 'checkbox') }}>行权限</Checkbox>
            {/* <Checkbox
							checked={savedCheckedColumn !== null ? savedCheckedColumn : record.isColumnAuthor}
							onChange={(e) => { this.handleChangeCoulmn(e, record, 'isColumnAuthor', 'checkbox') }}>列权限</Checkbox> */}
          </div>)
        },
      },
			/* {
				title: '系统脱敏模板',
				dataIndex: 'safteTemplateId',
				width: '18%',
				render: (text, record) => {
					return this.renderTableSelect(text, record, 'safteTemplateId')
				},
			}, */
      {
        title: '操作',
        dataIndex: 'rowAuthorRootCode',
        width: '18%',
        render: (text, record, index) => {
          return this.renderTableSelect(text, record, 'rowAuthorRootCode', index)
        },
      },
    ],
    saveData: [],
    selectVal: null,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'gloablConfig/basicUserConfig/fetchTabData',
    })
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: {
        parentKey: 'xtgl_qjpz_stpz',
      },
    });
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: {
        parentKey: 'xtgl_qjpz_stpz_cj',
      },
    });
  }

  handleChangeCoulmn = (e, item, key, type) => {
    let value
    switch (type) {
      case 'input':
        value = e.target.value
        break;
      case 'checkbox':
        value = e.target.checked ? 1 : 0
        break;
      default:
        value = e
        break;
    }
    const { saveData } = this.state
    const hasKey = saveData.findIndex((x) => {
      return x.id === item.id && x.configType === item.configType
    })
    item[key] = value
    if (hasKey === -1) {
      saveData.push(item)
    } else {
      saveData[hasKey][key] = value
    }
    this.props.dispatch({
      type: 'gloablConfig/basicUserConfig/updataData',
      payload: { item },
    })
  }

  handleDel = (item, index) => {
    const { saveData } = this.state
    const hasKey = saveData.findIndex((x) => {
      return x.id === item.id && x.configType === item.configType
    })
    if (hasKey !== -1) {
      saveData.splice(hasKey, 1)
    }

    confirm({
      content: '是否删除该条数据？',
      onOk: () => {
        if (item.newId) {
          this.props.dispatch({
            type: 'gloablConfig/basicUserConfig/delObj',
            payload: { configType: item.configType, index },
          })
        } else {
          this.props.dispatch({
            type: 'gloablConfig/basicUserConfig/fetchDelItem',
            payload: item.id,
          })
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  handleChange = (e) => {
    const value = e.target.value
    if (value !== 'add') {
      this.setState({ selectVal: value })
      this.props.dispatch({
        type: 'gloablConfig/basicUserConfig/fetchTableData',
        payload: value,
      })
    } else {
      this.props.dispatch({
        type: 'gloablConfig/basicUserConfig/openModal',
        payload: true,
      })
    }
  }

  handleAddObj = (type, list) => {
    const { templateList, categoryList, tabData } = this.props.data
    const { saveData } = this.state
    let dictionaryCode = ''
    categoryList.length === 0 || !categoryList[0].dictionaryCode ? dictionaryCode = '' : dictionaryCode = categoryList[0].dictionaryCode
    const obj = {
      columnName: '',
      columnTitle: '',
      configType: type,
      dbColumnType: 'int',
      isColumnAuthor: 0,
      isRowAuthor: 0,
      id: uuidV4(),
      newId: uuidV4(),
      entityId: this.state.selectVal || tabData[0].id,
      rowAuthorRootCode: dictionaryCode,
      safteTemplateId: templateList[0].id || '',
    }
    saveData.push(obj)
    this.setState({ saveData })
    this.props.dispatch({
      type: 'gloablConfig/basicUserConfig/addObj',
      payload: obj,
    })
  }

  handleSave = () => {
    const { saveData } = this.state
    const reg = new RegExp('^[-_.A-Za-z0-9\u4e00-\u9fa5]+$')
    if (saveData.length !== 0) {
      const nullFlag = saveData.every((item, i, a) => {
        return item.columnName !== '' && item.columnTitle !== ''
      })
      const lenFlag = saveData.every((item, i, a) => {
        return item.columnName.length <= 20 && item.columnTitle.length <= 20
      })
      const regFlag = saveData.every((item, i, a) => {
        return reg.test(item.columnName) && reg.test(item.columnTitle)
      })
      if (!nullFlag) {
        message.warning('数据库字段名称和页面字段显示名称不能为空')
        return false
      }
      if (!lenFlag) {
        message.warning('数据库字段名称和页面字段显示名称不能超过20个字')
        return false
      }
      if (!regFlag) {
        message.warning('数据库字段名称和页面字段显示名称只能输入中文、英文、数字和_-.')
        return false
      }
      saveData.map((item) => {
        if (item.newId) {
          item.id = ''
          delete item.newId
        }
      })
      this.props.dispatch({
        type: 'gloablConfig/basicUserConfig/fetchSaveData',
        payload: saveData,
        callback: () => {
          this.setState({ saveData: [] })
        },
      })
    }

    // this.setState({ saveData: [] })
  }

  handleReset = () => {
    this.setState({ saveData: [] })
    this.props.dispatch({
      type: 'gloablConfig/basicUserConfig/fetchTabData',
    })
  }

  handleSuccess = (type, data) => {
    if (type) {
      this.props.dispatch({
        type: 'gloablConfig/basicUserConfig/fetchSaveEntity',
        payload: data,
      })
    }
    this.setState({ visible: false })
  }

  renderTableSelect = (text, record, type, index) => {
    const { saveData } = this.state
    const selectList = type === 'safteTemplateId' ? this.props.data.templateList : this.props.data.categoryList
    const selectedVal = type === 'safteTemplateId' ? 'id' : 'dictionaryCode'
    const selectedLabel = type === 'safteTemplateId' ? 'templateName' : 'dictionaryLabel'
    const hasTag = type === 'safteTemplateId' ? 'isColumnAuthor' : 'isRowAuthor'

    const hasKey = saveData.findIndex((x) => {
      return x.id === record.id && x.configType === record.configType
    })
    let option = []
    let savedText = null
    selectList && selectList.map((item, i) => {
      option.push(
        <Option key={item.id} value={item[selectedVal]}>{item[selectedLabel]}</Option>
      )
    })
    if (hasKey === -1) {
      if (!record[hasTag]) {
        return type === 'safteTemplateId' ? '' : <a style={{ marginLeft: 16 }} href="javascript:;" onClick={() => { this.handleDel(record, index) }}>删除</a>
      } else {
        savedText = record[type]
        return (<div>
          <Select style={{ width: 120 }} value={savedText || text} onChange={(value) => { this.handleChangeCoulmn(value, record, type) }}>{option}</Select>
          {type === 'safteTemplateId' ? '' : <a style={{ marginLeft: 16 }} href="javascript:;" onClick={() => { this.handleDel(record, index) }}>删除</a>}
        </div>)
      }
    } else if (hasKey !== -1) {
      if (!saveData[hasKey][hasTag]) {
        return type === 'safteTemplateId' ? '' : <a style={{ marginLeft: 16 }} href="javascript:;" onClick={() => { this.handleDel(record, index) }}>删除</a>
      } else {
        savedText = saveData[hasKey][type]
        return (<div>
          <Select style={{ width: 120 }} value={savedText || text} onChange={(value) => { this.handleChangeCoulmn(value, record, type) }}>{option}</Select>
          {type === 'safteTemplateId' ? '' : <a style={{ marginLeft: 16 }} href="javascript:;" onClick={() => { this.handleDel(record, index) }}>删除</a>}
        </div>)
      }
    }
  }

  renderTabs = (list) => {
    const { selectVal } = this.state
    return list && list.length !== 0 ?
      <div>
        <Radio.Group value={selectVal || list[0].id} onChange={this.handleChange}>
          {
            list.length !== 0 && list.map((item, i) => {
              return (
                <Radio.Button value={item.id} key={item.id}>{item.entityName}</Radio.Button>
              )
            })
          }
          {this.props.auths.includes('xtgl_qjpz_stpz_cj') &&
            <Radio.Button value='add'><Icon type="plus" /></Radio.Button>}
        </Radio.Group>

      </div>
      : (
        <Radio.Group onChange={this.handleChange}>
          <Radio.Button value='add'><Icon type="plus" /></Radio.Button>
        </Radio.Group>
      )
  }

  render() {
    const { columnsID, columnsPro, saveData } = this.state
    const { auths, data } = this.props
    const { tabData, idList, detailList, visible } = data
    return (
      <div>
        {this.renderTabs(tabData)}
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 8, overflow: 'hidden' }}>ID明细表：<Button style={{ float: 'right' }} type='primary' onClick={() => { this.handleAddObj(1) }}>增加字段</Button></div>
          <Table
            columns={columnsID}
            dataSource={idList}
            pagination={false}
          />
        </div>
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 8, overflow: 'hidden' }}>属性明细表：<Button style={{ float: 'right' }} type='primary' onClick={() => { this.handleAddObj(2) }}>增加字段</Button></div>
          <Table
            columns={columnsPro}
            dataSource={detailList}
            pagination={false}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <Button onClick={this.handleSave} type="primary" style={{ marginRight: 16 }}>保存</Button>
          <Button onClick={this.handleReset}>重置</Button>
        </div>
        <AddBasicModal {...this.props} visible={visible} isSuccess={this.handleSuccess} />
      </div>
    );
  }
}
