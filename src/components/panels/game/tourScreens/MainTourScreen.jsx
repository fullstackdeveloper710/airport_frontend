import React, { useEffect, useState } from 'react';
import HeaderNavigators from './HeaderNavigators';
import SunsetIcon from 'assets/images/icons/sunsetIcon';
import TourPackage from './components/TourPackages';
import ThriveIcon from 'assets/images/icons/thriveIcon';
import RoutesIcon from 'assets/images/icons/routesIcon';
import GatewayIcon from 'assets/images/icons/gatewayIcon';
import InitiateTourScreen from './components/InitiateTourScreen';
import VirtualQuestService from 'services/virtualQuestService';
import { Spinner, SpinnerSize } from '@fluentui/react';
const Screen3 = ({
  open,
  step,
  setStep,
  setOpen,
  setStepType,
  stepType,
  uniteAndThriveStep,
  setUniteAndThriveStep,
  setVitalRoutesSteps,
  setGatewayRoutes,
  setStepHandler,
  setCheckUserStatusForCongratulationScreen,
  setShowContinueButton,
}) => {
  const spinnerStyles = {
    root: {
      margin: '0 1rem',
    },
    circle: {
      borderWidth: 2,
      width: 30,
      height: 30,
    },
  };
  const [virtualMainQuests, setVirtualMainQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  let virtualMainQuest = new VirtualQuestService();
  const GetAllVirtualMainQuests = async () => {
    const response = await virtualMainQuest.getAllMainVirtualQuest();
    console.log(response, 'response');
    // if (response.every((x) => x.userVirtualSubQuestStatus)) {
    //   setCheckUserStatusForCongratulationScreen(false);
    // } else {
    //   setCheckUserStatusForCongratulationScreen(true);
    // }
   const lastFlag = response.filter((x) => x.userVirtualMainQuestStatus === false)
   console.log("lastfALG",lastFlag)
    if (
      lastFlag.length === 1
    ) {
      setCheckUserStatusForCongratulationScreen(true);
    }
    // if (response.some((x) => !x.userVirtualMainQuestStatus)) {
    //   setShowContinueButton(true);
    // } else {
    //   setShowContinueButton(false);
    // }
    if (response.length > 0) {
      setVirtualMainQuests(response);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAllVirtualMainQuests();
  }, []);
  return (
    <div className="tourSplash">
      {loading ? (
        <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
      ) : (
        <>
          <div className="tourSplash__Overlay blur" />
          <HeaderNavigators
            open={open}
            step={step}
            setStep={setStep}
            setOpen={setOpen}
            showNextButton={true}
            tourPackages={true}
            stepType={stepType}
            setStepHandler={setStepHandler}
          />
          <InitiateTourScreen>
            {virtualMainQuests.map((quest, index) => {
              return (
                <TourPackage
                  step={step}
                  setStep={setStep}
                  key={index}
                  tours={virtualMainQuests}
                  title={quest.title}
                  icon={
                    index === 0 ? (
                      <SunsetIcon />
                    ) : index === 1 ? (
                      <ThriveIcon />
                    ) : index === 2 ? (
                      <RoutesIcon />
                    ) : index === 3 ? (
                      <GatewayIcon />
                    ) : (
                      ''
                    )
                  }
                  secondaryText={quest.name}
                  setUniteAndThriveStep={setUniteAndThriveStep}
                  uniteAndThriveStep={uniteAndThriveStep}
                  setStepType={setStepType}
                  isCompleted={quest.userVirtualMainQuestStatus}
                  stepType={stepType}
                  setVitalRoutesSteps={setVitalRoutesSteps}
                  setGatewayRoutes={setGatewayRoutes}
                />
              );
            })}
          </InitiateTourScreen>
        </>
      )}
    </div>
  );
};

export default Screen3;
