import React, { Component } from 'react';
import WangEditor from 'wangeditor';

class Editor extends Component {
  state = {
    editorContent: '',
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.editor && this.editor.txt.html(nextProps.value)
    }
  }

  componentDidMount() {
    this.editor = new WangEditor(this.editorRef);
    this.editor.customConfig.onchange = (html) => {
      if (this.props.onChange) this.props.onChange(html)
    }
    this.editor.customConfig.menus = [
      'head', // 标题
      'bold', // 粗体
      'fontSize', // 字号
      'fontName', // 字体
      'italic', // 斜体
      'underline', // 下划线
      'strikeThrough', // 删除线
      'foreColor', // 文字颜色
      'backColor', // 背景颜色
      'link', // 插入链接
      'list', // 列表
      'justify', // 对齐方式
      'image',//插入图片
      'quote', // 引用
      'table', // 表格
      'code', // 插入代码
    ]

    this.editor.create()
  }

  getEditorRef = (v) => {
    this.editorRef = v;
  }
  render() {
    return (
      <div ref={this.getEditorRef} style={{ textAlign: 'left' }} />
    );
  }
}

Editor.propTypes = {

};

export default Editor;