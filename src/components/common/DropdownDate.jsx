import React, { useEffect, useState, useRef } from 'react';
import { DropdownDate, DropdownComponent, YearPicker } from 'react-dropdown-date';
import moment from 'moment';

export const formatYMD = (date) => {
  // formats a JS date to 'yyyy/mm/dd'
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('/');
};
export const formatMDY = (date) => {
  // formats a JS date to 'mm/dd/yyyy'
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [month, day, year].join('/');
};
export const DropdownDateSelector = (props) => {
  const {
    initialValue,
    onDateChanged,
    startDate,
    endDate,
    required,
    focusDDD,
    setFocusDDD,
    errorState,
    startYear,
    endYear,
    onlyYear,
    yearValue,
    onYearChanged,
    defaultYearValue,
    disabled,
    ...rest
  } = props;
  const ddref = useRef();
  const [date, setDate] = useState({
    date: null,
    selectedDate:
      initialValue ?? moment().subtract(13, 'years').format('YYYY/MM/DD'),
  });

  useEffect(() => {
    if (focusDDD) {
      ddref?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      ddref?.current?.focus();
    }
  }, [focusDDD]);

  return (
    <div
      ref={ddref}
      className={(required ? 'required' : '') + (disabled ? " disabled" : "")}
      data-field-focused={focusDDD ? 'true' : 'false'}
      data-field-error={errorState && focusDDD ? 'true' : 'false'}
      onBlur={() => {
        setFocusDDD?.(false);
      }}
    >
      {
        onlyYear
        ? (
          <YearPicker
          disabled={disabled}
          defaultValue={defaultYearValue}
          start={startYear ?? 1900}                
          end={endYear ?? 2022}                  
          reverse                     
          value={yearValue}     
          onChange={(year) => {       
            onYearChanged(year)
          }}
          classes={"birth-year-dropdown"}
            
        />
        )
        : (
          <DropdownDate
        {...rest}
        data-field-focused={focusDDD ? 'true' : 'false'}
        startDate={
          // optional, if not provided 1900-01-01 is startDate
          startDate ?? '1900/01/01' // 'yyyy-mm-dd' format only
        }
        endDate={
          // optional, if not provided current date is endDate
          endDate ?? '2022/12/31' // 'yyyy/mm/dd' format only
        }
        selectedDate={
          // optional
          date.selectedDate // 'yyyy/mm/dd' format only
        }
        order={[
          // optional
          DropdownComponent.year, // Order of the dropdowns
          DropdownComponent.day,
          DropdownComponent.month,
        ]}
        onDateChange={(date) => {
          setDate({
            date: date,
            selectedDate: formatYMD(date),
          });
          onDateChanged?.(formatYMD(date));
        }}
        classes={
          // optional
          {
            dateContainer: `dropDownDate`,
            yearContainer: 'dropDownYear',
            monthContainer: 'dropDownMonth',
            dayContainer: 'dropDownDay',
            year: 'dateSelector center' + `${focusDDD ? ' unbordered' : ''}`,
            month: 'dateSelector left'+ `${focusDDD ? ' unbordered' : ''}`,
            day: 'dateSelector center'+ `${focusDDD ? ' unbordered' : ''}`,
            yearOptions: 'dateSelectorOption',
            monthOptions: 'dateSelectorOption',
            dayOptions: 'dateSelectorOption',
          }
        }
        options={
          // optional
          {
            yearReverse: true, // false by default
            monthShort: false, // false by default
            monthCaps: false,
            numeric: true, // false by default
          }
        }
      />
        )
      }
    </div>
  );
};
