import addNotification from 'react-push-notification';
import { createSlice } from '@reduxjs/toolkit';
import chatService from 'services/chatService';
import {
  initChatHistory,
  insertChatHistory,
  initChatHistoryItem,
} from './chat';
import {
  openExtraPanel,
  openPanel,
  setExtraPanelData,
  setExtraPanelName,
} from './panel';
import { CHAT_DM_CHANNEL } from 'constants/web';
import { convertIdToEventLoggerFormat } from 'utils/common';
import config from 'config';
import { getChatID } from 'utils/common';
import BaseAPIService from 'services/baseAPIService';

const initialState = {
  list: [],
  members: [],
  boldList: [],
  loading: false,
  listLoading: false,
  inviteLoading: false,
  current: null,
  userRole: null,
  blockList: [],
  publicFriendlyNames: []
};

const ROLES = {
  RLb34d39258c724831bca7454b1e55da73: 'service_admin',
  RL31c3d57f65134851aa4d44f8cbede22b: 'service_user',
  RLd540cd20dedb4a8e9d30f6794957dc5a: 'channel_admin',
  RLf1c683038f0f4887b0e314b92d83ae1b: 'channel_user',
};

export const slice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    addChannelItem: (state, action) => {
      if (
        !state.list.find(
          (channelInfo) => channelInfo.sid === action.payload.sid
        ) &&
        action.payload._internalState?.friendlyName.indexOf(CHAT_DM_CHANNEL) !==
          0
      ) {
        let payload = action.payload;
        if (state.boldList.includes(payload.sid)) {
          payload.isBold = true;
        }
        state.list.push(payload);
      }
    },
    activateChannelItem: (state, action) => {
      let list = [...state.list];
      list = list.map((channelInfo) => {
        if (channelInfo.sid === action.payload.sid) {
          return { ...channelInfo, status: 'joined' };
        }
        return channelInfo;
      });
      state.list = list;
    },
    removeChannelItem: (state, action) => {
      let sid = action.payload;
      state.list = state.list.filter((item) => item.sid !== sid);
    },
    renameFriendly: (state, action) => {
      let list = [...state.list];
      let channel = list.find((item) => item.sid === action.payload.sid);
      if (channel) {
        channel.friendlyName = action.payload.friendlyName;
        if (state.current && channel.sid === state.current.sid) {
          state.current.friendlyName = action.payload.friendlyName;
        }
      }
      state.list = list;
    },
    renameUnique: (state, action) => {
      let list = [...state.list];
      let channel = list.find((item) => item.sid === action.payload.sid);
      if (channel) {
        channel.uniqueName = action.payload.uniqueName;
        if (state.current && channel.sid === state.current.sid) {
          state.current.uniqueName = action.payload.uniqueName;
        }
      }
      state.list = list;
    },
    setChannelList: (state, action) => {
      let list = action.payload;
      for (let channel of list) {
        if (state.boldList.includes(channel.sid)) {
          channel.isBold = true;
        }
      }
      state.list = list;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setInviteLoading: (state, action) => {
      state.inviteLoading = action.payload;
    },
    setListLoading: (state, action) => {
      state.listLoading = action.payload;
    },
    setCurrentChannel: (state, action) => {
      state.current = action.payload;
    },
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    setBlockList: (state, action) => {
      state.blockList = action.payload;
    },
    AddMember: (state, action) => {
      state.members.push(action.payload);
    },
    removeMember: (state, action) => {
      let email = action.payload;
      state.members = state.members.filter((item) => item !== email);
    },
    initUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    addToBoldList: (state, action) => {
      if (!state.boldList.includes(action.payload)) {
        state.boldList.push(action.payload);
      }
    },
    setBoldToChannel: (state, action) => {
      let newList = [...state.list];
      let channel = newList.find((item) => item.sid === action.payload.sid);
      if (channel) channel.isBold = true;
      state.list = newList;

      if (!state.boldList.includes(action.payload.sid)) {
        state.boldList.push(action.payload.sid);
      }
    },
    removeBoldFromChannel: (state, action) => {
      let newList = [...state.list];
      let channel = newList.find((item) => item.sid === action.payload.sid);
      if (channel) channel.isBold = false;
      state.list = newList;
      let index = state.boldList.indexOf(action.payload.sid);
      if (index !== -1) {
        state.boldList.splice(index, 1);
      }
    },
    setPublicFriendlyNames: (state, action) => {
      state.publicFriendlyNames = action.payload;
    }
  },
});

