import React from 'react';
import { useField } from 'formik';
import { Checkbox } from 'office-ui-fabric-react';

const checkboxStyles = {
  checkbox: {
    width: 18,
    height: 18,
    borderColor: 'var(--sr-color-auth-checkboxStyles-border)',
  },
};

export const CheckBox = ({ name, ...props }) => {
  const [, meta, helpers] = useField(name);

  const { value } = meta;
  const { setValue } = helpers;

  const handleChange = (_ev, isChecked) => {
    setValue(isChecked);
  };

  return (
    <Checkbox
      checked={value}
      onChange={handleChange}
      {...props}
      styles={props.styles ? props.styles : checkboxStyles}
    />
  );
};
