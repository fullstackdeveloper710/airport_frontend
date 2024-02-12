import React, { useState, Fragment, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nav } from '@fluentui/react';
import { registerIcons } from '@fluentui/react';
import { isGameStarted, isInGame, takeScreenshot } from 'utils/common';


import {
  setCurrent as setCurrentSmartScreen,
  setDialogOpen as setSmartScreenDialogOpen,
} from 'store/reducers/smartScreen';
import { setPanelName, openPanel } from 'store/reducers/panel';
import { getXPEventList } from 'store/reducers/agenda';
import { NotifierCircle } from 'components/common';
import { useEffect } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import {
  AllowDeviceIcon,
  PermissionIcon,
} from 'components/panels/game/deviceSelectionModal';
import {
  PresentDialog
} from 'components/dialogs';
import { setAudioLoading, setVideoLoading } from 'store/reducers/agora';
import { setMessage } from 'store/reducers/message';
import { setShowFacilitatorResources, setDialogOpen, setFacilitatorResourcesActive } from 'store/reducers/smartScreen';
import {
  setScreenshot
} from 'store/reducers/game';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { NavCollapseButton } from 'components/layout';
import { GAME_STAGE_IDLE, GAME_STAGE_AVATAR } from 'constants/game';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
  enableVOG,
} from 'utils/eventVariables';
import SvgProfileIcon from 'assets/images/icons/ProfileIcon';
import SvgAgendaIcon from 'assets/images/icons/AgendaIcon';
import SvgCamIcon from 'assets/images/icons/CamIcon';
import SvgCamOffIcon from 'assets/images/icons/CamOffIcon';
import SvgChatIcon from 'assets/images/icons/ChatIcon';
import SvgEmotesIcon from 'assets/images/icons/EmotesIcon';
import SvgHelpIcon from 'assets/images/icons/HelpIcon';
import SvgMapIcon from 'assets/images/icons/MapIcon';
import SvgMicIcon from 'assets/images/icons/MicIcon';
import SvgMicOffIcon from 'assets/images/icons/MicOffIcon';
import SvgSettingsIcon from 'assets/images/icons/SettingsIcon';
import SvgResourcesIcon from 'assets/images/icons/ResourcesIcon';
import { openSidePanel } from 'store/reducers/sidePanel';
import config from 'config';

const navStyles = {
  link: {
    padding: '0.5rem 0',
    height: 64,
  },
};

registerIcons({
  icons: {
    ProfileIcon: <SvgProfileIcon />,
    AgendaIcon: <SvgAgendaIcon />,
    VideoIcon: <SvgCamIcon />,
    VideoOffIcon: <SvgCamOffIcon />,
    ChatIcon: <SvgChatIcon />,
    EmotesIcon: <SvgEmotesIcon />,
    HelpIcon: <SvgHelpIcon />,
    MapIcon: <SvgMapIcon />,
    MicIcon: <SvgMicIcon />,
    MicOffIcon: <SvgMicOffIcon />,
    SettingsIcon: <SvgSettingsIcon />,
    ResourcesIcon: <SvgResourcesIcon />
  }
});

const spinnerStyles = {
  root: {
    margin: '0 1rem',
  },
  circle: {
    borderWidth: 2,
    width: 30,
    height: 30,
  },
};

let primary_nav = ['audio_call'];
let secondary_nav = [];
if (process.env.REACT_APP_PRIMARY_NAV_MENU) {
  const nav = JSON.parse(process.env.REACT_APP_PRIMARY_NAV_MENU);
  nav.forEach((v) => primary_nav.push(v));
}
if (process.env.REACT_APP_SECONDARY_NAV_MENU) {
  const nav = JSON.parse(process.env.REACT_APP_SECONDARY_NAV_MENU);
  nav.forEach((v) => secondary_nav.push(v));
}

