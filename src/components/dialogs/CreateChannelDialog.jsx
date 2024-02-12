import React from 'react';
import { useSelector } from 'react-redux';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
} from 'office-ui-fabric-react';
import { Formik, Form } from 'formik';
import { TextInput } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const buttonStyles = {
  root: {
    borderColor: 'var(--sr-color-white)',
    color: 'var(--sr-color-black)',
    background: 'var(--sr-color-transparent)',
    size: 20,
    marginRight: '1rem',
  },
  rootHovered: {
    borderColor: 'none',
    background: 'var(--sr-color-grey)',
  },
  label: {
    fontWeight: 300,
  },
};

const InnerForm = (props) => {
  const { open, onDismiss, values, handleSubmit } = props;
  const {
    components: {
      dialogs: { createChannelDialog: ls },
    },
  } = useLabelsSchema();

  const stopPropagation = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  const onKeyDown = (event) => {
    stopPropagation(event);
    if (event.keyCode === 13) {
      event.preventDefault();
      handleSubmit(values);
    }
  };

  return (
    <Dialog
      hidden={!open}
      onDismiss={onDismiss}
      minWidth="500px"
      dialogContentProps={{
        type: DialogType.normal,
        title: ls.dialogContentProps.title,
        subText: ls.dialogContentProps.subText,
      }}
      modalProps={{
        isBlocking: false,
        isDarkOverlay: false,
      }}
    >
      <Form>
        <TextInput
          label={ls.textInput.label}
          placeholder={ls.textInput.placeholder}
          onKeyDown={onKeyDown}
          onKeyUp={stopPropagation}
          onKeyPress={stopPropagation}
          name="name"
          required
        />
        <DialogFooter>
          <DefaultButton
            onClick={onDismiss}
            text={ls.dialogFooter.defaultButton.text}
            styles={buttonStyles}
          />
          <PrimaryButton
            type="submit"
            text={ls.dialogFooter.primaryButton.text}
          />
        </DialogFooter>
      </Form>
    </Dialog>
  );
};

export const CreateChannelDialog = (props) => {
  const { open, onDismiss, onSubmit } = props;
  const {
    components: {
      dialogs: {
        createChannelDialog: { errorsNameMissing, errorsName },
      },
    },
  } = useLabelsSchema();
  const channel = useSelector((state) => state.channel);

  return (
    <Formik
      initialValues={{
        name: '',
      }}
      validate={(values) => {
        const errors = {};

        if (!values.name || !values.name.length) {
          errors.name = errorsNameMissing;
        }

        if (channel.list.find((item) => item.friendlyName === values.name)) {
          errors.name = errorsName;
        }

        return errors;
      }}
      onSubmit={onSubmit}
    >
      {(formProps) => (
        <InnerForm open={open} onDismiss={onDismiss} {...formProps} />
      )}
    </Formik>
  );
};
