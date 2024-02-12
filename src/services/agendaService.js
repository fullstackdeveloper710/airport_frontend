import BaseAPIService from './baseAPIService';
import config from 'config';

class AgendaService extends BaseAPIService {
  getAgendaById = (agendaId) => {
    return this.requestXPManager(`/surreal-sub-experiences/${config.experience.subExperienceId}/agenda/${agendaId}`, 'GET');
  }
  getAgendaXPList = (payload) => {
    return this.requestXPManager(`/v1/agendainfoloader/getagendainfo`, 'POST', payload);
  };

  getAgendaList = (eventID) => {
    return this.requestCMSAPIWithAuth(`/events/${eventID}/agenda`, 'GET');
  };
  createAgenda = (eventID, payload) => {
    return this.requestCMSAPIWithAuth(`/events/${eventID}/agenda`, 'POST', payload);
  };
  updateAgenda = (eventID, id, payload) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventID}/agenda/${id}`,
      'PUT',
      payload
    );
  };
  deleteAgenda = (eventID, id) => {
    return this.requestCMSAPIWithAuth(`/events/${eventID}/agenda/${id}`, 'DELETE');
  };
  inviteUsers = (eventID, id, users) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventID}/agenda/${id}/invite`,
      'POST',
      { users }
    );
  };
  uninviteUsers = (eventID, id, users) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventID}/agenda/${id}/uninvite`,
      'POST',
      { users }
    );
  };
  acceptInvite = (eventID, id) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventID}/agenda/${id}/accept-invite`,
      'POST'
    );
  };
  declineInvite = (eventID, id) => {
    return this.requestCMSAPIWithAuth(
      `/events/${eventID}/agenda/${id}/decline-invite`,
      'POST'
    );
  };
}

const agendaService = new AgendaService();
export default agendaService;
