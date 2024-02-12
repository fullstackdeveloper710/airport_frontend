import React, { Fragment, useEffect, useState } from 'react';
import { DialogBox } from 'components/common/DialogBox';
import { Tutorial } from './Tutorial';
import { Icon } from '@fluentui/react';
import { DefaultButton, PrimaryButton, Checkbox } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
} from 'utils/eventVariables';
import { useSelector } from 'react-redux';

const contentStyle = {
  title: {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 24,
    lineHeight: 36,
    marginTop: 22,
  },
  inner: {
    textAlign: 'center',
  },
  subText: {
    color: 'var(--sr-color-white)',
  },
};

const educataDialogStyles = {
  main: {
    width: '1024px !important',
    height: '545px',
    maxWidth: '1024px !important',
    background: 'var(--sr-color-background-educateDialogStyles)',
  },
};

const permisionDialogStyles = {
  main: {
    width: '552px !important',
    height: '552px',
    maxWidth: '552px !important',
    background: 'var(--sr-color-background-educateDialogStyles)',
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

const PERMISSION_ASK = 'welcome_screen_permission_ask';

const buttonStyle = {
  height: 48,
  width: 170,
  fontSize: 16,
  lineHeight: 24,
};

const permissionButtonStyle = {
  width: 283,
  height: 48,
  fontWeight: 600,
  fontSize: 16,
  lineHeight: 24,
};

const defaultButtonStyle = {
  root: {
    borderColor: 'var(--sr-color-white)',
    color: 'var(--sr-color-black)',
    background: 'var(--sr-color-transparent)',
    size: 20,
    width: 283,
    height: 48,
    marginTop: 15,
  },

  rootHovered: {
    borderColor: 'none',
    background: 'var(--sr-color-background-defaultButtonStyle-rootHovered)',
  },
  label: {
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 24,
  },
};

export const WelcomeScreenPermissionModal = () => {
  const {
    components: {
      panels: {
        game: {
          deviceSelectionModal: { welcomeScreenPermission: ls },
        },
      },
    },
  } = useLabelsSchema();
  const [open, setOpen] = useState(false);
  const [openTutorial, setOpenTutorial] = useState(false);
  const [ask, setAsk] = useState(false);
  const user = useSelector((store) => store.user);

  useEffect(() => {
    checkAudioVideoPermission();
  }, []);

  const checkAudioVideoPermission = async () => {
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
    if (result.video || result.audio) {
      localStorage.removeItem(PERMISSION_ASK);
    } else {
      setOpen(true);
    }
  };

  const togglePermissionModal = () => {
    setOpen((p) => !p);
  };

  const toggleTutorialModal = () => {
    setOpenTutorial((p) => !p);
  };

  const allowAccess = () => {
    if (ask) {
      localStorage.setItem(PERMISSION_ASK, 'true');
    }
    togglePermissionModal();
    toggleTutorialModal();
  };

  const hideModal = !!localStorage.getItem(PERMISSION_ASK);

  const show = hideModal ? false : open;

  const changeAskCheckBox = () => {
    setAsk((p) => !p);
  };

  const withOutAccess = () => {
    if (ask) {
      localStorage.setItem(PERMISSION_ASK, 'true');
    }
    togglePermissionModal();
  };

  return (
    <Fragment>
      {show && (
        <DialogBox
          styles={permisionDialogStyles}
          hidden={!show}
          header={ls.permissionHeaderText}
          text={ls.providePermissionMessage}
          showClose={false}
          showOk={false}
          showFooter={false}
          innerStyle={contentStyle}
        >
          <div className="ms-Flex ms-Flex-justify-content-center">
            <div className="welcome-Container">
              <div className="device-Container ms-Flex ms-Flex-justify-content-center">
                <>
                  {(enableCameraAccess ||
                    (enablePresenterCameraAccess &&
                      user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
                    <div className={`device-Selection device-Selection-Off`}>
                      <div className="ms-w-100 ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center">
                        <Icon
                          iconName="VideoOff"
                          styles={deviceSelectionIconStyles}
                        />
                        <p className="device-Selection-Text">{ls.cameraText}</p>
                      </div>
                    </div>
                  )}
                  {(enableMicAccess ||
                    (enablePresenterMicAccess &&
                      user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
                    <div className={`device-Selection device-Selection-Off`}>
                      <div className="ms-w-100 ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-center">
                        <Icon
                          iconName="MicOff2"
                          styles={deviceSelectionIconStyles}
                        />
                        <p className="device-Selection-Text">
                          {ls.microphoneText}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              </div>
              <div className="full-screenoption ms-my-1 ms-Flex ms-Flex-justify-content-center">
                <Checkbox
                  className="form-control"
                  label={ls.dontAskAgainText}
                  checked={ask}
                  onChange={changeAskCheckBox}
                />
              </div>
              <div className="ms-Flex ms-Flex-column ms-Flex-justify-content-center ms-Flex-align-items-center ms-mt-2">
                <PrimaryButton
                  style={permissionButtonStyle}
                  onClick={allowAccess}
                >
                  {ls.allowCamMicMessage}
                </PrimaryButton>
                <DefaultButton
                  onClick={withOutAccess}
                  text={ls.continueWithoutAccesText}
                  styles={defaultButtonStyle}
                />
              </div>
            </div>
          </div>
        </DialogBox>
      )}

      <DialogBox
        styles={educataDialogStyles}
        hidden={!openTutorial}
        header={ls.openTutorialHeaderText}
        text=""
        showClose={false}
        showOk={false}
        showFooter={false}
        innerStyle={contentStyle}
      >
        <Tutorial showCheckBox={false}>
          {() => {
            return (
              <div className="ms-Flex ms-Flex-justify-content-center">
                <PrimaryButton
                  style={buttonStyle}
                  onClick={toggleTutorialModal}
                >
                  {ls.okText}
                </PrimaryButton>
              </div>
            );
          }}
        </Tutorial>
      </DialogBox>
    </Fragment>
  );
};
