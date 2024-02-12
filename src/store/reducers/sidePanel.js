import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidePanelOpen: false,
  sidePanelName: null, 
  sidePanelKey: null,
  isClassroomPanelOpen:false
};

export const slice = createSlice({
  name: 'sidePanel',
  initialState,
  reducers: {
    openSidePanel: (state, action) => {
      state.isSidePanelOpen = action.payload;
    },
    setSidePanelName: (state, action) => {
      state.sidePanelName = action.payload;
    },
    setSidePanelKey: (state, action) => {
      state.sidePanelKey = action.payload;
    },
    setClassroomPanelOpen: (state, action) => {
      state.isClassroomPanelOpen = action.payload;
    }
  },
});

export const {
    openSidePanel,
    setSidePanelName,
    setSidePanelKey,
    setClassroomPanelOpen
} = slice.actions;

export default slice.reducer;