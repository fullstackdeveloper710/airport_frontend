import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
} from 'office-ui-fabric-react';
import { Formik, Form } from 'formik';

import { TextInput } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const dialogStyles = {
  main: {
    maxWidth: 450,
  },
};

const buttonStyles = {
  root: {
    borderColor: 'var(--sr-color-white)',
    color: 'var(--sr-color-black)',
    background: 'var(--sr-color-transparent)',
    size: 20,
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
  const { open, onDismiss, values, handleSubmit, setFieldValue } = props;
  const {
    components: {
      dialogs: { renameDialog: ls },
    },
  } = useLabelsSchema();
  const channel = useSelector((state) => state.channel);

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

  useEffect(() => {
    if (channel.current) {
      setFieldValue('name', channel.current.friendlyName);
    }
  }, [channel.current, open]);

  return (
    <Dialog
      hidden={!open}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.largeHeader,
        title: ls.dialogContentProps.title,
      }}
      modalProps={{
        isBlocking: false,
        isDarkOverlay: false,
      }}
      styles={dialogStyles}
    >
      <Form>
        <TextInput
          {...props}
          iconProps={{ iconName: 'Rename' }}
          placeholder={ls.textInput.placeholder}
          onKeyDown={onKeyDown}
          onKeyUp={stopPropagation}
          onKeyPress={stopPropagation}
          name="name"
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

export const RenameDialog = (props) => {
  const { open, onDismiss, onConfirm } = props;
  const {
    components: {
      dialogs: { renameDialog: ls },
    },
  } = useLabelsSchema();
  const channel = useSelector((state) => state.channel);

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={{
        name: '',
      }}
      validate={(values) => {
        const errors = {};

        if (!values.name || !values.name.length) {
          errors.name = ls.errorsMissingName;
        }

        if (
          channel.list.find((item) => item.friendlyName === values.name) !==
          undefined
        ) {
          errors.name = ls.errorsName;
        }

        return errors;
      }}
      onSubmit={onConfirm}
    >
      {(formProps) => (
        <InnerForm open={open} onDismiss={onDismiss} {...formProps} />
      )}
    </Formik>
  );
};
