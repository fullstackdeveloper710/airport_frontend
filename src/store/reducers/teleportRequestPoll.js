import { createSlice } from '@reduxjs/toolkit';
import { setMessage } from './message';
import twilioSyncService from 'services/twilioSyncService';
import { teleportToUser } from 'utils/common';
import i18next from 'i18next';

const initialState = {
  invites: [],
  recipient: null,
  currentIndex: null,
  loading: false,
  is_in_stage: false,
};

const SERVICE_NAME = 'teleportRequestPollList';

export const slice = createSlice({
  name: 'teleportRequestPoll',
  initialState,
  reducers: {
    setInvites: (state, action) => {
      state.invites = action.payload;
    },
    addInvite: (state, action) => {
      if (
        !state.invites.find(
          (item) => item.pollIndex === action.payload.pollIndex
        )
      ) {
        state.invites = [...state.invites, action.payload];
      }
    },
    updateInvite: (state, action) => {
      state.invites = [...action.payload];
    },
    removeInvite: (state, action) => {
      state.invites = state.invites.filter(
        (item) => item.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setIsInStage: (state, action) => {
      state.is_in_stage = action.payload;
    },
  },
});

export const {
  setLoading,
  setInvites,
  updateInvite,
  addInvite,
  removeInvite,
  setIsInStage,
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

const remoteUserAccept = async ({
  invite,
  currentUser,
  dispatch,
  getState,
}) => {
  const currentInvites = getState().teleportRequestPoll.invites;
  const currentUserId = getState().user.eventID;

  if (invite.sender === currentUser.eventUserId) {
    try {
      if (invite.is_request === false) {
        teleportToUser(currentUserId, invite.userID, (e) => {
          console.log(e, 'teleportToUserError');
        });
      }

      dispatch(
        updateInvite(
          currentInvites.map((v) => {
            if (v.id === invite.id) {
              return { ...v, accept: true };
            }
            return v;
          })
        )
      );
      await removeIndex(invite.pollIndex);
    } catch (e) {
      console.log(e, 'eeeee');
      handleError(e);
    }
  }
};

const remoteUserDecline = async ({
  invite,
  currentUser,
  getState,
  dispatch,
}) => {
  const currentInvites = getState().teleportRequestPoll.invites;
  if (invite.sender === currentUser.eventUserId) {
    dispatch(
      updateInvite(
        currentInvites.map((v) => {
          if (v.id === invite.id) {
            return { ...v, declined: true };
          }
          return v;
        })
      )
    );
    await removeIndex(invite.pollIndex);
  }
};

const remoteUserCancelled = async ({ invite, dispatch }) => {
  dispatch(removeInvite(invite.id));
  await removeIndex(invite.pollIndex);
};

const remoteUserInStageInvitation = async ({
  invite,
  currentUser,
  getState,
  dispatch,
}) => {
  const currentInvites = getState().teleportRequestPoll.invites;
  if (invite.sender === currentUser.eventUserId) {
    dispatch(
      updateInvite(
        currentInvites.map((v) => {
          if (v.id === invite.id) {
            return { ...v, is_in_stage: true };
          }
          return v;
        })
      )
    );
    await removeIndex(invite.pollIndex);
  }
};

const remoteMeetingRoomInvitation = async ({
  invite,
  currentUser,
  getState,
  dispatch,
}) => {
  const currentInvites = getState().teleportRequestPoll.invites;

  if (invite.sender === currentUser.eventUserId) {
    dispatch(
      updateInvite(
        currentInvites.map((v) => {
          if (v.id === invite.id) {
            return { ...v, is_in_meeting_room: true };
          }
          return v;
        })
      )
    );
    await removeIndex(invite.pollIndex);
  }
};

const remoteMeetingInvitation = async ({
  invite,
  currentUser,
  getState,
  dispatch,
}) => {
  const currentInvites = getState().teleportRequestPoll.invites;

  if (invite.sender === currentUser.eventUserId) {
    dispatch(
      updateInvite(
        currentInvites.map((v) => {
          if (v.id === invite.id) {
            return { ...v, is_in_meeting: true };
          }
          return v;
        })
      )
    );
    await removeIndex(invite.pollIndex);
  }
};

const remotePrivateInvitation = async ({
  invite,
  currentUser,
  getState,
  dispatch,
}) => {
  const currentInvites = getState().teleportRequestPoll.invites;
  if (invite.sender === currentUser.eventUserId) {
    const result = currentInvites.map((v) => {
      if (v.id === invite.id) {
        return { ...v, is_in_private: true };
      }
      return v;
    });
    dispatch(updateInvite(result));
    await removeIndex(invite.pollIndex);
  }
};

const meetingRoomInvitation = async ({ invite }) => {
  if (twilioSyncService.isActive) {
    twilioSyncService[SERVICE_NAME].mutate(
      invite.pollIndex,
      function (remoteData) {
        remoteData.invites = remoteData.invites.map((v) => {
          if (invite.id === v.id) {
            return { ...v, is_in_meeting_room: true };
          }
          return v;
        });
        return remoteData;
      }
    );
  }
};

const meetingInvitation = async ({ invite }) => {
  if (twilioSyncService.isActive) {
    twilioSyncService[SERVICE_NAME].mutate(
      invite.pollIndex,
      function (remoteData) {
        remoteData.invites = remoteData.invites.map((v) => {
          if (invite.id === v.id) {
            return { ...v, is_in_meeting: true };
          }
          return v;
        });
        return remoteData;
      }
    );
  }
};

const privateInvitation = async ({ invite }) => {
  if (twilioSyncService.isActive) {
    twilioSyncService[SERVICE_NAME].mutate(
      invite.pollIndex,
      function (remoteData) {
        remoteData.invites = remoteData.invites.map((v) => {
          if (invite.id === v.id) {
            return { ...v, is_in_private: true };
          }
          return v;
        });
        return remoteData;
      }
    );
  }
};

const stageInvitation = async ({ invite }) => {
  if (twilioSyncService.isActive) {
    twilioSyncService[SERVICE_NAME].mutate(
      invite.pollIndex,
      function (remoteData) {
        remoteData.invites = remoteData.invites.map((v) => {
          if (invite.id === v.id) {
            return { ...v, is_in_stage: true };
          }
          return v;
        });
        return remoteData;
      }
    );
  }
};

const expireInvitation = async ({
  invite,
  currentUser,
  getState,
  dispatch,
}) => {
  const currentInvites = getState().teleportRequestPoll.invites;
  if (invite.sender === currentUser.eventUserId) {
    dispatch(
      updateInvite(
        currentInvites.map((v) => {
          if (v.id === invite.id) {
            return { ...v, expire: true };
          }
          return v;
        })
      )
    );
    await removeIndex(invite.pollIndex);
  }
  if (invite.recipient === currentUser.eventUserId) {
    dispatch(removeInvite(invite.id));
    await removeIndex(invite.pollIndex);
  }
};

const removeIndex = async (index) => {
  try {
    const list = await getTeleportRequestPoll();
    const isIndexAvailable = list?.some((v) => {
      return v?.data?.index === index;
    });
    if (isIndexAvailable && twilioSyncService.isActive) {
      await twilioSyncService[SERVICE_NAME].remove(index);
    }
  } catch (error) {
    console.log(error);
  }
};

const checkInMeetingRoom = ({
  invite,
  currentUser,
  dispatch,
  getState,
  itemData,
}) => {
  let flag = false;
  if (window.gameClient && !invite.is_in_meeting_room) {
    const gameCurrentRoomName = window.gameClient.getCurrentRoomType();
    if (
      (gameCurrentRoomName.includes('meeting') ||
        gameCurrentRoomName.includes('Meeting')) &&
      currentUser.eventUserId === invite.recipient
    ) {
      meetingRoomInvitation({
        invite: { ...invite, pollIndex: itemData.index },
        currentUser,
        dispatch,
        getState,
      });
      flag = true;
    }
  }
  if (
    invite.is_in_meeting_room &&
    invite.recipient === currentUser.eventUserId
  ) {
    flag = true;
  }
  return flag;
};

const checkInPrivateRoom = ({
  invite,
  currentUser,
  dispatch,
  getState,
  itemData,
}) => {
  let flag = false;
  if (window.gameClient && !invite.is_in_private) {
    const gameCurrentRoomName = window.gameClient.getCurrentRoomType();
    if (
      (gameCurrentRoomName.includes('none') ||
        gameCurrentRoomName.includes('None')) &&
      currentUser.eventUserId === invite.recipient
    ) {
      privateInvitation({
        invite: { ...invite, pollIndex: itemData.index },
        currentUser,
        dispatch,
        getState,
      });
      flag = true;
    }
  }
  if (invite.is_in_private && invite.recipient === currentUser.eventUserId) {
    flag = true;
  }
  return flag;
};

const checkInStage = ({
  invite,
  currentUser,
  dispatch,
  getState,
  itemData,
}) => {
  let flag = false;
  const is_in_stage = getState().teleportRequestPoll.is_in_stage;
  if (is_in_stage && currentUser.eventUserId === invite.recipient) {
    stageInvitation({
      invite: { ...invite, pollIndex: itemData.index },
      currentUser,
      dispatch,
      getState,
    });
    flag = true;
  }
  if (invite.is_in_stage && invite.recipient === currentUser.eventUserId) {
    flag = true;
  }
  return flag;
};

const checkInMeeting = ({
  invite,
  currentUser,
  dispatch,
  getState,
  itemData,
}) => {
  let flag = false;
  9;
  if (
    window.agoraClientPrimary &&
    window.agoraClientPrimary.meetingWindowActive &&
    currentUser.eventUserId === invite.recipient
  ) {
    meetingInvitation({
      invite: { ...invite, pollIndex: itemData.index },
      currentUser,
      dispatch,
      getState,
    });
    flag = true;
  }
  if (invite.is_in_meeting && invite.recipient === currentUser.eventUserId) {
    flag = true;
  }
  return flag;
};

const isRequestFailed = (request) => {
  return (
    request.expire ||
    request.declined ||
    request.is_in_meeting_room ||
    request.is_in_meeting ||
    request.is_in_private ||
    request.is_in_stage
  );
};

const handleSyncUpdated = async (getState, dispatch, data) => {
  const currentUser = getState().user.current;
  const usersList = getState().usersList;
  let itemData = data.item.data;

  if (currentUser) {
    const invites = itemData.value.invites;

    if (invites) {
      invites.forEach((invite) => {
        if (
          (invite.recipient === currentUser.eventUserId ||
            invite.sender === currentUser.eventUserId) &&
          !(invite.accept || invite.cancel || isRequestFailed(invite))
        ) {
          const room_flag = checkInMeetingRoom({
            invite,
            currentUser,
            dispatch,
            getState,
            itemData,
          });
          if (room_flag) return;

          const stage_flag = checkInStage({
            invite,
            currentUser,
            dispatch,
            getState,
            itemData,
          });

          if (stage_flag) return;

          const meeting_flag = checkInMeeting({
            invite,
            currentUser,
            dispatch,
            getState,
            itemData,
          });
          if (meeting_flag) return;

          const private_flag = checkInPrivateRoom({
            invite,
            currentUser,
            dispatch,
            getState,
            itemData,
          });
          if (private_flag) return;

          dispatch(
            addInvite({
              pollIndex: itemData.index,
              ...invite,
            })
          );
          const inviter = usersList.list.find(
            (item) => item.eventUserId === invite.sender
          );
          const invitee = usersList.list.find(
            (item) => item.eventUserId === invite.recipient
          );
          window?.gameClient?.logUserAction?.({
            eventName: 'TELEPORT_REQUEST',
            eventSpecificData: JSON.stringify({
              inviter: inviter.eventUserId,
              invitee: invitee.eventUserId,
            }),
            beforeState: null,
            afterState: null,
          });
        }
      });
      const acceptedInvite = invites.find((v) => !!v.accept);
      const rejectedInvite = invites.find((v) => !!v.declined);
      const cancelledInvite = invites.find((v) => !!v.cancel);
      const expiredInvite = invites.find((v) => !!v.expire);
      const meetingRoomInvite = invites.find((v) => !!v.is_in_meeting_room);
      const meetingInvite = invites.find((v) => !!v.is_in_meeting);
      const privateInvite = invites.find((v) => !!v.is_in_private);
      const stageInvite = invites.find((v) => !!v.is_in_stage);

      if (acceptedInvite) {
        return remoteUserAccept({
          invite: { ...acceptedInvite, pollIndex: itemData.index },
          currentUser,
          dispatch,
          getState,
        });
      }

      if (rejectedInvite) {
        return remoteUserDecline({
          invite: { ...rejectedInvite, pollIndex: itemData.index },
          currentUser,
          getState,
          dispatch,
        });
      }
      if (cancelledInvite) {
        return remoteUserCancelled({
          invite: { ...cancelledInvite, pollIndex: itemData.index },
          currentUser,
          getState,
          dispatch,
        });
      }
      if (expiredInvite) {
        return expireInvitation({
          invite: { ...expiredInvite, pollIndex: itemData.index },
          currentUser,
          getState,
          dispatch,
        });
      }
      if (meetingRoomInvite) {
        return remoteMeetingRoomInvitation({
          invite: { ...meetingRoomInvite, pollIndex: itemData.index },
          currentUser,
          getState,
          dispatch,
        });
      }
      if (meetingInvite) {
        return remoteMeetingInvitation({
          invite: { ...meetingInvite, pollIndex: itemData.index },
          currentUser,
          getState,
          dispatch,
        });
      }
      if (privateInvite) {
        return remotePrivateInvitation({
          invite: { ...privateInvite, pollIndex: itemData.index },
          currentUser,
          getState,
          dispatch,
        });
      }
      if (stageInvite) {
        return remoteUserInStageInvitation({
          invite: { ...stageInvite, pollIndex: itemData.index },
          currentUser,
          getState,
          dispatch,
        });
      }
    }
  }
};

const getTeleportRequestPoll = async () => {
  let telePortListPolls = [];
  if (twilioSyncService.isActive) {
    let pages = await twilioSyncService[SERVICE_NAME].getItems();
    telePortListPolls = telePortListPolls.concat(pages.items);
    while (pages.hasNextPage) {
      pages = await pages.nextPage();
      telePortListPolls = telePortListPolls.concat(pages.items);
    }
  }
  return telePortListPolls;
};

export const getTeleportRequestPollList =
  (eventID) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      if (twilioSyncService.isActive) {
        await twilioSyncService.setTeleportRequestPollList(eventID);

        if (!twilioSyncService[SERVICE_NAME]) return null;
        twilioSyncService[SERVICE_NAME].on('itemAdded', (data) =>
          handleSyncUpdated(getState, dispatch, data)
        );
        twilioSyncService[SERVICE_NAME].on('itemUpdated', (data) =>
          handleSyncUpdated(getState, dispatch, data)
        );
      }

      const telePortListPolls = await getTeleportRequestPoll();

      const currentUserId = getState().user.current?.eventUserId;

      if (currentUserId) {
        for (const telePortListPollItem of telePortListPolls) {
          const _invites = telePortListPollItem.data.value?.invites;
          if (!(_invites && _invites.find)) {
            continue;
          }
          const invite = telePortListPollItem.data.value.invites.find(
            (invite) =>
              invite.sender === currentUserId ||
              invite.recipient === currentUserId
          );
          if (invite) {
            if (isRequestFailed(invite)) {
              await removeIndex(invite.pollIndex);
            } else if (invite.sender === currentUserId) {
              await removeIndex(invite.pollIndex);
            }
          }
        }
      }
    } catch (error) {
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  };

export const acceptTeleportRequestPoll =
  (invite) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    const currentUserId = getState().user.eventID;
    try {
      if (invite.is_request) {
        teleportToUser(currentUserId, invite.userID, (e) => {
          console.log(e, 'teleportToUserError');
        });
      }
      dispatch(removeInvite(invite.id));
      if (twilioSyncService.isActive) {
        twilioSyncService[SERVICE_NAME].mutate(
          invite.pollIndex,
          function (remoteData) {
            remoteData.invites = remoteData.invites.map((v) => {
              if (invite.id === v.id) {
                return { ...v, accept: true };
              }
              return v;
            });
            return remoteData;
          }
        );
      }
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export const expireTeleportRequestPoll = (invite) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if (twilioSyncService.isActive) {
      twilioSyncService[SERVICE_NAME].mutate(
        invite.pollIndex,
        function (remoteData) {
          remoteData.invites = remoteData.invites.map((v) => {
            if (invite.id === v.id) {
              return { ...v, expire: true };
            }
            return v;
          });
          return remoteData;
        }
      );
    }
  } catch (error) {
    dispatch(handleError(error));
  }

  dispatch(setLoading(false));
};

export const declineTeleportRequestPoll = (invite) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    dispatch(removeInvite(invite.id));
    if (twilioSyncService.isActive) {
      twilioSyncService[SERVICE_NAME].mutate(
        invite.pollIndex,
        function (remoteData) {
          remoteData.invites = remoteData.invites.map((v) => {
            if (invite.id === v.id) {
              return { ...v, declined: true };
            }
            return v;
          });
          return remoteData;
        }
      );
    }
  } catch (error) {
    dispatch(handleError(error));
  }
  dispatch(setLoading(false));
};

