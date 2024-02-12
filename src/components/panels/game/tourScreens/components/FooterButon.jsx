import React from 'react';

const FooterButton = ({ onClick, title }) => {
  return (
    <button className="btn-enter" onClick={onClick}>
      {title}
    </button>
  );
};

export default FooterButton;
