import React from 'react';
import {  IconButton } from 'office-ui-fabric-react';



const iconRoundButtonStyles = {
  root: {
    borderRadius: '100%',
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'var(--sr-color-primary)',
    width: '3rem',
    height: '3rem',
  },
  rootDisabled: {
    borderColor: 'var(--sr-color-primary-background)',
  },
  icon: {
    color: 'var(--sr-color-primary)',
    fontSize: 30,
  },
  iconDisabled: {
    color: 'var(--sr-color-primary-background)',
  },
};

export const IconRoundButton = (props) => (
  <IconButton {...props} styles={iconRoundButtonStyles} />
);
