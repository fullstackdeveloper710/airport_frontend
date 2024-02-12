import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  acceptTeleportRequestPoll,
  declineTeleportRequestPoll,
} from 'store/reducers/teleportRequestPoll';
import { IncommingRequestItem } from './IncommingRequestItem';
import { OutgoingRequestIem } from './OutgoingRequestIem';

const buttonStyles = {
  root: {
    width: '3rem',
    height: '3rem',
    color: 'var(--sr-color-secondary)',
    background: 'var(--sr-color-transparent)',
  },
  icon: {
    fontSize: 20,
  },
  iconHovered: {
    color: 'var(--sr-color-primary)',
  },
  iconDisabled: {
    color: 'var(--sr-color-disabled)',
  },
};

const normalTextStyles = {
  root: {
    fontFamily: 'var(--sr-font-primary)',
    fontSize: '14px',
    fontWeight: 300,
    color: 'var(--sr-color-white)',
    marginBottom: '5px',
  },
};

const calloutProps = { gapSpace: 0 };

const hostStyles = {
  styles: {
    content: { color: 'var(--sr-color-white)' },
  },
  calloutProps: {
    styles: {
      beak: { background: 'var(--sr-color-transparent)' },
      beakCurtain: { background: 'var(--sr-color-background-beakCurtain)' },
      calloutMain: { background: 'var(--sr-color-background-calloutMain)' },
    },
  },
};

const iconWrapperStyle = {
  width: 60,
  display: 'flex',
};

const itemsProps = {
  iconWrapperStyle,
  hostStyles,
  normalTextStyles,
  buttonStyles,
  calloutProps,
};

export const TeleportRequest = () => {
  const usersList = useSelector((state) => state.usersList);
  const currentUser = useSelector((state) => state.user.current);
  const teleportInvites = useSelector(
    (state) => state.teleportRequestPoll.invites
  );
  const dispatch = useDispatch();

  const incomingRequests = useMemo(
    () =>
      teleportInvites.filter(
        (request) => request.recipient === currentUser.eventUserId
      ),
    [teleportInvites]
  );

  const outcommingRequests = useMemo(
    () =>
      teleportInvites.filter(
        (request) => request.sender === currentUser.eventUserId
      ),
    [teleportInvites]
  );

  if (incomingRequests.length === 0 && outcommingRequests.length === 0)
    return null;

  const onAccept = (invite) => {
    dispatch(acceptTeleportRequestPoll(invite));
  };

  const onDecline = (invite) => {
    dispatch(declineTeleportRequestPoll(invite));
  };

  return (
    <div className="requestsBigPanel">
      {incomingRequests?.length > 0 && (
        <>
          <div className="ms-Flex ms-Flex-column">
            {incomingRequests.map((request) => {
              const user = usersList.list.find(
                (user) => user.eventUserId === request.sender
              );
              return !user ? null : (
                <IncommingRequestItem
                  key={request.id}
                  {...itemsProps}
                  request={request}
                  onAccept={() => onAccept(request)}
                  onDecline={() => onDecline(request)}
                />
              );
            })}
          </div>
        </>
      )}
      {outcommingRequests?.length > 0 && (
        <>
          <div className="ms-Flex ms-Flex-column">
            {outcommingRequests.map((request) => {
              const user = usersList.list.find(
                (user) => user.eventUserId === request.sender
              );
              return !user ? null : (
                <OutgoingRequestIem
                  key={request.id}
                  {...itemsProps}
                  request={request}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
