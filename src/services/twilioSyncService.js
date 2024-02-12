import SyncClient from 'twilio-sync';
import BaseAPIService from './baseAPIService';
import {
  USER_STATUS_PREFIX,
  GOD_USER_LIST_PREFIX,
  EVENT_MEETING_POLL_PREFIX,
  EVENT_AUDIO_CHAT_POLL_PREFIX,
  EVENT_TELEPORT_REQUEST_POLL_PREFIX,
  EVENT_FOLLOW_ME_POLL_PREFIX,
  EVENT_SCREEN_SHARE_POLL_PREFIX,
  EVENT_PRESENTERS_LIST_POLL_PREFIX,
} from 'constants/web';
import { startTwilioDependedService } from 'store/reducers/user';
import config from 'config';

class TwilioSyncService extends BaseAPIService {
  constructor() {
    super();
    this.dispatch = null;
    this.isActive = false;
    this.retryCount = 1;
    this.retryInterval = 200;
    this.retryTimeoutRef = null;
  }

  stopService = () => {
    this.isActive = false;
    this.client = null;
  };

  setDispatch = (dispatch) => {
    this.dispatch = dispatch;
  };

  setupSync = async (res) => {
    if (res.status === 'success') {
      this.token = res.token;
      this.client = new SyncClient(this.token);
      this.isActive = true;
      this.connectionErrorAndRestart();
    }
  };

  setupSyncFromLocal = async (isActive = true, userId) => {
    if (userId) {
      this.userId = userId;
    }
    return new Promise(async (resolve, reject) => {
      const res = await this.getSyncToken();
      if (res.status === 'success') {
        this.token = res.token;
        this.client = new SyncClient(this.token);
        this.client.on('tokenAboutToExpire', this.updateTokenFromLocal);
        this.isActive = isActive;
        this.connectionErrorAndRestart(() => resolve(true));
      } else {
        reject();
      }
    });
  };

  getSyncCirrusToken = async () => {
    let token = '';
    const res = await this.requestTwilioLambdaAPI(
      `/createSyncToken/generate-sync-token`,
      'POST',
      {
        ttl: 1410,
        eventName: config.event.name,
        id: 'cirrus-' + window.instance_id,
      }
    );

    if (res.status === 'success') {
      token = res.token;
    }
    return token;
  };

  setCirrusToken = async () => {
    const cirrustoken = await this.getSyncCirrusToken();
    if (cirrustoken && window.gameClient) {
      window.gameClient.signalingClient.sendData(
        JSON.stringify({
          type: 'twiliotokenupdate',
          twilioToken: cirrustoken,
        })
      );
    }
  };

  updateTokenFromLocal = async () => {
    const res = await this.getSyncToken();
    if (res.status === 'success') {
      this.token = res.token;
      if (this.client) {
        await this.client.updateToken(this.token);
        await this.setCirrusToken();
      }
    }
  };

  setUserStatusDoc = async (eventID) => {
    if (this.client && this.isActive) {
      this.userStatusDoc = await this.client.document(
        USER_STATUS_PREFIX + eventID
      );
    }
  };

  setGodUserDoc = async (eventID) => {
    if (this.client && this.isActive) {
      this.godUserDoc = await this.client.document(
        GOD_USER_LIST_PREFIX + eventID
      );
    }
  };

  setMeetingPollList = async (eventID) => {
    if (this.client && this.isActive) {
      this.meetingPollList = await this.client.list(
        EVENT_MEETING_POLL_PREFIX + eventID
      );
    }
  };

  setAudioChatPollList = async (eventID) => {
    if (this.client && this.isActive) {
      this.audioChatPollList = await this.client.list(
        EVENT_AUDIO_CHAT_POLL_PREFIX + eventID
      );
    }
  };

  setFollowRequestPollList = async (eventID) => {
    if (this.client && this.isActive) {
      this.followRequestPollList = await this.client.list(
        EVENT_FOLLOW_ME_POLL_PREFIX + eventID
      );
    }
  };

  setTeleportRequestPollList = async (eventID) => {
    if (this.client && this.isActive) {
      this.teleportRequestPollList = await this.client.list(
        EVENT_TELEPORT_REQUEST_POLL_PREFIX + eventID
      );
    }
  };

  setScreenSharePollList = async (eventID) => {
    if (this.client && this.isActive) {
      this.screenSharePollList = await this.client.list(
        EVENT_SCREEN_SHARE_POLL_PREFIX + eventID
      );
    }
  };

  setPresentersListPollList = async (eventID) => {
    if (this.client && this.isActive) {
      this.presentersListPollList = await this.client.list(
        EVENT_PRESENTERS_LIST_POLL_PREFIX + eventID
      );
    }
  };

  /* LOCAL API */
  getSyncToken = () => {
    return this.requestTwilioLambdaAPI(
      `/createSyncToken/generate-sync-token`,
      'POST',
      {
        ttl: 1410,
        eventName: config.event.name,
        id: this.userId,
      }
    );
  };

  restartService = async () => {
    try {
      const res = await this.setupSyncFromLocal(false);
      if (res) {
        await Promise.all([
          this.setUserStatusDoc(),
          this.setGodUserDoc(),
          this.setMeetingPollList(),
          this.setAudioChatPollList(),
          this.setFollowRequestPollList(),
          this.setTeleportRequestPollList(),
          this.setScreenSharePollList(),
          this.setPresentersListPollList(),
        ]);
        this.dispatch(startTwilioDependedService());
      }
    } catch (error) {
      console.log(error);
    }
  };

  resetService = async () => {
    this.isActive = false;
    await this.client.shutdown();
    if (this.retryCount <= 3) {
      this.retryCount = this.retryCount + 1;
      this.retryInterval = this.retryInterval * 2;
      setTimeout(() => {
        this.restartService();
      }, this.retryInterval);
    }
  };

  connectionErrorAndRestart = async (callback) => {
    if (this.client) {
      this.client.on('connectionStateChanged', (state) => {
        if (state === 'connected') {
          this.retryCount = 1;
          this.retryInterval = 200;
          this.isActive = true;
          if (callback) callback();
        }
      });

      this.client.on('connectionError', async (connectionError) => {
        console.error('Connection was interrupted:', connectionError.message);
        console.error('Is terminal:', connectionError.terminal);
        if (
          connectionError.errorCode === '20429' ||
          connectionError.errorCode === 20429
        ) {
          this.isActive = false;
          if (this.retryTimeoutRef) clearTimeout(this.retryTimeoutRef);
          this.retryTimeoutRef = setTimeout(() => {
            this.resetService();
          }, 1000);
        }
      });
    }
  };
}

const twilioSyncService = new TwilioSyncService();
export default twilioSyncService;
