import React, { Fragment } from 'react';
import { IconButton, TooltipHost } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { ActionButton } from '@fluentui/react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { setPlayerVisiblity } from 'store/reducers/screenShare';
import { EVENTNAME } from 'utils/eventVariables';

const actionButtonStyles = {
  root: {
    fontSize: 14,
    borderRadius: 8,
    padding: '8px',
    background: 'var(--sr-color-background-actionButtonStyles)',
    height: 'auto',
  },
  rootHovered: {
    backgroundColor: 'var(--sr-color-background-actionButtonStyles)',
    color: 'var(--sr-color-white)',
  },
};

const calloutProps = { gapSpace: 0 };

const hostStyles = {
  styles: {
    content: { color: 'var(--sr-color-primary-text)' },
  },
  calloutProps: {
    styles: {
      beak: { background: 'var(--sr-color-transparent)' },
      beakCurtain: { background: 'var(--sr-color-background-beakCurtain)' },
      calloutMain: { background: 'var(--sr-color-background-calloutMain)' },
    },
  },
};

export const ScreenShareControl = () => {
  const {
    components: {
      common: { screenShareControl: ls },
    },
  } = useLabelsSchema();
  const { active, streamerData, audioEnabled, audioAllowed, playerVisible } =
    useSelector((state) => state.screenShare);
  const currentUser = useSelector((state) => state.user.current);
  const dispatch = useDispatch();
  const is_presenting = currentUser.eventUserId
    ? streamerData?.presenter === currentUser.eventUserId
    : false;
  const is_app_allowed_audio =
    process.env.REACT_APP_SCREENSHARE_ALLOW_AUDIO === 'true';

  const stopPresentation = () => {
    if (is_presenting) {
      if (window.agoraScreenShare) {
        window.agoraScreenShare.stopScreen();
      }
    } else {
      if (window.gameClient) {
        window.gameClient.closeSmartScreen();
      }
    }
  };

  const toggleAudio = () => {
    if (window.agoraScreenShare) {
      window.agoraScreenShare.toggleAudio();
    }
  };

  const showScreenSharePlayer = () => {
    const player = document.querySelector('#screen-share-player');
    player.style.display = 'block';
    player?.classList.add('hide');
    setTimeout(() => {
      player?.classList.add('visible');
    }, 900);
    dispatch(setPlayerVisiblity(true));
  };

  return (
    <Fragment>
      {
        !!active 
        && EVENTNAME?.toLowerCase()?.indexOf('infosys events') === -1
        && (
        <Fragment>
          <div
            className="ms-Flex ms-Flex-row ms-Flex-align-items-center roundPanel"
            style={{
              padding: '8px 10px',
              color: 'var(--sr-color-white)',
              margin: '0 auto',
            }}
          >
            <div className="ms-mr-1">
              {is_presenting ? ls.presenting : ls.notPresenting}
            </div>
            <div className="ms-mr-1">
              {!playerVisible && (
                <TooltipHost
                  content={ls.fullScreen.tooltipHost.content}
                  calloutProps={calloutProps}
                  tooltipProps={hostStyles}
                >
                  <IconButton
                    toggle
                    iconProps={{ iconName: 'ChromeFullScreen' }}
                    allowDisabledFocus
                    onClick={showScreenSharePlayer}
                  />
                </TooltipHost>
              )}
            </div>
            {is_app_allowed_audio && is_presenting && (
              <div className="ms-mr-1">
                <TooltipHost
                  content={
                    audioAllowed
                      ? audioEnabled
                        ? ls.audio.mute
                        : ls.audio.unmute
                      : ls.audio.audioNotAllowed
                  }
                  calloutProps={calloutProps}
                  tooltipProps={hostStyles}
                >
                  <IconButton
                    toggle
                    disabled={!audioAllowed}
                    iconProps={{
                      iconName: audioEnabled ? 'Microphone' : 'MicOff',
                    }}
                    allowDisabledFocus
                    onClick={toggleAudio}
                  />
                </TooltipHost>
              </div>
            )}
            <ActionButton
              styles={actionButtonStyles}
              text={is_presenting ? ls.endConference : ls.exitConference}
              onClick={stopPresentation}
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};
