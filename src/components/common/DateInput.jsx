import React,{useMemo} from 'react';
import { DatePicker, DayOfWeek } from 'office-ui-fabric-react/lib/DatePicker';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

/**    moved to translation file
      at this point component is not used because was necessary dateTime picker
*/
// const DayPickerStrings = {
//   months: [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December',
//   ],

//   shortMonths: [
//     'Jan',
//     'Feb',
//     'Mar',
//     'Apr',
//     'May',
//     'Jun',
//     'Jul',
//     'Aug',
//     'Sep',
//     'Oct',
//     'Nov',
//     'Dec',
//   ],

//   days: [
//     'Sunday',
//     'Monday',
//     'Tuesday',
//     'Wednesday',
//     'Thursday',
//     'Friday',
//     'Saturday',
//   ],

//   shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

//   goToToday: 'Go to today',
//   prevMonthAriaLabel: 'Go to previous month',
//   nextMonthAriaLabel: 'Go to next month',
//   prevYearAriaLabel: 'Go to previous year',
//   nextYearAriaLabel: 'Go to next year',
//   closeButtonAriaLabel: 'Close date picker',
//   monthPickerHeaderAriaLabel: '{0}, select to change the year',
//   yearPickerHeaderAriaLabel: '{0}, select to change the month',

//   isRequiredErrorMessage: 'Field is required.',

//   invalidInputErrorMessage: 'Invalid date format.',

//   isOutOfBoundsErrorMessage: `Date must be greater than today`,
// };

const controlClass = mergeStyleSets({
  control: {
    margin: '5px 0 0 0',
    flexGrow: 1,
  },
});

const firstDayOfWeek = DayOfWeek.Sunday;

export const DateInput = (props) => {
  const {
    components: {
      common: { datePicker: ls },
    },
  } = useLabelsSchema();

  const datePicker = useMemo(
    () => (
      <DatePicker
        className={controlClass.control}
        isRequired={false}
        firstDayOfWeek={firstDayOfWeek}
        strings={ls.dayPickerStrings}
        placeholder={ls.placeholder}
        ariaLabel={ls.ariaLabel}
        allowTextInput={true}
        {...props}
      />
    ),
    [ls]
  );
  return datePicker;
};
