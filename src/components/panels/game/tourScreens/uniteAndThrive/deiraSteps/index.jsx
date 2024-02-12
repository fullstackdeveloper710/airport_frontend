import HeaderNavigators from '../../HeaderNavigators';
import FooterButton from '../../components/FooterButon';
import Location1 from 'assets/images/icons/Location1';
import Car from 'assets/images/icons/Car';
import Train from 'assets/images/icons/Train';
import Menus from '../../components/Menus';
import { useEffect, useState } from 'react';
import InitiateTourScreen from '../../components/InitiateTourScreen';
import VirtualQuestService from 'services/virtualQuestService';
const DeiraSteps1 = ({
  title,
  content,
  open,
  setOpen,
  steps,
  setStep,
  menus,
  footerButtonText,
  mainQuestId,
  subId,
  shouldPrev,
  isCurrGame,
  shouldNext,
  imageUrl
}) => {
  const [showContent, setShowContent] = useState(false)
  let virtualMainQuest = new VirtualQuestService();

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

  useEffect(() => {
    (async () => {
      if (subId && mainQuestId) {
        await virtualMainQuest.updateVirtualSubQuestResource(
          mainQuestId,
          subId
        );
      }
    })();
  }, [mainQuestId, subId]);

  const showContentForGame = () => {
    setShowContent(true)
  }

  return (
    <div 
      className="tourSplash flex-left"
      style={imageUrl && { background: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {showContent && (
        <div className="tourSplash__Overlay overlay-1"></div>
      )}
      <HeaderNavigators
        open={open}
        setOpen={setOpen}
        step={steps}
        setStep={setStep}
        shouldPrev={shouldPrev}
        shouldNext={shouldNext}
      />
      <InitiateTourScreen>
        <div className="textLayout">
          <div className="textLayout__heading">
            <h2 className="fadeInfadeOut">{title}</h2>
          </div>
          {showContent && (<div className="textLayout__body">
            <div className="textLayout__topItemWrap fadeInfadeOut">
              <Menus menus={menus} />
            </div>
            <p className="fadeInfadeOut2">{content}</p>
            <div className="distanceBlock fadeInfadeOut3">
              <div className="distanceBlock__left">
                <h3 className="fadeInfadeOut">Emirates HQ</h3>
              </div>
              <div className="distanceBlock__middle"></div>
              <div className="distanceBlock__right">
                <h3 className="fadeInfadeOut">
                  <Location1 />9 km
                </h3>
                <h3 className="fadeInfadeOut">
                  <Car />
                  19 km
                </h3>
                <h3 className="fadeInfadeOut">
                  <Train />
                  44 km
                </h3>
              </div>
            </div>
          </div>)}
          {(footerButtonText && showContent) ? (
            <FooterButton
              onClick={() => setStep((count) => count + 1)}
              title={footerButtonText}
            />
          ) : null}
        </div>
      </InitiateTourScreen>
    </div>
  );
};

export default DeiraSteps1;
