import {
  Dropdown,
  Icon,
  Spinner,
  Toggle,
  PrimaryButton,
} from '@fluentui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from 'store/reducers/message';
import {
  createAgoraMicroPhoneStream,
  createAgoraVideoStream,
} from 'utils/common';
import { CHANNEL_PERMISSIONS } from 'constants/web';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { DialogBox } from 'components/common/DialogBox';
import { setDeviceIds, setSaveDeviceModal } from 'store/reducers/agora';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
  enableVOG,
} from 'utils/eventVariables';

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
    color: 'var(--sr-color-white)',
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

const contentStyle = {
  title: {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 24,
    lineHeight: 36,
  },
  inner: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  subText: {
    color: 'var(--sr-color-white)',
  },
};

const dialogStyles = {
  main: {
    width: '552px !important',
    maxWidth: '552px !important',
    height: 448,
    background: 'var(--sr-color-background-educateDialogStyles)',
  },
};

const buttonStyle = {
  height: 48,
  width: 170,
  fontSize: 16,
  lineHeight: 24,
};

const SaveDeviceModalComponent = () => {
  const {
    components: {
      panels: {
        game: {
          deviceSelectionModal: { saveDeviceModal: ls },
        },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const {
    microphoneId,
    cameraId,
    permissions,
    saveDeviceModal,
    user,
  } = useSelector((state) => state.agora);
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState(
    microphoneId || undefined
  );
  const [selectedCamera, setSelectedCamera] = useState(cameraId || undefined);
  const [showDeviceSelection, setShowDeviceSelection] = useState(false);
  const tracks = useRef({});

  useEffect(() => {
    if (saveDeviceModal.open && permissions.audio && permissions.video) {
      checkAudioVideoPermission();
    }
  }, [saveDeviceModal.open]);

  useEffect(() => {
    return () => {
      (() => {
        setShowDeviceSelection(false);
      })();
    };
  }, []);

  useEffect(() => {
    if (saveDeviceModal.open) {
      (() => {
        setSelectedMicrophone(saveDeviceModal.audio || undefined);
      })();
    }
  }, [saveDeviceModal.audio, saveDeviceModal.open]);

  useEffect(() => {
    if (saveDeviceModal.open) {
      (() => {
        setSelectedCamera(saveDeviceModal.video || undefined);
      })();
    }
  }, [saveDeviceModal.video, saveDeviceModal.open]);

  const checkAudioVideoPermission = async () => {
    setShowDeviceSelection(true);
    getDevicesList();
    if (selectedCamera) {
      changingCamera();
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
        setMicrophones(
          devices
            .filter(function (device) {
              return (
                device.kind === 'audioinput' &&
                ['default', 'communications'].indexOf(device.deviceId) === -1
              );
            })
            .map((deviceInfo) => ({
              key: deviceInfo.deviceId,
              text: deviceInfo?.label || 'null',
            }))
        );
        setCameras(
          devices
            .filter(function (device) {
              return (
                device.kind === 'videoinput' &&
                ['default', 'communications'].indexOf(device.deviceId) === -1
              );
            })
            .map((deviceInfo) => ({
              key: deviceInfo.deviceId,
              text: deviceInfo?.label || 'null',
            }))
        );
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        dispatch(
          setMessage({
            message:
              err.code === 'PERMISSION_DENIED'
                ? ls.permissionDeniedText
                : err.message,
          })
        );
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
        getDevicesList();
        setSelectedMicrophone(changedDevice.device.deviceId);
      } else {
        let oldMicrophones = await AgoraRTC.getMicrophones();
        oldMicrophones = oldMicrophones.filter(
          (device) =>
            ['default', 'communications'].indexOf(device.deviceId) === -1
        );
        getDevicesList();
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
        getDevicesList();
        setSelectedCamera(changedDevice.device.deviceId);
      } else {
        let oldCameras = await AgoraRTC.getCameras();
        oldCameras = oldCameras.filter(
          (device) =>
            ['default', 'communications'].indexOf(device.deviceId) === -1
        );
        getDevicesList();
        if (oldCameras[0]) {
          setSelectedCamera(oldCameras[0].deviceId);
        } else {
          setSelectedCamera(undefined);
        }
      }
    };
  };

  useEffect(() => {
    if (saveDeviceModal.open) {
      hotPlugginMicListener();
      hotPlugginCameraListener();
    }
  }, []);

  useEffect(() => {
    if (saveDeviceModal.open) {
      changingMicroPhone();
    }
  }, [selectedMicrophone]);

  const changingMicroPhone = async () => {
    if (tracks.current.audio && !selectedMicrophone) {
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
    if (tracks.current?.video && !selectedCamera) {
      if (document.getElementById('video-preview-stage')) {
        document.getElementById('video-preview-stage').innerHTML = '';
      }
      tracks.current = { ...tracks.current, video: null };
      hotPlugginCameraListener();
      return;
    }

    if (tracks.current?.video?.setDevice && selectedCamera) {
      await tracks.current.video.setDevice(selectedCamera);
      hotPlugginCameraListener();
      return;
    }

    if (!tracks.current?.video && selectedCamera) {
      const localtrack = await createAgoraVideoStream(selectedCamera, dispatch);
      if (localtrack) {
        AgoraRTC.checkVideoTrackIsActive(localtrack)
          .then(() => {
            if (document.getElementById('video-preview-stage')) {
              document.getElementById('video-preview-stage').innerHTML = '';
              localtrack.play('video-preview-stage');
            }
          })
          .catch((e) => {
            console.log(e);
            console.log('check video track error!', e);
          });
        tracks.current = { ...tracks.current, video: localtrack };
      }
      hotPlugginCameraListener();
      return;
    }
  };

  useEffect(() => {
    if (saveDeviceModal.open) {
      changingCamera();
    }
  }, [selectedCamera]);

  const closeModal = () => {
    dispatch(setSaveDeviceModal({ open: false }));
  };

  const handleChangeCamera = (_event, item) => {
    setSelectedCamera(item.key);
  };

  const handleChangeMicrophone = (_event, item) => {
    setSelectedMicrophone(item.key);
  };

  const handleToggleChangeCamera = (_event, checked) => {
    if (checked && cameras.length) {
      setSelectedCamera(cameras[0].key);
    } else {
      setSelectedCamera(undefined);
    }
  };

  const handleToggleChangeMicrophone = (_event, checked) => {
    if (checked && microphones.length) {
      setSelectedMicrophone(microphones[0].key);
    } else {
      setSelectedMicrophone(undefined);
    }
  };

  const onSave = () => {
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
        (enablePresenterCameraAccess &&
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

    let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS) || '{}';

    savedConfig = JSON.parse(savedConfig);

    savedConfig = {
      ...savedConfig,
      [saveDeviceModal.channel]: {
        audio: selectedMicrophone || null,
        video: selectedCamera || null,
        audioMuted: selectedMicrophone ? false : true,
        videoMuted: selectedCamera ? false : true,
      },
    };

    localStorage.setItem(CHANNEL_PERMISSIONS, JSON.stringify(savedConfig));

    try {
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.switchDevice(
          selectedMicrophone,
          selectedCamera,
          true
        );
      }
      if (enableVOG && window.agoraClientSecondary) {
        window.agoraClientSecondary.switchDevice(
          selectedMicrophone,
          selectedCamera,
          true
        );
      }
      if (window.agoraClientThird) {
        window.agoraClientThird.switchDevice(
          selectedMicrophone,
          selectedCamera,
          true
        );
      }
    } catch (error) {
      console.log(error, '>>>error');
    }
    setShowDeviceSelection(false);
    closeModal();
  };

  return (
    <DialogBox
      styles={dialogStyles}
      hidden={!showDeviceSelection}
      header={ls.showDeviceHeaderText}
      text={ls.showDeviceText}
      showClose={false}
      showOk={false}
      showFooter={false}
      innerStyle={contentStyle}
    >
      <div className="ms-Flex ms-Flex-justify-content-center">
        <div className="welcome-Container">
          <div className="device-Container ms-Flex ms-Flex-justify-content-center">
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
                    <div className="ms-w-100 ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center">
                      <Icon
                        iconName="VideoOff"
                        styles={deviceSelectionIconStyles}
                      />
                      <p className="device-Selection-Text">{ls.cameraText}</p>
                      <div
                        id="video-preview-stage"
                        className={`ms-w-100 ms-h-100 device-Preview ${
                          selectedCamera ? 'visible' : 'hidden'
                        }`}
                      />
                    </div>
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
                    <div className="ms-w-100 ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center">
                      <Icon
                        iconName="MicOff2"
                        styles={deviceSelectionIconStyles}
                      />
                      <p className="device-Selection-Text">
                        {ls.microphoneText}
                      </p>
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
                  </div>
                )}
              </>
            )}
          </div>
          <div className="ms-Flex ms-Flex-justify-content-center ms-mt-2">
            <PrimaryButton style={buttonStyle} onClick={onSave}>
              {ls.saveText}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </DialogBox>
  );
};

export const SaveDeviceModal = () => {
  const { saveDeviceModal } = useSelector((state) => state.agora);

  if (saveDeviceModal.open) {
    return <SaveDeviceModalComponent />;
  }

  return null;
};
