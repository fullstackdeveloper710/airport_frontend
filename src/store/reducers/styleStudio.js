import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isStyleStudioOpen: false,
  studioType: null, 
  isPodium: false,
  itemId: null,
  magicMirrorCompletion: {},
  podiumCompletion: {}
};

export const slice = createSlice({
  name: 'styleStudio',
  initialState,
  reducers: {
    openStyleStudio: (state, action) => {
      state.isStyleStudioOpen = action.payload;
    },
    setStudioType: (state, action) => {
      state.studioType = action.payload;
    },
    setIsPodium: (state, action) => {
      state.isPodium = action.payload;
    },
    setItemId: (state, action) => {
      state.itemId = action.payload;
    },
    setMagicMirrorCompletion: (state, action) => {
      if(action.payload){
        state.magicMirrorCompletion = {...state.magicMirrorCompletion , ...action.payload};
      }else{
        state.magicMirrorCompletion = {}
      }
    },
    setPodiumCompletion: (state, action) => {
      if(action.payload){
        state.podiumCompletion = {...state.podiumCompletion , ...action.payload};
      }else{
        state.podiumCompletion = {}
      }
    },
  },
});

export const {
    openStyleStudio,
    setStudioType,
    setIsPodium,
    setItemId,
    setMagicMirrorCompletion,
    setPodiumCompletion
} = slice.actions;

export default slice.reducer;