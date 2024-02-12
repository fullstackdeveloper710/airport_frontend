import React, { useEffect, useState } from 'react';
import HeaderNavigators from '../../HeaderNavigators';
import StepAccordion from '../../components/StepAccordion';
import FooterButton from '../../components/FooterButon';
import QRCode from 'assets/images/icons/QRCode';
import InitiateTourScreen from '../../components/InitiateTourScreen';
import VirtualQuestService from 'services/virtualQuestService';
const Landmark1 = ({
  open,
  steps,
  setStep,
  setOpen,
  title,
  content,
  footerButtonText,
  isRenderedQRCode,
  isRenderTwoQRCodes,
  QRCodeLeft,
  QRCodeRight,
  subId,
  mainQuestId,
  shouldPrev,
  isCurrGame,
  shouldNext,
  video,
  imageUrl,
  checkUserStatusForCongratulationScreen,
}) => {
  const [showContent, setShowContent] = useState(false);
  let virtualMainQuest = new VirtualQuestService();
  useEffect(() => {
    if (!isCurrGame) {
      setShowContent(true);
    } else {
      setShowContent(false);
      if (window.gameClient) {
        window.gameClient.on('step-reached', showContentForGame);
      }
    }
  }, [window.gameClient, isCurrGame]);

  useEffect(() => {
    (async () => {
      if ((subId, mainQuestId))
        await virtualMainQuest.updateVirtualSubQuestResource(
          mainQuestId,
          subId
        );
    })();
  }, [subId, mainQuestId]);
  const showContentForGame = () => {
    setShowContent(true);
  };
  return (
    <>
      {video && (
        <video className="tour__video" src={video} autoPlay={true} loop />
      )}
      <div
        className="tourSplash flex-left"
        style={
          imageUrl && {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        }
      >
        {showContent && <div className="tourSplash__Overlay overlay-1" />}
        <HeaderNavigators
          open={open}
          step={steps}
          setStep={setStep}
          setOpen={setOpen}
          shouldPrev={shouldPrev}
          shouldNext={shouldNext}
        />
        <InitiateTourScreen>
          <div className="landmark">
            <div className="landmark__top">
              <StepAccordion
                showContent={showContent}
                isContent={!content ? false : true}
                title={title}
              >
                {content}
                {<br />}
                {isRenderedQRCode ? (
                  <div style={{ marginTop: 20 }}>
                    <QRCode />
                  </div>
                ) : isRenderTwoQRCodes ? (
                  <div
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      gap: '30%',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                      }}
                    >
                      <span>{QRCodeLeft}</span>
                      <div style={{ marginTop: 20 }}>
                        <QRCode />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                      }}
                    >
                      <span>{QRCodeRight}</span>
                      <div style={{ marginTop: 20 }}>
                        <QRCode />
                      </div>
                    </div>
                  </div>
                ) : null}
              </StepAccordion>
            </div>
            {showContent && (
              <div className="landmark__bottom fadeInfadeOut3 opacity0">
                {!footerButtonText ? null : (
                  <FooterButton
                    onClick={() => {
                      if (shouldNext && window.gameClient) {
                        window.gameClient.nextStep();
                      } else {
                        console.log(
                          'Game sequence could not go to the next step'
                        );
                      }
                      setStep((count) => count + 1);
                    }}
                    title={footerButtonText}
                  />
                )}
              </div>
            )}
          </div>
        </InitiateTourScreen>
      </div>
    </>
  );
};
export default Landmark1;
