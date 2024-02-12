import { createSlice } from '@reduxjs/toolkit';

import twilioSyncService from 'services/twilioSyncService';
import { setMessage } from './message';
import i18next from 'i18next';

const initialState = {
  list: [],
  loading: false,
};

const SERVICE_NAME = 'meetingPollList';

export const slice = createSlice({
  name: 'meetingPoll',
  initialState,
  reducers: {
    setList: (state, action) => {
      state.list = action.payload;
    },
    addToList: (state, action) => {
      if (
        !state.list.find((item) => item.pollIndex === action.payload.pollIndex)
      ) {
        state.list = [...state.list, action.payload];
      }
    },
    removeFromList: (state, action) => {
      state.list = state.list.filter(
        (item) => item.pollIndex !== action.payload
      );
    },
    dismissMeetingPoll: (state, action) => {
      state.list = state.list.map((item) =>
        item.pollIndex === action.payload ? { ...item, dismissed: true } : item
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setList, dismissMeetingPoll } = slice.actions;
const { setLoading, addToList, removeFromList } = slice.actions;

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

const getAllList = async () => {
  let meetingPolls = [];
  if (twilioSyncService.isActive) {
    let pages = await twilioSyncService[SERVICE_NAME].getItems();
    meetingPolls = meetingPolls.concat(pages.items);
    while (pages.hasNextPage) {
      pages = await pages.nextPage();
      meetingPolls = meetingPolls.concat(pages.items);
    }
  }
  return meetingPolls;
};

export const getMeetingPollList = (eventID) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    if (twilioSyncService.isActive) {
      await twilioSyncService.setMeetingPollList(eventID);

      const currentUser = getState().user.current;

      if (!twilioSyncService[SERVICE_NAME] || !currentUser) return;

      twilioSyncService[SERVICE_NAME].on('itemUpdated', async (data) => {
        const senderInvite = data.item.data.value.invites.filter(
          (item) => item.sender === currentUser.id && item.decline
        );
        if (senderInvite.length > 0) {
          senderInvite.forEach((declineInvite) => {
            const usersList = getState().usersList;
            const inviteUserData = usersList.list.find(
              (user) => user.id === declineInvite?.recipient
            );
            dispatch(
              setMessage({
                message: i18next.t(
                  'genericMessages.userDeclinedInvitationMessage',
                  {
                    userName: `${inviteUserData.firstName} ${inviteUserData.lastName} `,
                  }
                ),
                //`${inviteUserData.firstName} ${inviteUserData.lastName} has declined your invitation!`,
                type: 'success',
                timeout: 5000,
              })
            );

            if (data.item.data.value.invites.length > 0) {
              if (twilioSyncService.isActive) {
                twilioSyncService[SERVICE_NAME].mutate(
                  data.item.data.index,
                  function (remoteData) {
                    const declineIndex = remoteData.invites.findIndex(
                      (inviteData) =>
                        inviteData?.recipient === declineInvite?.recipient
                    );
                    if (declineIndex > -1) {
                      remoteData.invites = remoteData.invites.filter(
                        (inviteData) => !inviteData.decline
                      );
                    }
                    return remoteData;
                  }
                );
              }
            }
          });
        }

        if (currentUser) {
          const invite = data.item.data.value.invites.find(
            (item) => item?.recipient === currentUser.id
          );
          if (invite) {
            dispatch(
              addToList({
                pollIndex: data.item.data.index,
                meetingRoomName: data.item.data.value.meetingRoomName,
                organizer: data.item.data.value.organizer,
                sender: invite.sender,
                dismissed: false,
              })
            );
          } else {
            dispatch(removeFromList(data.item.data.index));
          }
        } else {
          dispatch(removeFromList(data.item.data.index));
        }
      });

      let meetingPolls = await getAllList();
      dispatch(
        setList(
          meetingPolls
            .filter(
              (item) =>
                item.data.value.invites &&
                item.data.value.invites
                  .map((item) => item?.recipient)
                  .indexOf(currentUser.id) !== -1
            )
            .map((item) => ({
              pollIndex: item.data.index,
              meetingRoomName: item.data.value.meetingRoomName,
              organizer: item.data.value.organizer,
              sender: item.data.value.invites.find(
                (item) => item?.recipient === currentUser.id
              ).sender,
              dismissed: true,
            }))
        )
      );
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const answerMeetingPoll = (pollIndex, userID) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if (twilioSyncService.isActive) {
      twilioSyncService[SERVICE_NAME].mutate(pollIndex, function (remoteData) {
        remoteData.invites = remoteData.invites.map((v) => {
          if (v?.recipient === userID) {
            return { ...v, decline: true };
          } else {
            return { ...v };
          }
        });
        return remoteData;
      });
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const publishMeetingPoll =
  (payload, showMessage = true) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let meetingPolls = await getAllList();
      const meetingPoll = meetingPolls.find(
        (item) => item.data.value.meetingRoomName === payload.meetingRoomName
      );

      if (meetingPoll) {
        if (twilioSyncService.isActive) {
          await twilioSyncService[SERVICE_NAME].mutate(
            meetingPoll.data.index,
            function (remoteData) {
              for (const invite of payload.invites) {
                if (
                  remoteData.invites.find(
                    (item) => item?.recipient === invite?.recipient
                  )
                ) {
                  remoteData.invites = remoteData.invites.map((item) =>
                    item?.recipient === invite?.recipient ? invite : item
                  );
                } else {
                  remoteData.invites.push(invite);
                }
              }
              return remoteData;
            }
          );
        }
      } else {
        if (twilioSyncService.isActive && !!payload?.invites?.length) {
          await twilioSyncService[SERVICE_NAME].push(payload);
          dispatch(publishMeetingPoll(payload));
          return;
        }
      }
      if (showMessage) {
        dispatch(
          setMessage({
            message: i18next.t(
              'genericMessages.meetingInvitationsSentSuccessfullyMessage'
            ), // 'Meeting invitations are sent successfully!',
            type: 'success',
          })
        );
      }
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

const removeIndex = async (index) => {
  try {
    const list = await getAllList();
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

export const cancelMeetingPoll =
  (meetingRoomName, userID) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      let meetingPolls = await getAllList();

      const meetingPoll = meetingPolls.find(
        (item) => item.data.value.meetingRoomName === meetingRoomName
      );

      if (meetingPoll) {
        if (twilioSyncService.isActive) {
          await twilioSyncService[SERVICE_NAME].mutate(
            meetingPoll.data.index,
            function (remoteData) {
              remoteData.invites = remoteData.invites.filter(
                (item) => item?.recipient !== userID && item.sender !== userID
              );
              return remoteData;
            }
          );
          // If this is the last participant of the meeting
          const meetingPollData = await twilioSyncService[SERVICE_NAME].get(
            meetingPoll.data.index
          );
          if (
            meetingPollData &&
            meetingPollData.data.value.invites.length === 0
          ) {
            await removeIndex(meetingPoll.data.index);
          }
        }
      }
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export default slice.reducer;
