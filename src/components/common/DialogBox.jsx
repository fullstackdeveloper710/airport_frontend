import React from 'react';
import {
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
} from 'office-ui-fabric-react';

import { PinkButton } from './PinkButton';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const dialogStyles = {
  main: {
    maxWidth: 450,
  },
};

export const DialogBox = (props) => {
  const {
    onOkay,
    onClose,
    header,
    text,
    hidden,
    styles,
    showClose = true,
    showOk = true,
    showFooter = true,
    children = null,
  } = props;
  const {
    components: {
      common: { dialogBox: ls },
    },
  } = useLabelsSchema();
  return (
    <Dialog
      hidden={hidden}
      onDismiss={onClose}
      modalProps={{ isBlocking: false }}
      dialogContentProps={{
        type: DialogType.normal,
        title: header,
        subText: text,
        styles : props.innerStyle || null
      }}
      styles={styles || dialogStyles}
    >
      {children}
      {showFooter && (
        <DialogFooter>
          {showOk && <PinkButton onClick={onOkay} text={ls.showOkText} />}
          {showClose && <DefaultButton onClick={onClose} text={ls.showCloseText} />}
        </DialogFooter>
      )}
    </Dialog>
  );
};