export const {
  initUserRole,
  removeChannelItem,
  removeMember,
  setListLoading,
  addToBoldList,
  renameFriendly,
  renameUnique,
  setBlockList,
  activateChannelItem,
} = slice.actions;

export const {
  addChannelItem,
  setChannelList,
  setCurrentChannel,
  setLoading,
  setInviteLoading,
  setMembers,
  AddMember,
  setBoldToChannel,
  removeBoldFromChannel,
  setPublicFriendlyNames
} = slice.actions;

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

const showNotification = (message, usersList) => {
  if (message && message.conversation) {
    let authorEmail = message.author || '';
    let authorName = null;
    usersList.forEach((item) => {
      if (getChatID(item) === authorEmail) {
        authorName = `${item.firstName} ${item.lastName}`;
      }
    });
    if (!authorName || authorName === '') authorName = authorEmail;

    let channelName = message.conversation._internalState
      ? message.conversation._internalState.friendlyName || ''
      : '';
    let messageBody = message.state.body || '';

    if (channelName === '' || channelName.includes(CHAT_DM_CHANNEL)) {
      channelName = authorName;
    } else {
      channelName = '#' + channelName;
      messageBody = `${authorName} : ` + messageBody;
    }
    addNotification({
      title: channelName,
      message: messageBody,
      theme: 'darkblue',
      native: true,
    });
  }
};

const chatListener = (message, currentUser) => (dispatch, getState) => {
  try {
    if (
      !message ||
      !message.conversation ||
      !message.services ||
      !message.state
    ) {
      return;
    }

    const channel = message.conversation;
    const usersList = getState().usersList.list;

    if (!chatService.channels[channel.sid]) {
      chatService.channels[channel.sid] = channel;
      dispatch(
        addChannelItem({
          sid: channel.sid,
          uniqueName: channel.uniqueName,
          friendlyName: channel.friendlyName,
          isPrivate:
            channel.friendlyName.indexOf(CHAT_DM_CHANNEL) === 0 ? false : true,
          membersCount: channel.membersCount,
          isBold: true,
          status: channel.status,
        })
      );
    }

    window?.gameClient?.logUserAction?.({
      eventName: 'MESSAGE_RECEIVED',
      eventSpecificData: channel.friendlyName.indexOf(CHAT_DM_CHANNEL)
        ? JSON.stringify({
            channel: 'DM',
            from: message.state.author,
          })
        : JSON.stringify({
            channel: 'channel',
            conversation: channel.friendlyName,
            from: message.state.author,
          }),
      beforeState: null,
      afterState: null,
    });

    // Insert Message to Chat History
    dispatch(
      insertChatHistory({
        sid: channel.sid,
        message: {
          from: message.state.author,
          message: message.state.body,
          date: message.state.dateUpdated.toString(),
        },
      })
    );

    if (message.state.author === getChatID(currentUser)) return;
    const blockList = getState().channel.blockList;
    if (blockList.includes(channel.sid)) return;

    // Show Desktop Notification
    showNotification(message, usersList);

    // Show Red Dot to conversation
    dispatch(
      setBoldToChannel({
        sid: channel.sid,
        uniqueName: channel.uniqueName,
        friendlyName: channel.friendlyName,
      })
    );
  } catch (error) {
    dispatch(handleError(error));
  }
};

const makePrivateRoom = (id1, id2) => {
  if (id1 < id2) {
    return `${id1}/${id2}`;
  }
  return `${id2}/${id1}`;
};