export const Navigation = ({ showMouseKeyControlDialog, open, setOpen, ...props }) => {
  const {
    components: {
      layout: { navigation: ls },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const {
    channel,
    game,
    meetingPoll,
    panel,
    user
  } = useSelector((state) => state);
  const smartScreen = useSelector((state) => state.smartScreen);
  const isPresenter = user.current?.roles?.indexOf('ROLE_PRESENTER') !== -1;
  const haveingGodPermission = user.current?.roles?.indexOf('ROLE_EMCEE') > -1;
  const agora = useSelector((state) => state.agora);
  const [selectedKey, setSelectedKey] = useState(null);
  const [renderStatus, setRenderStatus] = useState(false);
  const [processingScreenShot, setProcessingScreenShot] = useState(false);
  const [dialog, setDialog] = useState(null);
  const audioChatPoll = useSelector((state) => state.audioChatPoll);

  const invitations = meetingPoll.list.filter(
    (item) =>
      item.dismissed &&
      (!window.gameClient ||
        window.gameClient.getCurrentRoomType() !== 'meeting' ||
        window.gameClient.getCurrentMeetingRoomName() !== item.meetingRoomName)
  );

  const audioTimeOutRef = useRef(null);
  const videoTimeOutRef = useRef(null);
  const permissionIconRef = useRef(null);
  const prevStage = useRef();

  const isVideoAllowedNotUsed =
    window.agoraClientPrimary &&
    window.agoraClientPrimary.isVideoAllowedNotUsed();

  const isAudioAllowedNotUsed =
    window.agoraClientPrimary &&
    window.agoraClientPrimary.isAudioAllowedNotUsed();

  const openSettingPanel = () => {
    dispatch(setPanelName('settings'));
    dispatch(openPanel(true));
  };

  const openResourcesPanel = () => {
    dispatch(setPanelName('resources'));
    dispatch(openPanel(true));
  };

  const isAudioPermission = agora.permissions.audio;
  const isVideoPermission = agora.permissions.video;

  const isInAvatarEditor = useMemo(
    () =>
      (game.currentRoom && game?.currentRoom?.nextMapName === 'AvatarEditor') ||
      [GAME_STAGE_IDLE, GAME_STAGE_AVATAR]?.includes(game.stage) ||
      (panel.isOpen && panel.panelName !== "chat"),
    [
      game.currentRoom,
      game?.currentRoom?.nextMapName,
      game?.stage,
      panel?.isOpen,
    ]
  );

  useEffect(() => {
    dispatch(getXPEventList({
      "userId": user.current.id,
      "experienceId": config.experience.mainExperienceId,
      "subExperienceId": user.eventID
    }));
  }, [user.eventID]);

  useEffect(() => {
    prevStage.current = game.stage;
  }, [game.stage]);

  const openSmartScreenDialog = () => {
    dispatch(setSmartScreenDialogOpen(true));
  };

  const showPresentation = (mode) => {
    setDialog(null);
    dispatch(setCurrentSmartScreen(mode));
    switch (mode) {
      case 'Idle':
        window.gameClient.setActiveSmartScreenMode('Idle');
        break;
      case 'WebBrowser':
        window.gameClient.setActiveSmartScreenMode(
          'WebBrowser',
          'https://google.com'
        );
        break;
      case 'Whiteboard':
        window.gameClient.setActiveSmartScreenMode('Whiteboard');
        break;
      case 'FacilitatorResources': {
        dispatch(setShowFacilitatorResources(true));
        dispatch(setFacilitatorResourcesActive(true));
        dispatch(setDialogOpen(false));
        break;
      }
      default:
        break;
    }
  };

  const handleGroupCall = () => {
    dispatch(openPanel(true));
    dispatch(setPanelName('group_call'));
  };

  const handleScreenshot = () => {
    if (game.screenshot) {
      dispatch(setScreenshot(null));
    } else {
      setProcessingScreenShot(true);
      takeScreenshot()
        .then((base64Image) => {
          setProcessingScreenShot(false);
          dispatch(setScreenshot(base64Image));
        })
        .catch(() => {
          setProcessingScreenShot(false);
        });
    }
  };

  const listNav = [
    {
      name: ls.listNav.profile,
      key: 'profile',
      iconProps: {
        iconName: 'ProfileIcon'
      },
      info: ls.listNav.profileInfo,
      title: ls.listNav.profileInfo,
    },
    {
      name: ls.listNav.map,
      key: 'map',
      disabled: !game.displayMapButton || isInAvatarEditor,
      iconProps: {
        iconName: 'MapIcon',
      },
      info: ls.listNav.mapInfo,
      title: ls.listNav.mapInfo,
    },
    {
      name: ls.listNav.emotes,
      key: 'resources',
      iconProps: {
        iconName: 'ResourcesIcon',
      },
      info: ls.listNav.emotesInfo,
      title: ls.listNav.emotesInfo,
    },
    {
      name: ls.listNav.agenda,
      key: 'agenda',
      disabled: !game.displayMapButton,
      iconProps: {
        iconName: 'AgendaIcon',
      },
      info: ls.listNav.agendaInfo,
      title: ls.listNav.agendaInfo,
    },
    {
      name: ls.listNav.chat,
      key: 'chat',
      disabled: isInAvatarEditor,
      iconProps: {
        iconName: 'ChatIcon',
      },
      info: ls.listNav.chatInfo,
      title: ls.listNav.chatInfo,
    },
    (enableCameraAccess ||
      (enablePresenterCameraAccess &&
        user?.current?.roles?.includes('ROLE_PRESENTER'))) && {
      name: ls.listNav.video,
      key: 'video',
      info: ls.listNav.videoInfo,
      title: ls.listNav.videoInfo,
      disabled: isInAvatarEditor
        ? true
        : agora.loading
          ? true
          : isVideoAllowedNotUsed
            ? false
            : !agora.videoAllowed,

      iconProps: {
        checked: agora.videoEnabled,
        iconName:
          !agora.loading && !agora.videoLoading
            ? !window.agoraClientPrimary?.useVideo
              ? 'VideoIcon'
              : agora.videoEnabled
                ? 'VideoIcon'
                : isVideoAllowedNotUsed
                  ? 'VideoIcon'
                  : 'VideoOffIcon'
            : '',
        className: `color-inherit ${isVideoAllowedNotUsed ? 'disabled' : ''}`,
      },
    },
    (enableMicAccess ||
      (enablePresenterMicAccess &&
        user?.current?.roles?.includes('ROLE_PRESENTER'))) && {
      name: ls.listNav.mic,
      key: 'mic',
      info: ls.listNav.micInfo,
      title: ls.listNav.micInfo,
      disabled: isInAvatarEditor
        ? true
        : agora.loading
          ? true
          : isAudioAllowedNotUsed
            ? false
            : !agora.audioAllowed,
      iconProps: {
        checked: agora.audioEnabled,
        iconName:
          !agora.loading && !agora.audioLoading
            ? !window.agoraClientPrimary?.useAudio
              ? 'MicIcon'
              : agora.audioEnabled
                ? 'MicIcon'
                : isAudioAllowedNotUsed
                  ? 'MicIcon'
                  : 'MicOffIcon'
            : '',
        className: `color-inherit ${isAudioAllowedNotUsed ? 'disabled' : ''}`,
      },
    },
    {
      name: ls.listNav.settings,
      key: 'settings',
      disabled: !isGameStarted(game.stage),
      iconProps: {
        iconName: 'SettingsIcon',
      },
      info: ls.listNav.settingsInfo,
      title: ls.listNav.settingsInfo,
    },
    {
      name: ls.listNav.screenshot,
      key: 'screenshot',
      disabled: !isInGame(game.stage),
      iconProps: {
        iconName: processingScreenShot ? '' : 'DesktopScreenshot',
      },
      info: ls.listNav.screenshotInfo,
      title: ls.listNav.screenshotInfo,
    },
    {
      name: ls.listNav.help,
      key: 'help',
      iconProps: {
        iconName: 'HelpIcon',
      },
      info: ls.listNav.helpInfo,
      title: ls.listNav.helpInfo,
    },
    {
      name: ls.listNav.emotes,
      key: 'emotes',
      disabled: !(
        game.data &&
        game.data.emotes &&
        game.data.emotes.list &&
        game.data.emotes.list.length
      ),
      iconProps: {
        iconName: 'EmotesIcon',
      },
      info: ls.listNav.emotesInfo,
      title: ls.listNav.emotesInfo,
    },
    {
      name: ls.listNav.info,
      key: 'info',
      info: ls.listNav.infoInfo,
      title: ls.listNav.infoInfo,
    }
  ];

  if (
    haveingGodPermission && enableVOG &&
    (enableMicAccess ||
      (enablePresenterMicAccess &&
        user?.current?.roles?.includes('ROLE_PRESENTER')))
  ) {
    const VOG = {
      name: ls.listNav.vog,
      key: 'vog',
      info: ls.listNav.vogInfo,
      title: ls.listNav.vogInfo,
      disabled: isInAvatarEditor
        ? true
        : agora.loading
          ? true
          : isAudioAllowedNotUsed
            ? false
            : !agora.audioAllowed,
      iconProps: {
        checked: agora.godEnabled,
        iconName:
          !agora.loading && !agora.audioLoading
            ? !window.agoraClientPrimary?.useAudio
              ? 'Streaming'
              : agora.godEnabled
                ? agora.godEnabled
                  ? 'Streaming'
                  : 'StreamingOff'
                : isAudioAllowedNotUsed
                  ? agora.godEnabled
                    ? 'Streaming'
                    : 'StreamingOff'
                  : 'StreamingOff'
            : '',
        className: `color-inherit ${isAudioAllowedNotUsed || !isAudioPermission ? 'disabled' : ''
          }`,
      },
    };
    let index = listNav.findIndex((v) => v.key === 'video');
    index > -1 && listNav.splice(index + 1, 0, VOG);
  }

  if (audioChatPoll && audioChatPoll.active) {
    const audioCall = {
      name: ls.listNav.audioCall,
      key: 'audio_call',
      iconProps: {
        iconName: 'Family',
      },
      info: ls.listNav.audioCallInfo,
      title: ls.listNav.audioCallInfo,
    };
    listNav.push(audioCall);
  }

  if (isPresenter) {
    const presentIcon = {
      name: ls.listNav.presentIcon,
      key: 'present',
      disabled: isInAvatarEditor || !smartScreen.available,
      iconProps: {
        iconName: 'Presentation12',
      },
      info: ls.listNav.presentIconInfo,
      title: ls.listNav.presentIconInfo,
    };
    listNav.push(presentIcon);
  }

  const toggleAudio = () => {
    dispatch(setAudioLoading(true));
    if (audioTimeOutRef.current) clearTimeout(audioTimeOutRef.current);
    audioTimeOutRef.current = setTimeout(() => {
      if (window.followRequestActive) {
        window.followRequestAudio = window.agoraClientPrimary?.audioEnabled
          ? false
          : true;
      }
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.toggleAudio();
      }
      if (window.agoraClientSecondary && !agora.godEnabled) {
        window.agoraClientSecondary.toggleAudio();
      }
      if (window.agoraClientThird) {
        window.agoraClientThird.toggleAudio();
      }
      if (window.agoraRTMClient) {
        window.agoraRTMClient.toggleAudio();
      }
    }, 1000);
  };

  const toggleVideo = () => {
    dispatch(setVideoLoading(true));
    if (videoTimeOutRef.current) clearTimeout(videoTimeOutRef.current);
    videoTimeOutRef.current = setTimeout(() => {
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.toggleVideo();
      }
      if (enableVOG && window.agoraClientSecondary) {
        window.agoraClientSecondary.toggleVideo();
      }
      if (window.agoraClientThird) {
        window.agoraClientThird.toggleVideo();
      }
    }, 1000);
  };

  const toggleGod = () => {
    console.log('toggle god: ');
    if (!agora.godEnabled) {
      window?.gameClient?.joinGodChannel();
      dispatch(
        setMessage({
          message: ls.toggleGod.joinGodChannel,
          type: 'info',
          timeout: -1,
        })
      );
    } else {
      window?.gameClient?.leaveGodChannel();
      dispatch(
        setMessage({
          message: ls.toggleGod.leaveGodChannel,
          type: 'info',
          timeout: -1,
        })
      );
    }
  };

  useEffect(() => {
    if (game.stage === 'entering' && panel.isOpen) {
      dispatch(openPanel(false));
    }
    if (!isInGame(game.stage)) {
      (() => {
        setOpen(false);
      })();
    }
  }, [game.stage]);

  useEffect(() => {
    if (!panel.isOpen) {
      setSelectedKey(null);
    }
  }, [panel.isOpen]);

  // Check which Nav Link is Pressed and Return that View
  const onLinkClick = (_ev, item) => {
    if (window.gameClient) {
      window.gameClient.logUserAction?.({
        eventName: 'NAVBAR_BUTTON',
        eventSpecificData: JSON.stringify({ button: item.key }),
        beforeState: null,
        afterState: null,
      });
    }

    if (item.key === 'resources') {
      openResourcesPanel()
      return;
    }

    if (item.key === 'video') {
      if (isVideoPermission) {
        isVideoAllowedNotUsed ? openSettingPanel() : toggleVideo();
      } else {
        permissionIconRef.current.permissionOnCick();
      }
      return;
    }

    if (item.key === 'mic') {
      if (isAudioPermission) {
        isAudioAllowedNotUsed ? openSettingPanel() : toggleAudio();
      } else {
        permissionIconRef.current.permissionOnCick();
      }
      return;
    }

    if (item.key === 'vog') {
      if (isAudioPermission) {
        isAudioAllowedNotUsed ? openSettingPanel() : toggleGod();
      } else {
        permissionIconRef.current.permissionOnCick();
      }
      return;
    }

    if (item.key === 'audio_call') {
      return handleGroupCall();
    }

    if (item.key === 'present') {
      return openSmartScreenDialog();
    }

    if (item.key === 'screenshot') {
      return handleScreenshot();
    }

    if (item.key === 'chat') {
      dispatch(openSidePanel(true))
    }

    if (panel.isOpen && item.key === panel.panelName) {
      dispatch(setPanelName(null));
      dispatch(openPanel(false));
    } else {
      if (item?.key) {
        dispatch(setPanelName(item.key));
        dispatch(openPanel(true));
        setSelectedKey(item.key);
      }
    }
  };

  const videoIconRender = (navLink) => {
    const loading = agora.loading || agora.videoLoading;
    return (
      <Fragment>
        <div
          id={`nav-${navLink.key}`}
          className={`left-menu-list ${!loading && (!isVideoPermission || isVideoAllowedNotUsed)
            ? 'w-space'
            : ''
            }`}
          ref={(el) => {
            if (!el) return;
            if (
              !renderStatus &&
              navLink.info &&
              isInGame(game.stage) &&
              !document.getElementById(`helptext-${navLink.key}`)
            ) {
              var elemDiv = document.createElement('div');
              elemDiv.innerText = navLink.info;
              elemDiv.id = `helptext-${navLink.key}`;
              elemDiv?.classList.add('helptext');
              elemDiv.style.cssText = `position:fixed;left:85px;color:white;display:flex;align-items:center;`;
              document.body.appendChild(elemDiv);
            }
          }}
        >
          {loading ? (
            <Spinner styles={spinnerStyles} />
          ) : (
            <Fragment>
              {isVideoPermission && (
                <Fragment>
                  {isVideoAllowedNotUsed && (
                    <AllowDeviceIcon size={{ top: '8px', left: '34px' }} />
                  )}
                </Fragment>
              )}
              {!isVideoPermission && (
                <PermissionIcon
                  blockClick
                  goToSetting
                  size={{ fontSize: '14px', top: '6px', left: '38px' }}
                  showIcon={window.agoraClientPrimary?.useVideo}
                />
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  };

  const defaultRender = (navLink) => (
    <Fragment>
      <div
        id={`nav-${navLink.key}`}
        className={`left-menu-list`}
        ref={(el) => {
          if (!el) return;
          if (!renderStatus && navLink.info && isInGame(game.stage)) {
            var elemDiv = document.createElement('div');
            elemDiv.innerText = navLink.info;
            elemDiv.id = `helptext-${navLink.key}`;
            elemDiv?.classList.add('helptext');
            elemDiv.style.cssText = `position:fixed;left:85px;color:white;display:flex;align-items:center;`;
            document.body.appendChild(elemDiv);
          }
          if (isInGame(game.stage)) {
            setRenderStatus(true);
          }
        }}
      >
        <div className={`navNotifier`}>
          {(navLink.key === 'chat' && channel?.boldList?.length > 0) ||
            (navLink.key === 'agenda' && invitations.length) ? (
            <NotifierCircle />
          ) : null}
        </div>
      </div>
    </Fragment>
  );

  const audioIconRender = (navLink) => {
    const loading = agora.loading || agora.audioLoading;
    return (
      <Fragment>
        <div
          id={`nav-${navLink.key}`}
          className={`left-menu-list ${!loading && (!isAudioPermission || isAudioAllowedNotUsed)
            ? 'w-space'
            : ''
            }`}
          ref={(el) => {
            if (!el) return;
            if (
              navLink.info &&
              isInGame(game.stage) &&
              !document.getElementById(`helptext-${navLink.key}`)
            ) {
              var elemDiv = document.createElement('div');
              elemDiv.innerText = navLink.info;
              elemDiv.id = `helptext-${navLink.key}`;
              elemDiv?.classList.add('helptext');
              elemDiv.style.cssText = `position:fixed;left:85px;color:white;display:flex;align-items:center;`;
              document.body.appendChild(elemDiv);
            }
          }}
        >
          {loading ? (
            <Spinner styles={spinnerStyles} />
          ) : (
            <Fragment>
              {isAudioPermission && (
                <Fragment>
                  {isAudioAllowedNotUsed && (
                    <AllowDeviceIcon size={{ top: '8px', left: '34px' }} />
                  )}
                </Fragment>
              )}
              {!isAudioPermission && (
                <PermissionIcon
                  goToSetting
                  blockClick
                  size={{ fontSize: '14px', top: '10px', left: '38px' }}
                  showIcon={window.agoraClientPrimary?.useAudio}
                />
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  };

  const godIconRender = (navLink) =>
    agora.loading || agora.audioLoading ? (
      <Spinner styles={spinnerStyles} />
    ) : (
      <Fragment>
        <div
          id={`nav-${navLink.key}`}
          className={`left-menu-list ${!isAudioPermission || isAudioAllowedNotUsed ? 'w-space' : ''
            }`}
          ref={(el) => {
            if (!el) return;
            if (
              navLink.info &&
              isInGame(game.stage) &&
              !document.getElementById(`helptext-${navLink.key}`)
            ) {
              var elemDiv = document.createElement('div');
              elemDiv.innerText = navLink.info;
              elemDiv.id = `helptext-${navLink.key}`;
              elemDiv?.classList.add('helptext');
              elemDiv.style.cssText = `position:fixed;left:85px;color:white;display:flex;align-items:center;`;
              document.body.appendChild(elemDiv);
            }
          }}
        >
          {isAudioPermission && (
            <Fragment>
              {isAudioAllowedNotUsed && (
                <AllowDeviceIcon size={{ top: '8px', left: '34px' }} />
              )}
            </Fragment>
          )}
          {!isAudioPermission && (
            <PermissionIcon
              goToSetting
              blockClick
              size={{ fontSize: '14px', top: '10px', left: '38px' }}
              showIcon={window.agoraClientPrimary?.useAudio}
            />
          )}
        </div>
      </Fragment>
    );

  const screenShotRender = processingScreenShot ? (
    <Fragment>
      <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
    </Fragment>
  ) : (
    <></>
  );

  const audioCallRender = <></>;

  const _onRenderLink = (navLink) => {
    switch (navLink.key) {
      case 'video':
        return videoIconRender(navLink);
      case 'mic':
        return audioIconRender(navLink);
      case 'vog':
        return enableVOG && godIconRender(navLink) || null;
      case 'screenshot':
        return screenShotRender;
      case 'audio_call':
        return audioCallRender;
      default:
        return defaultRender(navLink);
    }
  };

  const links = listNav.filter(
    (v) =>
      primary_nav.includes(v.key) || (open && secondary_nav.includes(v.key))
  );

  return (
    <Fragment>
      <Nav
        groups={[
          {
            links,
          },
        ]}
        className={open ? 'show-nav' : 'hide-nav'}
        styles={navStyles}
        onLinkClick={onLinkClick}
        onRenderLink={_onRenderLink}
        selectedKey={selectedKey}
      />
      <NavCollapseButton
        open={open}
        setOpen={setOpen}
        showMouseKeyControlDialog={showMouseKeyControlDialog}
      />
      <PermissionIcon showIcon={false} ref={permissionIconRef} />
      <PresentDialog
        open={smartScreen.dialogOpen}
        availableScreens={smartScreen.availableModes}
        onSelect={showPresentation}
      />
    </Fragment>
  );
};
