import React, { useEffect, useRef } from 'react';
import { ActionButton } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { GAME_STAGE_EVENT } from 'constants/game';
import { setGameStage, setGameData } from 'store/reducers/game';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const actionButtonStyles = {
  root: {
    fontSize: 30,
    backgroundColor: 'var(--sr-color-white)',
    border: `1px solid var(--sr-color-white)`,
    margin: '8px 32px',
    padding: '8px',
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

export const IFrame = () => {
  const {
    components: {
      panels: {
        game: { iFrame: ls },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const { game } = useSelector((state) => state);
  const childWindowRef = useRef(null);

  const handleClickCloseBrowser = () => {
    dispatch(setGameData({ url: null }));
    console.log('@@@ handleClickCloseBrowser IFRAME');
    dispatch(setGameStage(GAME_STAGE_EVENT));
    if (childWindowRef.current) {
      childWindowRef.current.close();
    }
    childWindowRef.current = null;
  };

  useEffect(() => {
    if (game?.data?.url) {
      let left, top, width, height;
      if (window.gameClient && window.gameClient.getPlayerWindow()) {
        const playerRect = window.gameClient
          .getPlayerWindow()
          .getPlayerElementBoundingRect();
        top = playerRect.top + window.pageYOffset + 230;
        left = playerRect.left + window.pageXOffset + 30;
        width = window.gameClient.getPlayerWindow().style.width - 80;
        height = window.gameClient.getPlayerWindow().style.height - 260;

        window.gameClient.getPlayerWindow().disableMovement();
      } else {
        left = 0;
        top = 0;
        width = 640;
        height = 480;
      }

      const childWindow = window.open(
        game.data.url,
        'child-window',
        `scrollbars=yes,status=no,width=${width},height=${height},left=${left},top=${top}`
      );
      childWindowRef.current = childWindow;

      const focusHandler = () => {
        if (childWindow) {
          childWindow.close();
        }
      };
      window?.removeEventListener?.('focus', focusHandler);
      window.addEventListener('focus', focusHandler);

      const timer = setInterval(() => {
        if (childWindow.closed) {
          clearInterval(timer);
          dispatch(setGameData({ url: null }));
          console.log('@@@ setInterval IFRAME');
          dispatch(setGameStage(GAME_STAGE_EVENT));
          childWindowRef.current = null;
          if (window.gameClient && window.gameClient.getPlayerWindow()) {
            window.gameClient.getPlayerWindow().enableMovement();
          }
          window?.removeEventListener?.('focus', focusHandler);
        }
      }, 1000);
    }
  }, [game.data]);

  return (
    <div className="iFramePanel ms-Flex ms-Flex-column ms-Flex-align-items-center">
      {game.data && game.data.url && (
        <ActionButton
          styles={actionButtonStyles}
          text={ls.closeBrowserText}
          onClick={handleClickCloseBrowser}
        />
      )}
    </div>
  );
};
