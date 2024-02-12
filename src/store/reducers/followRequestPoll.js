import { createSlice } from '@reduxjs/toolkit';
import twilioSyncService from 'services/twilioSyncService';
import { setMessage } from './message';
import { teleportToUser } from 'utils/common';
import { EventUserService } from 'services';
import { convertIdToEventLoggerFormat } from 'utils/common';
import i18next from 'i18next';

/**
 * @typedef FollowRequestPollInvite
 * @type {object}
 * @property {string} [sender]    Sender User ID
 * @property {string} [recipient] Recipient User ID
 */

/**
 * @typedef FollowRequestPoll
 * @type {object}
 * @property {FollowRequestPollInvite[]} invites - an Array of user ids, either sender or recipient.
 * @property {(null | *)} active - Active.
 * @property {boolean} loading - Loading status.
 */

/**
 * Initial State.
 * @type FollowRequestPoll
 */
const initialState = {
  invites: [],
  active: null,
  following: null,
  loading: false,
  guide: '',
  channelName: '',
  roomChannelName: '',
};

const SERVICE_NAME = 'followRequestPollList';

export const slice = createSlice({
  name: 'followRequestPoll',
  initialState,
  reducers: {
    setRoomChannelName: (state, action) => {
      state.roomChannelName = action.payload;
    },
    setChannelName: (state, action) => {
      state.channelName = action.payload;
    },
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
    removeInvite: (state, action) => {
      state.invites = state.invites.filter(
        (item) => item.pollIndex !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setActive: (state, action) => {
      state.active = action.payload;
    },
    setPresenterFollowingDetails: (state, action) => {
      state.following = action.payload;
    },
  },
});

export const { setInvites, setChannelName, setRoomChannelName, removeInvite } =
  slice.actions;

const { setLoading, addInvite, setActive } = slice.actions;

const handleError = (error) => () => {
  let message;
  try {
    message = error.response.data.error || error.response.data.message;
  } catch {
    message = error.message;
  }
  console.error(message);
};

const removeUserFromSync = async ({ getState, dispatch }, itemData) => {
  const usersList = getState().usersList;
  const { active } = getState().followRequestPoll;
  const { roles } = getState().user.current;
  const is_presenter = roles.includes('ROLE_PRESENTER');
  const currentUserId = getState().user.current.eventUserId;
  const guide = usersList.list.find(
    (user) => user.eventUserId === itemData.value.removedBy
  );

  if (itemData.value.removedBy && currentUserId !== itemData.value.removedBy) {
    if (guide) {
      dispatch(
        setMessage({
          message: i18next.t(
            'genericMessages.userHasRemovedYouFromGuidedTourMessage',
            {
              userName: `${guide.firstName} ${guide.lastName} `,
            }
          ), //`${guide.firstName} ${guide.lastName} has removed you from the guided tour`,
        })
      );
    }
  }
  if (window.gameClient && !is_presenter) {
    if (window.agoraClientPrimary) {
      window.followRequestActive = false;
      window.followRequestAudio = false;
      switchRoomAgoraChannel({ getState, dispatch });
    }
    window.gameClient.unfollowTourGuide();
  }
  if (active) {
    try {
      if (twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].mutate(
          active.index,
          function (remoteData) {
            remoteData.participants = remoteData.participants.filter(
              (participant) => participant !== itemData.value.remove
            );
            remoteData.invites = remoteData.invites.filter(
              (invite) => invite.sender !== itemData.value.remove
            );
            remoteData.removedBy = '';
            remoteData.remove = '';
            return remoteData;
          }
        );
      }
      window.followRequestActive = false;
      window.followRequestAudio = false;
      dispatch(setChannelName(''));
      dispatch(setActive(null));

      // Start Afk Warning Timer
      if (window.gameClient) {
        window.gameClient.startAfkWarningTimer();
      }
    } catch (error) {
      dispatch(handleError(error));
    }
  }
};

export const switchAgoraChannel = async (
  { dispatch, getState },
  channelName
) => {
  try {
    if (window.agoraClientPrimary) {
      let isMeetingRoom = false;
      let channelname = channelName;

      if (channelName.includes('meetingroom')) {
        channelname = channelName.split('@')[0];
        isMeetingRoom = true;
      }

      await window.agoraClientPrimary.switchChannel({
        channel: channelname,
        attendeeMode: 'presenter',
        audio: true,
        video: true,
        presenterVideo: false,
        isMeetingRoom,
      });
      dispatch(setChannelName(channelName));
    }
  } catch (e) {
    console.log(e);
    dispatch(handleError(e));
  }
};

const switchRoomAgoraChannel = ({ getState }) => {
  if (window.gameClient) {
    window.gameClient.triggerEvent('room-joined', {
      roomType: window.gameClient.getCurrentRoomType(),
      roomName: window.gameClient.getCurrentRoomName(),
      screenShare: getState().screenShare,
    });
  }
};

const handleItemUpdates = async (getState, dispatch, data) => {
  let activeFollowRequest = getState().followRequestPoll.active;
  const currentUserId = getState().user.current.eventUserId;
  const currentUserRoles = getState().user.current.roles;
  const currentChannelName = getState().followRequestPoll.channelName;
  const is_presenter = currentUserRoles.includes('ROLE_PRESENTER');
  const currentInvites = getState().followRequestPoll.invites;
  const usersList = getState().usersList;

  let itemData = data.item.data;
  console.log(itemData, 'itemData');

  //Remove User remotely from Presenter
  if (
    itemData.value.remove &&
    !is_presenter &&
    itemData.value.remove === currentUserId
  ) {
    await removeUserFromSync({ getState, dispatch }, itemData);
    return;
  }

  if (
    itemData.value.followGuide &&
    !is_presenter &&
    itemData.value.followGuide.followee === currentUserId
  ) {
    if (window.gameClient) {
      window.gameClient.startFollowingTourGuide(
        itemData.value.followGuide.guide
      );
      dispatch(setInvites([]));
      await removeIndex(itemData.index);
    }
    return;
  }

  if (itemData.value.participants.indexOf(currentUserId) !== -1) {
    // If the current user is in the call,
    if (itemData.value.participants.length === 1) {
      // If the user is the only one in the call, terminate.
      dispatch(setActive(null));
      // Start Afk Warning Timer
      if (window.gameClient) {
        window.gameClient.startAfkWarningTimer();
      }

      dispatch(setChannelName(''));
      window.followRequestActive = false;
      window.followRequestAudio = false;
      if (is_presenter) {
        switchRoomAgoraChannel({ getState, dispatch });
      }
      await removeIndex(itemData.index);
    } else {
      activeFollowRequest = getState().followRequestPoll.active;
      if (activeFollowRequest && activeFollowRequest.index !== itemData.index) {
        // If the user is joining another follow req, end current one first.
        dispatch(endFollowRequestPoll());
      }

      if (!activeFollowRequest && !currentChannelName) {
        let channelNameToChange = itemData.value.channelName;
        await switchAgoraChannel({ getState, dispatch }, channelNameToChange);
      }

      window.followRequestActive = true;
      // Join new follow req
      dispatch(
        setActive({
          index: itemData.index,
          value: itemData.value,
        })
      );
      // Stop Afk Warning Timer
      if (window.gameClient) {
        window.gameClient.startAfkWarningTimer({ longTimeout: true });
      }

      //Activate Following Tour Guide Remotely from GUIDE
      if (itemData.value.invites.length > 0) {
        let currentInvite = itemData.value.invites.find(
          (v) => v.sender === currentUserId && v.sender_role === 'attendee'
        );
        if (currentInvite && window.gameClient) {
          window.gameClient.startFollowingTourGuide(currentInvite.recipient);
          dispatch(removeInvite(itemData.index));
          if (twilioSyncService.isActive) {
            await twilioSyncService[SERVICE_NAME].mutate(
              itemData.index,
              function (remoteData) {
                remoteData.invites = remoteData.invites.filter(
                  (item) =>
                    item.sender !== currentInvite.sender &&
                    item.recipient !== currentInvite.recipient
                );
                return remoteData;
              }
            );
          }
        }
      }
    }

    if (getState().followRequestPoll.active) {
      let channelNameToChange = '';
      if (
        !is_presenter &&
        currentChannelName &&
        currentChannelName !== itemData.value.channelName
      ) {
        channelNameToChange = itemData.value.channelName;
      }
      if (channelNameToChange) {
        const guide = getState().usersList.list.find((v) => {
          return !!itemData.value.participants.find(
            (b) => b === v.eventUserId && v.roles.includes('ROLE_PRESENTER')
          );
        });
        if (window.agoraScreenShare) {
          window.agoraScreenShare.stopScreen();
        }
        if (channelNameToChange.includes('meetingroom') && guide && guide.id) {
          const meetingroom = channelNameToChange.split(':');
          window.gameClient.teleportUserToMeetingRoom(meetingroom[1]);
        } else if (guide.id) {
          await teleportToUser(getState().user.eventID, guide.id);
        }
        if (guide) {
          setTimeout(async () => {
            try {
              const eventUserService = new EventUserService();
              const formattedEventId = convertIdToEventLoggerFormat(
                getState().user.eventID
              );
              const formattedUserId = convertIdToEventLoggerFormat(
                getState().user?.current?.id
              );
              const formattedGuideId = convertIdToEventLoggerFormat(guide?.id);
              const eventLoggerResUser =
                await eventUserService.getEventUserGameId({
                  eventId: formattedEventId,
                  userId: formattedUserId,
                });
              const eventLoggerResGuide =
                await eventUserService.getEventUserGameId({
                  eventId: formattedEventId,
                  userId: formattedGuideId,
                });
              if(eventLoggerResGuide.gameId !== ""){
                if (
                  eventLoggerResGuide.gameId.includes("LectureHall") ||
                  (eventLoggerResUser.gameId !== eventLoggerResGuide.gameId 
                  && eventLoggerResUser.gameId !== "")
                ) {
                  console.log(
                    'Error following user, users in different rooms for too long, will stop following'
                  );
                  dispatch(
                    setMessage({
                      message: `Stopped following ${guide.firstName} ${guide.lastName} as following is restricted in their location.`,
                      timeout: 5000,
                    })
                  );
                  dispatch(endFollowPoll());
                  window.gameClient.unfollowTourGuide();
                } else {
                  await switchAgoraChannel(
                    { getState, dispatch },
                    channelNameToChange
                  );
                }
              }else{
                console.log(
                  'Error following user, guide gameId not found'
                );
                dispatch(
                  setMessage({
                    message: "Stopped following ${guide.firstName} ${guide.lastName} as they have lost connection.",
                    timeout: 5000,
                  })
                );
                dispatch(endFollowPoll());
                window.gameClient.unfollowTourGuide();
              }
            } catch (error) {
              console.log(error);
            }
          }, 10000);
        }
      }
    }
  } else if (
    activeFollowRequest &&
    activeFollowRequest.index === itemData.index
  ) {
    // User ended the call,
    window.followRequestActive = false;
    window.followRequestAudio = false;
    dispatch(setChannelName(''));
    dispatch(setActive(null));
    // Start Afk Warning Timer
    if (window.gameClient) {
      window.gameClient.startAfkWarningTimer();
    }
  }

  // Check if there are new invites.
  for (const invite of itemData.value.invites) {
    if (invite.sender === currentUserId || invite.recipient === currentUserId) {
      dispatch(
        addInvite({
          pollIndex: itemData.index,
          channelName: itemData.value.channelName,
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
        eventName: 'TOUR_GUIDE_REQUEST',
        eventSpecificData: JSON.stringify({
          inviter: inviter.eventUserId,
          invitee: invitee.eventUserId,
        }),
        beforeState: null,
        afterState: null,
      });
    }
  }

  // Check if any invites are declined.
  for (const invite of currentInvites) {
    if (
      invite.pollIndex === itemData.index &&
      !itemData.value.invites.find(
        (item) =>
          item.sender === invite.sender && item.recipient === invite.recipient
      )
    ) {
      dispatch(removeInvite(invite.pollIndex));
    }
  }

  // In case of empty poll, remove that
  if (
    itemData.value.participants.length === 0 &&
    itemData.value.invites.length === 0
  ) {
    try {
      await removeIndex(itemData.index);
      // eslint-disable-next-line
    } catch (err) {}
  }
};

export const changeChannelForFollowers =
  (channel) => async (dispatch, getState) => {
    let activeFollowRequest = getState().followRequestPoll.active;
    const currentChannelName = getState().followRequestPoll.channelName;

    if (activeFollowRequest) {
      let channelNameToChange = '';
      if (currentChannelName && currentChannelName !== channel) {
        channelNameToChange = channel;
      }
      if (channelNameToChange) {
        try {
          if (twilioSyncService.isActive) {
            await twilioSyncService[SERVICE_NAME].mutate(
              activeFollowRequest.index,
              function (remoteData) {
                if (channelNameToChange) {
                  remoteData.channelName = channelNameToChange;
                }
                return remoteData;
              }
            );
          }
          dispatch(setChannelName(channel));
        } catch (e) {
          console.log(e);
          dispatch(handleError(e));
        }
      }
    }
  };

const removeIndex = async (index) => {
  try {
    let followRequestPolls = await getFollowRequestPolls();
    const isIndexAvailable = followRequestPolls?.some(
      (v) => v.data.index === index
    );
    if (isIndexAvailable) {
      if (twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].remove(index);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const getFollowRequestPolls = async () => {
  let followRequestPolls = [];
  if (twilioSyncService.isActive) {
    let pages = await twilioSyncService[SERVICE_NAME].getItems();
    followRequestPolls = followRequestPolls.concat(pages.items);
    while (pages.hasNextPage) {
      pages = await pages.nextPage();
      followRequestPolls = followRequestPolls.concat(pages.items);
    }
  }
  return followRequestPolls;
};

export const getFollowRequestPollList =
  (eventID) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      if (twilioSyncService.isActive) {
        await twilioSyncService.setFollowRequestPollList(eventID);

        if (!twilioSyncService[SERVICE_NAME]) return null;

        twilioSyncService[SERVICE_NAME].on('itemAdded', (data) =>
          handleItemUpdates(getState, dispatch, data)
        );
        twilioSyncService[SERVICE_NAME].on('itemUpdated', (data) =>
          handleItemUpdates(getState, dispatch, data)
        );

        let followRequestPolls = await getFollowRequestPolls();

        const currentUserId = getState().user.current?.eventUserId;
        const existingInvites = [];

        if (currentUserId) {
          for (const followRequestPollItem of followRequestPolls) {
            const invite = followRequestPollItem.data.value.invites.find(
              (invite) =>
                invite.sender === currentUserId ||
                invite.recipient === currentUserId
            );
            if (invite) {
              existingInvites.push({
                pollIndex: followRequestPollItem.data.index,
                ...invite,
              });
            }
          }
        }

        if (existingInvites.length > 0) {
          existingInvites.forEach((invite) => {
            dispatch(removeInvite(invite.pollIndex));
          });
        }
      }

      // dispatch(setInvites(existingInvites));
    } catch (error) {
      console.log(error);
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  };

export const removeFollowRequest =
  (userId, guideUserId) => async (dispatch, getState) => {
    dispatch(setLoading(true));

    try {
      const activeFollowRequest = getState().followRequestPoll.active;
      if (twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].mutate(
          activeFollowRequest.index,
          function (remoteData) {
            remoteData.remove = userId;
            remoteData.removedBy = guideUserId;
            return remoteData;
          }
        );
      }
    } catch (e) {
      console.log(e);
      dispatch(handleError(e));
    }
    dispatch(setLoading(false));
  };

export const acceptFollowRequestPoll =
  (invite) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    const currentUserRoles = getState().user.current.roles;
    const is_presenter = currentUserRoles.includes('ROLE_PRESENTER');
    try {
      const currentUserId = getState().user.current.eventUserId;

      const { active } = getState().followRequestPoll;
      let index = invite.pollIndex;

      if (is_presenter && active) {
        index = active.index;
        if (twilioSyncService.isActive) {
          await twilioSyncService[SERVICE_NAME].mutate(
            invite.pollIndex,
            function (remoteData) {
              remoteData.participants = [];
              remoteData.invites = [];
              remoteData.followGuide = {
                guide: currentUserId,
                followee: invite.sender,
              };
              return remoteData;
            }
          );
        }
        dispatch(declineFollowRequestPoll(invite));
      }
      if (twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].mutate(
          index,
          function (remoteData) {
            const participantsList = [
              ...new Set([
                ...remoteData.participants,
                invite.sender,
                invite.recipient,
              ]),
            ];
            remoteData.participants = [...participantsList];
            if (
              invite.recipient === currentUserId &&
              invite.recipient_role === 'attendee'
            ) {
              remoteData.invites = remoteData.invites.filter(
                (item) =>
                  item.sender !== invite.sender &&
                  item.recipient !== invite.recipient
              );
            }
            return remoteData;
          }
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(handleError(error));
    }

    if (is_presenter) {
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 3000);
    } else {
      dispatch(setLoading(false));
    }
  };

export const declineFollowRequestPoll = (invite) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    if (twilioSyncService.isActive) {
      await twilioSyncService[SERVICE_NAME].mutate(
        invite.pollIndex,
        function (remoteData) {
          remoteData.invites = remoteData.invites.filter(
            (item) =>
              item.sender !== invite.sender &&
              item.recipient !== invite.recipient
          );
          return remoteData;
        }
      );
    }
  } catch (error) {
    console.log(error);
    dispatch(handleError(error));
  }
  dispatch(setLoading(false));
};

