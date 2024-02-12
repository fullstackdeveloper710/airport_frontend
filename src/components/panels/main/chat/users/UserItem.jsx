import React, { useEffect, useState } from 'react';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useSelector } from 'react-redux';

import { NotifierCircle, UserAvatar } from 'components/common';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { deBounce } from '../../../../../../src/utils/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const buttonStyles = {
  root: {
    borderColor: 'var(--sr-color-white)',
    color: 'var(--sr-color-black)',
    background: 'var(--sr-color-transparent)',
    size: 20,
    margin: '0 4px',
  },
  rootHovered: {
    borderColor: 'none',
    background: 'var(--sr-color-grey)',
  },
  label: {
    fontWeight: 300,
  },
};

export const UserItem = (props) => {
  const {
    user,
    openChat,
    teleportRoom,
    requestToTeleport,
    isDirectMessage,
    isBold,
  } = props;
  const {
    components: {
      panels: {
        main: {
          chat: {
            users: { userItem: ls },
          },
        },
      },
    },
  } = useLabelsSchema();
  const [hover, setHover] = useState(false);
  const [personaSize, setPersonaSize] = useState(window.innerWidth < 840 ? 11 : 12)
  const [disable, setDisable] = useState(false);

  const currentUser = useSelector((state) => state.user.current);
  const currentChannel = useSelector((state) => state.channel.current);

  const isHover = () => setHover(true);
  const isOutHover = () => setHover(false);

  const isYou = () => {
    return user.id === currentUser.id
  }

  const teleport = deBounce(() => {
    requestToTeleport(user);
  }, 1000);

  const partnerID =
    currentChannel && currentChannel.friendlyName
      ? currentChannel.friendlyName
        .replace(CHAT_DM_CHANNEL, '')
        .replace(currentUser.id, '')
        .replace('/', '')
      : '';
  const isActive = user && user.id === partnerID;

  const handleTeleportClick = (e) => {
    e.preventDefault();
    teleportRoom(user);
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 10000);
  };

  useEffect(() => {
    window.addEventListener('resize', () => {
      setPersonaSize(window.innerWidth < 840 ? 11 : 12)
    })
  }, [])

  return (
    <li
      style={{
        width: '100%',
        listStyle: 'none',
        marginBottom: '5px',
        marginTop: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
      onMouseOver={isHover}
      onMouseOut={isOutHover}
    >
      <div
        onClick={() => openChat(user, null)}
        style={{
          listStyle: 'none',
          width: 'calc(100%)',
          padding: '2px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isActive
            ? 'var(--sr-color-transparent-b-022)'
            : hover
              ? 'var(--sr-color-transparent-b-01)'
              : '',
          transition: '0.5s background-color ease-in-out'
        }}
      >
        <UserAvatar
          user={user}
          size={personaSize}
          titleEllipsisWidth={150}
          text={`${user.firstName} ${user.lastName}` + (isYou() ? ls.userAvatarTextYou : "")}
          secondaryText={user.organization}
          isBold={isBold}
        />
        {isBold && <NotifierCircle />}
      </div>
    </li>
  );
};
