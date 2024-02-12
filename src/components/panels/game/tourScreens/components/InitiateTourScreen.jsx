import React from 'react';

const InitiateTourScreen = ({ children }) => {
  return (
    <div className="tourSplash__scrollbar">
      <div className="tourSplash__container">
        <div className="tourSplash__inner">{children}</div>
      </div>
    </div>
  );
};

export default InitiateTourScreen;
