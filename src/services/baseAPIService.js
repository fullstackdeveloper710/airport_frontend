import axios from 'axios';
import config from 'config';
import StorageService from './storageService';

export default class BaseAPIService {
  getCMSURL = () => {
    if (window.useDevServices) {
      return config.api.dev_cms;
    }
    return config.api.cms;
  };

  request = (baseURL, url, method, data, timeout) => {
    return axios
      .request({
        url: baseURL + url,
        method,
        data,
        timeout,
      })
      .then((res) => res.data);
  };

  requestWithAuth = (baseURL, token, url, method, data, timeout) => {
    return axios
      .request({
        url: baseURL + url,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        method,
        data,
        timeout,
      })
      .then((res) => {
        if (typeof res.data === 'object') {
          if (Array.isArray(res.data)) {
            return res.data;
          }
          return { ...res.data, statusCode: res.status };
        }
        return res.data;
      });
  };

  requestXPWithAuth = (baseURL, token, url, method, data, timeout) => {
    return axios
      .request({
        url: baseURL + url,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-sub-experience-id': config.experience.subExperienceId,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        method,
        data,
        timeout,
      })
      .then((res) => {
        if (typeof res.data === 'object') {
          if (Array.isArray(res.data)) {
            return res.data;
          }
          return { ...res.data, statusCode: res.status };
        }
        return res.data;
      });
  };

  requestFormDataWithAuth = (baseURL, token, url, method, data, timeout) => {
    return axios
      .request({
        url: baseURL + url,
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
        method,
        data,
        timeout,
      })
      .then((res) => res.data);
  };

  requestCMSAPI = (url, method, data, timeout = 0) => {
    return this.request(this.getCMSURL() || '', url, method, data, timeout);
  };

  requestCMSAPIWithAuth = (url, method, data, timeout = 0) => {
    const storageService = new StorageService();
    const token = storageService.getToken()?.token;
    if (!token) return null;
    return this.requestWithAuth(
      this.getCMSURL() || '',
      token,
      url,
      method,
      data,
      timeout
    );
  };

  requestXPManager = (url, method = "GET", data = {}, timeout = 0) => {
    const storageService = new StorageService();
    const token = storageService.getXPToken();
    if (!token) return null;
    return this.requestXPWithAuth(
      config.api.xpManager || '',
      token,
      url,
      method,
      data,
      timeout
    );
  }

  requestFormDataCMSAPIWithAuth = (url, method, data, timeout = 0) => {
    const storageService = new StorageService();
    const token = storageService.getToken()?.token;
    if (!token) return null;
    return this.requestFormDataWithAuth(
      this.getCMSURL() || '',
      token,
      url,
      method,
      data,
      timeout
    );
  };

  requestLambdaAPI = (url, method, data, timeout = 0) => {
    return this.request('', url, method, data, timeout);
  };

  requestTwilioLambdaAPI = (url, method, data, timeout = 0) => {
    return this.request(
      config.api.twilioLambda || '',
      url,
      method,
      data,
      timeout
    );
  };

  //Fix for teleport issue using eventlogger
  requestEventLogger = async (url, method, data = {}) => {
    return await axios
      .request({
        url: config.api.eventLogger + url,
        method,
        data
      })
      .then((res) => res.data);
  }
}
