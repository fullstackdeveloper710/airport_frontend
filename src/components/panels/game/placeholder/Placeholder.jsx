import React from 'react';
import { FontIcon, mergeStyles } from 'office-ui-fabric-react';

const iconClass = mergeStyles({
  fontSize: 96,
  margin: 25,
  color: 'var(--sr-color-white)',
});

export const Placeholder = (props) => {
  const { icon, className, logoImage } = props;
  return (
    <div
      className={`placeholderPanel ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center ${className}`}
    >
      {logoImage && logoImage}
      {icon && <FontIcon iconName={props.icon} className={iconClass} />}
      <p
        className="ms-Text-header ms-font-size-3 ms-text-align-center"
        dangerouslySetInnerHTML={{ __html: props.text }}
      />
      {props.children}
    </div>
  );
};
