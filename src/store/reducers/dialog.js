import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  show: false,
};

export const slice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    showDialog: (state, action) => {
      state.show = action.payload;
    },
  },
});

export const { showDialog } = slice.actions;

export default slice.reducer;
