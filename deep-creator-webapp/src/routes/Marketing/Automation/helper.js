import lodash from 'lodash';
import { cutString } from '../../../utils/utils';

const TYPE_MAP = {
  GROUP: '受众',
  TAG: '标签',
  BEHAVE: '行为事件',
  PARALLEL: '并行',
  SMS: '短信',
  weixin:'微信推送',
  EMAIL: '邮件',
  PUSH: '应用消息',
  OPEN: '打开',
  CLICK: '点击',
  ARRIVE: '到达',
  AUTOTAG: '自动标签',
}

const LABEL_MAP = {
  done: '是',
  default: '否',
}

export const parseNodes = (nodeList, nodeKeys) => {
  const getRelationNodes = (_nodes, node) => {
    const children = _nodes.filter(_node => _node.parent_id === node.node_id);
    const parent = _nodes.find(_node => _node.node_id === node.parent_id);
    return { children, parent };
  }

  const edges = [];
  const nodes = [];
  nodeList.forEach((node) => {
    const { parent } = getRelationNodes(nodeList, node);
    const _node = {
      label: TYPE_MAP[node.type] || node.type,
      value: node,
      id: node.node_id,
      ...node,
    }
    const extraInfo = _node.extra_info || {};
    _node.layout = 'other';
    if (_node.type === 'GROUP') {
      const groupName = (_node.extra_info || {}).group_name;
      _node.label = groupName ? '受众' : '选择受众';
      _node.layout = 'circle';
      _node.tooltip = ['群组名称', groupName || '未配置'];
    } else if (_node.type === 'BEHAVE') {
      _node.layout = 'rhombus';
      const intervalMsg = _node.interval ? `${_node.interval}秒` : '未配置';
      _node.tooltip = [['与上一步间隔时间', intervalMsg],
      ['事件', extraInfo.action_name_cn || '未配置'],
      ];
    } else if (_node.type === 'TAG') {
      _node.layout = 'rhombus';
      const detail = []
      if (_node.branch_list) {
        detail.push(['所选标签']);
        _node.branch_list.map((branch) => {
          let condStr = branch.condition === 'default' ? '其他' : branch.condition;
          let [engName, value] = (branch.condition || '').split('=');
          if (engName && value && extraInfo.tag_name) {
            condStr = extraInfo.tag_name[engName];
            detail.push(['标签', `${condStr}=${value}`])
          } else {
            detail.push(['标签', condStr])
          }
        })
      }
      _node.tooltip = detail;
    } else if (_node.type === 'AUTOTAG') {
      _node.tooltip = ['自动标签', extraInfo.tag_value];
    } else if (_node.type === 'SMS' || _node.type === 'PUSH' || _node.type === 'EMAIL') {
      const intervalMsg = _node.interval ? `${_node.interval}秒` : '未配置';
      _node.tooltip = [['内容', extraInfo.header || '未配置'],
      ['转换周期', intervalMsg]]
    } else {
      _node.layout = 'reac';
    }

    if (parent) { // 有父节点,绘制连线
      const edge = {
        source: parent.node_id,
        target: _node.node_id,
        shape: 'customEdge',
      }
      edges.push(edge);
    }

    if (_node.branch_list) {
      _node.branch_list.map((branch) => {
        if (branch.child_id && _node.node_id) {
          let childNode = !lodash.find(nodeList, { node_id: branch.child_id })
          if (childNode) { // 子节点不存在，用END节点填充
            const endNode = {
              label: '结束',
              parent_id: _node.node_id,
              type: 'END',
              id: branch.child_id,
              node_id: branch.child_id,
              shape: 'rect',
              size: [56, 24],
            };
            nodes.push(endNode)
            childNode = endNode
          }

          let edgeLabel = LABEL_MAP[branch.condition] || branch.condition;
          if (_node.type === 'BEHAVE') {
            edgeLabel = LABEL_MAP[branch.condition] || '是';
          }
          const edge = {
            source: _node.node_id,
            target: branch.child_id,
            condition: edgeLabel,
            locked: true,
            shape: 'customEdge',
            style: { lineDash: [5, 5] }, // 虚线
          };

          switch (_node.type) {
            case 'TAG': {
              edge.style.stroke = '#F5A623';
              let condStr = branch.condition === 'default' ? '其他' : edge.condition;
              let [engName, value] = (edge.condition || '').split('=');
              if (engName && value && extraInfo.tag_name) {
                condStr = extraInfo.tag_name[engName];
                edge.tooltip = [['所选条件', `${condStr}=${value}`]];
                edge.condition = cutString(`${condStr}=${value}`);
              } else {
                edge.tooltip = [['所选条件', condStr]]
                edge.condition = cutString(condStr);
              }
              break;
            }
            case 'GROUP':
              edge.style.stroke = '#F5A623'
              break;
            case 'AUTOTAG': {
              let condStr = `自动标签=${extraInfo.tag_value}`;
              edge.tooltip = [['所选条件', condStr]];
              edge.condition = cutString(condStr);
              break;
            }
            default:
              break;
          }

          if (nodeKeys && _node.type !== 'GROUP') {
            const item = nodeKeys[edge.target];
            const coverNum = `${item ? item.num : '-'}`// 在连线上绘制节点
            edge.coverNum = coverNum;
            if (edge.tooltip) edge.tooltip.push(['覆盖数', coverNum]);
          }
          edge.condition = cutString(edge.condition)
          if (childNode.type === 'END') { edge.style.lineDash = []; edge.locked = false } // 只有END节点以前的节点才能插入新的节点
          edges.push(edge);
        }
      })
    }

    nodes.push(_node);
  })

  return { nodes, edges };
}

// 找到父节点为动作节点的节点
const findParentNode = (child, nodeList) => {
  const childId = lodash.isString(child) ? child : lodash.isObject(child) ? child.id : undefined;
  if (!childId) return undefined;
  return nodeList.find((node) => {
    if (node.branch_list) {
      const child = node.branch_list.find(branch => branch.child_id === childId);
      return !!child;
    }
    return false;
  })
}

// 找到一个节点父路径下的动作节点
export const findActionAncestorNode = (nodeId, nodeList) => {
  const currentNode = nodeList.find(n => n.node_id === nodeId);
  if (currentNode && ['BEHAVE'].includes(currentNode.type)) return currentNode; // Lucky, Got you
  const ancestorNode = findParentNode(nodeId, nodeList);
  if (!ancestorNode) return; // Find nothing
  return findActionAncestorNode(ancestorNode.node_id, nodeList);// 递归查找
}
