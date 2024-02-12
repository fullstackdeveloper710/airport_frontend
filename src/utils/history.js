import { createBrowserHistory as createHistory } from 'history';

const history = createHistory();

history.listen((location) =>
  window.dispatchEvent(new Event('hashchange', { location }))
);

export default history;
