import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Avatar from 'assets/images/avatar.png';
import { Label } from '@fluentui/react/lib/Label';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { GAME_STAGE_AVATAR } from 'constants/game';
import { useDeviceMedia } from 'hooks/useDeviceMedia';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { enableVOG } from 'utils/eventVariables';

const ListItem = ({ id, isGod }) => {
  const {
    components: {
      panels: {
        game: { godList: ls },
      },
    },
  } = useLabelsSchema();
  const { list } = useSelector((state) => state.usersList);
  const { audioEnabled } = useSelector((state) => state.agora);
  const [speaker, setSpeaker] = useState(null);

  const { isDesktop, isTablet } = useDeviceMedia();

  const avatarWidth = isDesktop ? '74px' : isTablet ? '74px' : '34px';
  useEffect(() => {
    const user = list.some((v) => v.eventUserId === id);
    user &&
      (() => {
        setSpeaker(user);
      })();
  }, [list]);

  return (
    speaker && (
      <div className="god-user-item">
        <div className="avatar-section">
          <img src={Avatar} width={avatarWidth} />
          {!(isGod && !audioEnabled) && (
            <Fragment>
              <div className="ring" />
              <div className="ring ring2" />
              <div className="ring ring3" />
            </Fragment>
          )}
          {isGod && !audioEnabled && (
            <span className="mute-icon">
              <FontIcon
                aria-label="MicOff"
                iconName="MicOff"
                style={{ fontSize: 20 }}
              />
            </span>
          )}
        </div>
        <div className="context">
          <Label className="speaker">
            {speaker.firstName} {speaker.lastName}
          </Label>
          <Label className="action">{ls.announcementText}</Label>
        </div>
      </div>
    )
  );
};

export const GodList = () => {
  const { godUserList, godEnabled } = useSelector((state) => state.agora);
  const { current } = useSelector((state) => state.user);
  const game = useSelector((state) => state.game);

  const is_in_avatar = game?.stage === GAME_STAGE_AVATAR;

  const { viewportType } = useDeviceMedia();

  if (is_in_avatar || !game.enteredIntoEvent || !enableVOG) return null;

  return (
    <div className={`god-user-list`} data-comp-god-list-viewport={viewportType}>
      {godEnabled && <ListItem id={current.eventUserId} isGod />}
      {godUserList
        .filter((v) => v !== current.eventUserId)
        .map((user) => {
          return <ListItem id={user} key={user} />;
        })}
    </div>
  );
};
