import AgoraRTC from 'agora-rtc-sdk-ng';
import i18next from 'i18next';
import { getUsersList } from 'store/reducers/usersList';
import { changeChannelForFollowers } from 'store/reducers/followRequestPoll';
import { setLoader } from 'store/reducers/game';
import { AgoraService } from 'services';
import { CHANNEL_PERMISSIONS } from 'constants/web';
import store from 'store';
import {
  setCameraID,
  setChangingDevice,
  setMicroPhoneID,
  setLoading,
  setPermissionModal,
  setSaveDeviceModal,
} from 'store/reducers/agora';
import { generateUuid, getLocalStream } from './common';
import config from '../config';
import { setMessage } from 'store/reducers/message';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
} from 'utils/eventVariables';

const appId = config.agora.appId;

export default class AgoraClient extends EventTarget {
  constructor(userId, options) {
    super();

    this.localStream = null;
    /**
     *
     * @type {AgoraRTC.Stream[]}
     */
    this.userList = [];
    this.audioEnabled = false;
    this.videoEnabled = false;
    this.useAudio = false;
    this.useVideo = false;
    this.microphoneId = null;
    this.micDetectionInterval = null;
    this.cameraId = null;
    this.cameraDeviceInfo = null;
    this.microphoneDeviceInfo = null;
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
    // the three up next is to handle zone-joined and room-joined when happened at the same time
    this.zoneChannelJoining = false;
    this.zoneEnteredTimestamp = 0;
    this.zoneEnterSafeTimeInterval = 10 * 1000; // 10 seconds
    this.channelLeaving = false;
    this.volume = 100;
    this.playerName = '';
    this.speakerOff = false;
    this.loggedIn = false;
    this.speakersList = [];
    this._dispatch = options.config.redux.dispatch;
    this.clientType = options.clientType;
    this.disconnected = false;
    this.disconnecting = false;
    this.currentChannel = null;
    this.presenterVideo = false;
    this.is_primary = options.clientType === 'primary';
    this.microphoneTimeout = null;
    this.cameraTimeout = null;
    this.meetingWindowCreated = false;
    // create meeting window
    // this.createMeetingWindow();
    this.hideMeetingWindow();

    if (this.is_primary) {
      this.hotPlugginListener();
    }

    //**** init AgoraRTC client

    /**
     * Agora RTC Client Instance
     * @type {AgoraRTC.Client}
     */

    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
    const logLevel = 0; // DEBUG for dev
    AgoraRTC.setLogLevel(logLevel);
    this.client.setClientRole('host');
    this.client.enableAudioVolumeIndicator();
    this.subscribeStreamEvents();

    this.agoraService = new AgoraService();

    if (this.is_primary) {
      window.onbeforeunload = this.onUnload;
    }
  }

  onUnload = async () => {
    return undefined;
  };

  /********************
   *Redux Dispatch
   *******************/
  dispatch = (selector) => {
    this._dispatch(selector);
  };

