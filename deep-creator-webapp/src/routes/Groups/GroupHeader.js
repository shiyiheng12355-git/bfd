import React, { Component } from 'react';
import { Button, Select, Input } from 'antd';

const { Option } = Select;
const { Search } = Input;


class GroupHeader extends Component {
  handlegroupCategoryIdChange = (groupCategoryId) => {
    this.props.handlegroupCategoryIdChange(groupCategoryId);
  }

  handlegroupNameSearch = (value) => {
    this.props.handlegroupNameSearch(value);
  }

  handlegroupNameChange = (e) => {
    const { value } = e.target;
    this.props.handlegroupNameChange(value);
  }

  render() {
    const {
      entityName, groupChannel, groupCategory,
      groupCategoryId, inputValue, entityId,
      systemCreAndProAuth, importCreAndProAuth,
    } = this.props;

    console.log('systemCreAndProAuth-------groupheader---------', systemCreAndProAuth);
    console.log('importCreAndProAuth-------groupheader---------', importCreAndProAuth);


    const prefix = groupChannel === '1' ? '新增' : '导入';

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 15px' }}>
        <div style={{ display: 'flex' }}>
          <div>
            <span style={{ fontSize: 13 }}>分类:</span>
            <Select
              style={{ width: 200, marginLeft: 10 }}
              value={groupCategoryId}
              onChange={this.handlegroupCategoryIdChange}
            >
              <Option key="-1" value={0}>全部</Option>
              {
                groupCategory.map((item, index) => {
                  return <Option key={index} value={item.id}>{item.categoryName}</Option>;
                })
              }
            </Select>
          </div>
          <div style={{ marginLeft: 20 }}>
            <span style={{ fontSize: 13 }}>搜索:</span>
            <Search
              value={inputValue}
              placeholder={`请输入${entityName}群名称`}
              style={{ width: 300, marginLeft: 10 }}
              onSearch={this.handlegroupNameSearch}
              onChange={this.handlegroupNameChange}
              enterButton
            />
          </div>
        </div>
        {
          (groupChannel === '1' && systemCreAndProAuth.includes(`qzgl_xqzgl_nzq_cj_${entityId}`)) ||
          (groupChannel === '2' && importCreAndProAuth.includes(`qzgl_xqzgl_wdq_dr_${entityId}`))
            ? <Button type="primary" onClick={this.props.handleGroupAddModalShow}>{`${prefix}${entityName}群`}</Button>
            : ''
        }

      </div>
    );
  }
}


export default GroupHeader;
