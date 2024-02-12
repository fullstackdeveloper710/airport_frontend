import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useBoolean } from '@uifabric/react-hooks';
import { DefaultButton, TeachingBubble } from 'office-ui-fabric-react';

import { setSelectedDate } from 'store/reducers/calendar';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export const Notification = () => {
  const {
    components: {
      common: { notification: ls },
    },
  } = useLabelsSchema();

  const dispatch = useDispatch();
  const [teachingBubbleVisible, { toggle: toggleTeachingBubbleVisible }] =
    useBoolean(false);
  const [dateInput, setDateInput] = useState('9/1/2020');

  const setCalendar = () => {
    dispatch(setSelectedDate(dateInput));
    toggleTeachingBubbleVisible();
  };

  const NotificationToggle = {
    children: ls.toggleChildren,
    onClick: setCalendar,
  };

  const handleChange = (e) => {
    setDateInput(e.target.value);
  };

  return (
    <div id="notification">
      <DefaultButton
        id="targetButton"
        onClick={toggleTeachingBubbleVisible}
        text={
          teachingBubbleVisible
            ? ls.defaultButton.hide
            : ls.defaultButton.show
        }
      />

      {teachingBubbleVisible && (
        <TeachingBubble
          target="#targetButton"
          primaryButtonProps={NotificationToggle}
          hasSmallHeadline={true}
          onDismiss={toggleTeachingBubbleVisible}
          headline={ls.teachingBubble.headline}
          closeButtonAriaLabel={ls.teachingBubble.closeButtonAriaLabel}
        >
          <input type="text" value={dateInput} onChange={handleChange} />
        </TeachingBubble>
      )}
    </div>
  );
};
