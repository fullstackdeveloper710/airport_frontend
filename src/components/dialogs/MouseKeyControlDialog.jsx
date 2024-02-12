import React from 'react';
import {
  IconButton,
} from 'office-ui-fabric-react';
import KeyboardImg from 'assets/images/KeyboardMouseControls.svg';
import MouseImg from 'assets/images/MouseControls.svg'
import JoystickImg from 'assets/images/Joystick.svg'

import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { useEffect, useState } from 'react';

export const MouseKeyControlDialog = ({ open, onDismiss }) => {
  const {
    components: {
      dialogs: { mouseKeyControlDialog: ls },
    },
  } = useLabelsSchema();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowWidth(window.innerWidth)
    })
  }, [])

  console.log(windowWidth)

  return open ?
    <div className="mouseKeyControlDialog roundPanel">
      {
        windowWidth > 900 ?
          <>
            <IconButton className=''
              iconProps={{ iconName: 'Clear' }}
              onClick={onDismiss}
            />
            <img className='mouseIcon' src={KeyboardImg} alt={ls.mouseIconAlt} />
            <img className='mouseIcon' src={MouseImg} alt={ls.mouseIconAlt} />
          </> :
          <>
            <IconButton className=''
              iconProps={{ iconName: 'Clear' }}
              onClick={onDismiss}
            />
            <img className="mouseIcon" src={JoystickImg} alt="" />
          </>
      }
    </div>
    : null;
};
