import React, { useState, useEffect, useRef, Fragment } from 'react';
import { IconButton, TooltipHost } from '@fluentui/react';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const USE_FULL_SCREEN = 'useFullscreen';

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

const addonButtonStyles = {
  root: {
    background: 'var(--sr-color-transparent)',
  },
  icon: {
    fontSize: 20,
  },
  rootHovered: {
    background: 'var(--sr-color-primary)',
    color: 'var(--sr-color-white)',
  },
  rootPressed: {
    background: 'var(--sr-color-primary)',
    color: 'var(--sr-color-white)',
  },
  iconHovered: {
    color: 'var(--sr-color-white)',
  },
};

export const FullScreen = () => {
  const {
    components: {
      panels: {
        game: { fullScreen: ls },
      },
    },
  } = useLabelsSchema();
  const getFullscreen = localStorage.getItem(USE_FULL_SCREEN);
  const [isFullScreen, setFullScreen] = useState(!!(getFullscreen === 'Yes'));
  const [showRemainder, setShowRemainder] = useState(false);
  const [isInLandscape, setIsInLandscape] = useState(false);
  const shownRemainder = useRef(false);

  const closeRemainder = () => {
    setShowRemainder(false);
    shownRemainder.current = true;
  };

  useEffect(() => {
    if (getFullscreen === 'Yes') {
      toggleFullScreen();

      window?.gameClient?.logUserAction?.({
        eventName: 'FULLSCREEN_OFF',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    } else {
      window?.gameClient?.logUserAction?.({
        eventName: 'FULLSCREEN_ON',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    }
    document.addEventListener('fullscreenchange', fullscreenchanged);
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenchanged);
    };
  }, []);

  useEffect(() => {
    if (isInLandscape && !isFullScreen && !shownRemainder.current) {
      (() => {
        setShowRemainder(true);
      })();
    }
  }, [isInLandscape, isFullScreen]);

  useEffect(() => {
    (() => {
      setIsInLandscape(window.screen?.orientation?.angle === 90);
    })();
  }, [window.screen?.orientation?.angle]);

  const fullscreenchanged = () => {
    setFullScreen(!!document.fullscreenElement);
  };

  useEffect(() => {
    localStorage.setItem(USE_FULL_SCREEN, isFullScreen ? 'Yes' : 'No');
    if (isFullScreen) {
      closeRemainder();
    }
  }, [isFullScreen]);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        document
          .querySelector('body')
          .requestFullscreen({ navigationUI: 'show' })
          .then(() => {
            setFullScreen(true);
          });
      } else {
        document.exitFullscreen().then(() => {
          setFullScreen(false);
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Fragment>
      <div className="full-screen-button">
        <TooltipHost
          content={isFullScreen ? ls.exitFullScreenText : ls.fullScreenText}
          calloutProps={calloutProps}
          tooltipProps={hostStyles}
        >
          <IconButton
            styles={addonButtonStyles}
            toggle
            iconProps={{
              iconName: isFullScreen ? 'BackToWindow' : 'ChromeFullScreen',
            }}
            allowDisabledFocus
            onClick={toggleFullScreen}
          />
        </TooltipHost>
      </div>
      {showRemainder && (
        <div className="fullscreen-remainder-wrapper roundPanel">
          <span>{ls.enableFullScreenText}</span>
          <span className="close-btn" onClick={closeRemainder}>
            <FontIcon
              aria-label="ChromeClose"
              iconName="ChromeClose"
              style={{ fontSize: 10 }}
            />
          </span>
        </div>
      )}
    </Fragment>
  );
};
