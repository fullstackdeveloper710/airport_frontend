import store from 'store';
import { setMessage } from 'store/reducers/message';
import { logout } from 'store/reducers/user';
import { forceTimedSession, timedSessionDuration, timedSessionWarning, timedSessionEnableTransitionBeforeRedirect, timedSessionTransitionScreenUrl } from 'utils/eventVariables';
import i18next from 'i18next';
import { MessageType, SpecialKeyCodes } from '.';
import { pushGameStage } from 'store/reducers/game';
import { GAME_STAGE_KICKED_OUT_TRANSITION } from 'constants/game';

export const ControlSchemeType = {
  // A mouse can lock inside the WebRTC player so the user can simply move the
  // mouse to control the orientation of the camera. The user presses the
  // Escape key to unlock the mouse.
  LockedMouse: 0,

  // A mouse can hover over the WebRTC player so the user needs to click and
  // drag to control the orientation of the camera.
  HoveringMouse: 1,

  // Our custom version
  DynamicMouse: 2,
};

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const MouseButton = {
  MainButton: 0, // Left button.
  AuxiliaryButton: 1, // Wheel button.
  SecondaryButton: 2, // Right button.
  FourthButton: 3, // Browser Back button.
  FifthButton: 4, // Browser Forward button.
};

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
const MouseButtonsMask = {
  PrimaryButton: 1, // Left button.
  SecondaryButton: 2, // Right button.
  AuxiliaryButton: 4, // Wheel button.
  FourthButton: 8, // Browser Back button.
  FifthButton: 16, // Browser Forward button.
};

export default class PlayerWindow {
  constructor(gameClient) {
    this.gameClient = gameClient;

    this.hasFocus = true;

    this.options = {
      matchViewportResolution: false,
      print_inputs: false,
      print_stats: true,
      inputOptions: {
        // The control scheme controls the behaviour of the mouse when it interacts
        // with the WebRTC player.
        controlScheme: ControlSchemeType.DynamicMouse,

        // Browser keys are those which are typically used by the browser UI. We
        // usually want to suppress these to allow, for example, UE5 to show shader
        // complexity with the F5 key without the web page refreshing.
        suppressBrowserKeys: true,

        // UE5 has a faketouches option which fakes a single finger touch when the
        // user drags with their mouse. We may perform the reverse; a single finger
        // touch may be converted into a mouse drag UE5 side. This allows a
        // non-touch application to be controlled partially via a touch device.
        fakeMouseWithTouches: true,
      },
      dynamicMouse: {
        lockAllowed: true,
        locked: false,
        dragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0,
        maxDragOffset: 3,
        shouldUnlock: false,
        // Flag variable to use right mouse button to toggle dynamic mouse.
        useRightButton: false,
      },
    };

    this.style = {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      cursor: 'default',
      additional: '',
    };

    this.normalize = {
      normalizeAndQuantizeUnsigned: null,
      normalizeAndQuantizeSigned: null,
      unquantizeAndDenormalizeUnsigned: null,
    };

    this.cachedPlayerElementBoundingRect = null;
    this.orientationChangeTimeout = null;
    this.resizeTimeout = null;
    this.lastTimeResized = new Date().getTime();

    this.freezeFrame = {
      receiving: false,
      size: 0,
      jpeg: undefined,
      height: 0,
      width: 0,
      valid: false,
    };

    // Optionally detect if the user is not interacting (AFK) and disconnect them.
    this.afk = {
      enabled: true, // Set to true to enable the AFK system.
      warnTimeout: 300, // The time to elapse before warning the user they are inactive.
      closeTimeout: 60, // The time after the warning when we disconnect the user.

      active: false, // Whether the AFK system is currently looking for inactivity.
      overlay: undefined, // The UI overlay warning the user that they are inactive.
      warnTimer: undefined, // The timer which waits to show the inactivity warning overlay.
      countdown: 0, // The inactivity warning overlay has a countdown to show time until disconnect.
      countdownTimer: undefined, // The timer used to tick the seconds shown on the inactivity warning overlay.
    };

    // Optionally kickout user after desired duration based on forceTimeSession event variable
    this.kickout = {
      enabled: forceTimedSession,
      warnTimeout: timedSessionWarning * 60 * 1000,
      kickoutTimeout: timedSessionDuration * 60 * 1000,
      warnTimer: undefined,
      countdown: timedSessionDuration - timedSessionWarning,
      enableTransitionScreen: timedSessionEnableTransitionBeforeRedirect,
      transitionSccreenUrl: timedSessionTransitionScreenUrl,
    };

    this.freezeFrameOverlay = null;
    this.hiddenInput = undefined;
    this.editTextButton = undefined;

    if (this.kickout.enabled) this.forceKickout();

    this.haveEvents = 'GamepadEvent' in window;
    this.haveWebkitEvents = 'WebKitGamepadEvent' in window;
    this.controllers = {};
    this.rAF =
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.requestAnimationFrame;
    this.kbEvent = document.createEvent('KeyboardEvent');
    this.initMethod =
      typeof this.kbEvent.initKeyboardEvent !== 'undefined'
        ? 'initKeyboardEvent'
        : 'initKeyEvent';
  }

  /***********
   * Getters *
   ***********/
  getPlayerElement = () => {
    return document.getElementById('player');
  };

  getPlayerControlElement = () => {
    return document.getElementById('player-control');
  };

  getNavigationBarElement = () => {
    return document.querySelector('.sideNav');
  };

  getPlayerElementBoundingRect = () => {
    return this.getPlayerElement()
      ? this.getPlayerElement().getBoundingClientRect()
      : null;
  };

  getVideoElement = () => {
    return this.getPlayerElement()
      ? this.getPlayerElement().getElementsByTagName('video')[0]
      : null;
  };

  getFreezeFrameOverlay = () => {
    return this.freezeFrameOverlay;
  };

  getOptions = () => {
    return this.options;
  };

  getFreezeFrame = () => {
    return this.freezeFrame;
  };

  /***********************************
   * Player DOM Element Manipulation *
   ***********************************/

  // Main Player setup
  createPlayerElement = () => {
    const element = document.createElement('div');
    element.setAttribute('id', 'player');
    document.body.append(element);
  };

  // Destroy Player Window
  destroyPlayerElement = () => {
    if (this.getPlayerElement()) {
      this.getPlayerElement().remove();
    }
  };

  updateVideoStreamSize = () => {
    if (!this.options.matchViewportResolution) {
      return;
    }

    let now = new Date().getTime();
    if (now - this.lastTimeResized > 1000) {
      let playerElement = this.getPlayerElement();
      if (!playerElement) return;

      let descriptor = {
        Console:
          'setres ' +
          playerElement.clientWidth +
          'x' +
          playerElement.clientHeight,
      };
      this.gameClient.emitUIInteraction(descriptor);
      console.log(descriptor);
      this.lastTimeResized = new Date().getTime();
    } else {
      console.log('Resizing too often - skipping');
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(this.updateVideoStreamSize, 1000);
    }
  };

