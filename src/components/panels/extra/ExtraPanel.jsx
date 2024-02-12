import React from 'react';
import { useSelector } from 'react-redux';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';

import { ChannelChat, PrivateChat } from './chat';

const defaultWidth = '500px';
const leftPosition = '57px';

const panels = {
  PrivateChat: {
    headerText: 'PrivateChat',
    className: 'privateChat fullWidth',
    type: PanelType.customNear,
    size: defaultWidth,
    leftPostion: leftPosition,
    panelContent: <PrivateChat />,
  },
  Channel: {
    headerText: 'Channel',
    className: 'privateChat fullWidth',
    type: PanelType.customNear,
    size: defaultWidth,
    leftPostion: leftPosition,
    panelContent: <ChannelChat />,
  },
};

export const ExtraPanel = () => {
  const { panel } = useSelector((state) => state);

  return (
    <>
      {panel.extraPanelName && panel.isExtraOpen && (
        <>
          <div
            className="extraPanel"
            style={{
              width: panels[panel.extraPanelName].size,
              left: panels[panel.extraPanelName].leftPostion,
            }}
          >
            {panels[panel.extraPanelName].panelContent}
          </div>
        </>
      )}
    </>
  );
};
