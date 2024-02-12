import { setPlayerVisiblity } from "store/reducers/screenShare";
import store from "../store";

export const toggleScreenSharePlayerHandler = (
  state,
  toggleGameView = false
) => {
  if (toggleGameView) {
    window?.gameClient?.emitUIInteraction({
      method: 'ToggleSmartScreenView',
      payload: {
        state,
      },
    });
  }
  toggleScreenSharePlayer(state);
  store.dispatch(setPlayerVisiblity(state));
};

const toggleScreenSharePlayer = (state) => {
  const player = document.querySelector('#screen-share-player');
  if (state) {
    player.style.display = 'block';
    player?.classList.add('hide');
    setTimeout(() => {
      player?.classList.add('visible');
    }, 900);
  } else {
    player?.classList.remove('visible');
    setTimeout(() => {
      player?.classList.remove('hide');
      player.style.display = 'none';
    }, 750);
  }
};
