import React from 'react';
import { useField } from 'formik';
import { TextField } from 'office-ui-fabric-react';

const textInputStyles = {
  fieldGroup: {
    background: 'var(--sr-color-transparent)',
  },
  field: {
    '&::placeholder': {
      color: 'var(--sr-color-active)',
    },
  },
  errorMessage: {
    fontFamily: 'var(--sr-font-primary)',
  },
};

export const TextInput = ({ name, setCurrField, setIsRegisterDisabled, isErrorDisabled, textDisabled, ...props }) => {
  let customStyles = {}
  const [field, meta, helpers] = useField(name);

  const _onChange = (e) => {
    helpers.setValue(e.target.value);
    setCurrField?.(name)
    setIsRegisterDisabled?.(true)
    
    if (!e.target.value.trim().length) {
      helpers.setValue('');
      return false;
    }
    else{
      helpers.setValue(e.target.value);
    }
  }
  
  const newProps = props.required ? {onChange: _onChange} : null;

  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  if(props.styles){
    customStyles = props.styles
  }

  return (
    <TextField
      onKeyDown={stopPropagation}
      onKeyUp={stopPropagation}
      onKeyPress={stopPropagation}
      disabled={textDisabled}
      {...field}
      {...props}
      {...newProps}
      errorMessage={!isErrorDisabled ? meta.touched && meta.error : ""}
      styles={Object.keys(customStyles).length === 0 ? textInputStyles : customStyles }
     
    />
  );
};