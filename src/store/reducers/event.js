import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  map: null,
  customLocations: null
};

export const slice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setMap: (state, action) => {
      state.map = action.payload;
    },
    setCustomLocations: (state, action) => {
      state.customLocations = action.payload;
    }
  },
});

export const { setMap, setCustomLocations } = slice.actions;

export default slice.reducer;
