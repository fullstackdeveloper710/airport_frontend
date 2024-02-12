export default class StorageService {
  getToken = () => {
    return JSON.parse(localStorage.getItem('cms-token'));
  };

  setToken = (tokenInfo) => {
    localStorage.setItem('cms-token', JSON.stringify(tokenInfo));
  };

  clearToken = () => {
    localStorage.removeItem('cms-token');
  };

  //XP token
  getXPToken = () => {
    return localStorage.getItem('xp-token');
  };

  setXPToken = (jwtToken) => {
    localStorage.setItem('xp-token', jwtToken);
  };

  clearXPToken = () => {
    localStorage.removeItem('xp-token');
  };
}
