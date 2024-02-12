import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import panel, { openExtraPanel, setEventPanelSectionStack } from 'store/reducers/panel';
import { setConnectedUsers } from 'store/reducers/chat';
import { addNewChannel, openChannel } from 'store/reducers/channel';

import { CreateChannelDialog } from 'components/dialogs';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { UserList } from './users';
import { ChannelList } from './channels';

export const Chat = () => {
  const dispatch = useDispatch();
  const [showAddChannels, setShowAddChannels] = useState(false);
  const currentUser = useSelector((state) => state.user.current);
  const eventID = useSelector((state) => state.user.eventID);
  const usersList = useSelector((state) => state.usersList);
  const channel = useSelector((state) => state.channel);
  const panel = useSelector((state) => state.panel)
  const [limit, setLimit] = useState(30);

  const openPrivateChat = async (user) => {
    if (user && user.id && currentUser) {
      const newRoom =
        CHAT_DM_CHANNEL + makePrivateRoom(currentUser.id, user.id);
      let newChannel = channel.list.find(
        (item) => item.friendlyName === newRoom
      );

      if (newChannel) {
        dispatch(openChannel(newChannel, true));
      }

      document.getElementById('chat-list')?.classList.remove('show')
      document.getElementById('chatHeader')?.classList.remove('show')
      setTimeout(() => {
        dispatch(setEventPanelSectionStack([...panel.eventPanelSectionStack, 'private']))
        document.getElementById('chatHeader')?.classList.add('show')
      }, 1000);
    }
    // closeDirectMessages();
  };

  const openChannelPanel = async (channel) => {
    dispatch(openChannel(channel, false));
    document.getElementById('chat-list')?.classList.remove('show')
    document.getElementById('chatHeader')?.classList.remove('show')
    setTimeout(() => {
      dispatch(setEventPanelSectionStack([...panel.eventPanelSectionStack, 'channel']))
      document.getElementById('chatHeader')?.classList.add('show')
    }, 1000);
  };

  const hideModal = () => {
    setShowAddChannels(false);
  };

  const makePrivateRoom = (id1, id2) => {
    if (id1 < id2) {
      return `${id1}/${id2}`;
    }
    return `${id2}/${id1}`;
  };

  const scrollHandler = (event) => {
    const div = event.target;
    if (div.offsetHeight + div.scrollTop + 10 >= div.scrollHeight) {
      setLimit(limit + 30);
    }
  };

  useEffect(() => {
    dispatch(openExtraPanel(false));
    setTimeout(() => {
      document.getElementById('chat-list')?.classList.add('show')
    }, 300)
  }, []);

  useEffect(() => {
    if (usersList.list.length && channel.list.length) {
      console.log("CHAT USERS CHANNEL LIST", channel.list)
      let users = [];
      for (let i in channel.list) {
        if (
          channel.list[i].friendlyName.indexOf(CHAT_DM_CHANNEL) === 0 &&
          channel.list[i].friendlyName.indexOf(currentUser.id) !== -1
        ) {
          let partnerID = channel.list[i].friendlyName
            .replace(CHAT_DM_CHANNEL, '')
            .replace(currentUser.id, '')
            .replace('/', '');
          const _user = usersList.list.find((item) => item.id === partnerID);
          if (_user) {
            users.push({
              ..._user,
              sid: channel.list[i].sid,
              uniqueName: channel.list[i].uniqueName,
              friendlyName: channel.list[i].friendlyName,
              isPrivate: channel.list[i].isPrivate,
              isBold: channel.list[i].isBold,
            });
          }
        }
      }
      dispatch(setConnectedUsers(users));
    }
  }, [usersList.onlineUsers.length, channel.list.length, channel.list]);

  const addChannelClick = () => {
    setShowAddChannels(true);
    dispatch(openExtraPanel(false));
  };

  const createChannelSubmit = (values) => {
    if (values.name && values.name.length) {
      setShowAddChannels(false);
      dispatch(
        addNewChannel({
          uniqueName: eventID + '-' + currentUser.id + '-' + values.name,
          friendlyName: values.name,
          isPrivate: true
        })
      );
    }
  };

  return (
    <div onScroll={scrollHandler} className="chat-Panel" id='chat-list'>
      <ChannelList
        addChannelClick={addChannelClick}
        openChannelPanel={openChannelPanel}
      />
      <UserList
        limit={limit}
        setLimit={setLimit}
        currentUser={currentUser}
        openPrivateChat={openPrivateChat}
      />
      <CreateChannelDialog
        open={showAddChannels}
        onDismiss={hideModal}
        onSubmit={createChannelSubmit}
      />
    </div>
  );
};
