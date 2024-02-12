import React, { useState } from 'react';
import {
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
} from 'office-ui-fabric-react';

import { UserList } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

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

export const MeetingInviteDialog = ({ open, onDismiss, onInvite, users }) => {
  const {
    components: {
      panels: {
        game: { meeting: ls },
      },
    },
  } = useLabelsSchema();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleClickInvite = () => {
    onInvite(selectedUsers);
  };

  const handleSelectionChange = (user, checked) => {
    if (
      user.id &&
      checked &&
      selectedUsers &&
      selectedUsers.indexOf(user.id) === -1
    ) {
      setSelectedUsers((selectedUsers) => [...selectedUsers, user.id]);
    }
    if (
      user.id &&
      !checked &&
      selectedUsers &&
      selectedUsers.indexOf(user.id) !== -1
    ) {
      setSelectedUsers((selectedUsers) =>
        selectedUsers.filter((item) => item !== user.id)
      );
    }
  };

  return (
    <Dialog
      hidden={!open}
      onDismiss={onDismiss}
      minWidth="500px"
      dialogContentProps={{
        type: DialogType.normal,
        title: ls.inviteDialogText,
      }}
      modalProps={{
        isBlocking: false,
        isDarkOverlay: false,
      }}
    >
      <UserList
        users={users}
        allowMultiple
        onSelectionChange={handleSelectionChange}
      />

      <DialogFooter>
        <DefaultButton
          onClick={onDismiss}
          text={ls.cancelText}
          styles={buttonStyles}
        />
        <PrimaryButton
          onClick={handleClickInvite}
          text={ls.inviteText}
          styles={{ root: { marginLeft: '20px' } }}
        />
      </DialogFooter>
    </Dialog>
  );
};
