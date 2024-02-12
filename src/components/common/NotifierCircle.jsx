import React from 'react';
import { FontIcon, mergeStyles } from 'office-ui-fabric-react';

const circleClass = mergeStyles({
  fontSize: 10,
  height: 10,
  width: 10,
  color: 'var(--sr-color-red)',
  margin: '0 10px',
});

export const NotifierCircle = () => (
  <FontIcon iconName="CircleFill" className={circleClass} />
);
