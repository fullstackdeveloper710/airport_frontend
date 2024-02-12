import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import config from 'config';
import history from 'utils/history';
import createRootReducer from './reducers';
const logger = createLogger({
  /** if specified this function will be called before each action is processed with this middleware.
   * Into array can be inserted an action.type as string for being rendered the logging
   */
  // predicate: (getState, action) =>
  //   [
  //     'game/setGameStage',
  //     'game/pushGameStage',
  //     'game/restoreGameStage',
  //   ].indexOf(action.type) > -1,

  /** takes a Boolean or optionally a Function that receives `getState` function for accessing current store state and `action`
   * object as parameters. Returns `true` if the log group should be collapsed, `false` otherwise.
   * (getState, action) => action.type != 'game/setGameStage',
   */
  collapsed: true,
  /**print the duration of each action? */
  duration: false,
  /** print the timestamp with each action? */
  timestamp: true,
  /** should the logger catch, log, and re-throw errors? */
  logErrors: true,
  /** (alpha) show diff between states? */
  diff: false,
});
const devMode = config.env === 'development';

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false,
});

const middleware = [...customizedMiddleware, routerMiddleware(history)];

if (devMode) {
  middleware.push(logger);
}

const store = configureStore({
  devTools: true,
  reducer: createRootReducer(history),
  middleware,
});

export default store;
