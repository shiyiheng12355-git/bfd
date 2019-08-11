import React, { Component } from 'react';
import { Checkbox } from 'antd';

import styles from './customTags.less';

const CheckboxGroup = Checkbox.Group;

class CustomTag extends Component {
  state = {
    tagAuth: [],
  }

  componentDidMount() {
    const { entityId, dispatch } = this.props;

    this.initAuth(dispatch, entityId, this.initData);
    // this.initData(dispatch, entityId);
    // if (isGroup) {
    //   dispatch({
    //     type: 'user/fetchAuths',
    //     payload: { parentKey: `qzgl_xqzgl_nzq_cj_dzh_${entityId}` },
    //     callback: (data) => {
    //       console.log('tagpicke---------定制化标签---------权限------------', data);
    //       this.setState({
    //         tagAuth: data || [],
    //       })
    //       this.initData(dispatch, entityId);
    //     },
    //   })
    // }
    // this.initData(dispatch, entityId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityId !== nextProps.entityId) {
      const { dispatch } = this.props;
      const { entityId } = nextProps;

      this.initAuth(dispatch, entityId, this.initData)
      // this.initData(dispatch, entityId);
    }
  }

  initAuth = (dispatch, entityId, callback) => {
    dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: `qzgl_xqzgl_nzq_cj_dzh_${entityId}` },
      callback: (data) => {
        console.log('tagpicke---------定制化标签---------权限------------', data);
        this.setState({
          tagAuth: data || [],
        })
        if (callback) callback(dispatch, entityId, data);
      },
    })
  }

  initData = (dispatch, entityId, data) => {
    if (data.includes(`qzgl_xqzgl_nzq_cj_dzh_zdhbq_${entityId}`)) {
      dispatch({
        type: 'tagPicker/getAutomaticTag',
        payload: {
          entityId,
        },
      })
    }

    if (data.includes(`qzgl_xqzgl_nzq_cj_dzh_zjybq_${entityId}`)) {
      dispatch({
        type: 'tagPicker/getCustomTag',
        payload: {
          entityId,
        },
      })
    }
  }


  handleChange = (type, checkedTags) => { // type-> "automatic_tag自动化标签" "custom_tag自定义指标"
    const { value, onChange, automaticTagList = [], customTagList = [] } = this.props;
    const { checkedCusTags = {} } = value;
    let { customerTag = [], automaticTag = [] } = checkedCusTags;
    // let arr = [];
    // const tags = categoryTree.find(item => item.categoryEnglishName === 'busines_tag').children;
    // arr = tags.find(item => item.tagEnglishName === type).children;

    // if (type === 'custom_tag') {
    //   customerTag = arr.filter(item => checkedTags.includes(item.tagEnglishValueTitle));
    // } else if (type === 'automatic_tag') {
    //   automaticTag = arr.filter(item => checkedTags.includes(item.tagEnglishValueTitle));
    // }

    if (type === 'custom_tag') {
      customerTag = customTagList.filter(item => checkedTags.includes(item.tagEnglishValueTitle));
    } else if (type === 'automatic_tag') {
      automaticTag = automaticTagList.filter(item => checkedTags.includes(item.tagEnglishValueTitle));
    }

    if (customerTag.length || automaticTag.length) {
      value.isReady = true;
    } else {
      value.isReady = false;
    }

    value.checkedCusTags = {
      customerTag,
      automaticTag,
    }

    onChange(value);
  }

  render() {
    const { value = {}, automaticTagList = [], customTagList = [], entityId, isGroup = false } = this.props;
    const { tagAuth } = this.state;
    const { checkedCusTags = {} } = value;
    const { customerTag = [], automaticTag = [] } = checkedCusTags;
    let [customerTagKeys, automaticTagKeys] = [[], []];
    let [cusAuthControl, autoAuthControl] = [true, true];

    customerTag.forEach((item) => {
      customerTagKeys.push(item.tagEnglishValueTitle)
    })

    automaticTag.forEach((item) => {
      automaticTagKeys.push(item.tagEnglishValueTitle)
    })

    // console.log('automaticTagList----------------------', automaticTagList);
    // console.log('customTagList----------------------', customTagList);
    // console.log('isGroup----------------------', isGroup);
    console.log('tagAuth----------------------', tagAuth);

    if (!tagAuth.includes(`qzgl_xqzgl_nzq_cj_dzh_zjybq_${entityId}`)) { // 自定义权限
      cusAuthControl = false;
    }
    if (!tagAuth.includes(`qzgl_xqzgl_nzq_cj_dzh_zdhbq_${entityId}`)) { // 自动化权限
      autoAuthControl = false;
    }


    return (
      <div className={styles.customTags}>
        {
          cusAuthControl && customTagList && customTagList.length ?
            <div>
              <div>定制化标签:</div>
              <CheckboxGroup
                style={{ width: '100%' }}
                value={customerTagKeys}
                onChange={this.handleChange.bind(this, 'custom_tag')}
              >
                {
                  customTagList.map((item, index) => {
                    return (
                      <Checkbox
                        key={item.tagEnglishValueTitle}
                        value={item.tagEnglishValueTitle}
                      >
                        {item.tagValueTitle}
                      </Checkbox>
                    )
                  })
                }
              </CheckboxGroup>
            </div>
            : ''
        }

        {
          autoAuthControl && automaticTagList && automaticTagList.length ?
            <div>
              <div>自动化标签:</div>
              <CheckboxGroup
                style={{ width: '100%' }}
                value={automaticTagKeys}
                onChange={this.handleChange.bind(this, 'automatic_tag')}
              >
                {
                  automaticTagList.map((item, index) => {
                    return (
                      <Checkbox
                        key={item.tagEnglishValueTitle}
                        value={item.tagEnglishValueTitle}
                      >
                        {item.tagValueTitle}
                      </Checkbox>
                    )
                  })
                }
              </CheckboxGroup>
            </div>
            : ''
        }

      </div>
    )
  }
}


export default CustomTag;

