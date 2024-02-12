import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import loadable from '@loadable/component';
import { MessageBarType } from 'office-ui-fabric-react';

// Routers
import PrivateRoute from 'routers/PrivateRoute';
import PublicRoute from 'routers/PublicRoute';
import history from 'utils/history';
import { removeMessage, showMessage } from 'store/reducers/message';
import config from './config';
import { Loading } from 'components/panels/game/loading';
import { OrientationListener } from 'components/layout';
import manager from 'lib/agora/AgoraClientMgr';
import { stopChatServices } from 'utils/stopChatServices';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import {useAuth} from 'hooks/useAuth';
import {
  enableCameraAccess,
  enableMicAccess,
  enablePresenterCameraAccess,
  enablePresenterMicAccess,
} from 'utils/eventVariables';
import { logout } from 'store/reducers/user';
import { NotificationMessage } from 'components/common/NotificationMessage';

//Pages
const AsyncMain = loadable(() => import('pages/Main'), {
  fallback: (
    <div id="player-control">
      <Loading />
    </div>
  ),
});
const AsyncWelcome = loadable(() => {
  if (
    !enableCameraAccess &&
    !enableMicAccess &&
    !enablePresenterCameraAccess &&
    !enablePresenterMicAccess
  ) {
    return <Redirect to="/" />;
  }
  return import('pages/welcome');
});
const Async404 = loadable(() => import('pages/error/404'));
const AsyncLogin = loadable(() => import('pages/auth/Login'));
const AsyncPrivacy = loadable(() => import('pages/consentManagement/PrivacyPolicy'));
const AsyncTerms = loadable(() => import('pages/consentManagement/TermsAndConditions'));
const AsyncLegal = loadable(() => import('pages/consentManagement/LegalStatus'));

//Default Root Component
export default () => {
  const {
    components: {
      panels: {
        main: { mainPanel: ls },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const { message, user, game } = useSelector((state) => state);
  const { authenticated } = useAuth();
  useEffect(() => {
    document.title = config.event.title;
  }, []);

  // stop chat services
  useEffect(() => {
    if (!config.isSinglePlayer && !user.current?.id && manager.initialized) {
      (() => {
        // Setup Agora Connection
        stopChatServices();
      })();
    }
  }, [config.isSinglePlayer, user.current?.id, manager.initialized]);

  useEffect(() => {
    const onUnload = async () => {
      if (user.current?.id) {
        window?.gameClient?.logUserAction?.({
          eventName: 'LOGOUT',
          eventSpecificData: JSON.stringify({
            method: 'Closeout',
          }),
          beforeState: JSON.stringify({
            mapName: game?.currentRoom?.nextMapName,
          }),
          afterState: null,
        });
        dispatch(logout());
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      window.addEventListener('beforeunload', onUnload);
    };
  }, [user.current?.id, game?.currentRoom?.nextMapName, dispatch]);

  const clearMessage = (id) => {
    const notification = document.getElementsByClassName(`msg-${id}`);
    notification[0]?.classList.add('hide');
    setTimeout(() => {
      dispatch(removeMessage(id));
    }, 350);
  };

  useEffect(() => {
    message.messages.forEach((msg) => {
      if (msg.show !== true) {
        const notification = document.getElementsByClassName(`msg-${msg.id}`);
        notification[0]?.classList.remove('hide');
        dispatch(showMessage(msg.id));
      }
      setTimeout(() => {
        const notification = document.getElementsByClassName(`msg-${msg.id}`);
        notification[0]?.classList.add('hide');
        setTimeout(() => {
          dispatch(removeMessage(msg.id));
        }, 350);
      }, msg.timeout);
    });
  }, [message.messages]);

  return (
    <>
      <div className="notificationsContainer">
        {message.messages.map((msg) => {
          return (
            <NotificationMessage
              id={msg.id}
              messageBarType={MessageBarType[msg.type]}
              heading={msg.heading}
              isMultiline={false}
              message={msg.msg}
              buttons={msg.actions}
              show={msg.show}
              onDismiss={() => clearMessage(msg.id)}
              dismissButtonAriaLabel={ls.closeButtonAriaLabel}
            />
          );
        })}
      </div>
        <ConnectedRouter history={history}>
          <Switch>
            <PublicRoute
              exact
              path="/"
              component={
                authenticated && window.enter_world_clicked === true
                  ? AsyncMain
                  : AsyncLogin
              }
            />
            <PrivateRoute exact path="/welcome" component={AsyncWelcome} />
            <PrivateRoute exact path="/privacy" component={AsyncPrivacy} />
            <PrivateRoute exact path="/terms" component={AsyncTerms} />
            <PrivateRoute exact path="/legal" component={AsyncLegal} />
            <Route component={Async404} />
          </Switch>
        </ConnectedRouter>
      <OrientationListener />
    </>
  );
};
