import React, { Fragment, useEffect } from 'react';
import { mergeStyles } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { isInGame } from 'utils/common';
import { publishScreenShare, setLoading } from 'store/reducers/screenShare';
import { setDialogOpen } from 'store/reducers/smartScreen';
import { setMessage } from 'store/reducers/message';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { SidePanel } from 'components/panels/sidepanel/SidePanel';

const imageStyle = mergeStyles({
  width: '100%',
  height: 'inherit',
});

const LIVE_SCREEN_SHARE = 'ScreenSharePlayer';

export const PresentDialog = (props) => {
  const { open, onSelect } = props;
  const {
    constants: {
      web: { presentModes },
    },
  } = useLabelsSchema();

  const game = useSelector((state) => state.game);
  const currentUser = useSelector((state) => state.user.current);
  const is_presenter = currentUser?.roles?.includes('ROLE_PRESENTER');
  const dispatch = useDispatch();
  const smartScreen = useSelector((state) => state.smartScreen);
  const { active, streamerData } = useSelector(
    (state) => state.screenShare
  );
  const availableScreens = smartScreen.availableModes;

  const closeSmartScreenDialog = (isTryScreenShare) => {
    if (!isTryScreenShare) {
      window?.gameClient?.emitUIInteraction({
        method: 'ToggleSmartScreenView',
        payload: {
          state: false
        },
      });
    }
    dispatch(setDialogOpen(false));
  };

  useEffect(() => {
    if (!isInGame(game.stage)) {
      closeSmartScreenDialog(false);
    }
  }, [isInGame(game.stage)]);

  const handleSelect = (id) => {
    if (id === LIVE_SCREEN_SHARE) {
      closeSmartScreenDialog(true);
      if (is_presenter) {
        initiateScreenShare(true);
      }
      return;
    }
    onSelect(id);
  };

  const startScreenShareInitiation = async () => {
    let isScreenShared = false;
    if (window.agoraScreenShare) {
      isScreenShared = await window.agoraScreenShare.publishLocalStream();
    }
    if (isScreenShared) {
      if (window.gameClient && currentUser) {
        window.gameClient.setSmartScreenWaitingImage(true);
        dispatch(
          publishScreenShare({
            presenter: currentUser.eventUserId,
            presenter_name: currentUser.firstName + ' ' + currentUser.lastName,
            room_name: window.gameClient
              ? window.gameClient.getCurrentRoomName()
              : '',
            is_started: true,
          })
        );
        return true
      } else {
        return false
      }
    } else {
      if (window.gameClient) {
        window.gameClient.setSmartScreenWaitingImage(false)
      }
      return false
    }
  }

  const initiateScreenShare = async (state) => {
    if (active) {
      if (streamerData?.presenter === currentUser.eventUserId) {
        window?.agoraScreenShare?.stopScreen?.();
        const screenShareStarted = await startScreenShareInitiation()
        if (screenShareStarted) {
          window?.gameClient?.emitUIInteraction({
            method: 'ToggleSmartScreenView',
            payload: {
              state
            },
          });
          setTimeout(() => {
            closeSmartScreenDialog(false);
          }, 1500);
        } else {
          window?.gameClient?.emitUIInteraction({
            method: 'ToggleSmartScreenView',
            payload: {
              state: false
            },
          });
          dispatch(setLoading(false))
        }
      } else {
        dispatch(
          setMessage({ message: `${streamerData?.presenter_name || "Someone else"} is already presenting their screen. Please wait for them to stop presenting before you start your screen share.` })
        )
      }
    } else {
      const screenShareStarted = await startScreenShareInitiation()
      if (!screenShareStarted) {
        window?.gameClient?.emitUIInteraction({
          method: 'ToggleSmartScreenView',
          payload: {
            state: false
          },
        });
        dispatch(setLoading(false))
      }
    }

  };

  return (
    <Fragment>
      <SidePanel title={"Present"} subTitle={"Select a Presentation Mode"} handleDismiss={() => closeSmartScreenDialog(false)} open={open}>
        <div className='presentation-panel-content'>
          {presentModes
            ?.filter((item) =>
              item.id === LIVE_SCREEN_SHARE
                ? is_presenter
                : availableScreens.includes(item.id)
            )
            .map((mode, index) => (
              <div
                key={index}
                className="mode-wrapper"
              >
                <div className="image">
                  <img src={mode.image} onClick={() => handleSelect(mode.id)} className={imageStyle} />
                </div>
                <p>{mode.text}</p>
              </div>
            ))}
        </div>
      </SidePanel>
    </Fragment>
  );
};