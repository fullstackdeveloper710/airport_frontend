import manager from 'lib/agora/AgoraClientMgr';
import chatService from 'services/chatService';
import twilioSyncService from 'services/twilioSyncService';
import { removeNotifications } from 'store/reducers/channel';
import { enableVOG } from 'utils/eventVariables';

export const stopChatServices = async () => {
  const promises = [];

  if (window.agoraClientPrimary) {
    promises.push(
      new Promise((resolve) => {
        window.agoraClientPrimary.disconnect(() => {
          delete window.agoraClientPrimary;
          resolve();
        });
      })
    );
  }
  if (enableVOG && window.agoraClientSecondary) {
    promises.push(
      new Promise((resolve) => {
        window.agoraClientSecondary.disconnect(() => {
          delete window.agoraClientSecondary;
          resolve();
        });
      })
    );
  }
  if (window.agoraClientThird) {
    promises.push(
      new Promise((resolve) => {
        window.agoraClientThird.disconnect(() => {
          delete window.agoraClientThird;
          resolve();
        });
      })
    );
  }
  if (window.agoraScreenShare) {
    promises.push(
      new Promise((resolve) => {
        window.agoraScreenShare.disconnect(() => {
          delete window.agoraScreenShare;
          resolve();
        });
      })
    );
  }
  manager.reset();
  twilioSyncService.stopService();
  chatService.stopService();
  await Promise.all(promises);
  removeNotifications();
};
