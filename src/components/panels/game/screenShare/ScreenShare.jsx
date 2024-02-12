import React, { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ActionButton } from '@fluentui/react';
import {
  isScreenSharedInCurrentRoom,
  setClosedModal,
} from 'store/reducers/screenShare';
import { DialogBox } from 'components/common';
import ReactTooltip from 'react-tooltip';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { toggleScreenSharePlayerHandler } from 'utils/screenShareUtils';

const closeScreenSharePlayer = {
  root: {
    fontSize: 30,
  },
  icon: {
    color: 'var(--sr-color-white)',
    transition: 'all 0.35s',
    textShadow: '0 0 6px black',
  },
  iconHovered: {
    textShadow: '0 0 6px var(--sr-color-primary)',
    color: 'var(--sr-color-primary)',
  },
};

const actionButtonStyles = {
  root: {
    fontSize: 24,
    border: `1px solid var(--sr-color-white)`,
    margin: '8px 32px',
    padding: '8px 0',
    height: 50,
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

export const ScreenShare = () => {
  const {
    components: {
      panels: {
        game: { screenShare: ls },
      },
    },
  } = useLabelsSchema();
  const { active, streamerData, closeModal, playerVisible } = useSelector(
    (state) => state.screenShare
  );
  const { is_in_stage } = useSelector((state) => state.teleportRequestPoll);
  const currentUser = useSelector((state) => state.user.current);
  const { currentRoom } = useSelector((state) => state.game);
  const [maximizedPlayer, togglePlayerMaximizeState] = useState(false);
  const dispatch = useDispatch();
  const is_presenting = currentUser.eventUserId
    ? streamerData?.presenter === currentUser.eventUserId
    : false;
  let is_in_meeting_room = false;

  if (!is_presenting) {
    is_in_meeting_room = isScreenSharedInCurrentRoom(streamerData);
  }

  useEffect(() => {
    if (active && streamerData?.room_name && !is_presenting) {
      toggleScreenSharePlayerHandler(true, true);
    }
  }, [active, streamerData]);

  const stopScreen = () => {
    if (is_presenting) {
      toggleScreenSharePlayerHandler(false, true);
      window?.agoraScreenShare?.stopScreen?.();
    }
  };

  const closingModal = () => {
    dispatch(setClosedModal(false));
  };

  return (
    <Fragment>
      <div
        id="screen-share-player"
        className={maximizedPlayer ? 'maximized' : ''}
      >
        <p>
          <ActionButton
            className="ms-Flex ms-Flex-justify-content-center"
            styles={closeScreenSharePlayer}
            data-tip
            data-for="minimizeScreenShare"
            iconProps={{ iconName: 'ChromeMinimize' }}
            onClick={() => toggleScreenSharePlayerHandler(false, true)}
          />
          <ActionButton
            className="ms-Flex ms-Flex-justify-content-center"
            styles={closeScreenSharePlayer}
            iconProps={{
              iconName: maximizedPlayer ? 'BackToWindow' : 'ChromeFullScreen',
            }}
            onClick={() => togglePlayerMaximizeState((prev) => !prev)}
          />
        </p>
        <div />
      </div>
      <ReactTooltip id="minimizeScreenShare" place="bottom" effect='solid'>
        <div>{is_in_stage ? "Minimize Lecture" : "Minimize Sharing"}</div>
      </ReactTooltip>
      <div className="lecture">
        {active && is_presenting && !playerVisible && (
          <div className="gamePanel roundPanel ms-Flex ms-Flex-column">
            <div className="ms-Flex ms-Flex-column">
              <ActionButton
                className="ms-Flex ms-Flex-justify-content-center"
                styles={actionButtonStyles}
                iconProps={{ iconName: 'ChromeClose' }}
                text={is_in_stage ? ls.stopLectureText : ls.stopSharingText}
                onClick={stopScreen}
              />
            </div>
            <div className="ms-Flex ms-Flex-column">
              <ActionButton
                className="ms-Flex ms-Flex-justify-content-center continue-lecture-btn"
                styles={actionButtonStyles}
                iconProps={{ iconName: 'ScreenCast' }}
                text={is_in_stage ? ls.continueLectureText : ls.continueSharingText}
                onClick={() => toggleScreenSharePlayerHandler(true, true)}
              />
            </div>
          </div>
        )}

        {active && is_in_meeting_room && !playerVisible && (
          <div className="gamePanel roundPanel ms-Flex ms-Flex-column">
            <div className="ms-Flex ms-Flex-column">
              <ActionButton
                className="ms-Flex ms-Flex-justify-content-center continue-lecture-btn"
                styles={actionButtonStyles}
                iconProps={{ iconName: 'ScreenCast' }}
                text={currentRoom?.nextMapName === "LectureHall" ? ls.continueLectureText : ls.continueSharingText}
                onClick={() => toggleScreenSharePlayerHandler(true, true)}
              />
            </div>
          </div>
        )}
      </div>

      <DialogBox
        onOkay={closingModal}
        showClose={false}
        hidden={!closeModal}
        header={ls.attentionText}
        text={ls.presentationStoppedByPresenterMessage}
      />
    </Fragment>
  );
};
