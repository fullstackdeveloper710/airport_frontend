import React from 'react';
const CheckedTour = ({ isCompleted, onClick, landmarkImage, title ,setSubId}) => {
  return (
    <div
      className={`${
        isCompleted ? 'tourBlock__item tourBlockedChecked' : 'tourBlock__item'
      }`}
      onClick={onClick}
    >
      <div className="tourBlock__item__img">
        <img
          src={
            require('../../../../../assets/images' + landmarkImage)
              .default
          }
          alt={title}
        />
      </div>
      <h4>{title}</h4>
    </div>
  );
};

export default CheckedTour;
