import AgoraRTC from 'agora-rtc-sdk-ng';
import config from 'config';
import { AgoraService } from 'services';
import {
  screenSharingStopped,
  setAudioEnabled,
  setAudioAllowed,
  setPlayerVisiblity,
} from 'store/reducers/screenShare';
import { setMessage } from 'store/reducers/message';
import { setCurrent as setCurrentSmartScreen } from 'store/reducers/smartScreen';
import store from 'store';
const appId = config.agora.appId;

// const RTMP_URL =
//   'rtmp://maa01.contribute.live-video.net/app/live_792682763_cafVjjE86xjHduRMYdOcszLOc9cExc';

// https://hls-js.netlify.app/demo/?src=https://63050ee307b58b8f.mediapackage.us-east-1.a[…]/v1/ad83937397d4412186a7c8c3a7ab8d31/hls_electra/index.m3u8

// const RTMP_URL = 'rtmp://54.224.27.172:1935/live';

//const RTMP_URL = 'rtmp://54.224.27.172:1935/live/thistle';

// // CDN transcoding settings.

export default class AgoraClient extends EventTarget {
  constructor(userId, options) {
    super();

    this.localStream = null;
    /**
     *
     * @type {AgoraRTC.Stream[]}
     */
    this.remoteHostTrack = null;
    this.audioEnabled = false;
    this.videoEnabled = false;
    this.useVideo = false;
    this.microphoneId = null;
    this.eventHandlers = {};
    this.channel = null;
    this.uuid = userId;
    this.channelQueue = [];
    this.channelJoining = false;
    this.volume = 100;
    this.playerName = '';
    this.speakerOff = false;
    this.viewContent = false;
    this._dispatch = options.config.redux.dispatch;
    this.isPresenting = false;
    this.is_presenter =
      options.config?.user?.current?.roles.includes('ROLE_PRESENTER');

    this.LiveTranscoding = {
      // Width of the video (px). The default value is 640.
      width: window.screen.width,
      // Height of the video (px). The default value is 360.
      height: window.screen.height,
      // Bitrate of the video (Kbps). The default value is 400.
      videoBitrate: 700,
      videoFramerate: 24,
      audioSampleRate: 44100,
      audioBitrate: 48,
      videoCodecProfile: 100,
      audioChannels: 1,
      videoGop: 30,
      userCount: 10,
      backgroundColor: 0xddd,
      transcodingUsers: [
        {
          x: 0,
          y: 0,
          // If you don't want to show a user'  s video, set both the width and height to 1 to make the user's viewport a dot.
          // Do not set the width and height to 0 at the same time. If you do so, the SDK throws an error.
          width: window.screen.width,
          height: window.screen.height,
          zOrder: 0,
          alpha: 1,
          // The uid must be identical to the uid used in AgoraRTCClient.join.
          uid: options.config?.user?.current.eventUserId,
        },
      ],
    };

    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    const logLevel = 2; //WARNING
    AgoraRTC.setLogLevel(logLevel);

    if (this.is_presenter) {
      this.client.setClientRole('host');
    } else {
      this.client.setClientRole('audience');
    }

    this.client.enableAudioVolumeIndicator();
    this.subscribeStreamEvents();
  }

  /********************
   *Redux Dispatch
   *******************/
  dispatch = (selector) => {
    this._dispatch(selector);
  };

  /********************
   * Agora Management *
   ********************/

  // Agora Event Handlers
  subscribeStreamEvents = async () => {
    this.client.on('user-published', this.onUserPublished);
    this.client.on('user-unpublished', this.onUserUnPublished);
    this.client.on('user-joined', this.onUserJoined);
    this.client.on('user-left', this.onUserLeft);
    //this.client.on('live-streaming-error', this.onLiveStreamError);
  };

  unSubscribeStreamEvents = async () => {
    this.client.off('user-published', this.onUserPublished);
    this.client.off('user-unpublished', this.onUserUnPublished);
    this.client.off('user-joined', this.onUserJoined);
    this.client.off('user-left', this.onUserLeft);
    //this.client.off('live-streaming-error', this.onLiveStreamError);
  };

