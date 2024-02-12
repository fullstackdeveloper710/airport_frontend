import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    type:null,
    roomCount:null,
    loading:false
}

export const slice = createSlice({
    name: 'polls',
    initialState,
    reducers:{
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setRoomsCount:(state,action) => {
            state.roomCount = action.payload
        },
        setBreakoutType:(state,action) => {
            state.type = action.payload
        }
    }
})

export const {setLoading,setRoomsCount,setBreakoutType} = slice.actions;

export default slice.reducer;