import BaseAPIService from './baseAPIService';

export default class EventUserService extends BaseAPIService {
  getEventUser = ({ eventId, userId }) => {
    return this.requestCMSAPIWithAuth(`/events/${eventId}/users/${userId}`, 'GET');
  };
  getEventUserGameId = (payload) => {
    return this.requestEventLogger(`/gamefromeventuser/${payload.userId}/${payload.eventId}`, 'GET');
  }
  logUserEvent = (payload) => {
    return this.requestEventLogger(`/logs/`, 'POST', payload);
  }
}
