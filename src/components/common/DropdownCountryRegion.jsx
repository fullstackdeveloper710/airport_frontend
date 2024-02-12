import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { Text } from 'office-ui-fabric-react';

export const DropdownCountryRegion = (props) => {
  const {
    defaultOptionLabel,valueType,
    required,
    includeRegion,
    columned,
    initialSelection,
    onSelectionsChanged,
    focusField,
    error,
    className,
    disabled
  } = props;
  const [country, setCountry] = useState(initialSelection?.split('/')?.[0]);
  const [countryRegion, setCountryRegion] = useState(
    initialSelection?.split('/')?.[1]
  );
  const [outputSelections, setOutputSelections] = useState(
    country + '/' + countryRegion
  );
  const ddref = useRef();
  useEffect(() => {
    if (focusField) {
      ddref?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      ddref?.current?.focus();
    }
  }, [focusField]);
  const onChangeRegionHandler = useCallback(
    (val) => {
      setCountryRegion(val);
      const ctr = outputSelections?.split('/');
      const value = ctr?.length > 0 ? ctr?.[0] + '/' + val : '';
      setOutputSelections(value);
      onSelectionsChanged?.(value);
    },
    [outputSelections]
  );
  return (
    <>
      <div
        ref={ddref}
        className={`countryDropdownWrapper ${className}` + (disabled ? " disabled" : "")}
        data-format-column={columned ? 'true' : 'false'}
        data-field-focused={focusField ? 'true' : 'false'}
      >
        <div className={`${!columned && country ? 'ms-sm6' : 'ms-sm12'}`}>
          <div
            className={`${required ? 'required' : ''}`}
            data-group-field-focused={
              focusField && !columned && country ? 'true' : 'false'
            }
          >
            <CountryDropdown
              disabled={disabled}
              defaultOptionLabel={defaultOptionLabel}
              valueType={valueType}
              classes={`countryDropdown select`}
              no-selection={country ? 'false' : 'true'}
              data-field-focused={focusField ? 'true' : 'false'}
              data-field-error={focusField ? 'true' : 'false'}
              value={country}
              onChange={(val) => {
                setCountry(val);
                setOutputSelections(val);
                onSelectionsChanged?.(val);
              }}
            />
          </div>
        </div>
        {includeRegion && country && (
          <div className={`${!columned ? 'ms-sm6' : 'ms-sm12'}`}>
            <RegionDropdown
            countryValueType={valueType}
              classes={`countryDropdown select`}
              no-selection={countryRegion ? 'false' : 'true'}
              data-field-focused={focusField ? 'true' : 'false'}
              data-field-error={focusField ? 'true' : 'false'}
              country={country}
              value={countryRegion}
              onChange={onChangeRegionHandler}
            />
          </div>
        )}
      </div>
      {!disabled && focusField && error && (
        <Text
          variant="small"
          className="errorMessage"
          data-automation-id="error-message"
        >
          {error}
        </Text>
      )}
    </>
  );
};
