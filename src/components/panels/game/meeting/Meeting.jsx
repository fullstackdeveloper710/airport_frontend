import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionButton, mergeStyles } from '@fluentui/react';
import { publishMeetingPoll } from 'store/reducers/meetingPoll';
import { MeetingInviteDialog } from './MeetingInviteDialog';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { useI18n } from 'i18n/i18n.context';

import { ReactComponent as PhoneIcon } from 'assets/images/icons/phone.svg';

const meetingPanelWrapper = (margin = 0) =>
  mergeStyles({
    position: 'absolute',
    right: `calc(5% + ${margin}px)`,
    bottom: '1.5%',
  });

const actionButtonStyles = {
  root: {
    fontSize: 16,
    letterSpacing: 2,
    backgroundColor: 'var(--sr-color-primary)',
    lineHeight: '24px',
    padding: '12px 24px',
    borderRadius: 0,
    marginBottom: '100px',
  },
  rootDisabled: {
    backgroundColor: 'var(--sr-color-disabled)',
  },
  rootHovered: {
    backgroundColor: 'var(--sr-color-primary)',
    color: 'var(--sr-color-white)',
  },
  icon: {
    color: 'var(--sr-color-white)',
    marginRight: 8,
    paddingTop: 2,
  },
  iconHovered: {
    color: 'var(--sr-color-white)',
  },
  iconPressed: {
    color: 'var(--sr-color-white)',
  },
  textContainer: {
    fontFamily: 'var(--sr-font-secondary)',
  },
};

export const Meeting = () => {
  const {
    components: {
      panels: {
        game: { meeting: ls },
      },
    },
  } = useLabelsSchema();
  const { activeLocale } = useI18n();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showInviteBtn, setShowInviteBtnState] = useState(true);

  const usersList = useSelector((state) => state.usersList);
  const user = useSelector((state) => state.user);
  const game = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const [currentMeetingParticipantsCount, setCurrentMeetingParticipantsCount] =
    useState();

  useEffect(() => {
    if (window.gameClient) {
      window.gameClient.on('configuratorOpen', hideInviteButton);
      window.gameClient.on('configuratorClosed', showInviteButton);
    }
  }, [window.gameClient]);

  useEffect(() => {
    if (
      game?.currentRoom?.nextMapName === 'VolcanoIsland' &&
      game?.currentRoom?.prevMapName === 'Garage'
    )
      hideInviteButton();
    if (
      (game?.currentRoom?.nextMapName === 'Garage' &&
        game?.currentRoom?.prevMapName === 'VolcanoIsland') ||
      (game?.currentRoom?.nextMapName === 'Garage' &&
        game?.currentRoom?.prevMapName === 'Garage')
    )
      showInviteButton();
  }, [game?.currentRoom]);

  const showInviteButton = () => {
    const meetingWindow = document.querySelector(
      `#${window.agoraClientPrimary?.meetingDOMId}`
    );
    if (meetingWindow) {
      meetingWindow?.classList.remove('hide');
    }
    setShowInviteBtnState(true);
  };
  const hideInviteButton = () => {
    const meetingWindow = document.querySelector(
      `#${window.agoraClientPrimary?.meetingDOMId}`
    );
    if (meetingWindow) {
      meetingWindow?.classList.add('hide');
    }
    setShowInviteBtnState(false);
  };

  useEffect(() => {
    (() => {
      setCurrentMeetingParticipantsCount(
        document.querySelectorAll(
          `#${window.agoraClientPrimary?.meetingDOMId} > div.stream-list > div`
        ).length
      );
    })();
  }, [
    document.querySelectorAll(
      `#${window.agoraClientPrimary?.meetingDOMId} > div.stream-list > div`
    ).length,
  ]);

  const disableInviteButtonFlag = useMemo(
    () =>
      user?.currentRoom?.includes('Garage') &&
      currentMeetingParticipantsCount >= 8,
    [user?.currentRoom, currentMeetingParticipantsCount]
  );

  const closeInviteDialog = () => {
    setShowInviteDialog(false);
  };

  const handleInviteUsers = (invitedUsers) => {
    if (window.gameClient) {
      if (window.gameClient.getCurrentRoomType() === 'meeting') {
        dispatch(
          publishMeetingPoll({
            meetingRoomName: window.gameClient.getCurrentMeetingRoomName(),
            invites: invitedUsers.map((invitedUser) => ({
              sender: user.current.id,
              recipient: invitedUser,
            })),
          })
        );
      }
    }

    setShowInviteDialog(false);
  };

  return (
    <div>
      {!showInviteBtn && (
        <div className="personal-room__participants">
          <div className="personal-room__participants_info">
            <PhoneIcon />
            <span>{currentMeetingParticipantsCount}</span>
          </div>
          <div className="personal-room__participants_tooltip">
            {currentMeetingParticipantsCount <= 1
              ? 'Only you'
              : `${currentMeetingParticipantsCount} participants`}
          </div>
        </div>
      )}
      <div className={meetingPanelWrapper()}>
        {/* {user?.currentRoomType?.includes?.('meeting') && showInviteBtn && (
          <ActionButton
            disabled={disableInviteButtonFlag}
            styles={actionButtonStyles}
            text={ls.inviteText}
            onClick={() => setShowInviteDialog(true)}
          />
        )} */}
        <MeetingInviteDialog
          open={showInviteDialog}
          onDismiss={closeInviteDialog}
          onInvite={handleInviteUsers}
          users={usersList.list.filter((item) => item.id !== user.current.id)}
        />
      </div>
    </div>
  );
};
