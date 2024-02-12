import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontIcon, mergeStyles } from '@fluentui/react';
import { IconButton, ActionButton, Text, Stack } from 'office-ui-fabric-react';
import { GAME_STAGE_EVENT } from 'constants/game';
import { setGameData, setGameStage } from 'store/reducers/game';
import { showInviteChatRoomOrOpenRoom } from 'store/reducers/channel';
import { publishAudioChatPoll } from 'store/reducers/audioChatPoll';
import {
  publishFollowRequestPoll,
  removeFollowRequest,
} from 'store/reducers/followRequestPoll';
import { generateUuid, getValidChannelName, isEmptyText } from 'utils/common';
import { UserAvatar } from 'components/common';
import { setMessage } from '../../../../store/reducers/message';
import { Spinner } from 'office-ui-fabric-react';
import { useShowUserRoles } from './useShowUserRoles';
import EventUserService from 'services/eventUserService';
import config from 'config';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  enableMicAccess,
  enablePresenterMicAccess,
} from 'utils/eventVariables';
import { EVENTNAME } from 'utils/eventVariables';

const spinnerStyles = {
  container: {},
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--sr-color-background-spinnerStyles-wrapper)',
    borderRadius: '15px',
  },
  spinner: {
    root: {
      margin: '2rem 0',
    },
    circle: {
      borderWidth: 3,
      width: 48,
      height: 48,
    },
  },
};

const titleTextStyles = {
  root: {
    fontFamily: 'var(--sr-font-primary)',
    fontSize: '16px',
    fontWeight: 500,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: 100,
    overflow: 'hidden',
  },
};
const normalTextStyles = {
  root: {
    fontFamily: 'var(--sr-font-primary)',
    fontSize: '12px',
    fontWeight: 300,
  },
};

const iconClass = mergeStyles({
  fontSize: 20,
  marginRight: 15,
  marginLeft: 5,
});

const itemsWrapper = mergeStyles({
  height: 32,
  alignItems: 'center',
  display: 'flex',
  color: 'var(--sr-color-white)',
});

const buttonStyles = {
  root: {
    borderRadius: '5px',
    border: '1px solid var(--sr-color-white)',
    padding: '8px 15px',
    width: '145px',
    marginBottom: 10,
  },
  rootHovered: {
    backgroundColor: 'var(--sr-color-primary)',
  },
  rootPressed: {
    backgroundColor: 'var(--sr-color-primary)',
  },
  icon: {
    color: 'var(--sr-color-white)',
  },
  iconHovered: {
    color: 'var(--sr-color-white)',
  },
  iconPressed: {
    color: 'var(--sr-color-white)',
  },
};

const closeButtonStyles = {
  root: {
    borderRadius: '100%',
    border: '1px solid var(--sr-color-white)',
    height: '20px',
    width: '20px',
    position: 'absolute',
    right: '10px',
    top: '10px',
    zIndex: 2,
  },
  rootHovered: {
    backgroundColor: 'var(--sr-color-primary)',
  },
  rootPressed: {
    backgroundColor: 'var(--sr-color-primary)',
  },
  icon: {
    color: 'var(--sr-color-white)',
    fontSize: '8px',
    height: '8px',
    lineHeight: '8px',
    cursor: 'pointer',
  },
};

const InfoItem = (props) => {
  const { icon, text, visibility, textStyle } = props;
  if (!visibility) {
    return <></>;
  }
  return (
    <Stack horizontal>
      {icon ? (
        <Stack.Item align="start" className={itemsWrapper}>
          <FontIcon iconName={icon} className={iconClass} />
        </Stack.Item>
      ) : (
        <></>
      )}
      <Stack.Item align="start" className={itemsWrapper}>
        <Text styles={textStyle} nowrap>
          {text}
        </Text>
      </Stack.Item>
    </Stack>
  );
};

