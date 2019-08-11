import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, notification } from 'antd';
import FilterModal from './FilterModal';
import uuid from 'uuid';
import lodash from 'lodash';
import { format } from 'util';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';
import styles from './RecomListPane.less';

class RecomListPane extends Component {
  state = {
    formatColumn: null,
  }

  componentWillMount() {
    let { fromGroup, toGroup, strategy, toRuleId } = this.props;
    if (!fromGroup) return false;

    const param1 = { fromGroupId: fromGroup.id };
    if (toGroup) { param1.toGroupId = toGroup.id; }
    if (toRuleId) { param1.fieldId = toRuleId }

    this.props.dispatch({ // 第一次载入列表，载入推荐对象的前5列，推荐内容的第一列
      type: 'marketing/strategy/fetchGroupColumns',
      payload: param1,
      callback: (groupColumns) => {
        const { fromColumns, toColumns } = groupColumns;
        if (!fromColumns || !toColumns) return notification.error({ message: '没有可供推荐的列，请尝试其他配置' });
        const firstToColumnKey = lodash.first(lodash.keys(toColumns));
        const first5FromColumnKeys = lodash.keys(fromColumns).slice(0, 5);
        strategy = strategy || {};
        const _groupColumns = {
          fromColumns: lodash.pick(fromColumns, first5FromColumnKeys),
          toColumns: lodash.pick(toColumns, [firstToColumnKey]),
        };
        if (strategy && strategy.firstColumns) { //编辑策略营销
          const oldKeys = strategy.firstColumns.split(',');
          const oldColumns = lodash.pick(fromColumns, oldKeys);
          if (Object.keys(oldColumns).length) _groupColumns.fromColumns = oldColumns;
        }

        if (strategy && strategy.secondColumns) {
          const oldKey = strategy.secondColumns;
          const oldColumns = lodash.pick(toColumns, [oldKey]);
          if (Object.keys(oldColumns).length) _groupColumns.toColumns = oldColumns;
        }

        this.setState({ formatColumn: this.handleFormatColumn(_groupColumns) }, () => {
          this.props.onChange(this.state.formatColumn);
          this.handleFetchData()
        });
      },
    })
  }

  handleFetchData = () => {
    const { fromGroup, toGroup, toRuleId } = this.props;
    const { formatColumn } = this.state;
    if (!fromGroup) return;

    const param1 = { fromGroupId: fromGroup.id };
    if (toGroup) { param1.toGroupId = toGroup.id; }
    if (toRuleId) { param1.fieldId = toRuleId }

    this.props.dispatch({ // 第一次载入列表，载入所有列
      type: 'marketing/strategy/fetchGroupColumns',
      payload: param1,
      callback: () => {
        const param2 = {
          limit: 10,
          firstColumns: formatColumn.firstColumns.join(','),
          secondColumns: formatColumn.secondColumns,
          ...param1,
        };

        this.props.dispatch({
          type: 'marketing/strategy/fetchRecomList',
          payload: param2,
        })
      },
    })
  }


  state = { showFilter: false }

  onCancel = () => {
    this.setState({ showFilter: false });
  }

  // 根据传入的groupColumns参数，转换成其他数据结构
  handleFormatColumn = (groupColumns) => {
    const { fromColumns = {}, toColumns = {} } = groupColumns;
    let r = { firstColumns: [], secondColumns: [], columns: [] };
    r.firstColumns = Object.keys(fromColumns);
    r.secondColumns = Object.keys(toColumns)[0];
    const columnKeys = r.firstColumns; // 只处理第一列
    r.columns = columnKeys.map((key) => {
      return { dataIndex: key, title: fromColumns[key] };
    })
    r.columns.push({
      title: toColumns[r.secondColumns],
      dataIndex: 'recommendedProductCode',
    });
    return r;
  }

  render() {
    let { groupColumns, recomList, loading } = this.props;
    const { fromColumns, toColumns } = groupColumns;
    const { showFilter, formatColumn } = this.state;
    if (!formatColumn) return false;

    const modalProps = {
      visible: showFilter,
      groupColumns,
      onCancel: this.onCancel,
      onOk: (values) => {
        this.setState({ showFilter: false });
        const _groupColumns = {};
        _groupColumns.fromColumns = lodash.pick(fromColumns, values.firstColumns);
        _groupColumns.toColumns = lodash.pick(toColumns, [values.secondColumns]);
        this.setState({ formatColumn: this.handleFormatColumn(_groupColumns) }, () => {
          this.props.onChange(this.state.formatColumn);
          this.handleFetchData();
        });
      },
      formatColumn,
    }

    let columns = [];
    if (formatColumn.columns) {
      let columnWidth = `${100 / formatColumn.columns.length}`;
      columnWidth = Math.floor(columnWidth);
      columns = formatColumn.columns.map(column => {
        return {
          ...column,
          render: text => {
            return <Ellipsis length={columnWidth}
              tooltip={<span>{text}</span>}>{text}</Ellipsis>;
          },
          width: `%${columnWidth}`
        }
      })
    }
    return (
      <div className={styles.recomList}>
        {showFilter && <FilterModal {...modalProps} />}
        {
          !showFilter &&
          <Button type='primary'
            onClick={() => this.setState({ showFilter: true })}>
            自定义指标
        </Button>
        }
        <Table
          columns={columns}
          rowKey={r => uuid.v1()}
          dataSource={recomList}
          loading={loading.global}
        />
      </div>);
  }
}

RecomListPane.propTypes = {

};

export default RecomListPane;