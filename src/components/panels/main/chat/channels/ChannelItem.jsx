import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Persona } from 'office-ui-fabric-react';

import { NotifierCircle } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const boldText = {
  primaryText: {
    fontWeight: '700',
  },
};

export const ChannelItem = (props) => {
  const { channel, openChannel } = props;
  const {
    components: {
      panels: {
        main: {
          chat: {
            channels: { channelItem: ls },
          },
        },
      },
    }
  } = useLabelsSchema();
  const currentChannel = useSelector((state) => state.channel.current);
  const [hover, setHover] = useState(false);
  const [personaSize, setPersonaSize] = useState(window.innerWidth < 840 ? 11 : 12)

  const isHover = () => setHover(true);
  const isOutHover = () => setHover(false);

  const isActive =
    channel &&
    currentChannel &&
    channel.friendlyName === currentChannel.friendlyName;

  useEffect(() => {
    window.addEventListener('resize', () => {
      setPersonaSize(window.innerWidth < 840 ? 11 : 12)
    })
  }, [])
  return (
    <li
      onMouseMoveCapture={isHover}
      onMouseOut={isOutHover}
      style={{
        marginBottom: '7px',
        padding: '2px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        backgroundColor: isActive
          ? 'var(--sr-color-transparent-b-022)'
          : hover
            ? 'var(--sr-color-transparent-b-01)'
            : '',
        transition: '0.5s background-color ease-in-out'
      }}
      onClick={() => openChannel(channel)}
    >
      {channel.isPrivate ? (
        <Persona
          {...props}
          text={channel.friendlyName}
          size={personaSize}
          imageUrl={"lock.png"}
          initialsColor={1}
          styles={channel.isBold ? boldText : null}
        />
      ) : (
        <Persona
          {...props}
          text={channel.friendlyName}
          size={personaSize}
          imageInitials={ls.imageInitials}
          initialsColor={1}
          styles={channel.isBold ? boldText : null}
        />
      )}
      {channel.isBold && <NotifierCircle />}
    </li>
  );
};
