import React from 'react';
import ArrowLeft from 'assets/images/icons/Arraow-left';
import CloseIcon from 'assets/images/icons/Close';
const HeaderNavigators = ({
  setStep,
  setOpen,
  showNextButton,
  setStepHandler,
  tourPackages,
  shouldPrev,
  shouldNext,
  step,
}) => {
  const handleReturnToHub = () => {
    if (window.gameClient) {
      window.gameClient.returnToHubFromVQ();
      setOpen(false);
    } else {
      console.log('Game sequence could not go to the HUB');
    }
  };
  return (
    <div className="tourSplashHeader">
      <div className="tourSplashHeader__Left">
        <>
          <button
            onClick={() => {
              if (showNextButton && tourPackages === undefined) {
                if (window.gameClient) {
                  window.gameClient.setVQMenu();
                } else {
                  console.log('Game sequence could not go to initial state');
                }
                setStepHandler(3);
              } else {
                if (shouldPrev && window.gameClient) {
                  window.gameClient.previousStep();
                } else {
                  console.log(
                    'Game sequence could not go to the previous step'
                  );
                }
                setStep((count) => count - 1);
              }
              if (tourPackages && showNextButton) {
                setStepHandler(1);
              }
            }}
            className="stepBtn btnLeft"
          >
            <ArrowLeft /> Back
          </button>
          {showNextButton ? null : (
            <button
              onClick={() => {
                if (shouldNext && window.gameClient) {
                  window.gameClient.nextStep();
                } else {
                  console.log('Game sequence could not go to the next step');
                }
                setStep((count) => count + 1);
              }}
              className="stepBtn btnRight"
            >
              Next <ArrowLeft />
            </button>
          )}
        </>
      </div>
      <div className="tourSplashHeader__close">
        <button className="stepBtn btnClose" onClick={handleReturnToHub}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export default HeaderNavigators;
