import React, { useState } from 'react';

const StyleStudioAccordion = ({title, content}) => {
  const [openAccordion, setOpenAccordion] = useState(false);

  const toggleAccordion = () => {
    const currState = openAccordion
    setOpenAccordion(!currState);
  };

  return (
    <div className="accordion">
        <div className={`accordion-item ${openAccordion ? 'open' : ''}`}>
          <div className="accordion-header" onClick={toggleAccordion}>
            <div className="arrow-icon">▶</div>
            <span className="white-text title">{title}</span>
          </div>
          <div className="accordion-content">
            <ul className="white-text content">
              {content.map((content, i) => (
                <li key={i} className='accordion-content-item' >{content}</li>
              ))}
            </ul>
          </div>
        </div>
    </div>
  );
};

export default StyleStudioAccordion;