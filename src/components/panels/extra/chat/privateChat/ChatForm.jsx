import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { sendMessage } from 'store/reducers/chat';
import { setExtraPanelName } from 'store/reducers/panel';
import { setInviteLoading, add, sendTyping } from 'store/reducers/channel';
import chatService from 'services/chatService';
import { ChatInput, UserAvatar } from 'components/common';
import { ChatHistoryItem } from '../ChatHistoryItem';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { getChatID } from 'utils/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export const ChatForm = () => {
  const {
    components: {
      panels: {
        extra: {
          chat: {
            privateChat: { chatForm: ls },
          },
        },
      },
    },
  } = useLabelsSchema();
  const [chatInputValue, SetChatInputValue] = useState('');
  const chatHistoryRef = useRef(null);
  const chat = useSelector((state) => state.chat);
  const channel = useSelector((state) => state.channel);
  const currentUser = useSelector((state) => state.user.current);
  const usersList = useSelector((state) => state.usersList);
  const dispatch = useDispatch();


  useEffect(() => {
    scrollToBottom();
  }, [chatHistoryRef.current]);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (
      chatHistoryRef.current &&
      chatHistoryRef.current.scrollTop >
      chatHistoryRef.current.scrollHeight -
      chatHistoryRef.current.clientHeight -
      150
    ) {
      scrollToBottom();
    }
  }, [
    channel.current &&
    channel.current.sid &&
    chat.chatHistory[channel.current.sid],
  ]);

  const addUserAndSendMessage = async () => {
    const other =
      channel.current && channel.current.friendlyName
        ? channel.current.friendlyName
          .replace(CHAT_DM_CHANNEL, '')
          .replace(currentUser.id, '')
          .replace('/', '')
        : '';
    const privateChatPartner =
      other && usersList.list.filter((item) => item.id === other).length
        ? usersList.list.find((item) => item.id === other)
        : null;
    if (privateChatPartner) {
      if (currentUser.eventUserId !== privateChatPartner.eventUserId) {
        dispatch(add(privateChatPartner));
      }
      dispatch(
        sendMessage(chatInputValue, () => {
          dispatch(setExtraPanelName('PrivateChat'));
        })
      );
      SetChatInputValue('');
      if (channel.inviteLoading) {
        dispatch(setInviteLoading(false));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (chatInputValue && chatInputValue.length) {
        let newchannel = null;
        if (chatService.isActive) {
          newchannel = await chatService.client.getConversationBySid(
            channel.current.sid
          );
        }
        if (newchannel?.participants?.size < 2) {
          chatService.currentChannel = newchannel;
          if (
            channel.userRole === 'service_admin' ||
            channel.userRole === 'channel_admin'
          ) {
            addUserAndSendMessage();
          } else {
            if (chatService.isActive) {
              chatService.joinChannel(newchannel);
            }
            dispatch(sendMessage(chatInputValue));
            SetChatInputValue('');
          }
        } else {
          dispatch(sendMessage(chatInputValue));
          SetChatInputValue('');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onInputChange = (event, value) => {
    event.preventDefault();
    SetChatInputValue(value);
    if (value) {
      dispatch(sendTyping());
    }
  };

  return (
    <>
      {channel.loading || channel.inviteLoading ? (
        <div className="waitingWrapper">{ls.loading}</div>
      ) : (
        <>
          <div className="chatHistory slimScrollbar" ref={chatHistoryRef}>
            {channel.current &&
              channel.current.sid &&
              chat.chatHistory[channel.current.sid] &&
              chat.chatHistory[channel.current.sid].map((history, index) => {
                const isYou = history.from === getChatID(currentUser);
                const user = usersList.list.find(
                  (item) => getChatID(item) === history.from
                );
                if (user) {
                  return (
                    <div
                      key={index}
                      className={`chatHistoryLine ${isYou ? 'mine' : ''}`}
                    >
                      {!isYou && (
                        <UserAvatar user={user} size={45} hidePersonaDetails />
                      )}
                      <ChatHistoryItem
                        isYou={isYou}
                        name={`${user?.firstName} ${user?.lastName}`}
                        message={history.message}
                        date={history.date}
                        showUsersName={true}
                      />
                    </div>
                  );
                }
              })}
          </div>
          <div className="chatInput private-chat-box">
            <ChatInput
              value={chatInputValue}
              onSubmit={handleSubmit}
              onChange={onInputChange}
            />
          </div>
        </>
      )}
    </>
  );
};