export const initChannels = (tokenResult) => async (dispatch, getState) => {
  dispatch(setListLoading(true));
  try {
    await chatService.setupMessenger(tokenResult);
    const currentUser = getState().user.current;
    const oldCMSUser = getState().user.oldUser;
    if (chatService.isActive) {
      const response = await chatService.loadChannelList(
        config.experience.subExperienceId,
        currentUser,
        (message) => dispatch(chatListener(message, currentUser))
      );
      if (!response) return null;
      dispatch(setChannelList(response.channels));
      dispatch(initChatHistory(response.messages));
      if (chatService.isActive) {
        const res = await chatService.getBlockList(
          config.event.id,
          oldCMSUser.id
        );
        dispatch(setBlockList(res.list || []));
      }
      dispatch(initChatHandlers());
    }
  } catch (error) {
    dispatch(handleError(error));
  }
  dispatch(setListLoading(false));
};

export const toggleNotification =
  (sid, isEnable) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      const currentUser = getState().user.current;
      const oldCMSUser = getState().user.oldUser;
      let res;
      let newBlockList = [...getState().channel.blockList];
      if (isEnable) {
        newBlockList = newBlockList.filter((blockItem) => blockItem !== sid);
      } else if (!newBlockList.includes(sid)) {
        newBlockList.push(sid);
      }
      if (chatService.isActive) {
        res = await chatService.updateBlockList(
          config.experience.subExperienceId,
          oldCMSUser.id,
          newBlockList
        );
        dispatch(setBlockList(res || []));
      }
    } catch (error) {
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  };

export const addNewChannel =
  (channelPayload, isDirectMessage = false, callback, openAsWellIfExist = false) =>
  async (dispatch, getState) => {
    dispatch(setLoading(true));
    let channel;
    try {
      if (chatService.isActive) {
        // Todo: Replace channel assignment using response object after backend api endpoint is ready
        channel = await chatService.createNewChannel(channelPayload);
        window?.gameClient?.logUserAction?.({
          eventName: 'CHANNEL_CREATED',
          eventSpecificData: JSON.stringify({ name: channelPayload.friendlyName }),
          beforeState: null,
          afterState: null,
        });
      }
    } catch (error) {
      if (openAsWellIfExist && error.code === 50307) {
        try {
          if (chatService.isActive) {
            channel = await chatService.client.getConversationByUniqueName(
              channelPayload.uniqueName
            );
          }
        } catch (e) {
          dispatch(handleError(e));
          dispatch(setInviteLoading(false));
          dispatch(setLoading(false));
          return;
        }
      } else {
        dispatch(handleError(error));
        dispatch(setInviteLoading(false));
        dispatch(setLoading(false));
        return;
      }
    }
    if (channel) {
      let newChannel = {
        sid: channel.sid,
        uniqueName: channel.uniqueName,
        friendlyName: channel.friendlyName,
        isPrivate:
          channel.friendlyName.indexOf(CHAT_DM_CHANNEL) === 0 ? false : true,
        membersCount: channel.membersCount,
        status: channel.status,
      };
      dispatch(addChannelItem(newChannel));
      dispatch(openChannel(newChannel, isDirectMessage, callback));
    }
  };

