import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  GAME_STAGE_ENTERING,
  GAME_STAGE_EVENT,
  GAME_STAGE_MEETING,
  GAME_STAGE_IFRAME,
  GAME_STAGE_MEDIA,
  GAME_STAGE_SHOW_PROFILE,
  GAME_STAGE_NO_SERVERS,
  GAME_STAGE_HANG_TIGHT,
  GAME_STAGE_INSTANCE_ERROR,
  GAME_STAGE_DUPLICATE_SESSION,
  GAME_STAGE_SLEEPING_SERVERS,
  GAME_STAGE_ERROR,
  GAME_STAGE_SMART_SCREEN,
  GAME_STAGE_FREEZE_FRAME,
} from 'constants/game';
import FileService from 'services/fileService';
import {
  answerMeetingPoll,
  dismissMeetingPoll,
} from 'store/reducers/meetingPoll';
import {
  acceptAudioChatPoll,
  declineAudioChatPoll,
} from 'store/reducers/audioChatPoll';
import {
  acceptFollowRequestPoll,
  declineFollowRequestPoll,
  removeFollowRequest,
  endFollowRequestPoll,
} from 'store/reducers/followRequestPoll';
import { FollowRequest, UnFollowingPopup } from './followRequest';
import { setMessage } from 'store/reducers/message';
import {
  setScreenshot,
  setMeetingRoom,
} from 'store/reducers/game';
import { endAudioChatPoll } from 'store/reducers/audioChatPoll';
import { isInGame, generateTweetsPage } from 'utils/common';
import { IFrame } from './iframe';
import { Event } from './event';
import { Loading } from './loading';
import { MediaPlayer } from './mediaPlayer';
import { Meeting } from './meeting';
import { Profile } from './profile';
import { Error } from './error';
import { MeetingInvitationDialog } from 'components/dialogs';
import { AudioCallRequest, AudioCallPopUp } from './audioCallRequest';
import { TeleportRequest } from './teleportRequest';
import { Screenshot } from './screenshot';
import { SmartScreen } from './smartScreen';
import { StreamStats } from './streamStats';
import {
  NoServers,
  Ec2ServerError,
  HangTight,
  DuplicateSession,
} from './noServers';
import { ScreenShare } from 'components/panels/game/screenShare';
import { SaveDeviceModal, PermissionModal } from './deviceSelectionModal';
import { GodList } from './godList';
import {
  shareContentTitle,
  shareContentBody,
  shareContentHashtag,
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
} from 'utils/eventVariables';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { FreezeFrame } from './freezeFrame';
import { StyleStudio } from './styeStudio';

