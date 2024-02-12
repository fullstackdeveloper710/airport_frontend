import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FontIcon,
  mergeStyles,
  AnimationClassNames,
  Text,
  Stack,
  DefaultButton,
  PrimaryButton,
  IconButton,
} from '@fluentui/react';
import { UserAvatar } from '../../../common';
import {
  removeInvite,
  endRemoteFollowRequestPoll,
  endFollowPoll,
} from 'store/reducers/followRequestPoll';
import { useHistory } from 'react-router-dom';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { EVENTNAME } from 'utils/eventVariables';

const titleTextStyles = {
  root: {
    fontFamily: 'var(--sr-font-primary)',
    fontSize: '16px',
    fontWeight: 500,
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
  height: 24,
  alignItems: 'center',
  display: 'flex',
  color: 'var(--sr-color-white)',
});

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

const Accordion = React.forwardRef(
  ({ isOpen, onToggle, header, children }, ref) => {
    return (
      <div ref={ref}>
        <Stack horizontal={false}>
          <Stack.Item>
            <Stack
              horizontal={true}
              onClick={onToggle}
              horizontalAlign="space-between"
            >
              <Stack.Item>{header}</Stack.Item>
              <Stack.Item>
                <IconButton
                  iconProps={{ iconName: isOpen ? 'ChevronDown' : 'ChevronUp' }}
                />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          {isOpen && (
            <Stack.Item className={AnimationClassNames.slideDownIn20}>
              {children}
            </Stack.Item>
          )}
        </Stack>
      </div>
    );
  }
);

let timeOut = null;

let debounceTimeOut = null;

