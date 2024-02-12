import React, {useState, useEffect} from 'react';
import HeaderNavigators from '../../HeaderNavigators';
import StepAccordion from '../../components/StepAccordion';
import FooterButton from '../../components/FooterButon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import InitiateTourScreen from '../../components/InitiateTourScreen';

const JumeriahStep1 = ({ open, setOpen, jumeriahSteps, setJumeriahSteps, shouldNext, shouldPrev, isCurrGame }) => {
  const [showContent, setShowContent] = useState(false)
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();

  useEffect(() => {
    if(!isCurrGame){
      setShowContent(true)
    }else{
      setShowContent(false)
      if (window.gameClient) {
        window.gameClient.on('step-reached', showContentForGame);
      }
    }
  }, [window.gameClient, isCurrGame]);

  const showContentForGame = () => {
    setShowContent(true)
  }

  return (
    <div className="tourSplash flex-left">
      {showContent && (
        <div className="tourSplash__Overlay overlay-1" />
      )}
      <HeaderNavigators
        open={open}
        setOpen={setOpen}
        step={jumeriahSteps}
        setStep={setJumeriahSteps}
        shouldPrev={shouldPrev}
        shouldNext={shouldNext}
      />

      <InitiateTourScreen>
        <div className="landmark">
          <div className="landmark__top">
            <StepAccordion
              title={ls.tour1.screen4.tourPlaces.jumeriahSteps.step1.title}
              showContent={showContent}
            >
              {ls.tour1.screen4.tourPlaces.jumeriahSteps.step1.content}
            </StepAccordion>
          </div>
          {showContent && (<div className="landmark__bottom">
            <FooterButton
              onClick={() => {
                if(shouldNext && window.gameClient){
                  window.gameClient.nextStep();
                }else{
                  console.log("Game sequence could not go to the next step")
                }
                setJumeriahSteps((count) => count + 1)
              }}
              title={
                ls.tour1.screen4.tourPlaces.jumeriahSteps.step1.footerButtonText
              }
            />
          </div>)}
        </div>
      </InitiateTourScreen>
    </div>
  );
};

export default JumeriahStep1;
