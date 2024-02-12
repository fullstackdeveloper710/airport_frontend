import BaseAPIService from './baseAPIService';

export default class AuthService extends BaseAPIService {
  login = (payload) => {
    return this.requestCMSAPI('/auth/token', 'POST', payload);
  };
  //Temporary till Game integrates Surreal XP API
  fakeLogin = (payload) => {
    return this.requestLambdaAPI(
      `https://1d4f380dc9.execute-api.us-east-1.amazonaws.com/live/braves/guestLogin`,
      'POST',
      payload
    );
  }
}
