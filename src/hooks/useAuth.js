import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setKeycloak, setAuthenticated } from 'store/reducers/user';
import { StorageService } from 'services';
import { setXpToken } from 'store/reducers/user';
import Keycloak from 'keycloak-js';
import config from 'config';

const AuthContext = createContext();
const storageService = new StorageService()

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { keycloak, authenticated } = useSelector((store) => store.user);
  const dispatch = useDispatch()
  let tokenExpiryInterval

  //Keycloak set token expiry interval to get new access token on expiry
  useEffect(() => {
    if(keycloak && authenticated){
      if(!tokenExpiryInterval){
        tokenExpiryInterval = setInterval(checkTokenExpiration, 1000);
      }
    }else{
      if(tokenExpiryInterval){
        clearInterval(tokenExpiryInterval)
      }
    }
  }, [keycloak, authenticated])

  //Keycloak initialization onload
  useEffect(() => {
    const keycloakInstance = new Keycloak({
      url: config.keycloak.url,
      realm: config.keycloak.realm,
      clientId: config.keycloak.clientId,
    });

    keycloakInstance
      .init({ onLoad: 'login-required', redirectUri: window.location.origin })
      .then((authenticated) => {
        dispatch(setKeycloak(keycloakInstance));
        dispatch(setAuthenticated(authenticated));
        if(keycloakInstance.token){
          storageService.setXPToken(keycloakInstance.token)
          dispatch(setXpToken(keycloakInstance.token))
        }
      })
      .catch((err) => {
        console.log('KEYCLOAK INIT ERROR', err);
        keycloakLogout()
      });
  }, []);

  //Check for access token expiry every minute
  const checkTokenExpiration = () => {
    if (keycloak && keycloak.token) {
      const currentTime = Math.floor(new Date().getTime() / 1000);
      if (currentTime > keycloak.tokenParsed.exp) {
        keycloak.updateToken().then((refreshed) => {
          if(refreshed){
            dispatch(setKeycloak(keycloak));
            storageService.setXPToken(keycloak.token)
            dispatch(setXpToken(keycloak.token))
          }else{
            keycloakLogout()
          }
        }).catch((error) => {
          console.log("Error receiving new access token", error)
          keycloakLogout()
        })
      }
    }
  };

  //Logout from Keycloak session
  const keycloakLogout = () => {
    const token = storageService.getXPToken();
    if (keycloak) {
      keycloak.logout();
    }
    if (token){
      storageService.clearToken()
    }
    dispatch(setKeycloak(null));
    dispatch(setAuthenticated(false));
    dispatch(setXpToken(null))
  };

  return (
    <AuthContext.Provider value={{ keycloak, authenticated, keycloakLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
