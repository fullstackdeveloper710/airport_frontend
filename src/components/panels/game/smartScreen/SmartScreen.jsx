import React, { Fragment, useEffect } from 'react';
import { ActionButton } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { VideoPlayerControl, ScreenShareControl } from 'components/common';
import ReactTooltip from 'react-tooltip';
import { setPlayerVisiblity } from 'store/reducers/screenShare';
import { setDialogOpen, setVideoDuration, setVideoFinished } from 'store/reducers/smartScreen';

let _cleartimeout = null;

const spinnerStyles = {
  root: {
    margin: '0 1rem',
  },
  circle: {
    borderWidth: 2,
    width: 48,
    height: 48,
  },
};

export const SmartScreen = () => {
  const { active, loading } = useSelector((state) => state.screenShare);
  const smartScreen = useSelector((state) => state.smartScreen);
  const dispatch = useDispatch();

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [smartScreen.dialogOpen])

  const handleClose = () => {
    const player = document.querySelector('#screen-share-player');
    player?.classList.remove('visible');
    setTimeout(() => {
      player?.classList.remove('hide');
      player.style.display = 'none';
    }, 750);
    dispatch(setPlayerVisiblity(false));
    window?.gameClient?.closeSmartScreen?.();
  };

  const handleStopVideo = () => {
    if(window.gameClient){
      window.gameClient.setActiveSmartScreenMode('Idle');
      dispatch(setDialogOpen(true));
      dispatch(setVideoDuration(null));
      dispatch(setVideoFinished(false));
    }
  }

  const handleTogglePlay = () => {
    if (_cleartimeout) {
      clearTimeout(_cleartimeout);
    }
    _cleartimeout = setTimeout(() => {
      if (smartScreen.videoPlaying) {
        window?.gameClient?.pauseVideoSmartScreen?.();
      } else {
        window?.gameClient?.playVideoSmartScreen?.();
      }
    }, 300);
  };

  const handlePlayAgain = () => {
    dispatch(setVideoFinished(false))
    dispatch(setVideoDuration(null));
    window.gameClient.setActiveSmartScreenMode('VideoPlayer', smartScreen.lastPlayedVideo);
  }

  const handleSeek = (position) => {
    window?.gameClient?.seekVideoSmartScreen?.(position);
  };

  return (
    <Fragment>
      {loading && (
        <div className="smartScreenLoader">
          <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
        </div>
      )}
      <div className="smartScreenPanel">
        <div className="smartScreenControls">
          {smartScreen.videoDuration && !active && (
            <div className="videoPlayerControls ms-mr-1 ms-motion-fadeIn">
              <VideoPlayerControl
                videoDuration={smartScreen.videoDuration}
                videoTime={smartScreen.videoTime}
                videoPlaying={smartScreen.videoPlaying}
                videoFinished={smartScreen.videoFinished}
                onTogglePlay={handleTogglePlay}
                onSeek={handleSeek}
                onPlayAgain= {handlePlayAgain}
                onStopVideo={handleStopVideo}
              />
            </div>
          )}
          <ScreenShareControl />
        </div>
        {
          (!smartScreen.dialogOpen && !smartScreen.whiteboardOpen && !smartScreen.showFacilitatorResources)  && (
            <ActionButton
              className="ms-motion-fadeIn exit-btn"
              data-tip data-for="exitPresenterMode"
              iconProps={{ iconName: 'Leave' }}
              onClick={handleClose}
            />
          )
        }
        <ReactTooltip id="exitPresenterMode" place="bottom" effect='solid'>
        <div>Exit Presenter Mode</div>
        </ReactTooltip>
      </div>
    </Fragment>
  );
};
