import React from 'react';
import { useSelector } from 'react-redux';
import { Persona, PersonaPresence, mergeStyles } from 'office-ui-fabric-react';

export const UserAvatar = (props) => {
  const { user, isBold, showCompany } = props;
  const usersStatuses = useSelector((state) => state.usersList.statuses);
  const onlineUsers = useSelector((state) => state.usersList.onlineUsers);

  const personaStyles = {
    root: {
      cursor: props.onClick ? 'pointer' : 'default',
    },
    text: {
      fontSize: '18px',
    },
    secondaryText: {
      color: 'var(--sr-color-secondary-text)',
    },
    tertiaryText: {
      color: 'var(--sr-color-tertiary-text)',
    },
    primaryText:
      props.titleEllipsisWidth !== undefined || null
        ? {
            fontWeight: isBold ? '700' : '500',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: props.titleEllipsisWidth,
            overflow: 'hidden',
            color: 'var(--sr-color-primary-text)',
          }
        : {
            fontWeight: isBold ? '700' : '500',
            color: 'var(--sr-color-primary-text)',
          },
  };
  const companyStyle = {
    color: 'yellow',
    border: '1px solid var(--sr-color-white)',
    borderRadius: '30px',
    padding: '3px 7px 4px',
  };
  const wrapperClass = mergeStyles({
    display: 'flex',
    flexDirection: 'row',
    '.ms-Persona-presence': {
      backgroundClip: 'unset',
    },
  });

  if (!user) {
    return null;
  }

  const isOnline = onlineUsers.includes(user.eventUserId);

  return (
    <div className={wrapperClass}>
      <Persona
        {...props}
        imageUrl={user.photo ? user.photo.url : null}
        imageAlt={
          (user.firstName ? user.firstName.toUpperCase()[0] : '') +
          (user.lastName ? user.lastName.toUpperCase()[0] : '')
        }
        imageInitials={
          props.imageInitials
            ? props.imageInitials
            : (user.firstName ? user.firstName.toUpperCase()[0] : '') +
              (user.lastName ? user.lastName.toUpperCase()[0] : '')
        }
        initialsColor={user.initialsColor}
        hidePersonaDetails={props.hidePersonaDetails}
        presence={
          PersonaPresence[
            isOnline ? usersStatuses[user.eventUserId] || 'online' : 'offline'
          ]
        }
        styles={personaStyles}
      />
      {showCompany && user.organization ? (
        <span style={companyStyle}>{user.organization}</span>
      ) : (
        <></>
      )}
    </div>
  );
};
