import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  isExtraOpen: false,
  panelName: null, 
  panelTabName: null,
  panelData: null,
  extraPanelName: null,
  extraPanelData: null,
  showBackButton: false,
  eventPanelSectionStack: [],
};

export const slice = createSlice({
  name: 'panel',
  initialState,
  reducers: {
    openPanel: (state, action) => {
      state.isOpen = action.payload;
    },
    setPanelName: (state, action) => {
      if (state.panelName !== action.payload) {
        state.isExtraOpen = false;
      }
      state.panelName = action.payload;
    }, 
    setPanelTabName: (state, action) => {
      state.panelTabName = action.payload;
    },
    setPanelData: (state, action) => {
      state.panelData = action.payload;
    },
    openExtraPanel: (state, action) => {
      state.isExtraOpen = action.payload;
    },
    setExtraPanelName: (state, action) => {
      state.extraPanelName = action.payload;
    },
    setExtraPanelData: (state, action) => {
      state.extraPanelData = action.payload;
    },
    setPanelBackButton: (state, action) => {
      state.showBackButton = action.payload;
    },
    setEventPanelSectionStack: (state, action) => {
      state.eventPanelSectionStack = action.payload;
    },
  },
});

export const {
  openPanel,
  setPanelName, 
  setPanelTabName,
  setPanelData,
  openExtraPanel,
  setExtraPanelName,
  setExtraPanelData,
  setPanelBackButton,
  setEventPanelSectionStack,
} = slice.actions;

export default slice.reducer;

