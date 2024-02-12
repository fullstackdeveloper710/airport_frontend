import React from 'react';
import { IconButton, ProgressIndicator, TooltipHost } from '@fluentui/react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const playButtonStyles = {
  root: {
    marginRight: '4px',
  },
};

const videoPlayerControlProgressStyles = {
  root: {
    width: '100%',
  },
  progressTrack: {
    background: 'var(--sr-color-white)',
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

export const VideoPlayerControl = ({
  videoDuration,
  videoTime,
  videoPlaying,
  videoFinished,
  onTogglePlay,
  onStopVideo,
  onPlayAgain,
  onSeek,
}) => {
  const {
    components: {
      common: {
        videoPlayerControl: {
          tooltipHost: { content: ls },
        },
      },
    },
  } = useLabelsSchema();

  const handleClick = (e) => {
    if (!videoFinished) {
      const currentTargetRect = e.currentTarget.getBoundingClientRect();
      const eventOffsetX = e.pageX - currentTargetRect.left;

      onSeek((videoDuration * eventOffsetX) / currentTargetRect.width);
    }
  };

  return (
    <div
      className="ms-Flex ms-Flex-row ms-Flex-align-items-center roundPanel"
      style={{ padding: '4px 16px 4px 4px' }}
    >
      <TooltipHost
        content={'Stop Video'}
        calloutProps={calloutProps}
        tooltipProps={hostStyles}
      >
        <IconButton
          iconProps={{
            iconName: 'StopSolid',
            style: { fontSize: '13px' },
          }}
          style={{ marginRight: '-12px' }}
          onClick={onStopVideo}
          styles={playButtonStyles}
        />
      </TooltipHost>
      {!videoFinished ? (
        <TooltipHost
          content={videoPlaying ? ls.pause : ls.play}
          calloutProps={calloutProps}
          tooltipProps={hostStyles}
        >
          <IconButton
            iconProps={{
              iconName: videoPlaying ? 'Pause' : 'Play',
            }}
            onClick={onTogglePlay}
            styles={playButtonStyles}
          />
        </TooltipHost>
      ) : (
        <TooltipHost
          content={'Play Again'}
          calloutProps={calloutProps}
          tooltipProps={hostStyles}
        >
          <IconButton
            iconProps={{
              iconName: 'RepeatAll',
            }}
            onClick={onPlayAgain}
            styles={playButtonStyles}
          />
        </TooltipHost>
      )}

      <div
        onClick={handleClick}
        className="ms-w-100"
        style={{
          cursor: 'pointer',
        }}
      >
        {!videoFinished ? (
          <ProgressIndicator
            barHeight={5}
            percentComplete={videoTime / videoDuration}
            styles={videoPlayerControlProgressStyles}
          />
        ) : (
          <ProgressIndicator
            barHeight={5}
            percentComplete={100}
            styles={videoPlayerControlProgressStyles}
          />
        )}
      </div>
    </div>
  );
};
