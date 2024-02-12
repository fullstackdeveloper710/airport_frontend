import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FontIcon, mergeStyles } from '@fluentui/react';
import { AnimationClassNames } from 'office-ui-fabric-react/lib/Styling';
import { Text, Stack, PrimaryButton, IconButton } from 'office-ui-fabric-react';
import { UserAvatar } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const titleTextStyles = {
  root: {
    fontFamily: 'var(--sr-font-primary)',
    fontSize: '16px',
    fontWeight: 500,
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

export const AudioCallPopUp = ({ onEndCall }) => {
  const {
    components: {
      panels: {
        game: { audioCallRequest:{audioCallPopUp: ls} },
      },
    },
  } = useLabelsSchema();
  const audioChatPoll = useSelector((state) => state.audioChatPoll);
  const usersList = useSelector((state) => state.usersList);
  const currentUser = useSelector((state) => state.user.current);
  const [open, setOpen] = useState(true);

  if (!audioChatPoll.active) {
    return false;
  }

  return (
    <div className="roundPanel requestsPanel follow-request-wrapper">
      <div className="container follow-request-container">
        <Stack horizontal={false}>
          <Stack.Item>
            <Stack
              horizontal={true}
              onClick={() => setOpen((p) => !p)}
              horizontalAlign="space-between"
            >
              <Stack.Item>
                <p className="headerText">{ls.stackItemHeaderText}</p>
              </Stack.Item>
              <Stack.Item>
                {!open && (
                  <PrimaryButton
                    size={'sm'}
                    text="End Call"
                    className="ms-mr-1"
                    onClick={() => {
                      setOpen(false);
                      onEndCall();
                    }}
                  />
                )}
                <IconButton
                  iconProps={{ iconName: open ? 'ChevronUp' : 'ChevronDown' }}
                />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          {open && (
            <Stack.Item className={AnimationClassNames.slideDownIn20}>
              <div className="requestList ms-Flex ms-Flex-column">
                {audioChatPoll.active &&
                  audioChatPoll.active.value.participants
                    .filter(participant => participant !== currentUser.eventUserId )
                    .map((participant) =>
                      usersList.list.find(
                        (user) => user.eventUserId === participant
                      )
                    )
                    .map((user) => (
                      <div key={user.eventUserId}>
                        <div className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center">
                          <UserAvatar user={user} coinSize={40} />
                          <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1">
                            <InfoItem
                              text={`${user.firstName} ${user.lastName}`}
                              visibility={
                                !!user.firstName ||
                                !!user.lastName
                              }
                              textStyle={titleTextStyles}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                <div className="requestItemActions ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-evenly">
                  <PrimaryButton text={ls.endCallText} onClick={onEndCall} />
                </div>
              </div>
            </Stack.Item>
          )}
        </Stack>
      </div>
    </div>
  );
};
