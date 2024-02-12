import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { List, mergeStyles, PrimaryButton } from '@fluentui/react';
import { useDeviceMedia } from 'hooks/useDeviceMedia';
import BeckonEmoji from '../../../../assets/images/palm-up.png'
import ThumbsUpEmoji from '../../../../assets/images/thumbs-up.png';
import ThumbsDownEmoji from '../../../../assets/images/thumbs-down.png';
import ClapEmoji from '../../../../assets/images/clapping-hands.png';
import WaveEmoji from '../../../../assets/images/waving-hand.png';
import SplayeHanddEmoji from '../../../../assets/images/splayed-hand.png';
import SaluteEmoji from '../../../../assets/images/salute.png'
import SmilyEmoji from '../../../../assets/images/smily.png'

export const Emotes = () => {
  const game = useSelector((state) => state.game);
  const { isDesktop, isTablet, buttonsTextSize, buttonsMargin } =
    useDeviceMedia();
  const maxHeight = isDesktop ? 900 : isTablet ? 600 : 400;
  const marginTop = isDesktop ? 100 : isTablet ? 40 : 10;

  const emotesList = {
    "Beckon": BeckonEmoji,
    "Clap": ClapEmoji,
    "Hello": WaveEmoji,
    "HighWave": SplayeHanddEmoji,
    "No": ThumbsDownEmoji,
    "Salute": SaluteEmoji,
    "Yes": ThumbsUpEmoji,
  }

  const buttonStyles = useMemo(
    () => ({
      root: {
        borderColor: 'none',
        color: 'var(--sr-color-white)',
        background: 'var(--sr-color-primary)',
        transition: '0.3s',
        margin: buttonsMargin,
        width: '80%',
        fontSize: buttonsTextSize,
      },
      rootHovered: {
        borderColor: 'var(--sr-color-white)',
        background: 'var(--sr-color-black)',
      },
      label: {
        fontWeight: 300,
      },
    }),
    [buttonsMargin, buttonsTextSize]
  );

  const containerClass = mergeStyles({
    overflow: 'auto',
    zIndex: 100,
    maxHeight: maxHeight,
    marginLeft: 60,
    marginTop: marginTop,
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
  });

  const onClickEmote = (emote) => {
    window?.gameClient?.playEmote?.(emote);
  };

  const onRenderCell = (item) => {
    console.log(item)
    return (
      <img src={emotesList[item] || SmilyEmoji} alt="" className="emote"
        onClick={() => onClickEmote(item)}
      />
    );
  };

  return (
    <div className="emotesPanel">
      <div className='emotesContainer'>
        <div className="emotesHeading">Reactions</div>
        <List className='emotesList' items={game.data.emotes.list} onRenderCell={onRenderCell} />
      </div>
    </div>
  );
};
