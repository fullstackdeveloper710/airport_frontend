import React from 'react';
import { mergeStyles } from 'office-ui-fabric-react';

const textClass = mergeStyles({
  width: 14,
  height: 14,
  borderRadius: '100%',
  background: 'var(--sr-color-red)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
});

export const NotifierText = (props) => (
  <span className={textClass}>{props.text}</span>
);
