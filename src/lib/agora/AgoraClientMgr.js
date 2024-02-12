import AgoraClient from 'utils/agoraClientNg';
import AgoraScreenShare from 'utils/agoraScreenShare';

import {
  addParticipantWithAudio,
  clearParticipantsWithAudio,
  removeParticipantWithAudio,
  setAudioAllowed,
  setAudioEnabled,
  setVideoAllowed,
  setVideoEnabled,
  showPlayerName,
  setAudioLoading,
  setVideoLoading,
} from 'store/reducers/agora';
import { setMessage } from 'store/reducers/message';
import { setChannelJoining, setStartTime } from 'store/reducers/game';
import {
  setActive as setScreenShareActive,
  setLoading as setScreenShareLoading,
} from 'store/reducers/screenShare';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
  enableVOG,
} from 'utils/eventVariables';

/**
 * ### Agora Manager
 * Manages Agora SDKs instance creation, set up and config.
 *
 * - Leverage Main.jsx Agora related code.
 * - Subscribe event handlers.
 * - Encapsulate all Agora Subsystem, allowing local state logic.
 */
class AgoraClientMgr {
  constructor() {
    this.initialized = false;
  }

  init = (config) => {
    this.dispatch = config.redux.dispatch;
    this.config = config;
    this.initialized = true;
    this.eventUserId = config.eventUserId;
    this.currentUser = config.user.current;
    this.instances = this.createAgoraClients();
  };

  createAgoraClients = () => {
    const eventUserId = this.eventUserId;

    let agoraClientPrimary, agoraClientSecondary, agoraClientThird;
    if (
      enableCameraAccess ||
      enableMicAccess ||
      enablePresenterCameraAccess ||
      enablePresenterMicAccess
    ) {
      // Setup local stream and create agora client
      agoraClientPrimary = new AgoraClient(eventUserId, {
        config: this.config,
        clientType: 'primary',
      });
      window.agoraClientPrimary = agoraClientPrimary;

      if (enableVOG) {
        agoraClientSecondary = new AgoraClient(eventUserId, {
          config: this.config,
          clientType: 'secondary',
        });
        window.agoraClientSecondary = agoraClientSecondary;
      }

      agoraClientThird = new AgoraClient(eventUserId, {
        config: this.config,
        clientType: 'tertiary',
      });
      window.agoraClientThird = agoraClientThird;
    }

    const agoraScreenShare = new AgoraScreenShare(eventUserId, {
      config: this.config,
    });
    window.agoraScreenShare = agoraScreenShare;

    return {
      agoraClientPrimary: agoraClientPrimary,
      agoraClientSecondary: agoraClientSecondary,
      agoraClientThird: agoraClientThird,
      agoraScreenShare,
    };
  };

  subscribeAgoraListeners = () => {
    if (
      enableCameraAccess ||
      enableMicAccess ||
      enablePresenterCameraAccess ||
      enablePresenterMicAccess
    ) {
      this.setupAgoraEventHandlers(this.instances.agoraClientPrimary);
    }
    this.setupAgoraScreenShareEventHandlers(this.instances.agoraScreenShare);
  };

  setupAgoraScreenShareEventHandlers = (agoraScreenShare) => {
    agoraScreenShare.on(
      'screen-share-started',
      this.onScreenShareStartedListener
    );
    agoraScreenShare.on(
      'screen-share-stopped',
      this.onScreenShareStoppedListener
    );
    agoraScreenShare.on(
      'screen-share-loading',
      this.onScreenShareLoadingListener
    );
  };

  setupAgoraEventHandlers = (agoraClient) => {
    agoraClient.on('audio-allowed', this.onAudioAllowedListener);
    agoraClient.on('audio-disallowed', this.onAudioDisallowedListener);
    agoraClient.on('audio-muted', this.onAudioMutedListener);
    agoraClient.on('audio-unmuted', this.onAudioUnmutedListener);
    agoraClient.on('video-allowed', this.onVideoAllowedListener);
    agoraClient.on('video-disallowed', this.onVideoDisallowedListener);
    agoraClient.on('video-muted', this.onVideoMutedListener);
    agoraClient.on('video-unmuted', this.onVideoUnmutedListener);
    agoraClient.on('stream-published', this.onStreamPublishedListener);
    agoraClient.on('volume-indicator', this.onVolumeIndicatorListener);
    agoraClient.on('channel-joining', this.onChannelJoiningListener);
    agoraClient.on('channel-joined', this.onChannelJoinedListener);
    agoraClient.on('player-window-created', this.onPlayerWindowCreatedListener);
    agoraClient.on('remote-audio-muted', this.onRemoteAudioMutedListener);
    agoraClient.on('remote-audio-unmuted', this.onRemoteAudioUnmutedListener);
  };

