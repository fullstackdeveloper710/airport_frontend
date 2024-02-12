import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Dropdown, Icon, Link, Spinner, Toggle } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { setDeviceIds } from 'store/reducers/agora';
import { setEnteredIntoEvent, setGameStage } from 'store/reducers/game';
import { setMessage } from 'store/reducers/message';
import { logout } from 'store/reducers/user';
import {
  createAgoraMicroPhoneStream,
  createAgoraVideoStream,
  getLocalStream,
} from 'utils/common';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Checkbox } from 'office-ui-fabric-react';
import { GAME_STAGE_ENTERING } from 'constants/game';
import { setPermissions } from 'store/reducers/agora';
import {
  WelcomeScreenPermissionModal,
  PermissionIcon,
} from 'components/panels/game/deviceSelectionModal';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import webSocketClient from '../../lib/webSocketClient';
import { useI18n } from 'i18n/i18n.context';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
  enableVOG,
} from 'utils/eventVariables';
import { useAuth } from 'hooks/useAuth';
import { BorderedButton } from 'components/common/BorderedButton';
import { LandingTemplate } from './LandingTemplate';

const spinnerStyles = {
  root: {
    margin: '2rem 0',
  },
  circle: {
    borderWidth: 3,
    width: 48,
    height: 48,
  },
};

const buttonSpinnerStyles = {
  root: {
    marginRight: '5px',
  },
  circle: {
    borderWidth: 2.5,
    width: 20,
    height: 20,
    color: '#fff',
  },
};

const cameraSpinnerStyles = {
  root: {
    margin: '2rem 0',
  },
  circle: {
    borderWidth: 3,
    width: 40,
    height: 40,
  },
};

const deviceSelectionIconStyles = {
  root: {
    color: 'var(--sr-color-white)',
    opacity: 0.5,
    fontSize: 28,
    marginBottom: 2,
  },
};

const deviceSelectionActiveIconStyles = {
  root: {
    color: 'var(--sr-color-white)',
    fontSize: 28,
    marginBottom: 2,
    left: '41.5%',
    top: '36.5%',
    position: 'absolute',
  },
};

const toggleButtonStyles = {
  root: {
    margin: 0,
  },
  pill: {
    background: 'var(--sr-color-white)',
    '&:hover': {
      background: 'var(--sr-color-white)',
    },
  },
};

const dropDownStyles = {
  dropdown: {
    fontFamily: 'var(--sr-font-tertiary)',
    fontSize: 12,
    '&::after': {
      display: 'none',
    },
  },
  title: {
    background: 'var(--sr-color-transparent)',
    border: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 100,
    height: 'auto',
  },
  caretDown: {
    fontSize: 10,
    color: 'var(--sr-color-white)',
  },
  dropdownItemsWrapper: {
    border: `1px solid var(--sr-color-transparent-b-05)`,
    boxSizing: 'border-box',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    background: 'var(--sr-color-background-dropdownItem)',
    fontFamily: 'var(--sr-font-tertiary)',
    fontSize: 12,
  },
  dropdownItemSelected: {
    fontFamily: 'var(--sr-font-tertiary)',
    fontSize: 12,
  },
};

const backToLoginStyles = {
  root: {
    color: 'var(--sr-color-white)',
    marginTop: '1rem',
    textDecoration: 'underline',
  },
};

let debounceTimeout = null;