  /**
   *
   * @param {AgoraRTC} evt
   * @param {AgoraRTC.Stream} evt.stream
   */

  onLiveStreamError = (arg1, arg2) => {
    console.log(arg1, arg2, 'arg1, arg2');
  };

  onUserUnPublished = async (user) => {
    console.log('***user-unpublished');
    this.remoteHostTrack = user;
    const playerContainer = document.querySelector('#screen-share-player');
    playerContainer?.classList.remove('visible');
    setTimeout(() => {
      playerContainer?.classList.remove('hide');
      playerContainer.style.display = 'none';
    }, 750);
    this._dispatch(setPlayerVisiblity(false));
    window?.gameClient?.emitUIInteraction({
      method: 'ToggleSmartScreenView',
      payload: {
        state: false,
      },
    });
  };

  onUserLeft = async (user) => {
    await this.removeStream(user, this.uuid === user.uid);
  };

  onUserJoined = async (user) => {
    this.addStream(user);
  };

  onUserPublished = async (user, mediaType) => {
    this.remoteHostTrack = user;
    await this.client.subscribe(user, mediaType);
    window?.gameClient?.emitUIInteraction({
      method: 'ToggleSmartScreenView',
      payload: {
        state: true,
      },
    });
    const playerContainer = document.querySelector('#screen-share-player');
    const player = document.querySelector('#screen-share-player > div');
    playerContainer.style.display = 'block';
    playerContainer?.classList.add('hide');
    setTimeout(() => {
      playerContainer?.classList.add('visible');
      this._dispatch(setPlayerVisiblity(true));
    }, 900);
    if(user?.videoTrack){
      user?.videoTrack?.play(player);
    }
    if(user?.audioTrack){
      user?.audioTrack?.play(player);
    }
  };

  viewSharingContent = () => {
    if (this.remoteHostTrack && this.viewContent) {
      if (
        this.remoteHostTrack.audioTrack &&
        this.remoteHostTrack.audioTrack.hasAudio
      ) {
        this.remoteHostTrack.audioTrack.play();
      }
    }
  };

  getAgoraToken = (uid) => {
    const agoraService = new AgoraService();
    return agoraService
      .getToken({ channel_id: this.channel, user_id: uid })
      .then(({ token }) => token);
  };

  getAgoraChannelToken = (channel, uid) => {
    const agoraService = new AgoraService();
    return agoraService
      .getToken({ channel_id: channel, user_id: uid })
      .then(({ token }) => token);
  };

  setChannel = (channel) => {
    this.channel = channel;
  };

  getChannel = () => {
    return this.channel;
  };

  // Join Channel
  joinChannel = (channel) => {
    if (!channel) {
      return;
    }

    // join Agora channel
    this.audioEnabled = false;
    this.videoEnabled = false;

    this.channel = channel;

    this.channelJoining = true;

    const agoraService = new AgoraService();
    agoraService
      .getToken({ channel_id: channel, user_id: this.uuid })
      ?.then(async ({ token }) => {
        try {
          await this.client.join(appId, channel, token, this.uuid);
          this.triggerEvent('channel-joined', { channel });

          // Check if there is any channel queued to join.
          this.channelJoining = false;
          if (this.channelQueue.length) {
            await this.switchChannel(this.channelQueue.shift());
            const _this = this;
            // Hack here
            // If we switch channel immediately after it's joined,
            // We get connection issue
            setTimeout(() => {
              _this.switchChannel(_this.channelQueue.shift());
            }, 100);
          }
        } catch (error) {
          console.log(error, 'joinChannel screen @@error@@');
          this.handleError(error);
        }
      })
      ?.catch((e) => {
        console.log('--> [AGORA_CLIENT] screenshare join channel failed.', e);
      });
  };

  unpublishTracks = async (onlyAudio = false) => {
    if (this.localStream) {
      // if (this.isPresenting) {
      //   await this.client.stopLiveStreaming(RTMP_URL).then(() => {
      //     console.log('live streaming stopped');
      //     this.isPresenting = false;
      //   });
      // }
      if (this.localStream.audioTrack)
        await this.client.unpublish(this.localStream.audioTrack);
      if (this.localStream.screenTrack && !onlyAudio)
        await this.client.unpublish(this.localStream.screenTrack);
      const playerContainer = document.querySelector('#screen-share-player');
      playerContainer.style.display = 'none';
      this._dispatch(setPlayerVisiblity(false));
      this.localStream.screenTrack.stop();
      this.localStream = null;
    }
  };

