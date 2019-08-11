import React, { PureComponent } from 'react';
import { Popconfirm, Dropdown, Menu, Tree,  Icon } from 'antd';
import styles from './index.less'
const TreeNode = Tree.TreeNode;


class DropdownTree extends PureComponent {
  constructor(props) {
    super(props);

    const { value , data} = this.props;
    this.state = {
        value:value,
        data: data,
    };
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({value});
    }
  }
  getTree(){
    const { data , onChange,checkStrictly} = this.props;
    const { value } = this.state;
    return (
          <Tree
              checkable
              checkStrictly={checkStrictly}
              // autoExpandParent={true}
              onCheck={(value)=>{
                this.setState({
                  value:value.checked
                })
              }}
              checkedKeys={value}
          >
              {this.renderTreeNodes(data)}
          </Tree>
        );
  }
  renderTreeNodes (data) {
    const {titleKey, rowKey, disabled} = this.props;
    return data.map((item) => {
      if(item){
        if (item.children) {
          return (
            <TreeNode disableCheckbox={disabled} title={item[titleKey?titleKey:'name']} key={item[rowKey?rowKey:'id']} dataRef={item}>
              {this.renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode disableCheckbox={disabled} title={item[titleKey?titleKey:'name']} key={item[rowKey?rowKey:'id']} dataRef={item} />;
      }
    });
  }
  render() {
    const { len, onConfirm,disabled } = this.props;
    const {value} = this.state;
    return (
        <Popconfirm 
          overlayClassName={styles.DropdownTreeBox} 
          placement="bottomLeft" 
          title={this.getTree()} 
          onConfirm={()=>{
            onConfirm(value);
          }}
          okText="确定" 
        >
          <a className="ant-dropdown-link" href="javascript:;">
          {value.length==len?'全部子节点':(value.length > 0?'部分子节点':'不含子节点')} <Icon type="down" />
          </a>
        </Popconfirm>
    );
  }
}
export default DropdownTree