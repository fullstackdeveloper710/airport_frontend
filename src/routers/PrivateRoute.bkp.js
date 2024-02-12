import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { KickoutTransitionScreen } from 'components/panels/game/kickoutTransitionScreen';
import {
  GAME_STAGE_ERROR,
  GAME_STAGE_KICKED_OUT_TRANSITION,
} from 'constants/game';
import { Error } from 'components/panels/game/error';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const user = useSelector((state) => state.user);
  const game = useSelector((state) => state.game);

  return (
    <Route
      {...rest}
      render={(props) =>
        user.current && user.current.id ? (
          <Component {...props} />
        ) : game.stage === GAME_STAGE_KICKED_OUT_TRANSITION ? (
          <KickoutTransitionScreen />
        ) : game.stage === GAME_STAGE_ERROR ? (
          <Error />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default PrivateRoute;
