import _ from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import config from '../../config';
import AuthService from 'services/authService';
import UserService from 'services/userService';
import StorageService from 'services/storageService';
import twilioSyncService from 'services/twilioSyncService';
import chatService from 'services/chatService';
import { initChannels, removeNotifications } from './channel';
import { setMessage } from './message';
import { getUsersList, getUserStatuses } from './usersList';
import { getGodUserList } from 'store/reducers/agora';
import { getMeetingPollList } from './meetingPoll';
import { getAudioChatPollList } from './audioChatPoll';
import { openPanel } from './panel';
import { getSmartScreenList } from './smartScreen';
import { getTeleportRequestPollList } from './teleportRequestPoll';
import { getPresenterListPoll } from './presenterPollList';
import { getScreenSharePollList } from './screenShare';
import { getFollowRequestPollList } from './followRequestPoll';
import { setStartTime } from 'store/reducers/game';
import webSocketClient from 'lib/webSocketClient';

export const initialState = {
  current: null,
  oldUser: null,
  loading: false,
  cmsToken: null,
  xpToken: null,
  eventID: null,
  oldEventID: null,
  status: null,
  loginMethod: '',
  keycloak: null,
  consentAcceptance: null,
  authenticated: false,
  loginFailedDialog: false,
  currentRoom: null,
  currentRoomType: null
};

export const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoginMethod: (state, action) => {
      state.loginMethod = action.payload;
    },
    setOldUserData: (state, action) => {
      state.oldUser = action.payload;
    },
    setUserData: (state, action) => {
      state.current = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    modifyUserData: (state, action) => {
      state.current = {
        ...state.current,
        ...action.payload,
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCMSToken: (state, action) => {
      state.cmsToken = action.payload;
    },
    setXpToken: (state, action) => {
      state.xpToken = action.payload;
    },
    setEventID: (state, action) => {
      state.eventID = action.payload;
    },
    setOldEventId: (state, action) => {
      state.oldEventID = action.payload;
    },
    setLoginFailedDialog: (state, action) => {
      state.loginFailedDialog = action.payload;
    },
    setCurrentRoomLevel: (state, action) => {
      state.currentRoom = action.payload;
    },
    setCurrentRoomType: (state, action) => {
      state.currentRoomType = action.payload;
    },
    setKeycloak: (state, action) => {
      state.keycloak = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.authenticated = action.payload;
    },
    setConsentAcceptance: (state, action) => {
      state.consentAcceptance = action.payload;
    }
  },
});
const { setEventID, setOldEventId } = slice.actions;
export const {
  setLoginMethod,
  setOldUserData,
  setUserData,
  setCMSToken,
  setXpToken,
  modifyUserData,
  setStatus,
  setLoginFailedDialog,
  setCurrentRoomLevel,
  setCurrentRoomType,
  setKeycloak,
  setAuthenticated,
  setConsentAcceptance
} = slice.actions;

const { setLoading } = slice.actions;
const authService = new AuthService();
const userService = new UserService();
const storageService = new StorageService();

const handleError =
  (error, showMsg = false) =>
  (dispatch) => {
    let message;
    try {
      message = error.response.data.error || error.response.data.message;
    } catch {
      message = error.message;
    }
    console.error(message);
    if (showMsg) {
      dispatch(setMessage({ message }));
    }
  };

export const setUserOfflineStatus = () => async (dispatch, getState) => {
  try {
    const { current } = getState().user;
    if (current) {
      const dataToSend = {
        uid: current.eventUserId,
        eventName: config.event.id,
        flag: false,
      };
      await userService.setUserOffline(dataToSend);
    }
  } catch (error) {
    console.log(error);
  }
};

