import React from 'react';
import {  IconButton } from 'office-ui-fabric-react';



const addonButtonStyles = {
  root: {
    background: 'var(--sr-color-transparent)',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  rootHovered: {
    background: 'var(--sr-color-transparent)',
  },
  rootFocused: {
    background: 'var(--sr-color-transparent)',
  },
  rootPressed: {
    background: 'var(--sr-color-transparent)',
  },
  iconHovered: {
    color: 'var(--sr-color-primary)',
  },
};

export const TextInputAddon = (props) => (
  <IconButton {...props} styles={addonButtonStyles} />
);