export const publishFollowRequestPoll =
  (payload) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      const activeFollowRequest = getState().followRequestPoll.active;

      if (activeFollowRequest) {
        if (twilioSyncService.isActive) {
          // If the user is already in the follow req chat, just add new invites
          await twilioSyncService[SERVICE_NAME].mutate(
            activeFollowRequest.index,
            (remoteData) => {
              // Check if recipient is already in the follow req chat
              if (
                !remoteData.participants.find(
                  (participant) => participant === payload.recipient
                )
              ) {
                remoteData.invites.push({
                  sender: payload.sender,
                  recipient: payload.recipient,
                  sender_role: payload.sender_role,
                  recipient_role: payload.recipient_role,
                  connecting_index: activeFollowRequest.index,
                });
              }
              return remoteData;
            }
          );
        }
      } else {
        let guide =
          payload.sender_role === 'presenter'
            ? payload.sender
            : payload.recipient;
        // Creates a new follow request poll
        if (twilioSyncService.isActive) {
          await twilioSyncService[SERVICE_NAME].push({
            channelName: guide, //Naming ChannelName as Guide Name for Unqiue Channel Name
            participants: [],
            invites: [
              {
                sender: payload.sender,
                recipient: payload.recipient,
                sender_role: payload.sender_role,
                recipient_role: payload.recipient_role,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.log(error);
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  };

export const endRemoteFollowRequestPoll =
  (userId) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      const activeFollowRequest = getState().followRequestPoll.active;

      if (activeFollowRequest && twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].mutate(
          activeFollowRequest.index,
          function (remoteData) {
            remoteData.participants = remoteData.participants.filter(
              (participant) => participant !== userId
            );
            remoteData.invites = remoteData.invites.filter(
              (invite) => invite.sender !== userId
            );
            return remoteData;
          }
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(handleError(error));
    }
    dispatch(setLoading(false));
  };

export const endFollowRequestPoll = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const activeFollowRequest = getState().followRequestPoll.active;
    const currentUserId = getState().user.current.eventUserId;

    if (activeFollowRequest) {
      if (twilioSyncService[SERVICE_NAME] && twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].mutate(
          activeFollowRequest.index,
          function (remoteData) {
            remoteData.participants = remoteData.participants.filter(
              (participant) => participant !== currentUserId
            );
            remoteData.invites = remoteData.invites.filter(
              (invite) => invite.sender !== currentUserId
            );
            return remoteData;
          }
        );
      }
      window.followRequestActive = false;
      window.followRequestAudio = false;
      dispatch(setChannelName(''));
    }
  } catch (error) {
    console.log(error);
    dispatch(handleError(error));
  }
  dispatch(setLoading(false));
};

export const endFollowPoll = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const activeFollowRequest = getState().followRequestPoll.active;
    const currentUserId = getState().user.current.eventUserId;

    if (activeFollowRequest) {
      if (twilioSyncService.isActive) {
        await twilioSyncService[SERVICE_NAME].mutate(
          activeFollowRequest.index,
          function (remoteData) {
            remoteData.participants = remoteData.participants.filter(
              (participant) => participant !== currentUserId
            );
            remoteData.invites = remoteData.invites.filter(
              (invite) => invite.sender !== currentUserId
            );
            return remoteData;
          }
        );
      }
      window.followRequestActive = false;
      window.followRequestAudio = false;
      switchRoomAgoraChannel({ getState, dispatch });
      dispatch(setChannelName(''));
      dispatch(setActive(null));
      // Start Afk Warning Timer
      if (window.gameClient) {
        window.gameClient.startAfkWarningTimer();
      }
    }
  } catch (error) {
    console.log(error);
    dispatch(handleError(error));
  }
  dispatch(setLoading(false));
};

export default slice.reducer;
