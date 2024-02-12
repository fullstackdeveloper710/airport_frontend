import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Notifications } from 'react-push-notification';
import { Fabric } from 'office-ui-fabric-react';
import { UAParser } from 'ua-parser-js';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {
  getGameServerURL,
  isGameStarted,
  isInGame
} from 'utils/common';
import { GalleryTimelineDialog } from 'components/dialogs';
import config from '../config';
import {
  GAME_STAGE_AVATAR,
  GAME_STAGE_ERROR,
  GAME_STAGE_EVENT,
  GAME_STAGE_IDLE,
  GAME_STAGE_IFRAME,
  GAME_STAGE_MEDIA,
  GAME_STAGE_MEETING,
  GAME_STAGE_NO_SERVERS,
  GAME_STAGE_INSTANCE_ERROR,
  GAME_STAGE_DUPLICATE_SESSION,
  GAME_STAGE_SLEEPING_SERVERS,
  GAME_STAGE_SHOW_PROFILE,
  GAME_STAGE_SMART_SCREEN,
  GAME_STAGE_SMART_SCREEN_FULLSCREEN,
  GAME_STAGE_ENTERING,
  GAME_STAGE_HANG_TIGHT,
  GAME_STAGE_FREEZE_FRAME,
} from 'constants/game';
//* Game Client, Agora & Related  *//
import { getValidChannelName } from 'utils/common';
import webSocketClient from '../lib/webSocketClient';

//* Redux's Reducers *//
import {
  setGodAllowed,
  setGodEnabled,
  setTwilioGodUserList,
} from 'store/reducers/agora';
import { setMessage } from 'store/reducers/message';
import {
  setRoomChannelName,
  endFollowPoll,
  endFollowRequestPoll,
} from 'store/reducers/followRequestPoll';
import { setIsInStage } from 'store/reducers/teleportRequestPoll';
import {
  setGameStage,
  setGameStart,
  setGameData,
  setStreamStats,
  setCloseTimeout,
  setCurrentRoom,
  setAvatarCustomization,
  pushGameStage,
  restoreGameStage,
  setDisplayMapButton,
  setEnteredIntoEvent,
  setZoneJoined,
} from 'store/reducers/game';
import { openPanel, setPanelData, setPanelName } from 'store/reducers/panel';
import {
  logout,
  setCurrentRoomLevel,
  setCurrentRoomType,
  initChatServices,
} from 'store/reducers/user';
import {
  cancelMeetingPoll,
  publishMeetingPoll,
} from 'store/reducers/meetingPoll';
import { endAudioChatPoll } from 'store/reducers/audioChatPoll';
import {
  setDialogOpen as setSmartScreenDialogOpen,
  setWhiteBoardURL,
  setWhiteBoardOpen,
  setShowFacilitatorResources,
  setShowFacilitatorResourcesMinimizeOpts,
} from 'store/reducers/smartScreen';
import { Navigation, Panels, VirtualClassroomNav } from 'components/layout';
import { MouseKeyControlDialog, HotPluggingDialog } from 'components/dialogs';
import { setMap, setCustomLocations } from 'store/reducers/event';
import {
  setAvailable as setSmartScreenAvailable,
  setName as setSmartScreenName,
  setAvailableModes as setSmartScreenAvailableModes,
  setCurrent as setCurrentSmartScreen,
  setVideoDuration,
  setVideoPlaying,
  setVideoFinished,
  setVideoTime,
} from 'store/reducers/smartScreen';
import { 
  openStyleStudio,
  setIsPodium,
  setStudioType,
  setItemId
} from 'store/reducers/styleStudio';
import { syncScreenSyncOnRoomEntered } from 'store/reducers/screenShare';
import { cssTransition, ToastContainer } from 'react-toastify';
import GameClient from 'utils/gameClient';
import spinnerLoader from 'assets/images/spinner-loader.svg';
import { FullScreen } from 'components/panels/game/fullScreen/FullScreen';
import { addOrRemovePresenter } from 'store/reducers/presenterPollList';
import { setOnlineUsers } from 'store/reducers/usersList';
import { newUserInfoMenu } from 'constants/web';
import manager from 'lib/agora/AgoraClientMgr';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
  enableVOG,
} from 'utils/eventVariables';
import store from 'store';
import { toggleScreenSharePlayerHandler } from 'utils/screenShareUtils';
import { Whiteboard } from 'components/panels/game/whiteboard';
import { FacilitatorResources } from 'components/panels/game/facilitatorResources';
import TourDialog from 'components/dialogs/TourDialog';
import VRConnectionsScreenDialog from 'components/dialogs/VRConnectionsScreenDialog';
import { setAgendaRole, setCurrent as setCurrentAgenda } from 'store/reducers/agenda';
import { preloadChunksSequentially } from 'utils/common';
let _cleartimeout = null;
const rootStyles = {
  root: {
    width: '100%',
    height: '100%',
  },
};

const subtitle_transistion = cssTransition({
  enter: 'subtitle-enter',
  exit: 'subtitle-exit',
});

