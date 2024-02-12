import React from 'react';
import { Icon } from '@fluentui/react';

export const SidePanel = ({ title, subTitle, handleDismiss, className, open, ...rest }) => (
  <div className={"side-panel-container " + (!open ? "close" : "open")}>
    <div className={`${className ? "side-panel " + className : 'side-panel'}`}>
      <div className='header'>
        {
          title
            ? (
              <div className='panel-title'>
                {title}
              </div>
            )
            : (
              <></>
            )
        }
        {handleDismiss &&
          <div className='close-btn' onClick={handleDismiss}>
            <Icon iconName='cancel' />
          </div>
        }
      </div>
      <div style={{ height: "90%" }} className="ms-Flex ms-Flex-column">
        {
          subTitle
            ? (
              <div className='side-panel-sub-title'>
                {subTitle}
              </div>
            )
            : (
              <></>
            )
        }
        <div className='side-panel-content'>
          {rest.children}
        </div>
      </div>
    </div>
  </div>
);

