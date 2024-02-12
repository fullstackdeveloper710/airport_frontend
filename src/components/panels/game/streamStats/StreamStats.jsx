import React from 'react';
import { useSelector } from 'react-redux';
import { PrimaryButton, Text } from 'office-ui-fabric-react';
import { useDispatch } from 'react-redux';
import { setShowStreamStats } from 'store/reducers/game';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const InfoItem = (props) => {
  const { name, value, textStyles } = props;

  return (
    <div className="ms-Flex ms-Flex-align-items-center ms-w-100">
      <Text styles={textStyles.name} nowrap>
        {name}
      </Text>
      <Text styles={textStyles.value} nowrap>
        {value}
      </Text>
    </div>
  );
};

const closeButtonStyles = {
  root: {
    marginTop: 16,
    background: 'var(--sr-color-transparent)',
    borderRadius: 8,
    border: '1px solid var(--sr-color-white)',
  },
  rootHovered: {
    opacity: '80%',
  },
  rootPressed: {
    opacity: '80%',
  },
  icon: {
    color: 'var(--sr-color-white)',
    fontSize: 12,
  },
};

const textStyles = {
  name: {
    root: {
      fontFamily: 'var(--sr-font-primary)',
      fontSize: '14px',
      fontWeight: 400,
      width: 150,
    },
  },
  value: {
    root: {
      fontFamily: 'var(--sr-font-primary)',
      fontSize: '16px',
      fontWeight: 600,
    },
  },
};

export const StreamStats = () => {
  const {
    components: {
      panels: {
        game: { streamStats: ls },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game);

  const handleClose = () => {
    dispatch(setShowStreamStats(false));
  };

  return (
    <div
      className={`ms-Flex ms-Flex-column ms-Flex-justify-content-between ms-p-1 roundPanel streamStatsPanel`}
    >
      <div className="ms-Flex ms-Flex-column ms-Flex-justify-content-center ms-Flex-grow-1">
        <InfoItem
          name={ls.vidResolutionLabel}
          value={
            game.streamStats.frameWidth !== undefined &&
            game.streamStats.frameHeight !== undefined
              ? `${game.streamStats.frameWidth}x${game.streamStats.frameHeight}`
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
        <InfoItem
          name={ls.receivedKbLabel}
          value={
            game.streamStats.bytesReceived !== undefined
              ? Math.round(
                  game.streamStats.bytesReceived / 1000
                ).toLocaleString()
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
        <InfoItem
          name={ls.framesDecodedLabel}
          value={
            game.streamStats.framesDecoded !== undefined
              ? game.streamStats.framesDecoded.toLocaleString()
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
        <InfoItem
          name={ls.packetsLostLabel}
          value={
            game.streamStats.packetsLost !== undefined
              ? game.streamStats.packetsLost.toLocaleString()
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
        <InfoItem
          name={ls.bitrateLabel}
          value={
            game.streamStats.bitrate !== undefined
              ? game.streamStats.bitrate.toLocaleString()
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
        <InfoItem
          name={ls.framerateLabel}
          value={
            game.streamStats.framerate !== undefined
              ? game.streamStats.framerate.toLocaleString()
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
        <InfoItem
          name={ls.framesDroppedLabel}
          value={
            game.streamStats.framesDropped !== undefined
              ? game.streamStats.framesDropped.toLocaleString()
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
        <InfoItem
          name={ls.netRttLabel}
          value={
            game.streamStats.currentRoundTripTime !== undefined
              ? (game.streamStats.currentRoundTripTime * 1000).toLocaleString()
              : ls.notAvailableLabel
          }
          textStyles={textStyles}
        />
      </div>
      <PrimaryButton onClick={handleClose} styles={closeButtonStyles}>
        {ls.closeStatsMenuText}
      </PrimaryButton>
    </div>
  );
};
