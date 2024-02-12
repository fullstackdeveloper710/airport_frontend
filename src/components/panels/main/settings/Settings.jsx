import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Slider, Checkbox } from 'office-ui-fabric-react';
import { LanguageSelector } from 'i18n/LanguageSelector';
import { setMessage } from 'store/reducers/message';
import { setDeviceIds } from 'store/reducers/agora';
import { DeviceSelection } from 'components/common';
import { setShowStreamStats } from 'store/reducers/game';
import config from 'config';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
  enableVOG,
  i18NInAvatarRoom,
  i18NInSidebarNav,
} from 'utils/eventVariables';

const sliderStyles = {
  activeSection: {
    backgroundColor: 'var(--sr-color-primary)' ?? 'var(--sr-color-primary)',
  },
  inactiveSection: {
    backgroundColor: 'var(--sr-color-sliderStyles-inactiveSection)',
  },
  valueLabel: {
    width: 24,
  },
};

let debounceTimeout = null;

export const Settings = () => {
  const dispatch = useDispatch();
  const {
    components: {
      panels: {
        main: { settings: ls },
      },
    },
  } = useLabelsSchema();
  //const ls = components.panels.main.settings;
  const [selectedMicrophone, setSelectedMicrophone] = useState(
    (window.agoraClientPrimary &&
      window.agoraClientPrimary.getSelectedMicrophone()) ||
      'null'
  );
  const [selectedCamera, setSelectedCamera] = useState(
    (window.agoraClientPrimary &&
      window.agoraClientPrimary.getSelectedCamera()) ||
      'null'
  );
  const user = useSelector((state) => state.user);
  const { showStreamStats, streamStats, enteredIntoEvent } =
    useSelector((state) => state.game);
  const [gameAudioVolume, setGameAudioVolume] = useState(
    window.gameClient ? window.gameClient.getAudioVolume() : 100
  );
  const [gameEffectVolume, setGameEffectVolume] = useState(
    window.gameClient ? window.gameClient.getEffectVolume() : 100
  );
  const [channelVolume, setChannelVolume] = useState(
    window.agoraClientPrimary ? window.agoraClientPrimary.getVolume() : 100
  );
  const eventName = config.event.name;

  const changingDevice = () => {
    const microphoneId =
      selectedMicrophone === 'null' ? undefined : selectedMicrophone;
    const cameraId = selectedCamera === 'null' ? undefined : selectedCamera;

    if (selectedMicrophone === 'null' && selectedCamera === 'null') {
      if (
        (enableCameraAccess && enableMicAccess) ||
        (enablePresenterCameraAccess &&
          enablePresenterMicAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))
      ) {
        dispatch(
          setMessage({
            message: ls.unselectedCamAndMicMessage,
            timeout: -1,
          })
        );
      } else if (
        enableCameraAccess ||
        (enablePresenterCameraAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))
      ) {
        dispatch(
          setMessage({
            message: ls.unselectedCamMessage,
            timeout: -1,
          })
        );
      } else if (
        enableMicAccess ||
        (enablePresenterMicAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))
      ) {
        dispatch(
          setMessage({
            message: ls.unselectedMicMessage,
            timeout: -1,
          })
        );
      }
    } else if (
      selectedMicrophone === 'null' &&
      (enableMicAccess ||
        (enablePresenterMicAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER')))
    ) {
      dispatch(
        setMessage({
          message: ls.unselectedMicMessage,
          timeout: -1,
        })
      );
    } else if (
      selectedCamera === 'null' &&
      (enableCameraAccess ||
        (enablePresenterCameraAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER')))
    ) {
      dispatch(
        setMessage({
          message: ls.unselectedCamMessage,
          timeout: -1,
        })
      );
    }
    dispatch(
      setDeviceIds({
        microphoneId,
        cameraId,
      })
    );

    if (window.agoraClientPrimary) {
      window.agoraClientPrimary.switchDevice(
        microphoneId,
        cameraId
      );
    }
    if (enableVOG && window.agoraClientSecondary) {
      window.agoraClientSecondary.switchDevice(
        microphoneId,
        cameraId
      );
    }
    if (window.agoraClientThird) {
      window.agoraClientThird.switchDevice(
        microphoneId,
        cameraId
      );
    }
  };

  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      changingDevice();
    }, 500);
  }, [selectedCamera, selectedMicrophone]);

  useEffect(() => {
    if (window.gameClient) {
      window.gameClient.setAudioVolume(gameAudioVolume);
    }
  }, [gameAudioVolume]);

  useEffect(() => {
    if (window.gameClient) {
      window.gameClient.setEffectVolume(gameEffectVolume);
    }
  }, [gameEffectVolume]);

  useEffect(() => {
    if (window.agoraClientPrimary) {
      window.agoraClientPrimary.setVolume(channelVolume);
    }
    if (enableVOG && window.agoraClientSecondary) {
      window.agoraClientSecondary.setVolume(channelVolume);
    }
    if (window.agoraClientThird) {
      window.agoraClientThird.setVolume(channelVolume);
    }
  }, [channelVolume]);

  useEffect(() => {
    let _settingsReactAppEventName = document.getElementById(
      'sr__versionControl--settings'
    );
    const _settingsGameVersion = document.getElementById(
      'sr__gameVersion--settings'
    );
    if (typeof config.build === 'undefined') {
      _settingsReactAppEventName.innerHTML = 'localhost';
      _settingsGameVersion.innerHTML = 'localhost';
    } else {
      _settingsReactAppEventName.innerHTML = eventName + '_' + config.build;
      _settingsGameVersion.innerHTML = window.gameVersion;
    }
  }, []);

  const handleChangeCamera = (camera) => {
    setSelectedCamera(camera);
  };

  const handleChangeMicrophone = (microphone) => {
    setSelectedMicrophone(microphone);
  };

  const handleChangeGameAudioVolume = (value) => {
    window?.gameClient?.logUserAction?.({
      eventName: 'SETTINGS_MEDIA_VOLUME',
      eventSpecificData: null,
      beforeState: gameAudioVolume,
      afterState: value,
    });

    setGameAudioVolume(value);
  };

  const handleChangeGameEffectVolume = (value) => {
    window?.gameClient?.logUserAction?.({
      eventName: 'SETTINGS_SOUNDS_EFFECTS_VOLUME',
      eventSpecificData: null,
      beforeState: gameEffectVolume,
      afterState: value,
    });

    setGameEffectVolume(value);
  };

  const handleChannelVolume = (value) => {
    window?.gameClient?.logUserAction?.({
      eventName: 'SETTINGS_VOICE_CHAT_VOLUME',
      eventSpecificData: null,
      beforeState: channelVolume,
      afterState: value,
    });

    setChannelVolume(value);
  };

  const handleToggleShowStreamStats = (e) => {
    const value = e.target.checked;

    window?.gameClient?.logUserAction?.({
      eventName: 'SETTINGS_SHOW_STATISTICS',
      eventSpecificData: JSON.stringify({ streamStats }),
      beforeState: !value,
      afterState: value,
    });

    dispatch(setShowStreamStats(value));
  };
  const showLanguageSelector = useMemo(
    () =>
      (i18NInAvatarRoom &&
        enteredIntoEvent === false) ||
      (i18NInSidebarNav && enteredIntoEvent === true),
    [enteredIntoEvent]
  );
  return (
    <div className="ms-Flex ms-Flex-column ms-mx-2 ms-Flex-align-items-center">
      {(enableCameraAccess ||
        enableMicAccess ||
        ((enablePresenterCameraAccess || enablePresenterMicAccess) &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
        <DeviceSelection
          defaultCamera={selectedCamera}
          defaultMicrophone={selectedMicrophone}
          onChangeCamera={handleChangeCamera}
          onChangeMicrophone={handleChangeMicrophone}
        />
      )}
      <div className="ms-w-100 ms-my-1">
        <Slider
          label={ls.mediaVolumeSliderLabel} //"Media Volume"
          min={0}
          max={100}
          step={1}
          showValue
          styles={sliderStyles}
          value={gameAudioVolume}
          onChange={handleChangeGameAudioVolume}
        />
      </div>
      <div className="ms-w-100 ms-mb-1">
        <Slider
          label={ls.soundEffectsVolumeSliderLabel} // "Sound Effects Volume"
          min={0}
          max={100}
          step={1}
          showValue
          styles={sliderStyles}
          value={gameEffectVolume}
          onChange={handleChangeGameEffectVolume}
        />
      </div>
      <div className="ms-w-100 ms-mb-1">
        <Slider
          label={ls.voiceChatVolumeSliderLabel} // "Voice Chat Volume"
          min={0}
          max={100}
          step={1}
          showValue
          styles={sliderStyles}
          value={channelVolume}
          onChange={handleChannelVolume}
        />
      </div>
      {showLanguageSelector && (
        <div className="ms-w-100 ms-mb-1">
          <LanguageSelector />
        </div>
      )}
      <div className="ms-w-100 ms-mb-1">
        <Checkbox
          label={ls.checkboxStreamStatsLabel} // "Show Stream Statistics"
          styles={sliderStyles}
          checked={showStreamStats}
          onChange={handleToggleShowStreamStats}
        />
      </div>
      <div className="ms-w-100 ms-mb-1 text-right" style={{ fontSize: '12px' }}>
        <div className="appVersion">
          <em>
            <span>{ls.frontEndVersionLabel}</span>
            <span
              id="sr__versionControl--settings"
              className="eventName_reactappBuild"
            ></span>
          </em>
        </div>
        <div className="gameVersion">
          <em>
            <span>{ls.gameVersionLabel}</span>
            <span id="sr__gameVersion--settings"></span>
          </em>
        </div>
      </div>
    </div>
  );
};
