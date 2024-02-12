import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogType,
  DialogFooter,
  Label,
  PrimaryButton,
} from 'office-ui-fabric-react';

import { add, removeUser } from 'store/reducers/channel';
import { SearchInput, UserAvatar } from 'components/common';
import { ConfirmDialog } from './ConfirmDialog';
import { UserShowPublicChatDialog } from './UserShowPublicChatDialog';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  showSearchInActiveOnly,
  showActiveOnlyUsersControl
} from 'utils/eventVariables';

const sorted = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

const searchLabel = {
  root: {
    fontWeight: 'normal',
  },
};

const buttonStyles = {
  root: {
    borderColor: 'var(--sr-color-white)',
    color: 'var(--sr-color-black)',
    background: 'var(--sr-color-transparent)',
    size: 20,
    minWidth: '99px',
  },

  rootHovered: {
    borderColor: 'none',
    background: 'var(--sr-color-grey)',
  },
  label: {
    fontWeight: 300,
  },
};

export const PublicChatDialog = ({
  open,
  onDismiss,
  usersList,
  isChatUsers,
  isGroupChat,
  showInviteChatForm,
}) => {
  const {
    components: {
      dialogs: { publicChatDialog: ls },
    }
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const [creteFormData, setCreteFormData] = useState(null);
  const [limit, setLimit] = useState(10);
  const currentUser = useSelector((state) => state.user.current);
  const extraPanelData = useSelector((state) => state.panel.extraPanelData);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showActive, setShowActive] = useState(showSearchInActiveOnly);
  const usersStatuses = useSelector((state) => state.usersList.statuses);
  const onlineUsers = useSelector((state) => state.usersList.onlineUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const addUserSubmit = () => {
    if (creteFormData && !isChatUsers) {
      onDismiss();
      setCreteFormData(null);
      setSearchTerm('');
      dispatch(add(creteFormData));
    }
    if (creteFormData && isChatUsers) {
      onDismiss();
      setCreteFormData(null);
    }
  };

  const createFormHandler = (data) => {
    if (isGroupChat) {
      setCreteFormData(data);
    } else if (showInviteChatForm) {
      showInviteChatForm(data);
      onDismiss();
    }
  };

  const cancelCreateSubmit = () => {
    onDismiss();
    setCreteFormData(null);
  };

  const removeUserFromChannel = (user) => {
    setUserToDelete(null);
    dispatch(removeUser(extraPanelData, user));
  };

  const scrollHandler = (event) => {
    const div = event.target;
    if (div.offsetHeight + div.scrollTop + 10 >= div.scrollHeight) {
      setLimit(limit + 10);
    }
  };

  const onChangeShowActive = () => {
    setShowActive((showActive) => !showActive);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    setLimit(10);
  };

  const filterUsers = useCallback(
    (item) => {
      let showUser = true;
      /**   Online users only if showing active */
      if (showActive) {
        showUser = showUser && onlineUsers?.includes(item?.eventUserId); // ||
        // usersStatuses?.[item?.id] === 'online');
      }
      /** Apply search term to first name, last name, and organization. */
      if (searchTerm?.length > 0) {
        showUser =
          showUser &&
          [item.firstName ?? '', item.lastName ?? '', item.organization ?? '']
            .join(' ')
            .toLowerCase()
            .indexOf(searchTerm?.toLowerCase()) > -1;
      }
      return showUser;
    },
    [showActive, searchTerm, onlineUsers, usersStatuses]
  );

  let usersToShow

  usersToShow = usersList
    .filter(filterUsers)
    .sort((a, b) =>
      sorted(a.firstName?.toLowerCase(), b.firstName?.toLowerCase())
    ).slice(0, limit);
  
  return (
    <>
      {open && (
        <Dialog
          hidden={!open}
          onDismiss={cancelCreateSubmit}
          minWidth="500px"
          dialogContentProps={{
            type: DialogType.normal,
            title: `${
              isChatUsers
                ? usersList?.length > 1
                  ? ls.dialogContentProps.titleUsersList(
                      usersList.length,
                      extraPanelData?.friendlyName
                    )
                  : ls.dialogContentProps.titleNoUsersList(
                      extraPanelData?.friendlyName
                    )
                : ls.dialogContentProps.titleAddPeople
            }`,
            subText: ls.dialogContentProps.subText(
              isChatUsers || !isGroupChat,
              extraPanelData?.friendlyName
            ),
          }}
          modalProps={{
            isBlocking: false,
            isDarkOverlay: false,
          }}
        >
          <div className="" style={{ minWidth: '292px' }}>
            {!creteFormData ? (
              <>
                <Label htmlFor="search" styles={searchLabel}>
                  {ls.searchByLabel}
                </Label>
                <SearchInput id="search" onChange={handleSearch} />
              </>
            ) : (
              <UserAvatar
                user={creteFormData}
                titleEllipsisWidth={150}
                // onClick={() => createFormHandler(user)}
                size={10}
                text={`${creteFormData.firstName} ${creteFormData.lastName}`}
                imageInitials={
                  creteFormData.photo
                    ? creteFormData.photo.url
                    : creteFormData.firstName &&
                      creteFormData.firstName.toUpperCase()[0] +
                        creteFormData.lastName &&
                      creteFormData.lastName.toUpperCase()[0]
                }
              />
            )}
          </div>

          <div
            onScroll={scrollHandler}
            style={{ marginTop: '7px', maxHeight: '308px', overflowY: 'auto' }}
          >
            {!creteFormData &&
              usersToShow.map((user, index) => (
                <UserShowPublicChatDialog
                  key={user.id || index}
                  user={user}
                  createFormHandler={createFormHandler}
                  isChatUsers={isChatUsers}
                  currentUser={currentUser}
                  buttonStyles={buttonStyles}
                  removeUser={() => setUserToDelete(user)}
                />
              ))}
          </div>
          {showActiveOnlyUsersControl && (
            <div style={{ marginTop: '8px' }}>
              <Checkbox
                className="form-control"
                label={ls.showActiveCheckboxLabel}
                checked={showActive}
                onChange={onChangeShowActive}
              />
            </div>
          )}
          <DialogFooter>
            {!isChatUsers && creteFormData && (
              <>
                <DefaultButton
                  onClick={cancelCreateSubmit}
                  text={ls.dialogFooter.defaultButton.text}
                  styles={buttonStyles}
                  disabled={!creteFormData}
                />

                <PrimaryButton
                  onClick={addUserSubmit}
                  text={ls.dialogFooter.primaryButton.text}
                  styles={{ root: { marginLeft: '20px' } }}
                  disabled={!creteFormData}
                />
              </>
            )}
          </DialogFooter>
        </Dialog>
      )}
      <ConfirmDialog
        text={ls.confirmDialogText}
        open={userToDelete}
        onDismiss={() => setUserToDelete(null)}
        onConfirm={() => removeUserFromChannel(userToDelete)}
      />
    </>
  );
};
