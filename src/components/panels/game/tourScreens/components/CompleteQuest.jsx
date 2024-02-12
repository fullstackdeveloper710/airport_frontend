import React from 'react';
import HeaderNavigators from '../HeaderNavigators';
import InitiateTourScreen from './InitiateTourScreen';
const CompleteQuest = ({
  open,
  setOpen,
  step,
  setStep,
  icon,
  footer,
  title,
  secondaryText,
  setStepHandler,
}) => {
  return (
    <div className="tourSplash">
      <div className="tourSplash__Overlay blur"></div>
      <HeaderNavigators
        open={open}
        step={step}
        setStep={setStep}
        setOpen={setOpen}
        showNextButton={true}
        setStepHandler={setStepHandler}
      />
      <InitiateTourScreen>
        <div className="tourSplash__completed">
          <h1>Quest Complete</h1>
          <div className="tourSplash__item tourSplashChecked">
            <div className="tourSplash__item__top">
              <figure className="tourSplash__figure">
                <span>{icon}</span>
              </figure>
              <p>{secondaryText}</p>
            </div>
            <div className="tourSplash__item__bottom">
              <h2>{title}</h2>
            </div>
            <div className="tourSplash__headbtns__group">{footer}</div>
          </div>
        </div>
      </InitiateTourScreen>
    </div>
  );
};

export default CompleteQuest;