export const FollowRequest = ({
  onCancel,
  onDecline,
  onAccept,
  removeUser,
}) => {
  const {
    components: {
      panels: {
        game: {
          followRequest: { followRequest: ls },
        },
      },
    },
  } = useLabelsSchema();
  const usersList = useSelector((state) => state.usersList);
  const currentUser = useSelector((state) => state.user.current);
  const followRequestPoll = useSelector((state) => state.followRequestPoll);
  const is_presenter = useRef(currentUser.roles.includes('ROLE_PRESENTER'));
  const [showOutGoingContent, setShowOutGoingContent] = useState(true);
  const [showIncomingContent, setShowIncomingContent] = useState(true);
  const [showFollowerList, setShowFollowerList] = useState(true);
  const usersStatuses = useSelector((state) => state.usersList.statuses);
  const intervalInviteRef = useRef();
  const intervalFollowRef = useRef();
  const retryInviteRef = useRef();
  const retryFollowRef = useRef();
  const mountFlag = useRef();
  const dispatch = useDispatch();
  const history = useHistory();

  const incomingRequests = followRequestPoll.invites.filter(
    (request) => request.recipient === currentUser.eventUserId
  );
  const outgoingRequests = followRequestPoll.invites.filter(
    (request) => request.sender === currentUser.eventUserId
  );

  let followingUserList = [];

  if (
    is_presenter &&
    followRequestPoll &&
    is_presenter.current &&
    followRequestPoll.active &&
    followRequestPoll.active.value.participants
  ) {
    followingUserList = followRequestPoll.active.value.participants
      .map((participant) =>
        usersList.list.find((user) => user.eventUserId === participant)
      )
      .filter((v) => !!v) //Filtering Founded Users only, removing undefined
      .filter((user) => user.eventUserId !== currentUser.eventUserId);
  }

  const userOnlineStatus = usersList.list.filter((item) => {
    // Online users only if showing active
    if (
      (usersStatuses[item.id] && usersStatuses[item.id] !== 'online') ||
      !usersList.onlineUsers.includes(item.eventUserId)
    ) {
      return false;
    }
    return true;
  });

  const removeAllUser = () => {
    followRequestPoll.active.value.participants.forEach((v) => {
      if (v !== currentUser.eventUserId) {
        removeUser(v);
      }
    });
    dispatch(endFollowPoll());
  };

  const removeInviteIfNotOnline = (followersList) => {
    intervalInviteRef.current = setInterval(() => {
      const flag = followersList.filter((v) => {
        return !userOnlineStatus.some((b) => v.user === b.eventUserId);
      });
      if (retryInviteRef.current > 5) {
        flag.forEach((b) => {
          dispatch(removeInvite(b.index));
        });
        clearInterval(intervalInviteRef.current);
        intervalInviteRef.current = null;
      }
      retryInviteRef.current = retryInviteRef.current + 1;
    }, 1000);
  };

  const removeFollowIfNotOnline = (followersList) => {
    intervalFollowRef.current = setInterval(() => {
      const flag = followersList.filter((v) => {
        return !userOnlineStatus.some((b) => v === b.eventUserId);
      });
      if (retryFollowRef.current > 5) {
        flag.forEach((b) => {
          dispatch(endRemoteFollowRequestPoll(b));
        });
        clearInterval(intervalFollowRef.current);
        intervalFollowRef.current = null;
      }

      retryFollowRef.current = retryFollowRef.current + 1;
    }, 1000);
  };

  useEffect(() => {
    if (mountFlag.current && is_presenter.current && followRequestPoll.active) {
      if (intervalFollowRef.current) {
        clearInterval(intervalFollowRef.current);
        intervalFollowRef.current = null;
      }
      const followersList = followRequestPoll.active.value.participants.filter(
        (v) => v !== currentUser.eventUserId
      );

      retryFollowRef.current = 0;
      removeFollowIfNotOnline(followersList);
    }
    return () => {
      if (intervalFollowRef.current) {
        clearInterval(intervalFollowRef.current);
        intervalFollowRef.current = null;
      }
    };
  }, [userOnlineStatus.length]);

  useEffect(() => {
    if (mountFlag.current) {
      if (intervalInviteRef.current) {
        clearInterval(intervalInviteRef.current);
        intervalInviteRef.current = null;
      }
      const followersList = [];
      followRequestPoll.invites.forEach((v) => {
        if (v.sender !== currentUser.eventUserId) {
          followersList.push({ user: v.sender, index: v.pollIndex });
        }
        if (v.recipient !== currentUser.eventUserId) {
          followersList.push({ user: v.recipient, index: v.pollIndex });
        }
      });
      retryInviteRef.current = 0;
      removeInviteIfNotOnline(followersList);
    } else {
      if (timeOut) clearTimeout(timeOut);
      timeOut = setTimeout(() => {
        //Setting timeout on intial load , due to online status updated after few seconds
        mountFlag.current = true;
      }, 3000);
    }
    return () => {
      if (timeOut) clearTimeout(timeOut);
      if (intervalInviteRef.current) {
        clearInterval(intervalInviteRef.current);
        intervalInviteRef.current = null;
      }
    };
  }, [userOnlineStatus.length]);

  if (
    outgoingRequests.length === 0 &&
    incomingRequests.length === 0 &&
    followingUserList.length === 0
  ) {
    return null;
  }

  return (
    <div className="roundPanel requestsPanel follow-request-wrapper">
      <div className="container follow-request-container">
        {outgoingRequests?.length > 0 && (
          <>
            <Accordion
              header={
                <p className="headerText">
                  {ls.outgoingRequestsText(+outgoingRequests.length)}
                </p>
              }
              isOpen={showOutGoingContent}
              onToggle={() => setShowOutGoingContent((p) => !p)}
            >
              <div className="requestList ms-Flex ms-Flex-column">
                {outgoingRequests.map((request) => {
                  const user = usersList.list.find(
                    (user) => user.eventUserId === request.recipient
                  );
                  return !user ? null : (
                    <div
                      className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center"
                      key={`${request.sender} - ${request.recipient}`}
                    >
                      <UserAvatar user={user} coinSize={40} />
                      <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1">
                        <InfoItem
                          text={`${user.firstName} ${user.lastName}`}
                          visibility={!!user.firstName || !!user.lastName}
                          textStyle={titleTextStyles}
                        />
                        {EVENTNAME?.toLowerCase()?.indexOf('celebrity') ===
                          -1 && (
                          <InfoItem
                            text={user.email}
                            visibility={!!user.email}
                            textStyle={normalTextStyles}
                          />
                        )}
                      </div>
                      <div className="requestItemActions ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-center">
                        <DefaultButton
                          text={ls.cancelText}
                          onClick={() => onCancel(request)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Accordion>
          </>
        )}
        {incomingRequests?.length > 0 && (
          <>
            <Accordion
              header={
                <p className="headerText">
                  {ls.incomingRequestsText(incomingRequests.length)}
                </p>
              }
              isOpen={showIncomingContent}
              onToggle={() => setShowIncomingContent((p) => !p)}
            >
              <div className="requestList ms-Flex ms-Flex-column">
                {incomingRequests.map((request) => {
                  const user = usersList.list.find(
                    (user) => user.eventUserId === request.sender
                  );
                  return !user ? null : (
                    <div
                      className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center"
                      key={`${request.sender} - ${request.recipient}`}
                    >
                      <UserAvatar user={user} coinSize={40} />
                      <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1">
                        <InfoItem
                          text={`${user.firstName} ${user.lastName}`}
                          visibility={!!user.firstName || !!user.lastName}
                          textStyle={titleTextStyles}
                        />
                        <InfoItem
                          text={user.email}
                          visibility={!!user.email}
                          textStyle={normalTextStyles}
                        />
                      </div>
                      <div className="requestItemActions ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-evenly">
                        <PrimaryButton
                          text={ls.acceptText}
                          disabled={followRequestPoll.loading}
                          onClick={() => onAccept(request)}
                        />
                        <DefaultButton
                          text={ls.declineText}
                          onClick={() => onDecline(request)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Accordion>
          </>
        )}
        {followingUserList?.length > 0 && (
          <>
            <Accordion
              header={
                <div>
                  <p className="headerText" style={{ float: 'left' }}>
                    {ls.ongoingFollowersText}
                    <span className="sr__followersCount">
                      {followingUserList.length}
                    </span>
                  </p>
                </div>
              }
              isOpen={showFollowerList}
              onToggle={() => setShowFollowerList((p) => !p)}
            >
              <div className="requestList ms-Flex ms-Flex-column">
                {followingUserList.map((user) => {
                  return (
                    <div
                      className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center "
                      key={`${user.eventUserId}`}
                    >
                      <div className="ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-between section__fullwidth">
                        <div className="ms-Flex ms-Flex-row ms-Flex-align-items-center">
                          <UserAvatar user={user} coinSize={30} />
                          <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1 followersName">
                            <InfoItem
                              text={`${user.firstName} ${user.lastName}`}
                              visibility={!!user.firstName || !!user.lastName}
                              textStyle={titleTextStyles}
                            />
                          </div>
                        </div>
                        <div>
                          <PrimaryButton
                            className="btn__removeUser"
                            text={ls.xRemoveText}
                            onClick={() => removeUser(user.eventUserId)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Accordion>
            <div className="btn__removeAllWrapper">
              <PrimaryButton
                size={'sm'}
                style={{
                  float: 'right',
                  marginRight: 0,
                  marginLeft: 10,
                  padding: 0,
                }}
                text={ls.removeAllText}
                className="ms-mr-1"
                onClick={removeAllUser}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
