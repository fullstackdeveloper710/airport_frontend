import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { sendMessage } from 'store/reducers/chat';
import { ChatInput, UserAvatar } from 'components/common';
import { ChatHistoryItem } from '../ChatHistoryItem';
import { getChatID } from 'utils/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { setEventPanelSectionStack } from 'store/reducers/panel';

export const ChannelChatForm = (props) => {
  const {
    components: {
      panels: {
        extra: {
          chat: {
            channelChat: { channelChatForm: ls },
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
  const panel = useSelector((state) => state.panel)
  const dispatch = useDispatch();
  const { onTriggerParticipant } = props;

  const actionButtonStyles = {
    root: {
      marginTop: '5px',
      marginLeft: '-9px',
    },
    rootHovered: {
      opacity: '80%',
    },
    rootPressed: {
      opacity: '80%',
    },
    icon: {
      color: 'var(--sr-color-white)',
      fontSize: 22,
    },
  };

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

  const handleSubmit = () => {
    if (chatInputValue && chatInputValue.length) {
      dispatch(sendMessage(chatInputValue));
      SetChatInputValue('');
    }
  };

  const onInputChange = (event, value) => {
    event.preventDefault();
    SetChatInputValue(value);
  };

  const handleMovingBack = () => {
    if (panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === "channel") {
      let tempStack = [...panel.eventPanelSectionStack]
      const currentPage = tempStack.pop()
      document.getElementById('event-' + currentPage)?.classList.remove('show')
      setTimeout(() => {
        dispatch(setEventPanelSectionStack(tempStack))
      }, 300);
    }
  }
  if (channel.current == null) {
    handleMovingBack()
  }
  return (
    <>
      {channel.loading ? (
        <div className="waitingWrapper">{ls.loading}</div>
      ) : (
        channel.current &&
          channel.current.sid ? (
          <>
            <div className="chatHistory slimScrollbar" ref={chatHistoryRef}>
              {chat.chatHistory[channel.current.sid] &&
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
                          <UserAvatar
                            user={user}
                            size={12}
                            hidePersonaDetails
                          />
                        )}
                        <ChatHistoryItem
                          isYou={isYou}
                          name={`${user.firstName} ${user.lastName}`}
                          message={history.message}
                          date={history.date}
                          showUsersName={false}
                        />
                      </div>
                    );
                  }
                })}
            </div>
            <div
              className="chatInput chatInputForm"
              style={{ marginBottom: '20px' }}
            >
              <ChatInput
                value={chatInputValue}
                onSubmit={handleSubmit}
                onChange={onInputChange}
              />
            </div>
          </>
        ) :
          <div className="waitingWrapper">{ls.loading}</div>
      )}
    </>
  );
};
