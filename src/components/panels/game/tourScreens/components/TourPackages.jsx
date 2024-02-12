import LockIcon from 'assets/images/icons/LockIcon';
import React from 'react';
const TourPackage = ({
  setStep,
  icon,
  title,
  secondaryText,
  setUniteAndThriveStep,
  setStepType,
  setVitalRoutesSteps,
  setGatewayRoutes,
  tours,
  isCompleted,
}) => {
  const handleNavigateScreens = () => {
    if (title === tours[0].title) {
      setStep(4);
      setStepType('Sunrise to sunset');
    } else if (title === tours[1].title) {
      setUniteAndThriveStep(4);
      setStepType('Unite and thrive');
    } else if (title === tours[2].title) {
      setVitalRoutesSteps(4);
      setStepType('Vital routes');
    } else if (title === tours[3].title) {
      setGatewayRoutes(4);
      setStepType('Gateway to wonder');
    }
  };
  // return isLocked ? (
  //   <div className="tourSplash__item lockedItem">
  //     <div className="tourSplash__item__top">
  //       <figure className="tourSplash__figure">
  //         <span>{icon}</span>
  //         <span className="lockIcon">
  //           <LockIcon />
  //         </span>
  //       </figure>
  //       <p>{ls.tour1.screen3.tourPackages.secondaryText(secondaryText)}</p>
  //     </div>
  //     <div className="tourSplash__item__bottom">
  //       <h2>{ls.tour1.screen3.tourPackages.title(title)}</h2>
  //     </div>
  //   </div>
  // ) : (
  return (
    <div
      className={
        isCompleted ? 'tourSplash__item tourSplashChecked' : 'tourSplash__item'
      }
      onClick={handleNavigateScreens}
    >
      <div className="tourSplash__item__top">
        <figure className="tourSplash__figure">
          <span>{icon}</span>
        </figure>
        <p>{secondaryText}</p>
      </div>
      <div className="tourSplash__item__bottom">
        <h2>{title}</h2>
      </div>
    </div>
  );
};

export default TourPackage;
