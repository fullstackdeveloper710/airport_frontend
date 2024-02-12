import React, { useMemo } from 'react';
import { Formik, Form } from 'formik';
import { useSelector } from 'react-redux';

import { CHAT_DM_CHANNEL } from 'constants/web';
import { TextInput } from './TextInput';
import { TextInputAddon } from './TextInputAddon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const textInputStyles = {
  fieldGroup: {
    background: 'var(--sr-color-background-form-wrapper)',
    minHeight: '30px',
  },
  field: {
    resize: 'none',
    lineHeight: '25px',
    minHeight: '30px',
    height: '30px',
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
  const { values, handleSubmit } = props;
  const {
    components: {
      common: { chatInput: ls },
    },
  } = useLabelsSchema();

  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  const onKeyDown = (event) => {
    stopPropagation(event);

    if (event.keyCode === 13) {
      if (!event.shiftKey) {
        event.preventDefault();
        handleSubmit(values);
      }
    }
  };

  return (
    <Form>
      <div className="form-Group">
        <TextInput
          {...props}
          name="message"
          autoAdjustHeight
          onKeyDown={onKeyDown}
          onKeyUp={stopPropagation}
          onKeyPress={stopPropagation}
          styles={textInputStyles}
          type="text"
          placeholder={ls.textInputPlaceholder}
          tabIndex="0"
        />
        <TextInputAddon
          iconProps={{ iconName: 'Send' }}
          title={ls.textInputAddonTitle}
          type="submit"
        />
      </div>
    </Form>
  );
};

export const ChatInput = (props) => {
  const { onSubmit } = props;
  const channel = useSelector((store) => store.channel);
  const currentUser = useSelector((store) => store.user.current);
  const usersList = useSelector((store) => store.usersList);

  const currentChat = useMemo(() => channel?.current, [channel?.current]);
  const isDM = useMemo(
    () => currentChat?.friendlyName?.includes(CHAT_DM_CHANNEL) || false,
    [currentChat]
  );
  const DM_partner = useMemo(
    () =>
      !!currentChat &&
      isDM &&
      usersList.list.find(
        (item) =>
          item.id ===
          currentChat.friendlyName
            .replace(CHAT_DM_CHANNEL, '')
            .replace(currentUser.id, '')
            .replace('/', '')
      ),
    [currentChat, isDM]
  );

  const localSubmit = (e) => {
    window?.gameClient?.logUserAction?.({
      eventName: 'MESSAGE_SENT',
      eventSpecificData: JSON.stringify({
        target: currentChat ? (isDM ? 'DM' : 'channel') : '',
        name: isDM
          ? DM_partner.eventUserId /*`${DM_partner?.firstName} ${DM_partner?.lastName}`*/
          : currentChat?.friendlyName || '',
      }),
      beforeState: null,
      afterState: null,
    });

    onSubmit(e);
  };

  return (
    <Formik
      initialValues={{
        message: '',
      }}
      onSubmit={localSubmit}
    >
      {(formProps) => <InnerForm {...props} {...formProps} />}
    </Formik>
  );
};
