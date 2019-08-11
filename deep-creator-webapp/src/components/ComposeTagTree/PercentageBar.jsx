import React from 'react';
import PropTypes from 'prop-types';
import styles from './PercentageBar.less';

const PercentageBar = (props) => {
  const list = [{ percentage: '50.67' }];
  const className = { ...styles, ...props.className };
  const percentageAreas = () => {
    return list.map((area) => {
      area.width = 400 * parseFloat(area.percentage / 100);
      return <span className={className.innerBar} style={{ width: `${area.width}px` }}>{area.percentage}%</span>;
    });
  };
  return (
    <div className={className.PercentageBar}>
      {
        percentageAreas()
      }
    </div>
  );
};

PercentageBar.propTypes = {
  className: PropTypes.object,
};

export default PercentageBar;
