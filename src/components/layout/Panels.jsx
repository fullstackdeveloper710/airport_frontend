import React, { useEffect } from 'react';

import { ExtraPanel, GamePanel, MainPanel } from '../panels';
import { ClassroomPanel } from 'components/panels/sidepanel/classroomPanels';
import { useSelector } from 'react-redux';

export const Panels = () => {
  const { game } = useSelector(state => state)
  return (
    <>
      <MainPanel />
      <ExtraPanel />
      <GamePanel />
      {
        game?.currentRoom?.nextMapName.includes('Classroom') && <ClassroomPanel />
      }
    </>
  );
};

