// 工具函数

import uuid from 'uuid';
import lodash from 'lodash';

export const parseData = (data, option) => {
  // 判断node节点是否为leaf节点, leaf节点不再有子节点
  const getRelationNodes = (_nodes, node) => {
    const children = _nodes.filter(_node => _node.pid === node.id);
    const parent = _nodes.find(_node => _node.id === node.pid);
    return { children, parent };
  }

  let edges = [];
  const nodes = lodash.clone(data);

  if (nodes.length) {
    nodes.forEach((node) => {
      const { children, parent } = getRelationNodes(nodes, node);
      // if (!node.shape) node.shape = 'rect';
      if (children.length === 0 && node.type !== 'END' && node.type !== 'flNode') { // 叶子节点后面自动补充结束节点
        const endNode = { label: '结束', pid: node.id, type: 'END', id: uuid.v1(), shape: 'rect', size: [56, 24] };
        const endEdge = { source: node.id, target: endNode.id, shape: 'arrow' };
        if (node.locked) {
          endEdge.style = { lineDash: [10, 10] };
        }
        edges.push(endEdge);
        nodes.push(endNode);
      }

      if (parent) { // 有父节点,绘制连线
        const edge = {
          source: parent.id,
          target: node.id,
          shape: 'arrow',
        }
        if (parent.locked) {
          edge.style = { lineDash: [4, 4] };
          edge.locked = true;
        } // 虚线
        edges.push(edge);
      }
    })
  }
  return { nodes, edges };
};