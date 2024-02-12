/* eslint-disable */
import PlayerWindow from './playerWindow';
import SignalingClient from './signalingClient';
import config from 'config';
import store from 'store';
import twilioSyncService from 'services/twilioSyncService';
import { StorageService } from 'services';
import { openPanel, setPanelName } from 'store/reducers/panel';
import { enableVOG } from 'utils/eventVariables';

// Must be kept in sync with PixelStreamingProtocol::EToUE5Msg C++ enum.
export const MessageType = {
  /**********************************************************************/

  /*
   * Control Messages. Range = 0..49.
   */
  IFrameRequest: 0,
  RequestQualityControl: 1,
  FpsRequest: 2,
  AverageBitrateRequest: 3,
  StartStreaming: 4,
  StopStreaming: 5,
  LatencyTest: 6,
  RequestInitialSettings: 7,

  /**********************************************************************/

  /*
   * Input Messages. Range = 50..89.
   */

  // Generic Input Messages. Range = 50..59.
  UIInteraction: 50,
  Command: 51,

  // Keyboard Input Message. Range = 60..69.
  KeyDown: 60,
  KeyUp: 61,
  KeyPress: 62,

  // Mouse Input Messages. Range = 70..79.
  MouseEnter: 70,
  MouseLeave: 71,
  MouseDown: 72,
  MouseUp: 73,
  MouseMove: 74,
  MouseWheel: 75,

  // Touch Input Messages. Range = 80..89.
  TouchStart: 80,
  TouchEnd: 81,
  TouchMove: 82,

  // Gamepad Input Messages. Range = 90..99
  GamepadButtonPressed: 90,
  GamepadButtonReleased: 91,
  GamepadAnalog: 92,

  /**************************************************************************/
};

// Must be kept in sync with JavaScriptKeyCodeToFKey C++ array. The index of the
// entry in the array is the special key code given below.
export const SpecialKeyCodes = {
  BackSpace: 8,
  Shift: 16,
  Control: 17,
  Alt: 18,
  RightShift: 253,
  RightControl: 254,
  RightAlt: 255,
};

// Must be kept in sync with PixelStreamingProtocol::EToClientMsg C++ enum.
export const ToClientMessageType = {
  QualityControlOwnership: 0,
  Response: 1,
  Command: 2,
  FreezeFrame: 3,
  UnfreezeFrame: 4,
  VideoEncoderAvgQP: 5,
  LatencyTest: 6,
  InitialSettings: 7,
};

export default class GameClient extends EventTarget {
  /**
   * Current player <GameZone> string value.
   * As the player step into a game zone, events are fired resulting in a value change.
   *
   * - Agora SubSystem
   *
   * > Used to determine the behavior handling game's `EnterAudienceZone` / `EnterPresenterZone` events.
   * and finally set `AgoraClient#attendeeMode`, along other properties.
   *
   * @member   {string}      currentZone
   * @memberOf {GameClient}
   * @instance
   */

  /**
   *
   * @param server      The server URL string
   * @param eventUserId UserID for this event.
   * @param playerRole  Role string
   */
  constructor(server, eventUserId, playerRole, options) {
    super();

    this.server = server;
    this.dispatch = options.redux.dispatch;
    this.playerWindow = new PlayerWindow(this);
    this.signalingClient = new SignalingClient(this, this.server);
    this.currentRoomName = null;
    this.currentRoomType = null;
    this.currentMeetingRoomName = null;
    this.currentTable = null;
    this.switchSeatAtSameTableTimeout = null;
    this.currentZone = null;
    this.currentZoneRole = null;
    this.currentAudioCall = null;
    this.godJoined = false;
    this.micJoined = false;
    this.playerRole = playerRole;
    this.defaultPlayerRole = playerRole;
    this.eventUserIdLogged = false;
    this.eventUserId = eventUserId;
    this.eventId = null;
    this.audioVolume = 100;
    this.effectVolume = 100;
    this.audioMuted = false;
    this.isInitialized = false;
    this.isFrozen = false;
    this.followingTourGuide = false;
  }

  /**
   * True if player is currently sit at some table.
   * @return {boolean}
   */
  isPlayerAtTable() {
    return this.currentTable !== null;
  }

  /**
   * True if dynamic volume is applied
   * @returns {boolean}
   */
  isUsingDynamicVolume() {
    // Using volume based on distance only in general rooms,
    // but not in session rooms, meeting rooms, tables, zones, and audio call.
    return (
      this.currentTable === null &&
      this.currentZone === null &&
      this.currentRoomType !== 'session' &&
      this.currentRoomType !== 'meeting' &&
      this.currentAudioCall === null
    );
  }

  getCurrentRoomName = () => {
    return this.currentRoomName;
  };

  getCurrentMeetingRoomName = () => {
    return this.currentMeetingRoomName;
  };

  getCurrentRoomType = () => {
    return this.currentRoomType;
  };

  getPlayerRole = () => {
    return this.playerRole;
  };

  setPlayerRole = (playerRole) => {
    this.playerRole = playerRole;
  };

  /**
   *
   * @returns {PlayerWindow}
   */
  getPlayerWindow = () => {
    return this.playerWindow;
  };

  getAudioVolume = () => {
    return this.audioVolume;
  };

  getEffectVolume = () => {
    return this.effectVolume;
  };

  /****************************************
   * Game Client <-> Server Communication *
   ****************************************/

  // Send data to WebRTC Server
  sendInputData = (data, ignoreAfk = false) => {
    // Do not send data to game server when game is frozen
    if (this.isFrozen) {
      return;
    }

    if (this.signalingClient) {
      if (!ignoreAfk) {
        this.playerWindow.resetAfkWarningTimer();
      }
      if (this.signalingClient.getWebRTClient()) {
        this.signalingClient.getWebRTClient().sendInputData(data);
      }
    }
  };

