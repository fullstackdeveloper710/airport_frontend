import React, { useEffect } from 'react';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { IconButton } from '@fluentui/react';
import { Text, PrimaryButton } from 'office-ui-fabric-react';
import {
  cancelTeleportRequestPoll,
  removeInvite,
} from 'store/reducers/teleportRequestPoll';
import { useDispatch } from 'react-redux';
import { expireTeleportRequestPoll } from 'store/reducers/teleportRequestPoll';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

let expiredTimeout = null;

export const OutgoingRequestIem = (props) => {
  const {
    calloutProps,
    hostStyles,
    buttonStyles,
    iconWrapperStyle,
    request,
    normalTextStyles,
  } = props;
  const {
    components: {
      panels: {
        game: {
          teleportRequest: { outgoingRequestItem: ls },
        },
      },
    },
    shortText,
  } = useLabelsSchema();
  const dispatch = useDispatch();

  let is_invite_failed =
    request.expire ||
    request.declined ||
    request.is_in_meeting_room ||
    request.is_in_meeting ||
    request.is_in_private ||
    request.is_in_stage;

  const iconbuttonStyles = {
    root: {
      width: '2.3rem',
      height: '2.3rem',
      background: is_invite_failed
        ? 'var(--sr-color-red)'
        : 'var(--sr-color-black)',
      borderRadius: '50%',
      margin: '0 auto',
    },
    icon: {
      fontSize: 20,
    },
  };

  const clearRequest = () => {
    if (is_invite_failed) {
      dispatch(removeInvite(request.id));
    } else {
      dispatch(cancelTeleportRequestPoll(request));
    }
  };

  const setExpireInvite = () => {
    removeTimeout();
    expiredTimeout = setTimeout(() => {
      dispatch(expireTeleportRequestPoll(request));
    }, 30 * 1000);
  };

  const removeTimeout = () => {
    if (expiredTimeout) clearTimeout(expiredTimeout);
  };

  useEffect(() => {
    if (is_invite_failed) removeTimeout();
  }, [is_invite_failed]);

  useEffect(() => {
    if (request.accept) {
      removeTimeout();
    }
    expiredTimeout = setTimeout(() => {
      dispatch(removeInvite(request.id));
    }, 3000);

    return () => {
      removeTimeout();
    };
  }, [request.accept]);

  useEffect(() => {
    setExpireInvite();
    return () => {
      removeTimeout();
    };
  }, []);

  let _message = ls.sentInvitationMessage(request.recipient_name);

  let title_message = ls.teleportRequestText;

  if (
    request.is_in_meeting ||
    request.declined ||
    request.is_in_meeting_room ||
    request.is_in_private ||
    request.is_in_stage
  ) {
    title_message = title_message + ' ' + ls.rejectedText;
  }

  if (request.declined) {
    _message = ls.receivedRejectionMessage(request.recipient_name);
  }

  if (request.expire) {
    title_message = title_message + ' ' + ls.expiredText;
    _message = ls.invitationExpiredMessage(request.recipient_name);
  }

  if (request.accept) {
    title_message = title_message + ' ' + ls.acceptedText;
    _message = ls.acceptedRequestMessage(request.recipient_name);
  }

  if (request.is_in_meeting_room) {
    _message = ls.rejectedBecauseInMeetingRoomMessage(request.recipient_name);
  }

  if (request.is_in_meeting) {
    _message = ls.rejectedBecauseInMeetingMessage(request.recipient_name);
  }

  if (request.is_in_private) {
    _message = ls.rejectedBecauseInPrivateRoomMessage(request.recipient_name);
  }

  if (request.is_in_stage) {
    _message = ls.rejectedBecauseInStageMessage(request.recipient_name);
  }

  return (
    <div className="requestList roundPanel">
      <div className="close-button">
        <TooltipHost
          content={ls.closeText}
          calloutProps={calloutProps}
          tooltipProps={hostStyles}
        >
          <IconButton
            toggle
            iconProps={{
              iconName: 'ErrorBadge',
            }}
            onClick={clearRequest}
            allowDisabledFocus
            styles={buttonStyles}
          />
        </TooltipHost>
      </div>
      <div className="ms-Flex ms-Flex-row">
        <div style={iconWrapperStyle}>
          <IconButton
            toggle
            iconProps={{
              iconName: is_invite_failed ? 'InfoSolid' : 'RingerSolid',
            }}
            allowDisabledFocus
            styles={iconbuttonStyles}
          />
        </div>
        <div>
          <div className="ms-Flex ms-Flex-justify-content-start">
            <p className="headerText">{title_message}</p>
          </div>
          <div
            className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center"
            key={`${request.sender} - ${request.recipient}`}
          >
            <div>
              <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1 ms-mt-1">
                <Text styles={normalTextStyles}>{_message}</Text>
              </div>
              {!request.accept && (
                <div className="ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-start ms-mt-1">
                  <PrimaryButton
                    text={is_invite_failed ? shortText.ok : ls.cancelText}
                    onClick={clearRequest}
                    className="ms-mr-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
