import React from 'react';
import {
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
} from 'office-ui-fabric-react';
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

export const ConfirmDialog = (props) => {
  const { text, open, onDismiss, onConfirm } = props;
  const {
    components: {
      dialogs: { confirmDialog: ls },
    },
  } = useLabelsSchema();
  return (
    <Dialog
      hidden={!open}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.largeHeader,
        title: ls.dialogContentProps.title,
        subText: text
      }}
      modalProps={{
        isBlocking: false,
        isDarkOverlay: false,
      }}
      styles={dialogStyles}
    >
      <DialogFooter>
        <PrimaryButton onClick={onConfirm} text={ls.dialogFooter.primaryButton.text} />
        <DefaultButton onClick={onDismiss} text={ls.dialogFooter.defaultButton.text} styles={buttonStyles} />
      </DialogFooter>
    </Dialog>
  );
};
