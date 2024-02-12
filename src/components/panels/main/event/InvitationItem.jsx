import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DefaultButton,
  FontWeights,
  mergeStyles,
  Text,
} from 'office-ui-fabric-react';

import { isInGame } from 'utils/common';
import { answerMeetingPoll } from 'store/reducers/meetingPoll';
import { setPanelName, openPanel } from 'store/reducers/panel';
import { PinkButton } from 'components/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const invitationItemWrapper = mergeStyles({
  display: 'flex',
  flexDirection: 'column',
  margin: '0 2rem 1rem',
  padding: '1rem',
  background: 'var(--sr-color-transparent-b-01)',
  borderRadius: '.25rem',
});

const actionButtonWrapper = mergeStyles({
  display: 'flex',
});

export const InvitationItem = (props) => {
  const { invitation } = props;
  const {
    components: {
      panels: {
        main: {
          event: { invitationItem: ls },
        },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const { game, user, usersList } = useSelector((state) => state);

  const titleTextStyles = {
    root: {
      fontFamily: 'var(--sr-font-primary)',
      fontSize: '26px',
      fontWeight: FontWeights.regular,
      marginBottom: '1rem',
    },
  };

  const actionButtonStyles = {
    root: {
      margin: '0 1rem',
    },
  };

  const organizer = usersList.list.find(
    (item) => item.id === invitation.organizer
  );

  const handleClickJoin = () => {
    window?.agoraScreenShare?.stopScreen?.();
    window.gameClient?.teleportUserToMeetingRoom?.(invitation.meetingRoomName);

    dispatch(setPanelName(null));
    dispatch(openPanel(false));
  };

  const handleClickDecline = () => {
    dispatch(answerMeetingPoll(invitation.pollIndex, user.current.id));
    // dispatch(setPanelName(null));
    // dispatch(openPanel(false));
  };

  return organizer ? (
    <div className={invitationItemWrapper}>
      <Text styles={titleTextStyles}>{`${ls.invitationText(
        organizer.firstName,
        organizer.lastName
      )}`}</Text>
      <div className={actionButtonWrapper}>
        <PinkButton
          styles={actionButtonStyles}
          onClick={handleClickJoin}
          disabled={!isInGame(game.stage)}
          text={ls.joinButtonText}
        />
        <DefaultButton
          styles={actionButtonStyles}
          onClick={handleClickDecline}
          disabled={!isInGame(game.stage)}
          text={ls.declineButtonText}
        />
      </div>
    </div>
  ) : null;
};
