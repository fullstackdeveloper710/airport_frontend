import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages:[],
  count:0
};

const defaultActions =[
  {
      text:"Cancel",
      type:'red',
      action : () => {
        console.log("cancel Button clicked")
      }
  },
  {
      text:"Approve",
      type:'active',
      action : () => {
        console.log("Approve Button clicked")
      }
  }
]

export const slice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setMessage: (state, action) => {
      const newMessage={
        id: state.count,
        msg : action.payload.message,
        heading : action.payload.heading || "",
        type : action.payload.type || 'error',
        timeout : action.payload.timeout || 5000,
        requireReload : action.payload.requireReload || false,
        show:false,
        actions:action.payload.actions || []
      }
      state.messages.push(newMessage)
      state.count++
    },
    removeMessage:(state,action) => {
      state.messages = state.messages.filter(message => message.id != action.payload);
    },
    showMessage:(state,action)=>{
      state.messages = state.messages.map(message=>{
        if(message.id === action.payload){
          return{...message,show:true}
        }
        return message
      })
      console.log(state.messages)
    }
  },
});

export const { setMessage,removeMessage,showMessage } = slice.actions;

export default slice.reducer;
