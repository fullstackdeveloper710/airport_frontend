import BaseAPIService from './baseAPIService';

class FileService extends BaseAPIService {
  uploadBase64 = (data, filename) => {
    return this.requestCMSAPIWithAuth(`/files/base64/${filename}`, 'POST', {
      data,
    });
  };
  uploadFile = (formData) => {
    return this.requestFormDataCMSAPIWithAuth(`/files`, 'POST', formData);
  };
}

const fileService = new FileService();
export default fileService;
