import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import {useAuth} from 'hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { Loading } from 'components/panels/game/loading';
import {
  login,
  xpManagerLogin
} from 'store/reducers/user';
import {
  GAME_STAGE_ENTERING
} from 'constants/game';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
} from 'utils/eventVariables';
import config from 'config';
import { setGameStage } from 'store/reducers/game';
import webSocketClient from 'lib/webSocketClient';
import { setMessage } from 'store/reducers/message';
import { uniqueNamesGenerator, names, NumberDictionary } from 'unique-names-generator';

const hardcodedFacilitatorLogins = {
  "VIPIN": {
    "email": "serviceUserF@service.com",
    "password": "SERVICE@SURREAL",
    "useDevServices": false
  },
  "TARANG": {
    "email": "serviceUserF2@service.com",
    "password": "SERVICE@SURREAL",
    "useDevServices": false
  },
  "SAINAM": {
    "email": "serviceUserF3@service.com",
    "password": "SERVICE@SURREAL",
    "useDevServices": false
  },
}

const customConfig = {
  length: 2,
  separator: '',
  style: 'capital'
};

export default () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const { authenticated, keycloak } = useAuth();

  const handleLogin = (loginType) => {
    const ADEmail = keycloak?.idTokenParsed?.email
    if(ADEmail){
      const extractedXpUserId = ADEmail.split('@')[0]
      if(loginType === "ATTENDEE"){
        const numberDictionary = NumberDictionary.generate({ min: 1, max: 99999 });
        const dictionaries = [names, numberDictionary]
        const shortName = uniqueNamesGenerator({dictionaries, customConfig});
        dispatch(xpManagerLogin({
          first_name : shortName,
          event_id : config.event.id
        }, {
          xpUserId: extractedXpUserId,
          xpMainExperienceId: config.experience.mainExperienceId,
          xpEmail: ADEmail,
          xpToken: keycloak.token
        }))
      }else{
        dispatch(login(hardcodedFacilitatorLogins["SAINAM"], {
          xpUserId: extractedXpUserId,
          xpMainExperienceId: config.experience.mainExperienceId,
          xpEmail: ADEmail
        }));
      }
    }
  }

  useEffect(() => {
    if (user.current && authenticated) {
      if (user.current.id) {
        if (
          (!(enableCameraAccess || enableMicAccess) &&
            !user?.current?.roles?.includes('ROLE_PRESENTER')) ||
          (!(enablePresenterCameraAccess || enablePresenterMicAccess) &&
            user?.current?.roles?.includes('ROLE_PRESENTER'))
        ) {
          (async () => {
            dispatch(setGameStage(GAME_STAGE_ENTERING));
            const response = await webSocketClient.startConnection();
            if (response === 'open') {
              window.enter_world_clicked = true;
              history.push('/');
            } else {
              dispatch(
                setMessage({
                  message: 'There is a Problem with your internet',
                })
              );
            }
          })();
        } else {
          if(user.current.consentStatus){
            if(!user.current.consentStatus["tncStatus"]){
              history.push('/terms');
            }else if(!user.current.consentStatus["privacyStatus"]){
              history.push('/privacy');
            }else if(!user.current.consentStatus["legalStatus"]){
              history.push('/legal');
            }else{
              history.push('/welcome');
            }
          }else{
            console.log("Could not get current consent status for user")
          }
        }
      }
    }else {
      window.enter_world_clicked = false
    }
    // eslint-disable-next-line
  }, [user.current]);

  useEffect(()=>{
    if(authenticated && !user.current){
      handleLogin("FACILITATOR")
    }else{
      window.enter_world_clicked = false
      console.log("User not logged in....")
    }
  },[authenticated])

  return (
    <div id="player-control">
      <Loading />
    </div>
  )
};
