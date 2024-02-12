import React from 'react';
const InitiateScreen = ({ children, steps }) => {
  const layoutClass = getLayoutClass(steps);
  return (
    <div className={`stepWrapper layout-${layoutClass}`}>
      <div className="scrollBlock">
        <div className="stepWrapper-inner">
          <div className="guideItem-Wrapper">{children}</div>
        </div>
      </div>
    </div>
  );
};
const getLayoutClass = (steps) => {
  switch (steps) {
    case 3:
    case 8:
    case 9:
    case 10:
    case 7:
      return '2';
    case 5:
      return '3';
    default:
      return '1';
  }
};

export default InitiateScreen;