export const openChannel =
  (channelInfo, isDirectMessage = false, callback) =>
  async (dispatch, getState) => {
    try {
      let currentChannelInfo;
      const typingStartHandler = () => {};
      const typingEndHandler = () => {};
      const memberJoinHandler = (member) => {
        const originalMembers = getState().channel.members;
        if (!originalMembers.includes(member.state.identity)) {
          dispatch(AddMember(member.state.identity));
        }
      };
      const memberLeftHandler = (member) => {
        const originalMembers = getState().channel.members;
        if (originalMembers.includes(member.state.identity)) {
          dispatch(removeMember(member.state.identity));
        }
      };
      if (channelInfo.status !== 'joined') {
        if (chatService.isActive) {
          let channel = await chatService.client.getConversationBySid(
            channelInfo.sid
          );
          try {
            await chatService.joinChannel(channel);
            currentChannelInfo = {
              ...channelInfo,
              status: 'joined',
            };
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        currentChannelInfo = { ...channelInfo, status: 'joined' };
      }

      dispatch(setLoading(true));
      dispatch(setExtraPanelData(channelInfo));
      dispatch(removeBoldFromChannel(channelInfo));
      dispatch(setCurrentChannel(currentChannelInfo));

      if (chatService.isActive) {
        chatService.setupChannel(
          channelInfo.sid,
          typingStartHandler,
          typingEndHandler,
          memberJoinHandler,
          memberLeftHandler
        );
      }

      if (chatService.isActive) {
        chatService.currentChannel.getParticipants().then((members) => {
          console.log("CHAT USERS GET PARTICIPANTS", members)
          let identities = [];
          for (let member of members) {
            identities.push(member.state.identity);
            if (
              member.state.identity === chatService.identity &&
              member.state.roleSid &&
              ROLES[member.state.roleSid]
            ) {
              dispatch(initUserRole(ROLES[member.state.roleSid]));
            }
          }
          dispatch(setMembers(identities));
        });
      }

      if (callback) {
        callback(chatService.currentChannel);
      }
    } catch (error) {
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  };

export const sendTyping = () => (dispatch) => {
  try {
    if (chatService.isActive) {
      chatService.sendTypingSignal();
    }
  } catch (error) {
    dispatch(handleError(error));
  }
};

export const inviteHandler = (channel) => async (dispatch, getState) => {
  let messages = [];
  if (channel.uniqueName.indexOf(getState().user.eventID) !== 0) {
    return;
  }
  try {
    if (chatService.isActive) {
      if (!chatService.channels[channel.sid]) {
        chatService.channels[channel.sid] = channel;

        dispatch(
          addChannelItem({
            sid: channel.sid,
            uniqueName: channel.uniqueName,
            friendlyName: channel.friendlyName,
            isPrivate:
              channel.friendlyName.indexOf(CHAT_DM_CHANNEL) === 0
                ? false
                : true,
            membersCount: channel.membersCount,
            isBold: true,
            status: channel.status,
          })
        );
        if (
          channel._internalState?.createdBy !==
          getChatID(getState().user.current)
        ) {
          let messageInfo = await chatService.loadMessages(channel);
          for (let item of messageInfo.items) {
            messages.push({
              from: item.state.author,
              message: item.state.body,
              date: item.state.dateUpdated.toString(),
            });
          }
          dispatch(
            initChatHistoryItem({
              sid: channel.sid,
              messages,
            })
          );
        }
      }
      chatService.addMessageHandlerToChannel(channel);
    }
  } catch (error) {
    dispatch(handleError(error));
  }
};

export const add = (user) => (dispatch) => {
  try {
    if (chatService.isActive) {
      chatService.addUser(user);
    }
  } catch (error) {
    dispatch(handleError(error));
  }
};

const leave =
  (channelInfo, chatType = 'DM_CHAT') =>
  (dispatch) => {
    try {
      let channel = chatService.channels[channelInfo.sid];
      if (channel && channel.status === 'joined' && chatType === 'GROUP_CHAT') {
        if (chatService.isActive) {
          chatService.leaveChannel(channel);
        }
      } else if (
        channel &&
        channel.status === 'notParticipating' &&
        chatType === 'REMOVED_CHAT'
      ) {
        chatService.removeChannel(channel);
      }
      dispatch(removeChannelItem(channelInfo.sid));
      dispatch(setCurrentChannel(null));
      dispatch(setMembers([]));
      dispatch(initUserRole(null));
      dispatch(openExtraPanel(false));
      dispatch(removeBoldFromChannel({ sid: channelInfo.sid }));
      delete chatService.channels[channelInfo.sid];
    } catch (error) {
      dispatch(handleError(error));
    }
  };

export const leaveChannel = (channelInfo, chatType) => async (dispatch) => {
  try {
    dispatch(leave(channelInfo, chatType));
  } catch (error) {
    dispatch(handleError(error));
  }
};

export const deleteChannel = (channelInfo) => async (dispatch, getState) => {
  try {
    let channel = chatService.channels[channelInfo.sid];
    if (chatService.isActive) {
      chatService.deleteChannel(channel);
    }
  } catch (error) {
    dispatch(handleError(error));
  }
};

export const renameChannel =
  (channelInfo, newName) => async (dispatch, getState) => {
    try {
      let channel = chatService.channels[channelInfo.sid];
      let userID = getState().user.current.id;
      if (chatService.isActive) {
        await chatService.updateUniqueName(
          channel,
          `${config.experience.subExperienceId}-${userID}-${newName}`
        );
      }
      if (chatService.isActive) {
        await chatService.updateFriendlyName(channel, newName);
      }
    } catch (error) {
      dispatch(handleError(error));
    }
  };

export const removeUser = (channelInfo, user) => async (dispatch) => {
  try {
    let channel = chatService.channels[channelInfo.sid];
    if (chatService.isActive) {
      chatService.removeUser(channel, getChatID(user));
    }
    dispatch(removeMember(getChatID(user)));
  } catch (error) {
    dispatch(handleError(error));
  }
};

const rename = (updateInfo) => (dispatch) => {
  if (updateInfo.updateReasons.includes('friendlyName')) {
    dispatch(
      renameFriendly({
        sid: updateInfo.conversation.sid,
        friendlyName: updateInfo.conversation.friendlyName,
      })
    );
  }
  if (updateInfo.updateReasons.includes('uniqueName')) {
    dispatch(
      renameUnique({
        sid: updateInfo.conversation.sid,
        uniqueName: updateInfo.conversation.uniqueName,
      })
    );
    if (
      chatService.currentChannel &&
      chatService.currentChannel.sid === updateInfo.conversation.sid
    ) {
      dispatch(openExtraPanel(false));
    }
  }
};

export const initChatHandlers = () => (dispatch, getState) => {
  try {
    chatService.setChannelInviteHandler((channel) => {
      dispatch(inviteHandler(channel));
    });
    chatService.setChannelRomovedHandler((channel) => {
      dispatch(leave(channel, 'REMOVED_CHAT'));
    });
    chatService.setChannelUpdateHandler((updateInfo) => {
      dispatch(rename(updateInfo));
    });
    chatService.setChannelLeftHandler(() => {});
  } catch (error) {
    dispatch(handleError(error));
  }
};

export const removeNotifications = () => (dispatch) => {
  try {
    if (chatService.isActive) {
      chatService.removeNotificationFromAllChannel();
    }
  } catch (error) {
    dispatch(handleError(error));
  }
};

export const showInviteChatRoomOrOpenRoom =
  (partner, current) => async (dispatch) => {
    const roomFriendly =
      CHAT_DM_CHANNEL + makePrivateRoom(partner.id, current.id);
    const room = config.experience.subExperienceId + '-' + roomFriendly;
    try {
      if (chatService.isActive) {
        let channel = await chatService.client.getConversationByUniqueName(
          room
        );
        await chatService.joinChannel(channel);
        chatService.channels[channel.sid] = channel;
        dispatch(
          openChannel(
            {
              sid: channel.sid,
              uniqueName: channel.uniqueName,
              friendlyName: channel.friendlyName,
              isPrivate: false,
              membersCount: channel.membersCount,
              status: channel.status,
            },
            true
          )
        );
        dispatch(
          addChannelItem({
            sid: channel.sid,
            uniqueName: channel.uniqueName,
            friendlyName: channel.friendlyName,
            isPrivate: false,
            membersCount: channel.membersCount,
            status: channel.status,
          })
        );
        if (chatService.isActive) {
          let messageInfo = await chatService.loadMessages(channel);
          let messages = [];
          for (let item of messageInfo.items) {
            messages.push({
              from: item.state.author,
              message: item.state.body,
              date: item.state.dateUpdated.toString(),
            });
          }
          dispatch(
            initChatHistoryItem({
              sid: channel.sid,
              messages,
            })
          );
          if (chatService.isActive) {
            chatService.addMessageHandlerToChannel(channel);
          }
        }
      } else {
        console.log('Chat service is not active');
      }
    } catch (err) {
      dispatch(
        addNewChannel(
          {
            uniqueName: room,
            friendlyName: roomFriendly,
            isPrivate: false
          },
          true,
          () => {
            if (partner.eventUserId !== current.eventUserId) {
              dispatch(add(partner));
            }
          },
          true
        )
      );
    }
  };

export default slice.reducer;
