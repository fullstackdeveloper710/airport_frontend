import BaseAPIService from './baseAPIService';
export default class VirtualQuestService extends BaseAPIService {
  getAllMainVirtualQuest = () => {
    return this.requestXPManager('/user/virtual-main-quest', 'GET');
  };
  getAllSubQuestByUserId = (mainQuestId) => {
    return this.requestXPManager(
      `/user/virtual-main-quest/${mainQuestId}/virtual-sub-quest`,
      'GET'
    );
  };
  updateVirtualSubQuestResource = (mainQuestId, virtualSubQuestId) => {
    return this.requestXPManager(
      `/virtual-sub-quest/${virtualSubQuestId}/user-virtual-sub-quest-status`,
      'PUT'
    );
  };
}
