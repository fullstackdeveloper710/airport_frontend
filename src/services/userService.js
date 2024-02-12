import config from 'config';
import BaseAPIService from './baseAPIService';

export default class UserService extends BaseAPIService {
  //GET USER DATA

  //Old CMS --> Needs to be here for fake login
  getUserData = (eventID, id) => {
    return this.requestCMSAPIWithAuth(`/events/${eventID}/users/${id}`, 'GET');
  };

  //New Surreal XP 
  getXpManagerUserData = (payload) => {
    return this.requestXPManager(`/v1/userinfoloader/getinfo`, 'POST', payload)
  }

  //Get consent values
  getXpUserConsentValues = async (userId) => {
    const tncStatus = await this.requestXPManager(`/v1/consent/tncStatus/${userId}`)
    const privacyStatus = await this.requestXPManager(`/v1/consent/privacyStatus/${userId}`)
    const legalStatus = await this.requestXPManager(`/v1/consent/legalStatus/${userId}`)
    return {
      tncStatus,
      privacyStatus,
      legalStatus
    }
  }

  updateXPUserConsentStatus = async (consentType, userId) => {
    return this.requestXPManager(`/v1/consent/${consentType}/${userId}`, 'PUT')
  }

  //UPDATE EVENT USER
  // updateEventUser = (eventID, id, payload) => {
  //   return this.requestCMSAPIWithAuth(
  //     `/events/${eventID}/users/${id}`,
  //     'PUT',
  //     payload
  //   );
  // };

  //Used by usersList
  getUsers = (eventId) => {
    return this.requestCMSAPIWithAuth(`/events/${eventId}/users/list`, 'GET');
  };

  getXpUsers = (mainExperienceId) => {
    return this.requestXPManager(`/surreal-users?surrealMainExperienceId.equals=${mainExperienceId}`)
  }

  //Emirates specific HR information from XP Manager
  getHrUsers = () => {
    return this.requestXPManager('/v1/emirates/all')
  }

  //Used to set online status for user
  setUserOffline = (payload) => {
    return this.request(config.onlineStatusUrl, '', 'POST', payload);
  };
}
