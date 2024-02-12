import React, { useState } from 'react';
import AngleDown from 'assets/images/icons/angleDown';

const StepAccordion = ({ title, children, showContent, isContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`accordion ${isOpen ? 'open' : ''}`}>
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title fadeInfadeOut">{title}</div>
        {
          showContent && isContent !== false && (
            <div className="accordion-btns">
              {isOpen ? ' Hide text' : 'Show text'}
              <div className={`arrow ${isOpen ? 'open' : ''}`}>
                <span className="accordionarrow">
                  <AngleDown />
                </span>
              </div>
            </div>
          )
        }
      </div>
      {
        showContent !== false && (
          <div className="accordion-content fadeInfadeOut2 opacity0" >
            {isOpen ? children : null}
          </div>
        )
      }
    </div>
  );
};

export default StepAccordion;
