import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';

const buttonStyles = {
  root: {
    borderColor: 'none',
    color: 'var(--sr-color-white)',
    background: 'var(--sr-color-primary)',
    transition: '0.3s',
  },
  rootHovered: {
    borderColor: 'var(--sr-color-white)',
    background: 'var(--sr-color-transparent)',
  },
  label: {
    fontWeight: 300,
  },
};

export const PinkButton = (props) => (
  <PrimaryButton {...props} styles={buttonStyles} />
);
