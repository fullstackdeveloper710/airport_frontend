import React from 'react';
import HeaderNavigators from '../../HeaderNavigators';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const JumeriahStep4 = ({ open, setOpen, jumeriahSteps, setJumeriahSteps, shouldNext, shouldPrev }) => {
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();

  return (
    <div className="tourSplash layout-3">
      <HeaderNavigators
        open={open}
        setOpen={setOpen}
        step={jumeriahSteps}
        setStep={setJumeriahSteps}
        shouldPrev={shouldPrev}
        shouldNext={shouldNext}
      />
      <div className="tourSplash__Overlay overlay-3"></div>
      <div className="layoutWrap3">
        <div className="layoutWrap3__img">
          <img style={{opacity: 0.8}} src={ls.tour1.screen4.tourPlaces.jumeriahSteps.step4.image} />
        </div>
        <div className="layoutWrap3__caption">
          <div className="layoutWrap3__center">
            <div className="layoutWrap3__text">
              <h2 className="fadeInfadeOut">
                {ls.tour1.screen4.tourPlaces.jumeriahSteps.step4.title1}
              </h2>
              <p className="fadeInfadeOut">
                {ls.tour1.screen4.tourPlaces.jumeriahSteps.step4.content1}
              </p>
            </div>
            <div className="layoutWrap3__text">
              <h2 className="fadeInfadeOut">
                {ls.tour1.screen4.tourPlaces.jumeriahSteps.step4.title2}
              </h2>
              <p className="fadeInfadeOut">
                {ls.tour1.screen4.tourPlaces.jumeriahSteps.step4.content2}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className='jumeriahOverlayText jumeriahOverlayText_step4 fadeInLeft'>
        CULTURAL NORMS
      </p>
    </div>
  );
};
export default JumeriahStep4;
