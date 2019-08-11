import React, { Component } from 'react';
import PropTypes from 'prop-types';
import G6 from '@antv/g6';
import Plugins from '@antv/g6-plugins';
import { DropTarget } from 'react-dnd';
import styles from './EditorDropTarget.less';

@DropTarget('WORKFLOW', {
  drop(props, monitor, component) {
    const dragModal = monitor.getItem();
    if (component.state.selectItem) {
      component.props.onDrop({
        dropModal: dragModal.modal,
        item: component.state.selectItem,
      });
    }
    return dragModal;
  },
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  monitor,
}))
class EditorDropTarget extends Component {
  state = {
    dragModal: null, // 当前被拖拽的按钮
    selectItem: null, // 当前被选择的canvas元素, edge或node
  }

  componentDidMount() {
    const _this = this;
    const Plugin = Plugins['layout.dagre'];
    const plugin = new Plugin({ // 布局
      rankdir: 'LR',
      useEdgeControlPoint: true,
      nodesep: 32,
      ranksep: 90,
    });

    G6.Global.edgeLabelStype = {
      textBaseline: 'top',
      textAlign: 'center',
    }

    this.net = new G6.Net({
      container: this.containerRef,
      width: this.containerRef.clientWidth,
      height: this.containerRef.clientHeight, // 画布高
      grid: null,
      useAnchor: true,
      plugins: [plugin],
      mode: 'drag',
      fitView: 'tl',
      fitViewPadding: 20,
    });

    this.net.addBehaviour(['buttonPointer']);
    this.net.removeBehaviour(['wheelZoom']);

    const Util = G6.Util;
    G6.registerNode('customNode', {
      cssSize: true, // 不使用内部 size 作为节点尺寸
      getHtml(cfg) {
        const model = cfg.model;
        const layout = model.layout ? `node-container-${model.layout} node-container` : 'node-container';
        const container = Util.createDOM(`<div class="${layout}"></div>`);

        if (model.deletable) {
          const botton = Util.createDOM('<a class="node-delete">X</a>');
          botton.addEventListener('click', () => {
            // _this.net.remove(_this.net.find(model.id));
            _this.props.onDeleteNode(model);
          });
          container.appendChild(botton);
        }

        const title = Util.createDOM(`<div class="node-container-title node-container">
        ${model.label}
      </div>`);
        container.appendChild(title);
        if (model.num || model.num === 0) {
          const count = Util.createDOM(`<div class="node-container-count node-container">
        <a>覆盖数:${model.num}</a>
      </div>`);
          if (_this.props.onClickCount) count.addEventListener('click', () => _this.props.onClickCount(model))
          container.appendChild(count);
        }

        if (model.detail) {
          const detail = Util.createDOM('<a class="node-detail">详情</a>');
          const info = _.isArray(model.detail) ? model.detail.map(i => `<div>${i}</div>`).join('') : model.detail;
          const detailInfo = Util.createDOM(`<div class="node-detail-info">${info}</div>`);

          detail.addEventListener('mouseover', () => {
            container.appendChild(detailInfo);
          });
          detail.addEventListener('mouseout', () => {
            detailInfo.remove();
          })
          container.appendChild(detail);
        }
        return container;
      },
    }, 'html')

    G6.registerEdge('customEdge', {
      afterDraw: (cfg, group, keyShape) => {
        const center = keyShape.getPoint(0.5);
        const right = keyShape.getPoint(1.0);
        if (center) {
          group.addShape('rect', {
            attrs: {
              x: center.x - 30,
              y: center.y - 10,
              width: 60,
              height: 20,
              fill: 'transparent',
            },
          });
          const textGroup = group.addGroup();
          const coverText = cfg.model.coverNum ? `覆盖数:${cfg.model.coverNum}` : '';
          textGroup.addShape('text', {
            attrs: {
              x: right.x - 55,
              y: right.y - 16,
              text: coverText,
              fill: '#1890ff',
              itemType: 'coverNum',
            },
          })
          // console.log(cfg.model, 'AAAAAAAAAAAAAAAAAAA');
          textGroup.addShape('text', {
            attrs: {
              x: right.x - 55,
              y: right.y - 4,
              text: cfg.model.condition,
              fill: '#969696',
              itemType: 'coverNum',
            },
          })
        }
      },
    }, 'arrow');

    // 通过Canvas画布的容器DOM来监听ondrop事件
    const el = this.net.get('el');
    el.ondragover = e => e.preventDefault();// 必须 否则无法监听ondrop
    el.ondrop = (e) => {
      // 由于无法通过ondrop事件获得Canvas画布上的元素信息，
      // 将ondrop事件伪装成mouseup事件，然后手动出发
      // 可能存在兼容性问题, 目前在chrome上通过
      const evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('mouseup', true,
        true, window, 1, e.screenX, e.screenY, e.clientX, e.clientY,
        false, false, true, false, 0, null);
      evt.fromDrop = true;
      el.dispatchEvent(evt);
    }

    this.net.on('mouseup', (ev) => { // onDrop事件
      // console.log('...mouseup', ev);
      if (ev.item) {
        _this.setState({ selectItem: ev }, () => {
          _this.props.onSelectItem(ev);
        });
      }
    })
    const { nodes = [], edges = [] } = this.props;
    this.net.tooltip(true);
    this.net.node()
      .tooltip((obj) => {
        if (obj.tooltop) { return obj.tooltop; } // 二维数组
      })
      .shape('customNode')
    this.net.edge().shape('arrow').tooltip((obj) => { if (obj.tooltip) return obj.tooltip });
    // 第五步：载入数据
    this.net.source(nodes, edges); // 优先使用传入的edges配置
    // this.net.edge().label()
    // 第六步：渲染关系图
    this.net.render();
  }

  componentWillReceiveProps(nextProps) {
    const { nodes, edges } = nextProps;
    if (nodes) {
      if (this.net) {
        this.net.changeData({ nodes, edges }); // 优先使用传入的edges配置
      }
    }
  }


  getContainerRef = (v) => {
    this.containerRef = v;
  }
  render() {
    const { connectDropTarget } = this.props;
    return connectDropTarget(
      <div className={styles.containner} ref={this.getContainerRef} />
    );
  }
}

EditorDropTarget.propTypes = {
};

export default EditorDropTarget;