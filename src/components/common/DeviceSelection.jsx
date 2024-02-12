import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  Fragment,
} from 'react';
import { Dropdown, Spinner } from 'office-ui-fabric-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {
  createAgoraMicroPhoneStream,
  createAgoraVideoStream,
} from 'utils/common';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from 'store/reducers/message';
import { setChangingDevice, setOngoingStream } from 'store/reducers/agora';
import {
  AllowDeviceIcon,
  PermissionIcon,
} from 'components/panels/game/deviceSelectionModal';
import { Label } from '@fluentui/react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterMicAccess,
  enablePresenterCameraAccess,
  enableVOG,
} from 'utils/eventVariables';

const dropDownStyles = {
  dropdown: {
    marginBottom: '.5rem',
  },
};

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

const cameraSpinnerStyles = {
  root: {
    margin: 'auto',
  },
  circle: {
    borderWidth: 3,
    marginTop: '4rem',
    width: 42,
    height: 42,
  },
};

export const DeviceSelection = ({
  onChangeCamera,
  onChangeMicrophone,
}) => {
  const {
    components: {
      common: { deviceSelection: ls },
    },
    constants: {
      web: { ARTypes },
    },
  } = useLabelsSchema();
  const [loading, setLoading] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [cameraDeviceFullDetails, setCameraDeviceInfo] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('null');
  const [selectedMicrophone, setSelectedMicrophone] = useState('null');
  const [shouldDisable, setShouldDisable] = useState(false);
  const tracks = useRef({});
  const user = useSelector((store) => store.user);
  const panel = useSelector((state) => state.panel);
  const { permissions } = useSelector((state) => state.agora);
  let tracks_copy = {};

  const dispatch = useDispatch();

  useEffect(() => {
    getDevicesList();
  }, []);
  useEffect(() => {
    if (
      (!(enableCameraAccess || enableMicAccess) &&
        !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
      (!(enablePresenterCameraAccess || enablePresenterMicAccess) &&
        user?.current?.roles?.includes('ROLE_PRESENTER'))
    ) {
      return;
    }
    (() => {
      if (
        enableCameraAccess ||
        (enablePresenterCameraAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))
      ) {
        setSelectedCamera(
          (window.agoraClientPrimary &&
            window.agoraClientPrimary.getSelectedCamera()) ||
          'null'
        );
        setCameraDeviceInfo(
          (window?.agoraClientPrimary &&
            window.agoraClientPrimary?.getSelectedCameraDeviceInfo()) ||
          null
        );
      }
      if (
        enableMicAccess ||
        (enablePresenterMicAccess &&
          user?.current?.roles?.includes('ROLE_PRESENTER'))
      ) {
        setSelectedMicrophone(
          (window.agoraClientPrimary &&
            window.agoraClientPrimary.getSelectedMicrophone()) ||
          'null'
        );
      }
    })();
  }, [panel.isOpen, panel.panelName]);

  const getDevicesList = useCallback(async () => {
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
        setMicrophones(
          enableMicAccess ||
            (enablePresenterMicAccess &&
              user?.current?.roles?.includes('ROLE_PRESENTER'))
            ? [
              { key: 'null', text: ls.setNoMicrophones.text },
              ...devices
                .filter(function (device) {
                  return (
                    device.kind === 'audioinput' &&
                    ['default', 'communications'].indexOf(device.deviceId) ===
                    -1
                  );
                })
                .map((deviceInfo) => ({
                  key: deviceInfo.deviceId,
                  text: deviceInfo?.label || 'null',
                })),
            ]
            : []
        );
        setCameras(
          enableCameraAccess ||
            (enablePresenterCameraAccess &&
              user?.current?.roles?.includes('ROLE_PRESENTER'))
            ? [
              { key: 'null', text: ls.setNoCameras.text },
              ...devices
                .filter(function (device) {
                  return (
                    device.kind === 'videoinput' &&
                    ['default', 'communications'].indexOf(device.deviceId) ===
                    -1
                  );
                })
                .map((deviceInfo) => ({
                  key: deviceInfo.deviceId,
                  text: deviceInfo?.label || 'null',
                })),
            ]
            : []
        );
        setLoading(false);
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
                ? 'Permission Denied'
                : err.message,
          })
        );
      });
  }, [ls]);

  const checkDevicePermission = async () => {
    const result = {};
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
      getCameraDeviceList();
    }

    if (result.audio) {
      getMicDeviceList();
    }
  };

  const getCameraDeviceList = useCallback(async () => {
    if (
      (!enableCameraAccess &&
        !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
      (user?.current?.roles?.includes('ROLE_PRESENTER') &&
        !enablePresenterCameraAccess)
    ) {
      return;
    }
    return AgoraRTC.getCameras()
      .then((devices) => {
        setCameras([
          { key: 'null', text: ls.setNoCameras.text },
          ...devices
            .filter(function (device) {
              return (
                device.kind === 'videoinput' &&
                ['default', 'communications'].indexOf(device.deviceId) === -1
              );
            })
            .map((deviceInfo) => ({
              key: deviceInfo.deviceId,
              text: deviceInfo?.label || 'null',
            })),
        ]);
      })
      .catch((e) => {
        console.log(e);
        return [];
      });
  }, [ls]);

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
        setMicrophones([
          { key: 'null', text: ls.setNoMicrophones.text },
          ...devices
            .filter(function (device) {
              return (
                device.kind === 'audioinput' &&
                ['default', 'communications'].indexOf(device.deviceId) === -1
              );
            })
            .map((deviceInfo) => ({
              key: deviceInfo.deviceId,
              text: deviceInfo?.label || 'null',
            })),
        ]);
      })
      .catch((e) => {
        console.log(e);
        return [];
      });
  };

  useEffect(() => {
    getDevicesList();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.stopPlugginListener();
      }

      hotPlugginMicListener();
      hotPlugginCameraListener();
    }
    return () => {
      removeHotPlugginListener();
    };
  }, [loading]);

  useEffect(() => {
    if (!loading) changingMicroPhone();
  }, [selectedMicrophone, loading]);

  const changingMicroPhone = async () => {
    Object.defineProperties(tracks, {
      current: {
        writable: true,
      },
    });
    if (tracks.current.audio && selectedMicrophone === 'null') {
      tracks.current?.audio.close();
      tracks.current = { ...tracks.current, audio: null };
      hotPlugginMicListener();
      return;
    }

    if (
      tracks.current.audio &&
      tracks.current.audio.setDevice &&
      selectedMicrophone !== 'null'
    ) {
      await tracks.current.audio.setDevice(selectedMicrophone);
      hotPlugginMicListener();
      return;
    }

    if (!tracks.current?.audio && selectedMicrophone !== 'null') {
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
        tracks_copy = { ...tracks };
        dispatch(
          setOngoingStream({
            ongoingStream: tracks_copy,
          })
        );
      }
      hotPlugginMicListener();
      return;
    }
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
        dispatch(
          setChangingDevice({
            label: changedDevice.device.label,
            id: changedDevice.device.deviceId,
          })
        );
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
          dispatch(
            setChangingDevice({
              label: oldMicrophones[0].label,
              id: oldMicrophones[0].deviceId,
            })
          );
        } else {
          setSelectedMicrophone('null');
        }
      }
    };
  };

  const changingCamera = async () => {
    Object.defineProperties(tracks, {
      current: {
        writable: true,
      },
    });
    if (tracks.current?.video && selectedCamera === 'null') {
      if (document.getElementById('stream-test')) {
        document.getElementById('stream-test').innerHTML = '';
      }
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.muteVideo();
      }
      if (enableVOG && window.agoraClientSecondary) {
        window.agoraClientSecondary.muteVideo();
      }
      if (window.agoraClientThird) {
        window.agoraClientThird.muteVideo();
      }
      tracks.current?.video.close();
      tracks.current = { ...tracks.current, video: null };

      hotPlugginCameraListener();
      setCameraLoading(false);
      setShouldDisable(false);
      return;
    }

    if (tracks.current?.video?.setDevice && selectedCamera !== 'null') {
      await tracks.current.video.setDevice(selectedCamera);
      hotPlugginCameraListener();
      setCameraLoading(false);
      setShouldDisable(false);
      return;
    }

    if (!tracks.current?.video && selectedCamera !== 'null') {
      const localtrack = await createAgoraVideoStream(selectedCamera, dispatch);
      if (localtrack) {
        AgoraRTC.checkVideoTrackIsActive(localtrack)
          .then(() => {
            if (document.getElementById('stream-test')) {
              document.getElementById('stream-test').innerHTML = '';
              localtrack.play('stream-test');
            }
          })
          .catch((e) => {
            console.log(e);
            console.log('check video track error!', e);
          });
        tracks.current = { ...tracks.current, video: localtrack };
        tracks_copy = { ...tracks };
        dispatch(
          setOngoingStream({
            ongoingStream: tracks_copy,
          })
        );
      }
      hotPlugginCameraListener();
      setCameraLoading(false);
      setShouldDisable(false);
      return;
    }
  };

  useEffect(() => {
    if (selectedCamera && selectedCamera !== 'null') {
      window?.gameClient?.logUserAction?.({
        eventName: 'CAMERA_SELECTED',
        eventSpecificData: JSON.stringify({
          deviceId: selectedCamera,
          displayName: cameraDeviceFullDetails?.label || 'null',
        }),
        beforeState: null,
        afterState: selectedCamera,
      });
    }
  }, [selectedCamera]);

  useEffect(() => {
    if (!loading) {
      if (!cameraLoading && selectedCamera !== 'null') {
        (() => {
          setCameraLoading(true);
        })();
        if (!shouldDisable) {
          (() => {
            setShouldDisable(true);
          })();
        }
      }
      changingCamera();
    }
  }, [selectedCamera, loading]);

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
        dispatch(
          setChangingDevice({
            label: changedDevice.device.label,
            id: changedDevice.device.deviceId,
          })
        );
        getCameraDeviceList();
        setSelectedCamera(changedDevice.device.deviceId);
        setCameraDeviceInfo(changedDevice.device);
        if (onChangeCamera) {
          onChangeCamera(changedDevice.device.deviceId);
        }
      } else {
        let oldCameras = await AgoraRTC.getCameras();
        oldCameras = oldCameras.filter(
          (device) =>
            ['default', 'communications'].indexOf(device.deviceId) === -1
        );
        getCameraDeviceList();
        if (oldCameras[0]) {
          setSelectedCamera(oldCameras[0].deviceId);
          setCameraDeviceInfo(oldCameras[0]);
          dispatch(
            setChangingDevice({
              label: oldCameras[0].label,
              id: oldCameras[0].deviceId,
            })
          );
          if (onChangeCamera) {
            onChangeCamera(oldCameras[0].deviceId);
          }
        } else {
          setSelectedCamera('null');
          setCameraDeviceInfo(null);
          if (onChangeCamera) {
            onChangeCamera('null');
          }
        }
      }
    };
  };

  const removeHotPlugginListener = () => {
    if (window.agoraClientPrimary) {
      window.agoraClientPrimary.hotPlugginListener();
    }
    if (enableVOG && window.agoraClientSecondary) {
      window.agoraClientSecondary.hotPlugginListener();
    }
    if (window.agoraClientThird) {
      window.agoraClientThird.hotPlugginListener();
    }
  };

  const handleChangeCamera = (_event, item) => {
    if (selectedCamera !== item.key) {
      setCameraLoading(true);
      setShouldDisable(true);
    }
    setSelectedCamera(item.key);

    setCameraDeviceInfo({ deviceId: item.key, label: item.text });
    if (onChangeCamera) {
      onChangeCamera(item.key);
    }
  };

  const handleChangeMicrophone = (_event, item) => {
    setSelectedMicrophone(item.key);
    if (onChangeMicrophone) {
      onChangeMicrophone(item.key);
    }
  };

  const isVideoAllowedNotUsed =
    window.agoraClientPrimary &&
    window.agoraClientPrimary.isVideoAllowedNotUsed();

  const isAudioAllowedNotUsed =
    window.agoraClientPrimary &&
    window.agoraClientPrimary.isAudioAllowedNotUsed();

  return loading ? (
    <Spinner styles={spinnerStyles} />
  ) : (
    <Fragment>
      <div className="device-selection ms-w-100">
        {(enableCameraAccess ||
          (enablePresenterCameraAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
            <div className="position-relative">
              {permissions.video && (
                <Fragment>
                  <Dropdown
                    key={ls.setNoCameras.text}
                    label={ls.camerasDropdown.label} // "Camera"
                    selectedKey={selectedCamera}
                    onChange={handleChangeCamera}
                    disabled={shouldDisable ? true : false}
                    placeholder={ls.camerasDropdown.placeholder} //"Select a camera"
                    options={cameras}
                    styles={dropDownStyles}
                  />
                  {isVideoAllowedNotUsed && (
                    <AllowDeviceIcon
                      size={{ top: '35px', left: 'unset', right: '-22.5px' }}
                    />
                  )}
                </Fragment>
              )}
              {!permissions.video && (
                <Fragment>
                  <div className="position-relative">
                    <PermissionIcon
                      size={{
                        fontSize: '20px',
                        top: '13%',
                        left: 'unset',
                        right: '2%',
                      }}
                    >
                      {({ onClick }) => {
                        return (
                          <div
                            onClick={onClick}
                            className="ms-Flex ms-Flex-justify-content-between ms-my-1"
                          >
                            <Label style={{ cursor: 'pointer' }}>
                              {ls.camerasDropdown.permissionError}
                            </Label>
                          </div>
                        );
                      }}
                    </PermissionIcon>
                  </div>
                </Fragment>
              )}
            </div>
          )}
        {(enableMicAccess ||
          (enablePresenterMicAccess &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
            <div className="position-relative">
              {permissions.audio && (
                <Fragment>
                  <Dropdown
                    label={ls.microphoneDropdown.label} // "Microphone"
                    selectedKey={selectedMicrophone}
                    onChange={handleChangeMicrophone}
                    placeholder={ls.microphoneDropdown.placeholder} // "Select a microphone"
                    options={microphones}
                    styles={dropDownStyles}
                  />
                  {isAudioAllowedNotUsed && (
                    <AllowDeviceIcon
                      size={{ top: '35px', left: 'unset', right: '-22.5px' }}
                    />
                  )}
                </Fragment>
              )}
              {!permissions.audio && (
                <Fragment>
                  <div className="position-relative">
                    <PermissionIcon
                      size={{
                        fontSize: '20px',
                        top: '4px',
                        left: 'unset',
                        right: '2%',
                      }}
                    >
                      {({ onClick }) => {
                        return (
                          <div
                            onClick={onClick}
                            className="ms-Flex ms-Flex-justify-content-between ms-my-1"
                          >
                            <Label style={{ cursor: 'pointer' }}>
                              {ls.microphoneDropdown.permissionError}
                            </Label>
                          </div>
                        );
                      }}
                    </PermissionIcon>
                  </div>
                </Fragment>
              )}
            </div>
          )}
        <div className="stream-test-wrapper">
          {cameraLoading ? <Spinner styles={cameraSpinnerStyles} /> : <></>}
          <div id="stream-test" />
        </div>
      </div>
    </Fragment>
  );
};
