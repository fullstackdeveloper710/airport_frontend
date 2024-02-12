import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontIcon, mergeStyles, PrimaryButton } from 'office-ui-fabric-react';

import { UserAvatar } from 'components/common/UserAvatar';
import { GroupCallInviteDialog } from './GroupCallInviteDialog';
import { publishAudioChatPoll } from 'store/reducers/audioChatPoll';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const muteIconClass = mergeStyles({
  color: 'var(--sr-color-primary)',
  fontSize: 24,
});

const unmuteIconClass = mergeStyles({
  fontSize: 24,
});

export const GroupCall = () => {
  const {
    components: {
      panels: {
        main: { groupCall: ls },
      },
    },
  } = useLabelsSchema();
  const audioChatPoll = useSelector((state) => state.audioChatPoll);
  const agora = useSelector((state) => state.agora);
  const usersList = useSelector((state) => state.usersList);
  const currentUser = useSelector((state) => state.user.current);

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const dispatch = useDispatch();

  const closeInviteDialog = () => {
    setShowInviteDialog(false);
  };

  const openInviteDialog = () => {
    setShowInviteDialog(true);
  };

  const handleInviteUsers = (users) => {
    if (audioChatPoll.active) {
      for (const user of users) {
        if (currentUser.eventUserId && user) {
          dispatch(
            publishAudioChatPoll({
              sender: currentUser.eventUserId,
              recipient: user,
            })
          );
        }
      }
    }
    closeInviteDialog(false);
  };

  return (
    <div className="ms-Flex ms-Flex-column ms-px-1 participantsPanel">
      <div className="participantsList">
        <div className="ms-Divider"></div>
        {audioChatPoll.active &&
          audioChatPoll.active.value.participants
            .map((participant) =>
              usersList.list.find((user) => user.eventUserId === participant)
            )
            .map((user) => (
              <React.Fragment key={user.eventUserId}>
                <div className="ms-Flex ms-Flex-align-items-center ms-Flex-justify-content-between ms-py-1">
                  <UserAvatar
                    user={user}
                    size={16}
                    text={`${user.firstName} ${user.lastName}`}
                    imageInitials={
                      user.photo
                        ? user.photo.url
                        : (user.firstName || ' ').toUpperCase()[0] +
                          (user.lastName || ' ').toUpperCase()[0]
                    }
                  />
                  <FontIcon
                    iconName={
                      (
                        currentUser.eventUserId === user.eventUserId
                          ? agora.audioEnabled
                          : agora.participantsWithAudio.indexOf(
                              user.eventUserId
                            ) !== -1
                      )
                        ? 'Microphone'
                        : 'MicOff2'
                    }
                    className={
                      (
                        currentUser.eventUserId === user.eventUserId
                          ? agora.audioEnabled
                          : agora.participantsWithAudio.indexOf(
                              user.eventUserId
                            ) !== -1
                      )
                        ? unmuteIconClass
                        : muteIconClass
                    }
                  />
                </div>
                <div className="ms-Divider"></div>
              </React.Fragment>
            ))}
      </div>
      <div className="ms-Flex ms-Flex-justify-content-center">
        <PrimaryButton
          iconProps={{ iconName: 'AddFriend' }}
          onClick={openInviteDialog}
        >
          {ls.addParticipantsText}
        </PrimaryButton>
      </div>
      {audioChatPoll.active && (
        <GroupCallInviteDialog
          open={showInviteDialog}
          onDismiss={closeInviteDialog}
          onInvite={handleInviteUsers}
          users={usersList.list.filter(
            (item) =>
              !audioChatPoll.active.value.participants.find(
                (p) => p.eventUserId === item.eventUserId
              )
          )}
        />
      )}
    </div>
  );
};
