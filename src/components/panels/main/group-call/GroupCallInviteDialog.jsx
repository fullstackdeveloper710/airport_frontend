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

const dialogStyles = {
  main: {
    background: 'var(--sr-color-transparent)',
    boxShadow: 'none',
  },
};

const dialogContentStyles = {
  title: {
    fontFamily: 'var(--sr-font-secondary)',
    fontSize: 36,
  },
};

export const GroupCallInviteDialog = ({ open, onDismiss, onInvite, users }) => {
  const {
    components: {
      panels: {
        main: { groupCall: ls },
      },
    },
  } = useLabelsSchema();
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleClickInvite = () => {
    onInvite(selectedUsers);
  };

  const handleSelectionChange = (user, checked) => {
    if (
      checked &&
      selectedUsers &&
      selectedUsers.indexOf(user.eventUserId) === -1
    ) {
      setSelectedUsers((selectedUsers) => [...selectedUsers, user.eventUserId]);
    }
    if (
      !checked &&
      selectedUsers &&
      selectedUsers.indexOf(user.eventUserId) !== -1
    ) {
      setSelectedUsers((selectedUsers) =>
        selectedUsers.filter((item) => item !== user.eventUserId)
      );
    }
  };

  return (
    <Dialog
      hidden={!open}
      onDismiss={onDismiss}
      minWidth="500px"
      dialogContentProps={{
        className: 'roundPanel',
        type: DialogType.normal,
        title: ls.addParticipantsText,
        styles: dialogContentStyles,
      }}
      modalProps={{
        isBlocking: false,
      }}
      styles={dialogStyles}
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