const sanitizeResponse = (response) => {
  try{
    const sanitizedResponse = response.replace(/'/g, '"');
    return JSON.parse(sanitizedResponse);
  }catch(error){
    console.log("ERROR evaluating result", error)
    return null
  }
}

export const initUserFromToken = (tokenInfo) => async (dispatch) => {
  const { 
    userID, 
    xpUserId, 
    xpMainExperienceId, 
    xpEmail,
    token,
    loginMethod
  } = tokenInfo;

  try {
    // Remove this after game integration
    dispatch(setOldEventId(config.event.id))
    const res = await userService.getUserData(config.event.id, userID);
    dispatch(
      setOldUserData({
        roles: res.roles,
        eventUserId: res.id,
        userFieldVisibility: res.userFieldVisibility || {},
        ...res.user,
      })
    )
    dispatch(setCMSToken(token));

    //New XP Manager Code
    dispatch(setLoginMethod(loginMethod));
    dispatch(setEventID(config.experience.subExperienceId));
    const xpRes = await userService.getXpManagerUserData({
      "userId": xpUserId,
      "experienceId": xpMainExperienceId,
      "email": xpEmail
    })
    if(xpRes?.user && xpRes?.user?.id && xpRes?.eventSpecific && xpRes?.eventSpecific?.HR_Details){
      const consentStatus = await userService.getXpUserConsentValues(xpRes.user.id)
      const gender = xpRes.eventSpecific.HR_Details.gender === "M" ? "male" : "female"
      dispatch(
        setUserData({
          email : xpEmail || 'unknown',
          id: (xpRes.user.id).toString(),
          eventUserId: xpRes.user.id,
          title: xpRes.eventSpecific.HR_Details.jobTitle,
          organization: xpRes.eventSpecific.HR_Details.brand,
          persona: xpRes.eventSpecific.HR_Details.persona,
          firstName: xpRes.user.firstName,
          lastName: xpRes.user.lastName,
          roles: sanitizeResponse(xpRes.user.userRoles) || ['ROLE_ATTENDEE'],
          userFieldVisibility: sanitizeResponse(xpRes.user.userFieldVisibility) || {},
          consentStatus,
          gender
        })
      )
    }else{
      throw new Error("User could not be loaded due to missing information")
    }
  } catch (error) {
    if (
      error.response &&
      error.response.status === 403 &&
      storageService.getToken()
    ) {
      dispatch(setLoginFailedDialog(true));
      dispatch(setUserData(null));
      dispatch(setOldUserData(null))
      storageService.clearToken();
      dispatch(openPanel(false));
      removeNotifications();
    } else if (error.response && error.response.status === 403) {
      dispatch(setUserData({ registered: false }));
      dispatch(setOldUserData({ registered: false }))
    } else {
      dispatch(handleError(error));
      dispatch(setUserData(null));
      dispatch(setOldUserData(null))
      storageService.clearToken();
      dispatch(openPanel(false));
      removeNotifications();
    }
  }
  dispatch(setLoading(false));
};

export const initChatServices = () => async (dispatch, getState) => {
  const userId = getState().user.current.eventUserId;
  chatService.setDispatch(dispatch);
  const twilioTokenResult = await chatService.getToken(userId, 86400);
  dispatch(initChannels(twilioTokenResult));
  dispatch(getUsersList());
  twilioSyncService.setDispatch(dispatch);
  await twilioSyncService.setupSyncFromLocal(true, userId);
  dispatch(startTwilioDependedService());
};

export const startTwilioDependedService = () => (dispatch, getState) => {
  const eventId = getState().user.eventID;
  const oldEventId = getState().user.oldEventID;
  try {
    dispatch(getUserStatuses(eventId));
    dispatch(getGodUserList(eventId));
    dispatch(getMeetingPollList(eventId));
    dispatch(getAudioChatPollList(eventId));
    dispatch(getSmartScreenList(oldEventId));
    dispatch(getTeleportRequestPollList(eventId));
    dispatch(getPresenterListPoll(eventId));
    dispatch(getScreenSharePollList(eventId));
    dispatch(getFollowRequestPollList(eventId));
  } catch (e) {
    console.log(e);
  }
};

export const login = (payload, xpPayload) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setLoginMethod('Email'));
  try {
    const tokenInfo = await authService.login(payload);
    storageService.setToken({ ...tokenInfo, loginMethod: 'Email' });
    dispatch(initUserFromToken({ ...tokenInfo, ...xpPayload }));
  } catch (error) {
    dispatch(handleError(error, true));
    dispatch(setLoading(false));
  }
};

export const xpManagerLogin = (payload, xpPayload) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setLoginMethod('Guest'));
  try {
    const tokenInfo = await authService.fakeLogin(payload);
    storageService.setToken({ ...tokenInfo, loginMethod: 'Guest' });
    dispatch(initUserFromToken({ ...tokenInfo, ...xpPayload }));
  } catch (error) {
    dispatch(handleError(error, true));
    dispatch(setLoading(false));
  }
};

// export const updateEventUser = (eventID, id, payload) => async (dispatch) => {
//   dispatch(setLoading(true));
//   try {
//     await userService.updateEventUser(eventID, id, payload);
//     dispatch(modifyUserData(payload));
//   } catch (err) {
//     dispatch(handleError(err));
//   }
//   dispatch(setLoading(false));
// };

export const logout = (callback) => async (dispatch) => {
  dispatch(setStartTime(null));
  if (window.gameClient) {
    window.gameClient.endGame();
    delete window.gameClient;
  }
  storageService.clearToken();
  dispatch(setUserData(null));
  dispatch(setOldUserData(null))
  dispatch(openPanel(false));
  if (webSocketClient) {
    webSocketClient.close();
  }
  callback && callback();
};

export default slice.reducer;
