import { createSlice } from '@reduxjs/toolkit';
import { tips } from 'constants/web';
import { GAME_STAGE_FREEZE_FRAME, GAME_STAGE_EVENT } from 'constants/game';

const initialState = {
  stage: null,
  data: null,
  startTime: null,
  channelJoining: false,
  screenshot: null,
  showStreamStats: false,
  streamStats: {},
  prevStages: [],
  closeTimeout: null,
  currentTip: 1,
  enterEvents: false,
  meetingRoom: false,
  currentRoom: null,
  showLoader: false,
  avatarCustomization: false,
  displayMapButton: false,
  enteredIntoEvent: false,
  zoneJoined: false,
  initialLogin: false
};

export const slice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameStage: (state, action) => {
      state.stage = action.payload;
    },
    setGameStart: (state) => {
      state.initialLogin = true;
    },
    pushGameStage: (state, action) => {
      if (state.stage === action.payload) {
        return;
      }
      state.prevStages.push(state.stage);
      state.stage = action.payload;
    },
        restoreGameStage: (state, action) => {
      if (state.prevStages.length <= 0 && action.payload === 'unsetOverlay') {
        state.initialLogin = true;
      }
      if (
        state.prevStages.length &&
        action.payload === GAME_STAGE_FREEZE_FRAME
      ) {
        state.stage = state.prevStages.pop();
      }

      if (
        state.prevStages.length &&
        state.enteredIntoEvent &&
        state.initialLogin
      ) {
        state.stage = state.prevStages.pop();
      }

      if (
        state.prevStages.length > 0 &&
        state.enteredIntoEvent &&
        !state.initialLogin
      ) {
        state.prevStages = [];
        state.initialLogin = false;
        return;
      }
      if (
        state.prevStages.length &&
        !state.enteredIntoEvent &&
        state.initialLogin
      ) {
        state.stage = state.prevStages.pop();
      }
    },
    setGameData: (state, action) => {
      state.data = {
        ...state.data,
        ...action.payload,
      };
    },
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },
    setChannelJoining: (state, action) => {
      state.channelJoining = action.payload;
    },
    setScreenshot: (state, action) => {
      state.screenshot = action.payload;
    },
    setModelDisplayData: (state, action) => {
      state.modelDisplay = action.payload;
    },
    setShowStreamStats: (state, action) => {
      state.showStreamStats = action.payload;
    },
    setStreamStats: (state, action) => {
      if (state.showStreamStats) {
        state.streamStats = action.payload;
      }
    },
    setCloseTimeout: (state, action) => {
      state.closeTimeout = action.payload;
    },
    nextTip: (state) => {
      state.currentTip =
        state.currentTip === tips.length - 1 ? 1 : state.currentTip + 1;
    },
    prevTip: (state) => {
      state.currentTip =
        state.currentTip === 1 ? tips.length - 1 : state.currentTip - 1;
    },
    setLoader: (state, action) => {
      state.showLoader = action.payload;
    },
    setMeetingRoom: (state, action) => {
      state.meetingRoom = action.payload;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    setAvatarCustomization: (state, action) => {
      state.avatarCustomization = action.payload;
    },
    setDisplayMapButton: (state, action) => {
      state.displayMapButton = action.payload;
    },
    setEnteredIntoEvent: (state, action) => {
      state.stage = GAME_STAGE_EVENT;
      state.enteredIntoEvent = action?.payload;
    },
    setZoneJoined: (state, action) => {
      state.zoneJoined = action.payload;
    }
  },
});

export const {
  setGameStage,
  setGameStart,
  pushGameStage,
  restoreGameStage,
  setGameData,
  setStartTime,
  setChannelJoining,
  setScreenshot,
  setModelDisplayData,
  setShowStreamStats,
  setStreamStats,
  setCloseTimeout,
  nextTip,
  prevTip,
  setCurrentRoom,
  setLoader,
  setEventClicked,
  setMeetingRoom,
  setAvatarCustomization,
  setDisplayMapButton,
  setEnteredIntoEvent,
  setZoneJoined
} = slice.actions;

export default slice.reducer;
