import React, { Component, PropTypes } from 'react';
import { Row, Col, Checkbox } from 'antd';

class OfflineBehavior extends Component {
  render() {
    const { customTags } = this.props;
    return (
      <Row>{
        customTags.map((tag, index) => {
          return (
            <Col key={`tag_${index}`} span={6}>
              <Checkbox>{tag.title}</Checkbox>
            </Col>);
        })
      }
      </Row>);
  }
}

OfflineBehavior.propTypes = {
};

export default OfflineBehavior;
