import BaseAPIService from './baseAPIService';
export default class VRService extends BaseAPIService {
  getVrResources = () => {
    return this.requestXPManager('/vr-session', 'GET');
  };
  getVrSubsessionById = (id) => {
    return this.requestXPManager(`/vr-session/${id}/vr-sub-session`, 'GET');
  };
  getVrFurtherSubSessionById = (id, subSessionId) => {
    return this.requestXPManager(
      `/vr-session/${id}/vr-sub-session/${subSessionId}?x-auth-sub-experience-id=1`
    );
  };
  OTPVerificationVRSubsessions = (subSessionId, mainSessionId, data) => {
    return this.requestXPManager(
      `/agenda/generate-verification-code?vr-session-id=${mainSessionId}&vr-sub-session-id=${subSessionId}`,
      'POST',
      data
    );
  };
}
