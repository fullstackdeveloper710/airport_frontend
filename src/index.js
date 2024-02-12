import 'utils/theme';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from 'routes';
import * as serviceWorker from 'serviceWorker';
import I18n from './i18n/i18n';
import { AuthProvider } from 'hooks/useAuth';
import store from 'store';

ReactDOM.render(
  <React.Fragment>
    <I18n>
      <Suspense fallback={<div>Error! Please refresh the page</div>}>
        <Provider store={store}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Provider>
      </Suspense>
    </I18n>
  </React.Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