export default () => {
  const {
    pages: { main: ls },
    eventspecific:{
      emirates: {
        style_studio: {
          uniform_guidelines: {
            uniform_content:{
              try_on: ssTryOn,
              uniform_gallery: ssGallery
            }
          }
        }
      }
    }
  } = useLabelsSchema();

  const {
    game,
    user,
    audioChatPoll,
    agora,
    teleportRequestPoll,
    panel,
    followRequestPoll,
    usersList,
  } = useSelector((state) => state);
  const history = useHistory();
  const dispatch = useDispatch();
  const [showMouseKeyControlDialog, setShowMouseKeyControlDialog] =
    useState(false);
  const [openNav, setOpenNav] = useState(false);
  const [vrConnectionShow, setVrConnectionShow] = useState(false);
  const [tourDialogShow, setTourDialogShow] = useState(false);
  const [showGalleryTimelineDialog, setShowGalleryTimelineDialog] =
    useState(false);
  const {
    videoDuration,
    videoPlaying,
    videoFinished,
    facilitatorResourcesActive,
  } = useSelector((state) => state.smartScreen);
  const {
    agendaCurrent
  } = useSelector((state)=> state.agenda)
  const { active, streamerData } = useSelector((state) => state.screenShare);
  const [showTutorial, setshowTutorial] = useState(false);
  const startTimeRef = useRef(null);
  const screenShareActive = useRef(active);
  const isVideoPlayerOpened = useRef(videoDuration);
  const isScreenSharePresenter = useRef(false);
  const isFacilitatorResourcesActive = useRef(null);
  // const videoPlayingAttendee = useRef(false)
  const videoFinishedActive = useRef(videoFinished);
  const videoPlayingActive = useRef(videoPlaying);
  const agendaCurrentActive = useRef(agendaCurrent)
  const restartedRef = useRef(null);
  const { current } = useSelector((state) => state.user);
  const is_presenter = current?.roles?.includes('ROLE_PRESENTER');
  const [roomJoined, setRoomJoined] = useState(false);
  const [isZoneStarted, setZoneStarted] = useState(false);
  const eventName = config.event.name;

  useEffect(() => {
    agendaCurrentActive.current = agendaCurrent
  }, [agendaCurrent])

  useEffect(() => {
    isFacilitatorResourcesActive.current = facilitatorResourcesActive;
  }, [facilitatorResourcesActive]);

  useEffect(() => {
    screenShareActive.current = active;
  }, [active]);

  useEffect(() => {
    isVideoPlayerOpened.current = videoDuration;
  }, [videoDuration]);

  useEffect(() => {
    isScreenSharePresenter.current = user.current.eventUserId
      ? streamerData?.presenter === user.current.eventUserId
      : false;
  }, [streamerData]);

  useEffect(() => {
    videoPlayingActive.current = videoPlaying;
  }, [videoPlaying]);

  useEffect(() => {
    videoFinishedActive.current = videoFinished;
  }, [videoFinished]);

  // Prevent attendee user click when follow requet is active
  useEffect(() => {
    if (isInGame(game.stage)) {
      if (window.followRequestActive && !is_presenter) {
        let playerarea = document.getElementById('streamingVideo');
        if (playerarea) {
          playerarea.addEventListener('click', showToast, false);
        }
      }
    }
    return () => {
      let playerarea = document.getElementById('streamingVideo');
      if (playerarea) {
        playerarea.removeEventListener('click', showToast, false);
      }
    };
  }, [isInGame(game.stage), !!followRequestPoll.active, roomJoined]);

  const showToast = () => {
    dispatch(
      setMessage({
        message: ls.cannotMoveInWhileInTourMessage,
      })
    );
  };

  const showToastKeydown = () => {
    if (
      event.keyCode == 65 ||
      event.keyCode == 83 ||
      event.keyCode == 87 ||
      event.keyCode == 68 ||
      event.keyCode == 38 ||
      event.keyCode == 40 ||
      event.keyCode == 37 ||
      event.keyCode == 39 ||
      (event.keyCode == 65 && event.shiftKey) ||
      (event.keyCode == 83 && event.shiftKey) ||
      (event.keyCode == 87 && event.shiftKey) ||
      (event.keyCode == 68 && event.shiftKey) ||
      (event.keyCode == 38 && event.shiftKey) ||
      (event.keyCode == 40 && event.shiftKey) ||
      (event.keyCode == 37 && event.shiftKey) ||
      (event.keyCode == 39 && event.shiftKey)
    ) {
      dispatch(
        setMessage({
          message: ls.cannotMoveInWhileInTourMessage,
        })
      );
    }
  };

  // prevent attendee keybord navigtion when follow requet is active
  useEffect(() => {
    if (isInGame(game.stage)) {
      if (window.followRequestActive && !is_presenter) {
        document.addEventListener('keydown', showToastKeydown, false);
      }
    }
    return () => {
      document.removeEventListener('keydown', showToastKeydown, false);
    };
  }, [isInGame(game.stage), !!followRequestPoll.active, roomJoined]);

  useEffect(() => {
    if (!window.followRequestActive && !is_presenter) {
      let playerarea = document.getElementById('streamingVideo');
      if (playerarea) {
        playerarea.removeEventListener('click', showToast, false);
      }
      document.removeEventListener('keydown', showToastKeydown, false);
    }
  }, [window.followRequestActive]);

  useEffect(() => {
    if (isInGame(game.stage)) {
      const getLastLogin = localStorage.getItem('new-user');
      if (getLastLogin) {
        var elms = document.querySelectorAll("[className='helptext']");
        for (var i = 0; i < elms.length; i++) elms[i].style.display = 'none';
      } else {
        (() => {
          setShowMouseKeyControlDialog(true);
          setshowTutorial(true);
        })();
        localStorage.setItem('new-user', true);
      }
    }
  }, [isInGame(game.stage)]);

  useEffect(() => {
    /*To display the mouse and key modal*/
    if (panel.panelName == 'Info') {
      (() => {
        setshowTutorial(panel.isOpen);
        setShowMouseKeyControlDialog(panel.isOpen);
      })();
      var elms = document.querySelectorAll("[className='helptext']");
      if (panel.isOpen) {
        for (let i = 0; i < elms.length; i++) elms[i].style.display = 'flex';
      } else {
        for (let j = 0; j < elms.length; j++) elms[j].style.display = 'none';
      }
    }
  }, [panel.isOpen, panel.panelName]);

  useEffect(() => {
    let _reactAppEventName = document.getElementById('sr__versionControl');
    let _gameVersion = document.getElementById('sr__gameVersion');
    if (typeof config.build === 'undefined') {
      _reactAppEventName.innerHTML = 'locallost';
      _gameVersion.innerHTML = 'locallost';
    } else {
      _reactAppEventName.innerHTML = eventName + '_' + config.build;
      _gameVersion.innerHTML = window.gameVersion;
    }
  }, []);

  useEffect(() => {
    let menuList = newUserInfoMenu;
    for (let i = 0; i < menuList.length; i++) {
      let currentElement = document.getElementById(`nav-${menuList[i]}`);
      if (currentElement) {
        currentElement = currentElement.getBoundingClientRect();
        let topPos = currentElement.top;
        const element = document.getElementById(`helptext-${menuList[i]}`);
        if (element) {
          element.style.top = `${topPos + 3}px`;
          element.style.display = showMouseKeyControlDialog ? 'flex' : 'none';
          element.style.zIndex = showMouseKeyControlDialog ? '99999' : '1';
        }
      }
    }
  }, [showMouseKeyControlDialog]);

  useEffect(() => {
    if (user.current && user.current.id && game.zoneJoined && !isZoneStarted) {
      (() => {
        setZoneStarted(true);
      })();
    }
  }, [user.current ? user.current.id : user.current, game.zoneJoined]);

  // Initial game setup upon user login
  useEffect(() => {
    if (user.current && user.current.id) {
      (() => {
        setWebSocketResponse();
        // Setup Game Connection
        setupGameConnection();
      })();
    } else {
      window.location.reload(true);
    }
    // eslint-disable-next-line
  }, [user.current ? user.current.id : user.current]);

  // init AGORA after game connection is made and player is about to enter the event
  useEffect(() => {
    if (
      !config.isSinglePlayer &&
      user.current &&
      user.current.id &&
      game.enteredIntoEvent &&
      isGameStarted(game.stage) &&
      !manager.initialized
    ) {
      (() => {
        // Setup Agora Connection
        console.log('->>[CHAT_SERVICE] create agora connections.');
        setupAgoraConnection();
      })();
    }
  }, [
    config.isSinglePlayer,
    game,
    user,
    audioChatPoll,
    agora,
    teleportRequestPoll,
    manager.initialized,
  ]);

  // Ask notification permission as soon as game is started
  useEffect(() => {
    askNotificationPermission();
  }, []);

  // add keyboard listener to blur active element
  useEffect(() => {
    const blurHandler = () => {
      if (document.activeElement.tagName !== 'INPUT') {
        document.activeElement.blur();
      }
    };
    document?.removeEventListener?.('keydown', blurHandler);
    document.addEventListener('keydown', blurHandler);

    return () => {
      document.removeEventListener('keydown', blurHandler);
    };
  }, []);
  // Make Ref to Active Audio Chat
  useEffect(() => {
    let gameClient = window?.gameClient;
    if (!gameClient) return;
    if (audioChatPoll.active) {
      gameClient.joinAudioCall(audioChatPoll.active.value.channelName);
    } else {
      gameClient.leaveAudioCall();
    }
  }, [audioChatPoll.active]);

  // Make Ref to Start Time
  useEffect(() => {
    startTimeRef.current = game.startTime;
  }, [game.startTime]);

  useEffect(() => {
    if (user.current && user.current.id) {
      if (usersList.onlineUsers.length > 0 && enableVOG) {
        let leftUsers = agora.godUserList.filter((v) => {
          return !usersList.onlineUsers.find((b) => v === b);
        });

        if (
          leftUsers.length > 0 &&
          usersList.onlineUsers.length &&
          usersList.onlineUsers[0] === user.current.eventUserId
        ) {
          const updatedList = agora.godUserList.filter(
            (v) => !leftUsers.includes(v)
          );
          dispatch(setTwilioGodUserList(updatedList));
        }
      }
    }
  }, [agora.godUserList.length, usersList.onlineUsers.length]);

  useEffect(() => {
    if (user.current && user.current.eventUserId && enableVOG) {
      let flag = agora.godEnabled && agora.audioEnabled;

      dispatch(setTwilioGodUserList(flag, user.current.eventUserId));
    }
  }, [agora.godEnabled && agora.audioEnabled]);

  /** Setting handler for reset afk timeout while is in smart-screen  */
  const handlerResetAFKTimeoutWhileInSmartScreen = () => {
    window?.gameClient?.resetAfkWarningTimer?.();
  };

  const setupGameConnection = () => {
    webSocketClient.startSession({
      event_name: config.event.name,
      user_id: user.current.id,
      email: user.current.email,
    });
  };

  const setWebSocketResponse = () => {
    // const userRole =
    //     user.current.roles.indexOf('ROLE_PRESENTER') > -1
    //       ? 'ROLE_PRESENTER'
    //       : 'ROLE_ATTENDEE';
    // const userRoles = [...user.current.roles];
    // if (userRoles.indexOf('ROLE_USER') > -1) {
    //   userRoles.push('ROLE_ATTENDEE');
    // }
    // const parser = new UAParser();
    // const userAgent = parser.getResult();
    // console.log(userAgent.os, userAgent.browser, '<<<<user.browser');
    // const gameServerURL = getGameServerURL({
    //   fullURL: "mm-uat.ixr.emirates.dev",
    //   userId: user.current.id,
    //   userName: `${user.current.firstName} ${user.current.lastName}`,
    //   userRoles,
    //   eventId: user.eventID,
    //   eventUserId: user.current.eventUserId,
    //   email: user.current.email,
    //   token: user.cmsToken,
    //   os: `${userAgent.os.name} ${
    //     userAgent.os.version ? userAgent.os.version : ''
    //   }`,
    //   browser: `${userAgent.browser.name} ${userAgent.browser.version}`,
    //   instanceId: "i-06c1ae03bf949f103"
    // });

    // if (window.gameClient) {
    //   window.gameClient.updateGameServerURL(gameServerURL);
    // } else {
    //   const gameClient = new GameClient(
    //     gameServerURL,
    //     user.current.eventUserId,
    //     userRole === 'ROLE_PRESENTER' ? 'presenter' : 'attendee',
    //     { redux: { dispatch } }
    //   );
    //   if (!gameClient) {
    //     throw new Error(ls.noGameServersAvailableMessage);
    //   }
    //   setupGameEventHandlers(gameClient);
    //   window.gameClient = gameClient;
    // }

    // window.gameClient.setup();

    webSocketClient.on('startsession_ready', (response) => {
      console.log('**INSIDE startsession_ready**');
      const userRole =
        user.oldUser.roles.indexOf('ROLE_PRESENTER') > -1
          ? 'ROLE_PRESENTER'
          : 'ROLE_ATTENDEE';
      const userRoles = [...user.oldUser.roles];
      if (userRoles.indexOf('ROLE_USER') > -1) {
        userRoles.push('ROLE_ATTENDEE');
      }

      const xpUserRole =
        user.current.roles.indexOf('ROLE_PRESENTER') > -1
          ? 'ROLE_PRESENTER'
          : 'ROLE_ATTENDEE';
      const xpUserRoles = [...user.current.roles];
      if (xpUserRoles.indexOf('ROLE_USER') > -1) {
        xpUserRoles.push('ROLE_ATTENDEE');
      }

      if (response?.full_url) {
        // Create the game client
        let url = response.full_url;
        window.instance_id = response.instance_id;
        if (process.env.REACT_APP_LOCALHOST_TESTING === 'true') {
          //Set REACT_APP_LOCALHOST_TESTING client .env flag to true in order to connect to the local cirrus server
          url = 'localhost';
        }
        const parser = new UAParser();
        const userAgent = parser.getResult();
        // console.log(userAgent.os, userAgent.browser, '<<<<user.browser');
        const gameServerURL = getGameServerURL({
          fullURL: url,
          // fullURL: "mm-uat.ixr.emirates.dev",
          userId: user.oldUser.id,
          userName: `${user.oldUser.firstName} ${user.oldUser.lastName}`,
          userRoles,
          eventId: user.oldEventID,
          eventUserId: user.oldUser.eventUserId,
          email: user.oldUser.email,
          token: user.xpToken,
          os: `${userAgent.os.name} ${
            userAgent.os.version ? userAgent.os.version : ''
          }`,
          browser: `${userAgent.browser.name} ${userAgent.browser.version}`,
          // instanceId: response.instance_id
        });

        if (window.gameClient) {
          window.gameClient.updateGameServerURL(gameServerURL);
        } else {
          const gameClient = new GameClient(
            gameServerURL,
            user.oldUser.eventUserId,
            userRole === 'ROLE_PRESENTER' ? 'presenter' : 'attendee',
            { redux: { dispatch } }
          );
          if (!gameClient) {
            throw new Error(ls.noGameServersAvailableMessage);
          }
          setupGameEventHandlers(gameClient);
          window.gameClient = gameClient;
        }

        window.gameClient.setup();
      }
    });
    webSocketClient.on('startsession_waking', () => {
      dispatch(setGameStage(GAME_STAGE_SLEEPING_SERVERS));
    });

    webSocketClient.on('startsession_error', () => {
      dispatch(setGameStage(GAME_STAGE_NO_SERVERS));
    });
    webSocketClient.on('startsession_ec2_error', () => {
      dispatch(setGameStage(GAME_STAGE_INSTANCE_ERROR));
    });
    webSocketClient.on('startsession_duplicate', () => {
      dispatch(setGameStage(GAME_STAGE_DUPLICATE_SESSION));
    });

    webSocketClient.on('startsession_noserver', () => {
      dispatch(setGameStage(GAME_STAGE_NO_SERVERS));
    });
    webSocketClient.on('startsession_hang_tight', () => {
      dispatch(setGameStage(GAME_STAGE_HANG_TIGHT));
    });
  };

  //** Agora Init & SetUp *//
  const createAgoraClientMgr = () => {
    /**
     * @type {AgoraClientMgrConfig}
     * @todo Remove redux property as they are imported directly from the AgoraClientMgr
     */
    const config = {
      eventUserId: user.current.eventUserId,
      user: user,
      redux: {
        dispatch: dispatch,
        state: {
          game,
          user,
          audioChatPoll,
          agora,
          teleportRequestPoll,
        },
      },
    };

    //* Instance Agora Manager                      *//
    manager.init(config);
  };

  const setupAgoraConnection = () => {
    // Check if browser is compatible with Agora
    if (AgoraRTC.checkSystemRequirements()) {
      // Setup Agora Client Connection
      createAgoraClientMgr();
      window.agoraMgr = manager;
      manager.subscribeAgoraListeners();
      if (
        enableCameraAccess ||
        enableMicAccess ||
        enablePresenterCameraAccess ||
        enablePresenterMicAccess
      ) {
        if (window.agoraClientPrimary) {
          window.agoraClientPrimary.switchDevice(
            agora.microphoneId,
            agora.cameraId
          );
        }
        if (enableVOG && window.agoraClientSecondary) {
          window.agoraClientSecondary.switchDevice(
            agora.microphoneId,
            agora.cameraId
          );
        }
        if (window.agoraClientThird) {
          window.agoraClientThird.switchDevice(
            agora.microphoneId,
            agora.cameraId
          );
        }
      }
      if (window.gameClient) {
        window.gameClient.unMuteWebRtcPlayer();
      }
    } else {
      dispatch(
        setMessage({
          message: ls.browserNotCompatibleMessage,
          timeout: -1,
        })
      );
    }
  };

  const endAudioCall = () => {
    dispatch(endAudioChatPoll());
  };

  const startAgoraClientPrimary = async ({ gameClient, ...obj }) => {
    const is_presenter = user.current.roles.includes('ROLE_PRESENTER');
    window.is_presenter = is_presenter;
    const gameCurrentRoomName = window.gameClient.getCurrentRoomName();
    if (window.followRequestActive && is_presenter) {
      let channel = user.current.eventUserId;
      if (window.currentRoomName !== gameCurrentRoomName) {
        channel = channel + Math.random();
      }

      if (gameCurrentRoomName.includes('meetingroom')) {
        const meetingroomName = window.gameClient.getCurrentMeetingRoomName();
        channel = obj.channel + '@meetingroom:' + meetingroomName;
      }
      await window.agoraClientPrimary.switchChannel({
        channel,
        attendeeMode: gameClient.getPlayerRole(),
        audio: true,
        video: true,
        presenterVideo: obj.isPresentingRoom,
        isMeetingRoom: obj.isMeetingRoom,
        channelType: 'room-joined',
      });
    } else {
      if (window.followRequestActive) {
        return;
      }
      await window.agoraClientPrimary.switchChannel({
        channel: obj.channel,
        attendeeMode: gameClient.getPlayerRole(),
        audio: gameClient.getPlayerRole() === 'presenter',
        video: obj.isMeetingRoom && gameClient.getPlayerRole() === 'presenter',
        presenterVideo: obj.isMeetingRoom,
        isMeetingRoom: obj.isMeetingRoom,
        channelType: 'room-joined',
      });
    }
    window.currentRoomName = window.gameClient.getCurrentRoomName();
  };

  const setupGameEventHandlers = (gameClient) => {
    gameClient.on('initialized', () => {
      dispatch(setIsInStage(false));
      dispatch(setGameStage(GAME_STAGE_IDLE));
    });
    gameClient.on('handleJoinRoomComplete', () => {
      dispatch(setGameStart());
    });
    gameClient.on('avatar-editor-opened', () => {
      dispatch(pushGameStage(GAME_STAGE_AVATAR));
    });
    gameClient.on('avatar-editor-closed', () => {
      dispatch(restoreGameStage());
    });

    gameClient.on('set-online-users', (data) => {
      dispatch(setOnlineUsers(data));
    });

    gameClient.on('room-joined', async ({ roomType, roomName }) => {
      dispatch(setIsInStage(false));
      console.log('@@@ room-joined Main');
      dispatch(
        setGameStage(
          roomType === 'meeting' ? GAME_STAGE_MEETING : GAME_STAGE_EVENT
        )
      );
      console.log("NEXT ROM NAME", roomName)
      if(!roomName?.includes("breakout") && !roomName?.includes("classroomlobby")){
        dispatch(setCurrentAgenda(null))
        dispatch(setAgendaRole(null))
      }

      if (window.gameClient) {
        window.gameClient.currentZone = null;
      }

      dispatch(setZoneJoined(false));

      // End Audio Call
      endAudioCall();

      // Primary agora channel is room channel
      const channelNamePrimary = config.experience.subExperienceId + '-' + roomName;
      if (enableVOG) {
        dispatch(setGodAllowed(user.current.roles.indexOf('ROLE_EMCEE') > -1));
        dispatch(setGodEnabled(false));
      }
      let channel = getValidChannelName(channelNamePrimary);

      if (
        enableCameraAccess ||
        enableMicAccess ||
        enablePresenterCameraAccess ||
        enablePresenterMicAccess
      ) {
        // Secondary agora channel is god channel
        const channelNameSecondary = enableVOG ? config.experience.subExperienceId + '-god' : '';

        // Third agora channel is mic channel
        const channelNameThird = config.experience.subExperienceId + '-' + roomName + '-mic';

        const isPresentingRoom = ['session', 'meeting'].indexOf(roomType) > -1;

        const isMicRoom = roomType === 'club';

        const isMeetingRoom = roomType === 'meeting';

        if (isMeetingRoom) {
          // Send meeting invite to himself, so that he can also be the attendee of the meeting
          dispatch(
            publishMeetingPoll(
              {
                meetingRoomName: window.gameClient.getCurrentMeetingRoomName(),
                organizer: user.current.id,
                invites: [],
              },
              false
            )
          );
        }

        if (isPresentingRoom || isMicRoom) {
          // Close Chat Panel
          dispatch(setPanelName(null));
          dispatch(openPanel(false));
        }

        dispatch(setRoomChannelName(channel));
        dispatch(syncScreenSyncOnRoomEntered());
        if (window.agoraClientPrimary) {
          dispatch(addOrRemovePresenter(false, { channel }));
          await startAgoraClientPrimary({
            gameClient,
            channel,
            attendeeMode: gameClient.getPlayerRole(),
            audio: gameClient.getPlayerRole() === 'presenter',
            video:
              isPresentingRoom && gameClient.getPlayerRole() === 'presenter',
            presenterVideo: isPresentingRoom,
            isMeetingRoom: isMeetingRoom,
            channelType: 'room-joined',
            is_presenter: user.current.roles.includes('ROLE_PRESENTER'),
          });
        }
        if (enableVOG && window.agoraClientSecondary) {
          let channelOption = {
            channel: getValidChannelName(channelNameSecondary),
            attendeeMode: 'attendee',
            audio: false,
            video: false,
            presenterVideo: false,
            isMeetingRoom: false,
          };

          await window.agoraClientSecondary.switchChannel(channelOption);
        }
        if (window.agoraClientThird) {
          if (isMicRoom) {
            await window.agoraClientThird.switchChannel({
              channel: getValidChannelName(channelNameThird),
              attendeeMode: 'attendee',
              audio: false,
              video: false,
              presenterVideo: true,
              isMeetingRoom: false,
              noBackground: true,
            });
          } else {
            await window.agoraClientThird.leaveChannel();
          }
        }
      }
      if (window.agoraScreenShare) {
        await window.agoraScreenShare.switchChannel({
          channel: channel + '-screen-share',
        });
      }
    });
    gameClient.on('sit-at-table', async ({ roomType, roomName, table }) => {
      if (
        !(enableCameraAccess || enableMicAccess) &&
        !(enablePresenterCameraAccess || enablePresenterMicAccess)
      ) {
        return;
      }
      dispatch(setZoneJoined(false));
      // Close Chat Panel
      dispatch(setIsInStage(false));
      dispatch(setPanelName(null));
      dispatch(openPanel(false));

      if (window.gameClient) {
        window.gameClient.currentZone = null;
      }

      // End Audio Call
      endAudioCall();

      // VoG permissions
      if (enableVOG) {
        dispatch(setGodAllowed(user.current.roles.indexOf('ROLE_EMCEE') > -1));
        dispatch(setGodEnabled(false));
      }

      // Primary agora channel is table channel
      const channelNamePrimary = config.experience.subExperienceId + '-' + table;

      // Secondary channel is god channel
      const channelNameSecondary = enableVOG ? config.experience.subExperienceId + '-god' : '';

      // Third channel is mic channel
      const channelNameThird = config.experience.subExperienceId + '-' + roomName + '-mic';

      const isMicRoom = roomType === 'club';

      if (window.agoraClientPrimary) {
        dispatch(addOrRemovePresenter(false, { channel: channelNamePrimary }));
        await window.agoraClientPrimary.switchChannel({
          channel: getValidChannelName(channelNamePrimary),
          attendeeMode: 'presenter',
          audio: true,
          video: true,
          presenterVideo: false,
          isMeetingRoom: false,
        });
      }

      if (enableVOG && window.agoraClientSecondary) {
        await window.agoraClientSecondary.switchChannel({
          channel: getValidChannelName(channelNameSecondary),
          attendeeMode: 'attendee',
          audio: false,
          video: false,
          presenterVideo: false,
          isMeetingRoom: false,
        });
      }

      if (window.agoraClientThird) {
        if (isMicRoom) {
          await window.agoraClientThird.switchChannel({
            channel: getValidChannelName(channelNameThird),
            attendeeMode: 'attendee',
            audio: false,
            video: false,
            presenterVideo: true,
            isMeetingRoom: false,
            noBackground: true,
          });
        } else {
          window.agoraClientThird.leaveChannel();
        }
      }
    });

    gameClient.on('god-joined', async ({ roomType, roomName, table }) => {
      if (!enableVOG) {
        return;
      }

      if (
        !(enableCameraAccess || enableMicAccess) &&
        !(enablePresenterCameraAccess || enablePresenterMicAccess)
      ) {
        return;
      }
      dispatch(setGodEnabled(true));

      // End Audio Call
      endAudioCall();

      // Primary agora channel is god channel
      const channelNamePrimary = config.experience.subExperienceId + '-god';

      const isMicRoom = roomType === 'club';
      const isOnMic = table && table.search('clubmicrophone') > -1;

      // Second agora channel is room or table channel
      const channelNameSecondary = enableVOG
        ? config.experience.subExperienceId + '-' + (!isOnMic && table ? table : roomName)
        : '';

      // Third agora channel is mic channel
      const channelNameThird = config.experience.subExperienceId + '-' + roomName + '-mic';

      if (window.agoraClientPrimary) {
        await window.agoraClientPrimary.switchChannel({
          channel: getValidChannelName(channelNamePrimary),
          attendeeMode: 'presenter',
          audio: true,
          video: false,
          presenterVideo: false,
          isMeetingRoom: false,
        });
      }

      if (enableVOG && window.agoraClientSecondary) {
        await window.agoraClientSecondary.switchChannel({
          channel: getValidChannelName(channelNameSecondary),
          attendeeMode: 'attendee',
          audio: false,
          video: false,
          presenterVideo: false,
          isMeetingRoom: false,
        });
      }

      if (window.agoraClientThird) {
        if (isMicRoom) {
          await window.agoraClientThird.switchChannel({
            channel: getValidChannelName(channelNameThird),
            attendeeMode: 'attendee',
            audio: false,
            video: false,
            presenterVideo: true,
            isMeetingRoom: false,
            noBackground: true,
          });
        } else {
          window.agoraClientThird.leaveChannel();
        }
      }
    });

    gameClient.on('mic-joined', async ({ roomName }) => {
      if (
        !(enableCameraAccess || enableMicAccess) &&
        !(enablePresenterCameraAccess || enablePresenterMicAccess)
      ) {
        return;
      }
      dispatch(setZoneJoined(false));
      // event: god-joined

      // End Audio Call
      endAudioCall();

      // Close Chat Panel
      dispatch(setPanelName(null));
      dispatch(openPanel(false));

      // Primary agora channel is mic channel
      const channelNamePrimary = config.experience.subExperienceId + '-' + roomName + '-mic';

      // Second agora channel is god channel
      const channelNameSecondary = enableVOG ? config.experience.subExperienceId + '-god' : '';

      // Third agora channel is room channel
      const channelNameThird = config.experience.subExperienceId + '-' + roomName;

      if (window.agoraClientPrimary) {
        dispatch(addOrRemovePresenter(false, { channel: channelNamePrimary }));
        await window.agoraClientPrimary.switchChannel({
          channel: getValidChannelName(channelNamePrimary),
          attendeeMode: 'presenter',
          audio: true,
          video: true,
          presenterVideo: true,
          isMeetingRoom: false,
          noBackground: true,
        });
      }
      if (enableVOG && window.agoraClientSecondary) {
        await window.agoraClientSecondary.switchChannel({
          channel: getValidChannelName(channelNameSecondary),
          attendeeMode: 'attendee',
          audio: false,
          video: false,
          presenterVideo: false,
          isMeetingRoom: false,
        });
      }
      if (window.agoraClientThird) {
        await window.agoraClientThird.switchChannel({
          channel: getValidChannelName(channelNameThird),
          attendeeMode: 'attendee',
          audio: false,
          video: false,
          presenterVideo: false,
          isMeetingRoom: false,
        });
      }
    });

    // Leave presenter zone
    gameClient.on('leave-presenter-zone', async () => {
      dispatch(setZoneJoined(true));

      dispatch(
        addOrRemovePresenter(false, {
          channel: window.agoraClientPrimary.channel,
        })
      );
    });

    gameClient.on('zone-joined', async ({ zone, role }) => {
      if (
        !(enableCameraAccess || enableMicAccess) &&
        !(enablePresenterCameraAccess || enablePresenterMicAccess)
      ) {
        return;
      }
      if (gameClient.getCurrentMeetingRoomName().includes('DevAgora')) {
        setRoomJoined(true);
        window.followRequestActive = false;
        dispatch(endFollowPoll());
        handleUnfollowTourGuide();
      }

      // End Audio Call
      endAudioCall();

      if (role === 'presenter' && window.followRequestActive) {
        window.followRequestActive = false;
        dispatch(endFollowPoll());
      }
      if (role === 'attendee' && window.followRequestActive) {
        window.followRequestActive = false;
        handleUnfollowTourGuide();
      }
      const followerTimeOut = window.followRequestActive ? 6000 : 0;
      setTimeout(async () => {
        // Primary agora channel is zone channel
        const channelNamePrimary = config.experience.subExperienceId + '-zone-' + zone;

        // Secondary agora channel is god channel
        const channelNameSecondary = enableVOG ? config.experience.subExperienceId + '-god' : '';

        if (enableVOG) {
          dispatch(
            setGodAllowed(
              user.current.roles.indexOf('ROLE_EMCEE') > -1 &&
                role === 'presenter'
            )
          );
          dispatch(setGodEnabled(false));
        }

        // Close Chat Panel
        dispatch(setPanelName(null));
        dispatch(openPanel(false));
        const primaryChannel = getValidChannelName(channelNamePrimary);
        localStorage.setItem('channel_info', primaryChannel);
        dispatch(setIsInStage(role === 'presenter'));
        dispatch(setZoneJoined(true));

        const is_presenter = user.current.roles.includes('ROLE_PRESENTER');

        if (window.agoraClientPrimary) {
          dispatch(
            addOrRemovePresenter(role === 'presenter', {
              channel: primaryChannel,
            })
          );
          await window.agoraClientPrimary.switchChannel({
            channel: primaryChannel,
            attendeeMode: role,
            audio: role === 'presenter' ? true : false,
            video: role === 'presenter' ? true : false,
            presenterVideo: true,
            isMeetingRoom: true,
            is_presenter,
            channelType: 'zone-joined',
            is_in_stage: is_presenter && role === 'presenter',
          });
        }

        if (enableVOG && window.agoraClientSecondary) {
          await window.agoraClientSecondary.switchChannel({
            channel: getValidChannelName(channelNameSecondary),
            attendeeMode: 'attendee',
            audio: false,
            video: false,
            presenterVideo: false,
            isMeetingRoom: false,
            is_presenter,
          });
        }

        if (window.agoraClientThird) {
          window.agoraClientThird.leaveChannel();
        }
      }, followerTimeOut);
    });

    gameClient.on(
      'audio-call-joined',
      async ({ roomType, roomName, channel }) => {
        if (
          !(enableCameraAccess || enableMicAccess) &&
          !(enablePresenterCameraAccess || enablePresenterMicAccess)
        ) {
          return;
        }
        dispatch(setGodEnabled(false));
        dispatch(setZoneJoined(false));

        if (window.gameClient) {
          window.gameClient.currentZone = null;
        }

        // Primary agora channel is audio chat channel
        const channelNamePrimary = channel;

        // Secondary channel is god channel
        const channelNameSecondary = enableVOG ? config.experience.subExperienceId + '-god' : '';

        // Third channel is mic channel
        const channelNameThird = config.experience.subExperienceId + '-' + roomName + '-mic';

        const isMicRoom = roomType === 'club';

        if (window.agoraClientPrimary) {
          dispatch(
            addOrRemovePresenter(false, { channel: channelNamePrimary })
          );
          await window.agoraClientPrimary.switchChannel({
            channel: getValidChannelName(channelNamePrimary),
            attendeeMode: 'presenter',
            audio: true,
            video: false,
            presenterVideo: false,
            isMeetingRoom: false,
          });
        }
        if (enableVOG && window.agoraClientSecondary) {
          window.agoraClientSecondary.switchChannel({
            channel: getValidChannelName(channelNameSecondary),
            attendeeMode: 'attendee',
            audio: false,
            video: false,
            presenterVideo: false,
            isMeetingRoom: false,
          });
        }
        if (window.agoraClientThird) {
          if (isMicRoom) {
            window.agoraClientThird.switchChannel({
              channel: getValidChannelName(channelNameThird),
              attendeeMode: 'attendee',
              audio: false,
              video: false,
              presenterVideo: true,
              isMeetingRoom: false,
              noBackground: true,
            });
          } else {
            window.agoraClientThird.leaveChannel();
          }
        }
      }
    );

    gameClient.on('room-left', () => {
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.leaveChannel();
      }
      if (enableVOG && window.agoraClientSecondary) {
        window.agoraClientSecondary.leaveChannel();
      }
      if (gameClient.getCurrentRoomType() === 'meeting') {
        dispatch(
          cancelMeetingPoll(
            gameClient.getCurrentMeetingRoomName(),
            user.current.id
          )
        );
      }
    });

    gameClient.on('product-clicked', ({ sku }) => {
      dispatch(setPanelData({ sku }));
      dispatch(setPanelName('product'));
      dispatch(openPanel(true));
    });

    gameClient.on('open-iframe', ({ type, url }) => {
      if (game.data && game.data.url) {
        dispatch(
          setMessage({
            message: ls.iFrameAlreadyOpenedMessage,
          })
        );
      } else if (!url) {
        dispatch(setMessage({ message: ls.iFrameInvalidURLMessage }));
      } else {
        dispatch(setGameData({ type, url }));
        if (type === 'website' || type === 'link') {
          dispatch(setGameStage(GAME_STAGE_IFRAME));
        } else {
          dispatch(setGameStage(GAME_STAGE_MEDIA));
        }
      }
    });

    gameClient.on('websocket-error', () => {
      console.error(
        `[Main] on websocket-error: reset components sequence initiated.`
      );

      console.warn('[Main.jsx] on websocket-error: close chat panels.');

      // End Audio Call
      endAudioCall();

      // Close Chat Panel
      dispatch(setPanelName(null));
      dispatch(openPanel(false));

      // leave agora channels.
      console.warn('[Main.jsx] on websocket-error: leave all agora channels.');
      if (window.agoraClientPrimary) {
        window.agoraClientPrimary.leaveChannel();
      }
      if (enableVOG && window.agoraClientSecondary) {
        window.agoraClientSecondary.leaveChannel();
      }
      if (window.agoraClientThird) {
        window.agoraClientThird.leaveChannel();
      }

      console.log(`[Main] on websocket-error: set error panel.`);
      dispatch(setGameStage(GAME_STAGE_ERROR));

      webSocketClient.setAvailable();
      window?.gameClient?.logUserAction?.({
        eventName: 'LOGOUT',
        eventSpecificData: JSON.stringify({
          method: 'Closeout',
        }),
        beforeState: JSON.stringify({
          mapName: game?.currentRoom?.nextMapName,
        }),
        afterState: null,
      });
      dispatch(logout());
    });

    gameClient.on('restart', () => {
      restartedRef.current = true;

      setupGameConnection();
    });

    gameClient.on('emotes-list-loaded', ({ list }) => {
      dispatch(setGameData({ emotes: { list } }));
    });

    gameClient.on('receive-level-name', (payload) => {
      dispatch(setCurrentRoomLevel(payload.room_name));
      dispatch(setCurrentRoomType(payload.room_type));
    });

    gameClient.on('player-distances', (playerDistances) => {
      window.playerDistances = playerDistances;

      for (const playerDistance of playerDistances) {
        // only the first channel has listeners attached
        // spatial audio only works for the room channel
        // in case of god, it's second agora client
        // in case of mic, it's third agora client
        if (window.agoraClientPrimary) {
          window.agoraClientPrimary.setPlayerVolumeWithDistance(playerDistance);
        }
        if (window.agoraClientSecondary && window.gameClient?.godJoined) {
          window.agoraClientSecondary.setPlayerVolumeWithDistance(
            playerDistance
          );
        }
        if (window.agoraClientThird && window.gameClient?.micJoined) {
          window.agoraClientThird.setPlayerVolumeWithDistance(playerDistance);
        }
      }
    });

    gameClient.on('click-on-other-player', (payload) => {
      dispatch(setGameStage(GAME_STAGE_SHOW_PROFILE));
      dispatch(setGameData(payload));
    });
    gameClient.on('smart-screen-become-available', (payload) => {
      console.log('===smart-screen-become-available');
      dispatch(setSmartScreenName(payload.screenName));
      dispatch(setSmartScreenAvailable(true));
      // if (payload.availableScreenModes) {
      //   dispatch(setSmartScreenAvailableModes(payload.availableScreenModes));
      // }
      if (payload.availableScreenModes) {
        const availableModes = payload.availableScreenModes;
        availableModes.push('FacilitatorResources');
        const filteredModes = availableModes.filter((mode) => {
          return mode !== 'Idle';
        });
        dispatch(setSmartScreenAvailableModes(filteredModes));
      }
      /** Triggering remove of event listner in case that exists already at document level*/
      window?.document?.removeEventListener(
        'mousemove',
        handlerResetAFKTimeoutWhileInSmartScreen
      );
      window?.document?.removeEventListener(
        'keydown',
        handlerResetAFKTimeoutWhileInSmartScreen
      );
      /** Setting event listners for user iteraction that will resetFKTimeout*/
      window?.document?.addEventListener(
        'mousemove',
        handlerResetAFKTimeoutWhileInSmartScreen
      );
      window?.document?.addEventListener(
        'keydown',
        handlerResetAFKTimeoutWhileInSmartScreen
      );
      /** Triggering startAfkWarningTimer with longTimeout  */
      window?.gameClient?.startAfkWarningTimer?.({ longTimeout: true });
    });
    gameClient.on('smart-screen-become-unavailable', () => {
      console.log('===smart-screen-become-unavailable');
      dispatch(setSmartScreenAvailable(false));
      dispatch(setCurrentSmartScreen(null));
      /** Triggering startAfkWarningTimer with normal timeout  */
      window?.gameClient?.startAfkWarningTimer?.();
      /** Triggering remove of event listner in case that exists already at document level*/
      window?.document?.removeEventListener(
        'mousemove',
        handlerResetAFKTimeoutWhileInSmartScreen
      );
      window?.document?.removeEventListener(
        'keydown',
        handlerResetAFKTimeoutWhileInSmartScreen
      );
    });
    gameClient.on('smart-screen-fullscreened', () => {
      dispatch(setGameStage(GAME_STAGE_SMART_SCREEN_FULLSCREEN));
    });
    gameClient.on('smart-screen-maximized', (payload) => {
      console.log('===smart-screen-maximized');
      dispatch(setGameStage(GAME_STAGE_SMART_SCREEN));
      if (
        payload.currentMode === 'Idle' &&
        user.current.roles.indexOf('ROLE_PRESENTER') > -1
      ) {
        if (
          !isVideoPlayerOpened.current &&
          !screenShareActive.current &&
          !isFacilitatorResourcesActive.current
        ) {
          dispatch(setSmartScreenDialogOpen(true));
        }
        dispatch(setVideoDuration(null));
        dispatch(setVideoFinished(false));
      }
      if (isFacilitatorResourcesActive.current) {
        dispatch(setShowFacilitatorResources(true));
        dispatch(setShowFacilitatorResourcesMinimizeOpts(false));
      }
      if (screenShareActive.current) {
        toggleScreenSharePlayerHandler(true);
      }
      dispatch(setSmartScreenAvailable(true));
    });
    gameClient.on('smart-screen-minimized', () => {
      console.log('===smart-screen-minimized');
      dispatch(setGameStage(GAME_STAGE_EVENT));
      dispatch(setSmartScreenDialogOpen(false));
      if (screenShareActive.current) {
        toggleScreenSharePlayerHandler(false);
      }
    });
    gameClient.on('smart-screen-changed', (payload) => {
      console.log('===smart-screen-changed');
      if (
        payload === 'Idle' &&
        user.current.roles.indexOf('ROLE_PRESENTER') > -1
      ) {
        dispatch(setSmartScreenDialogOpen(true));
        setTimeout(() => {
          dispatch(setVideoDuration(null));
          dispatch(setVideoFinished(false));
        }, 1000);
      }
    });
    gameClient.on('smart-screen-video-playing', () => {
      console.log('===smart-screen-video-playing');
      dispatch(setVideoPlaying(true));
      dispatch(setVideoFinished(false));
      dispatch(setSmartScreenDialogOpen(false));
    });
    gameClient.on('smart-screen-whiteboard-open', (payload) => {
      dispatch(setWhiteBoardURL(payload));
      dispatch(setWhiteBoardOpen(true));
      dispatch(setSmartScreenDialogOpen(false));
    });
    gameClient.on('smart-screen-video-paused', () => {
      console.log('===smart-screen-video-paused');
      dispatch(setVideoPlaying(false));
    });
    gameClient.on('smart-screen-video-opened', (payload) => {
      console.log('===smart-screen-video-opened');
      console.log(payload.seconds, 'payload.seconds');
      if (payload.seconds) {
        dispatch(setVideoDuration(payload.seconds));
      }
      dispatch(setSmartScreenDialogOpen(false));
    });
    gameClient.on('smart-screen-video-finished', (payload) => {
      console.log('===smart-screen-video-finished', payload);
      dispatch(setVideoPlaying(false));
      dispatch(setVideoTime(null));
      dispatch(setVideoFinished(true));
      // dispatch(setVideoDuration(null));
      // if (user.current.roles.indexOf('ROLE_PRESENTER') > -1) {
      //   dispatch(setSmartScreenDialogOpen(true));
      // }
    });
    gameClient.on('smart-screen-video-time', (payload) => {
      console.log('===smart-screen-video-time');
      if (payload.currentSeconds && payload.totalSeconds) {
        dispatch(setVideoPlaying(true));
        dispatch(setVideoTime(payload.currentSeconds));
        dispatch(setVideoDuration(payload.totalSeconds));
      }
    });
    gameClient.on('smart-screen-fullscreen-clicked', ({ screenShare }) => {
      if (screenShare.active || screenShare.loading) return;
      if (user.current.roles.indexOf('ROLE_PRESENTER') > -1) {
        if (!isVideoPlayerOpened.current) {
          dispatch(setSmartScreenDialogOpen(true));
        } else {
          if (!videoFinishedActive.current) {
            if (_cleartimeout) {
              clearTimeout(_cleartimeout);
            }
            _cleartimeout = setTimeout(() => {
              if (videoPlayingActive.current) {
                window?.gameClient?.pauseVideoSmartScreen?.();
              } else {
                window?.gameClient?.playVideoSmartScreen?.();
              }
            }, 300);
          }
        }
      }
    });
    gameClient.on('maps-loaded', (payload) => {
      dispatch(setMap(payload));
    });

    gameClient.on('custom-locations', (payload) => {
      dispatch(setCustomLocations(payload));
    });

    gameClient.on('stream-stats', (payload) => {
      dispatch(setStreamStats(payload.data));
    });

    gameClient.on('freeze-frame', () => {
      const { active } = store.getState().screenShare;
      if (active) {
        window.gameClient.isFrozen = false;
        return;
      }
      dispatch(pushGameStage(GAME_STAGE_FREEZE_FRAME));
    });

    gameClient.on('unfreeze-frame', (payload) => {
      dispatch(restoreGameStage(payload));
    });

    gameClient.on('set-overlay', () => {
      dispatch(pushGameStage(GAME_STAGE_ENTERING));
    });

    gameClient.on('unset-overlay', (payload) => {
      dispatch(restoreGameStage(payload));
    });

    gameClient.on('close-countdown', (payload) => {
      dispatch(setCloseTimeout(payload.timeout));
    });

    gameClient.on('room-change', (payload) => {
      dispatch(setIsInStage(false));
      dispatch(setCurrentRoom(payload));
    });
    gameClient.on('avatar-customization', (payload) => {
      dispatch(setAvatarCustomization(payload));
    });
    gameClient.on('show-map', (payload) => {
      if (typeof payload === 'boolean') {
        //Setting 4s Delay to complete timeout of onOverlayResponse in src/utils/gameClient/index.js
        setTimeout(() => {
          dispatch(setEnteredIntoEvent(payload));
        }, 2000);
        dispatch(setDisplayMapButton(payload));
      } else if (typeof payload === 'string') {
        let getMap = payload.toLowerCase() === 'true' ? true : false;
        //Setting 4s Delay to complete timeout of onOverlayResponse in src/utils/gameClient/index.js
        setTimeout(() => {
          dispatch(setEnteredIntoEvent(getMap));
        }, 2000);
        dispatch(setDisplayMapButton(getMap));
      }
    });
    gameClient.on('enter-event', (payload) => {
      if (!config.isSinglePlayer) {
        dispatch(initChatServices());
      }
    });
    gameClient.on('show-gallery-timeline', (show) => {
      setTimeout(()=>{
        preloadChunksSequentially(['chunk8'], 0, () => {
          console.log('Chunks 8 preloaded');
        });
      }, 50)
      setShowGalleryTimelineDialog(show === 'true' ? true : false);
    });
    gameClient.on('start-vr-connection', () => {
      setVrConnectionShow(true);
    });
    gameClient.on('show-tour-welcome', () => {
      setTimeout(()=>{
        preloadChunksSequentially(['chunk1', 'chunk2', 'chunk3', 'chunk4'], 0, () => {
          console.log('Chunks 1,2, 3 and 4 preloaded');
        });
      }, 50)
      setTourDialogShow(true);
    });
    gameClient.on('show-magic-mirror', () => {
      setTimeout(()=>{
        preloadChunksSequentially(['chunk5', 'chunk6', 'chunk7'], 0, () => {
          console.log('Chunks 5,6 and 7 preloaded');
        });
      }, 50)
      dispatch(openStyleStudio(true));
      dispatch(setStudioType("MAGIC_MIRROR"))
    });
    gameClient.on('show-uniform-guidelines', (itemID) => {
      if(
        user?.current?.gender 
        && (
          user.current.gender === "male" && itemID.indexOf("_M_") !== -1
        ) 
        || (
          user.current.gender === "female" && itemID.indexOf("_F_") !== -1
        )
      ){
        if(ssTryOn[itemID]){
          dispatch(setIsPodium(true))
        }else if(ssGallery[itemID]){
          dispatch(setIsPodium(false))
        }else{
          if(window.gameClient){
            window.gameClient.closeUniformViewer()
          }
          console.log("This item does not exist")
          return
        }
        dispatch(setItemId(itemID))
        dispatch(openStyleStudio(true));
        dispatch(setStudioType("UNIFORM_GUIDELINES"))
      }else{
          if(window.gameClient){
            window.gameClient.closeUniformViewer()
          }
          console.log("There was an error with the item selection")
      }
    });
  };

  const handleUnfollowTourGuide = () => {
    window.gameClient.unfollowTourGuide();
    dispatch(endFollowRequestPoll());
  };

  const askNotificationPermission = async () => {
    if (
      Notification.permission === 'default' ||
      Notification.permission === 'denied'
    ) {
      await Notification.requestPermission();
    }
  };

  const handleModalClose = () => {
    dispatch(openPanel(false));
    setShowMouseKeyControlDialog(false);
    setshowTutorial(false);
    var elms = document.querySelectorAll("[id='helptext']");
    for (var i = 0; i < elms.length; i++) elms[i].style.display = 'none';
  };

  return (
    <Fabric styles={rootStyles}>
      {vrConnectionShow && game.stage !== 'entering' && (
        <VRConnectionsScreenDialog
          open={vrConnectionShow}
          setOpen={setVrConnectionShow}
        />
      )}
      {tourDialogShow && game.stage !== 'entering' && (
        <TourDialog open={tourDialogShow} setOpen={setTourDialogShow} />
      )}
      {showGalleryTimelineDialog && game.stage !== 'entering' && (
        <GalleryTimelineDialog
          open={showGalleryTimelineDialog}
          setOpen={setShowGalleryTimelineDialog}
        />
      )}

      <div
        className={`ms-w-100 ms-h-100 ${
          !isGameStarted(game.stage) ? 'game-not-started' : ''
        } ${showTutorial ? 'tutorialEnabled' : ''}`}
      >
        {isGameStarted(game.stage) && <Notifications />}

        <div className="ms-Flex ms-w-100 ms-h-100">
          {game.enteredIntoEvent &&
            game.stage !== 'entering' &&
            isGameStarted(game.stage) && (
              <>
                <div
                  id="sideNav"
                  className={`sideNav ${openNav ? 'show-nav' : 'hide-nav'}`}
                >
                  <div className="sideNavContainer">
                    <div className="ms-Flex ms-Flex-column sideNavContainer">
                      {/* <Header /> */}
                      <div className="sideNavWrapper">
                        <Navigation
                          open={openNav}
                          setOpen={setOpenNav}
                          showMouseKeyControlDialog={showMouseKeyControlDialog}
                        />
                      </div>
                      {game?.currentRoom &&
                        game?.currentRoom?.nextMapName.includes(
                          'Classroom'
                        ) && (
                          <div className="sideNavWrapper">
                            <VirtualClassroomNav />
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </>
            )}

          <Panels setupGameConnection={setupGameConnection} />
          <div className={panel.isOpen ? 'mouseKeyControlDialogWrapper' : ''}>
            <MouseKeyControlDialog
              open={isGameStarted(game.stage) && showMouseKeyControlDialog}
              onUnmute={handleModalClose}
              onDismiss={() => handleModalClose(false)}
            />
          </div>
          <HotPluggingDialog />
          <div className="subtitle-wrapper">
            <ToastContainer
              position="bottom-center"
              autoClose={5000}
              hideProgressBar
              newestOnTop={true}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              closeButton={false}
              limit={4}
              transition={subtitle_transistion}
              theme="dark"
            />
          </div>
        </div>
        <canvas width="640" height="480" id="jeeFaceFilter"></canvas>
      </div>
      {game.showLoader &&
      !user.current.roles.includes('ROLE_PRESENTER') &&
      window.followRequestActive ? (
        <div className="spinnerLoader">
          <div className="spin-load">
            <img src={spinnerLoader} width="45" height="45" />
            <span>{ls.teleportWithGuideMessage}</span>
          </div>
        </div>
      ) : null}
      <Whiteboard />
      <FacilitatorResources />
      <FullScreen />
    </Fabric>
  );
};