  onScreenShareStartedListener = () => {
    this.dispatch(setScreenShareActive(true));
  };

  onScreenShareStoppedListener = () => {
    this.dispatch(setScreenShareActive(false));
  };

  onScreenShareLoadingListener = (payload) => {
    this.dispatch(setScreenShareLoading(payload));
  };

  onAudioAllowedListener = () => {
    this.dispatch(setAudioAllowed(true));
  };

  onAudioDisallowedListener = () => {
    this.dispatch(setAudioAllowed(false));
  };

  onAudioMutedListener = () => {
    this.dispatch(setAudioEnabled(false));
    this.dispatch(setAudioLoading(false));
  };

  onAudioUnmutedListener = () => {
    this.dispatch(setAudioEnabled(true));
    this.dispatch(setAudioLoading(false));
  };

  onVideoAllowedListener = () => {
    this.dispatch(setVideoAllowed(true));
  };

  onVideoDisallowedListener = () => {
    this.dispatch(setVideoAllowed(false));
  };

  onVideoMutedListener = () => {
    this.dispatch(setVideoEnabled(false));
    this.dispatch(setVideoLoading(false));
  };

  onVideoUnmutedListener = () => {
    this.dispatch(setVideoEnabled(true));
    this.dispatch(setVideoLoading(false));
  };

  onStreamPublishedListener = () => {
    this.dispatch(setMessage({ message: null }));
  };

  onVolumeIndicatorListener = ({ level }) => {
    if (window.gameClient) {
      window.gameClient.setVolumeLevel(level);
    }
  };

  onChannelJoiningListener = () => {
    // Set Channel Joining
    this.dispatch(setChannelJoining(true));
  };

  onChannelJoinedListener = () => {
    this.dispatch(
      setMessage({
        message: null,
      })
    );

    // Clear Channel Joining
    this.dispatch(setChannelJoining(false));
    // Reset counter
    this.dispatch(setStartTime(new Date().getTime()));
    // Clear Muted Participants
    this.dispatch(clearParticipantsWithAudio());
  };

  onPlayerWindowCreatedListener = ({ playerId }) => {
    this.dispatch(showPlayerName(playerId));
  };

  onRemoteAudioMutedListener = ({ uid }) => {
    this.dispatch(removeParticipantWithAudio(uid));
  };

  onRemoteAudioUnmutedListener = ({ uid }) => {
    this.dispatch(addParticipantWithAudio(uid));
  };

  reset = () => {
    this.initialized = false;
    this.unsubscribeAgoraClientEvents(this.instances.agoraClientPrimary);
    this.unsubscribeScreenShareEvents(this.instances.agoraScreenShare);
  };

  unsubscribeAgoraClientEvents = (agoraClient) => {
    agoraClient.off('audio-allowed', this.onAudioAllowedListener);
    agoraClient.off('audio-disallowed', this.onAudioDisallowedListener);
    agoraClient.off('audio-muted', this.onAudioMutedListener);
    agoraClient.off('audio-unmuted', this.onAudioUnmutedListener);
    agoraClient.off('video-allowed', this.onVideoAllowedListener);
    agoraClient.off('video-disallowed', this.onVideoDisallowedListener);
    agoraClient.off('video-muted', this.onVideoMutedListener);
    agoraClient.off('video-unmuted', this.onVideoUnmutedListener);
    agoraClient.off('stream-published', this.onStreamPublishedListener);
    agoraClient.off('volume-indicator', this.onVolumeIndicatorListener);
    agoraClient.off('channel-joining', this.onChannelJoiningListener);
    agoraClient.off('channel-joined', this.onChannelJoinedListener);
    agoraClient.off(
      'player-window-created',
      this.onPlayerWindowCreatedListener
    );
    agoraClient.off('remote-audio-muted', this.onRemoteAudioMutedListener);
    agoraClient.off('remote-audio-unmuted', this.onRemoteAudioUnmutedListener);
  };
  unsubscribeScreenShareEvents = (screenShareClient) => {
    screenShareClient.off(
      'screen-share-started',
      this.onScreenShareStartedListener
    );
    screenShareClient.off(
      'screen-share-stopped',
      this.onScreenShareStoppedListener
    );
    screenShareClient.off(
      'screen-share-loading',
      this.onScreenShareLoadingListener
    );
  };
}

const manager = new AgoraClientMgr();
export default manager;
