import { createSlice } from '@reduxjs/toolkit';
import twilioSyncService from 'services/twilioSyncService';
import { enableVOG } from 'utils/eventVariables';

const initialState = {
  audioEnabled: false,
  audioAllowed: false,
  videoEnabled: false,
  videoAllowed: false,
  godEnabled: false,
  godAllowed: false,
  participantsWithAudio: [],
  microphoneId: undefined,
  cameraId: undefined,
  ongoingStream: undefined,
  changingDevice: {},
  loading: false,
  audioLoading: false,
  videoLoading: false,
  permissions: {
    audio: false,
    video: false,
  },
  permissionModal: {},
  saveDeviceModal: {},
  godUserList: [],
};

export const slice = createSlice({
  name: 'agora',
  initialState,
  reducers: {
    setAudioEnabled: (state, action) => {
      state.audioEnabled = action.payload;
    },
    setAudioAllowed: (state, action) => {
      state.audioAllowed = action.payload;
    },
    setVideoEnabled: (state, action) => {
      state.videoEnabled = action.payload;
    },
    setVideoAllowed: (state, action) => {
      state.videoAllowed = action.payload;
    },
    setAudioLoading: (state, action) => {
      state.audioLoading = action.payload;
    },
    setVideoLoading: (state, action) => {
      state.videoLoading = action.payload;
    },
    setGodEnabled: (state, action) => {
      if (!enableVOG) return;
      state.godEnabled = action.payload;
    },
    setGodAllowed: (state, action) => {
      if (!enableVOG) return;
      state.godAllowed = action.payload;
    },
    addParticipantWithAudio: (state, action) => {
      if (state.participantsWithAudio.indexOf(action.payload) === -1) {
        state.participantsWithAudio.push(action.payload);
      }
    },
    removeParticipantWithAudio: (state, action) => {
      state.participantsWithAudio = state.participantsWithAudio.filter(
        (p) => p !== action.payload
      );
    },
    clearParticipantsWithAudio: (state) => {
      state.participantsWithAudio = [];
    },
    setSubtitleEnabled: (state, action) => {
      state.subtitleEnabled = action.payload;
    },
    setSubtitle: (state, action) => {
      state.subtitle = action.payload;
    },
    setDeviceIds: (state, action) => {
      state.cameraId = action.payload.cameraId;
      state.microphoneId = action.payload.microphoneId;
    },
    setOngoingStream: (state, action) => {
      state.ongoingStream = action.payload.ongoingStream;
    },
    setMicroPhoneID: (state, action) => {
      state.microphoneId = action.payload;
    },
    setCameraID: (state, action) => {
      state.cameraId = action.payload;
    },
    setChangingDevice: (state, action) => {
      state.changingDevice = { ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPermissionModal: (state, action) => {
      state.permissionModal = action.payload;
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    setSaveDeviceModal: (state, action) => {
      state.saveDeviceModal = action.payload;
    },
    setGodUserList: (state, action) => {
      if (!enableVOG) return;
      state.godUserList = action.payload || [];
    },
  },
});

export const {
  setAudioEnabled,
  setAudioAllowed,
  setVideoEnabled,
  setVideoAllowed,
  setGodEnabled,
  setGodAllowed,
  addParticipantWithAudio,
  removeParticipantWithAudio,
  clearParticipantsWithAudio,
  setDeviceIds,
  setOngoingStream,
  setMicroPhoneID,
  setCameraID,
  setChangingDevice,
  setLoading,
  setAudioLoading,
  setVideoLoading,
  setPermissionModal,
  setPermissions,
  setSaveDeviceModal,
  setGodUserList,
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

export const showPlayerName = (playerId) => (_dispatch, getState) => {
  const { usersList } = getState();
  const player = usersList.list.find((user) => user.eventUserId === playerId);
  if (window.agoraClientPrimary && player) {
    window.agoraClientPrimary.showPlayerName(
      playerId,
      `${player.firstName || ''}${player.lastName ? ` ${player.lastName}` : ''}`
    );
  }
};

export const setTwilioGodUserList = (flag, uid) => (_dispatch, getState) => {
  if (enableVOG && twilioSyncService.isActive && twilioSyncService.godUserDoc) {
    let godList = getState().agora?.godUserList || [];
    if (typeof flag === 'boolean') {
      if (flag) {
        if (!godList.some((v) => v === uid)) {
          godList = [...godList, uid];
          twilioSyncService.godUserDoc.update({ godList });
        }
      } else {
        godList = godList.filter((v) => v !== uid);
        twilioSyncService.godUserDoc.update({ godList });
      }
    } else {
      if (flag) {
        twilioSyncService.godUserDoc.update({ godList: flag });
      }
    }
  }
};

export const getTwilioGodUserList = () => {
  if (enableVOG && twilioSyncService.isActive && twilioSyncService.godUserDoc) {
    return twilioSyncService.godUserDoc.value?.godList || [];
  }
  return [];
};

export const getGodUserList = (eventID) => async (dispatch, getState) => {
  if (!enableVOG) {
    return;
  }
  dispatch(setLoading(true));
  try {
    if (twilioSyncService.isActive) {
      const { current } = getState().user;
      await twilioSyncService.setGodUserDoc(eventID);
      if (!twilioSyncService.godUserDoc) return null;
      twilioSyncService.godUserDoc.on('updated', function (data) {
        dispatch(setGodUserList(data.value?.godList || []));
      });
      let godList = getTwilioGodUserList();
      if (godList.some((v) => v === current.eventUserId)) {
        godList = godList.filter((v) => v !== current.eventUserId);
        twilioSyncService.godUserDoc.update({ godList });
      }
      dispatch(setGodUserList(godList));
    }
  } catch (error) {
    dispatch(handleError(error));
  }
  dispatch(setLoading(false));
};

export default slice.reducer;
