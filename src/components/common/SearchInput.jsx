import React from 'react';
import { SearchBox } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const textInputStyles = {
  root: {
    background: 'var(--sr-color-white)',
  },
  field: {
    color: 'var(--sr-color-black)',
    '&::placeholder': {
      color: 'var(--sr-color-active)',
    },
  },
};

export const SearchInput = (props) => {
  const { onChange } = props;
  const {
    components: {
      common: { serchInput:  ls },
    },
  } = useLabelsSchema();
  const onInput = (event, newValue) => {
    if (event) {
      event.stopPropagation();
    }
    onChange(newValue);
  };
  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };
  const submit = (event) => {
    event.preventDefault();
  };
  return (
    <form onSubmit={submit}>
      <SearchBox
        placeholder={ls.placeholder}
        name="searchInput"
        styles={textInputStyles}
        autoComplete="off"
        {...props}
        onChange={onInput}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        onKeyPress={stopPropagation}
      />
    </form>
  );
};
