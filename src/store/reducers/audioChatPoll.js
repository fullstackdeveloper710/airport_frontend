import { createSlice } from '@reduxjs/toolkit';

import twilioSyncService from 'services/twilioSyncService';

/**
 * @typedef AudioChatPollInvite
 * @type {object}
 * @property {string} [sender]    Sender User ID
 * @property {string} [recipient] Recipient User ID
 */

/**
 * @typedef AudioChatPoll
 * @type {object}
 * @property {AudioChatPollInvite[]} invites - an Array of user ids, either sender or recipient.
 * @property {(null | *)} active - Active.
 * @property {boolean} loading - Loading status.
 */

/**
 * Initial State.
 * @type AudioChatPoll
 */
const initialState = {
  invites: [],
  active: null,
  loading: false,
};

const SERVICE_NAME = "audioChatPollList"

export const slice = createSlice({
  name: 'audioChatPoll',
  initialState,
  reducers: {
    setInvites: (state, action) => {
      state.invites = action.payload;
    },
    addInvite: (state, action) => {
      if (
        !state.invites.find(
          (item) => item.pollIndex === action.payload.pollIndex
        )
      ) {
        state.invites = [...state.invites, action.payload];
      }
    },
    removeInvite: (state, action) => {
      state.invites = state.invites.filter(
        (item) => item.pollIndex !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActive: (state, action) => {
      state.active = action.payload;
    },
  },
});

export const { setInvites } = slice.actions;

const { setLoading, addInvite, removeInvite, setActive } = slice.actions;

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

const handleItemUpdates = async (getState, dispatch, data) => {
  const activeAudioChat = getState().audioChatPoll.active;
  const currentUserId = getState().user.current.eventUserId;
  const currentInvites = getState().audioChatPoll.invites;

  if (data.item.data.value.participants.indexOf(currentUserId) !== -1) {
    // If the current user is in the call,
    if (data.item.data.value.participants.length === 1) {
      // If the user is the only one in the call, terminate.
      dispatch(setActive(null));
      if(twilioSyncService.isActive){
        await removeIndex(data.item.data.index);
      }
    } else {
      if (activeAudioChat && activeAudioChat.index !== data.item.data.index) {
        // If the user is joining another audio call, end current one first.
        dispatch(endAudioChatPoll());
      }
      // Join new audio chat
      dispatch(
        setActive({
          index: data.item.data.index,
          value: data.item.data.value,
        })
      );
    }
  } else if (
    activeAudioChat &&
    data.item.data.index === activeAudioChat.index
  ) {
    // User ended the call,
    dispatch(setActive(null));
  }

  // Check if there are new invites.
  for (const invite of data.item.data.value.invites) {
    if (invite.sender === currentUserId || invite.recipient === currentUserId) {
      dispatch(
        addInvite({
          pollIndex: data.item.data.index,
          channelName: data.item.data.value.channelName,
          ...invite,
        })
      );
    }
  }

  // Check if any invites are declined.
  for (const invite of currentInvites) {
    if (
      invite.pollIndex === data.item.data.index &&
      !data.item.data.value.invites.find(
        (item) =>
          item.sender === invite.sender && item.recipient === invite.recipient
      )
    ) {
      dispatch(removeInvite(invite.pollIndex));
    }
  }

  // In case of empty poll, remove that
  if (
    data.item.data.value.participants.length === 0 &&
    data.item.data.value.invites.length === 0
  ) {
    try {
      if(twilioSyncService.isActive){
        await removeIndex(data.item.data.index);
      }
      // eslint-disable-next-line
    } catch (err) {}
  }
};

const getAudioChatPolls = async () => {
  let audioChatPolls = [];
  if(twilioSyncService.isActive){
    let pages = await twilioSyncService[SERVICE_NAME].getItems();
    audioChatPolls = audioChatPolls.concat(pages.items);
    while (pages.hasNextPage) {
      pages = await pages.nextPage();
      audioChatPolls = audioChatPolls.concat(pages.items);
    }
  }
  return audioChatPolls;
};


const removeIndex = async (index) => {
  try {
    const list = await getAudioChatPolls();
    const isIndexAvailable = list?.some((v) => {
      return v.data.index === index;
    });
    if (isIndexAvailable && twilioSyncService.isActive) {
      await twilioSyncService[SERVICE_NAME].remove(index);
    }
  } catch (error) {
    console.log(error);
  }
};


export const getAudioChatPollList = (eventID) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    if(twilioSyncService.isActive){
      await twilioSyncService.setAudioChatPollList(eventID);

      if(!twilioSyncService[SERVICE_NAME]) return null
      twilioSyncService[SERVICE_NAME].on('itemAdded', (data) =>
        handleItemUpdates(getState, dispatch, data)
      );
      twilioSyncService[SERVICE_NAME].on('itemUpdated', (data) =>
        handleItemUpdates(getState, dispatch, data)
      );
  
      const audioChatPolls = await getAudioChatPolls();
  
      const currentUserId = getState().user.current?.eventUserId;
      const existingInvites = [];

      if(currentUserId){
      for (const audioChatPollItem of audioChatPolls) {
        const _invites = audioChatPollItem.data.value?.invites;
  
        if (!(_invites && _invites.find)) {
          continue;
        }
  
        const invite = audioChatPollItem.data.value.invites.find(
          (invite) =>
            invite.sender === currentUserId || invite.recipient === currentUserId
        );
        if (invite) {
          existingInvites.push({
            pollIndex: audioChatPollItem.data.index,
            channelName: audioChatPollItem.data.value.channelName,
            ...invite,
          });
        }
      }
      }
      dispatch(setInvites(existingInvites));
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const acceptAudioChatPoll = (invite) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if(twilioSyncService.isActive){
      twilioSyncService[SERVICE_NAME].mutate(
        invite.pollIndex,
        function (remoteData) {
          remoteData.participants = [
            ...new Set([
              ...remoteData.participants,
              invite.sender,
              invite.recipient,
            ]),
          ];
          remoteData.invites = remoteData.invites.filter(
            (item) =>
              item.sender !== invite.sender && item.recipient !== invite.recipient
          );
          return remoteData;
        }
      );
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const declineAudioChatPoll = (invite) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if(twilioSyncService.isActive){
      twilioSyncService[SERVICE_NAME].mutate(
        invite.pollIndex,
        function (remoteData) {
          remoteData.invites = remoteData.invites.filter(
            (item) =>
              item.sender !== invite.sender && item.recipient !== invite.recipient
          );
          return remoteData;
        }
      );
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const publishAudioChatPoll = (payload) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const activeAudioChat = getState().audioChatPoll.active;

    if (activeAudioChat) {
      if(twilioSyncService.isActive){
        // If the user is already in the audio chat, just add new invites
        await twilioSyncService[SERVICE_NAME].mutate(
          activeAudioChat.index,
          (remoteData) => {
            // Check if recepient is already in the audio chat
            if (
              !remoteData.participants.find(
                (participant) => participant === payload.recipient
              )
            ) {
              remoteData.invites.push({
                sender: payload.sender,
                recipient: payload.recipient,
              });
            }
            return remoteData;
          }
        );
      }
    } else {
      if(twilioSyncService.isActive){
        // Creates a new audio chat poll
        await twilioSyncService[SERVICE_NAME].push({
          channelName: payload.channelName,
          participants: [],
          invites: [{ sender: payload.sender, recipient: payload.recipient }],
        });
      }
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const endAudioChatPoll = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const activeAudioChat = getState().audioChatPoll.active;
    const currentUserId = getState().user.current.eventUserId;

    if (activeAudioChat && twilioSyncService.isActive) {
      twilioSyncService[SERVICE_NAME].mutate(
        activeAudioChat.index,
        function (remoteData) {
          remoteData.participants = remoteData.participants.filter(
            (participant) => participant !== currentUserId
          );
          remoteData.invites = remoteData.invites.filter(
            (invite) => invite.sender !== currentUserId
          );

          return remoteData;
        }
      );
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export default slice.reducer;
