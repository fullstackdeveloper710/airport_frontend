import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment-timezone';

import config from 'config';
import agendaService from 'services/agendaService';

const initialState = {
  agendaCurrent: null,
  agendaRole: null,
  list: [],
  loading: false,
};

export const slice = createSlice({
  name: 'agenda',
  initialState,
  reducers: {
    setCurrent: (state, action) => {
      state.agendaCurrent = action.payload;
    },
    setAgendaRole: (state, action) => {
      state.agendaRole = action.payload;
    },
    setList: (state, action) => {
      state.list = action.payload;
    },
    addListItem: (state, action) => {
      state.list.push(action.payload);
    },
    updateListItem: (state, action) => {
      let list = [...state.list];
      let foundIndex = list.findIndex((item) => item.id === action.payload.id);
      if (foundIndex !== -1) {
        list[foundIndex] = action.payload;
        state.list = list;
      }
    },
    deleteListItem: (state, action) => {
      let list = [...state.list];
      let foundIndex = list.findIndex((item) => item.id === action.payload);
      if (foundIndex !== -1) {
        list.splice(foundIndex, 1);
        state.list = list;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setList, updateListItem, setAgendaRole, setCurrent } = slice.actions;
const { setLoading, addListItem, deleteListItem } = slice.actions;

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

export const getEventAgendaList = (eventID) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    let events = await agendaService.getAgendaList(eventID);

    events = events.sort((a, b) => {
      return moment
        .tz(a.endTime, config.timezone)
        .diff(moment.tz(b.endTime, config.timezone));
    });

    events = events.filter((item) => {
      let endTime = moment.tz(item.endTime, config.timezone);
      let now = moment.tz(config.timezone);
      return endTime.isAfter(now);
    });

    dispatch(setList(events));
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const getXPEventList = (payload) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    let events = []
    let externalAgenda = []
    let localAgenda = []
    const eventsRes = await agendaService.getAgendaXPList(payload);
    if(
      Array.isArray(eventsRes?.ExternalAgendas?.Facilitator) && 
      Array.isArray(eventsRes?.ExternalAgendas?.Trainee)
    ){
      externalAgenda = [
        ...eventsRes?.ExternalAgendas?.Facilitator,
        ...eventsRes?.ExternalAgendas?.Trainee
      ]
    }
    if(
      Array.isArray(eventsRes?.locaAgendaData?.Facilitator) &&
      Array.isArray(eventsRes?.locaAgendaData?.Trainee)
      ){
        localAgenda = [
        ...eventsRes?.locaAgendaData?.Facilitator,
        ...eventsRes?.locaAgendaData?.Trainee
        ]
    }
    events = [...externalAgenda, ...localAgenda]
    events = events.sort((a, b) => {
      return moment
        .tz(a.endTime, config.timezone)
        .diff(moment.tz(b.endTime, config.timezone));
    });

    dispatch(setList(events));
  }catch (error){
    console.log("ERROR GETTING AGENDA LIST", error)
  }
}

export const createAgenda =
  (eventID, payload) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      let result = await agendaService.createAgenda(eventID, payload);
      const currentUser = getState().user.current;
      if (result.id) {
        dispatch(
          addListItem({
            ...payload,
            id: result.id,
            createdBy: {
              id: currentUser.id,
            },
          })
        );
      }
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export const updateAgenda =
  (eventID, agendaID, payload) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let result = await agendaService.updateAgenda(eventID, agendaID, payload);
      if (result.id) {
        dispatch(
          updateListItem({
            ...payload,
            id: result.id,
          })
        );
      }
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export const deleteAgenda = (eventID, agendaID) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    let result = await agendaService.deleteAgenda(eventID, agendaID);
    if (result.success) {
      dispatch(deleteListItem(agendaID));
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const acceptAgendaInvitation =
  (eventID, agenda, currentUser) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await agendaService.acceptInvite(eventID, agenda.id);
      let attendees = agenda.attendees.map((item) =>
        item.user === currentUser.id
          ? {
              ...item,
              status: 'accepted',
            }
          : item
      );
      dispatch(
        updateListItem({
          ...agenda,
          attendees: attendees,
        })
      );
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export const declineAgendaInvitation =
  (eventID, agenda, currentUser) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await agendaService.declineInvite(eventID, agenda.id);
      await agendaService.uninviteUsers(eventID, agenda.id, [currentUser.id]);
      let attendees = agenda.attendees.filter(
        (item) => item.user !== currentUser.id
      );

      dispatch(
        updateListItem({
          ...agenda,
          attendees: attendees,
        })
      );
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export const addAttendee =
  (eventID, agenda, currentUser) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await agendaService.inviteUsers(eventID, agenda.id, [currentUser.id]);
      await agendaService.acceptInvite(eventID, agenda.id);
      dispatch(
        updateListItem({
          ...agenda,
          attendees: [
            ...agenda.attendees,
            {
              user: currentUser.id,
              status: 'accepted',
            },
          ],
        })
      );
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export default slice.reducer;