  changingMicroPhone = async (deviceID) => {
    try {
      const _deviceID = deviceID === 'null' ? undefined : deviceID;
      this.microphoneId = deviceID === 'null' ? null : deviceID;

      if (this.localStream?.audioTrack) {
        await this.localStream.audioTrack.stop();
      }
      if (this.localStream?.audioTrack) {
        await this.client.unpublish(this.localStream.audioTrack);
      }
      this.localStream.audioTrack = await this.createAudioTrack();
      if (this.localStream.audioTrack && !this.disconnecting) {
        await this.client.publish(this.localStream.audioTrack);
      }
      this.saveAudioConfig();
      this.dispatch(setMicroPhoneID(_deviceID));
      if (window.agoraScreenShare) {
        window.agoraScreenShare.switchDevice(
          _deviceID,
          this.microphoneDeviceInfo?.label || 'null'
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  microphoneHotplugged = (deviceID) => {
    if (this.microphoneTimeout) clearTimeout(this.microphoneTimeout);

    this.microphoneTimeout = setTimeout(() => {
      this.changingMicroPhone(deviceID);
    }, 1500);
  };

  changingCamera = async (deviceID) => {
    try {
      const _deviceID = deviceID === 'null' ? undefined : deviceID;
      let cameraID = _deviceID;
      this.cameraId = deviceID === 'null' ? null : deviceID;
      if (this.localStream?.videoTrack) {
        await this.localStream.videoTrack.stop();
      }
      if (this.localStream?.videoTrack) {
        await this.client.unpublish(this.localStream.videoTrack);
      }
      this.localStream.videoTrack = await this.createVideoTrack();
      if (this.localStream.videoTrack && !this.disconnecting) {
        await this.client.publish(this.localStream.videoTrack);
        if (this.attendeeMode === 'presenter') {
          if (!store.getState().game.zoneJoined) {
            if (this.getPlayerWindow(this.uuid)) {
              this.clearPlayerWindow(this.uuid);
            } else {
              this.createPlayerWindow(this.uuid, true);
            }
          }
          if (this.getPlayerWindow(this.uuid) && this.localStream.videoTrack) {
            this.localStream.videoTrack.play(
              `agora-player_${this.uuid}_${this.clientType}`,
              {
                fit: 'cover',
              }
            );
          }
        }
      }
      this.saveVideoConfig();
      this.dispatch(setCameraID(cameraID));
    } catch (error) {
      console.log(error);
    }
  };

  camerHotPlugged = (deviceID) => {
    if (this.cameraTimeout) clearTimeout(this.cameraTimeout);

    this.cameraTimeout = setTimeout(() => {
      this.changingCamera(deviceID);
    }, 1000);
  };

  stopPlugginListener = () => {
    AgoraRTC.onMicrophoneChanged = () => {};
    AgoraRTC.onCameraChanged = () => {};
  };

  hotPlugginListener = () => {
    AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === 'ACTIVE') {
        this.dispatch(
          setChangingDevice({
            label: changedDevice.device.label,
            id: changedDevice.device.deviceId,
          })
        );
        this.microphoneHotplugged(changedDevice.device.deviceId);
        this.microphoneDeviceInfo = changedDevice.device;
      } else {
        let oldMicrophones = await AgoraRTC.getMicrophones();
        oldMicrophones = oldMicrophones.filter(
          (device) =>
            ['default', 'communications'].indexOf(device.deviceId) === -1
        );
        if (oldMicrophones[0]) {
          this.dispatch(
            setChangingDevice({
              label: oldMicrophones[0].label,
              id: oldMicrophones[0].deviceId,
            })
          );
          this.microphoneHotplugged(oldMicrophones[0].deviceId);
          this.microphoneDeviceInfo = oldMicrophones[0];
        } else {
          this.microphoneHotplugged('null');
          this.microphoneDeviceInfo = null;
        }
      }
    };
    AgoraRTC.onCameraChanged = async (changedDevice) => {
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === 'ACTIVE') {
        this.dispatch(
          setChangingDevice({
            label: changedDevice.device.label,
            id: changedDevice.device.deviceId,
          })
        );
        this.camerHotPlugged(changedDevice.device.deviceId);
        this.cameraDeviceInfo = changedDevice.device;
      } else {
        let oldCameras = await AgoraRTC.getCameras();
        oldCameras = oldCameras.filter(
          (device) =>
            ['default', 'communications'].indexOf(device.deviceId) === -1
        );
        if (oldCameras[0]) {
          this.dispatch(
            setChangingDevice({
              label: oldCameras[0].label,
              id: oldCameras[0].deviceId,
            })
          );
          this.camerHotPlugged(oldCameras[0].deviceId);
          this.cameraDeviceInfo = oldCameras[0];
        } else {
          this.camerHotPlugged('null');
          this.cameraDeviceInfo = null;
        }
      }
    };
  };

  /********************
   * Agora Management *
   ********************/

  // Agora Event Handlers
  subscribeStreamEvents = async () => {
    this.client.on('volume-indicator', this.onVolumeIndicator);
    // this.client.on('user-info-updated', this.onUserDeviceInteraction);
    this.client.on('user-published', this.onUserPublished);
    this.client.on('user-unpublished', this.onUserUnPublished);
    this.client.on('user-joined', this.onUserJoined);
    this.client.on('user-left', this.onUserLeft);
    this.client.on('connection-state-change', this.onUserStateChanged);
    this.client.on('exception', this.onAgoraError);
  };

  unSubscribeStreamEvents = async () => {
    this.client.off('volume-indicator', this.onVolumeIndicator);
    // this.client.off('user-info-updated', this.onUserDeviceInteraction);
    this.client.off('user-published', this.onUserPublished);
    this.client.off('user-unpublished', this.onUserUnPublished);
    this.client.off('user-joined', this.onUserJoined);
    this.client.off('user-left', this.onUserLeft);
    this.client.off('connection-state-change', this.onUserStateChanged);
    this.client.off('exception', this.onAgoraError);
  };

  /**
   *
   * @param {AgoraRTC} evt
   * @param {AgoraRTC.Stream} evt.stream
   */

  onAgoraError = (exception) => {
    console.log('AGORA EXCEPTION', exception);
    this.switchChannel(this.channelInformation);
  };

  onUserStateChanged = async (curState, prevState) => {
    this.disconnecting = curState === 'DISCONNECTING';
    if (curState === 'DISCONNECTED' && prevState === 'CONNECTING') {
      console.log('Retrying WS_ABORT REJOINING');
      this.switchChannel(this.channelInformation);
    }
    if (curState === 'DISCONNECTED') {
      this.disconnected = true;
    }
    if (curState === 'CONNECTED') {
      this.disconnected = false;
    }
  };

  onUserDeviceInteraction = (uid, msg) => {
    console.log('***user-msg', msg);
    if (msg === 'mute-audio') {
      this.onAudioMuted(uid);
    }
    if (msg === 'unmute-audio') {
      this.onAudioUnmuted(uid);
    }
    if (msg === 'mute-video') {
      this.onVideoMuted(uid);
    }
    if (msg === 'unmute-video') {
      this.onVideoUnmuted(uid);
    }
  };

  onUserUnPublished = async (user, mediaType) => {
    const userList = this.userList.map((u) => {
      return u.uid === user.uid ? user : u;
    });
    this.userList = userList;
    if (mediaType === 'audio') {
      this.onAudioMuted(user.uid);
    }
    if (mediaType === 'video') {
      this.onVideoMuted(user.uid);
    }
  };

  onUserLeft = async (user) => {
    console.log('*** user left');
    this.removeStream(user.uid);
  };

  onUserJoined = (user) => {
    this.addStream(user);
  };

  getCurrentModeAudioStatus = () => {
    let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS);

    if (savedConfig) {
      savedConfig = JSON.parse(savedConfig);
      return !savedConfig[this.channelInformation.channel]?.audioMuted;
    }
    return null;
  };

