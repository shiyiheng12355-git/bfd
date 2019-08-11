import React, { Component } from 'react';
import { Row, Col, Button, Collapse, Checkbox, Radio, Table, Modal, Icon, Select, notification } from 'antd'
import { connect } from 'dva'
import _ from 'lodash'
import LineChart from './LineChart'

const Panel = Collapse.Panel;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const Option = Select.Option;

@connect(state => (
  {
    menuList: state['report/eventReport'].menuList, //  收藏菜单
    chartData: state['report/eventReport'].chartData, // 图表数据
  }
))

export default class ReportChart extends Component {
  state = {
    checkLabel: [
      {
        label: '事件触发用户数',
        value: 'event_user',
      },
      {
        label: '事件触发总次数',
        value: 'event_number',
      },
    ],
    columns: [
      {
        title: '维度',
        dataIndex: 'dimension',
      },
      {
        title: '事件触发数',
        dataIndex: 'actionNum',
      },
      {
        title: '事件触发用户数',
        dataIndex: 'userNum',
      },
    ],
    index: ['event_user', 'event_number'],
    radioLabel: [],
    radioVal: null,
    visible: false,
    panel: '',
    collectionName: '',
    menuId: null,
    clientName: '',
    eventName: '',
    dimensionName: '',
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'report/eventReport/fetchMenuList',
    })
    this.renderDimensionRadio()
    this.editName()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.reportCount !== nextProps.reportCount) {
      this.renderDimensionRadio(nextProps)
      this.editName(nextProps)
    }
  }

  getTitmeName = (list, data, type) => {
    return list.length !== 0 && list.find((x) => {
      return x[type] === data
    })
  }

  handleOpenCollect =() => {
    const { menuList } = this.props
    if (!menuList || menuList.length === 0) {
      notification.open({
        message: '提示',
        description: '请先创建收藏夹',
        icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
      });
    } else {
      this.setState({ visible: true })
    }
  }

  changeIndex = (val) => {
    if (val.length === 0) return
    this.setState({ index: val })
  }

  changeRadio = (e) => {
    this.props.dispatch({
      type: 'report/eventReport/setRadioDimension',
      payload: e.target.value,
    })
  }

  openPanel = (key) => {
    this.setState({ panel: key })
  }

  handleCollectName = (e) => {
    this.setState({ collectionName: e.target.value })
  }

  handleCollectMenu = (value) => {
    this.setState({ menuId: value })
  }

  handleOk = () => {
    this.setState({ panel: '2' })
    const { index } = this.state
    this.props.changeReport(index, 'report')
  }

  handleCancle = () => {
    this.setState({ panel: '2' })
  }

  ModalOk = () => {
    const { menuId, clientName, eventName, dimensionName } = this.state
    const {
      menuList,
      reportParams,
      date,
      entityId,
      dimensionList,
      selectedDimension,
      clientList,
      appkey,
      eventList,
      selectedEventData,
      radioDimension,
    } = _.cloneDeep(this.props)
    reportParams.groupExpression = JSON.parse(reportParams.groupExpression)
    if (date.point === '') {
      delete reportParams.groupExpression.action.date
      reportParams.groupExpression.action.date = { period: date.period }
    } else {
      delete reportParams.groupExpression.action.date
      reportParams.groupExpression.action.date = { point: date.point }
    }
    const collectionName = `[${clientName}] [${eventName}] 以[${dimensionName}]查看`
    this.props.dispatch({
      type: 'report/eventReport/fetchCollect',
      payload: {
        collectionName,
        menuId: menuId || menuList[0].id,
        entityId,
        contentJson: JSON.stringify(reportParams),
      },
      callback: () => {
        this.setState({ visible: false })
      },
    })
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  editName = (props = this.props) => {
    const {
      clientList,
      appkey,
      eventList,
      selectedEventData,
      dimensionList,
      radioDimension,
    } = props
    const clientName = this.getTitmeName(clientList, appkey, 'appkey') ? this.getTitmeName(clientList, appkey, 'appkey').appkeyName : ''
    const eventName = this.getTitmeName(eventList, selectedEventData, 'id') ? this.getTitmeName(eventList, selectedEventData, 'id').action_name_cn : ''
    const dimensionName = this.getTitmeName(dimensionList, radioDimension, 'paramId') ? this.getTitmeName(dimensionList, radioDimension, 'paramId').paramBizDesc : ''
    this.setState({ clientName, eventName, dimensionName })
  }

  renderDimensionRadio = (props = this.props) => {
    const { dimensionList, selectedDimension } = props
    const { radioLabel } = this.state
    radioLabel.length = 0
    selectedDimension.length !== 0 && dimensionList.length !== 0 ? _.uniq(selectedDimension).map((item, i) => {
      dimensionList.find((x) => {
        return x.paramId === item
      })
        ? radioLabel.push(
          {
            label: dimensionList.find((x) => {
              return x.paramId === item
            }).paramBizDesc,
            value: dimensionList.find((x) => {
              return x.paramId === item
            }).paramId,

          }
        ) : ''
    }) : ''
    this.setState({ radioLabel })
  }

  render() {
    const {
      reportParams,
      menuList,
      chartData,
      radioDimension,
    } = this.props

    const {
      checkLabel,
      radioLabel,
      panel,
      visible,
      columns,
      menuId,
      clientName,
      eventName,
      dimensionName,
    } = this.state
    const groupExpression = reportParams.groupExpression ? JSON.parse(reportParams.groupExpression) : ''
    columns[0].title = dimensionName
    return (
      <div>
        <Row type="flex" justify="space-around" align="middle">
          <Col span={12}>
            <span style={{ color: '#0099cc', fontWeight: 'bold' }}>[{clientName}]</span>&nbsp;&nbsp;<span style={{ color: '#0099cc', fontWeight: 'bold' }}>[{eventName}]</span>&nbsp;&nbsp;以 &nbsp;&nbsp;<span style={{ color: '#0099cc', fontWeight: 'bold' }}>[{dimensionName}]</span>&nbsp;&nbsp;查看
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button type='primary' onClick={this.handleOpenCollect}>收藏报表</Button>
          </Col>
        </Row>
        <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }} gutter={16}>
          <Col span={8}>
            <Collapse style={{ background: '#108ee9' }} activeKey={panel} onChange={this.openPanel}>
              <Panel style={{ color: '#fff' }} header="指标 / 事件 / 维度" key="1">
                <div>
                  <label>指标：</label>
                  <CheckboxGroup options={checkLabel} value={this.state.index} onChange={this.changeIndex} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label>事件：</label>
                  <Checkbox checked disabled>{eventName}</Checkbox>
                </div>
                <div style={{ marginTop: 8 }}>
                  <label>维度：</label>
                  {
                    radioLabel.length !== 0 ?
                      <RadioGroup options={radioLabel} value={radioDimension} onChange={this.changeRadio}>
                        {
                          radioLabel.map((item, i) => {
                            <Radio key={i} value={item.value}>{item.label}</Radio>
                          })
                        }
                      </RadioGroup>
                    : ''
                  }
                </div>
                <div style={{ marginTop: 16 }}>
                  <Button style={{ marginRight: 16 }} type='primary' onClick={this.handleOk}>确定</Button>
                  <Button onClick={this.handleCancle}>取消</Button>
                </div>
              </Panel>
            </Collapse>
          </Col>
          <Col span={8}>
            {
              groupExpression ? `${groupExpression.action.date.start_date} 至 ${groupExpression.action.date.end_date}` : ''
            }
          </Col>
          <Col span={8}>
          </Col>
        </Row>
        <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }}>
          <Col span={24}>
            <LineChart downloadName={`[${clientName}] [${eventName}] 以[${dimensionName}]查看`} {...this.props} {...this.state} />
          </Col>
          <Col span={24} style={{ marginTop: 16 }}>
            <Table
              columns={columns}
              dataSource={chartData}
            />
          </Col>
        </Row>
        <Row type="flex" justify="space-around" align="middle" style={{ marginTop: 16 }}>
          <Col span={24}>
          </Col>
        </Row>
        <Modal
          title="收藏报表"
          visible={visible}
          onOk={this.ModalOk}
          onCancel={this.hideModal}
          okText="确认"
          cancelText="取消"
        >
          <Row type="flex" justify="space-around" align="middle">
            {/* <Col span={6} style={{ textAlign: 'right' }}>
              <label>报表名称：</label>
            </Col>
            <Col span={18}>
              <Input value={this.state.collectionName} style={{ width: 160 }} onChange={this.handleCollectName} />
            </Col> */}
         </Row>
          <Row type="flex" justify="space-around" align="middle">
            <Col span={6} style={{ textAlign: 'right' }}>
              <label>添加到菜单：</label>
            </Col>
            <Col span={18}>
              {
                menuList.length !== 0 ? <Select style={{ width: 160 }} value={menuId || menuList[0].id} onChange={this.handleCollectMenu}>
                {
                  menuList.map((item, i) => {
                    return (<Option value={item.id} key={i}>{item.menuName}</Option>)
                  })
                }
                </Select> : ''
              }
            </Col>
          </Row>
        </Modal>
      </div>
    )
  }
}