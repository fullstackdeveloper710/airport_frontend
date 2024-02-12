import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FontIcon, mergeStyles } from '@fluentui/react';
import { AnimationClassNames } from 'office-ui-fabric-react/lib/Styling';
import { Text, Stack, PrimaryButton, IconButton } from 'office-ui-fabric-react';

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

export const FollowingPopUp = ({ onUnfollow }) => {
  const {
    components: {
      panels: {
        game: {
          followRequest: { followingPopUp: ls },
        },
      },
    },
  } = useLabelsSchema();
  const usersList = useSelector((state) => state.usersList);
  const followRequestPoll = useSelector((state) => state.followRequestPoll);
  const [open, setOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.current);

  let followingUserList = [];
  if (followRequestPoll.active && followRequestPoll.active.value.participants) {
    followingUserList = followRequestPoll.active.value.participants
      .map((participant) =>
        usersList.list.find((user) => user.eventUserId === participant)
      )
      .filter(
        (user) =>
          user.roles.includes('ROLE_PRESENTER') &&
          user.eventUserId !== currentUser.eventUserId
      );
  }

  let presentingUser = null;
  if (followRequestPoll.active && followRequestPoll.active.value.participants) {
    presentingUser = followRequestPoll.active.value.participants
      .map((participant) =>
        usersList.list.find((user) => user.eventUserId === participant)
      )
      .find((user) => user.roles.includes('ROLE_PRESENTER'));
  }

  return followRequestPoll.showUnfollowButton ? (
    <div className="roundPanel requestsPanel">
      <div className="container">
        <Stack horizontal={false}>
          <Stack.Item>
            <Stack
              horizontal={true}
              onClick={() => setOpen((p) => !p)}
              horizontalAlign="space-between"
            >
              <Stack.Item>
                <p className="headerText">
                  {ls.followingText}{' '}
                  {!open ? <>{presentingUser?.firstName || ''}</> : ''}
                </p>
              </Stack.Item>
              <Stack.Item>
                {!open && (
                  <PrimaryButton
                    size={'sm'}
                    text={ls.unfollowText}
                    className="ms-mr-1"
                    onClick={onUnfollow}
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
              {followingUserList.map((v) => {
                return (
                  <div
                    key={v.eventUserId}
                    className="requestList ms-Flex ms-Flex-column"
                  >
                    {presentingUser && (
                      <div>
                        <div className="requestItem ms-Flex ms-Flex-row ms-Flex-align-items-center">
                          <UserAvatar user={presentingUser} coinSize={40} />
                          <div className="ms-Flex ms-Flex-column ms-Flex-align-items-start ms-mr-1">
                            <InfoItem
                              text={`${presentingUser.firstName} ${presentingUser.lastName}`}
                              visibility={
                                !!presentingUser.firstName ||
                                !!presentingUser.lastName
                              }
                              textStyle={titleTextStyles}
                            />
                            {EVENTNAME?.toLowerCase()?.indexOf('celebrity') ==
                              -1 && (
                              <InfoItem
                                text={presentingUser.email}
                                visibility={!!presentingUser.email}
                                textStyle={normalTextStyles}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="requestItemActions ms-Flex ms-Flex-row ms-Flex-align-items-center ms-Flex-justify-content-evenly">
                      <PrimaryButton
                        text={ls.unfollowText}
                        onClick={onUnfollow}
                      />
                    </div>
                  </div>
                );
              })}
            </Stack.Item>
          )}
        </Stack>
      </div>
    </div>
  ) : null;
};
