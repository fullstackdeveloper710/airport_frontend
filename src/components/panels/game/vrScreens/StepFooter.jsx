import React from 'react';
const StepsFooter = ({ icon, text }) => {
  return (
    <div className="stepFooter">
      <p>
        {icon}
        {text}
      </p>
    </div>
  );
};

export default StepsFooter;
