import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  leaveChannel,
  deleteChannel,
  renameChannel,
  toggleNotification
} from 'store/reducers/channel';
import { getChatID } from 'utils/common';
import {
  ConfirmDialog,
  PublicChatDialog,
  RenameDialog
} from 'components/dialogs';
import { ChannelChatForm } from './ChannelChatForm';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { setShowDialog } from 'store/reducers/chat';

export const ChannelChat = () => {
  const {
    components: {
      panels: {
        extra: {
          chat: {
            channelChat: { channelChat: ls },
          },
        },
      },
    }
  } = useLabelsSchema();
  const channel = useSelector((state) => state.channel);
  const usersList = useSelector((state) => state.usersList);
  const chat = useSelector((state) => state.chat)
  const [disabledNotification, setDisabledNotification] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (channel?.current?.sid) {
      (() => {
        setDisabledNotification(
          channel.blockList.includes(channel.current.sid)
        );
      })();
    }
  }, [channel.blockList]);

  const closeDialog = () => {
    dispatch(setShowDialog(null));
  }
  const deleteCurrentChannel = () => {
    dispatch(deleteChannel(channel.current));
    closeDialog();
  };

  const leaveCurrentChannel = () => {
    dispatch(leaveChannel(channel.current, 'GROUP_CHAT'));
    closeDialog();
  };

  const renameCurrentChannel = (values) => {
    dispatch(renameChannel(channel.current, values.name));
    closeDialog();
  };

  const toggleChannelNotification = (enable) => {
    dispatch(toggleNotification(channel.current.sid, enable));
  };

  const enableParticipant = () => {
    dispatch(setShowDialog('chatUser'));
  };

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('chat-channel')?.classList.add('show')
    }, 120)
  }, [])

  return (
    <>
      {
        <div className="privateChat" id='chat-channel'>
          <ChannelChatForm onTriggerParticipant={enableParticipant} />
        </div>
      }

      <PublicChatDialog
        isGroupChat
        open={chat.showDialog === 'addUser'}
        onDismiss={closeDialog}
        usersList={usersList.list.filter(
          (item) => !channel.members.includes(getChatID(item))
        )}
      />
      <PublicChatDialog
        isGroupChat
        open={chat.showDialog === 'chatUser'}
        onDismiss={closeDialog}
        usersList={usersList.list.filter((item) =>
          channel.members.includes(getChatID(item))
        )}
        isChatUsers
      />
      <ConfirmDialog
        open={chat.showDialog === 'confirm-leave' || chat.showDialog === 'confirm-delete'}
        text={
          chat.showDialog === 'confirm-leave' ? (
            ls.confirmLeaveQuestion
          ) : (
            <span>
              {ls.confirmDeleteQuestion}
              <br />
              {ls.participantsRemovedMessage}
            </span>
          )
        }
        onDismiss={closeDialog}
        onConfirm={() =>
          chat.showDialog === 'confirm-leave'
            ? leaveCurrentChannel()
            : deleteCurrentChannel()
        }
      />
      <RenameDialog
        open={chat.showDialog === 'rename'}
        onDismiss={closeDialog}
        onConfirm={renameCurrentChannel}
      />
    </>
  );
};