  // Leave Channel
  leaveChannel = async (callback = null) => {
    if (!this.channel) {
      if (callback) {
        callback();
      }
      return;
    }
    this.stopScreen();

    this.channel = null;
    this.channelJoining = false;
    try {
      await this.unpublishTracks();
      await this.removeStream();
      await this.client.leave();
      if (callback) {
        callback();
      }
    } catch (e) {
      console.log(e, 'leaveChanel screen @@error@@');
      this.handleError(e);
    }
  };

  // Switch Channel
  switchChannel = async (channelInfo) => {
    if (!channelInfo) return;
    return new Promise((resolve) => {
      if (this.channelJoining) {
        // Added to channel queue if already started joining...
        this.channelQueue.push(channelInfo);
        return resolve();
      }

      if (this.channel !== channelInfo.channel) {
        console.log(
          '*** switching screen channel ',
          JSON.stringify(channelInfo),
          this.channelJoining
        );

        let channelInfoChannel = channelInfo.channel;

        this.leaveChannel(async () => {
          this.joinChannel(channelInfoChannel);
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  // Initialize Local Stream
  streamInit = async () => {
    const screenConfig = {
      encoderConfig: '1080p_1',
      optimizationMode: 'detail',
    };

    const audioConfig = {
      microphoneId: this.microphoneId,
      encoderConfig: 'speech_low_quality',
    };

    let audioTrack = null;
    let screenTrack = null;

    try {
      let combinedScreenTracks = await AgoraRTC.createScreenVideoTrack(screenConfig, "auto");
      if(Array.isArray(combinedScreenTracks)){
        screenTrack = combinedScreenTracks[0]
        if (
          process.env.REACT_APP_SCREENSHARE_ALLOW_AUDIO === 'true'
        ) {
          audioTrack = combinedScreenTracks[1];
        }
      }else{
        screenTrack = combinedScreenTracks
        if (
          process.env.REACT_APP_SCREENSHARE_ALLOW_AUDIO === 'true'
        ) {
          this.dispatch(setMessage({
            message: "Audio cannot be shared with this option"
          }));
        }
      }
    } catch (e) {
      console.log("ERROR STREAMS", audioTrack, screenTrack)
      console.log('SCREEN NOT PERMITTED', e);
    }

    return { audioTrack, screenTrack };
  };

  stopScreen = async (isMinimize = true) => {
    try {
      const { user, screenShare } = store.getState();

      const currentUser = user.current;
      const { streamerData } = screenShare;
      const is_presenting = currentUser.eventUserId
        ? streamerData?.presenter === currentUser.eventUserId
        : false;
      if (!is_presenting) return;

      if (this.localStream && this.localStream.screenTrack) {
        this.localStream.screenTrack.close();
      }
      const gameClient = window?.gameClient;

      if (gameClient) {
        if(isMinimize){
          gameClient.closeSmartScreen();
        }
        gameClient.setSmartScreenWaitingImage(false);
        gameClient?.startAfkWarningTimer?.({
          longTimeout:
            gameClient?.currentRoomType === 'meeting' ||
            gameClient?.followingTourGuide,
        });
      }
      await this.unpublishTracks();
      this.dispatch(screenSharingStopped());
      this.triggerEvent('screen-share-stopped');
      if (gameClient) {
        this.dispatch(setCurrentSmartScreen('Idle'));
      }
    } catch (e) {
      console.log(e, '#####');
    }
  };

  onScreenStopListener = () => {
    this.localStream.screenTrack.on('track-ended', () => {
      console.log('<<<track-ended');
      this.stopScreen();
    });
  };

  publishLocalStream = async () => {
    // create local stream;
    this.triggerEvent('screen-share-loading', true);
    this.localStream = await this.streamInit();
    if (this.localStream) {
      try {
        // Publish local stream
        if (this.localStream.audioTrack && this.is_presenter)
          await this.client.publish(this.localStream.audioTrack);
        if (this.localStream.screenTrack && this.is_presenter) {
          this.isPresenting = true;
          await this.client.publish(this.localStream.screenTrack);
          const playerContainer = document.querySelector(
            '#screen-share-player'
          );
          const player = document.querySelector('#screen-share-player > div');
          playerContainer.style.display = 'block';
          this._dispatch(setPlayerVisiblity(true));
          // Play the screen track on local container.
          this.localStream.screenTrack.play(player);
          this.triggerEvent('screen-share-started');
          this.onScreenStopListener();
        }

        this.muteAudio();
        this.audioEnabled = false;

        if (this.is_presenter) {
          this.dispatch(setAudioAllowed(true));
        }
        // Trigger events
        this.triggerEvent(
          'audio-allowed'
        );
        this.triggerEvent(this.audioEnabled ? 'audio-unmuted' : 'audio-muted');

        if (this.localStream.screenTrack && this.is_presenter) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log(error, 'error publishLocalStream');
        this.localStream = null;
        this.audioEnabled = false;
        // Trigger events
        this.triggerEvent(
          'audio-allowed'
        );
        this.triggerEvent(this.audioEnabled ? 'audio-unmuted' : 'audio-muted');
        console.log(error, 'publishLocalStream screen @@error@@');
        this.handleError(error);
        return false;
      }
    } else {
      return false;
    }
  };

  // Add stream to streamList
  addStream = (streamUser) => {
    if (!streamUser) {
      return;
    }
    this.remoteHostTrack = streamUser;
  };

  // Remove stream from streamList
  removeStream = async () => {
    if (this.remoteHostTrack) {
      if (this.remoteHostTrack.hasAudio) {
        await this.remoteHostTrack.audioTrack.stop();
      }
      if (this.remoteHostTrack.hasAudio) {
        await this.remoteHostTrack.videoTrack.stop();
      }
      this.remoteHostTrack = null;
    }
  };

  // Mute Audio
  muteAudio = async () => {
    if (this.localStream?.audioTrack) {
      console.log('^^^^^^');
      await this.localStream.audioTrack.setMuted(true);
    }
    this.dispatch(setAudioEnabled(false));
    this.audioEnabled = false;
  };

  // Unmute Audio
  unmuteAudio = async () => {
    if (!this.is_presenter) return;
    if (this.localStream?.audioTrack) {
      await this.localStream.audioTrack.setMuted(false);
    }
    console.log("SCREEN SHARE AUDIO TRACK",this.localStream, this.localStream?.audioTrack)
    this.dispatch(setAudioEnabled(true));
    this.audioEnabled = true;
  };

  // Toggle Audio
  toggleAudio = async () => {
    if (this.audioEnabled) {
      await this.muteAudio();

      window?.gameClient?.logUserAction?.({
        eventName: 'MICROPHONE_OFF',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    } else {
      await this.unmuteAudio();

      window?.gameClient?.logUserAction?.({
        eventName: 'MICROPHONE_ON',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    }
  };

  // Error Handler
  handleError = (err) => console.log(`*** AGORA ERROR: ${JSON.stringify(err)}`);

  getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
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

  off = (event, handler) => {
    this.removeEventListener(event, (e) => {
      handler?.(e?.detail);
    });
  };

  triggerEvent = (name, payload) => {
    this.dispatchEvent(new CustomEvent(name, { detail: payload }));
  };

  // Get selected microphone id
  getSelectedMicrophone = () => {
    return this.microphoneId;
  };

  // Get volume
  getVolume = () => {
    return this.volume;
  };

  isAudioAllowed = () => {
    return this.microphoneId;
  };

  /**
   * Destroy Agora Client completely
   */
  disconnect = async (callback) => {
    try {
      await this.leaveChannel();
      this.unSubscribeStreamEvents();
      if (callback) {
        callback();
      }
    } catch (e) {
      console.log('-->[AGORA_CLIENT] screenshare failed to disconnect', e);
    }
  };
}
