import { createSlice } from '@reduxjs/toolkit';
import twilioSyncService from 'services/twilioSyncService';
import { setDialogOpen } from 'store/reducers/smartScreen';
import { setCurrent as setCurrentSmartScreen } from 'store/reducers/smartScreen';

const SERVICE_NAME = 'screenSharePollList';

const name = 'screenShare';

const initialState = {
  active: false,
  loading: false,
  playerVisible: false,
  streamerData: null,
  audioEnabled: false,
  audioAllowed: false,
  closeModal: false,
};

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setActive: (state, action) => {
      state.active = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPlayerVisiblity: (state, action) => {
      state.playerVisible = action.payload;
    },
    setStreamerData: (state, action) => {
      state.streamerData = action.payload;
    },
    setAudioEnabled: (state, action) => {
      state.audioEnabled = action.payload;
    },
    setAudioAllowed: (state, action) => {
      state.audioAllowed = action.payload;
    },
    setClosedModal: (state, action) => {
      state.closeModal = action.payload;
    },
  },
});

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

export const {
  setActive,
  setLoading,
  setPlayerVisiblity,
  setStreamerData,
  setAudioEnabled,
  setAudioAllowed,
  setClosedModal,
} = slice.actions;

const removeIndex = async (index) => {
  try {
    const list = await getScreenSharePoll();
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

const getScreenSharePoll = async () => {
  let screenShareListPolls = [];
  if (twilioSyncService.isActive) {
    let pages = await twilioSyncService[SERVICE_NAME].getItems();
    screenShareListPolls = screenShareListPolls.concat(pages.items);
    while (pages.hasNextPage) {
      pages = await pages.nextPage();
      screenShareListPolls = screenShareListPolls.concat(pages.items);
    }
  }
  return screenShareListPolls;
};

const handleSyncUpdated = async (getState, dispatch, data) => {
  const currentUser = getState().user.current;
  const streamerData = getState()[name].streamerData;

  let itemData = data.item.data;

  if (itemData) {
    const is_presenter = itemData.value.presenter === currentUser.eventUserId;

    if (
      itemData.value.is_ended &&
      (isScreenSharedInCurrentRoom(streamerData) || is_presenter)
    ) {
      if (!is_presenter && itemData.value.properly_ended) {
        dispatch(setClosedModal(true));
      }
      dispatch(setCurrentSmartScreen('Idle'));
      if (window.gameClient) {
        window.gameClient.setSmartScreenWaitingImage(false);
      }
      dispatch(setActive(false));
      dispatch(setDialogOpen(false));
      dispatch(setStreamerData(null));
      if (currentUser.eventUserId === itemData.value.presenter) {
        await removeIndex(itemData.index);
      }
    } else if (
      itemData.value.is_started &&
      !itemData.value.is_ended &&
      (isScreenSharedInCurrentRoom(itemData.value) ||
        itemData.value.presenter === currentUser.eventUserId)
    ) {
      if (!streamerData && window.gameClient) {
        window.gameClient.setSmartScreenWaitingImage(true);
      }

      dispatch(setClosedModal(false));
      dispatch(setActive(true));
      dispatch(
        setStreamerData({ ...itemData.value, pollIndex: itemData.index })
      );
    }
  }
};

export const syncScreenSyncOnRoomEntered = () => async (dispatch, getState) => {
  if (!twilioSyncService[SERVICE_NAME]) return;
  const screenShareListPolls = await getScreenSharePoll();
  const currentUser = getState().user.current;

  let room_name = '';
  if (window.gameClient) {
    room_name = window.gameClient.getCurrentRoomName();
  }
  const removeEndedStreamItem = [];
  const streamingRoom = screenShareListPolls.find((v) => {
    const itemValue = v.data.value;
    if (itemValue.is_ended) {
      removeEndedStreamItem.push(v.data.index);
      return false;
    }
    return (
      (itemValue?.presenter === currentUser.eventUserId ||
        itemValue?.room_name === room_name) &&
      itemValue.is_started &&
      !itemValue.is_ended
    );
  });
  if (streamingRoom) {
    dispatch(setActive(true));
    dispatch(
      setStreamerData({
        ...streamingRoom.data.value,
        pollIndex: streamingRoom.data.index,
      })
    );
    console.log(
      { ...streamingRoom.data.value, pollIndex: streamingRoom.data.index },
      'streamingRoom'
    );
  } else {
    dispatch(setActive(false));
    dispatch(setStreamerData(null));
  }

  for (const index of removeEndedStreamItem) {
    await removeIndex(index);
  }
};

export const screenSharingStopped = () => (dispatch, getState) => {
  const streamerData = getState()[name].streamerData;
  if (streamerData && twilioSyncService.isActive) {
    twilioSyncService[SERVICE_NAME].mutate(
      streamerData.pollIndex,
      function (remoteData) {
        remoteData.properly_ended = true;
        remoteData.is_ended = true;
        return remoteData;
      }
    );
  }
};

export const publishScreenShare = (payload) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if (twilioSyncService.isActive) {
      await twilioSyncService[SERVICE_NAME].push({
        ...payload,
      });
    }
  } catch (error) {
    // dispatch(handleError(error));
  }
  dispatch(setLoading(false));
};

export const getScreenSharePollList =
  (eventID) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      if (twilioSyncService.isActive) {
        await twilioSyncService.setScreenSharePollList(eventID);

        twilioSyncService[SERVICE_NAME].on('itemAdded', (data) =>
          handleSyncUpdated(getState, dispatch, data)
        );
        twilioSyncService[SERVICE_NAME].on('itemUpdated', (data) =>
          handleSyncUpdated(getState, dispatch, data)
        );
      }

      const screenShareListPolls = await getScreenSharePoll();

      const currentUser = getState().user.current;

      console.log(screenShareListPolls, '<<<screenShareListPolls');

      for (const screenShareListPolllItem of screenShareListPolls) {
        console.log(screenShareListPolllItem, '<<<screenShareListPolllItem');
        if (
          screenShareListPolllItem.data?.value?.presenter ===
            currentUser.eventUserId &&
          twilioSyncService.isActive
        ) {
          await twilioSyncService[SERVICE_NAME].mutate(
            screenShareListPolllItem.data.index,
            function (remoteData) {
              remoteData.is_ended = true;
              return remoteData;
            }
          );
        }
      }
    } catch (error) {
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  };

export const isScreenSharedInCurrentRoom = (data) => {
  let flag = false;
  if (window.gameClient) {
    if (window.gameClient.getCurrentRoomName() === data?.room_name) {
      flag = true;
    }
  }
  return flag;
};

export default slice.reducer;