export const cancelTeleportRequestPoll = (invite) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    dispatch(removeInvite(invite.id));
    if (twilioSyncService.isActive) {
      twilioSyncService[SERVICE_NAME].mutate(
        invite.pollIndex,
        function (remoteData) {
          remoteData.invites = remoteData.invites.map((v) => {
            if (invite.id === v.id) {
              return { ...v, cancel: true };
            }
            return v;
          });
          return remoteData;
        }
      );
    }
  } catch (error) {
    dispatch(handleError(error));
  }
  dispatch(setLoading(false));
};

export const publishTeleportRequestPoll =
  (payload) => async (dispatch, getState) => {
    dispatch(setLoading(true));

    const invites = getState().teleportRequestPoll.invites;
    const currentId = getState().user.current.eventUserId;

    const is_sent = invites.find((invite) => invite.sender === currentId);
    if (is_sent) {
      if (!isRequestFailed(is_sent)) {
        dispatch(
          setMessage({
            message: i18next.t(
              'genericMessages.teleportRequestAlreadySentMessage',
              { userName: is_sent.recipient_name }
            ), // `Teleport Request already send to ${is_sent.recipient_name}`,
          })
        );
        return;
      }
    }

    const is_recipient = invites.find(
      (invite) => invite.recipient === currentId
    );
    if (is_recipient) {
      dispatch(
        setMessage({
          message: i18next.t(
            'genericMessages.acceptOrDeclineTeleportRequestMessage',
            { userName: is_recipient.sender_name }
          ), // `Please Accept or Decline ${is_recipient.sender_name}'s Teleport Request`,
        })
      );
      return;
    }

    console.log('ENTERING');

    try {
      if (twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].push(
          {
            invites: [{ ...payload }],
          },
          {
            ttl: 1800000,
          }
        );
      }
    } catch (error) {
      dispatch(handleError(error));
    }

    dispatch(setLoading(false));
  };

export default slice.reducer;
