import React from 'react';
import { useSelector } from 'react-redux';
import { FontIcon, mergeStyles } from '@fluentui/react';
import {
  Text,
  Stack,
  DefaultButton,
  PrimaryButton,
} from 'office-ui-fabric-react';

import { UserAvatar } from 'components/common';
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

export const AudioCallRequest = ({
  requests,
  onCancel,
  onDecline,
  onAccept,
}) => {
  const {
    components: {
      panels: {
        game: {
          audioCallRequest: { audioCallRequest: ls },
        },
      },
    },
  } = useLabelsSchema();
  const usersList = useSelector((state) => state.usersList);
  const currentUser = useSelector((state) => state.user.current);

  const incomingRequests = requests.filter(
    (request) => request.recipient === currentUser.eventUserId
  );
  const outgoingRequests = requests.filter(
    (request) => request.sender === currentUser.eventUserId
  );

  return (
    <div className="roundPanel requestsPanel">
      <div className="container">
        {outgoingRequests?.length > 0 && (
          <>
            <p className="headerText">
              {ls.requestsPanelHeaderText(+outgoingRequests.length)}
            </p>
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
                      {EVENTNAME?.toLowerCase()?.indexOf('celebrity') == -1 && (
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
          </>
        )}
        {incomingRequests?.length > 0 && (
          <>
            <p className="headerText">
              {ls.incomingRequestsHeaderText(+incomingRequests.length)}
            </p>
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
                      {EVENTNAME?.toLowerCase()?.indexOf('celebrity') == -1 && (
                        <InfoItem
                          text={user.email}
                          visibility={!!user.email}
                          textStyle={normalTextStyles}
                        />
                      )}
                    </div>
                    <div className="requestItemActions ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-evenly">
                      <PrimaryButton
                        text={ls.acceptText}
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
          </>
        )}
      </div>
    </div>
  );
};
