import BaseAPIService from './baseAPIService';

export default class EventService extends BaseAPIService {
  getEventSmartScreenList = (eventId) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventId}/smart-screens`,
      'GET'
    );
  };
}
