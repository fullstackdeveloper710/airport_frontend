import AgoraRTC from 'agora-rtc-sdk';

import { changeChannelForFollowers } from '../store/reducers/followRequestPoll';
import config from 'config';
import { AgoraService } from 'services';
import { generateUuid } from './common';

const appId = config.agora.appId;

export default class AgoraClient extends EventTarget {
  constructor(userId, options) {
    super();

    this.localStream = null;
    /**
     *
     * @type {AgoraRTC.Stream[]}s
     */
    this.streamList = [];
    this.audioEnabled = false;
    this.videoEnabled = false;
    this.useAudio = false;
    this.useVideo = false;
    this.microphoneId = null;
    this.micDetectionInterval = null;
    this.cameraId = null;
    this.eventHandlers = {};
    this.meetingDOMId = `meeting-${generateUuid()}`;
    this.videoMuted = {};
    this.audioMuted = {};
    this.channel = null;
    this.meetingWindowActive = false;
    this.volumeIndicatorInterval = false;
    this.uuid = userId;
    this.channelQueue = [];
    this.channelJoining = false;
    this.volume = 100;
    this.playerName = '';
    this.speakerOff = false;
    this.loggedIn = false;
    this.speakersList = [];
    this._dispatch = options.config.redux.dispatch;
    this.clientType = options.clientType;

    // create meeting window
    this.createMeetingWindow();
    this.hideMeetingWindow();

    //**** init AgoraRTC client

    /**
     * Agora RTC Client Instance
     * @type {AgoraRTC.Client}
     */
    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });

    AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.WARNING);
    this.client.enableAudioVolumeIndicator();
    this.client.init(
      appId,
      () => {
        this.subscribeStreamEvents();
      },
      this.handleError
    );
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
    this.client.on('stream-added', this.onStreamAdded);
    this.client.on('stream-removed', this.onStreamRemoved);
    this.client.on('stream-subscribed', this.onStreamSubscribed);
    this.client.on('stream-published', this.onStreamPublished);
    this.client.on('stream-unpublished', this.onStreamUnpublished);
    this.client.on('mute-audio', this.onAudioMuted);
    this.client.on('unmute-audio', this.onAudioUnmuted);
    this.client.on('mute-video', this.onVideoMuted);
    this.client.on('unmute-video', this.onVideoUnmuted);
    this.client.on('volume-indicator', this.onVolumeIndicator);
    // this.client.on('peer-online', this.onPeerOnline);
    this.client.on('peer-leave', this.onPeerLeave);
  };

  /**
   *
   * @param {AgoraRTC} evt
   * @param {AgoraRTC.Stream} evt.stream
   */
  onStreamAdded = (evt) => {
    this.client.subscribe(evt.stream, this.handleError);
  };

  onStreamRemoved = (evt) => {
    this.removeStream(evt.stream.getId());
  };

  onStreamSubscribed = (evt) => {
    this.addStream(evt.stream);
  };

  onPeerOnline = (evt) => {
    this.createEmptyStreamWindow(evt.uid, false);
  };

  onPeerLeave = (evt) => {
    this.removeStream(evt.uid);
  };

  onStreamUnpublished = () => {
    this.clearPlayerWindow(this.localStream.getId());
    this.removeStream(this.localStream.getId(), false);

    this.publishLocalStream();
  };

  onStreamPublished = () => {
    this.triggerEvent('stream-published');
  };

  onAudioMuted = (evt) => {
    this.muteAudioPlayerWindow(evt.uid);
    this.triggerEvent('remote-audio-muted', { uid: evt.uid });
  };

  onAudioUnmuted = (evt) => {
    this.unmuteAudioPlayerWindow(evt.uid);
    this.triggerEvent('remote-audio-unmuted', { uid: evt.uid });
  };

  onVideoMuted = (evt) => {
    this.muteVideoPlayerWindow(evt.uid);
    this.triggerEvent('remote-video-muted', { uid: evt.uid });
  };

  onVideoUnmuted = (evt) => {
    this.unmuteVideoPlayerWindow(evt.uid);
    this.triggerEvent('remote-video-unmuted', { uid: evt.uid });
  };

  onVolumeIndicator = (evt) => {
    const _this = this;
    evt.attr.forEach((volume) => {
      if (volume.level > 5) {
        _this.showSpeakingPlayerWindow(volume.uid);
      } else {
        _this.hideSpeakingPlayerWindow(volume.uid);
      }
    });
  };

  setVolumeIndicatorInterval = () => {
    const _this = this;
    this.volumeIndicatorInterval = setInterval(() => {
      if (_this.localStream) {
        const audioLevel = _this.localStream.getAudioLevel();
        if (audioLevel > 0.05) {
          _this.showSpeakingPlayerWindow(this.uuid);
        } else {
          _this.hideSpeakingPlayerWindow(this.uuid);
        }
        this.triggerEvent('volume-indicator', { level: audioLevel });
      }
    }, 2000);
  };

  // Join Channel
  joinChannel = (channel, attendeeMode, audio, video) => {
    if (!channel) {
      return;
    }

    // join Agora channel
    this.audioEnabled = false;
    this.videoEnabled = false;
    this.attendeeMode = attendeeMode;
    this.channel = channel;
    this.useAudio = audio;
    this.useVideo = video;

    this.channelJoining = true;

    this.triggerEvent('channel-joining', { channel });
    if (video) {
      this.showMeetingWindow();
      this.showLoadingWindow();
    }

    const agoraService = new AgoraService();
    agoraService.getToken({ channel, user_id: this.uuid }).then(({ token }) => {
      this.client.join(
        token,
        channel,
        this.uuid,
        async () => {
          this.triggerEvent('channel-joined', { channel });

          this.audioMuted = {};
          this.videoMuted = {};

          this.hideLoadingWindow();
          if (this.attendeeMode === 'presenter') {
            this.publishLocalStream();
            this.volumeIndicatorInterval = this.setVolumeIndicatorInterval();
          }
          // Trigger events
          this.triggerEvent(
            this.isAudioAllowed() ? 'audio-allowed' : 'audio-disallowed'
          );
          this.triggerEvent(
            this.isVideoAllowed() ? 'video-allowed' : 'video-disallowed'
          );
          this.triggerEvent('audio-muted');
          this.triggerEvent('video-muted');

          if (window.followRequestActive) {
            if (window.followRequestAudio) {
              if (window.agoraClientPrimary) {
                window.agoraClientPrimary.unmuteAudio();
              }
            } else {
              if (window.agoraClientPrimary) {
                window.agoraClientPrimary.muteAudio();
              }
            }
          }

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
        },
        this.handleError
      );
    });
  };

  // Leave Channel
  leaveChannel = async (callback = null) => {
    this.hideMeetingWindow();
    this.removeClassMeetingWindow('presenter');
    this.moveMeetingWindow(document.body);

    if (!this.channel) {
      if (callback) {
        callback();
      }
      return;
    }

    this.channel = null;
    this.channelJoining = false;
    try {
      if (this.volumeIndicatorInterval) {
        clearInterval(this.volumeIndicatorInterval);
        this.volumeIndicatorInterval = null;
      }
      if (this.localStream) {
        this.client.unpublish(this.localStream, this.handleError);
        this.localStream = null;
      }
      this.clearStreamWindow();
      this.removeAllStreams();
      this.client.leave(() => {
        if (callback) {
          callback();
        }
      });
    } catch (e) {
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

      if (
        this.channel !== channelInfo.channel ||
        this.attendeeMode !== channelInfo.attendeeMode ||
        this.useAudio !== channelInfo.audio ||
        this.useVideo !== channelInfo.video
      ) {
        console.log(
          '*** switching channel ',
          JSON.stringify(channelInfo),
          this.channelJoining,
          this.clientType
        );

        let channelInfoChannel = channelInfo.channel;

        if (
          this.clientType === 'primary' &&
          window.followRequestActive &&
          window.is_presenter
        ) {
          if (channelInfoChannel.includes('meetingroom')) {
            channelInfoChannel = channelInfoChannel.split('@')[0];
          }
          this.dispatch(changeChannelForFollowers(channelInfo.channel, true));
        }

        this.leaveChannel(async () => {
          if (channelInfo.presenterVideo) {
            if (!channelInfo.useRightPanel) {
              this.moveMeetingWindow(document.body);
            } else {
              this.addClassMeetingWindow('right-panel presenter');
            }
            if (channelInfo.isMeetingRoom) {
              this.addClassMeetingWindow('meeting-room');
            }
            if (channelInfo.noBackground) {
              this.addClassMeetingWindow('no-background');
            }
          } else {
            this.moveMeetingWindow(document.body);
            this.removeClassMeetingWindow('presenter');
            this.removeClassMeetingWindow('right-panel');
            this.removeClassMeetingWindow('meeting-room');
          }

          this.joinChannel(
            channelInfoChannel,
            channelInfo.attendeeMode,
            channelInfo.audio,
            channelInfo.video
          );
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  // Initialize Local Stream
  streamInit = () => {
    return AgoraRTC.createStream({
      streamID: this.uuid,
      audio: this.isAudioAllowed() ? true : false,
      microphoneId: this.microphoneId,
      video: this.isVideoAllowed() ? true : false,
      cameraId: this.cameraId,
      videoSource: undefined,
      screen: false,
      mirror: false,
    });
  };

  publishLocalStream = () => {
    // create local stream
    this.localStream = this.streamInit();

    if (this.localStream) {
      this.localStream.setVideoProfile('240p_1');
      this.localStream.setAudioProfile('speech_low_quality');

      this.localStream.init(
        () => {
          // Add local stream
          this.addStream(this.localStream);

          if (!this.audioEnabled) {
            this.muteAudio();
          }
          if (!this.videoEnabled) {
            this.muteVideo();
          }

          // Publish local stream
          try {
            this.client.publish(this.localStream, this.handleError);
          } catch (err) {
            this.handleError(err);
          }

          // Trigger events
          this.triggerEvent(
            this.isAudioAllowed() ? 'audio-allowed' : 'audio-disallowed'
          );
          this.triggerEvent(
            this.isVideoAllowed() ? 'video-allowed' : 'video-disallowed'
          );
          this.triggerEvent(
            this.audioEnabled ? 'audio-unmuted' : 'audio-muted'
          );
          this.triggerEvent(
            this.videoEnabled ? 'video-unmuted' : 'video-muted'
          );
        },
        (err) => {
          this.localStream = null;
          this.audioEnabled = false;
          this.videoEnabled = false;
          if (this.useVideo) {
            this.createEmptyStreamWindow(this.uuid, true);
          }
          // Trigger events
          this.triggerEvent(
            this.isAudioAllowed() ? 'audio-allowed' : 'audio-disallowed'
          );
          this.triggerEvent(
            this.isVideoAllowed() ? 'video-allowed' : 'video-disallowed'
          );
          this.triggerEvent(
            this.audioEnabled ? 'audio-unmuted' : 'audio-muted'
          );
          this.triggerEvent(
            this.videoEnabled ? 'video-unmuted' : 'video-muted'
          );
          this.handleError(err);
        }
      );
    }
  };

  // Add stream to streamList
  addStream = (stream) => {
    if (!stream) {
      return;
    }
    const id = stream.getId();
    const repetition = this.streamList.some((item) => {
      return item.getId() === id;
    });

    if (!repetition) {
      this.streamList.push(stream);

      // if (stream.hasVideo() && !this.meetingWindowActive) {
      //   this.showMeetingWindow();
      // }

      // add player window
      if (this.getPlayerWindow(id)) {
        this.clearPlayerWindow(id);
      } else {
        this.createPlayerWindow(
          id,
          this.localStream && this.localStream.getId() === id
        );
      }

      if (this.getPlayerWindow(id)) {
        stream.play(`agora-player-${id}`, { fit: 'cover' }, this.handleError);
      }

      if (this.localStream && this.localStream.getId() === id) {
        this.showPlayerName(id, this.playerName);
      }

      // Check mute status on the fly
      if (this.videoMuted[id]) {
        this.muteVideoPlayerWindow(id);
        this.triggerEvent('remote-video-muted', { uid: id });
      } else {
        this.unmuteVideoPlayerWindow(id);
        this.triggerEvent('remote-video-unmuted', { uid: id });
      }

      if (this.audioMuted[id]) {
        this.muteAudioPlayerWindow(id);
        this.triggerEvent('remote-audio-muted', { uid: id });
      } else {
        this.unmuteAudioPlayerWindow(id);
        this.triggerEvent('remote-audio-unmuted', { uid: id });
      }
    }
  };

  // Remove stream from streamList
  removeStream = (uid, destroyWindow = true) => {
    this.streamList = this.streamList.reduce((newList, item) => {
      if (item.getId() === uid) {
        item.close();

        // destroy player window
        if (destroyWindow) {
          this.destroyPlayerWindow(uid);
        }
        return newList;
      }
      return [...newList, item];
    }, []);
  };

  // Remove all streams
  removeAllStreams = () => {
    this.streamList
      .map((item) => item.getId())
      .forEach((id) => this.removeStream(id));
  };

  // Mute Audio
  muteAudio = () => {
    if (this.attendeeMode !== 'presenter') {
      return;
    }

    if (this.localStream) {
      this.localStream.muteAudio();
      this.muteAudioPlayerWindow(this.localStream.getId());
    }
    this.audioEnabled = false;
    this.triggerEvent('audio-muted');
  };

  // Unmute Audio
  unmuteAudio = () => {
    if (this.attendeeMode !== 'presenter') {
      return;
    }

    if (this.localStream) {
      this.localStream.unmuteAudio();
      this.unmuteAudioPlayerWindow(this.localStream.getId());
    }

    this.audioEnabled = true;
    this.triggerEvent('audio-unmuted');
  };

  // Toggle Audio
  toggleAudio = () => {
    if (this.audioEnabled) {
      this.muteAudio();
    } else {
      this.unmuteAudio();
    }
  };

  // Mute Video
  muteVideo = () => {
    if (this.attendeeMode !== 'presenter') {
      return;
    }

    if (this.localStream) {
      this.localStream.muteVideo();
      this.muteVideoPlayerWindow(this.localStream.getId());
    }
    this.videoEnabled = false;

    this.triggerEvent('video-muted');
  };

  // Unmute Video
  unmuteVideo = () => {
    if (this.attendeeMode !== 'presenter') {
      return;
    }

    if (this.localStream) {
      this.localStream.unmuteVideo();
      this.unmuteVideoPlayerWindow(this.localStream.getId());
    }
    this.videoEnabled = true;

    this.triggerEvent('video-unmuted');
  };

  // Toggle Video
  toggleVideo = () => {
    if (this.videoEnabled) {
      this.muteVideo();
    } else {
      this.unmuteVideo();
    }
  };

  // Switch Device
  switchDevice = (microphoneId, cameraId) => {
    if (
      this.cameraId === cameraId &&
      this.microphoneId === microphoneId
    ) {
      return;
    }

    this.microphoneId = microphoneId;
    this.cameraId = cameraId;

    if (this.localStream) {
      this.client.unpublish(this.localStream, this.handleError);
    } else {
      this.publishLocalStream();
    }
  };

  // Set Volume
  setVolume = (volume) => {
    this.volume = volume;

    this.streamList.forEach((item) => {
      item.setAudioVolume(Math.min(100, Math.max(0, volume)));
    });
  };

  // Set Player Volume based on Distance
  setPlayerVolumeWithDistance = ({ eventUserId, distance }) => {
    const playerStream = this.streamList.find(
      (stream) => stream.getId() === eventUserId
    );
    if (playerStream) {
      if (window.followRequestActive) {
        playerStream.setAudioVolume(100);
        return;
      }
      playerStream.setAudioVolume(
        Math.min(100, Math.max(0, Math.round(this.volume * distance)))
      );
    }
  };

  /**
   *
   * @param eventUserId
   * @return {AgoraRTC.Stream | undefined}
   */
  findPlayerStreamById = (eventUserId) => {
    return this.streamList.find((stream) => stream.getId() === eventUserId);
  };

  // Error Handler
  handleError = (err) => console.log(`*** AGORA ERROR: ${JSON.stringify(err)}`);

  /*******************************
   * Agora Player DOM Management *
   *******************************/

  // Create whole meeting Window
  createMeetingWindow = () => {
    const element = document.createElement('div');
    element.setAttribute('id', this.meetingDOMId);
    element.setAttribute('class', 'meeting');
    document.body.append(element);

    const loadingWrapper = document.createElement('div');
    loadingWrapper.setAttribute('id', `${this.meetingDOMId}-loading`);
    loadingWrapper.setAttribute('class', 'loading');
    element.append(loadingWrapper);
    loadingWrapper.append(document.createElement('div'));
    loadingWrapper.append(document.createTextNode('Joining channel...'));

    const streamList = document.createElement('div');
    streamList.setAttribute('id', `${this.meetingDOMId}-stream-list`);
    streamList.setAttribute('class', 'stream-list');
    element.append(streamList);
  };

  // Get whole meeting window
  getMeetingWindow = () => {
    return document.getElementById(this.meetingDOMId);
  };

  // Destroy meeting window
  destroyMeetingWindow = () => {
    if (this.getMeetingWindow()) {
      this.getMeetingWindow().remove();
    }
  };

  // Create empty window for non-camera users
  createEmptyStreamWindow = (id, isLocal) => {
    if (this.getPlayerWindow(id)) {
      this.clearPlayerWindow(id);
    } else {
      this.createPlayerWindow(id, isLocal);
    }
    this.muteVideoPlayerWindow(id);
    this.muteAudioPlayerWindow(id);
  };

  // Get loading window
  getLoadingWindow = () => {
    return document.getElementById(`${this.meetingDOMId}-loading`);
  };

  // Get Stream List Window
  getStreamListWindow = () => {
    return document.getElementById(`${this.meetingDOMId}-stream-list`);
  };

  // Clear Stream List Window
  clearStreamWindow = () => {
    const streamListWindow = this.getStreamListWindow();
    streamListWindow.innerHTML = '';
  };

  // Add class to meeting window
  addClassMeetingWindow = (className) => {
    const meetingWindow = this.getMeetingWindow();
    if (meetingWindow) {
      meetingWindow.setAttribute(
        'class',
        `${meetingWindow.getAttribute('class')} ${className}`
      );
    }
  };

  // Remove class from meeting window
  removeClassMeetingWindow = (className) => {
    const meetingWindow = this.getMeetingWindow();
    if (meetingWindow) {
      meetingWindow.setAttribute(
        'class',
        meetingWindow.getAttribute('class').replace(className, '').trim()
      );
    }
  };

  // Show meeting window
  showMeetingWindow = () => {
    this.addClassMeetingWindow('active');
    this.meetingWindowActive = true;

    this.triggerEvent('meeting-window-created');
  };

  // Hide meeting window
  hideMeetingWindow = () => {
    this.removeClassMeetingWindow('active');
    this.meetingWindowActive = false;
    this.triggerEvent('meeting-window-removed');
  };

  // Move the meeting window
  moveMeetingWindow = (targetElement) => {
    if (!targetElement) {
      return;
    }
    const fragment = document.createDocumentFragment();
    if (this.getMeetingWindow()) {
      fragment.appendChild(this.getMeetingWindow());
      targetElement.appendChild(fragment);
    }
  };

  showLoadingWindow = () => {
    this.getLoadingWindow().setAttribute('class', 'loading active');
  };

  hideLoadingWindow = () => {
    this.getLoadingWindow().setAttribute('class', 'loading');
  };

  // Create player window
  createPlayerWindow = (id, isLocalStream) => {
    const element = document.createElement('div');
    element.setAttribute('id', `agora-player-${id}`);
    element.setAttribute(
      'class',
      `player ${isLocalStream ? 'local' : 'remote'}`
    );

    const parentElement = this.getStreamListWindow();
    if (parentElement) {
      if (isLocalStream) {
        parentElement.prepend(element);
      } else {
        parentElement.append(element);
      }
    }

    this.triggerEvent('player-window-created', { playerId: id });
  };

  // Get player window
  getPlayerWindow = (id) => {
    return document.getElementById(`agora-player-${id}`);
  };

  // Clear player's video
  clearPlayerWindow = (id) => {
    if (this.getPlayerWindow(id)) {
      this.getPlayerWindow(id).innerHTML = '';
    }
  };

  // Mute Audio Player Window
  muteAudioPlayerWindow = (id) => {
    this.audioMuted[id] = true;

    const playerWindow = this.getPlayerWindow(id);
    if (playerWindow && !playerWindow.querySelector('.mute')) {
      const muteWrapper = document.createElement('div');
      muteWrapper.setAttribute('class', 'mute');
      playerWindow.append(muteWrapper);

      const muteIcon = document.createElement('i');
      muteIcon.setAttribute('class', 'ms-Icon ms-Icon--MicOff');
      muteWrapper.append(muteIcon);
    }

    this.hideSpeakingPlayerWindow(id);
  };

  // Unmute Audio Player Window
  unmuteAudioPlayerWindow = (id) => {
    this.audioMuted[id] = false;

    const playerWindow = this.getPlayerWindow(id);
    if (playerWindow) {
      const muteWrapper = playerWindow.querySelector('.mute');
      if (muteWrapper) {
        muteWrapper.remove();
      }
    }
  };

  // Mute Video Player Window
  muteVideoPlayerWindow = (id) => {
    this.videoMuted[id] = true;

    const playerWindow = this.getPlayerWindow(id);
    if (playerWindow && !playerWindow.querySelector('.avatar')) {
      const avatarWrapper = document.createElement('div');
      avatarWrapper.setAttribute('class', 'avatar');
      playerWindow.append(avatarWrapper);

      const avatarIcon = document.createElement('i');
      avatarIcon.setAttribute('class', 'ms-Icon ms-Icon--Contact');
      avatarWrapper.append(avatarIcon);
    }
  };

  // Unmute Video Player Window
  unmuteVideoPlayerWindow = (id) => {
    this.videoMuted[id] = false;

    const playerWindow = this.getPlayerWindow(id);
    if (playerWindow) {
      const avatarWrapper = playerWindow.querySelector('.avatar');
      if (avatarWrapper) {
        avatarWrapper.remove();
      }
    }
  };

  getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  };

  // Show Speaking Player Window
  showSpeakingPlayerWindow = (id) => {
    if (this.audioMuted[id]) {
      return;
    }
    // Allow first 4 users to meeting room

    let speakerListLength = this.speakersList.length;
    speakerListLength += speakerListLength + 1;
    this.speakersList.push({ id: id, order: speakerListLength });
    const getUnique = [
      ...new Map(this.speakersList.map((item) => [item['id'], item])).values(),
    ];
    let sortSpeakersList = getUnique.sort((a, b) => a.order - b.order);
    this.speakersList = sortSpeakersList;

    this.speakersList = this.speakersList.sort((a, b) => b.order - a.order);

    const playerWindow = this.getPlayerWindow(id);

    if (playerWindow) {
      let speakingWrapper = playerWindow.querySelector('.speaking');
      if (!speakingWrapper) {
        speakingWrapper = document.createElement('div');

        speakingWrapper.setAttribute('class', ` speaking`);

        playerWindow.append(speakingWrapper);

        const micIcon = document.createElement('i');
        micIcon.setAttribute('class', 'ms-Icon ms-Icon--Volume3');
        speakingWrapper.append(micIcon);
      }

      let backgroundOverlay = playerWindow.querySelector('.overlay');
      if (!backgroundOverlay) {
        backgroundOverlay = document.createElement('div');
        backgroundOverlay.setAttribute('class', 'overlay');
        playerWindow.append(backgroundOverlay);
      }

      if (playerWindow.getAttribute('class').indexOf('speaking') === -1) {
        playerWindow.setAttribute(
          'class',
          playerWindow.getAttribute('class') + ` speaking`
        );
      }
    }

    // this.rearrangePlayerWindows();
  };

  /**
   * Hide Speaking Player Window
   */
  hideSpeakingPlayerWindow = (id) => {
    const playerWindow = this.getPlayerWindow(id);
    if (playerWindow) {
      const speakingWrapper = playerWindow.querySelector('.speaking');
      if (speakingWrapper) {
        speakingWrapper.remove();
      }
      const backgroundOverlay = playerWindow.querySelector('.overlay');
      if (backgroundOverlay) {
        backgroundOverlay.remove();
      }
      playerWindow.setAttribute(
        'class',
        playerWindow.getAttribute('class').replace('speaking', '').trim()
      );
    }
    // this.rearrangePlayerWindows();
  };

  // Show Player Name
  showPlayerName = (id, name) => {
    if (this.localStream && this.localStream.getId() === id) {
      this.playerName = name;
    }
    const playerWindow = this.getPlayerWindow(id);
    if (playerWindow) {
      if (playerWindow.querySelector('.player-name')) {
        // Update player name
        playerWindow.querySelector('.player-name').innerHTML = name;  
      } else {
        // Add player name window
        const nameDiv = document.createElement('div');
        nameDiv.setAttribute('class', 'player-name');
        nameDiv.innerHTML = name;
        playerWindow.append(nameDiv);
      }
    }
  };

  // Destroy player window
  destroyPlayerWindow = (id) => {
    if (this.getPlayerWindow(id)) {
      this.getPlayerWindow(id).remove();
    }
  };

  // Re-arrange the player windows to move active speaker to the center
  rearrangePlayerWindows = () => {
    if (this.getStreamListWindow()) {
      const playerCount = this.getStreamListWindow().childElementCount;

      let centerOrder = Math.ceil(playerCount / 2);

      let currentOrder = 1;

      let centerApplied = false;

      let hasSpeakingWindow =
        !!this.getStreamListWindow().querySelector('.speaking');

      for (let childElement of this.getStreamListWindow().childNodes) {
        if (
          childElement
            .getAttribute('class')
            .indexOf(hasSpeakingWindow ? 'speaking' : 'local') !== -1 &&
          !centerApplied
        ) {
          childElement.setAttribute('style', `order: ${centerOrder}`);
          if (childElement.getAttribute('class').indexOf('center') === -1) {
            childElement.setAttribute(
              'class',
              childElement.getAttribute('class') + ' center'
            );
          }
          centerApplied = true;
        } else {
          childElement.setAttribute('style', `order: ${currentOrder}`);
          childElement.setAttribute(
            'class',
            childElement.getAttribute('class').replace('center', '').trim()
          );
          currentOrder += 1;
          if (currentOrder === centerOrder) {
            currentOrder += 1;
          }
        }
      }
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

  /********************
   * Status Interface *
   ********************/
  hasStreamsPlaying = () => {
    for (const stream of this.streamList) {
      if (stream.hasVideo()) {
        return true;
      }
    }
    return false;
  };

  // Get selected microphone id
  getSelectedMicrophone = () => {
    return this.microphoneId;
  };

  // Get selected camera id
  getSelectedCamera = () => {
    return this.cameraId;
  };

  // Get volume
  getVolume = () => {
    return this.volume;
  };

  isAudioAllowed = () => {
    return this.useAudio && this.microphoneId;
  };

  isVideoAllowed = () => {
    return this.useVideo && this.cameraId;
  };

  /**
   * Destroy Agora Client completely
   */
  disconnect = (callback) => {
    this.leaveChannel(() => {
      this.destroyMeetingWindow();
      if (callback) {
        callback();
      }
    });
  };
}
