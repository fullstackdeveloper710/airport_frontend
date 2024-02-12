import { createSlice } from '@reduxjs/toolkit';
import chatService from 'services/chatService';

const initialState = {
  chatHistory: {},
  connectedUsers: [],
  showDialog:null
};

export const slice = createSlice({
  name: 'privateChat',
  initialState,
  reducers: {
    initChatHistory: (state, action) => {
      state.chatHistory = action.payload;
    },
    initChatHistoryItem: (state, action) => {
      state.chatHistory[action.payload.sid] = action.payload.messages;
    },
    insertChatHistory: (state, action) => {
      let index = action.payload.sid;
      let history = { ...state.chatHistory };
      if (!history[index]) {
        history[index] = [];
      }
      history[index].push(action.payload.message);
      state.chatHistory = history;
    },
    setConnectedUsers: (state, action) => {
      state.connectedUsers = action.payload;
    },
    addConnectedUsers: (state, action) => {
      let users = [...state.connectedUsers];
      users.push(action.payload);
      state.connectedUsers = users;
    },
    setShowDialog:(state,action) =>{
      state.showDialog = action.payload;
    }
  },
});

export const {
  insertChatHistory,
  setConnectedUsers,
  addConnectedUsers,
  initChatHistory,
  initChatHistoryItem,
  setShowDialog,
} = slice.actions;

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

export const sendMessage =
  (msg, callback, retry = 0) =>
  async (dispatch) => {
    try {
      if (chatService.isActive) {
        await chatService?.sendMessage(msg);
      }
      if (callback) {
        callback();
      }
    } catch (error) {
      if ((error.code === 429 || error.code === 50063) && retry <= 2) {
        setTimeout(() => dispatch(sendMessage(msg, callback, retry + 1)), 1000);
      } else {
        dispatch(handleError(error));
      }
    }
  };

export default slice.reducer;
