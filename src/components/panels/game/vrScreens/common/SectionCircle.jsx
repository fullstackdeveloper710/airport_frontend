import React from 'react';

const SectionCircle = ({ onClick, img, title }) => {
  return (
    <div className="guideItem" onClick={onClick}>
      <figure className="guideItem-figure">
        <img src={img} />
      </figure>
      <h4>{title}</h4>
    </div>
  );
};

export default SectionCircle;
