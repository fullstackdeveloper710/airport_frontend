import { createSlice } from '@reduxjs/toolkit';
import { setMessage } from './message';
import VRService from 'services/vrService';
const vrService = new VRService();
export const initialState = {
  loading: false,
  vrResources: [],
  vrResourceId: 0,
  vrSubsessionId: 0,
  vrFurtherSubsession: [],
  getVrSubSessionById: [],
  OTPVerificationCodeResponse: {},
};
export const slice = createSlice({
  name: 'vrResources',
  initialState,
  reducers: {
    setVrResourceId: (state, action) => {
      state.vrResourceId = action.payload;
    },
    getVrResources: (state, action) => {
      state.vrResources = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setVRSubsessionId: (state, action) => {
      state.vrSubsessionId = action.payload;
    },
    getVrSubSessionsById: (state, action) => {
      state.getVrSubSessionById = action.payload;
    },
    setEmptySubsession: (state, action) => {
      state.getVrSubSessionById = action.payload;
    },
    setVrEmptyFurtherSubsession: (state, action) => {
      state.vrFurtherSubsession = action.payload;
    },
    getVrFutherSubsession: (state, action) => {
      state.vrFurtherSubsession = action.payload;
    },
    getOTPVerificationCodeVRSubsessions: (state, action) => {
      state.OTPVerificationCodeResponse = action.payload;
    },
  },
});
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
export const {
  getVrResources,
  setLoading,
  getVrSubSessionsById,
  getVrFutherSubsession,
  setEmptySubsession,
  setVrEmptyFurtherSubsession,
  setVrResourceId,
  setVRSubsessionId,
  getOTPVerificationCodeVRSubsessions,
} = slice.actions;
export const getVrResourcesData = async (dispatch) => {
  dispatch(setLoading(true));
  try {
    let res = await vrService.getVrResources();
    dispatch(getVrResources(res));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(handleError(error, true));
    dispatch(setLoading(false));
  }
};

export const getVrSubSessionData = async (id, dispatch) => {
  dispatch(setLoading(true));
  try {
    let res = await vrService.getVrSubsessionById(id);
    dispatch(getVrSubSessionsById(res));
    dispatch(setLoading(false));
    return res;
  } catch (error) {
    dispatch(handleError(error, true));
    dispatch(setLoading(false));
  }
};

export const getVrFurtherSubsessionData = async (
  id,
  subSessionId,
  dispatch
) => {
  dispatch(setLoading(true));
  try {
    let res = await vrService.getVrFurtherSubSessionById(id, subSessionId);
    dispatch(getVrFutherSubsession(res));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(handleError(error, true));
    dispatch(setLoading(false));
  }
};

export const OTPVerificationVRSubsessionsById = async (
  subSessionId,
  mainSessionId,
  data,
  dispatch
) => {
  dispatch(setLoading(true));
  try {
    let res = await vrService.OTPVerificationVRSubsessions(subSessionId, mainSessionId, data);
    dispatch(getOTPVerificationCodeVRSubsessions(res));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(handleError(error, true));
    dispatch(setLoading(false));
  }
};
export default slice.reducer;