export const GamePanel = () => {
  const {
    components: {
      panels: {
        game: { gamePanel: ls },
      },
    },
  } = useLabelsSchema();
  const {
    game,
    audioChatPoll,
    meetingPoll,
    user,
    usersList,
    followRequestPoll,
    screenShare,
    styleStudio
  } = useSelector((state) => state);

  const [meetingInvitation, setMeetingInvitation] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);


  const dispatch = useDispatch();
  useEffect(() => {
    if (game.stage === GAME_STAGE_MEETING) {
      dispatch(setMeetingRoom(true));
    } else if (game.stage === GAME_STAGE_ENTERING) {
      dispatch(setMeetingRoom(false));
    }
  });

  useEffect(() => {
    if (game.stage === GAME_STAGE_MEETING) {
      console.log('GAME_STAGE_MEETING', game.stage);
      dispatch(setMeetingRoom(true));
    } else if (game.stage === GAME_STAGE_ENTERING) {
      console.log('GAME_STAGE_MEETING', game.stage);
      dispatch(setMeetingRoom(false));
    }
  }, [game.stage]);

  // Check Meeting Invites
  useEffect(() => {
    const pendingInvitation = meetingPoll.list.find(
      (item) => !item.dismissed && item.sender !== user.current.id
    );
    if (pendingInvitation) {
      setMeetingInvitation(pendingInvitation);
    }
  }, [meetingPoll && meetingPoll.list, game.stage]);

  const panels = {
    [GAME_STAGE_EVENT]: {
      panelContent: <Event />,
    },
    [GAME_STAGE_IFRAME]: {
      panelContent: <IFrame />,
    },
    [GAME_STAGE_MEDIA]: {
      panelContent: <MediaPlayer />,
    },
    [GAME_STAGE_NO_SERVERS]: {
      panelContent: <NoServers />,
    },
    [GAME_STAGE_INSTANCE_ERROR]: {
      panelContent: <Ec2ServerError />,
    },
    [GAME_STAGE_DUPLICATE_SESSION]: {
      panelContent: <DuplicateSession />,
    },
    [GAME_STAGE_HANG_TIGHT]: {
      panelContent: <HangTight />,
    },
    [GAME_STAGE_SLEEPING_SERVERS]: {
      panelContent: <NoServers sleepingServers />,
    },
    [GAME_STAGE_SHOW_PROFILE]: {
      panelContent: <Profile />,
    },
    [GAME_STAGE_SMART_SCREEN]: {
      panelContent: <SmartScreen />,
    },
    [GAME_STAGE_ERROR]: { panelContent: <Error /> },
    [GAME_STAGE_ENTERING]: { panelContent: <Loading /> },
    [GAME_STAGE_FREEZE_FRAME]: { panelContent: <FreezeFrame /> }
  };

  const handleDismissInvitationDialog = () => {
    dispatch(dismissMeetingPoll(meetingInvitation.pollIndex));
    setMeetingInvitation(null);
  };

  const handleAcceptInvitationDialog = () => {
    if (window.agoraScreenShare) {
      window.agoraScreenShare.stopScreen();
    }
    if (window.gameClient) {
      window.gameClient.teleportUserToMeetingRoom(
        meetingInvitation.meetingRoomName
      );
    }
    dispatch(dismissMeetingPoll(meetingInvitation.pollIndex));
    setMeetingInvitation(null);
  };

  const handleDeclineInvitationDialog = () => {
    dispatch(answerMeetingPoll(meetingInvitation.pollIndex, user.current.id));
    setMeetingInvitation(null);
  };

  const handleCancelAudioCall = (invite) => {
    dispatch(declineAudioChatPoll(invite));
  };

  const handleDeclineAudioCall = (invite) => {
    dispatch(declineAudioChatPoll(invite));
  };

  const handleAcceptAudioCall = (invite) => {
    dispatch(acceptAudioChatPoll(invite));
  };

  const handleUnfollowTourGuide = () => {
    if (window.gameClient) {
      if (window.agoraClientPrimary) {
        window.followRequestActive = false;
        window.gameClient.triggerEvent('room-joined', {
          roomType: window.gameClient.getCurrentRoomType(),
          roomName: window.gameClient.getCurrentRoomName(),
          screenShare,
        });
      }
      window.gameClient.unfollowTourGuide();
      window?.gameClient?.logUserAction?.({
        eventName: 'TOUR_GUIDE_ENDED',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    }
    dispatch(endFollowRequestPoll());
  };

  const handleCancelTourGuide = (invite) => {
    dispatch(declineFollowRequestPoll(invite));
  };

  const handleDeclineFollowRequest = (invite) => {
    dispatch(declineFollowRequestPoll(invite));
  };

  const handleRemoveFollowingUser = (userId) => {
    dispatch(removeFollowRequest(userId, user.current.eventUserId));
  };

  const handleAcceptFollowRequest = async (invite) => {
    let senderIsOnline = usersList.list.filter(
      (item) =>
        usersList.onlineUsers.includes(item.eventUserId) &&
        item.eventUserId === invite.sender
    ).length;
    let recipientIsOnline = usersList.list.filter(
      (item) =>
        usersList.onlineUsers.includes(item.eventUserId) &&
        item.eventUserId === invite.recipient
    ).length;

    if (senderIsOnline === 0 || recipientIsOnline === 0) {
      dispatch(
        setMessage({
          message: ls.requesterIsOfflineMessage,
        })
      );
      dispatch(declineFollowRequestPoll(invite));
      return false;
    }
    const is_presenter = user.current.roles.includes('ROLE_PRESENTER');

    if (window.followRequestActive && !is_presenter) {
      handleUnfollowTourGuide();
      await new Promise((res) => setTimeout(res, 2000));
    }

    if (window.gameClient) {
      let guide;
      if (invite.sender_role === 'presenter') {
        guide = invite.sender;
      } else {
        guide = invite.recipient;
      }

      //Sending API Request to start Following Tour Guide
      if (guide !== user.current.eventUserId) {
        window.gameClient.startFollowingTourGuide(guide);
      }
    }
    dispatch(acceptFollowRequestPoll(invite));

    window?.gameClient?.logUserAction?.({
      eventName: 'TOUR_GUIDE_STARTED',
      eventSpecificData: null,
      beforeState: null,
      afterState: null,
    });
  };

  const handleShareOnTwitter = async () => {
    if (game.screenshot) {
      try {
        window?.gameClient?.logUserAction?.({
          eventName: 'SCREENSHOT_SHARE',
          eventSpecificData: JSON.stringify({
            mapName: game.currentRoom?.nextMapName,
          }),
          beforeState: null,
          afterState: null,
        });

        // NOTE: The second parameter in this upload method expects a display name as opposed
        // to a file name. Please do not append the image file extension to this value or the
        // api will mistake your endpoint request for a request to a file that does not exist.
        setImageUploading(true);
        const response = await FileService.uploadBase64(
          game.screenshot.replace(/^data:image\/\w+;base64,/, ''),
          'screenshot'
        );

        // TODO: The value of the CDN and domain should be pulled from environment variables.
        // These values could change in the future and we need to be able to update them
        // quickly and in a single location.
        const imageURL = response.url.replace(
          'dh2dge5cj9ndn.cloudfront.net',
          'share.surrealevents.com'
        );

        const html = generateTweetsPage(
          imageURL,
          shareContentTitle,
          `${shareContentBody} #${shareContentHashtag}`
        );
        var blob = new Blob([html], { type: 'text/html' });
        var fileOfBlob = new File([blob], 'screenshot.html');

        let formData = new FormData();
        formData.append('file', fileOfBlob);
        formData.append('displayName', ls.screenshotLabel);

        const res = await FileService.uploadFile(formData);

        const tweetURL = res.url.replace(
          'dh2dge5cj9ndn.cloudfront.net',
          'share.surrealevents.com'
        );

        window.open(
          `https://twitter.com/intent/tweet?url=${tweetURL}&text=${shareContentBody}&hashtags=${shareContentHashtag}`
        );
        setImageUploading(false);
        dispatch(setScreenshot(null));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEndCall = () => {
    dispatch(endAudioChatPoll());
  };

  const is_in_game = isInGame(game.stage);

  return (
    <div id="player-control">
      {game.stage && panels[game.stage] && panels[game.stage].panelContent}

      {game.meetingRoom &&
        (enableCameraAccess ||
          enableMicAccess ||
          ((enablePresenterCameraAccess || enablePresenterMicAccess) &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))) ? (
        <Meeting />
      ) : null}

      {meetingInvitation && (
        <MeetingInvitationDialog
          open={!!meetingInvitation}
          onDismiss={handleDismissInvitationDialog}
          onAccept={handleAcceptInvitationDialog}
          onDecline={handleDeclineInvitationDialog}
          sender={usersList.list.find(
            (item) => item.id === meetingInvitation.sender
          )}
        />
      )}
      {is_in_game && !!audioChatPoll.invites.length && (
        <AudioCallRequest
          requests={audioChatPoll.invites}
          onCancel={handleCancelAudioCall}
          onAccept={handleAcceptAudioCall}
          onDecline={handleDeclineAudioCall}
        />
      )}
      {is_in_game && <TeleportRequest />}

      {is_in_game &&
        (!!followRequestPoll.invites.length || followRequestPoll.active) && (
          <FollowRequest
            requests={followRequestPoll.invites}
            onCancel={handleCancelTourGuide}
            onAccept={handleAcceptFollowRequest}
            onDecline={handleDeclineFollowRequest}
            removeUser={handleRemoveFollowingUser}
            onUnfollow={handleUnfollowTourGuide}
          />
        )}

      {is_in_game && audioChatPoll.active && (
        <AudioCallPopUp onEndCall={handleEndCall} />
      )}

      {is_in_game && followRequestPoll.active && (
        <UnFollowingPopup onUnfollow={handleUnfollowTourGuide} />
      )}
      {is_in_game && game.screenshot && (
        <Screenshot
          screenshot={game.screenshot}
          onShare={handleShareOnTwitter}
          loading={imageUploading}
        />
      )}

      {is_in_game && game.showStreamStats && <StreamStats />}

      {is_in_game &&
        (enableCameraAccess ||
          enableMicAccess ||
          ((enablePresenterCameraAccess || enablePresenterMicAccess) &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
          <SaveDeviceModal />
        )}
      {is_in_game &&
        (enableCameraAccess ||
          enableMicAccess ||
          ((enablePresenterCameraAccess || enablePresenterMicAccess) &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
          <PermissionModal />
        )}

      <ScreenShare />

      {is_in_game && <GodList />}

      {styleStudio.isStyleStudioOpen && <StyleStudio />}
    </div>
  );
};
