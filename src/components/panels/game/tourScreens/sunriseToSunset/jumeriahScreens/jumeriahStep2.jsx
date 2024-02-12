import React from 'react';
import HeaderNavigators from '../../HeaderNavigators';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import InitiateTourScreen from '../../components/InitiateTourScreen';

const JumeriahStep2 = ({ open, setOpen, jumeriahSteps, setJumeriahSteps, shouldNext, shouldPrev }) => {
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();

  return (
    <div
      style={{
        backgroundImage: `url(${ls.tour1.screen4.tourPlaces.jumeriahSteps.step2.image})`,
        backgroundSize: 'cover',
      }}
      className="tourSplash flex-left tourSplash-layout-1"
    >
      <HeaderNavigators
        open={open}
        setOpen={setOpen}
        step={jumeriahSteps}
        setStep={setJumeriahSteps}
        shouldPrev={shouldPrev}
        shouldNext={shouldNext}
      />

      <div className="tourSplash__Overlay overlay-2"></div>

      <InitiateTourScreen>
        <div style={{marginTop: "13%"}} className="landmark">
          <div className="landmark__top">
            <p className="fadeInfadeOut">
              {ls.tour1.screen4.tourPlaces.jumeriahSteps.step2.content}
            </p>
            
          </div>
        </div>
      </InitiateTourScreen>
      <p className='jumeriahOverlayText jumeriahOverlayText_step2 fadeInLeft'>
        RELIGION
      </p>
    </div>
  );
};

export default JumeriahStep2;
