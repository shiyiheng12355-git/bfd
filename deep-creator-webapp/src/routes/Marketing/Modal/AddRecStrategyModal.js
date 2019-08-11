import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'antd';
import { WorkFlowEditor, ButtonDragSource } from '../../../components/WorkFlowEditor';
import ProductModal from './StrategyModal/ProductModal';
import StrategyModal from './StrategyModal/StrategyModal';
import SplitFlowModal from './StrategyModal/SplitFlowModal';
import FilterModal from './StrategyModal/FilterModal';
import FillModal from './StrategyModal/FillModal';
import SortModal from './StrategyModal/SortModal';
import UniqModal from './StrategyModal/UniqModal';

import { ProcedureShape, StrategyShape, Shape } from '../../../components/WorkFlowEditor/helper';

const strategies = [{ template: '优先推荐' }]

class SiderBar extends PureComponent {
    render() {
        return (
            <div>
                {/* <h3>推荐内容</h3>
                    <ButtonDragSource
                        modal='ProductModal'
                    >商品
                    </ButtonDragSource>
                    <ButtonDragSource
                        modal='InfomationModal'
                    >资讯
                    </ButtonDragSource>
                    <h3>分流</h3>
                    <ButtonDragSource
                        modal='SplitFlowModal'
                    >分流
                    </ButtonDragSource>
                */}
                <h3>经典推荐场景</h3>
                {
                    strategies.map((strategy, index) => {
                        return (
                            <ButtonDragSource
                                modal={`StrategyModal${index}`}
                                key={`strategy_${index}`}>
                                {strategy.template}
                            </ButtonDragSource>)
                    })
                }
            </div>)
    }
}
// 编辑推荐策略
class AddRecStrategy extends Component {
    constructor(props) {
        super(props);
        const lwNode = new ProcedureShape({
            label: '客户资源栏位',
            shape: 'circle',
            info: '',
        });
        const spNode = new ProcedureShape({
            label: '推荐内容',
            shape: 'circle',
            pid: lwNode.id,
            info: '',
        })
        const flNode = new StrategyShape({
            label: '分流',
            pid: spNode.id,
            shape: 'rhombus',
            info: '',
        });
        this.state.nodes = [lwNode, spNode, flNode];
    }
    state = {
        nodes: [],
    }

    // 添加策略流程点，后面自动添加去重，排序等节点
    addStrategyNode = (pid, strategy) => {
        const stgNode = new ProcedureShape({
            pid,
            label: '一个策略',
            modal: null,
            locked: true,
        });
        const glNode = new ProcedureShape({
            label: '过滤',
            pid: stgNode.id,
            deletable: true,
            locked: true,
            modal: 'FilterModal',
        }); // 过滤
        const pxNode = new ProcedureShape({
            label: '排序',
            pid: glNode.id,
            deletable: true,
            locked: true,
            modal: 'SortModal',
        }); // 排序
        const qcNode = new ProcedureShape({
            label: '去重',
            pid: pxNode.id,
            deletable: true,
            locked: true,
            modal: 'UniqModal',
        }); // 去重
        const tcNode = new ProcedureShape({
            label: '填充',
            pid: qcNode.id,
            deletable: true,
            modal: 'FillModal',
        }) // 填充
        stgNode.bindDelete = [glNode.id, pxNode.id, qcNode.id, tcNode.id]; // 删除策略节点时，要删除过滤、排序等子节点
        return { nodes: [stgNode, glNode, pxNode, qcNode, tcNode] };
    }

    // 添加分流节点
    addSplitFlowNode = (pid, _flowData) => {
        const flowData = {
            type: 'abtest',
            branches: [{}, {}, {}],
        };
        const flNode = new StrategyShape({ label: '分流', pid });

        let nodes = [flNode];
        if (flowData.type === 'abtest') { // 基于abtest分流
            const endNodes = flowData.branches.map((branch) => {
                return new Shape({ label: '结束', pid: flNode.id, type: 'END' });
            })
            nodes = nodes.concat(endNodes);
        } else { // 基于标签分流
            const endNodes = flowData.tags.map((tag) => {
                return new ProcedureShape({ label: '结束', pid: flNode.id });
            })
            nodes = nodes.concat(endNodes);
        }
        return { edges: [], nodes };
    }

    addPriorityRecNode = (pid, priorityRec) => {
        const recNode = new ProcedureShape({ label: '优先推荐', pid });
        return { edges: [], nodes: [recNode] };
    }

    addProductNode = (pid, product) => {
        const productNode = new ProcedureShape({ label: '商品' });
        return { edges: [], nodes: [productNode] };
    }
    render() {
        const { editRec } = this.props;

        let modals = [
            {
                title: '设置推荐内容',
                modalComponent: ProductModal,
                props: { width: '50%', height: '50%' },
                id: 'ProductModal',
                onOk: (values) => {
                    const pid = values.edge ? values.edge.source : null;
                    const data = this.addProductNode(pid, values);
                    this.setState({ nodes: this.state.nodes.concat(data.nodes) });
                },
            },
            {
                title: '设置分流策略',
                modalComponent: SplitFlowModal,
                props: { width: '50%', height: '50%' },
                id: 'SplitFlowModal',
                onOk: (values) => {
                    const pid = values.edge ? values.edge.source : null;
                    const data = this.addSplitFlowNode(pid, values);
                    this.setState({ nodes: this.state.nodes.concat(data.nodes) });
                },
            },
            {
                title: '过滤',
                modalComponent: FilterModal,
                id: 'FilterModal',
                onOk: (values) => {
                    console.log('FilterModal', values);
                },
            },
            {
                title: '排序',
                modalComponent: SortModal,
                id: 'SortModal',
                onOk: (values) => {
                    console.log('SortModal', values);
                },
            },

            {
                title: '去重',
                modalComponent: UniqModal,
                id: 'UniqModal',
                onOk: (values) => {
                    console.log('UniqModal', values);
                },
            },

            {
                title: '填充',
                modalComponent: FillModal,
                id: 'FillModal',
                onOk: (values) => {
                    console.log('FillModal', values);
                },
            },
        ]

        const strategyModals = strategies.map((strategy, index) => {
            return {
                title: strategy.template,
                modalComponent: StrategyModal,
                props: { strategy, width: '50%', height: '50%' },
                id: `StrategyModal${index}`,
                onOk: (values) => {
                    const pid = values.edge ? values.edge.source : null;
                    const data = this.addStrategyNode(pid, values);
                    this.setState({ nodes: this.state.nodes.concat(data.nodes) });
                },
            }
        });

        modals = modals.concat(strategyModals);
        const { nodes } = this.state;

        return (
            <Modal
                title="新增自动化营销"
                width='80%'
                height='80%'
                maskClosable={false}
                {...this.props}
            >
                <WorkFlowEditor
                    nodes={nodes}
                    modals={modals}
                    header={<Button>立即执行</Button>}
                    sider={<SiderBar />} />
            </Modal>
        );
    }
}

// 编辑推荐策略
AddRecStrategy.propTypes = {

};

// 编辑推荐策略
export default AddRecStrategy;