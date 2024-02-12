import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { EventList } from './EventList';
import { EventInfo } from './EventInfo';
import { Formik, Form } from 'formik';
import moment from 'moment-timezone';
import { TextInput, PeoplePicker } from 'components/common';
import { useSelector, useDispatch } from 'react-redux';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
  mergeStyles,
  Dropdown,
} from 'office-ui-fabric-react';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { useHistory } from 'react-router-dom';
import { getMapData, getFutureTime } from 'utils/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { showSearchInActiveOnly } from 'utils/eventVariables';
import { BorderedButton } from 'components/common/BorderedButton';
import 'moment/locale/fr';
import 'moment/locale/es';
import 'moment/locale/pt';

const textInputStyles = {
  fieldGroup: {
    background: 'var(--sr-color-transparent)',
    minHeight: '45px',
    borderRadius: '7px',
  },
  field: {
    resize: 'none',
    minHeight: '45px',
    height: '45px',
    '-webkit-appearance': 'textfield',
    '-moz-appearance': 'textfield',
    appearance: 'textfield',
    '&::placeholder': {
      color: 'var(--sr-color-active)',
    },
  },
  errorMessage: {
    fontFamily: 'var(--sr-font-primary)',
  },
};


const InnerForm = (props) => {
  const {
    open,
    onDismiss,
    values,
    errors,
    isCreateDialog,
    enableInvite,
    usersList,
    setFieldValue,
    setErrors,
  } = props;

  const {
    activeLocale,
    components: {
      dialogs: { createUpdateAgendaDialog: ls },
    },
  } = useLabelsSchema();
  const onlineUsers = useSelector((state) => state.usersList.onlineUsers);
  const usersStatuses = useSelector((state) => state.usersList.statuses);
  let [location, setLocations] = useState([]);
  let [startTime, setStartTime] = useState(values.startTime);
  let [endTime, setEndTime] = useState(values.endTime);
  const dispatch = useDispatch();
  const history = useHistory();

  const { event } = useSelector((state) => state);

  useEffect(() => {
    const map = getMapData(event.map) || [];
    const tempLocation = [];
    for (const mapItem of map) {
      if (mapItem.children && mapItem.children.length) {
        for (const item of mapItem.children) {
          if (item.defaultRoomTypeForMap !== 'None') {
            tempLocation.push({
              key: item.displayName,
              text: item.displayName,
            });
          }
        }
      } else {
        if (mapItem.defaultRoomTypeForMap !== 'None') {
          tempLocation.push({
            key: mapItem.displayName,
            text: mapItem.displayName,
          });
        }
      }
    }

    // Add custom locations sent by the game
    const customLocations = event?.customLocation ?? [];
    for (const location of customLocations) {
      tempLocation.push({
        key: location,
        text: location,
      });
    }

    setLocations(tempLocation);
  }, []);

  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  const disablePastDt = (current) => {
    const yesterday = moment().subtract(1, 'day');
    return current.isAfter(yesterday);
  };

  const activeUsersFilter = useCallback(
    (user) =>
      onlineUsers?.includes(user?.eventUserId) ||
      usersStatuses?.[user?.id] === 'online',
    [onlineUsers, usersStatuses]
  );

  const usersToInvite = useMemo(
    () =>
      showSearchInActiveOnly ? usersList.filter(activeUsersFilter) : usersList,
    [showSearchInActiveOnly, usersList]
  );

  return (
    <Form>
      <div className="forInputs">
        <TextInput
          label={ls.textInput.label}
          placeholder={ls.textInput.placeholder}
          onKeyDown={stopPropagation}
          onKeyUp={stopPropagation}
          onKeyPress={stopPropagation}
          name="title"
          styles={textInputStyles}
          required
        />

        <div className="ms-Flex ms-mb-1">
          <div className="ms-w-75 ms-pr-1">
            {enableInvite ? (
              <>
                <label className="ms-Label white-Label">
                  {ls.invitePeopleLabel}
                </label>
                <PeoplePicker
                  people={usersToInvite}
                  selectedKeys={values.attendees}
                  onChange={(keys) => setFieldValue('attendees', keys)}
                />
              </>
            ) : (
              <></>
            )}
          </div>
          <div className="ms-w-25">
            <Dropdown
              label={ls.dropdown.label}
              name="location"
              options={location}
              selectedKey={values.location}
              onChange={(event, item) => setFieldValue('location', item.text)}
              errorMessage={errors.location}
            />
          </div>
        </div>
        <div className="ms-Flex ms-mb-1">
          <div className="ms-w-50">
            <label className="ms-Label white-Label">{ls.start.label}</label>
            <Datetime
              name="startTime"
              placeholder={ls.start.placeholder}
              className="datetime-picker"
              initialValue={moment(startTime)}
              isValidDate={disablePastDt}
              onChange={(dateTimeMoment) => {
                values.startTime = dateTimeMoment.toISOString();
                setStartTime(values.startTime);
                if (!moment(endTime).isAfter(values.startTime)) {
                  values.endTime = getFutureTime(
                    values.startTime,
                    1
                  ).toISOString();
                  setEndTime(values.endTime);
                }
              }}
              inputProps={{
                required: true,
                readOnly: true,
              }}
              locale={activeLocale}
            />
            {errors.startTime && (
              <label className="error-message">{errors.startTime}</label>
            )}
          </div>
          <div className="ms-w-50 ms-pl-1">
            <label className="ms-Label white-Label">{ls.end.label}</label>
            <Datetime
              name="endTime"
              placeholder={ls.end.placeholder}
              className={`datetime-picker endTime ${errors.endTime ? 'error' : ''
                }`}
              initialValue={moment(endTime)}
              isValidDate={disablePastDt}
              onChange={(dateTimeMoment) => {
                values.endTime = dateTimeMoment.toISOString();
                setEndTime(values.endTime);
              }}
              inputProps={{
                required: true,
                readOnly: true,
              }}
              locale={activeLocale}
            />
            {errors.endTime && (
              <p className="ms-TextField-errorMessage">
                <span>{errors.endTime}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="buttonGroup">
        <BorderedButton >Cancel</BorderedButton>
        <BorderedButton active={true} type="submit">Add session</BorderedButton>
      </div>
    </Form>
  );
};


export const CreateEventForm = (props) => {
  const { open, agenda, onDismiss, onConfirm, enableInvite, usersList, setChoice, setCreatedAgendaInfo } = props;
  const {
    components: {
      dialogs: {
        createUpdateAgendaDialog: {
          errorsTitle,
          errorsStartTime,
          errorsEndTimeMissing,
          errorsLocation,
          errorsEndTime,
        },
      },
    },
  } = useLabelsSchema();
  const onSubmit = (values, { resetForm, setSubmitting }) => {
    onConfirm(values);
    setSubmitting(false);
    setCreatedAgendaInfo({ ...values })
    resetForm({
      title: "",
      startTime: new Date().toISOString(),
      endTime: getFutureTime(new Date(), 1).toISOString(),
      location: null,
      attendees: []
    });
    setChoice('success')
  };

  return (
    <Formik
      validateOnBlur={false}
      initialValues={{
        title: !agenda ? '' : agenda.title,
        startTime: !agenda ? new Date().toISOString() : agenda.startTime,
        endTime: !agenda
          ? getFutureTime(new Date(), 1).toISOString()
          : agenda.endTime,
        location: !agenda ? null : agenda.location,
        attendees: !agenda ? [] : agenda.attendees.map((item) => item.user),
      }}
      validate={(values) => {
        const errors = {};
        if (!values['title'] || !values['title'].length) {
          errors['title'] = errorsTitle;
        }
        if (!values['startTime'] || !values['startTime'].length) {
          errors['startTime'] = errorsStartTime;
        }
        if (!values['endTime'] || !values['endTime'].length) {
          errors['endTime'] = errorsEndTimeMissing;
        }
        if (!values['location'] || !values['location'].length) {
          errors['location'] = errorsLocation;
        }
        if (
          values.startTime &&
          values.startTime.length &&
          values.endTime &&
          values.endTime.length &&
          moment(values.startTime).isAfter(moment(values.endTime))
        ) {
          errors['endTime'] = errorsEndTime;
        }
        return errors;
      }}
      onSubmit={onSubmit}
    >
      {(formProps) => (
        <InnerForm
          open={open}
          onDismiss={onDismiss}
          isCreateDialog={!agenda}
          enableInvite={enableInvite}
          usersList={usersList}
          {...formProps}
        />
      )}
    </Formik>
  );
}