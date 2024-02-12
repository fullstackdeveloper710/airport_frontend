import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PrimaryButton } from 'office-ui-fabric-react';
import { openPanel } from 'store/reducers/panel';
import { generateUuid, getMapData } from 'utils/common';
import { setMessage } from 'store/reducers/message';
import { useDeviceMedia } from 'hooks/useDeviceMedia';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { mapButtonsInSecondaryFont } from 'utils/eventVariables';
import MapImage from './MapImage';
import { BorderedButton } from 'components/common/BorderedButton';
import { useEffect } from 'react';

export const Map = () => {
  const {
    components: {
      panels: {
        main: { map: ls },
      },
    },
  } = useLabelsSchema();
  const { buttonsTextSize, buttonsMargin } = useDeviceMedia();
  const dispatch = useDispatch();
  // const game = useSelector((store) => store.game);
  const [childMap, setChildMap] = useState(null);
  const [level, setLevel] = useState(1);
  const { event } = useSelector((state) => state);
  const { roles } = useSelector((state) => state.user.current);
  const is_presenter = roles.includes('ROLE_PRESENTER');

  const map = getMapData(event.map);
  console.log(map)

  const buttonStyles = useMemo(
    () => ({
      root: {
        borderColor: 'none',
        color: 'var(--sr-color-white)',
        background: 'var(--sr-color-primary)',
        transition: '0.3s',
        margin: buttonsMargin,
        textTransform: 'uppercase',
        fontSize: buttonsTextSize,
      },
      rootHovered: {
        borderColor: 'var(--sr-color-white)',
        background: 'var(--sr-color-black)',
      },
      label: {
        fontWeight: 300,
        fontFamily: mapButtonsInSecondaryFont
          ? 'var(--sr-font-secondary)'
          : 'var(--sr-font-primary)',
      },
    }),
    [buttonsMargin, buttonsTextSize]
  );

  const onClickLevel = async (level) => {
    // if (
    //   !level.children.length &&
    //   level.roomName === game.currentRoom?.nextMapName
    // ) {
    //   return;
    // }
    if (level.children && level.children.length) {
      setChildMap(level.children);
    } else {
      if (window.gameClient) {
        if (window.followRequestActive && !is_presenter) {
          return dispatch(
            setMessage({
              message: ls.errorsCantTeleport,
            })
          );
        }
        if (window.agoraScreenShare) {
          window.agoraScreenShare.stopScreen();
        }
        if (level.defaultRoomTypeForMap === 'Meeting') {
          const meetingRoomName = `${level.roomName}.Default.${generateUuid()}`;
          window.gameClient.teleportUserToMeetingRoom(meetingRoomName);
        } else {
          window.gameClient.joinLevelNew(level.roomName, level.groupName);
        }
        window.gameClient.userGotIntoVTDFromMap =
          level.roomName === 'VolcanoIsland';
        dispatch(openPanel(false));
      }
    }
  };

  const onCancel = () => {
    setChildMap(null);
  };

  return (
    <div className="panelContainer ms-Grid" dir="ltr">
      <MapImage level={level} />
      <div className="buttonSection">
        <BorderedButton active={level === 1} onClick={() => { setLevel(1) }}>Level 1</BorderedButton>
        <BorderedButton active={level === 2} onClick={() => { setLevel(2) }}>Level 2</BorderedButton>
        <BorderedButton active={level === 3} onClick={() => { setLevel(3) }}>A380</BorderedButton>
      </div>
    </div >
  );
};