  // A generic message has a type and a descriptor.
  emitDescriptor = (messageType, descriptor, ignoreAfk = false) => {
    // Convert the descriptor object into a JSON string.
    let descriptorAsString = JSON.stringify(descriptor);

    // Add the UTF-16 JSON string to the array byte buffer, going two bytes at
    // a time.
    let data = new DataView(
      new ArrayBuffer(1 + 2 + 2 * descriptorAsString.length)
    );
    let byteIdx = 0;
    data.setUint8(byteIdx, messageType);
    byteIdx++;
    data.setUint16(byteIdx, descriptorAsString.length, true);
    byteIdx += 2;
    for (let i = 0; i < descriptorAsString.length; i++) {
      data.setUint16(byteIdx, descriptorAsString.charCodeAt(i), true);
      byteIdx += 2;
    }
    this.sendInputData(data.buffer, ignoreAfk);
  };

  // A UI integration will occur when the user presses a button powered by
  // JavaScript as opposed to pressing a button which is part of the pixel
  // streamed UI from the UE5 client.
  emitUIInteraction = (descriptor) => {
    const ignoreAfk =
      ['ReceiveAgoraVolumeIndication'].indexOf(descriptor.method) !== -1;

    this.emitDescriptor(MessageType.UIInteraction, descriptor, ignoreAfk);
  };

  // A build-in command can be sent to UE5 client. The commands are defined by a
  // JSON descriptor and will be executed automatically.
  // The currently supported commands are:
  //
  // 1. A command to run any console command:
  //    "{ ConsoleCommand: <string> }"
  //
  // 2. A command to change the resolution to the given width and height.
  //    "{ Resolution.Width: <value>, Resolution.Height: <value> } }"
  //
  // 3. A command to change the encoder settings by reducing the bitrate by the
  //    given percentage.
  //    "{ Encoder: { BitrateReduction: <value> } }"
  emitCommand = (descriptor) => {
    this.emitDescriptor(MessageType.Command, descriptor);
  };

  requestInitialSettings = () => {
    this.sendInputData(
      new Uint8Array([MessageType.RequestInitialSettings]).buffer
    );
  };

  requestQualityControl = () => {
    this.sendInputData(
      new Uint8Array([MessageType.RequestQualityControl]).buffer
    );
  };

  sendStartLatencyTest = () => {
    // We need WebRTC to be active to do a latency test.
    if (!this.signalingClient.webRTCClient.webRtcPlayerObj) {
      return;
    }

    let _this = this;

    let onTestStarted = function (StartTimeMs) {
      let descriptor = {
        StartTime: StartTimeMs,
      };
      _this.emitDescriptor(MessageType.LatencyTest, descriptor);
    };

    this.signalingClient.webRTCClient.webRtcPlayerObj.startLatencyTest(
      onTestStarted
    );
  };

  // Handle response from the game instance
  handleUE5Response = (response) => {
    const data = JSON.parse(response);
    if (data && data.method !== 'SendPlayerDistancesToAgora') {
      console.log('Handle UE5 Response: ', response);
    }
    if (data) {
      switch (data.namespace) {
        case 'Analytics':
          this.onAnalyticsResponse(data);
          break;
        case 'CharacterCustomizerLevel':
          this.onCharacterCustomizerLevelResponse(data);
          break;
        case 'CharacterCustomizer':
          this.onCharacterCustomizerResponse(data);
          break;
        case 'Emotes':
          this.onEmotesResponse(data);
          break;
        case 'GrubHubLevel':
          break;
        case 'iFrame':
          this.oniFrameResponse(data);
          break;
        case 'Interactions':
          this.onInteractions(data);
          break;
        case 'LoginLevel':
          break;
        case 'KichlerDemoRoom':
          this.onKichlerDemoRoom(data);
          break;
        case 'AttendeeSpeakingPermissions':
          this.onAttendeeSpeakingPermissions(data);
          break;
        case 'SmartScreen':
          this.onSmartScreen(data);
          break;
        case 'SmartScreen_VideoPlayer':
          this.onSmartScreenVideoPlayer(data);
          break;
        case 'SmartScreen_ScreenSharePlayer':
          this.onSmartScreenScreenSharePlayer(data);
          break;
        case 'SmartScreen_WBOWhiteboard':
          this.onSmartScreenWhiteBoard(data);
          break;
        case 'MouseLock':
          this.onMouseLock(data);
          break;
        case 'Maps':
          this.onMapsResponse(data);
          break;
        case 'Player':
          this.onPlayer(data);
          break;
        case 'Overlay':
          this.onOverlayResponse(data);
          break;
        case 'Avatar':
          this.avatarBlooper(data);
          break;
        case 'UserInterface':
        case 'UI':
          this.onUserInterfaceResponse(data);
          break;
        case 'Gameplay':
          this.onGameplayResponse(data)
        case 'Emirates':
          this.onEmiratesResponse(data)
        case 'InitializeGame': {
          const currUser = store?.getState()?.user;
          if (currUser?.current) {
            let userRole
            const roles = currUser.current.roles
            if(roles){
              userRole = roles.includes('ROLE_PRESENTER') ? "Facilitator" : "Learner"
            }else{  
              userRole = "Learner"
            }
            this.sendUserInfo({
              name: currUser.current.firstName + currUser.current.lastName,
              brand: currUser.current.organization, 
              gender: currUser.current.gender,
              role: userRole,
              persona: currUser.current.persona
            })
          }
          break;
        }
        default:
          this.onGeneralResponse(data);
          break;
      }
    }
  };

  avatarBlooper = (data) => {
    switch (data.method) {
      case 'DisableAvatarCustomization':
        this.triggerEvent('avatar-customization', data.payload);
        break;
      default:
        break;
    }
  };

  onUserInterfaceResponse = (data) => {
    switch (data.method) {
      case 'ShowMapButton':
        this.triggerEvent('show-map', data.payload);
        break;
      case 'AvatarMenuReady':
        const game = store?.getState()?.game;
        if (game?.enteredIntoEvent) {
          this.editAvatar();
        }
        break;
      case 'AvatarEditorOpened':
        this.onAvatarEditorOpened();
        break;
      case 'AvatarEditorClosed':
        this.onAvatarEditorClosed();
        break;
      case 'StartMakeupMirror':
        this.triggerEvent('show-magic-mirror')
      case 'ShowProductDetails':
        this.triggerEvent('show-uniform-guidelines',data.payload)
      default:
        break;
    }
  };

