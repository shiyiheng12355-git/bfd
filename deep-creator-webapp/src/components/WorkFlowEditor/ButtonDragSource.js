import React, { PropTypes, PureComponent } from 'react';
import { DragSource } from 'react-dnd';
import { Button } from 'antd';

@DragSource('WORKFLOW', {
  beginDrag(props) {
    return { modal: props.modal }
  },
}, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),

}))
export default class ButtonDragSource extends PureComponent {
  componentDidMount() {
    const img = new Image();
    img.src = this.props.previewImg;
    img.onload = () => this.props.connectDragPreview(img);
  }

  render() {
    const { isDragging, connectDragSource,
      className, children } = this.props;

    return connectDragSource(
      <div style={{
        opacity: isDragging ? 0.5 : 1,
        display: 'inline-block',
        margin: '8px',
      }}
        className={className}
      >
        <div>{children}</div>
      </div>
    );
  }
}