  // Resize handler
  resizePlayerStyleToFillWindow = () => {
    const playerElement = this.getPlayerElement();
    const videoElement = this.getVideoElement();
    const rightPanelWidth = 0;
    const sideBarWidth = 0;

    if (!playerElement || !videoElement) {
      return;
    }

    // Fill the player display in window, keeping picture's aspect ratio.
    const windowAspectRatio =
      window.innerHeight / (window.innerWidth - sideBarWidth - rightPanelWidth);
    // We want to keep the video ratio correct for the video stream
    const videoAspectRatio = videoElement.videoHeight / videoElement.videoWidth;
    let styleString;

    if (isNaN(videoAspectRatio)) {
      //Video is not initialised yet so set playerElement to size of window
      this.style.width = window.innerWidth - sideBarWidth - rightPanelWidth;
      this.style.height = window.innerHeight;
      this.style.top = 0;
      this.style.left = sideBarWidth;
      styleString =
        'top: ' +
        this.style.top +
        'px; left: ' +
        this.style.left +
        'px; width: ' +
        this.style.width +
        'px; height: ' +
        this.style.height +
        'px; cursor: ' +
        this.style.cursor +
        '; ' +
        this.style.additional;
    } else if (windowAspectRatio < videoAspectRatio) {
      // Window height is the constraining factor so to keep aspect ratio change width appropriately
      this.style.width = Math.floor(window.innerHeight / videoAspectRatio);
      this.style.height = window.innerHeight;
      this.style.top = 0;
      this.style.left =
        Math.floor(
          (window.innerWidth -
            this.style.width -
            sideBarWidth -
            rightPanelWidth) *
            0.5
        ) + sideBarWidth;
      //Video is now 100% of the playerElement, so set the playerElement style
      styleString =
        'top: ' +
        this.style.top +
        'px; left: ' +
        this.style.left +
        'px; width: ' +
        this.style.width +
        'px; height: ' +
        this.style.height +
        'px; cursor: ' +
        this.style.cursor +
        '; ' +
        this.style.additional;
    } else {
      // Window width is the constraining factor so to keep aspect ratio change height appropriately
      this.style.width = window.innerWidth - sideBarWidth - rightPanelWidth;
      this.style.height = Math.floor(this.style.width * videoAspectRatio);
      this.style.top = Math.floor(
        (window.innerHeight - this.style.height) * 0.5
      );
      this.style.left = sideBarWidth;
      //Video is now 100% of the playerElement, so set the playerElement style
      styleString =
        'top: ' +
        this.style.top +
        'px; left: ' +
        this.style.left +
        'px; width: ' +
        this.style.width +
        'px; height: ' +
        this.style.height +
        'px; cursor: ' +
        this.style.cursor +
        '; ' +
        this.style.additional;
    }
    playerElement.style = styleString;
    const playerControlElement = this.getPlayerControlElement();
    if (playerControlElement) {
      playerControlElement.style = styleString;
    }
    const navigationBarElement = this.getNavigationBarElement();
    if (navigationBarElement) {
      navigationBarElement.style = styleString.slice(
        0,
        styleString.indexOf('left:')
      );
    }
  };

  resizePlayerStyleToActualSize = () => {
    const playerElement = this.getPlayerElement();
    const videoElement = this.getVideoElement();

    if (videoElement.length > 0) {
      // Display image in its actual size
      this.style.width = videoElement.videoWidth;
      this.style.height = videoElement.videoHeight;
      this.style.top = Math.max(
        Math.floor((window.innerHeight - this.style.height) * 0.5),
        0
      );
      this.style.left = Math.max(
        Math.floor((window.innerWidth - this.style.width) * 0.5),
        0
      );
      //Video is now 100% of the playerElement, so set the playerElement style
      const styleString =
        'top: ' +
        this.style.top +
        'px; left: ' +
        this.style.left +
        'px; width: ' +
        this.style.width +
        'px; height: ' +
        this.style.height +
        'px; cursor: ' +
        this.style.cursor +
        '; ' +
        this.style.additional;
      playerElement.style = styleString;

      const playerControlElement = this.getPlayerControlElement();
      if (playerControlElement) {
        playerControlElement.style = styleString;
      }

      const navigationBarElement = this.getNavigationBarElement();
      if (navigationBarElement) {
        navigationBarElement.style = styleString.slice(
          0,
          styleString.indexOf('left:')
        );
      }
    }
  };

  resizePlayerStyleToArbitrarySize = () => {
    // Video is now 100% of the playerElement, so set the playerElement style
    const playerElement = this.getPlayerElement();
    const styleString =
      'top: 0px; left: 0px; width: ' +
      this.style.width +
      'px; height: ' +
      this.style.height +
      'px; cursor: ' +
      this.style.cursor +
      '; ' +
      this.style.additional;
    playerElement.style = styleString;

    const playerControlElement = this.getPlayerControlElement();
    if (playerControlElement) {
      playerControlElement.style = styleString;
    }

    const navigationBarElement = this.getNavigationBarElement();
    if (navigationBarElement) {
      navigationBarElement.style = styleString.slice(
        0,
        styleString.indexOf('left:')
      );
    }
  };

  resizePlayerStyle = () => {
    var playerElement = this.getPlayerElement();

    if (!playerElement) return;

    this.updateVideoStreamSize();

    if (playerElement?.classList.contains('fixed-size')) {
      this.setupMouseAndFreezeFrame(playerElement);
      return;
    }

    this.resizePlayerStyleToFillWindow(playerElement);
    this.setupMouseAndFreezeFrame(playerElement);

    this.cachedPlayerElementBoundingRect = this.getPlayerElementBoundingRect();
  };

  setupMouseAndFreezeFrame = () => {
    // Calculating and normalizing positions depends on the width and height of
    // the player.
    this.setupNormalizeAndQuantize();
    this.resizeFreezeFrameOverlay();
  };

  // Overlay setup
  setOverlay = (htmlClass, htmlElement, onClickFunction) => {
    let videoPlayOverlay = document.getElementById('videoPlayOverlay');
    if (!videoPlayOverlay) {
      videoPlayOverlay = document.createElement('div');
      videoPlayOverlay.id = 'videoPlayOverlay';
      this.getPlayerElement().appendChild(videoPlayOverlay);
    }

    // Remove existing html child elements so we can add the new one
    while (videoPlayOverlay.lastChild) {
      videoPlayOverlay.removeChild(videoPlayOverlay.lastChild);
    }

    if (htmlElement) videoPlayOverlay.appendChild(htmlElement);

    if (onClickFunction) {
      videoPlayOverlay.addEventListener(
        'click',
        function onOverlayClick(event) {
          onClickFunction(event);
          videoPlayOverlay.removeEventListener('click', onOverlayClick);
        }
      );
    }

    // Remove existing html classes so we can set the new one
    let cl = videoPlayOverlay?.classList;
    for (let i = cl.length - 1; i >= 0; i--) {
      cl.remove(cl[i]);
    }

    videoPlayOverlay?.classList.add(htmlClass);
  };

  hideOverlay = () => {
    this.setOverlay('hiddenState');
  };