export const Profile = () => {
  const {
    components: {
      panels: {
        game: { profile: ls },
      },
    },
  } = useLabelsSchema();
  const [user, setUser] = useState(null);
  const game = useSelector((state) => state.game);
  const usersList = useSelector((state) => state.usersList);
  const userState = useSelector((state) => state.user);
  const followRequestPoll = useSelector((state) => state.followRequestPoll);
  const { is_in_stage } = useSelector((state) => state.teleportRequestPoll);
  const dispatch = useDispatch();

  useEffect(() => {
    if (game.data?.userId) {
      (() => {
        getUserDetails();
      })();
    }
  }, [game?.data?.userId]);

  const getUserDetails = async () => {
    if (game.data.userId) {
      const eventUserService = new EventUserService();
      try {
        const eventId = userState.eventID;
        const gameUserEvent = usersList.list.find(
          (v) => v.eventUserId === game.data.userId
        );
        if (gameUserEvent) {
          const userData = await eventUserService.getEventUser({
            eventId,
            userId: gameUserEvent.id,
          });
          if (userData && userData.user) {
            setUser({
              ...userData.user,
              eventUserId: gameUserEvent.eventUserId,
              roles: userData.roles,
              userFieldVisibility: userData.userFieldVisibility,
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    const onClickOutside = (event) => {
      const element = document.querySelector('.gameProfilePanel');
      if (element && !element.contains(event.target)) {
        handleClose();
      }
    };
    const onKeydown = () => {
      handleClose();
    };
    window?.removeEventListener?.('click', onClickOutside);
    window?.removeEventListener?.('keydown', onKeydown);
    window.addEventListener('click', onClickOutside);
    window.addEventListener('keydown', onKeydown);

    return () => {
      window.removeEventListener('click', onClickOutside);
      window.removeEventListener('keydown', onKeydown);
    };
  }, []);

  const handleClickChat = () => {
    // dispatch(setPanelName('chat'))
    if (user) {
      dispatch(showInviteChatRoomOrOpenRoom(user, userState.current));
    }
    handleClose();
  };

  const handleClickCall = () => {
    const channelName = getValidChannelName(generateUuid());
    dispatch(
      publishAudioChatPoll({
        channelName,
        sender: userState.current.eventUserId,
        recipient: user?.eventUserId,
      })
    );
    handleClose();
  };

  const handleFollowMe = () => {
    if (
      userState.current.roles.includes('ROLE_PRESENTER') ===
      user?.roles.includes('ROLE_PRESENTER')
    ) {
      dispatch(setMessage({ message: ls.cantInviteAnotherGuidToTourText }));
      return;
    }
    dispatch(
      publishFollowRequestPoll({
        sender: userState.current.eventUserId,
        recipient: user?.eventUserId,
        sender_role: userState.current.roles.includes('ROLE_PRESENTER')
          ? 'presenter'
          : 'attendee',
        recipient_role: user?.roles.includes('ROLE_PRESENTER')
          ? 'presenter'
          : 'attendee',
      })
    );

    handleClose();
  };

  const handleRemoveFollower = () => {
    if (user) {
      dispatch(removeFollowRequest(user.eventUserId, userState.current.eventUserId));
    }
    handleClose();
  };

  const handleClose = () => {
    document.querySelector('#player-control').style.pointerEvents = 'none';

    dispatch(setGameStage(GAME_STAGE_EVENT));
    dispatch(setGameData({ emotes: game.data.emotes, userId: null }));
  };

  let showAskToFollowButton = useMemo(() => {
    let showbutton = true;
    let followingUserList = [];
    if (
      followRequestPoll.active &&
      followRequestPoll.active.value.participants
    ) {
      followingUserList = followRequestPoll.active.value.participants
        .map((participant) =>
          usersList.list.find((user) => user.eventUserId === participant)
        )
        .filter((v) => !!v) //Filtering Founded Users only, removing undefined
        .filter((user) => user.eventUserId !== userState.current.eventUserId);
    }
    if (user && followingUserList.length > 0) {
      showbutton = !followingUserList.find((v) => v.id === user.id);
    }
    return showbutton;
  }, [
    followRequestPoll.active,
    followRequestPoll.active && followRequestPoll.active.value.participants,
    user,
    usersList,
  ]);

  let showAudioCallButton = false;
  if (window.agoraClientPrimary && user) {
    showAudioCallButton =
      window.agoraClientPrimary.userList.some(
        (v) => v.uid === user.eventUserId
      ) && !window.agoraClientPrimary.meetingWindowActive;
  }

  const userRoles = useShowUserRoles(user?.roles);

  if (!user && game.data?.userId) {
    return (
      <div
        className="ms-Flex ms-Flex-column roundPanel gameProfilePanel"
        style={{
          right: '80px',
          bottom: '70px',
        }}
      >
        <div style={spinnerStyles.wrapper}>
          <Spinner styles={spinnerStyles.spinner} />
        </div>
      </div>
    );
  }

  return user ? (
    <div
      className="ms-Flex ms-Flex-column roundPanel gameProfilePanel"
      style={
        EVENTNAME?.toLowerCase()?.indexOf('infosys events') !== -1 
        ? (followRequestPoll.active ? { right: '485px', bottom: '250px'} : (is_in_stage ? { right: '150px', bottom: '250px'} : { right: '450px', bottom: '70px'})) 
        : { right: '80px', bottom: '70px'}
      }
    >
      {(usersList.userListLoading || usersList.userDataLoading) && (
        <div style={spinnerStyles.wrapper}>
          <Spinner styles={spinnerStyles.spinner} />
        </div>
      )}

      <IconButton
        iconProps={{ iconName: 'ChromeClose' }}
        styles={closeButtonStyles}
        title={ls.closeText}
        ariaLabel={ls.closeText}
        onClick={handleClose}
      />
      <div className="ms-Flex ms-Flex-row">
        <UserAvatar user={user} coinSize={60} hidePersonaDetails />
        <div
          className="ms-Flex ms-Flex-column ms-Flex-align-items-start"
          style={{ marginLeft: 10 }}
        >
          {user.userFieldVisibility?.firstName &&
            user.userFieldVisibility?.lastName && (
              <InfoItem
                text={`${user.firstName} ${user.lastName}`}
                visibility={
                  !isEmptyText(user.firstName) || !isEmptyText(user.lastName)
                }
                textStyle={titleTextStyles}
              />
            )}
          <InfoItem
            text={userRoles}
            visibility={true}
            textStyle={normalTextStyles}
          />
          {user.userFieldVisibility?.email && (
            <InfoItem
              text={user.email}
              visibility={!isEmptyText(user.email)}
              textStyle={normalTextStyles}
            />
          )}
        </div>
      </div>
      <div className="ms-my-1 user-details">
        {user.userFieldVisibility?.title && (
          <InfoItem
            icon="RibbonSolid"
            text={user.title}
            visibility={!isEmptyText(user.title)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.organization && (
          <InfoItem
            icon="Work"
            text={user.organization}
            visibility={!isEmptyText(user.organization)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.phoneNumber && (
          <InfoItem
            icon="Phone"
            text={user.phoneNumber}
            visibility={!isEmptyText(user.phoneNumber)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.addressLine1 && (
          <InfoItem
            icon="POISolid"
            text={user.addressLine1}
            visibility={!isEmptyText(user.addressLine1)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.addressLine2 && (
          <InfoItem
            icon="POISolid"
            text={user.addressLine2}
            visibility={!isEmptyText(user.addressLine2)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.state && (
          <InfoItem
            icon="MapPin"
            text={user.state}
            visibility={!isEmptyText(user.state)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.city && (
          <InfoItem
            icon="CityNext"
            text={user.city}
            visibility={!isEmptyText(user.city)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.country && (
          <InfoItem
            icon="Globe2"
            text={user.country}
            visibility={!isEmptyText(user.country)}
            textStyle={normalTextStyles}
          />
        )}
        {user.userFieldVisibility?.zip && (
          <InfoItem
            icon="PublicEmail"
            text={user.zip}
            visibility={!isEmptyText(user.zip)}
            textStyle={normalTextStyles}
          />
        )}
      </div>
      <div className="ms-Flex ms-Flex-justify-content-between user-info-button">
        <div className="ms-Flex ms-Flex-column ms-Flex-align-items-center">
          <ActionButton
            iconProps={{ iconName: 'CannedChat' }}
            onClick={handleClickChat}
            styles={buttonStyles}
          >
            {ls.textChatText}
          </ActionButton>
        </div>
        {showAudioCallButton &&
          (enableMicAccess ||
            (enablePresenterMicAccess &&
              userState.current?.roles?.includes('ROLE_PRESENTER'))) && (
            <div className="ms-Flex ms-Flex-column ms-Flex-align-items-center">
              <ActionButton
                iconProps={{ iconName: 'Microphone' }}
                onClick={handleClickCall}
                styles={buttonStyles}
              >
                {ls.audioCallText}
              </ActionButton>
            </div>
          )}
      </div>
      {(() => {
        let message;
        let showMessage = false;
        if (
          userState.current.roles.includes('ROLE_PRESENTER') ===
            user.roles.includes('ROLE_PRESENTER') &&
          userState.current.roles.includes('ROLE_ATTENDEE') ===
            user.roles.includes('ROLE_ATTENDEE')
        ) {
          showMessage = true;
          message = ls.presenterCantFollowPresenterText;
        }
        if (
          userState.current.roles.includes('ROLE_ATTENDEE') ===
            user.roles.includes('ROLE_ATTENDEE') &&
          userState.current.roles.includes('ROLE_PRESENTER') === false &&
          user.roles.includes('ROLE_PRESENTER') === false
        ) {
          showMessage = true;
          message = ls.attendeeCantFollowAtendeeText;
        }
        if(game?.currentRoom?.nextMapName === "LectureHall"){
          showMessage = true;
          message = "Following is restricted in this area";
        }

        if (showMessage) {
          return (
            <div className="ms-Flex ms-Flex-justify-content-between askToFollowMessage">
              <div className="ms-Flex ms-Flex-column ms-Flex-align-items-center">
                <span>
                  <FontIcon iconName="Info" />
                  {message}
                </span>
              </div>
            </div>
          );
        } else if (showAskToFollowButton) {
          return (
            <div className="ms-Flex ms-Flex-justify-content-between">
              <div className="ms-Flex ms-Flex-column ms-Flex-align-items-center">
                <ActionButton
                  iconProps={{ iconName: 'AddFriend' }}
                  onClick={handleFollowMe}
                  styles={buttonStyles}
                >
                  {ls.askToFollowText}
                </ActionButton>
              </div>
            </div>
          );
        } else {
          return (
            <div className="ms-Flex ms-Flex-justify-content-between">
              <div className="ms-Flex ms-Flex-column ms-Flex-align-items-center">
                <ActionButton
                  onClick={handleRemoveFollower}
                  styles={buttonStyles}
                >
                  {ls.removeFollowerText}
                </ActionButton>
              </div>
            </div>
          );
        }
      })()}
    </div>
  ) : null;
};
