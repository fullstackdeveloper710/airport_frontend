import { createSlice } from "@reduxjs/toolkit";
import classroomService from "services/classroomService";

const initialState = {
    currentPoll:null,
    loading:false
}

export const slice = createSlice({
    name: 'polls',
    initialState,
    reducers:{
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCurrentPoll:(state,action) => {
            state.currentPoll = action.payload
        }
    }
})

export const {setLoading,setCurrentPoll} = slice.actions;

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};


export const createAgendaPoll =
  (agendaId, payload) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
        let results = await classroomService.createPoll(agendaId,payload)
    }
    catch(error){
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  }

export default slice.reducer;