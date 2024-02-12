import { Icon, PrimaryButton } from '@fluentui/react';
import moment from 'moment';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCloseTimeout } from 'store/reducers/game';
import { GAME_STAGE_FREEZE_FRAME } from 'constants/game';
import { setPanelName, openPanel } from 'store/reducers/panel';
import { newUserInfoMenu } from 'constants/web';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { logout } from 'store/reducers/user';
import { enableVOG } from 'utils/eventVariables';

const resumeBtnStyles = {
  root: {
    padding: '12px 24px',
    height: 'auto',
  },
  label: {
    fontFamily: 'var(--sr-font-tertiary)',
    fontSize: 16,
  },
};

const clockIconStyles = {
  root: {
    color: 'var(--sr-color-white)',
    fontSize: 24,
    fontWeight: 600,
  },
};

export const FreezeFrame = () => {
  const {
    components: {
      panels: {
        game: { freezeFrame: ls },
      },
    },
  } = useLabelsSchema();
  const game = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState(0);
  const countdownTimerRef = useRef(null);

  const [mounted, setMounted] = useState(0);
  if (window.gameClient) {
    window.gameClient.isFrozen = true;
  }

  function formatMillisecondsToMMSS(milliseconds) {
    const duration = moment.duration(milliseconds);
    const minutes = Math.floor(duration.asMinutes());
    const seconds = Math.floor(duration.asSeconds()) % 60;
    
    const formattedTime = moment({ minutes, seconds }).format('mm:ss');
    return formattedTime;
  }

  useEffect(() => {
    (() => {
      setMounted(true);
    })();
    return () => {
      setMounted(false);
      document.body.classList.remove('sr__FreezeFrame');
      clearInterval(countdownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (game.closeTimeout) {
      document.body.classList.add('sr__FreezeFrame');
      if (mounted) {
        (() => {
          setTimeLeft(game.closeTimeout);
        })();
      }
      countdownTimerRef.current = setInterval(computeTimeout, 1000);
    }
  }, [game && game.closeTimeout]);
  useEffect(() => {
    if (timeLeft === 1) {
      clearInterval(countdownTimerRef.current);
      closingCleaningUp();
    }
  }, [timeLeft]);

  const computeTimeout = useCallback(() => {
    if (mounted) {
      setTimeLeft((c) => +c - 1);
    }
  }, [mounted]);

  const closingCleaningUp = () => {
    if (window.gameClient) {
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.disconnect(() => {
          delete window.agoraClientPrimary;
        });
      }

      if (enableVOG && window.agoraClientSecondary) {
        window.agoraClientSecondary.disconnect(() => {
          delete window.agoraClientSecondary;
        });
      }

      if (window.agoraClientThird) {
        window.agoraClientThird.disconnect(() => {
          delete window.agoraClientThird;
        });
      }
      if (window.agoraScreenShare) {
        window.agoraScreenShare.disconnect(() => {
          delete window.agoraScreenShare;
        });
      }
      window.gameClient.endGame();
      timeoutLogout();
      delete window.gameClient;
    }
    const menuList = newUserInfoMenu;
    for (let i = 0; i < menuList.length; i++) {
      if (document.getElementById(`helptext-${menuList[i]}`)) {
        document.getElementById(`helptext-${menuList[i]}`).style.display =
          'none';
      }
    }
  };

  const timeoutLogout = () => {
    window?.gameClient?.logUserAction?.({
      eventName: 'LOGOUT',
      eventSpecificData: JSON.stringify({
        method: 'Timeout',
      }),
      beforeState: JSON.stringify({
        mapName: game?.currentRoom?.nextMapName,
      }),
      afterState: null,
    });
    dispatch(setPanelName(null));
    dispatch(openPanel(false));
    window.onbeforeunload = null;
    // async logout
    setTimeout(() => {
      dispatch(logout());
      window.location.reload()
    }, 1000);
  };

  const handleClickResume = () => {
    dispatch(setCloseTimeout(null));
    clearInterval(countdownTimerRef.current);

    if (window.gameClient) {
      window.gameClient.unfreezeFrame(GAME_STAGE_FREEZE_FRAME);
    }
  };

  return (
    <div className="fullScreenPanel freezeFramePanel ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-end">
      <div className="freezeFrame-Content ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center">
        {timeLeft ? (
          <>
            <Icon iconName="Clock" styles={clockIconStyles} />
            <p className="freezeFrame-Countdown ms-mb-1">
              {formatMillisecondsToMMSS(timeLeft * 1000)}
            </p>
          </>
        ) : (
          <></>
        )}
        <p className="freezeFrame-Title ms-mb-1">{ls.afkMessage}</p>
        {timeLeft ? (
          <p className="freezeFrame-Description ms-mb-1">
            {ls.resumeAfkMessage}
          </p>
        ) : (
          <></>
        )}
        <PrimaryButton
          styles={resumeBtnStyles}
          onClick={handleClickResume}
          className="ms-mt-1"
        >
          {ls.resumeExperienceText}
        </PrimaryButton>
      </div>
      <p className="freezeFrame-Footer ms-mb-2">{ls.pauseMessage}</p>
    </div>
  );
};