export const Welcome = () => {
  const {
    pages: { welcome: ls },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState();
  const [selectedCamera, setSelectedCamera] = useState();
  const tracks = useRef({});
  const [showActive, setShowActive] = useState(false);
  const agora = useSelector((state) => state.agora);
  const user = useSelector((store) => store.user);
  const [isMicCameraAllowed, setIsMicCameraAllowed] = useState({
    audio:
      enableMicAccess ||
      (enablePresenterMicAccess &&
        user?.current?.roles?.includes('ROLE_PRESENTER')),
    video:
      enableCameraAccess ||
      (enablePresenterCameraAccess &&
        user?.current?.roles?.includes('ROLE_PRESENTER')),
  });
  const getFullScreen = localStorage.getItem('useFullscreen');
  const { changeLocale, activeLocale } = useI18n();
  const { keycloakLogout } = useAuth();

  useEffect(() => {
    if (activeLocale !== 'en') {
      changeLocale('en');
    }

    if (getFullScreen) {
      (() => {
        if (getFullScreen === 'Yes') {
          setShowActive(true);
        } else if (getFullScreen === 'No') {
          setShowActive(false);
        }
      })();
    } else {
      (() => {
        setShowActive(false);
      })();
    }
    if (window.gameClient) {
      window.gameClient.endGame();
      delete window.gameClient;
    }

    if (window.agoraClientPrimary) {
      window.agoraClientPrimary.disconnect(() => {
        delete window.agoraClientPrimary;
      });
    }

    if (enableVOG && window.agoraClientSecondary) {
      window.agoraClientSecondary.disconnect(() => {
        delete window.agoraClientSecondary;
      });
    }

    if (window.agoraClientThird) {
      window.agoraClientThird.disconnect(() => {
        delete window.agoraClientThird;
      });
    }

    if (window.agoraScreenShare) {
      window.agoraScreenShare.disconnect(() => {
        delete window.agoraScreenShare;
      });
    }

    if (agora.ongoingStream?.current?.video) {
      agora.ongoingStream?.current?.video.close();
    }

    if (agora.ongoingStream?.current?.audio) {
      agora.ongoingStream?.current?.audio.close();
    }

    dispatch(setGameStage(null));
  }, []);

  useEffect(() => {
    dispatch(setEnteredIntoEvent(false));
    (() => {
      setDeviceList();
    })();
  }, []);

  const setDeviceList = async () => {
    const [microphones, cameras] = await getDevicesList();
    if (cameras.length) {
      setInitCamera(cameras);
    }
    if (microphones.length) {
      setInitMicrophone(microphones);
    }
    if (microphones.length === 0 || cameras.length === 0) {
      checkDevicePermission();
    }
  };

  const getDevicesList = async () => {
    if (
      (!(enableCameraAccess || enableMicAccess) &&
        !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
      (!(enablePresenterCameraAccess || enablePresenterMicAccess) &&
        user?.current?.roles?.includes('ROLE_PRESENTER'))
    ) {
      return;
    }
    return AgoraRTC.getDevices()
      .then((devices) => {
        let microphones,
          cameras = [];
        if (
          enableMicAccess ||
          (enablePresenterMicAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))
        ) {
          microphones = devices
            .filter(function (device) {
              return (
                device.kind === 'audioinput' &&
                ['default', 'communications'].indexOf(device.deviceId) === -1
              );
            })
            .map((deviceInfo) => ({
              key: deviceInfo.deviceId,
              text: deviceInfo?.label || 'null',
            }));
        }
        if (
          enableCameraAccess ||
          (enablePresenterCameraAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))
        ) {
          cameras = devices
            .filter(function (device) {
              return (
                device.kind === 'videoinput' &&
                ['default', 'communications'].indexOf(device.deviceId) === -1
              );
            })
            .map((deviceInfo) => ({
              key: deviceInfo.deviceId,
              text: deviceInfo?.label || 'null',
            }));
        }
        setMicrophones(microphones);
        setCameras(cameras);
        setLoading(false);
        return [microphones, cameras];
      })
      .catch((err) => {
        setLoading(false);
        if (err.code === 'PERMISSION_DENIED') {
          checkDevicePermission();
        }
        dispatch(
          setMessage({
            message:
              err.code === 'PERMISSION_DENIED'
                ? ls.permissionDeniedText
                : err.message,
          })
        );
        return [[], []];
      });
  };

  const checkDevicePermission = async () => {
    const result = { ...isMicCameraAllowed };
    let [audio, video] = await Promise.all([
      (enableMicAccess ||
        (enablePresenterMicAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))) &&
        navigator.permissions.query({ name: 'microphone' }),
      (enableCameraAccess ||
        (enablePresenterCameraAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))) &&
        navigator.permissions.query({ name: 'camera' }),
    ]);
    result.audio = audio.state === 'granted';
    result.video = video.state === 'granted';

    if (result.video) {
      const cameras = await getCameraDeviceList();
      if (cameras.length) {
        setInitCamera(cameras);
      }
    }

    if (result.audio) {
      const microphone = await getMicDeviceList();
      if (microphone.length) {
        setInitMicrophone(microphone);
      }
    }
    setIsMicCameraAllowed(result);
  };

  const getCameraDeviceList = async () => {
    return AgoraRTC.getCameras()
      .then((devices) => {
        let cameras = [];
        cameras = devices
          .filter(function (device) {
            return (
              device.kind === 'videoinput' &&
              ['default', 'communications'].indexOf(device.deviceId) === -1
            );
          })
          .map((deviceInfo) => ({
            key: deviceInfo.deviceId,
            text: deviceInfo?.label || 'null',
          }));
        setCameras(cameras);
        return cameras;
      })
      .catch((e) => {
        console.log(e);
        return [];
      });
  };

  const getMicDeviceList = async () => {
    if (
      (!enableMicAccess && !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
      (user?.current?.roles?.includes('ROLE_PRESENTER') &&
        !enablePresenterMicAccess)
    ) {
      return;
    }
    return AgoraRTC.getMicrophones()
      .then((devices) => {
        let microphones = [];
        microphones = devices
          .filter(function (device) {
            return (
              device.kind === 'audioinput' &&
              ['default', 'communications'].indexOf(device.deviceId) === -1
            );
          })
          .map((deviceInfo) => ({
            key: deviceInfo.deviceId,
            text: deviceInfo?.label || 'null',
          }));
        setMicrophones(microphones);
        return microphones;
      })
      .catch((e) => {
        console.log(e);
        return [];
      });
  };

  const hotPlugginMicListener = () => {
    if (
      (!enableMicAccess && !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
      (user?.current?.roles?.includes('ROLE_PRESENTER') &&
        !enablePresenterMicAccess)
    ) {
      return;
    }
    AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === 'ACTIVE') {
        getMicDeviceList();
        setSelectedMicrophone(changedDevice.device.deviceId);
      } else {
        let oldMicrophones = await AgoraRTC.getMicrophones();
        oldMicrophones = oldMicrophones.filter(
          (device) =>
            ['default', 'communications'].indexOf(device.deviceId) === -1
        );
        getMicDeviceList();
        if (oldMicrophones[0]) {
          setSelectedMicrophone(oldMicrophones[0].deviceId);
        } else {
          setSelectedMicrophone(undefined);
        }
      }
    };
  };

  const hotPlugginCameraListener = () => {
    if (
      (!enableCameraAccess &&
        !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
      (user?.current?.roles?.includes('ROLE_PRESENTER') &&
        !enablePresenterCameraAccess)
    ) {
      return;
    }
    AgoraRTC.onCameraChanged = async (changedDevice) => {
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === 'ACTIVE') {
        getCameraDeviceList();
        setSelectedCamera(changedDevice.device.deviceId);
      } else {
        let oldCameras = await AgoraRTC.getCameras();
        oldCameras = oldCameras.filter(
          (device) =>
            ['default', 'communications'].indexOf(device.deviceId) === -1
        );
        getCameraDeviceList();
        if (oldCameras[0]) {
          setSelectedCamera(oldCameras[0].deviceId);
        } else {
          setSelectedCamera(undefined);
        }
      }
    };
  };

  const checkAudioVideoPermission = async () => {
    const result = {};
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      let { audio, video } = await getLocalStream();
      result.audio = audio;
      result.video = video;
    } else {
      let [audio, video] = await Promise.all([
        (enableMicAccess ||
          (enablePresenterMicAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))) &&
          navigator.permissions.query({ name: 'microphone' }),
        (enableCameraAccess ||
          (enablePresenterCameraAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))) &&
          navigator.permissions.query({ name: 'camera' }),
      ]);
      result.audio = audio.state === 'granted';
      result.video = video.state === 'granted';
    }
    dispatch(setPermissions(result));
  };

  useEffect(() => {
    hotPlugginMicListener();
    hotPlugginCameraListener();
  }, []);

  const setInitCamera = (cameras) => {
    if (cameras.length > 0) {
      setSelectedCamera(cameras[0].key);
    } else {
      setSelectedCamera(undefined);
    }
  };

  const setInitMicrophone = (microphones) => {
    if (microphones.length > 0) {
      setSelectedMicrophone(microphones[0].key);
    } else {
      setSelectedMicrophone(undefined);
    }
  };

  useEffect(() => {
    changingMicroPhone();
  }, [selectedMicrophone]);

  const changingMicroPhone = async () => {
    Object.defineProperties(tracks, {
      current: {
        writable: true,
      },
    });
    if (tracks.current.audio && !selectedMicrophone) {
      tracks.current?.audio.close();
      tracks.current = { ...tracks.current, audio: null };
      hotPlugginMicListener();
      return;
    }

    if (tracks.current.audio && selectedMicrophone) {
      await tracks.current.audio.setDevice(selectedMicrophone);
      hotPlugginMicListener();
      return;
    }

    if (!tracks.current?.audio && selectedMicrophone) {
      const localtrack = await createAgoraMicroPhoneStream(
        selectedMicrophone,
        dispatch
      );
      if (localtrack) {
        AgoraRTC.checkAudioTrackIsActive(localtrack).catch((e) => {
          console.log(e);
          console.log('check audio track error!', e);
        });
        tracks.current = { ...tracks.current, audio: localtrack };
      }
      hotPlugginMicListener();
      return;
    }
  };

  const changingCamera = async () => {
    Object.defineProperties(tracks, {
      current: {
        writable: true,
      },
    });
    if (tracks.current?.video && !selectedCamera) {
      if (document.getElementById('video-preview')) {
        document.getElementById('video-preview').innerHTML = '';
      }
      tracks.current?.video.close();
      tracks.current = { ...tracks.current, video: null };
      hotPlugginCameraListener();
      setCameraLoading(false);
      return;
    }

    if (tracks.current?.video?.setDevice && selectedCamera) {
      try {
        await tracks.current.video.setDevice(selectedCamera);
        hotPlugginCameraListener();
        return;
      } catch (e) {
        console.log(e);
      } finally {
        setCameraLoading(false);
      }
      return;
    }

    if (!tracks.current?.video && selectedCamera) {
      const localtrack = await createAgoraVideoStream(selectedCamera, dispatch);
      if (localtrack) {
        AgoraRTC.checkVideoTrackIsActive(localtrack)
          .then(() => {
            if (document.getElementById('video-preview')) {
              document.getElementById('video-preview').innerHTML = '';
              localtrack.play('video-preview');
            }
          })
          .catch((e) => {
            console.log(e);
            console.log('check video track error!', e);
          });
        tracks.current = { ...tracks.current, video: localtrack };
      }
      hotPlugginCameraListener();
      setCameraLoading(false);
      return;
    }
    setCameraLoading(false);
  };

  useEffect(() => {
    if (!cameraLoading && !!selectedCamera) {
      setCameraLoading(true);
    }
    changingCamera();
  }, [selectedCamera]);

  const handleChangeCamera = (_event, item) => {
    if (selectedCamera !== item.key) {
      setCameraLoading(true);
    }
    setSelectedCamera(item.key);
  };

  const handleChangeMicrophone = (_event, item) => {
    setSelectedMicrophone(item.key);
  };

  const handleToggleChangeCamera = (_event, checked) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (checked && cameras.length) {
        setCameraLoading(true);
        setSelectedCamera(cameras[0].key);
      } else {
        setSelectedCamera(undefined);
      }
    }, 500);
  };

  const handleToggleChangeMicrophone = (_event, checked) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (checked && microphones.length) {
        setSelectedMicrophone(microphones[0].key);
      } else {
        setSelectedMicrophone(undefined);
      }
    }, 500);
  };

  const handleClickEnterWorld = async () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      setLoadingButton(true);
      checkAudioVideoPermission();
      dispatch(setGameStage(GAME_STAGE_ENTERING));
      if (!selectedMicrophone && !selectedCamera) {
        if (
          (enableCameraAccess && enableMicAccess) ||
          (enablePresenterCameraAccess &&
            enablePresenterMicAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))
        ) {
          dispatch(
            setMessage({
              message: ls.unselectedCamAndMicMessage,
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
            })
          );
        }
      } else if (
        !selectedMicrophone &&
        (enableMicAccess ||
          (enablePresenterMicAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER')))
      ) {
        dispatch(
          setMessage({
            message: ls.unselectedMicMessage,
          })
        );
      } else if (
        !selectedCamera &&
        (enableCameraAccess ||
          (enablePresenterCameraAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER')))
      ) {
        dispatch(
          setMessage({
            message: ls.unselectedCamMessage,
          })
        );
      }

      dispatch(
        setDeviceIds({
          microphoneId: selectedMicrophone,
          cameraId: selectedCamera,
        })
      );

      if (tracks.current?.video) {
        try {
          tracks.current?.video?.close();
        } catch (err) {
          console.log('Agora Error');
        }
      }
      if (tracks.current?.audio) {
        try {
          tracks.current?.audio?.close();
        } catch (err) {
          console.log('Agora Error');
        }
      }

      const response = await webSocketClient.startConnection();
      if (response === 'open') {
        window.enter_world_clicked = true;
        history.push('/');
      } else {
        dispatch(
          setMessage({
            message: 'There is a Problem with your internet', // TO DO => Need to change this text in i18
          })
        );
      }
    }, 500);
  };

  const handleBackLogin = () => {
    if (tracks.current?.video) {
      try {
        tracks.current?.video?.close();
      } catch (err) {
        console.log('Agora Error');
      }
    }
    if (tracks.current?.audio) {
      try {
        tracks.current?.audio?.close();
      } catch (err) {
        console.log('Agora Error');
      }
    }
    dispatch(logout());
    keycloakLogout();
  };

  const onChangeShowActive = () => {
    localStorage.setItem('useFullscreen', !showActive ? 'Yes' : 'No');
    setShowActive((showActive) => !showActive);
  };

  return (
    <LandingTemplate
      heading={ls.welcomeToExperienceText}
      description={ls.welcomeDescriptionMessage}
    >
      <div className="device-Container ms-Flex ms-Flex-justify-content-start">
        {loading ? (
          <Spinner styles={spinnerStyles} />
        ) : (
          <>
            {(enableCameraAccess ||
              (enablePresenterCameraAccess &&
                user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
              <div
                className={`device-Selection ${
                  selectedCamera
                    ? 'device-Selection-On'
                    : 'device-Selection-Off'
                }`}
              >
                <div className="iconContainer ms-w-100 ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center position-relative">
                  {cameraLoading ? (
                    <Spinner styles={cameraSpinnerStyles} />
                  ) : (
                    <Fragment>
                      {!isMicCameraAllowed.video && (
                        <PermissionIcon size={{ top: '44.5%', left: '55.5%' }}>
                          {({ onClick }) => {
                            return (
                              <Fragment>
                                <Icon
                                  iconName="Video"
                                  styles={{
                                    ...deviceSelectionIconStyles,
                                    root: {
                                      ...deviceSelectionIconStyles.root,
                                      cursor: 'pointer',
                                    },
                                  }}
                                  onClick={onClick}
                                />
                                <p
                                  onClick={onClick}
                                  style={{ cursor: 'pointer' }}
                                  className="device-Selection-Text"
                                >
                                  {ls.cameraText}
                                </p>
                              </Fragment>
                            );
                          }}
                        </PermissionIcon>
                      )}
                      {isMicCameraAllowed.video && (
                        <Fragment>
                          <Icon
                            iconName="VideoOff"
                            styles={deviceSelectionIconStyles}
                          />
                          <p className="device-Selection-Text">
                            {ls.cameraText}
                          </p>
                        </Fragment>
                      )}
                    </Fragment>
                  )}

                  <div
                    id="video-preview"
                    className={`ms-w-100 ms-h-100 device-Preview ${
                      selectedCamera ? 'visible' : 'hidden'
                    }`}
                  />
                </div>
                {isMicCameraAllowed.video && (
                  <div className="device-Selection-Control ms-Flex ms-Flex-align-items-center ms-Flex-justify-content-center">
                    <Toggle
                      checked={!!selectedCamera}
                      disabled={!cameras.length}
                      onChange={handleToggleChangeCamera}
                      styles={toggleButtonStyles}
                    />
                    <Dropdown
                      selectedKey={selectedCamera}
                      onChange={handleChangeCamera}
                      options={cameras}
                      styles={dropDownStyles}
                      dropdownWidth="auto"
                      className={selectedCamera ? 'visible' : 'hidden'}
                    />
                  </div>
                )}
              </div>
            )}
            {(enableMicAccess ||
              (enablePresenterMicAccess &&
                user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
              <div
                className={`device-Selection ${
                  selectedMicrophone
                    ? 'device-Selection-On'
                    : 'device-Selection-Off'
                }`}
              >
                <div className="iconContainer ms-w-100 ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center position-relative">
                  {!isMicCameraAllowed.audio && (
                    <PermissionIcon size={{ top: '44.5%', left: '55.5%' }}>
                      {({ onClick }) => {
                        return (
                          <Fragment>
                            <Icon
                              iconName="Microphone"
                              onClick={onClick}
                              styles={{
                                ...deviceSelectionIconStyles,
                                root: {
                                  ...deviceSelectionIconStyles.root,
                                  cursor: 'pointer',
                                },
                              }}
                            />
                            <p
                              onClick={onClick}
                              style={{ cursor: 'pointer' }}
                              className="device-Selection-Text"
                            >
                              {ls.microphoneText}{' '}
                            </p>
                          </Fragment>
                        );
                      }}
                    </PermissionIcon>
                  )}

                  {isMicCameraAllowed.audio && (
                    <Fragment>
                      <Icon
                        iconName="MicOff2"
                        styles={deviceSelectionIconStyles}
                      />
                      <p className="device-Selection-Text">
                        {ls.microphoneText}
                      </p>
                    </Fragment>
                  )}

                  <div
                    className={`device-Preview ${
                      selectedMicrophone ? 'visible' : 'hidden'
                    }`}
                  >
                    <Icon
                      iconName="Microphone"
                      styles={deviceSelectionActiveIconStyles}
                    />
                    <div className="ring"></div>
                    <div className="ring ring2"></div>
                    <div className="ring ring3"></div>
                  </div>
                </div>
                {isMicCameraAllowed.audio && (
                  <div className="device-Selection-Control ms-Flex ms-Flex-align-items-center ms-Flex-justify-content-center">
                    <Toggle
                      checked={!!selectedMicrophone}
                      disabled={!microphones.length}
                      onChange={handleToggleChangeMicrophone}
                      styles={toggleButtonStyles}
                    />
                    {!!selectedMicrophone && (
                      <Dropdown
                        selectedKey={selectedMicrophone}
                        onChange={handleChangeMicrophone}
                        options={microphones}
                        styles={dropDownStyles}
                        dropdownWidth="auto"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="ms-mb-2 full-screenoption">
        <Checkbox
          className="form-control"
          label={ls.enableFullScreenText}
          checked={showActive}
          onChange={onChangeShowActive}
        />
      </div>
      <BorderedButton disabled={loadingButton} onClick={handleClickEnterWorld}>
        {loadingButton && <Spinner styles={buttonSpinnerStyles} />}{' '}
        {ls.enterWorldText}
      </BorderedButton>
      <Link onClick={handleBackLogin} styles={backToLoginStyles}>
        {ls.backToLoginText}
      </Link>
      {(!isMicCameraAllowed.audio || !isMicCameraAllowed.video) && (
        <WelcomeScreenPermissionModal />
      )}
    </LandingTemplate>
  );
};
