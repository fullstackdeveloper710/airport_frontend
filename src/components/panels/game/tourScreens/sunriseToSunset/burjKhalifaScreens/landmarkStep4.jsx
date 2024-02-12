import React, { useEffect, useState } from 'react';
import EmiratesRedBadge from 'assets/images/icons/EmiratesRedBadge';
import HeaderNavigators from '../../HeaderNavigators';
import FooterButton from '../../components/FooterButon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import VirtualQuestService from 'services/virtualQuestService';
const LandmarkStep4 = ({ open, steps, setStep, setOpen , subId }) => {
  const [showContent, setShowContent] = useState(false)
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();
  const virtaulQuest = new VirtualQuestService();
  const UpdateVirtualSubQuestStatus = async () => {
    if (subId) await virtaulQuest.updateVirtualSubQuestResource(1, subId);
  };

  useEffect(() => {
    if(!ls.tour1.screen4.tourPlaces.burjKhalifaSteps.landmark4.isCurrGame){
      setShowContent(true)
    }else{
      setShowContent(false)
      if (window.gameClient) {
        window.gameClient.on('step-reached', showContentForGame);
      }
    }
  }, [window.gameClient]);

  useEffect(() => {
    UpdateVirtualSubQuestStatus();
  }, [subId]);

  const showContentForGame = () => {
    setShowContent(true)
  }

  return (
    <div
      className="tourSplash tourSplashBottom"
      // style={{ background: `url(/arAssets/images/guideBg.jpg)` }}
    >
      <div className="tourSplash__Overlay overlay-1"></div>
      <HeaderNavigators
        open={open}
        step={steps}
        setStep={setStep}
        setOpen={setOpen}
        shouldPrev={ls.tour1.screen4.tourPlaces.burjKhalifaSteps.landmark4.shouldPrev}
        shouldNext={ls.tour1.screen4.tourPlaces.burjKhalifaSteps.landmark4.shouldNext}
      />
      {
        showContent && (
          <div className="tourSplash__inner">
            <div className="emiratesLogo">
              <EmiratesRedBadge />
            </div>
            <div className="tourSplash__headbtns">
              <h2 className="tourSplash__heading1">
                {ls.tour1.screen4.tourPlaces.burjKhalifaSteps.landmark4.title}
              </h2>
              <div className="tourSplash__headbtns__group">
                <FooterButton
                  // onClick={''}
                  title={
                    ls.tour1.screen4.tourPlaces.burjKhalifaSteps.landmark4
                      .footerButtonLeft
                  }
                />
                <FooterButton
                  // onClick={''}
                  title={
                    ls.tour1.screen4.tourPlaces.burjKhalifaSteps.landmark4
                      .footerButtonRight
                  }
                />
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};
export default LandmarkStep4;
