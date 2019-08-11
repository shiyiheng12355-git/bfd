import React, { Component } from 'react';
import { notification, Icon } from 'antd';
import PropTypes from 'prop-types';
import { webAPICfg } from '../../utils';

class DownLoadBtn extends Component {
    constructor(props) {
        super(props);
    }
    download = () => {
        const { head, data, fileName } = this.props;
        if((!data) || data.length == 0 ){
            notification.open({
                message: '提示',
                description: '数据为空',
                icon: <Icon type="exclamation-circle" style={{ color: 'red' }} />,
            });
            return false
        }
        let form = document.createElement('form');
        form.action = `${webAPICfg.basePath  }/globalConfiguration/downloadBdi`;
        form.enctype = 'multipart/form-data';
        form.method = 'post';
        form.style.display = 'none';

        let input2 = document.createElement('input');
        input2.name = 'head';
        input2.value = JSON.stringify(head);
        form.appendChild(input2);

        let input3 = document.createElement('input');
        input3.name = 'fileName';
        input3.value = fileName;
        form.appendChild(input3);

        let input = document.createElement('input');
        input.name = 'data';
        input.value = JSON.stringify(data);
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }
    render() {
        const { style } = this.props

        return <Icon type="file-excel" style={style || {}} onClick={this.download} />;
    }
}
DownLoadBtn.propTypes = {
    data: PropTypes.array,
    fileName: PropTypes.string,
    head: PropTypes.object,
  };
export default DownLoadBtn;
