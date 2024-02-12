import BaseAPIService from './baseAPIService';

export default class AgoraService extends BaseAPIService {

  getToken = (payload) => {
    return this.requestCMSAPIWithAuth('/agora/token', 'POST', payload);
  };
}
