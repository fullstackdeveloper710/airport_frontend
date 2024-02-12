import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Image, ImageFit } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { useMultipleMapImage, multipleMapImages } from 'utils/eventVariables';
import { useI18n } from 'i18n/i18n.context';
import { ReactComponent as A380 } from '../../../../assets/images/iXR__A380.svg'
import { ReactComponent as HubL1 } from '../../../../assets/images/iXR__Hub_L1.svg'
import { ReactComponent as HubL2 } from '../../../../assets/images/iXR__Hub_L2.svg'
import { LabelLayer } from './LabelLayer';

export const MapImage = ({ level }) => {
  const {
    components: {
      panels: {
        main: { map: ls },
      },
    },
  } = useLabelsSchema();
  const { currentRoom } = useSelector((state) => state.user);
  const [mapImage, setMapImage] = useState(null);
  const { event } = useSelector((state) => state);
  const { activeLocale } = useI18n();

  useEffect(() => {
    setImage();
  }, [currentRoom]);

  const setImage = () => {
    if (!currentRoom || !useMultipleMapImage) {
      return setMapImage(null);
    }
    const currentMap = currentRoom.split('.')[1];

    if (multipleMapImages?.hasOwnProperty(currentMap)) {
      setMapImage(() => multipleMapImages[currentMap]);
    } else if (multipleMapImages?.hasOwnProperty('en')) {
      setMapImage(
        multipleMapImages[
        multipleMapImages.hasOwnProperty(activeLocale) ? activeLocale : 'en'
        ]
      );
    } else {
      setMapImage(null);
    }
  };

  return (
    <div className='content'>
      <div className="map layer" id='map'>
        {
          level === 1 ?
            <HubL1 /> :
            level === 2 ?
              <HubL2 /> : <A380 />
        }
      </div>
      <div className="label layer" id='label'>
        <LabelLayer level={level} />
      </div>
    </div>
  );
};

export default MapImage;