  // Calculate normalize functions
  setupNormalizeAndQuantize = () => {
    const playerElement = this.getPlayerElement();
    const videoElement = this.getVideoElement();

    if (playerElement && videoElement) {
      let playerAspectRatio =
        playerElement.clientHeight / playerElement.clientWidth;
      let videoAspectRatio = videoElement.videoHeight / videoElement.videoWidth;

      // Unsigned XY positions are the ratio (0.0..1.0) along a viewport axis,
      // quantized into an uint16 (0..65536).
      // Signed XY deltas are the ratio (-1.0..1.0) along a viewport axis,
      // quantized into an int16 (-32767..32767).
      // This allows the browser viewport and client viewport to have a different
      // size.
      // Hack: Currently we set an out-of-range position to an extreme (65535)
      // as we can't yet accurately detect mouse enter and leave events
      // precisely inside a video with an aspect ratio which causes mattes.

      if (playerAspectRatio > videoAspectRatio) {
        if (this.options.print_inputs) {
          console.log(
            'Setup Normalize and Quantize for playerAspectRatio > videoAspectRatio'
          );
        }
        const ratio = playerAspectRatio / videoAspectRatio;

        // Unsigned.
        this.normalize.normalizeAndQuantizeUnsigned = (x, y) => {
          const normalizedX = x / playerElement.clientWidth;
          const normalizedY =
            ratio * (y / playerElement.clientHeight - 0.5) + 0.5;
          if (
            normalizedX < 0.0 ||
            normalizedX > 1.0 ||
            normalizedY < 0.0 ||
            normalizedY > 1.0
          ) {
            return {
              inRange: false,
              x: 65535,
              y: 65535,
            };
          } else {
            return {
              inRange: true,
              x: normalizedX * 65536,
              y: normalizedY * 65536,
            };
          }
        };

        this.normalize.unquantizeAndDenormalizeUnsigned = (x, y) => {
          const normalizedX = x / 65536;
          const normalizedY = (y / 65536 - 0.5) / ratio + 0.5;
          return {
            x: normalizedX * playerElement.clientWidth,
            y: normalizedY * playerElement.clientHeight,
          };
        };

        // Signed.
        this.normalize.normalizeAndQuantizeSigned = (x, y) => {
          const normalizedX = x / (0.5 * playerElement.clientWidth);
          const normalizedY = (ratio * y) / (0.5 * playerElement.clientHeight);
          return {
            x: normalizedX * 32767,
            y: normalizedY * 32767,
          };
        };
      } else {
        if (this.options.print_inputs) {
          console.log(
            'Setup Normalize and Quantize for playerAspectRatio <= videoAspectRatio'
          );
        }
        const ratio = videoAspectRatio / playerAspectRatio;
        // Unsigned.
        this.normalize.normalizeAndQuantizeUnsigned = (x, y) => {
          const normalizedX =
            ratio * (x / playerElement.clientWidth - 0.5) + 0.5;
          const normalizedY = y / playerElement.clientHeight;
          if (
            normalizedX < 0.0 ||
            normalizedX > 1.0 ||
            normalizedY < 0.0 ||
            normalizedY > 1.0
          ) {
            return {
              inRange: false,
              x: 65535,
              y: 65535,
            };
          } else {
            return {
              inRange: true,
              x: normalizedX * 65536,
              y: normalizedY * 65536,
            };
          }
        };

        this.normalize.unquantizeAndDenormalizeUnsigned = (x, y) => {
          const normalizedX = (x / 65536 - 0.5) / ratio + 0.5;
          const normalizedY = y / 65536;
          return {
            x: normalizedX * playerElement.clientWidth,
            y: normalizedY * playerElement.clientHeight,
          };
        };

        // Signed.
        this.normalize.normalizeAndQuantizeSigned = (x, y) => {
          const normalizedX = (ratio * x) / (0.5 * playerElement.clientWidth);
          const normalizedY = y / (0.5 * playerElement.clientHeight);
          return {
            x: normalizedX * 32767,
            y: normalizedY * 32767,
          };
        };
      }
    }
  };

  // Freeze frame setup
  showFreezeFrame = () => {
    const _this = this;
    let base64 = btoa(
      this.freezeFrame.jpeg.reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );
    let freezeFrameImage =
      document.getElementById('freezeFrameOverlay').childNodes[0];
    freezeFrameImage.src = 'data:image/jpeg;base64,' + base64;
    freezeFrameImage.onload = function () {
      _this.freezeFrame.height = freezeFrameImage.naturalHeight;
      _this.freezeFrame.width = freezeFrameImage.naturalWidth;
      _this.resizeFreezeFrameOverlay();
      _this.showFreezeFrameOverlay();

      if (_this.gameClient.signalingClient.getWebRTClient().webRtcPlayerObj) {
        _this.gameClient.signalingClient
          .getWebRTClient()
          .webRtcPlayerObj.setVideoEnabled(false);
      }
    };
  };

  processFreezeFrameMessage = (view) => {
    // Reset freeze frame if we got a freeze frame message and we are not "receiving" yet.
    if (!this.freezeFrame.receiving) {
      this.freezeFrame.receiving = true;
      this.freezeFrame.valid = false;
      this.freezeFrame.size = 0;
      this.freezeFrame.jpeg = undefined;
    }

    // Extract total size of freeze frame (across all chunks)
    this.freezeFrame.size = new DataView(view.slice(1, 5).buffer).getInt32(
      0,
      true
    );

    // Get the jpeg part of the payload
    let jpegBytes = view.slice(1 + 4);

    // Append to existing jpeg that holds the freeze frame
    if (this.freezeFrame.jpeg) {
      let jpeg = new Uint8Array(
        this.freezeFrame.jpeg.length + jpegBytes.length
      );
      jpeg.set(this.freezeFrame.jpeg, 0);
      jpeg.set(jpegBytes, this.freezeFrame.jpeg.length);
      this.freezeFrame.jpeg = jpeg;
    }
    // No existing freeze frame jpeg, make one
    else {
      this.freezeFrame.jpeg = jpegBytes;
      this.freezeFrame.receiving = true;
      console.log(
        `received first chunk of freeze frame: ${this.freezeFrame.jpeg.length}/${this.freezeFrame.size}`
      );
    }

    // Uncomment for debug
    //console.log(`Received freeze frame chunk: ${this.freezeFrame.jpeg.length}/${this.freezeFrame.size}`);

    // Finished receiving freeze frame, we can show it now
    if (this.freezeFrame.jpeg.length === this.freezeFrame.size) {
      this.freezeFrame.receiving = false;
      this.freezeFrame.valid = true;
      console.log(`received complete freeze frame ${this.freezeFrame.size}`);
      this.showFreezeFrame();
    }
    // We received more data than the freeze frame payload message indicate (this is an error)
    else if (this.freezeFrame.jpeg.length > this.freezeFrame.size) {
      console.error(
        `received bigger freeze frame than advertised: ${this.freezeFrame.jpeg.length}/${this.freezeFrame.size}`
      );
      this.freezeFrame.jpeg = undefined;
      this.freezeFrame.receiving = false;
    }
  };

  setupFreezeFrameOverlay = () => {
    this.freezeFrameOverlay = document.createElement('div');
    this.freezeFrameOverlay.id = 'freezeFrameOverlay';
    this.freezeFrameOverlay.style.display = 'none';
    this.freezeFrameOverlay.style.pointerEvents = 'none';
    this.freezeFrameOverlay.style.position = 'absolute';
    this.freezeFrameOverlay.style.zIndex = '20';

    let freezeFrameImage = document.createElement('img');
    freezeFrameImage.style.position = 'absolute';
    this.freezeFrameOverlay.appendChild(freezeFrameImage);
  };

  destroyFreezeFrameOverlay = () => {
    if (this.getFreezeFrameOverlay()) {
      this.getFreezeFrameOverlay().remove();
    }
  };

  showFreezeFrameOverlay = () => {
    if (this.freezeFrame.valid) {
      this.freezeFrameOverlay?.classList.add('freezeframeBackground');
      this.freezeFrameOverlay.style.display = 'block';
    }
  };

  invalidateFreezeFrameOverlay = () => {
    this.freezeFrameOverlay.style.display = 'none';
    this.freezeFrame.valid = false;

    this.freezeFrameOverlay?.classList.remove('freezeframeBackground');

    if (this.gameClient.signalingClient.getWebRTClient().webRtcPlayerObj) {
      this.gameClient.signalingClient
        .getWebRTClient()
        .webRtcPlayerObj.setVideoEnabled(true);
    }
  };

  resizeFreezeFrameOverlay = () => {
    if (this.freezeFrame.width !== 0 && this.freezeFrame.height !== 0) {
      let displayWidth = this.freezeFrame.width;
      let displayHeight = this.freezeFrame.height;
      let displayTop = 0;
      let displayLeft = 0;

      let playerElement = document.getElementById('player');

      // Video is coming in at native resolution, we care more about the player size
      let playerAspectRatio =
        playerElement.offsetWidth / playerElement.offsetHeight;
      let videoAspectRatio = this.freezeFrame.width / this.freezeFrame.height;
      if (playerAspectRatio < videoAspectRatio) {
        displayWidth = playerElement.offsetWidth;
        displayHeight = Math.floor(
          playerElement.offsetWidth / videoAspectRatio
        );
        displayTop = Math.floor(
          (playerElement.offsetHeight - displayHeight) * 0.5
        );
        displayLeft = 0;
      } else {
        displayWidth = Math.floor(
          playerElement.offsetHeight * videoAspectRatio
        );
        displayHeight = playerElement.offsetHeight;
        displayTop = 0;
        displayLeft = Math.floor(
          (playerElement.offsetWidth - displayWidth) * 0.5
        );
      }

      let freezeFrameImage =
        document.getElementById('freezeFrameOverlay').childNodes[0];

      this.freezeFrameOverlay.style.width = playerElement.offsetWidth + 'px';
      this.freezeFrameOverlay.style.height = playerElement.offsetHeight + 'px';
      this.freezeFrameOverlay.style.left = 0 + 'px';
      this.freezeFrameOverlay.style.top = 0 + 'px';

      freezeFrameImage.style.width = displayWidth + 'px';
      freezeFrameImage.style.height = displayHeight + 'px';
      freezeFrameImage.style.left = displayLeft + 'px';
      freezeFrameImage.style.top = displayTop + 'px';
    }
  };

