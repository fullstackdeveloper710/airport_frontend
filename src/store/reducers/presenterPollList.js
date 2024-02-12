import { createSlice } from '@reduxjs/toolkit';
import twilioSyncService from 'services/twilioSyncService';

const initialState = {
  participants: [],
};

const SERVICE_NAME = 'presentersListPollList';
const name = 'presenterPollList';

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActive: (state, action) => {
      state.active = action.payload;
    },
  },
});

const { setLoading } = slice.actions;

const addPresenter = async (payload) => {
  const { uuid, channel } = payload;
  const list = await getPresenterList();
  const isPresenterAlreadyAvaliable = list?.some(({ data }) => {
    return data.value.uuid === uuid;
  });
  if (!isPresenterAlreadyAvaliable && twilioSyncService.isActive) {
    await twilioSyncService[SERVICE_NAME].push({
      uuid,
      channelId: channel,
    });
  }
};

const removePresenter = async (payload) => {
  const { uuid } = payload;
  const list = await getPresenterList();
  const presenter = list?.find(({ data }) => {
    return data.value.uuid === uuid;
  });
  try {
    if (presenter && twilioSyncService.isActive) {
      await removeIndex(presenter.data.index);
    }
  } catch (error) {
    console.log(error);
  }
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

export const addOrRemovePresenter = (flag,channelInfo) => (dispatch, getState) => {

  const currentUser = getState().user.current;

  if (flag) {
    addPresenter({ uuid: currentUser.eventUserId,channel: channelInfo.channel, });
  } else {
    removePresenter({ uuid: currentUser.eventUserId, channel: channelInfo.channel, });
  }

};


const getPresenterList = async () => {
  let polls = [];
  if(twilioSyncService.isActive && twilioSyncService[SERVICE_NAME]){
    let pages = await twilioSyncService[SERVICE_NAME].getItems();
    polls = polls.concat(pages.items);
    while (pages.hasNextPage) {
      pages = await pages.nextPage();
      polls = polls.concat(pages.items);
    }
  }
  return polls;
};

const removeIndex = async (index) => {
  try {
    const list = await getPresenterList();
    const isIndexAvailable = list?.some((v) => {
      return v.data.index === index;
    });
    if (isIndexAvailable && twilioSyncService.isActive) {
      await twilioSyncService[SERVICE_NAME].remove(index);
    }
  } catch (error) {
    console.log(error);
  }
};


export const getPresenterListPoll = (eventID) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    if(twilioSyncService.isActive){
      await twilioSyncService.setPresentersListPollList(eventID);
      const list = await getPresenterList();
      const currentUser = getState().user.current;
      for (const item of list) {
        if (item.value?.uuid === currentUser.eventUserId) {
          await removeIndex(item.index);
        }
      }
    }
    setInterval(async () => {
      if (window.agoraClientPrimary) {
        const list = await getPresenterList();
        if(list){
          const presenters = list.filter(
            ({ data }) => window?.agoraClientPrimary.channel === data.value.channelId
          )
          .map(({ data }) => data.value.uuid)
          .filter((v) => !!v);
          if(window.agoraClientPrimary) window.agoraClientPrimary.createVideoFeed(presenters);
        }
      }
    }, 3000);
  } catch (error) {
    dispatch(handleError(error));
  }
};

export default slice.reducer;
