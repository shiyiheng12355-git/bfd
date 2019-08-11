import React, { Component, PropTypes } from 'react';
import { Form, Input, Select, Modal, InputNumber, Radio } from 'antd';
import moment from 'moment';
import lodash from 'lodash';
import styles from './ProductModal.less';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
@Form.create()
class ProductModal extends Component {
  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.update_time = moment.now();
        const resultFormat = {};
        const columns = this.getEntityColumns(values.entityId);
        values.resultFormat.forEach((key) => {
          const column = columns.find(col => col.columnName === key);
          if (column) resultFormat[key] = column.columnTitle;
        })
        values.resultFormat = JSON.stringify(resultFormat);
        values.recommendEnglishName = values.entityId; // 存储entityId
        const { node: { value } } = this.props; // 关系图保存的数据
        this.props.dispatch({
          type: 'marketing/recommendation/savePolicy',
          payload: { ...value, ...values },
          callback: () => {
            this.props.dispatch({ // 查询更新后的推荐配置数据
              type: 'marketing/recommendation/fetchCurrentRecomCfg',
              payload: { fieldId: value.fieldId },
            })
            this.props.onOk(values);
          },
        });
      }
    });
  }

  getEntityColumns = (entityId) => {
    let { recContentEntityList } = this.props;
    const entity = recContentEntityList.find(item => item.id === entityId);
    let columns = [];
    if (entity) {
      columns = columns.concat(entity.columns.idList).concat(entity.columns.detailList);
    }
    return columns;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let { recContentEntityList, node, currentRecomCfg = {} } = this.props;
    if (!node) return false;
    node = node || {};
    const value = node.value || {};
    const { entityId } = currentRecomCfg;
    const columns = this.getEntityColumns(entityId);
    let resultFormat = value.resultFormat ? Object.keys(JSON.parse(value.resultFormat)) : [];
    const selectedColumns = columns.filter(c => resultFormat.includes(c.columnName));
    if (selectedColumns.length !== resultFormat.length) { // 不是同一个实体
      resultFormat = [];
    }

    return (
      <Modal
        maskClosable={false}
        title='设置推荐内容'
        {...this.props}
        onOk={this.onOk}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label='推荐内容'>
            {
              getFieldDecorator('entityId', {
                initialValue: entityId,
                rules: [{ required: true, message: '必填字段' }],
              })(
                <RadioGroup>
                  {
                    recContentEntityList.map((_entity) => {
                      return (
                        <Radio
                          value={_entity.id}
                          key={_entity.id}>
                          {_entity.entityName}
                        </Radio>)
                    })
                  }
                </RadioGroup>
              )
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="规则名称"
          >{
              getFieldDecorator('ruleName', {
                initialValue: value.ruleName,
                rules: [{ required: true, message: '必填字段' },
                { max: 20, message: '最长不超过20个字符' }],
              })(<Input placeholder='请输入规则名称' />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            className={styles.numberRequired}
            label="返回结果数"
          >
            {
              getFieldDecorator('resultNum', {
                initialValue: value.resultNum,
                parser: str => parseInt(str, 10),
                formater: int => int.toString(),
                rules: [
                  {
                    validator: (rule, _value, callback) => {
                      if (_value === '' || _value === undefined) return callback('必填字段');
                      if (_value && !lodash.isNumber(_value)) return callback('应为整数');
                      if (_value > 299 || _value < 1) return callback('应大于0且小于300');
                      return callback();
                    },
                  }],
              })(<InputNumber min={1} step={1} max={299} />)
            }
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='返回结果格式'
          >
            {getFieldDecorator('resultFormat', {
              initialValue: resultFormat,
              rules: [{ required: true, message: '必填字段' }],
            })(
              <Select mode="multiple">{
                columns.map((item) => {
                  return (
                    <Option key={`${item.columnName}`}
                      value={`${item.columnName}`}>
                      {item.columnTitle}
                    </Option>
                  )
                })
              }</Select>)
            }

          </FormItem>
        </Form>
      </Modal>);
  }
}

ProductModal.propTypes = {
};

export default ProductModal;
