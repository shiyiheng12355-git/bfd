import React, { Component } from 'react';
import { Upload, Icon, message, Button } from 'antd';
import { connect } from 'dva';
import { webAPICfg } from '../../../../utils';

const Dragger = Upload.Dragger;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

@connect(state => ({
}))

export default class SysConfig extends Component {
	state = {
    loading: false,
    fileUrl: null,
    fileName: null,
    cancleFlag: false,
	}

  beforeUpload = (file) => {
    const imgType = file.type.split('/')[1];
    console.log(file)
    if (imgType !== 'jpeg' && imgType !== 'jpg' && imgType !== 'png' && imgType !== 'gif') {
      message.error('请上传扩展名为jpg、png、gif的图片');
      return false;
    }
  }

	handleChange = (info) => {
    const { file, fileList } = info
    if (file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (file.status === 'done') {
      if (fileList[fileList.length - 1].response && typeof fileList[fileList.length - 1].response === 'string') {
        message.success('上传成功');
        getBase64(info.file.originFileObj, imageUrl => this.setState({
          imageUrl,
          fileUrl: fileList[fileList.length - 1].response,
          loading: false,
          fileName: fileList[fileList.length - 1].name,
        }));
      } else {
        message.error(fileList[fileList.length - 1].response.errorMsg || '上传失败');
      }
    }
	}

  handleCancleImg = () => {
    const { cancleFlag } = this.state
    if (cancleFlag) {
      this.setState({ imageUrl: '' })
      this.props.dispatch({
        type: 'user/getLogoUrl',
      })
    }
  }

  previewLogo = () => {
    const { imageUrl } = this.state
    if (!imageUrl || imageUrl === '') {
      message.error('没有图片预览')
    } else {
      this.props.dispatch({
        type: 'user/changeLogo',
        payload: [{ url: imageUrl }],
      })
      this.setState({ cancleFlag: true })
    }
  }

  saveLogo = () => {
    const { fileUrl, fileName } = this.state
    if (!fileUrl || !fileName) {
      message.error('请上传图片');
    } else {
      this.props.dispatch({
        type: 'gloablConfig/sysConfig/saveLogo',
        payload: { fileUrl, fileName },
      })
      this.setState({ cancleFlag: false })
    }
  }

	render() {
		const uploadButton = (
      <div>
        <p className="ant-upload-drag-icon">
          <Icon type="cloud-upload" />
        </p>
        <p className="ant-upload-text">点击或将图片拖拽到这里上传</p>
        <p className="ant-upload-hint">支持扩展名：.jpg .png .gif，像素256px * 56px</p>
      </div>
    );
		const { imageUrl } = this.state;
		return (
      <div>
        <div style={{ marginBottom: 24 }}>系统logo设置：</div>
        <div style={{ width: 466, height: 194, marginBottom: 24 }}>
          <Dragger
            name="file"
            className="avatar-uploader"
            withCredentials
            showUploadList={false}
            action={`${webAPICfg.basePath}/file/upload`}
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
          >
            {imageUrl ? <img width="240" height="160" src={imageUrl} alt="" /> : uploadButton}
          </Dragger>
        </div>
        <div>
          <Button onClick={this.previewLogo} type="primary" style={{ marginRight: 16 }}>预览</Button>
          <Button onClick={this.saveLogo} type="primary" style={{ marginRight: 16 }}>保存</Button>
          <Button onClick={this.handleCancleImg}>取消</Button>
        </div>
      </div>
		);
	}
}
