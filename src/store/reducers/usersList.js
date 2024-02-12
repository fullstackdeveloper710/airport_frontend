import { createSlice } from '@reduxjs/toolkit';
import twilioSyncService from 'services/twilioSyncService';
import UserService from 'services/userService';

const userService = new UserService();

const initialState = {
  list: [],
  statuses: {},
  loading: false,
  userListLoading: false,
  userDataLoading: false,
  onlineUsers: [],
};

export const slice = createSlice({
  name: 'usersList',
  initialState,
  reducers: {
    setUsersList: (state, action) => {
      state.list = [...action.payload];
    },
    setStatuses: (state, action) => {
      state.statuses = { ...action.payload };
    },
    setBold: (state, action) => {
      let list = [...state.list];
      let user = list.find((item) => item.email === action.payload.email);
      if (user) {
        user.isBold = action.payload.isBold;
      }
      state.list = [...list];
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = [...action.payload];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserListLoading: (state, action) => {
      state.userListLoading = action.payload;
    }
  },
});
export const {
  setUsersList,
  setOnlineUsers,
  setStatuses,
  setBold
} = slice.actions;
const { setLoading, setUserListLoading } =
  slice.actions;

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

export const getUsersList = () => async (dispatch, getState) => {
  dispatch(setUserListLoading(true));
  dispatch(setLoading(true));
  try {
    if (
      getState().usersList.list.length !== 0
    ) {
      dispatch(setUserListLoading(false));
    } else {
      let xpRes = await userService.getXpUsers("11")
      let hrRes = await userService.getHrUsers()
      let xpUsers = []
      if(Array.isArray(hrRes) && Array.isArray(xpRes)){
        for (const user of xpRes){
          const eventUserId = (user.id).toString()
          const id = (user.id).toString()
          const email = user.email || "hidden"
          const firstName = user.firstName || "hidden"
          const lastName = user.lastName || "hidden"
          const roles = (user.roles && Array.isArray(user.roles)) || ["ROLE_ATTENDEE"]
          const externalUserId = user.externalUserId
          if(externalUserId){
            const hrInfo = hrRes.find(hrUser => hrUser.staffId === externalUserId);
            if(hrInfo){
              const title = hrInfo.jobTitle || "hidden"
              const organization = hrInfo.brand || "hidden"
              let initialsColor = getRandomInt(0, 24);
              if (initialsColor === 4 || initialsColor === 5 || initialsColor === 6)
                initialsColor += 3;
              xpUsers.push({
                eventUserId,
                id,
                email,
                firstName,
                lastName,
                roles,
                title,
                organization,
                initialsColor
              })
            }
          }
        }
      }else{
        throw new Error("Remote users could not be loaded into environment")
      }

      dispatch(setUsersList(xpUsers));
      dispatch(setUserListLoading(false));
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const getUserStatuses = (eventID) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if (twilioSyncService.isActive) {
      await twilioSyncService.setUserStatusDoc(eventID);

      if (!twilioSyncService.userStatusDoc) return null;
        twilioSyncService.userStatusDoc.on('updated', function (data) {
        dispatch(setStatuses(data.value));
      });

      dispatch(setStatuses(twilioSyncService.userStatusDoc.value));
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const setUserStatus = (userID, status) => (dispatch) => {
  try {
    if (twilioSyncService.isActive) {
      twilioSyncService.userStatusDoc.update({ [userID]: status });
    }
  } catch (error) {
    dispatch(handleError(error));
  }
};

export default slice.reducer;
