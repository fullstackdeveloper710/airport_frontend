import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activePanel: null,
  activeUtility: null
};

export const slice = createSlice({
  name: 'virtualClassroom',
  initialState,
  reducers: {
    setActivePanel: (state, action) => {
        state.activePanel = action.payload;
    },
    setActiveUtility: (state, action) => {
        state.activeUtility = action.payload;
    }
  },
});

export const {
    setActivePanel,
    setActiveUtility
} = slice.actions;

export default slice.reducer;