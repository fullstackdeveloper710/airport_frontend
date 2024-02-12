import React, { useEffect } from 'react';
import HeaderNavigators from '../../HeaderNavigators';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import VirtualQuestService from 'services/virtualQuestService';
const JumeriahStep5 = ({
  open,
  setOpen,
  jumeriahSteps,
  setJumeriahSteps,
  subId,
  shouldNext,
  shouldPrev
}) => {
  const virtaulQuest = new VirtualQuestService();

  const UpdateVirtualSubQuestStatus = async () => {
    if (subId) await virtaulQuest.updateVirtualSubQuestResource(1, subId);
  };

  useEffect(() => {
    UpdateVirtualSubQuestStatus();
  }, [subId]);

  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();

  return (
    <div className="tourSplash layout4">
      <HeaderNavigators
        open={open}
        setOpen={setOpen}
        step={jumeriahSteps}
        setStep={setJumeriahSteps}
        shouldNext={shouldNext}
        shouldPrev={shouldPrev}
      />
      <div className="layoutWrap">
        <div className="layoutWrap__left">
          <div className="layoutWrap__scroll">
            <div className="layoutWrap__row">
              <div className="layoutWrap__col">
                <div className="layoutWrap__item">
                  <h2 className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.title1}
                  </h2>
                  <p className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.content1}
                  </p>
                </div>
                <div className="layoutWrap__item">
                  <h2 className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.title2}
                  </h2>
                  <p className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.content2}
                  </p>
                </div>
              </div>
              <div className="layoutWrap__col">
                <div className="layoutWrap__item">
                  <h2 className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.title3}
                  </h2>
                  <p className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.content3}
                  </p>
                </div>
                <div className="layoutWrap__item">
                  <h2 className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.title4}
                  </h2>
                  <p className="fadeInfadeOut">
                    {ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.content4}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="layoutWrap__right" style={{ backgroundImage: `url(${ls.tour1.screen4.tourPlaces.jumeriahSteps.step5.image})`, backgroundSize: 'cover' }}>
          <div className="culturalItem">
            <h2 className="fadeInfadeOut">Cultural norms</h2>
            <p className="fadeInfadeOut">
              Dubai's cultural fabric is woven with its religious heritage. To
              deeply engage with this captivating city, here are essential
              insights for an enriching journey. Remember, these guidelines
              offer a glimpse into the diverse customs across Islamic countries.
              Embrace the adventure, respect the local culture, and let Dubai
              surprise you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JumeriahStep5;
