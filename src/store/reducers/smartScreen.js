import { createSlice } from '@reduxjs/toolkit';
import EventService from 'services/eventService';
const eventService = new EventService();

const initialState = {
  current: null,
  name: '',
  smartScreensList: [],
  available: false,
  availableModes: [],
  whiteboardURL : '',
  whiteboardOpen : false,
  showFacilitatorResources : false,
  showFacilitatorResourcesMinimizeOpts : false,
  facilitatorResourcesActive : false,
  loading: false,
  lastPlayedVideo: null,
  videoDuration: null,
  videoTime: null,
  videoPlaying: false,
  videoFinished: false,
  dialogOpen: false,
  recordedVideo: null
};

export const slice = createSlice({
  name: 'smartScreen',
  initialState,
  reducers: {
    setCurrent: (state, action) => {
      state.current = action.payload;
    },
    setSmartScreensList: (state, action) => {
      if (action.payload) {
        state.smartScreensList = [...action.payload];
      }
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setAvailable: (state, action) => {
      state.available = action.payload;
    },
    setAvailableModes: (state, action) => {
      state.availableModes = [...action.payload];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLastPlayedVideo: (state, action) => {
      state.lastPlayedVideo = action.payload;
    },
    setVideoDuration: (state, action) => {
      state.videoDuration = action.payload;
    },
    setVideoTime: (state, action) => {
      state.videoTime = action.payload;
    },
    setVideoPlaying: (state, action) => {
      state.videoPlaying = action.payload;
    },
    setVideoFinished: (state, action) => {
      state.videoFinished = action.payload;
    },
    setDialogOpen: (state, action) => {
      state.dialogOpen = action.payload;
    },
    setRecordVideo: (state, action) => {
      state.recordedVideo = action.payload;
    },
    setWhiteBoardURL: (state, action) => {
      state.whiteboardURL = action.payload;
    },
    setWhiteBoardOpen: (state, action) => {
      state.whiteboardOpen = action.payload
    },
    setShowFacilitatorResources: (state, action) => {
      state.showFacilitatorResources = action.payload
    },
    setShowFacilitatorResourcesMinimizeOpts : (state, action) => {
      state.showFacilitatorResourcesMinimizeOpts = action.payload
    },
    setFacilitatorResourcesActive : (state, action) => {
      state.facilitatorResourcesActive = action.payload
    }
  },
});

export const {
  setSmartScreensList,
  setCurrent,
  setName,
  setAvailable,
  setAvailableModes,
  setLastPlayedVideo,
  setVideoDuration,
  setVideoTime,
  setVideoPlaying,
  setVideoFinished,
  setDialogOpen,
  setRecordVideo,
  setWhiteBoardURL,
  setWhiteBoardOpen,
  setShowFacilitatorResources,
  setShowFacilitatorResourcesMinimizeOpts,
  setFacilitatorResourcesActive
} = slice.actions;
const { setLoading } = slice.actions;

const handleError = (error) => () => {
  let message;

  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }

  console.error(message);
};

export const getSmartScreenList = (eventID) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const smartScreenList = await eventService.getEventSmartScreenList(eventID);
    console.log("SMART SCREEN LIST", smartScreenList)
    dispatch(setSmartScreensList(smartScreenList));
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export default slice.reducer;
