import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PrimaryButton } from 'office-ui-fabric-react';
import { UserAvatar } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
export const UserShowPublicChatDialog = ({
  user,
  createFormHandler,
  isChatUsers,
  currentUser,
  buttonStyles,
  removeUser,
}) => {
  const {
    components: {
      dialogs: { userShowPublicChatDialog: ls },
    },
  } = useLabelsSchema();
  const channel = useSelector((state) => state.channel);

  const [hover, setHover] = useState(false);

  const isHover = () => setHover(true);

  const isOutHover = () => setHover(false);

  const userClick = () => {
    if (!isChatUsers) {
      createFormHandler(user);
    }
  };

  const isCurrentUser = currentUser && user && user.id === currentUser.id;

  return (
    <div
      style={{
        cursor: 'pointer',
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          width: '100%',
          marginRight: '5px',
          marginBottom: '5px',
        }}
        onClick={userClick}
      >
        <div
          onMouseMoveCapture={isHover}
          onMouseOut={isOutHover}
          style={{
            backgroundColor: hover ? 'var(--sr-color-transparent-b-022)' : '',
            padding: '5px',
          }}
        >
          {user && (
            <UserAvatar
              showCompany
              user={user}
              size={10}
              text={
                user.firstName || user.lastName
                  ? `${user.firstName} ${user.lastName} ${
                      isChatUsers && isCurrentUser ? ls.userAvatarTextYou : ''
                    }`
                  : user.email
              }
              imageInitials={
                user.photo
                  ? user.photo.url
                  : (user.firstName || ' ').toUpperCase()[0] +
                    (user.lastName || ' ').toUpperCase()[0]
              }
            />
          )}
        </div>
      </div>

      {isChatUsers &&
        (channel.userRole === 'service_admin' ||
          channel.userRole === 'channel_admin') &&
        user.id !== currentUser.id && (
          <PrimaryButton
            onClick={() => removeUser(user)}
            text={ls.primaryButtonText}
            styles={buttonStyles}
          />
        )}
    </div>
  );
};