  getCurrentModeVideoStatus = () => {
    let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS);

    if (savedConfig) {
      savedConfig = JSON.parse(savedConfig);
      return !savedConfig[this.channelInformation.channel]?.videoMuted;
    }
    return null;
  };

  createVideoFeed(response) {
    const { game, usersList } = store.getState();
    if (game.zoneJoined) {
      if (response.length > 0) {
        const meetingWindow = this.getStreamListWindow();

        if (meetingWindow) {
          let children = meetingWindow.childNodes;
          children.forEach((element) => {
            const uid = element.id.split('_')[1];
            if (!response.some((v) => v === uid)) {
              this.destroyPlayerWindow(uid);
            }
          });
        }
        response?.forEach((uid) => {
          const getRemoteList = usersList.list.find(
            (getList) => getList.eventUserId === uid
          );

          if (getRemoteList) {
            const getRoleType = getRemoteList.roles.includes('ROLE_PRESENTER');
            if (getRoleType) {
              const playerName =
                getRemoteList['firstName'] + ' ' + getRemoteList['lastName'];
              if (!this.getPlayerWindow(uid)) {
                this.createPlayerWindow(uid, this.uuid === uid);

                if (this.getCurrentModeAudioStatus() && this.uuid === uid) {
                  this.unmuteAudioPlayerWindow(uid);
                  this.unmuteAudio();
                } else {
                  this.muteAudioPlayerWindow(uid);
                }

                if (this.getCurrentModeVideoStatus() && this.uuid === uid) {
                  this.unmuteVideo();
                  this.unmuteVideoPlayerWindow(uid);
                } else {
                  this.muteVideoPlayerWindow(uid);
                }
                this.showPlayerName(uid, playerName);
              }
            }
          }
        });
      } else {
        this.clearStreamWindow();
      }
    }
  }

  onUserPublished = async (user, mediaType) => {
    if (this.disconnected) {
      return;
    }
    const userList = this.userList.map((u) => {
      return u.uid === user.uid ? user : u;
    });
    this.userList = userList;
    try {
      await this.client.subscribe(user, mediaType);
    } catch (err) {
      console.error(err);
    }

    if (mediaType === 'video') {
      this.onVideoUnmuted(user.uid);
      console.log('*** user published', user);
      if (user.videoTrack) {
        if (!this.getPlayerWindow(user.uid)) {
          this.createPlayerWindow(user.uid, this.uuid === user.uid);
        }

        setTimeout(() => {
          user.videoTrack?.play(`agora-player_${user.uid}_${this.clientType}`, {
            fit: 'cover',
          });
        }, 0);
      }
    }
    if (mediaType === 'audio') {
      this.onAudioUnmuted(user.uid);
      if (user.audioTrack) {
        user.audioTrack.play();
      }
    }
  };

  onStreamUnpublished = () => {
    this.clearPlayerWindow(this.uuid);
    this.removeStream(this.uuid, false);
  };

  onStreamPublished = () => {
    this.triggerEvent('stream-published');
  };

  onAudioMuted = (uid) => {
    this.muteAudioPlayerWindow(uid);
    this.triggerEvent('remote-audio-muted', { uid });
  };

  onAudioUnmuted = (uid) => {
    this.unmuteAudioPlayerWindow(uid);
    this.triggerEvent('remote-audio-unmuted', { uid });
  };

  onVideoMuted = (uid) => {
    this.muteVideoPlayerWindow(uid);
    this.triggerEvent('remote-video-muted', { uid });
  };

  onVideoUnmuted = (uid) => {
    this.unmuteVideoPlayerWindow(uid);
    this.triggerEvent('remote-video-unmuted', { uid });
  };

  onVolumeIndicator = (result) => {
    const _this = this;
    result.forEach((volume) => {
      if (volume.level > 5) {
        _this.showSpeakingPlayerWindow(volume.uid);
      } else {
        _this.hideSpeakingPlayerWindow(volume.uid);
      }
    });
  };

  setVolumeIndicatorInterval = () => {
    if (this.is_primary) {
      const _this = this;
      this.volumeIndicatorInterval = setInterval(() => {
        if (_this.localStream?.audioTrack) {
          const audioLevel = _this.localStream.audioTrack.getVolumeLevel();
          if (audioLevel > 0.05) {
            _this.showSpeakingPlayerWindow(_this.uuid);
          } else {
            _this.hideSpeakingPlayerWindow(_this.uuid);
          }
          _this.triggerEvent('volume-indicator', { level: audioLevel });
        }
      }, 2000);
    }
  };

  setLoading = (payload) => {
    if (this.is_primary) {
      this.dispatch(setLoading(payload));
    }
  };

  // Join Channel
  joinChannel = async (channel, attendeeMode, audio, video, channelInfo) => {
    if (!channel) {
      this.setLoading(false);
      return;
    }

    // join Agora channel
    this.audioEnabled = false;
    this.videoEnabled = false;
    this.attendeeMode = attendeeMode;
    this.channel = channel;
    this.useAudio = audio;
    this.useVideo = video;
    this.channelInformation = channelInfo;

    this.channelJoining = true;
    this.triggerEvent('channel-joining', { channel });

    const defaultDeviceforMode = {
      audio: null,
      video: null,
      audioMuted: true,
      videoMuted: true,
    };

    if (this.is_primary) {
      const nopermission = await this.hasPermission({ audio, video });

      if (nopermission.audio || nopermission.video) {
        this.dispatch(setPermissionModal({ open: true, ...nopermission }));
      }

      let openSaveDialog = {
        open: false,
        audio: null,
        video: null,
      };

      let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS);
      if (savedConfig) {
        savedConfig = JSON.parse(savedConfig);
        const currentMode = savedConfig[channel];
        if (currentMode) {
          if ((audio && !currentMode.audio) || (video && !currentMode.video)) {
            openSaveDialog.open = true;
          }
        } else if (audio || video) {
          openSaveDialog.open = true;
          openSaveDialog.audio = this.microphoneId;
          openSaveDialog.video = this.cameraId;
        }

        let promises = [];

        if (audio && !nopermission.audio) {
          promises.push(AgoraRTC.getMicrophones());
        }
        if (video && !nopermission.video) {
          promises.push(AgoraRTC.getCameras());
        }

        let [microphones, cameras] = await Promise.all(promises);

        if (audio && currentMode && currentMode.audio && !nopermission.audio) {
          microphones = microphones.filter(
            (device) =>
              ['default', 'communications'].indexOf(device.deviceId) === -1
          );
          if (!microphones.some((v) => v.deviceId === currentMode.audio)) {
            openSaveDialog.open = true;
          } else {
            openSaveDialog.audio = currentMode.audio;
            defaultDeviceforMode.audioMuted = true;
            if (this.microphoneId) {
              defaultDeviceforMode.audioMuted = !!currentMode.audioMuted;
              defaultDeviceforMode.audio = currentMode.audio;
              this.microphoneId = currentMode.audio;
            }
          }
        }
        if (video && currentMode && currentMode.video && !nopermission.video) {
          cameras = cameras.filter(
            (device) =>
              ['default', 'communications'].indexOf(device.deviceId) === -1
          );
          if (!cameras.some((v) => v.deviceId === currentMode.video)) {
            openSaveDialog.open = true;
          } else {
            openSaveDialog.video = currentMode.video;
            defaultDeviceforMode.videoMuted = true;
            if (this.cameraId) {
              this.cameraId = currentMode.video;
              defaultDeviceforMode.video = currentMode.video;
              defaultDeviceforMode.videoMuted = !!currentMode.videoMuted;
            }
          }
        }
      } else if (audio || video) {
        openSaveDialog.open = true;
        openSaveDialog.audio = this.microphoneId;
        openSaveDialog.video = this.cameraId;
      }

      if (openSaveDialog.open && channelInfo.is_in_stage) {
        this.dispatch(
          setSaveDeviceModal({
            ...openSaveDialog,
            channel: channelInfo.channel,
          })
        );
      }
    }

    if (video) {
      this.showMeetingWindow();
      this.showLoadingWindow();
    }

    this.agoraService
      .getToken({ channel_id: channel, user_id: this.uuid })
      ?.then(async ({ token }) => {
        try {
          let timedout = false;
          const joinTimeout =
            this.is_primary &&
            setTimeout(() => {
              timedout = true;
              this.dispatch(
                setMessage({
                  message: i18next.t(
                    'genericMessages.agoraCouldntConnectMessage'
                  ),
                  requireReload: true,
                  type: 'error',
                  timeout: 999999,
                })
              );
            }, 15000);
          await this.client.join(appId, channel, token, this.uuid);
          clearTimeout(joinTimeout);
          if (timedout) {
            this.dispatch(
              setMessage({
                message: null,
              })
            );
          }
          this.channelJoining = false;
          if (this.is_primary) {
            this.triggerEvent('channel-joined', { channel });
          }

          this.audioMuted = {};
          this.videoMuted = {};

          this.hideLoadingWindow();
          if (this.attendeeMode === 'presenter') {
            await this.publishLocalStream(defaultDeviceforMode);
            this.setVolumeIndicatorInterval();
          }
          // Trigger events
          if (this.is_primary) {
            this.triggerEvent(
              this.isAudioAllowed() ? 'audio-allowed' : 'audio-disallowed'
            );
            this.triggerEvent(
              this.isVideoAllowed() ? 'video-allowed' : 'video-disallowed'
            );
          }

          if (window.followRequestActive) {
            if (window.followRequestAudio) {
              if (window.agoraClientPrimary) {
                window.agoraClientPrimary.unmuteAudio();
              }
            } else {
              if (window.agoraClientPrimary) {
                if (!defaultDeviceforMode.audio) {
                  window.agoraClientPrimary.muteAudio();
                }
              }
            }
          }
        } catch (error) {
          console.log(error, 'joinChannel @@error@@');
          this.channelJoining = false;
          this.handleError(error);
        } finally {
          this.setLoading(false);
        }

        // Check if there is any channel queued to join.
        if (this.channelQueue.length) {
          const _this = this;
          // Hack here
          // If we switch channel immediately after it's joined,
          // We get connection issue
          setTimeout(() => {
            _this.switchChannel(_this.channelQueue.shift());
          }, 100);
        }
      })
      ?.catch(() => {
        this.setLoading(false);
      });
  };

  stopTracks = async () => {
    if (this.localStream) {
      if (this.localStream.audioTrack) {
        this.audioMuted[this.uuid] = true;
        if (this.localStream.audioTrack) {
          await this.localStream.audioTrack.stop();
        }
      }
      if (this.localStream.videoTrack) {
        this.videoMuted[this.uuid] = true;
        if (this.localStream.videoTrack) {
          await this.localStream.videoTrack.stop();
        }
      }
    }
  };

  publishTracks = async () => {
    try {
      const promise = [];
      if (this.localStream.audioTrack && !this.disconnecting) {
        promise.push(this.client.publish(this.localStream.audioTrack));
      }
      if (this.localStream.videoTrack && !this.disconnecting) {
        promise.push(this.client.publish(this.localStream.videoTrack));
      }
      await Promise.all(promise);
    } catch (e) {
      console.log(e);
    }

    if (this.audioMuted[this.uuid]) {
      this.muteAudio();
    }

    if (this.videoMuted[this.uuid]) {
      this.muteVideo();
    }
  };

  unpublishTracks = async () => {
    if (this.localStream && this.channel) {
      try {
        if (this.localStream?.audioTrack)
          await this.client.unpublish(this.localStream.audioTrack);
        if (this.localStream?.videoTrack)
          await this.client.unpublish(this.localStream.videoTrack);
      } catch (e) {
        console.log(e);
      }
      this.localStream = null;
    }
  };

  hasPermission = async (type) => {
    const result = {};
    const currentUser = store.getState().user.current;
    if (
      (!(enableCameraAccess || enableMicAccess) &&
        !currentUser?.roles?.includes('ROLE_PRESENTER')) ||
      (!(enablePresenterCameraAccess || enablePresenterMicAccess) &&
        currentUser?.roles?.includes('ROLE_PRESENTER'))
    ) {
      return {};
    }

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      let { audio, video } = await getLocalStream();
      if (type.audio) {
        result.audio = !audio;
      }
      if (type.video) {
        result.video = !video;
      }
    } else {
      if (type.audio) {
        let promise = await navigator.permissions.query({ name: 'microphone' });
        result.audio = promise.state !== 'granted';
      }
      if (type.video) {
        let promise = await navigator.permissions.query({ name: 'camera' });
        result.video = promise.state !== 'granted';
      }
    }
    return result;
  };

  // Leave Channel
  leaveChannel = async (callback = null) => {
    this.hideMeetingWindow();
    this.removeClassMeetingWindow('presenter');
    this.moveMeetingWindow(document.getElementById('player-control'));

    if (!this.channel) {
      if (callback) {
        callback();
      }
      return;
    }
    this.channel = null;
    this.channelJoining = false;
    this.channelLeaving = true;
    this.zoneChannelJoining = false;
    this.zoneEnteredTimestamp = 0;

    try {
      if (this.volumeIndicatorInterval) {
        clearInterval(this.volumeIndicatorInterval);
        this.volumeIndicatorInterval = null;
      }
      await this.unpublishTracks();
      this.clearStreamWindow();
      this.removeAllStreams();
      await this.client.leave();
      this.channelLeaving = false;
      if (callback) {
        callback();
      }
    } catch (e) {
      console.log(e, 'leaveChanel @@error@@');
      this.channelLeaving = false;
      this.handleError(e);
    }
  };

  // Switch Channel
  switchChannel = async (channelInfo) => {
    if (!channelInfo) return;
    if (channelInfo.channelType === 'zone-joined') {
      this.zoneChannelJoining = true;
      this.zoneEnteredTimestamp = Date.now();
    } else if (
      this.zoneChannelJoining &&
      Date.now() - this.zoneEnteredTimestamp <= this.zoneEnterSafeTimeInterval
    ) {
      this.zoneChannelJoining = false;
      this.zoneEnteredTimestamp = 0;
      return;
    } else {
      this.zoneChannelJoining = false;
      this.zoneEnteredTimestamp = 0;
    }

    this.createMeetingWindow();
    return new Promise(async (resolve) => {
      if (this.channelJoining || this.channelLeaving) {
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

        if (this.is_primary) {
          window?.gameClient?.logUserAction?.({
            eventName: 'AGORA_SWITCH_CHANNEL',
            eventSpecificData: null,
            beforeState: JSON.stringify(this.channel),
            afterState: JSON.stringify(channelInfo.channel),
          });
        }

        if (window.followRequestActive) {
          this.dispatch(setLoader(false));
        }
        let channelInfoChannel = channelInfo.channel;

        if (
          this.is_primary &&
          window.followRequestActive &&
          window.is_presenter
        ) {
          if (channelInfoChannel.includes('meetingroom')) {
            channelInfoChannel = channelInfoChannel.split('@')[0];
            this.currentChannel = channelInfoChannel;
          }
          this.dispatch(changeChannelForFollowers(channelInfo.channel, true));
        }

        this.setLoading(true);

        this.leaveChannel(async () => {
          if (channelInfo.presenterVideo) {
            if (window.gameClient) {
              this.moveMeetingWindow(
                window.gameClient.getPlayerWindow().getPlayerElement()
              );
            }
            this.addClassMeetingWindow('presenter');

            if (channelInfo.useRightPanel) {
              this.moveMeetingWindow(document.getElementById('player-control'));
              this.addClassMeetingWindow('right-panel');
            } else if (channelInfo.isMeetingRoom) {
              this.addClassMeetingWindow('meeting-room');
            }
            if (channelInfo.noBackground) {
              this.addClassMeetingWindow('no-background');
            }
          } else {
            this.moveMeetingWindow(document.getElementById('player-control'));
            this.removeClassMeetingWindow('presenter');
            this.removeClassMeetingWindow('right-panel');
            this.removeClassMeetingWindow('meeting-room');
            this.removeClassMeetingWindow('no-background');
          }
          this.joinChannel(
            channelInfoChannel,
            channelInfo.attendeeMode,
            channelInfo.audio,
            channelInfo.video,
            channelInfo
          );

          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  createAudioTrack = async () => {
    const audioConfig = {
      microphoneId: this.microphoneId,
      encoderConfig: 'speech_low_quality',
    };
    let audioTrack = null;
    try {
      // checking current channel having audio allowed
      if (this.microphoneId && this.useAudio) {
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack(audioConfig);
      }
    } catch (e) {
      console.log('AUDIO NOT PERMITTED');
    }
    return audioTrack;
  };

  createVideoTrack = async () => {
    const cameraId = this.cameraId

    const videoConfig = {
      cameraId,
      encoderConfig: '240p_1',
    };
    let videoTrack = null;
    try {
      // checking current channel having video allowed
      if (cameraId && this.useVideo) {
        videoTrack = await AgoraRTC.createCameraVideoTrack(videoConfig);
      }
    } catch (e) {
      console.log('VIDEO NOT PERMITTED');
    }
    return videoTrack;
  };

  // Initialize Local Stream
  streamInit = async () => {
    let audioTrack = await this.createAudioTrack();
    let videoTrack = await this.createVideoTrack();
    return { audioTrack, videoTrack };
  };

  publishLocalStream = async (defaultDevice = {}) => {
    // create local stream;
    this.localStream = await this.streamInit();

    if (this.localStream) {
      try {
        // Publish local stream
        try {
          if (this.attendeeMode === 'presenter') {
            await this.publishTracks();
            if (!store.getState().game.zoneJoined) {
              if (this.getPlayerWindow(this.uuid)) {
                this.clearPlayerWindow(this.uuid);
              } else {
                this.createPlayerWindow(this.uuid, true);
              }
            }

            if (
              this.getPlayerWindow(this.uuid) &&
              this.localStream.videoTrack
            ) {
              this.localStream.videoTrack.play(
                `agora-player_${this.uuid}_${this.clientType}`,
                {
                  fit: 'cover',
                }
              );
            }
          }
          if (defaultDevice.audio && !defaultDevice.audioMuted) {
            this.unmuteAudio();
          } else {
            this.muteAudio();
          }
          if (defaultDevice.video && !defaultDevice.videoMuted) {
            this.unmuteVideo();
          } else {
            this.muteVideo();
          }
        } catch (err) {
          this.handleError(err);
        }
      } catch (error) {
        console.log(error, 'error publishLocalStream');
        this.localStream = null;
        this.audioEnabled = false;
        this.videoEnabled = false;
        if (this.useVideo) {
          this.createEmptyStreamWindow(this.uuid, true);
        }
        console.log(error, 'publishLocalStream @@error@@');
        this.handleError(error);
      }
    }
  };

  subscribedPlayerWindow = (streamUser) => {
    if (this.getPlayerWindow(streamUser.uid)) {
      try {
        if (streamUser.videoTrack && streamUser.hasVideo) {
          streamUser.videoTrack.play(
            `agora-player_${streamUser.uid}_${this.clientType}`,
            {
              fit: 'cover',
            }
          );
        } else {
          this.onVideoMuted(streamUser.uid);
        }
      } catch (err) {
        this.handleError(err);
      }
    }
  };

  // Add stream to streamList
  addStream = (streamUser) => {
    if (!streamUser) {
      return;
    }
    const id = streamUser.uid;

    const repetition = this.userList.some((item) => {
      return item.uid === id;
    });

    if (!repetition) {
      this.userList.push(streamUser);

      if (!store.getState().game.zoneJoined) {
        const userData = store
          .getState()
          .usersList.list.find(
            ({ eventUserId }) => streamUser.uid === eventUserId
          );
        const firstName = userData?.firstName || '';
        const lastName = userData?.lastName || '';
        // add player window
        if (this.getPlayerWindow(streamUser.uid)) {
          this.clearPlayerWindow(streamUser.uid);
        } else {
          this.createPlayerWindow(streamUser.uid, this.uuid === streamUser.uid);
        }
        // mute audio & video by default
        this.muteVideoPlayerWindow(id);
        this.triggerEvent('remote-video-muted', { uid: id });
        this.muteAudioPlayerWindow(id);
        this.triggerEvent('remote-audio-muted', { uid: id });
        this.showPlayerName(id, `${firstName + ' ' + lastName}`);
      }
    }
  };

  // Remove stream from streamList
  removeStream = (uid, destroyWindow = true) => {
    this.userList = this.userList.filter((item) => {
      if (item.uid === uid) {
        if (item.audioTrack) item.audioTrack.stop();
        if (item.videoTrack) item.videoTrack.stop();
        // destroy player window
        if (destroyWindow) {
          this.destroyPlayerWindow(uid);
        }
        return false;
      }
      return true;
    });
  };

  // Remove all streams
  removeAllStreams = () => {
    this.userList
      .map((item) => item.uid)
      .forEach((id) => this.removeStream(id, undefined));
  };

  // Mute Audio
  muteAudio = () => {
    if (this.attendeeMode !== 'presenter') {
      return;
    }
    if (this.localStream?.audioTrack) {
      this.localStream.audioTrack.setEnabled(false);
    }
    this.muteAudioPlayerWindow(this.uuid);
    this.audioEnabled = false;
    this.triggerEvent('audio-muted');
  };

  // Unmute Audio
  unmuteAudio = () => {
    this.audioEnabled = true;
    if (this.attendeeMode !== 'presenter') {
      return;
    }

    if (this.localStream?.audioTrack) {
      this.localStream.audioTrack.setEnabled(true);
      this.unmuteAudioPlayerWindow(this.uuid);
    }

    if (this.micDetectionInterval) {
      clearInterval(this.micDetectionInterval);
    }
    this.triggerEvent('audio-unmuted');
  };

  saveAudioConfig = () => {
    if (this.is_primary) {
      let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS) || '{}';
      savedConfig = JSON.parse(savedConfig);
      if (!this.channel) return;
      if (savedConfig[this.channel]) {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            ...savedConfig[this.channel],
            audio: this.microphoneId || null,
          },
        };
      } else {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            audio: this.microphoneId || null,
            video: this.cameraId || null,
            audioMuted: !!this.audioEnabled,
            videoMuted: true,
          },
        };
      }
      localStorage.setItem(CHANNEL_PERMISSIONS, JSON.stringify(savedConfig));
    }
  };

  saveVideoConfig = () => {
    if (this.is_primary) {
      let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS) || '{}';
      savedConfig = JSON.parse(savedConfig);
      if (!this.channel) return;
      if (savedConfig[this.channel]) {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            ...savedConfig[this.channel],
            video: this.cameraId || null,
          },
        };
      } else {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            audio: this.microphoneId || null,
            video: this.cameraId || null,
            audioMuted: true,
            videoMuted: !!this.videoEnabled,
          },
        };
      }
      localStorage.setItem(CHANNEL_PERMISSIONS, JSON.stringify(savedConfig));
    }
  };

  // Toggle Audio
  toggleAudio = () => {
    if (this.is_primary) {
      let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS) || '{}';
      savedConfig = JSON.parse(savedConfig);
      if (savedConfig[this.channel]) {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            ...savedConfig[this.channel],
            audioMuted: !!this.audioEnabled,
          },
        };
      } else {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            audio: this.microphoneId || null,
            video: this.cameraId || null,
            audioMuted: !!this.audioEnabled,
            videoMuted: true,
          },
        };
      }
      localStorage.setItem(CHANNEL_PERMISSIONS, JSON.stringify(savedConfig));
    }

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
    if (this.localStream?.videoTrack) {
      this.localStream.videoTrack.setMuted(true);
      // this.localStream.videoTrack.setEnabled(false);
    }
    this.muteVideoPlayerWindow(this.uuid);
    this.videoEnabled = false;
    this.triggerEvent('video-muted');
  };

  // Unmute Video
  unmuteVideo = () => {
    if (this.attendeeMode !== 'presenter') {
      return;
    }
    if (this.localStream?.videoTrack) {
      this.localStream.videoTrack.play(
        `agora-player_${this.uuid}_${this.clientType}`,
        {
          fit: 'cover',
        }
      );
      this.localStream.videoTrack.setMuted(false);
      // this.localStream.videoTrack.setEnabled(true);
      this.unmuteVideoPlayerWindow(this.uuid);
    }
    this.videoEnabled = true;

    this.triggerEvent('video-unmuted');
  };

  // Toggle Video
  toggleVideo = () => {
    if (this.is_primary) {
      let savedConfig = localStorage.getItem(CHANNEL_PERMISSIONS) || '{}';
      savedConfig = JSON.parse(savedConfig);
      if (savedConfig[this.channel]) {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            ...savedConfig[this.channel],
            videoMuted: !!this.videoEnabled,
          },
        };
      } else {
        savedConfig = {
          ...savedConfig,
          [this.channel]: {
            audio: this.microphoneId || null,
            video: this.cameraId || null,
            audioMuted: true,
            videoMuted: !!this.videoEnabled,
          },
        };
      }
      localStorage.setItem(CHANNEL_PERMISSIONS, JSON.stringify(savedConfig));
    }

    if (this.videoEnabled) {
      this.muteVideo();

      window?.gameClient?.logUserAction?.({
        eventName: 'CAMERA_OFF',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    } else {
      this.unmuteVideo();

      window?.gameClient?.logUserAction?.({
        eventName: 'CAMERA_ON',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    }
  };

  // Switch Device
  switchDevice = async (microphoneId, cameraId, unmute) => {
    if (
      this.cameraId === cameraId &&
      this.microphoneId === microphoneId
    ) {
      if (unmute && this.isAudioAllowed()) {
        this.unmuteAudio();
      }
      if (unmute && this.isVideoAllowed()) {
        this.unmuteVideo();
      }
      return;
    }

    this.microphoneId = microphoneId;
    this.cameraId = cameraId;

    await this.stopTracks();
    await this.unpublishTracks();

    this.localStream = await this.streamInit();

    if (this.channel) {
      await this.publishTracks();
      if (
        this.videoEnabled &&
        this.getPlayerWindow(this.uuid) &&
        this.localStream?.videoTrack
      ) {
        this.localStream.videoTrack.play(
          `agora-player_${this.uuid}_${this.clientType}`,
          {
            fit: 'cover',
          }
        );
      }
      if (this.is_primary) {
        this.triggerEvent(
          this.isAudioAllowed() ? 'audio-allowed' : 'audio-disallowed'
        );
        this.triggerEvent(
          this.isVideoAllowed() ? 'video-allowed' : 'video-disallowed'
        );
      }
      if (unmute && this.isAudioAllowed()) {
        this.unmuteAudio();
      }
      if (unmute && this.isVideoAllowed()) {
        this.unmuteVideo();
      }
    }
  };

  // Set Volume
  setVolume = (volume) => {
    this.volume = volume;

    if (this.localStream?.audioTrack?.hasAudio) {
      this.localStream.audioTrack.setVolume(volume);
    }
  };

  // Set Player Volume based on Distance
  setPlayerVolumeWithDistance = ({ eventUserId, distance }) => {
    const playerStream = this.userList.find(
      (stream) => stream.uid === eventUserId
    );

    if (playerStream) {
      if (
        window.followRequestActive ||
        window.gameClient.getCurrentRoomType() === 'meeting'
      ) {
        if (playerStream.hasAudio && playerStream.audioTrack) {
          playerStream.audioTrack.setVolume(100);
        }
        return;
      }
      if (playerStream.hasAudio && playerStream.audioTrack) {
        playerStream.audioTrack.setVolume(
          Math.min(100, Math.max(0, Math.round(this.volume * distance)))
        );
      }
    }
  };

  /**
   *
   * @param eventUserId
   * @return {AgoraRTC.Stream | undefined}
   */
  findPlayerStreamById = (eventUserId) => {
    return this.userList.find((stream) => stream.uid === eventUserId);
  };

  // Error Handler
  handleError = (err) => console.log(`*** AGORA ERROR: ${JSON.stringify(err)}`);

  /*******************************
   * Agora Player DOM Management *
   *******************************/

  // Create whole meeting Window
  createMeetingWindow = () => {
    if (this.meetingWindowCreated) {
      return;
    }
    const element = document.createElement('div');
    element.setAttribute('id', this.meetingDOMId);
    element.setAttribute('class', 'meeting');
    const playerControl = document.getElementById('player-control');
    if (playerControl) {
      playerControl.append(element);
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
      this.meetingWindowCreated = true;
    }
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
    if (streamListWindow) {
      streamListWindow.innerHTML = '';
    }
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
    const getIconTag = document.getElementById('meeting-icons');
    if (getIconTag) {
      getIconTag.style.display = 'none';
    }
  };

  hideLoadingWindow = () => {
    this.getLoadingWindow().setAttribute('class', 'loading');
  };

  // Create player window
  createPlayerWindow = (id, isLocalStream) => {
    const element = document.createElement('div');
    element.setAttribute('id', `agora-player_${id}_${this.clientType}`);
    element.setAttribute(
      'class',
      `player ${isLocalStream ? 'local' : `remote ${this.attendeeMode}`}`
    );

    if (window.followRequestActive && !isLocalStream) {
      this.dispatch(setLoader(false));
    }

    const parentElement = this.getStreamListWindow();
    if (parentElement) {
      if (isLocalStream) {
        parentElement.prepend(element);
      } else {
        parentElement.append(element);
      }
    }
    this.getPlayerName(id).then(({ firstName, lastName }) => {
      this.showPlayerName(id, `${firstName + ' ' + lastName}`);
    });
    this.triggerEvent('player-window-created', { playerId: id });
  };
  getPlayerName = async (id) => {
    let firstName = '';
    let lastName = '';
    const currentUser = store.getState().user.current;
    if (currentUser.eventUserId === id) {
      firstName = currentUser?.firstName ?? '';
      lastName = currentUser?.lastName ?? '';
    } else {
      await store.dispatch(getUsersList());
      const remoteUser = store
        .getState()
        .usersList?.list?.find(({ eventUserId }) => id === eventUserId);
      if (remoteUser) {
        firstName = remoteUser?.firstName ?? '';
        lastName = remoteUser?.lastName ?? '';
      }
    }
    return { firstName, lastName };
  };

  // Get player window
  getPlayerWindow = (id) => {
    return document.getElementById(`agora-player_${id}_${this.clientType}`);
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
  };

  // Show Player Name
  showPlayerName = (id, name) => {
    if (this.uuid === id) {
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
    if (window.followRequestActive) {
      this.dispatch(setLoader(true));
    }
    if (this.getPlayerWindow(id)) {
      this.getPlayerWindow(id).remove();
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

  off = (event, handler) => {
    this.removeEventListener(event, handler);
  };

  triggerEvent = (name, payload) => {
    if (name !== 'volume-indicator') {
      console.log('*** agora event', name, payload);
    }
    this.dispatchEvent(new CustomEvent(name, { detail: payload }));
  };

  /********************
   * Status Interface *
   ********************/
  hasStreamsPlaying = () => {
    for (const stream of this.userList) {
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
  getSelectedCameraDeviceInfo = () => {
    return this.cameraDeviceInfo;
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

  isVideoAllowedNotUsed = () => {
    return this.useVideo && !this.cameraId;
  };

  isAudioAllowedNotUsed = () => {
    return this.useAudio && !this.microphoneId;
  };

  /**
   * Destroy Agora Client completely
   */
  disconnect = async (callback) => {
    try {
      await this.leaveChannel();
      if (this.volumeIndicatorInterval) {
        clearInterval(this.volumeIndicatorInterval);
        this.volumeIndicatorInterval = null;
      }
      this.unSubscribeStreamEvents();
      this.destroyMeetingWindow();
      if (callback) {
        callback();
      }
    } catch (e) {
      console.log('-->[AGORA_CLIENT] failed to disconnect', e);
    }
  };
}