  onGameplayResponse = (data) => {
    switch (data.method) {
      case 'InOurWorldScreen':
        this.triggerEvent('show-gallery-timeline', data.payload);
        break;
      case 'StartVRLink':
        this.triggerEvent('start-vr-connection', data.payload);
        break;
      default:
        break;
    }
  };

  onEmiratesResponse = (data) => {
    switch (data.method) {
      case 'InOurWorldReady':
        this.triggerEvent('show-tour-welcome', data.payload);
        break;
      case 'ReachedStep':
        this.triggerEvent('step-reached', data.payload);
        break;
      case 'RequestAgendaID':
        this.setAgendaId()
      default:
        break;
    }
  }

  // Handler for analytic responses.
  onAnalyticsResponse = (data) => {
    switch (data.method) {
      case 'LogOnMapChange':
        this.triggerEvent('room-change', data.payload);
        break;
      default:
        break;
    }
  };

  // Handle for character customizer responses.
  onCharacterCustomizerLevelResponse = (data) => {
    switch (data.method) {
      // handle avatar editor opened
      case 'AvatarEditorOpened':
        this.onAvatarEditorOpened();
        break;
      case 'AvatarEditorClosed':
        this.onAvatarEditorClosed();
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  onCharacterCustomizerResponse = (data) => {
    switch (data.method) {
      // handle avatar editor opened
      case 'AvatarEditorOpened':
        this.onAvatarEditorOpened();
        break;
      case 'AvatarEditorClosed':
        this.onAvatarEditorClosed();
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  // Handler for avatar editor opened
  onAvatarEditorOpened = () => {
    window?.gameClient?.logUserAction?.({
      eventName: 'CUSTOMISE_AVATAR_START',
      eventSpecificData: null,
      beforeState: null,
      afterState: null,
    });

    this.triggerEvent('avatar-editor-opened');
  };

  // Handler for avatar editor closed
  onAvatarEditorClosed = () => {
    window?.gameClient?.logUserAction?.({
      eventName: 'CUSTOMISE_AVATAR_END',
      eventSpecificData: null,
      beforeState: null,
      afterState: null,
    });

    this.triggerEvent('avatar-editor-closed');
  };

  // Handler for emotes responses.
  onEmotesResponse = (data) => {
    switch (data.method) {
      case 'EmotesList':
        this.onEmotesList(data.payload);
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  // Handler for emotes list
  onEmotesList = (list) => {
    this.triggerEvent('emotes-list-loaded', { list });
  };

  // Handler for iFrame responses.
  oniFrameResponse = (data) => {
    switch (data.method) {
      case 'OpenWebPageiFrame':
        this.onOpenWebPageiFrame(data);
        break;
      default:
        this.onUnknownResponse();
    }
  };

  // Handler for iFrame opened
  onOpenWebPageiFrame = (data) => {
    const [type, url] = data.payload.split(',');
    this.triggerEvent('open-iframe', { type, url });
  };

  // Handler for Interaction response
  onInteractions = (data) => {
    switch (data.method) {
      case 'ClickOnOtherPlayer':
        this.onClickOnOtherPlayer(data);
        break;
      default:
        this.onUnknownResponse();
    }
  };

  // Handler for clicking on other player
  onClickOnOtherPlayer = (data) => {
    this.triggerEvent('click-on-other-player', data.payload);
  };

  // Handler for Kichler Room response.
  onKichlerDemoRoom = (data) => {
    switch (data.method) {
      case 'ReportClickedSKU':
        this.onProductClicked(data.payload);
        break;
      case 'ReportSwappedSKU':
        this.onProductSwapped(data.payload);
        break;
      default:
        this.onUnknownResponse();
    }
  };

  onProductClicked = ({ itemId, mouseX, mouseY }) => {
    this.triggerEvent('product-clicked', { sku: itemId, mouseX, mouseY });
  };

  onProductSwapped = () => {
    // this.triggerEvent('product-clicked', { sku, mouseX: null, mouseY: null });
  };

  // Handler for promotion response.
  onAttendeeSpeakingPermissions = (data) => {
    switch (data.method) {
      // handle promotion to speaker
      case 'isPlayerPromotedToSpeaker':
        this.playerRole = data.payload === 'true' ? 'presenter' : 'attendee';
        this.onJoinRoom();
        break;
    }
  };

  // Handler for smart screen response.
  onSmartScreen = (data) => {
    switch (data.method) {
      case 'smartScreenBecomeAvailable':
        this.triggerEvent('smart-screen-become-available', data.payload);
        break;
      case 'smartScreenBecomeUnavailable':
        this.triggerEvent('smart-screen-become-unavailable');
        break;
      case 'SmartScreenFullscreened':
        this.triggerEvent('smart-screen-fullscreened');
        break;
      case 'SmartScreenMaximized':
        this.triggerEvent('smart-screen-maximized', data.payload);
        break;
      case 'SmartScreenMinimized':
        this.triggerEvent('smart-screen-minimized');
        break;
      case 'SmartScreenClickedWhileMaximised':
        this.triggerEvent('smart-screen-fullscreen-clicked', store.getState());
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  onSmartScreenScreenSharePlayer = (data) => {
    switch (data.method) {
      case 'VideoPlaying':
        this.triggerEvent('smart-screen-share-playing');
        break;
      case 'MediaClosed':
        this.triggerEvent('smart-screen-share-paused');
        break;
      case 'VideoFinished':
        this.triggerEvent('smart-screen-share-finished');
        break;
      case 'VideoOpened':
        this.triggerEvent('smart-screen-share-opened', data.payload);
        break;
      case 'VideoTime':
        this.triggerEvent('smart-screen-share-time', data.payload);
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  onSmartScreenWhiteBoard = (data) => {
    switch (data.method) {
      case 'SetWhiteboardURL':
        this.triggerEvent('smart-screen-whiteboard-open', data.payload);
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  // Handler for smart screen video player response
  onSmartScreenVideoPlayer = (data) => {
    switch (data.method) {
      case 'VideoPlaying':
        this.triggerEvent('smart-screen-video-playing');
        break;
      case 'VideoPaused':
        this.triggerEvent('smart-screen-video-paused');
        break;
      case 'VideoFinished':
        this.triggerEvent('smart-screen-video-finished');
        break;
      case 'VideoOpened':
        this.triggerEvent('smart-screen-video-opened', data.payload);
        break;
      case 'VideoTime':
        this.triggerEvent('smart-screen-video-time', data.payload);
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  onMouseLock = (data) => {
    switch (data.method) {
      case 'EnableMouseLock':
        if (data.payload === 'True') {
          this.triggerEvent('mouse-locked');
          if (this.signalingClient.getWebRTClient()) {
            this.signalingClient.getWebRTClient().lockDynamicMouseEvents();
          }
        } else {
          this.triggerEvent('mouse-unlocked');
          if (this.signalingClient.getWebRTClient()) {
            this.signalingClient.getWebRTClient().unlockDynamicMouseEvents();
          }
        }
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  onMapsResponse = (data) => {
    switch (data.method) {
      case 'MapsList':
        this.triggerEvent('maps-loaded', data.payload);
        break;
      case 'CustomLocationsList':
        this.triggerEvent('custom-locations', data.payload);
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  onPlayer = (data) => {
    switch (data.method) {
      case 'EnterEvent':
        this.triggerEvent('enter-event', data.payload);
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  }

  onOverlayResponse = (data) => {
    switch (data.method) {
      case 'SetOverlay':
        this.triggerEvent('set-overlay');
        break;
      case 'UnsetOverlay':
        setTimeout(() => {
          this.triggerEvent('unset-overlay', 'unsetOverlay');
          // Add 3s delay after UE5 unset overlay triggered.
        }, 3000);
        break;
      default:
        this.onUnknownResponse();
        break;
    }
  };

  onJoinRoomComplete = () => {
    this.triggerEvent('handleJoinRoomComplete');
  };

  // Handler for the room level response.
  // The namespace value of response payload is ""
  onGeneralResponse = (data) => {
    try {
      switch (data.method) {
        // handle join the level
        case 'ReceiveLevelName':
          this.eventId = config.experience.subExperienceId;
          this.currentRoomType = data.payload.roomType.toLowerCase();
          this.currentRoomName = this.parseRoomName(data.payload.roomName);

          this.triggerEvent('receive-level-name', {
            room_name: data.payload.roomName,
            room_type: data.payload.roomType.toLowerCase(),
          });

          this.currentMeetingRoomName = this.parseMeetingRoomName(
            data.payload.roomName
          );

          // If room type is session, wait for him to select the seat.
          if (this.currentRoomType === 'session') {
            return;
          }

          this.playerRole = 'presenter';
          this.onJoinRoom();
          break;

        // handle select seat
        case 'ReceivePlayerPresentationRoomRole':
          this.playerRole = this.parsePlayerRole(data.payload);
          this.onJoinRoom();
          break;

        // handle room join complete
        case 'HandleJoinRoomComplete':
          this.onJoinRoomComplete();
          break;

        // handle sitting at the table
        case 'HandlePlayerSittingAtTable':
          if (this.currentTable === this.parseTable(data.payload)) {
            clearTimeout(this.switchSeatAtSameTableTimeout);
            this.switchSeatAtSameTableTimeout = null;
            return;
          }

          this.currentTable = this.parseTable(data.payload);

          // Set the player role to presenter so that they can present to club mic
          if (
            this.currentTable &&
            this.currentTable.search('clubmicrophone') !== -1
          ) {
            this.onJoinMicChannel();
          } else {
            this.onSitAtTable();
          }
          break;

        // handle getting up from the table
        case 'HandlePlayerGetUpFromTable':
          if (data.payload === 'TableIDNotSet,') {
            break;
          }
          this.onGetUpFromTable();
          break;

        case 'RoomLeft':
          this.onLeaveRoom();
          break;

        case 'SendPlayerDistancesToAgora':
          this.onPlayerDistance(data.payload);
          break;

        case 'EnterAudienceZone':
          this.onEnterAudienceZone(data.payload?.trim());
          break;

        case 'EnterPresenterZone':
          this.onEnterPresenterZone(data.payload?.trim());
          break;

        case 'LeaveAudienceZone':
          this.onLeaveZone();
          break;

        case 'LeavePresenterZone':
          this.onLeavePresenterZone();
          break;

        default:
          this.onUnknownResponse();
          break;
      }
    } catch (e) {
      console.warn(
        '[GameClient] problem while handling general response. error: ',
        e.message
      );
    }
  };

  setOnlineUsers = (onlineUsers) => {
    this.triggerEvent('set-online-users', onlineUsers);
  };

  // Handler for joining the level
  onJoinRoom = () => {
    this.godJoined = false;
    this.micJoined = false;

    if (this.currentRoomName) {
      this.triggerEvent('room-joined', {
        roomType: this.currentRoomType,
        roomName: this.currentRoomName,
        screenShare: store.getState().screenShare,
      });

      this.startAfkWarningTimer({
        longTimeout:
          this.currentRoomType === 'meeting' || this.followingTourGuide,
      });

      if (!this.eventUserIdLogged) {
        this.eventUserIdLogged = true;
      }
    }
  };

  // Handler for sitting at the table
  onSitAtTable = () => {
    this.godJoined = false;
    this.micJoined = false;

    this.triggerEvent('sit-at-table', {
      roomType: this.currentRoomType,
      roomName: this.currentRoomName,
      table: this.currentTable,
    });

    this.startAfkWarningTimer({ longTimeout: true });
  };

  // Handler for getting up from the table
  onGetUpFromTable = () => {
    this.switchSeatAtSameTableTimeout = setTimeout(() => {
      this.currentTable = null;
      // Note:
      // when switching seat arount the same table Both events HandlePlayerGetUpFromTable and HandlePlayerSittingAtTable happen.
      // aysnc set the current table to null to check if switching seat happened
      // so if HandlePlayerSittingAtTable is fired clear the timeout
      const _this = this;
      setTimeout(() => {
        if (!_this.currentTable) {
          _this.muteVideoOnExit();
          _this.onJoinRoom();
        }
      }, 100);
      this.startAfkWarningTimer({ longTimeout: false });
    }, 100);
  };

  // Handler for joining god channel
  onJoinGodChannel = () => {
    this.godJoined = true;
    this.micJoined = false;

    this.triggerEvent('god-joined', {
      roomType: this.currentRoomType,
      roomName: this.currentRoomName,
      table: this.currentTable,
    });

    this.startAfkWarningTimer({ longTimeout: true });
  };

  // Handler for joining mic channel
  onJoinMicChannel = () => {
    this.godJoined = false;
    this.micJoined = true;
    this.triggerEvent('mic-joined', {
      roomType: this.currentRoomType,
      roomName: this.currentRoomName,
      table: this.currentTable,
    });

    this.startAfkWarningTimer({ longTimeout: true });
  };

  // Handler for entering audience zone
  onEnterAudienceZone = (zone) => {
    this.godJoined = false;
    this.micJoined = false;

    this.currentZone = zone;
    this.currentZoneRole = 'attendee';
    this.triggerEvent('zone-joined', {
      zone,
      role: this.currentZoneRole,
    });

    this.startAfkWarningTimer({ longTimeout: false });
  };

  // Handler for entering presenter zone
  onEnterPresenterZone = (zone) => {
    this.godJoined = false;
    this.micJoined = false;

    this.currentZone = zone;
    this.currentZoneRole = 'presenter';
    this.triggerEvent('zone-joined', {
      zone,
      role: this.currentZoneRole,
    });
    this.startAfkWarningTimer({ longTimeout: true });
  };

  // Handler for leaving zone
  onLeaveZone = () => {
    this.currentZone = null;
    this.currentZoneRole = null;
    // Hack here, when the user joins presenter zone from audience zone,
    // Both events LeaveAudienceZone and EnterPresenterZone happen.
    // Add some delay to check if user is completely gotten up from the table.
    const _this = this;
    setTimeout(() => {
      if (!_this.currentZone) {
        _this.onJoinRoom();
      }
    }, 100);
  };

  // Handler for leaving presenter zone
  onLeavePresenterZone = () => {
    this.currentZone = null;
    this.currentZoneRole = null;
    this.triggerEvent('leave-presenter-zone');
    const _this = this;
    setTimeout(() => {
      if (!_this.currentZone) {
        _this.muteVideoOnExit();
        _this.onJoinRoom();
      }
    }, 100);
    this.startAfkWarningTimer({ longTimeout: false });
  };

  // Handler for joining audio call
  onJoinAudioCall = (channel) => {
    this.audioCallJoined = true;
    this.currentAudioCall = channel;
    this.godJoined = false;
    this.micJoined = false;

    this.triggerEvent('audio-call-joined', {
      roomName: this.currentRoomName,
      roomType: this.currentRoomType,
      channel,
    });

    this.startAfkWarningTimer({ longTimeout: true });
  };

  // Handler for leaving audio call
  onLeaveAudioCall = () => {
    this.currentAudioCall = null;

    if (this.currentZone) {
      if (this.currentZoneRole === 'presenter') {
        this.onEnterPresenterZone(this.currentZone);
      } else {
        this.onEnterAudienceZone(this.currentZone);
      }
    } else if (this.currentTable) {
      this.onSitAtTable();
    } else {
      this.onJoinRoom();
    }
    this.startAfkWarningTimer({ longTimeout: false });
  };

  // Handler for leaving room
  onLeaveRoom = () => {
    this.triggerEvent('room-left');
  };

  /**
   * This method is meant to update players volume attenuation relative to it's distance.
   * The value is emitted in the event, so agora subscribers update these volume.
   * @param {ParsePlayerDistancesPayload} payload
   */
  onPlayerDistance = (payload) => {
    const playerDistances = this.parsePlayerVolumeAttenuationList(payload);

    this.triggerEvent('player-distances', playerDistances);
  };

  // General handler for unknown responses.
  onUnknownResponse = () => {
    console.log('Event handler is not defined yet for the response.');
  };

  //** Utility functions for response handlers

  sendUserInfo = (payload) => {
    this.emitUIInteraction({
      method: 'User_Information',
      payload
    });
  };

  //Emirates Style Studio

  //Uniform guidelines
  tryUniform = (uniformId) => {
    this.emitUIInteraction({
      method: 'TryOnItem',
      payload: {
        "id" : `${uniformId}`
      }
    });
  };

  nextUniformItem = () => {
    this.emitUIInteraction({
      method: 'SelectNextItem',
    });
  };

  previousUniformItem = () => {
    this.emitUIInteraction({
      method: 'SelectPreviousItem',
    });
  };

  closeUniformViewer = () => {
    this.emitUIInteraction({
      method: 'CloseProductViewer',
    });
  }

  //Magic Mirror

  changeCameraAngle = (sectionId) => {
    this.emitUIInteraction({
      method: 'SetSection',
      payload: {
        "id" : `${sectionId}`
      }
    });
  };

  setAvatarMakeupItem = (itemId) => {
    this.emitUIInteraction({
      method: 'SetAvatarItem',
      payload: {
        "id" : `${itemId}`
      }
    });
  };

  closeMagicMirror = (itemId) => {
    this.emitUIInteraction({
      method: 'ExitMirror'
    });
  };

  //Emirates Virtual Quest
  returnToHubFromVQ = () => {
    this.emitUIInteraction({
      method: 'InOurWorldReturnToHub'
    });
  };

  selectBuilding = (buildingId) => {
    this.emitUIInteraction({
      method: 'SelectBuilding',
      payload: {
        "buildingid" : `${buildingId}`
      }
    });
  };

  nextStep = () => {
    this.emitUIInteraction({
      method: 'NextStep',
    });
  };

  previousStep = () => {
    this.emitUIInteraction({
      method: 'PreviousStep',
    });
  };

  setVQMenu = () => {
    this.emitUIInteraction({
      method: 'InOurWorldMenu',
    });
  }

  //Emirates Virtual Classroom

  setAgendaId = () => {
    const currAgendaId = store.getState()?.agenda?.current;
    if(currAgendaId){
      this.emitUIInteraction({
        method: 'SetAgendaID',
        payload: {
          "id" : `${currAgendaId}`
        }
      });
    }else{
      console.log("ERROR: No ongoing agenda")
    }
  }

  /**
   * * Teleport a userId to a room given by name.
   * ? Works for both version S1, S2.
   * @param {string} room
   * @param {string} [userId] Optional for S2
   */
  teleportToUserRoom(room, userId) {
    userId === undefined
      ? this.#teleportToUserRoom_S1(room)
      : this.#teleportToUserRoom_S2(room, userId);
  }

  // ** Teleport to the User ver S2
  #teleportToUserRoom_S2 = (room, userId) => {
    this.emitUIInteraction({
      method: 'RequestTeleportToUser',
      payload: {
        room,
        userId,
      },
    });
  };

  // ** Teleport to the Room ver S1
  #teleportToUserRoom_S1 = (roomName) => {
    window?.gameClient?.logUserAction?.({
      eventName: 'TELEPORT_TO_ROOM',
      eventSpecificData: null,
      beforeState: this.currentRoomName,
      afterState: roomName,
    });

    this.emitUIInteraction({
      method: 'RequestTeleportToRoom',
      payload: {
        roomName,
      },
    });
  };

  setSmartScreenWaitingImage = (payload = false) => {
    console.log('setSmartScreenWaitingImage', payload);
    this.emitUIInteraction({
      method: 'ScreenSharePlayer_SetWaitingImage',
      payload: {
        bEnable: payload,
      },
    });
  };

  // Change Smart Screen
  setActiveSmartScreenMode = (modeName, url = '') => {
    this.emitUIInteraction({
      method: 'RequestSetActiveSmartScreenMode',
      payload: {
        ModeName: modeName,
        Url: url,
      },
    });

    // If Idle, trigger events which resets video player
    this.triggerEvent('smart-screen-video-finished');
  };

  // Close Smart Screen
  closeSmartScreen = () => {
    this.emitUIInteraction({
      method: 'RequestMinimiseSmartScreen',
    });
  };

  // Smart Screen VideoPlayer - Play
  playVideoSmartScreen = () => {
    this.emitUIInteraction({
      method: 'VideoPlayer_Play',
    });
  };

  // Smart Screen VideoPlayer - Pause
  pauseVideoSmartScreen = () => {
    this.emitUIInteraction({
      method: 'VideoPlayer_Pause',
    });
  };

  // Smart Screen VideoPlayer - Seek
  seekVideoSmartScreen = (time) => {
    this.emitUIInteraction({
      method: 'VideoPlayer_Seek',
      payload: {
        timeSeconds: time,
      },
    });
  };

  // While Accepting Follow Request
  startFollowingTourGuide = (userId) => {
    this.emitUIInteraction({
      method: 'StartFollowingTourGuide',
      payload: {
        userId,
      },
    });

    this.followingTourGuide = true;
    this.startAfkWarningTimer({ longTimeout: true });
  };

  //While Unfollow Request
  unfollowTourGuide = () => {
    this.emitUIInteraction({
      method: 'StopFollowingTourGuide',
      payload: {},
    });

    this.followingTourGuide = false;
    this.startAfkWarningTimer();
  };

  /**
   * Room Name Payload - Parse event ID
   * expected payload: `[{roomName},{role},{roomName}]`
   *
   * @example
   * const str = "Event101.MainHub.,Presenter"
   * const arr = ["Event101.MainHub.","Presenter"]
   *
   * @param {string} payload  string like: `{roomName}.{role}.,{roomName}`
   *
   * @return {string|null}
   */

  // Room Name Payload - Parse room name
  // {roomName},{role} | {roomName}
  // e.g.
  // "Event101.MainHub.,Presenter"
  parseRoomName = (payload) => {
    const segments = payload.split(',');
    if (segments[0]) {
      const roomName = segments[0].trim().replace(/\./g, '-').toLowerCase();

      // If room type is session, cut off last section
      if (this.currentRoomType === 'session') {
        const roomNameSegments = roomName.split('-');
        return roomNameSegments.slice(0, roomNameSegments.length - 1).join('-');
      }

      return roomName;
    }
    return null;
  };

  parseMeetingRoomName = (roomName) => {
    return roomName.split('.').slice(1).join('.');
  };

  // Room Name Payload - Parse player role
  // {roomName},{role} | {roomName}
  // e.g.
  // "Event101.MainHub.,Presenter"
  parsePlayerRole = (payload) => {
    const segments = payload.split(',');
    if (segments[1]) {
      return segments[1].trim().toLowerCase();
    }
    return null;
  };

  // Table Payload
  // {table},{roomName}
  // e.g.
  // MainHub,table,2,xxx,Event101.MainHub.
  parseTable = (payload) => {
    return payload.trim().replace(/[.,]/g, '-').toLowerCase();
  };

  /**
   * @private
   ** Parse players id, attenuation values.
   ** Payload contains an array of `[eventUserId, distance]` elements.
   *
   *  > when sit at table, value is override to 1.
   *
   * @example
   *  let item = ["3481fb58-6d78-11eb-8590-16dec9ef8293", 0.635705]
   *
   * @param {ParsePlayerDistancesPayload} payload
   * @return {[string,number][]}
   *
   */
  parsePlayerVolumeAttenuationList = (payload) => {
    const dynamicVolume = this.isUsingDynamicVolume();
    const distances = [];

    // ** @internal payload change without advice, from *[] the new object type.
    const source = payload.playerIdsAndDistanceArray || payload;

    for (const distanceData of source) {
      const [eventUserId, distance] = distanceData.split(',');
      distances.push({
        eventUserId,
        distance: dynamicVolume ? parseFloat(distance) : 1,
      });
    }

    return distances;
  };

  /**
   * Same as with {@link parsePlayerDistances} but setting all the factors to 1.
   *  Works as an override for the relative volume of the players
   *
   * @example
   *  let item = ["3481fb58-6d78-11eb-8590-16dec9ef8293", 1]
   *
   * @param {ParsePlayerDistancesPayload} payload
   * @return {[string,number][]}
   *
   */
  parsePlayerVolumeAttenuationAtTableList = (payload) => {
    const distances = [];

    // ** @internal payload change without advice, from *[] the new object type.
    const source = payload.playerIdsAndDistanceArray || payload;

    for (const distanceData of source) {
      // eslint-disable-next-line no-unused-vars
      const [eventUserId, distance] = distanceData.split(',');
      distances.push({
        eventUserId,
        distance: 1,
      });
    }

    return distances;
  };

  /**************************************************
   * React UI <-> Game Client interaction Interface *
   **************************************************/

  // Start the game
  // Create and initialize DOM for game player
  // and connect to the signaling web server for game instance
  setup = () => {
    this.signalingClient.connect();
  };

  startGame = () => {
    this.isInitialized = false;
    this.isFrozen = false;

    const { statuses } = store.getState().usersList;
    const loginMethod = store.getState().user.loginMethod;
    this.playerWindow.setup();
    const dataToSend = {
      type: 'startunreal',
      uid: this.eventUserId,
      eventName: config.experience.subExperienceId,
      flag: statuses[this.eventUserId] === 'offline' ? false : true,
      useDevServices: !!window.useDevServices,
    };
    this.signalingClient.sendData(JSON.stringify(dataToSend));
    this.signalingClient.setupWebRTCClient();
    this.logUserAction({
      eventName: 'LOGIN',
      eventSpecificData: JSON.stringify({
        loginMethod
      }),
      beforeState: null,
      afterState: null,
    });
    twilioSyncService.setCirrusToken();
  };

  logUserAction = (payload) => {
    const storageService = new StorageService();
    const token = storageService.getToken()?.token || '';
    const dataToSend = {
      ...payload,
      sessionId: token.substring(0, 60),
      userId: this.eventUserId,
      clientEvent: config.experience.subExperienceId,
    };
    // console.log(dataToSend, '<<<dataToSend');
    this.signalingClient.sendData(
      JSON.stringify({ type: 'eventLogger', payload: dataToSend })
    );
  };

  initialize = () => {
    this.isInitialized = true;
    this.requestInitialSettings();

    this.triggerEvent('initialized');

    if (this.isFrozen) {
      this.freezeFrame(true);
    }
  };

  // End the game
  // Disconnect from the signaling web server and destroys the player DOM
  endGame = () => {
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

    if (this.playerWindow.kickout.enabled)
      clearTimeout(this.playerWindow.kickout.warnTimer);

    this.signalingClient.disconnect();
    window.onbeforeunload = null;
    this.dispatch(setPanelName(null));
    this.dispatch(openPanel(false));
  };

  restartGame = () => {
    this.triggerEvent('restart');
  };

  // Update the server URL
  updateGameServerURL = (serverURL) => {
    this.server = serverURL;
    this.signalingClient.setWebSocketURL(serverURL);

    if (this.playerWindow.kickout.enabled) this.playerWindow.forceKickout();
  };

  // Unmute WebRTC player
  unMuteWebRtcPlayer = () => {
    if (this.signalingClient.webRTCClient) {
      this.signalingClient.webRTCClient.unMuteWebRtcPlayer();
    }
  };

  // Join God Channel
  joinGodChannel = () => {
    this.godJoined = true;
    this.onJoinGodChannel();
  };

  leaveGodChannel = () => {
    this.godJoined = false;
    if (this.currentAudioCall) {
      this.onJoinAudioCall(this.currentAudioCall);
    } else if (this.currentZone) {
      if (this.currentZoneRole === 'presenter') {
        this.onEnterPresenterZone(this.currentZone);
      } else {
        this.onEnterAudienceZone(this.currentZone);
      }
    } else if (this.currentTable) {
      if (this.currentTable.search('clubmicrophone') !== -1) {
        this.onJoinMicChannel();
      } else {
        this.onSitAtTable();
      }
    } else {
      this.onJoinRoom();
    }
  };

  // Join the Level inside the game
  joinLevel = (level) => {
    // As of now (10/12), command to join level is different per each level
    // e.g. WebClickMainHub for MainHub, WebClickGeneralSession for GeneralSession
    this.emitUIInteraction({ method: `WebClick${level}` });
  };

  // Join the Level inside the game
  joinLevelNew = (mapName, groupName = '') => {
    // As of now (10/12), command to join level is different per each level
    // e.g. WebClickMainHub for MainHub, WebClickGeneralSession for GeneralSession
    if (mapName === 'CreateNewMeeting') {
      this.emitUIInteraction({ method: `WebClickCreateNewMeeting` });
    } else {
      this.emitUIInteraction({
        method: 'RequestTeleportToMap',
        payload: {
          mapName,
          groupName,
        },
      });
    }
  };

  // Enter Event
  enterEvent = () => {
    this.emitUIInteraction({ method: 'JoinEvent' });
  };

  // Show Avatar
  showAvatar = (bShow = true) => {
    this.emitUIInteraction({ method: 'ShowAvatarMenu', payload: { bShow } });
  };

  // Edit Avatar
  editAvatar = () => {
    this.emitUIInteraction({ method: 'CustomizeAvatar' });
  };

  // Save Avatar
  saveAvatar = () => {
    this.emitUIInteraction({ method: 'MainSaveButton' });
  };

  // Reset Avatar
  resetAvatar = () => {
    this.emitUIInteraction({ method: 'MainResetButton' });
  };

  // ** Close Avatar
  closeAvatar = () => {
    this.emitUIInteraction({ method: 'MainCloseButton' });
  };

  // Play emote
  playEmote = (emote) => {
    this.emitUIInteraction({
      method: 'WebPlayEmote',
      payload: {
        EmoteName: emote,
      },
    });
  };

  /**
   * Emit Agora "Set Volume" UI Interaction.
   * @param level
   */
  setVolumeLevel = (level) => {
    let agora = this.getAgoraMainClient();

    // console.info(
    //   `[GameClient] setVolumeLevel level:${level} agoraChannel:${agora.channel}`
    // );

    // console.info(`[GameClient] idArr streamList`, idArr);
    // let idArr = agora.streamList.map((streams) => streams.getId());

    this.emitUIInteraction({
      method: 'ReceiveAgoraVolumeIndication',
      payload: {
        eventUserId: this.eventUserId,
        volumeLevel: level,
        channelID: this.getAgoraMainClient().channel,
      },
    });
  };

  // Teleport user to the meeting room
  teleportUserToMeetingRoom = (roomName) => {
    window?.gameClient?.logUserAction?.({
      eventName: 'TELEPORT_TO_MEETING_ROOM',
      eventSpecificData: null,
      beforeState: this.currentRoomName,
      afterState: roomName,
    });

    this.emitUIInteraction({
      method: 'RequestTeleportToMeeting',
      payload: {
        roomName:
          this.eventId === null ? roomName : `${this.eventId}.${roomName}`,
      },
    });
  };

  // Set Game Audio Volume
  setAudioVolume = (audioVolume) => {
    this.audioVolume = audioVolume;

    if (!this.audioMuted) {
      this.emitUIInteraction({
        method: 'SetVolume',
        payload: {
          SoundClass: 'Media',
          Volume: audioVolume / 100,
        },
      });
    }
  };

  // Set Game Effect Volume
  setEffectVolume = (effectVolume) => {
    this.effectVolume = effectVolume;

    if (!this.audioMuted) {
      this.emitUIInteraction({
        method: 'SetVolume',
        payload: {
          SoundClass: 'SFX',
          Volume: effectVolume / 100,
        },
      });
    }
  };

  // Mute Game
  muteGame = () => {
    this.audioMuted = true;

    this.emitUIInteraction({
      method: 'SetVolume',
      payload: {
        SoundClass: 'Media',
        Volume: 0,
      },
    });

    this.emitUIInteraction({
      method: 'SetVolume',
      payload: {
        SoundClass: 'SFX',
        Volume: 0,
      },
    });
  };

  // Unmute Game
  unmuteGame = () => {
    this.audioMuted = false;

    this.emitUIInteraction({
      method: 'SetVolume',
      payload: {
        SoundClass: 'Media',
        Volume: this.audioVolume / 100,
      },
    });

    this.emitUIInteraction({
      method: 'SetVolume',
      payload: {
        SoundClass: 'SFX',
        Volume: this.effectVolume / 100,
      },
    });
  };

  // Set model display data
  updateModelDisplay = (modelDisplayData) => {
    this.emitUIInteraction({
      method: 'UpdateModelDisplay',
      payload: {
        ...modelDisplayData,
      },
    });
  };

  // Set model display data
  closeModelDisplay = (modelDisplayData) => {
    this.emitUIInteraction({ method: 'CloseModelDisplay' });
  };

  // Join Audio Call
  joinAudioCall = (channel) => {
    this.onJoinAudioCall(channel);
  };

  // Leave Audio Call
  leaveAudioCall = () => {
    this.onLeaveAudioCall();
  };

  // Freeze Frame
  freezeFrame = (forceFreeze = false) => {
    if (!forceFreeze && this.isFrozen) {
      return;
    }

    this.isFrozen = true;

    if (this.isInitialized) {
      this.triggerEvent('freeze-frame', store.getState());
    }
  };

  // Unfreeze Frame
  unfreezeFrame = (frame = null) => {
    if (!this.isFrozen) {
      return;
    }

    this.isFrozen = false;

    if (this.isInitialized) {
      this.triggerEvent('unfreeze-frame', frame);
    }
  };

  // Start Afk Warning Timer
  startAfkWarningTimer = (args) => {
    if (this.playerWindow) {
      this.playerWindow.startAfkWarningTimer(args);
    }
  };

  // Reset Afk Warning Timer for smartscreen  mode call
  resetAfkWarningTimer = () => {
    if (this.playerWindow) {
      this.playerWindow.resetAfkWarningTimer();
    }
  };

  // Stop Afk Warning Timer
  stopAfkWarningTimer = () => {
    if (this.playerWindow) {
      this.playerWindow.stopAfkWarningTimer();
    }
  };

  muteVideoOnExit = () => {
    if (window.agoraClientPrimary) {
      window.agoraClientPrimary.muteVideo();
    }
    if (enableVOG && window.agoraClientSecondary) {
      window.agoraClientSecondary.muteVideo();
    }
    if (window.agoraClientThird) {
      window.agoraClientThird.muteVideo();
    }
  };

  /***************************
   * Custom Event Management *
   ***************************/
  on = (event, handler) => {
    this.addEventListener(event, (e) => {
      if (handler) {
        handler(e.detail);
      }
    });
  };

  triggerEvent = (name, payload) => {
    this.dispatchEvent(new CustomEvent(name, { detail: payload }));
  };

  /**
   * Returns the main agora channel instance.
   * @returns {AgoraClient}
   */
  getAgoraMainClient() {
    return window.agoraClientPrimary;
  }

  setOnlineUserStatusToCirrus(payload) {
    this.signalingClient.sendData(
      JSON.stringify({
        type: 'setstatus',
        flag: payload,
      })
    );
  }
}

/*
 * JsDoc Virtual Types
 * Enable type information and code assistance.
 */

/**
 * @typedef {{playerIdsAndDistanceArray:[string,number][]} | [string,number]} ParsePlayerDistancesPayload
 */
