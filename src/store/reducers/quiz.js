import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentQuiz:null,
    loading:false
}

export const slice = createSlice({
    name: 'quiz',
    initialState,
    reducers:{
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCurrentQuiz:(state,action) => {
            state.currentQuiz = action.payload
        }
    }
})

export const {setLoading,setCurrentQuiz} = slice.actions;


export default slice.reducer;