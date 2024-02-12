import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Icon } from '@fluentui/react';
import { newUserInfoMenu } from 'constants/web';
import history from 'utils/history';
import { setGameStage } from 'store/reducers/game';
import {
  timedSessionTransitionScreenDuration,
  timedSessionRedirectUrl,
} from 'utils/eventVariables';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const clockIconStyles = {
  root: {
    color: 'var(--sr-color-white)',
    fontSize: 24,
    fontWeight: 600,
  },
};

export const KickoutTransitionScreen = () => {
  const {
    components: {
      panels: {
        game: { kickout: ls },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const [timeLeft, setTimeLeft] = useState(
    timedSessionTransitionScreenDuration
  );
  const countdownTimerRef = useRef(null);
  const [mounted, setMounted] = useState(0);

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
    if (mounted) {
      document.body.classList.add('sr__FreezeFrame');
      countdownTimerRef.current = setInterval(computeTimeout, 1000);
    }
  }, [mounted]);

  useEffect(() => {
    if (timeLeft === 1) {
      clearInterval(countdownTimerRef.current);
      if (timedSessionRedirectUrl) {
        window.location.replace(timedSessionRedirectUrl);
      } else {
        closingCleaningUp();
        dispatch(setGameStage(null));
        window.location.reload(true);
      }
    }
  }, [timeLeft]);

  const computeTimeout = useCallback(() => {
    if (mounted) {
      setTimeLeft((c) => +c - 1);
    }
  }, [mounted]);

  const closingCleaningUp = () => {
    const menuList = newUserInfoMenu;
    for (let i = 0; i < menuList.length; i++) {
      if (document.getElementById(`helptext-${menuList[i]}`)) {
        document.getElementById(`helptext-${menuList[i]}`).style.display =
          'none';
      }
    }
  };

  return (
    <div id="player-control">
      <div className="fullScreenPanel freezeFramePanel transitionScreen ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-end">
        <div className="freezeFrame-Content ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center">
          {timeLeft ? (
            <>
              <Icon iconName="Clock" styles={clockIconStyles} />
              <p className="freezeFrame-Countdown ms-mb-1">
                {moment(timeLeft * 1000).format('mm:ss')}
              </p>
            </>
          ) : (
            <></>
          )}
          <p className="freezeFrame-Title ms-mb-1">{ls.kickedoutMessage}</p>
        </div>
      </div>
    </div>
  );
};