  // Afk setup
  /**  set warnTimeout as long or short */
  setLongWarnTimeout = (longTimeout) => {
    /** 300->5min standard on game
     * 2700->45mins edgecases like Agora zones, presentation areas, being in Tour mode, 1on1 calls, smartscreen, meeting rooms
     * */
    this.afk.warnTimeout = longTimeout ? 2700 : 300;
  };

  /** Start a timer which when elapsed will warn the user they are inactive. */
  startAfkWarningTimer = (args) => {
    this.setLongWarnTimeout(args?.longTimeout);
    this.afk.active = this.afk.enabled;
    this.resetAfkWarningTimer();
  };

  // Stop the timer which when elapsed will warn the user they are inactive.
  stopAfkWarningTimer = () => {
    this.setLongWarnTimeout(false);
    this.afk.active = false;
    if (this.afk.warnTimer) {
      clearTimeout(this.afk.warnTimer);
    }
  };

  // If the user interacts then reset the warning timer.
  resetAfkWarningTimer = () => {
    const _this = this;
    if (_this.afk.active) {
      clearTimeout(_this.afk.warnTimer);
      _this.afk.warnTimer = setTimeout(function () {
        _this.gameClient.freezeFrame();
        _this.gameClient.triggerEvent('close-countdown', {
          timeout: _this.afk.closeTimeout,
        });
      }, _this.afk.warnTimeout * 1000);
    }
  };

  /**
   * Optionally kickout user after desired duration based on forceTimeSession event variable
   */
  forceKickout = () => {
    if (!this.kickout.enabled) return;
    this.kickout.warnTimer = setTimeout(() => {
      const kickoutWarningCountdown = setInterval(() => {
        if (this.kickout.countdown === 0) {
          clearInterval(kickoutWarningCountdown);
          this.stopAfkWarningTimer();
          const game = store.getState().game;
          // kick out
          this.gameClient?.logUserAction?.({
            eventName: 'LOGOUT',
            eventSpecificData: JSON.stringify({
              method: 'ForcedOut',
            }),
            beforeState: JSON.stringify({
              mapName: game?.currentRoom?.nextMapName,
            }),
            afterState: null,
          });
          this.gameClient.dispatch(logout());
          if (this.kickout.transitionSccreenUrl) {
            window.location.replace(this.kickout.transitionSccreenUrl);
          }
          else {
            this.gameClient.dispatch(
              pushGameStage(GAME_STAGE_KICKED_OUT_TRANSITION)
            );
          }
          return;
        }
        this.gameClient.dispatch(
          setMessage({
            message: i18next.t(
              'components.panels.game.kickout.warningMessage',
              {
                minutesRemaining: `${this.kickout.countdown} ${
                  this.kickout.countdown > 1
                    ? i18next.t(
                        'components.common.datePicker.dayPickerStrings.timesPlural.minutes'
                      )
                    : i18next.t(
                        'components.common.datePicker.dayPickerStrings.times.minute'
                      )
                }`,
              }
            ),
            timeout: 30 * 1000,
          })
        );
        --this.kickout.countdown;
      }, 1 * 60 * 1000);
    }, this.kickout.warnTimeout - 1 * 60 * 1000); // minus a minute because the interval will start after a minute
  };

  // On-screen keyboard setup
  createOnScreenKeyboardHelpers = (element) => {
    if (document.getElementById('hiddenInput') === null) {
      this.hiddenInput = document.createElement('input');
      this.hiddenInput.id = 'hiddenInput';
      this.hiddenInput.maxLength = 0;
      element.appendChild(this.hiddenInput);
    }

    if (document.getElementById('editTextButton') === null) {
      this.editTextButton = document.createElement('button');
      this.editTextButton.id = 'editTextButton';
      this.editTextButton.innerHTML = 'edit text';
      element.appendChild(this.editTextButton);

      // Hide the 'edit text' button.
      this.editTextButton?.classList.add('hiddenState');

      this.editTextButton.addEventListener('click', function () {
        // Show the on-screen keyboard.
        this.hiddenInput.focus();
      });
    }
  };

  showOnScreenKeyboard = (command) => {
    if (command.showOnScreenKeyboard) {
      if (!this.editTextButton) {
        this.createOnScreenKeyboardHelpers(this.getPlayerElement());
      }
      // Show the 'edit text' button.
      this.editTextButton?.classList.remove('hiddenState');
      // Place the 'edit text' button near the UE5 input widget.
      let pos = this.normalize.unquantizeAndDenormalizeUnsigned(
        command.x,
        command.y
      );
      this.editTextButton.style.top = pos.y.toString() + 'px';
      this.editTextButton.style.left = (pos.x - 40).toString() + 'px';
    } else {
      // Hide the 'edit text' button.
      if (this.editTextButton) {
        this.editTextButton?.classList.add('hiddenState');
      }
      // Hide the on-screen keyboard.
      if (this.hiddenInput) {
        this.hiddenInput.blur();
      }
    }
  };

  // Fix for bug in iOS where windowsize is not correct at instance or orientation change
  // https://github.com/dimsemenov/PhotoSwipe/issues/1315
  onOrientationChange = () => {
    const _this = this;
    clearTimeout(_this.orientationChangeTimeout);
    _this.orientationChangeTimeout = setTimeout(function () {
      _this.resizePlayerStyle();
    }, 500);
  };

  onBlur = () => {
    if (this.hasFocus) {
      this.gameClient.freezeFrame();
    }
  };

  onFocus = () => {
    if (this.hasFocus && !this.gameClient.isInitialized) {
      this.gameClient.unfreezeFrame();
    }
  };

  onVisibilityChange = () => {
    if (!document[window.visiblityKey.stateKey]) {
      this.onFocus();
    } else {
      this.onBlur();
    }
  };

