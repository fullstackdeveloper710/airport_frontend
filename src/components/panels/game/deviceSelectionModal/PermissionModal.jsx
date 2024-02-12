import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DialogBox } from 'components/common/DialogBox';
import { setPermissions, setPermissionModal } from 'store/reducers/agora';
import { Tutorial } from './Tutorial';
import { PrimaryButton } from '@fluentui/react';
import { getLocalStream } from 'utils/common';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
} from 'utils/eventVariables';

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

const educateDialogStyles = {
  main: {
    width: '90vw !important',
    height: '597px',
    maxWidth: '1244px !important',
    background: 'var(--sr-color-background-educateDialogStyles)',
    borderRadius: 16,
  },
};

const PERMISSION_ASK = 'permission_ask';
const PRESENTER_STAGE_PERMISSION_ASK = 'presenter_stage_permission_ask';

const buttonStyle = {
  height: 48,
  width: 170,
  fontSize: 16,
  lineHeight: 24,
};

export const PermissionModal = () => {
  const {
    components: {
      panels: {
        game: {
          deviceSelectionModal: { permissionModal: ls },
        },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const { permissionModal } = useSelector((state) => state.agora);
  const user = useSelector((store) => store.user);
  const { enteredIntoEvent, currentRoom } = useSelector((state) => state.game);
  const { is_in_stage } = useSelector((state) => state.teleportRequestPoll);

  useEffect(() => {
    if (
      (!(enableCameraAccess || enableMicAccess) &&
        !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
      (!(enablePresenterCameraAccess || enablePresenterMicAccess) &&
        user?.current?.roles?.includes('ROLE_PRESENTER'))
    ) {
      return;
    }
    checkAudioVideoPermission();
  }, []);

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

  const closePermissionModal = () => {
    dispatch(setPermissionModal({ ...permissionModal, open: false }));
  };

  const key = is_in_stage ? PRESENTER_STAGE_PERMISSION_ASK : PERMISSION_ASK;

  const close = (ask) => {
    if (ask) {
      localStorage.setItem(key, 'true');
    }
    closePermissionModal();
  };

  const hideModal = !!localStorage.getItem(key);

  const show = hideModal
    ? false
    : permissionModal.open &&
      enteredIntoEvent &&
      currentRoom &&
      currentRoom?.nextMapName !== 'AvatarEditor';

  return (
    <Fragment>
      {show && (
        <DialogBox
          styles={educateDialogStyles}
          hidden={!show}
          header={ls.dialogHeaderText}
          text=""
          showClose={false}
          showOk={false}
          showFooter={false}
          innerStyle={contentStyle}
        >
          <Tutorial>
            {(ask) => {
              return (
                <div className="ms-Flex ms-Flex-justify-content-center">
                  <PrimaryButton style={buttonStyle} onClick={() => close(ask)}>
                    {ls.okText}
                  </PrimaryButton>
                </div>
              );
            }}
          </Tutorial>
        </DialogBox>
      )}
    </Fragment>
  );
};
