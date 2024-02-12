import clsx from 'clsx';
import React, { useEffect } from 'react';
import { IconButton, mergeStyles } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { GAME_STAGE_EVENT } from 'constants/game';
import { setGameStage, setGameData } from 'store/reducers/game';

const photoPanelWrapperClass = mergeStyles({
  position: 'absolute',
  left: '10%',
  top: '10%',
  width: '80%',
  height: '80%',
});

const photoClass = mergeStyles({
  objectFit: 'contain',
  height: '100%',
  width: '100%',
  borderRadius: '1rem',
});

const videoClass = mergeStyles({
  objectFit: 'contain',
  height: '100%',
  width: '100%',
  borderRadius: '1rem',
  background: 'var(--sr-color-white)',
});

const buttonStyles = {
  root: {
    width: '3rem',
    height: '3rem',
    background: 'var(--sr-color-transparent-05)',
    backdropFilter: 'blur(20px)',
    border: '3px solid var(--sr-color-border-game-media-player-buttonStyles)',
    borderRadius: '3rem',
    padding : '12px 7px 10px 12px',
    color: 'var(--sr-color-secondary)',
    position: 'absolute',
    right: '-1.5rem',
    top: '-1.5rem',
  },
  rootHovered: {
    background: 'var(--sr-color-transparent-05)',
  },
  icon: {
    fontSize: 20,
  },
  iconHovered: {
    color: 'var(--sr-color-primary)',
  },
};

export const MediaPlayer = () => {
  const dispatch = useDispatch();
  const { game } = useSelector((state) => state);

  useEffect(() => {
    if (!game.data || !game.data.url) {
      dispatch(setGameData({ url: null }));
      console.log("@@@ useEffect MediaPlayer")
      dispatch(setGameStage(GAME_STAGE_EVENT));
      window.gameClient.unmuteGame();
    }
    if (game.data.type === 'video') {
      window.gameClient.muteGame();
    }
  }, [game.data]);

  const handleClickClose = () => {
    dispatch(setGameData({ url: null }));
    console.log("@@@ handleClickClose MediaPlayer")
    dispatch(setGameStage(GAME_STAGE_EVENT));
    window.gameClient.unmuteGame();
  };

  return (
    <div className={clsx(photoPanelWrapperClass, 'roundPanel')}>
      {game.data.type === 'video' ? (
        <video
          width="100%"
          height="100%"
          className={videoClass}
          controls
          autoPlay
          playsInline
        >
          <source src={game.data.url} type="video/mp4" />
        </video>
      ) : (
        <img src={game.data.url} alt="Photo" className={photoClass} />
      )}
      <IconButton
        iconProps={{ iconName: 'Leave' }}
        styles={buttonStyles}
        onClick={handleClickClose}
      />
    </div>
  );
};