  scanGamepads = () => {
    let gamepads = navigator.getGamepads
      ? navigator.getGamepads()
      : navigator.webkitGetGamepads
      ? navigator.webkitGetGamepads()
      : [];
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].index in this.controllers) {
        this.controllers[gamepads[i].index].currentState = gamepads[i];
      }
    }
  };

  updateStatus = () => {
    this.scanGamepads();
    // Iterate over multiple controllers in the case the mutiple gamepads are connected
    let j = undefined;
    for (j in this.controllers) {
      let controller = this.controllers[j];
      let currentState = controller.currentState;
      let prevState = controller.prevState;
      // Iterate over buttons
      for (let i = 0; i < currentState.buttons.length; i++) {
        let currButton = currentState.buttons[i];
        let prevButton = prevState.buttons[i];
        // Button 6 is actually the left trigger, send it to UE as an analog axis
        // Button 7 is actually the right trigger, send it to UE as an analog axis
        // The rest are normal buttons. Treat as such
        if (currButton.pressed && !prevButton.pressed) {
          // New press
          if (i == 6) {
            this.emitControllerAxisMove(j, 5, currButton.value);
          } else if (i == 7) {
            this.emitControllerAxisMove(j, 6, currButton.value);
          } else {
            this.emitControllerButtonPressed(j, i, 0);
          }
        } else if (!currButton.pressed && prevButton.pressed) {
          // release
          if (i == 6) {
            this.emitControllerAxisMove(j, 5, 0);
          } else if (i == 7) {
            this.emitControllerAxisMove(j, 6, 0);
          } else {
            this.emitControllerButtonReleased(j, i);
          }
        } else if (currButton.pressed && prevButton.pressed) {
          // repeat press / hold
          if (i == 6) {
            this.emitControllerAxisMove(j, 5, currButton.value);
          } else if (i == 7) {
            this.emitControllerAxisMove(j, 6, currButton.value);
          } else {
            this.emitControllerButtonPressed(j, i, 1);
          }
        }
        // Last case is button isn't currently pressed and wasn't pressed before. This doesn't need an else block
      }
      // Iterate over gamepad axes
      for (let i = 0; i < currentState.axes.length; i += 2) {
        let x = parseFloat(currentState.axes[i].toFixed(4));
        // https://w3c.github.io/gamepad/#remapping Gamepad broweser side standard mapping has positive down, negative up. This is downright disgusting. So we fix it.
        let y = -parseFloat(currentState.axes[i + 1].toFixed(4));
        if (i === 0) {
          // left stick
          // axis 1 = left horizontal
          this.emitControllerAxisMove(j, 1, x);
          // axis 2 = left vertical
          this.emitControllerAxisMove(j, 2, y);
        } else if (i === 2) {
          // right stick
          // axis 3 = right horizontal
          this.emitControllerAxisMove(j, 3, x);
          // axis 4 = right vertical
          this.emitControllerAxisMove(j, 4, y);
        }
      }
      this.controllers[j].prevState = currentState;
    }
    this.rAF(this.updateStatus);
  };

  emitControllerButtonPressed = (controllerIndex, buttonIndex, isRepeat) => {
    const Data = new DataView(new ArrayBuffer(4));
    Data.setUint8(0, MessageType.GamepadButtonPressed);
    Data.setUint8(1, controllerIndex);
    Data.setUint8(2, buttonIndex);
    Data.setUint8(3, isRepeat);
    this.gameClient.sendInputData(Data.buffer);
  };

  emitControllerButtonReleased = (controllerIndex, buttonIndex) => {
    const Data = new DataView(new ArrayBuffer(3));
    Data.setUint8(0, MessageType.GamepadButtonReleased);
    Data.setUint8(1, controllerIndex);
    Data.setUint8(2, buttonIndex);
    this.gameClient.sendInputData(Data.buffer);
  };

  emitControllerAxisMove = (controllerIndex, axisIndex, analogValue) => {
    const Data = new DataView(new ArrayBuffer(11));
    Data.setUint8(0, MessageType.GamepadAnalog);
    Data.setUint8(1, controllerIndex);
    Data.setUint8(2, axisIndex);
    Data.setFloat64(3, analogValue, true);
    this.gameClient.sendInputData(Data.buffer);
  };

  gamepadConnectHandler = (e) => {
    console.log('Gamepad connect handler');
    const gamepad = e.gamepad;
    this.controllers[gamepad.index] = {};
    this.controllers[gamepad.index].currentState = gamepad;
    this.controllers[gamepad.index].prevState = gamepad;
    console.log('gamepad: ' + gamepad.id + ' connected');
    this.rAF(this.updateStatus);
  };

  gamepadDisconnectHandler = (e) => {
    console.log('Gamepad disconnect handler');
    console.log('gamepad: ' + e.gamepad.id + ' disconnected');
    delete this.controllers[e.gamepad.index];
  };

  setupWindowEventHandlers = () => {
    window.addEventListener('resize', this.resizePlayerStyle, true);
    window.addEventListener('orientationchange', this.onOrientationChange);

    //Gamepad events
    if (this.haveEvents) {
      window.addEventListener('gamepadconnected', this.gamepadConnectHandler);
      window.addEventListener(
        'gamepaddisconnected',
        this.gamepadDisconnectHandler
      );
    } else if (this.haveWebkitEvents) {
      window.addEventListener(
        'webkitgamepadconnected',
        this.gamepadConnectHandler
      );
      window.addEventListener(
        'webkitgamepaddisconnected',
        this.gamepadDisconnectHandler
      );
    }
  };

  setupDebugOverlayEventHandlers = () => {
    //HTML elements controls
    let overlayButton = document.getElementById('overlayButton');

    if (overlayButton !== null) {
      overlayButton.addEventListener('click', this.toggleOverlay);
    }

    let _this = this;

    let encoderParamsSubmit = document.getElementById('encoder-params-submit');
    if (encoderParamsSubmit !== null) {
      encoderParamsSubmit.onclick = function () {
        let rateControl = document.getElementById('encoder-rate-control').value;
        let targetBitrate =
          document.getElementById('encoder-target-bitrate-text').value * 1000;
        let maxBitrate =
          document.getElementById('encoder-max-bitrate-text').value * 1000;
        let minQP = document.getElementById('encoder-min-qp-text').value;
        let maxQP = document.getElementById('encoder-max-qp-text').value;
        let fillerData = document.getElementById('encoder-filler-data-tgl')
          .checked
          ? 1
          : 0;
        let multipass = document.getElementById('encoder-multipass').value;

        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.Encoder.RateControl ' + rateControl,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand:
            'PixelStreaming.Encoder.TargetBitrate ' +
            (targetBitrate > 0 ? targetBitrate : -1),
        });
        _this.gameClient.emitCommand({
          ConsoleCommand:
            'PixelStreaming.Encoder.MaxBitrateVBR ' +
            (maxBitrate > 0 ? maxBitrate : -1),
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.Encoder.MinQP ' + minQP,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.Encoder.MaxQP ' + maxQP,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand:
            'PixelStreaming.Encoder.EnableFillerData ' + fillerData,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.Encoder.Multipass ' + multipass,
        });
      };
    }

    let webrtcParamsSubmit = document.getElementById('webrtc-params-submit');
    if (webrtcParamsSubmit !== null) {
      webrtcParamsSubmit.onclick = function () {
        let degradationPref = document.getElementById(
          'webrtc-degradation-pref'
        ).value;
        let maxFPS = document.getElementById('webrtc-max-fps-text').value;
        let minBitrate =
          document.getElementById('webrtc-min-bitrate-text').value * 1000;
        let maxBitrate =
          document.getElementById('webrtc-max-bitrate-text').value * 1000;
        let lowQP = document.getElementById('webrtc-low-qp-text').value;
        let highQP = document.getElementById('webrtc-high-qp-text').value;

        _this.gameClient.emitCommand({
          ConsoleCommand:
            'PixelStreaming.WebRTC.DegradationPreference ' + degradationPref,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.WebRTC.MaxFps ' + maxFPS,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.WebRTC.MinBitrate ' + minBitrate,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.WebRTC.MaxBitrate ' + maxBitrate,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.WebRTC.LowQpThreshold ' + lowQP,
        });
        _this.gameClient.emitCommand({
          ConsoleCommand: 'PixelStreaming.WebRTC.HighQpThreshold ' + highQP,
        });
      };
    }

    let showFPSButton = document.getElementById('show-fps-button');
    if (showFPSButton !== null) {
      showFPSButton.onclick = function () {
        let consoleDescriptor = {
          ConsoleCommand: 'stat fps',
        };
        _this.gameClient.emitCommand(consoleDescriptor);
      };
    }

    let latencyButton = document.getElementById('test-latency-button');
    if (latencyButton !== null) {
      latencyButton.onclick = () => {
        _this.gameClient.sendStartLatencyTest();
      };
    }
  };

  removeWindowEventHandlers = () => {
    window.removeEventListener('resize', this.resizePlayerStyle, true);
    window.removeEventListener('orientationchange', this.onOrientationChange);
  };

  setVolume = (volume) => {
    this.getVideoElement().volume = Math.min(1, Math.max(0, volume / 100));
  };

  /*************************
   * Player Event Emitters *
   *************************/

  emitMouseMove = (x, y, deltaX, deltaY) => {
    if (this.options.print_inputs) {
      console.log(`x: ${x}, y:${y}, dX: ${deltaX}, dY: ${deltaY}`);
    }
    const coord = this.normalize.normalizeAndQuantizeUnsigned(x, y);
    const delta = this.normalize.normalizeAndQuantizeSigned(deltaX, deltaY);
    const Data = new DataView(new ArrayBuffer(9));
    Data.setUint8(0, MessageType.MouseMove);
    Data.setUint16(1, coord.x, true);
    Data.setUint16(3, coord.y, true);
    Data.setInt16(5, delta.x, true);
    Data.setInt16(7, delta.y, true);
    this.gameClient.sendInputData(Data.buffer);
    this.gameClient.triggerEvent('mouse-move');
  };

  emitMouseDown = (button, x, y) => {
    if (this.options.print_inputs) {
      console.log(`mouse button ${button} down at (${x}, ${y})`);
    }
    const coord = this.normalize.normalizeAndQuantizeUnsigned(x, y);
    const Data = new DataView(new ArrayBuffer(6));
    Data.setUint8(0, MessageType.MouseDown);
    Data.setUint8(1, button);
    Data.setUint16(2, coord.x, true);
    Data.setUint16(4, coord.y, true);
    this.gameClient.sendInputData(Data.buffer);
  };

  emitMouseUp = (button, x, y) => {
    if (this.options.print_inputs) {
      console.log(`mouse button ${button} up at (${x}, ${y})`);
    }
    const coord = this.normalize.normalizeAndQuantizeUnsigned(x, y);
    const Data = new DataView(new ArrayBuffer(6));
    Data.setUint8(0, MessageType.MouseUp);
    Data.setUint8(1, button);
    Data.setUint16(2, coord.x, true);
    Data.setUint16(4, coord.y, true);
    this.gameClient.sendInputData(Data.buffer);
  };

  emitMouseWheel = (delta, x, y) => {
    if (this.options.print_inputs) {
      console.log(`mouse wheel with delta ${delta} at (${x}, ${y})`);
    }
    const coord = this.normalize.normalizeAndQuantizeUnsigned(x, y);
    const Data = new DataView(new ArrayBuffer(7));
    Data.setUint8(0, MessageType.MouseWheel);
    Data.setInt16(1, delta, true);
    Data.setUint16(3, coord.x, true);
    Data.setUint16(5, coord.y, true);
    this.gameClient.sendInputData(Data.buffer);
  };

  // If the user has any mouse buttons pressed then release them.
  releaseMouseButtons = (buttons, x, y) => {
    if (buttons & MouseButtonsMask.PrimaryButton) {
      this.emitMouseUp(MouseButton.MainButton, x, y);
    }
    if (buttons & MouseButtonsMask.SecondaryButton) {
      this.emitMouseUp(MouseButton.SecondaryButton, x, y);
    }
    if (buttons & MouseButtonsMask.AuxiliaryButton) {
      this.emitMouseUp(MouseButton.AuxiliaryButton, x, y);
    }
    if (buttons & MouseButtonsMask.FourthButton) {
      this.emitMouseUp(MouseButton.FourthButton, x, y);
    }
    if (buttons & MouseButtonsMask.FifthButton) {
      this.emitMouseUp(MouseButton.FifthButton, x, y);
    }
  };

  // If the user has any mouse buttons pressed then press them again.
  pressMouseButtons = (buttons, x, y) => {
    if (buttons & MouseButtonsMask.PrimaryButton) {
      this.emitMouseDown(MouseButton.MainButton, x, y);
    }
    if (buttons & MouseButtonsMask.SecondaryButton) {
      this.emitMouseDown(MouseButton.SecondaryButton, x, y);
    }
    if (buttons & MouseButtonsMask.AuxiliaryButton) {
      this.emitMouseDown(MouseButton.AuxiliaryButton, x, y);
    }
    if (buttons & MouseButtonsMask.FourthButton) {
      this.emitMouseDown(MouseButton.FourthButton, x, y);
    }
    if (buttons & MouseButtonsMask.FifthButton) {
      this.emitMouseDown(MouseButton.FifthButton, x, y);
    }
  };

  /*************************
   * Player Event Hanlding *
   *************************/

  // Browser keys do not have a charCode so we only need to test keyCode.
  isKeyCodeBrowserKey = (keyCode) => {
    // Function keys or tab key.
    return (keyCode >= 112 && keyCode <= 123) || keyCode === 9;
  };

  // We want to be able to differentiate between left and right versions of some
  // keys.
  getKeyCode = (e) => {
    if (e.keyCode === SpecialKeyCodes.Shift && e.code === 'ShiftRight')
      return SpecialKeyCodes.RightShift;
    else if (e.keyCode === SpecialKeyCodes.Control && e.code === 'ControlRight')
      return SpecialKeyCodes.RightControl;
    else if (e.keyCode === SpecialKeyCodes.Alt && e.code === 'AltRight')
      return SpecialKeyCodes.RightAlt;
    else return e.keyCode;
  };

  registerKeyboardEvents = () => {
    const _this = this;
    document.onkeydown = (e) => {
      /* Blocking user interaction with game, To prevent unnecessary event, 
      Example while Filling out the form, Avatar started to Jump
      When spacebar is pressed */
      if (window.blockKeyEventListener) return;

      if (_this.options.print_inputs) {
        console.log(`key down ${e.keyCode}, repeat = ${e.repeat}`);
      }
      if (_this.hasFocus) {
        _this.gameClient.sendInputData(
          new Uint8Array([MessageType.KeyDown, _this.getKeyCode(e), e.repeat])
            .buffer
        );
      }
      // Backspace is not considered a keypress in JavaScript but we need it
      // to be so characters may be deleted in a UE5 text entry field.
      if (e.keyCode === SpecialKeyCodes.BackSpace) {
        document.onkeypress({
          charCode: SpecialKeyCodes.BackSpace,
        });
      }
      if (
        _this.options.inputOptions.suppressBrowserKeys &&
        _this.isKeyCodeBrowserKey(e.keyCode)
      ) {
        e.preventDefault();
      }
    };

    document.onkeyup = (e) => {
      if (_this.options.print_inputs) {
        console.log(`key up ${e.keyCode}`);
      }
      if (_this.hasFocus) {
        _this.gameClient.sendInputData(
          new Uint8Array([MessageType.KeyUp, _this.getKeyCode(e)]).buffer
        );
      }
      if (
        _this.options.inputOptions.suppressBrowserKeys &&
        _this.isKeyCodeBrowserKey(e.keyCode)
      ) {
        e.preventDefault();
      }
    };

    document.onkeypress = (e) => {
      if (_this.options.print_inputs) {
        console.log(`key press ${e.charCode}`);
      }
      let data = new DataView(new ArrayBuffer(3));
      data.setUint8(0, MessageType.KeyPress);
      data.setUint16(1, e.charCode, true);
      if (_this.hasFocus) {
        _this.gameClient.sendInputData(data.buffer);
      }
    };
  };

  registerMouseEnterAndLeaveEvents = (element) => {
    const _this = this;
    element.onmouseenter = function (e) {
      if (_this.options.print_inputs) {
        console.log('mouse enter');
      }
      let Data = new DataView(new ArrayBuffer(1));
      Data.setUint8(0, MessageType.MouseEnter);
      _this.gameClient.sendInputData(Data.buffer);
      _this.pressMouseButtons(e);
    };

    element.onmouseleave = function (e) {
      if (_this.options.print_inputs) {
        console.log('mouse leave');
      }
      let Data = new DataView(new ArrayBuffer(1));
      Data.setUint8(0, MessageType.MouseLeave);
      _this.gameClient.sendInputData(Data.buffer);
      _this.releaseMouseButtons(e);
    };
  };

  registerTouchEvents = (element) => {
    const _this = this;

    // We need to assign a unique identifier to each finger.
    // We do this by mapping each Touch object to the identifier.
    const fingers = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    const fingerIds = {};

    const rememberTouch = (touch) => {
      const finger = fingers.pop();
      if (finger === undefined) {
        console.log('exhausted touch indentifiers');
      }
      fingerIds[touch.identifier] = finger;
    };

    const forgetTouch = (touch) => {
      fingers.push(fingerIds[touch.identifier]);
      delete fingerIds[touch.identifier];
    };

    const emitTouchData = (type, touches) => {
      const playerElementClientRect = _this.cachedPlayerElementBoundingRect;
      const data = new DataView(new ArrayBuffer(2 + 7 * touches.length));
      data.setUint8(0, type);
      data.setUint8(1, touches.length);
      let byte = 2;
      for (let t = 0; t < touches.length; t++) {
        const touch = touches[t];
        const x = touch.clientX - playerElementClientRect.left;
        const y = touch.clientY - playerElementClientRect.top;
        if (_this.options.print_inputs) {
          console.log(`F${fingerIds[touch.identifier]}=(${x}, ${y})`);
        }
        let coord = _this.normalize.normalizeAndQuantizeUnsigned(x, y);
        data.setUint16(byte, coord.x, true);
        byte += 2;
        data.setUint16(byte, coord.y, true);
        byte += 2;
        data.setUint8(byte, fingerIds[touch.identifier], true);
        byte += 1;
        data.setUint8(byte, 255 * touch.force, true); // force is between 0.0 and 1.0 so quantize into byte.
        byte += 1;
        data.setUint8(byte, coord.inRange ? 1 : 0, true); // mark the touch as in the player or not
        byte += 1;
      }
      _this.gameClient.sendInputData(data.buffer);
    };

    if (_this.options.inputOptions.fakeMouseWithTouches) {
      let finger = undefined;
      element.ontouchstart = function (e) {
        const playerElementClientRect = _this.cachedPlayerElementBoundingRect;
        if (finger === undefined) {
          const firstTouch = e.changedTouches[0];
          finger = {
            id: firstTouch.identifier,
            x: firstTouch.clientX - playerElementClientRect.left,
            y: firstTouch.clientY - playerElementClientRect.top,
          };
          // Hack: Mouse events require an enter and leave so we just
          // enter and leave manually with each touch as this event
          // is not fired with a touch device.
          element.onmouseenter(e);
          _this.emitMouseMove(finger.x, finger.y, finger.x, finger.y);
          _this.emitMouseDown(MouseButton.MainButton, finger.x, finger.y);
        }
        e.preventDefault();
      };

      element.ontouchend = function (e) {
        const playerElementClientRect = _this.cachedPlayerElementBoundingRect;
        for (let t = 0; t < e.changedTouches.length; t++) {
          const touch = e.changedTouches[t];
          if (touch.identifier === finger.id) {
            const x = touch.clientX - playerElementClientRect.left;
            const y = touch.clientY - playerElementClientRect.top;
            _this.emitMouseUp(MouseButton.MainButton, x, y);
            // Hack: Manual mouse leave event.
            element.onmouseleave(e);
            finger = undefined;
            break;
          }
        }
        e.preventDefault();
      };

      element.ontouchmove = function (e) {
        const playerElementClientRect = _this.cachedPlayerElementBoundingRect;
        for (let t = 0; t < e.touches.length; t++) {
          const touch = e.touches[t];
          if (touch.identifier === finger.id) {
            const x = touch.clientX - playerElementClientRect.left;
            const y = touch.clientY - playerElementClientRect.top;
            _this.emitMouseMove(x, y, x - finger.x, y - finger.y);
            finger.x = x;
            finger.y = y;
            break;
          }
        }
        e.preventDefault();
      };
    } else {
      element.ontouchstart = function (e) {
        // Assign a unique identifier to each touch.
        for (let t = 0; t < e.changedTouches.length; t++) {
          rememberTouch(e.changedTouches[t]);
        }

        if (this.options.print_inputs) {
          console.log('touch start');
        }
        emitTouchData(MessageType.TouchStart, e.changedTouches);
        e.preventDefault();
      };

      element.ontouchend = function (e) {
        if (this.options.print_inputs) {
          console.log('touch end');
        }
        emitTouchData(MessageType.TouchEnd, e.changedTouches);

        // Re-cycle unique identifiers previously assigned to each touch.
        for (let t = 0; t < e.changedTouches.length; t++) {
          forgetTouch(e.changedTouches[t]);
        }
        e.preventDefault();
      };

      element.ontouchmove = function (e) {
        if (this.options.print_inputs) {
          console.log('touch move');
        }
        emitTouchData(MessageType.TouchMove, e.touches);
        e.preventDefault();
      };
    }
  };

  registerInputs = (element) => {
    if (!element) return;

    this.registerMouseEnterAndLeaveEvents(element);
    this.registerTouchEvents(element);
  };

  // A locked mouse works by the user clicking in the browser player and the
  // cursor disappears and is locked. The user moves the cursor and the camera
  // moves, for example. The user presses escape to free the mouse.
  registerLockedMouseEvents = (element) => {
    const _this = this;
    let x = element.width / 2;
    let y = element.height / 2;

    element.requestPointerLock =
      element.requestPointerLock || element.mozRequestPointerLock;
    document.exitPointerLock =
      document.exitPointerLock || document.mozExitPointerLock;

    element.onclick = function () {
      element.requestPointerLock();
    };

    const lockStateChange = () => {
      if (
        document.pointerLockElement === element ||
        document.mozPointerLockElement === element
      ) {
        // console.log('Pointer locked');
        document.addEventListener('mousemove', updatePosition, false);
      } else {
        // console.log('The pointer lock status is now unlocked');
        document.removeEventListener('mousemove', updatePosition, false);

        // Change to Hovering mouse when exiting Locked Mouse
        if (_this.gameClient.signalingClient.getWebRTClient()) {
          _this.gameClient.signalingClient
            .getWebRTClient()
            .changeControlScheme(ControlSchemeType.HoveringMouse);
        }
      }
    };

    const updatePosition = (e) => {
      x += e.movementX;
      y += e.movementY;
      if (x >= _this.style.width) {
        x = _this.style.width - 1;
      }
      if (y >= _this.style.height) {
        y = _this.style.height - 1;
      }
      if (x <= 0) {
        x = 1;
      }
      if (y <= 0) {
        y = 1;
      }
      _this.emitMouseMove(x, y, e.movementX, e.movementY);
    };

    // Respond to lock state change events
    document.addEventListener('pointerlockchange', lockStateChange, false);
    document.addEventListener('mozpointerlockchange', lockStateChange, false);

    element.onmousedown = function (e) {
      _this.emitMouseDown(e.button, x, y);
    };

    element.onmouseup = function (e) {
      _this.emitMouseUp(e.button, x, y);
    };

    element.onmousewheel = function (e) {
      _this.emitMouseWheel(e.wheelDelta, x, y);
    };

    element.pressMouseButtons = function (e) {
      _this.pressMouseButtons(e.buttons, x, y);
    };

    element.releaseMouseButtons = function (e) {
      _this.releaseMouseButtons(e.buttons, x, y);
    };
  };

  // A hovering mouse works by the user clicking the mouse button when they want
  // the cursor to have an effect over the video. Otherwise the cursor just
  // passes over the browser.
  registerHoveringMouseEvents = (element) => {
    const _this = this;
    _this.style.cursor = 'default'; // Showing cursor

    element.onmousemove = (e) => {
      _this.emitMouseMove(e.offsetX, e.offsetY, e.movementX, e.movementY);
      e.preventDefault();
    };

    element.onmousedown = (e) => {
      _this.emitMouseDown(e.button, e.offsetX, e.offsetY);
      e.preventDefault();
    };

    element.onmouseup = (e) => {
      _this.emitMouseUp(e.button, e.offsetX, e.offsetY);
      e.preventDefault();
    };

    // When the context menu is shown then it is safest to release the button
    // which was pressed when the event happened. This will guarantee we will
    // get at least one mouse up corresponding to a mouse down event. Otherwise
    // the mouse can get stuck.
    // https://github.com/facebook/react/issues/5531
    element.oncontextmenu = (e) => {
      _this.emitMouseUp(e.button, e.offsetX, e.offsetY);
      e.preventDefault();
    };

    if ('onmousewheel' in element) {
      element.onmousewheel = (e) => {
        _this.emitMouseWheel(e.wheelDelta, e.offsetX, e.offsetY);
        e.preventDefault();
      };
    } else {
      element.addEventListener(
        'DOMMouseScroll',
        (e) => {
          _this.emitMouseWheel(e.detail * -120, e.offsetX, e.offsetY);
          e.preventDefault();
        },
        false
      );
    }

    element.pressMouseButtons = (e) => {
      _this.pressMouseButtons(e.buttons, e.offsetX, e.offsetY);
    };

    element.releaseMouseButtons = (e) => {
      _this.releaseMouseButtons(e.buttons, e.offsetX, e.offsetY);
    };

    // Remove existing onclick handler for LockedMouse
    if (element.onclick) {
      delete element.onclick;
      element.onclick = null;
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////// Start Echelon Work /////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // A dynamic mouse works like a hovering one by default, but can switch to a locked one
  // temporarily by right click dragging, or toggle to a locked one indefinitely by right clicking.
  registerDynamicMouseEvents = (element) => {
    const _this = this;
    _this.style.cursor = 'default'; // Showing cursor

    element.onmousemove = (e) => {
      _this.emitMouseMove(e.offsetX, e.offsetY, e.movementX, e.movementY);

      if (
        _this.options.dynamicMouse.locked &&
        _this.options.dynamicMouse.dragging &&
        !_this.options.dynamicMouse.shouldUnlock
      ) {
        _this.options.dynamicMouse.dragOffsetX += e.movementX;
        _this.options.dynamicMouse.dragOffsetY += e.movementY;

        if (
          Math.abs(_this.options.dynamicMouse.dragOffsetX) >
            _this.options.dynamicMouse.maxDragOffset ||
          Math.abs(_this.options.dynamicMouse.dragOffsetY) >
            _this.options.dynamicMouse.maxDragOffset
        ) {
          console.log('Mouse moved far enough, exit lock on release');
          _this.options.dynamicMouse.shouldUnlock = true;
        }
      }

      e.preventDefault();
    };

    element.onmousedown = function (e) {
      _this.emitMouseDown(e.button, e.offsetX, e.offsetY);

      if (e.button === 2) {
        if (_this.options.dynamicMouse.useRightButton) {
          _this.options.dynamicMouse.dragging = true;
          _this.options.dynamicMouse.dragOffsetX = 0;
          _this.options.dynamicMouse.dragOffsetY = 0;

          _this.lockDynamicMouseEvents(element);
        }
      }

      e.preventDefault();
    };

    element.onmouseup = function (e) {
      _this.emitMouseUp(e.button, e.offsetX, e.offsetY);

      if (e.button === 2) {
        if (_this.options.dynamicMouse.useRightButton) {
          _this.options.dynamicMouse.dragging = false;
        }
      }

      e.preventDefault();
    };

    // Respond to lock state change events
    document.addEventListener('pointerlockchange', lockStateChange, false);
    document.addEventListener('mozpointerlockchange', lockStateChange, false);

    function lockStateChange() {
      if (
        document.pointerLockElement === element ||
        document.mozPointerLockElement === element
      ) {
        console.log('Pointer locked');
        _this.options.dynamicMouse.locked = true;

        if (_this.options.dynamicMouse.useRightButton) {
          _this.gameClient.emitUIInteraction({
            method: 'NotifyDynamicMouseLocked',
            payload: { bLockState: true },
          });
        }
      } else {
        console.log('Pointer unlocked');
        _this.options.dynamicMouse.locked = false;
        _this.gameClient.emitUIInteraction({
          method: 'NotifyDynamicMouseLocked',
          payload: { bLockState: false },
        });
      }
    }

    // When the context menu is shown then it is safest to release the button
    // which was pressed when the event happened. This will guarantee we will
    // get at least one mouse up corresponding to a mouse down event. Otherwise
    // the mouse can get stuck.
    // https://github.com/facebook/react/issues/5531
    element.oncontextmenu = function (e) {
      _this.emitMouseUp(e.button, e.offsetX, e.offsetY);

      if (_this.options.dynamicMouse.useRightButton) {
        _this.options.dynamicMouse.locked = false;
        _this.options.dynamicMouse.dragging = false;
        _this.options.dynamicMouse.shouldUnlock = false;
      }

      e.preventDefault();
    };

    if ('onmousewheel' in element) {
      element.onmousewheel = function (e) {
        _this.emitMouseWheel(e.wheelDelta, e.offsetX, e.offsetY);
        e.preventDefault();
      };
    } else {
      element.addEventListener(
        'DOMMouseScroll',
        function (e) {
          _this.emitMouseWheel(e.detail * -120, e.offsetX, e.offsetY);
          e.preventDefault();
        },
        false
      );
    }

    element.pressMouseButtons = function (e) {
      _this.pressMouseButtons(e.buttons, e.offsetX, e.offsetY);
    };

    element.releaseMouseButtons = function (e) {
      _this.releaseMouseButtons(e.buttons, e.offsetX, e.offsetY);
    };
  };

  lockDynamicMouseEvents = (element) => {
    if (
      !this.options.dynamicMouse.locked &&
      this.options.dynamicMouse.lockAllowed
    ) {
      element.requestPointerLock();
      this.options.dynamicMouse.shouldUnlock = false;
    } else {
      this.options.dynamicMouse.shouldUnlock = true;
    }
  };

  unlockDynamicMouseEvents = () => {
    if (
      this.options.dynamicMouse.locked &&
      this.options.dynamicMouse.shouldUnlock
    ) {
      document.exitPointerLock =
        document.exitPointerLock || document.mozExitPointerLock;
      document.exitPointerLock();
    }
  };

  registerControlSchema = (element) => {
    switch (this.options.inputOptions.controlScheme) {
      case ControlSchemeType.HoveringMouse:
        this.registerHoveringMouseEvents(element);
        break;
      case ControlSchemeType.LockedMouse:
        this.registerLockedMouseEvents(element);
        break;
      case ControlSchemeType.DynamicMouse:
        this.registerDynamicMouseEvents(element);
        break;
      default:
        console.log(`ERROR: Unknown control scheme ${element.controlScheme}`);
        this.registerLockedMouseEvents(element);
        break;
    }
  };

  toggleOverlay = () => {
    let overlay = document.getElementById('overlay');
    overlay?.classList.toggle('overlay-shown');
  };

  setup = () => {
    this.createPlayerElement();
    this.setupWindowEventHandlers();
    this.setupDebugOverlayEventHandlers();
    this.setupFreezeFrameOverlay();
    this.registerKeyboardEvents();
    this.startAfkWarningTimer();
  };

  destroy = () => {
    this.destroyPlayerElement();
    this.removeWindowEventHandlers();
    this.destroyFreezeFrameOverlay();
    this.stopAfkWarningTimer();
  };

  disableMovement = () => {
    this.hasFocus = false;
    [37, 38, 39, 40, 65, 68, 83, 87].forEach((keyCode) => {
      this.gameClient.sendInputData(
        new Uint8Array([MessageType.KeyUp, keyCode]).buffer
      );
    });
  };

  enableMovement = () => {
    this.hasFocus = true;
  };

  changeControlScheme = (controlScheme) => {
    this.options.inputOptions.controlScheme = controlScheme;
  };
}
