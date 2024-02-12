import React, { useEffect } from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { setUserOfflineStatus } from 'store/reducers/user';
import { Placeholder } from '../placeholder';
import { useDispatch } from 'react-redux';
import { setEnteredIntoEvent, setGameStage } from 'store/reducers/game';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { enableVOG } from 'utils/eventVariables';
import { GAME_STAGE_ERROR } from 'constants/game';

export const Error = () => {
  const {
    components: {
      panels: {
        game: { error: ls },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();

  // const [calledRestart, setCalledStart] = useState(false);

  const handleClickReload = () => {
    // if (window.gameClient && !calledRestart) {
    //   window.gameClient.restartGame();
    //   setCalledStart(true);
    // }
    window.location.reload();
  };

  const removeAgoraClient = () => {
    if (window.agoraClientPrimary) {
      window.agoraClientPrimary.disconnect();
    }

    if (enableVOG && window.agoraClientSecondary) {
      window.agoraClientSecondary.disconnect();
    }

    if (window.agoraClientThird) {
      window.agoraClientThird.disconnect();
    }
  };

  const setUserOffline = () => {
    dispatch(setUserOfflineStatus());
  };

  useEffect(() => {
    dispatch(setEnteredIntoEvent(false));
    removeAgoraClient();
    dispatch(setGameStage(GAME_STAGE_ERROR));
    setUserOffline();
  }, []);

  return (
    <div className="fullScreenPanel ms-h-100 ms-Flex ms-Flex-align-items-center ms-Flex-justify-content-center">
      <Placeholder icon="Sad" text={ls.snagText}>
        <div className="ms-m-2">
          <PrimaryButton onClick={handleClickReload}>
            {ls.reloadText}
          </PrimaryButton>
        </div>
      </Placeholder>
    </div>
  );
};
