import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  IconButton,
  ActionButton,
  Spinner,
  SpinnerSize,
} from 'office-ui-fabric-react';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { ChannelItem } from './ChannelItem';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const spinnerStyles = {
  circle: {
    color: 'var(--sr-color-primary)',
  },
  root: {
    margin: '10px 0',
  },
};

const sorted = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

const itemsWrap = {
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  justifyItems: 'center',
  alignItems: 'center',
  marginBottom: '5px'
};

const addButtonStyles = {
  root: {
    width: '1rem',
    height: '1rem',
    marginRight: '10px',
    marginTop: '5px',
  },
  icon: {
    color: 'var(--sr-color-white)',
    fontSize: 18,
  },
};

export const ChannelList = (props) => {
  const { addChannelClick, openChannelPanel } = props;
  const {
    components: {
      panels: {
        main: {
          chat: {
            channels: { channelList: ls },
          },
        },
      },
    },

  } = useLabelsSchema();
  const [showPersonaChannels, setShowChannels] = useState(true);
  const channel = useSelector((state) => state.channel);
  let channelShow = []

  const toggleShowChannels = () => setShowChannels(!showPersonaChannels);
  const isChannelShow =
    showPersonaChannels && channel && channel.list && channel.list.length > 0;

  channelShow = useMemo(
    () =>
      channel?.list?.length > 0 &&
      channel.list
        .filter((i) => i.friendlyName.indexOf(CHAT_DM_CHANNEL) !== 0)
        .sort((a, b) => sorted(a.friendlyName, b.friendlyName)),
    [channel?.list]
  );

  return (
    <div className='list' style={{ paddingBottom: '10px' }}>
      <div style={itemsWrap}>
        <span onClick={toggleShowChannels}>
          <IconButton
            iconProps={
              showPersonaChannels
                ? { iconName: 'CaretSolidDown' }
                : { iconName: 'CaretRightSolid8' }
            }
            title={ls.iconButton.title}
            ariaLabel={ls.iconButton.title}
            color="white"
          />
          <span className='title'>{` ${ls.titleText}`}</span>
        </span>
        {!channel.listLoading && (
          <span>
            <ActionButton
              iconProps={{ iconName: 'Add' }}
              onClick={addChannelClick}
              color="white"
              styles={addButtonStyles}
            />
          </span>
        )}
      </div>
      {!channel.listLoading ? (
        <ul className={`${isChannelShow ? "show" : ""}`} style={{ listStyle: 'none', marginTop: '5px', marginBottom: '0' }}>
          {isChannelShow &&
            channelShow.map((channel) => (
              <ChannelItem
                channel={channel}
                openChannel={openChannelPanel}
                key={channel.sid}
              />
            ))}
        </ul>
      ) : (
        <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
      )}
    </div>
  );
};
