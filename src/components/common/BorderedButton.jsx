import React from 'react';

export const BorderedButton = ({ active, red, ...props }) => {
  return (
    <button className={`borderedButton${active ? ' active' : red ? ' red' : ''}`} {...props} />
  )
};
