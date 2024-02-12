import React from 'react';
import HeaderNavigators from '../../HeaderNavigators';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const JumeriahStep3 = ({ open, setOpen, jumeriahSteps, setJumeriahSteps, shouldNext, shouldPrev }) => {
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();

  return (
    <div className="tourSplash layout-2">
      <HeaderNavigators
        open={open}
        setOpen={setOpen}
        step={jumeriahSteps}
        setStep={setJumeriahSteps}
        shouldPrev={shouldPrev}
        shouldNext={shouldNext}
      />
      <div className="tourSplash__Overlay overlay-3"></div>
      <div className="layoutWrap2">
        <div
          style={{
            backgroundImage: `url(${ls.tour1.screen4.tourPlaces.jumeriahSteps.step3.image})`,
            backgroundSize: 'cover',
            opacity: 0.8
          }}
          className="layoutWrap2__img"
        ></div>
        <div className="layoutWrap2__caption">
          <div className="layoutWrap2__center">
            <h2 className="layoutWrap2__title fadeInfadeOut">
              {ls.tour1.screen4.tourPlaces.jumeriahSteps.step3.title}
            </h2>

            <div className="layoutWrap2__caption__text">
              <p className="fadeInfadeOut">
                {ls.tour1.screen4.tourPlaces.jumeriahSteps.step3.content1}
              </p>

              <p className="fadeInfadeOut">
                {ls.tour1.screen4.tourPlaces.jumeriahSteps.step3.content2}
              </p>
              <p className="fadeInfadeOut">
                {ls.tour1.screen4.tourPlaces.jumeriahSteps.step3.content3}
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className='jumeriahOverlayText jumeriahOverlayText_step3 fadeInLeft'>
        RAMADAN
      </p>
    </div>
  );
};

export default JumeriahStep3;
