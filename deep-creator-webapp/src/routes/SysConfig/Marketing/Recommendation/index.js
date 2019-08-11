import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RenderAuthorized from 'ant-design-pro/lib/Authorized';

import SiteColumnConfiguration from './SiteColumnConfiguration';
import AlgorithmConfiguration from './AlgorithmConfiguration';
import SceneConfiguration from './SceneConfiguration';
import TagConfiguration from './TagConfiguration';
import { connect } from 'dva';

const Authorized = RenderAuthorized();
@connect((state) => {
  return {
    ...state['sysconfig/marketing'],
    loading: state.LOADING,
  }
})
class Recommendation extends Component {
  componentWillMount() {
    this.props.dispatch({
      type: 'user/fetchAuths',
      payload: { parentKey: 'xtgl_yxpz_gxhtj' },
    })
  }

  render() {
    const { auths } = this.props;
    return (
      <div>
        <SiteColumnConfiguration {...this.props} />
        <SceneConfiguration {...this.props} />
        <AlgorithmConfiguration {...this.props} />
        <Authorized authority={() => auths.includes('xtgl_yxpz_gxhtj_clybqpz')}>
          <TagConfiguration {...this.props} />
        </Authorized>
      </div>
    );
  }
}

Recommendation.propTypes = {

};

export default Recommendation;