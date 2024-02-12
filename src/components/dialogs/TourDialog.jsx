import { Dialog } from 'office-ui-fabric-react';
import React, { useEffect, useState } from 'react';
import Screen1 from 'components/panels/game/tourScreens/WelcomeNote';
import Screen3 from 'components/panels/game/tourScreens/MainTourScreen';
import Screen4 from 'components/panels/game/tourScreens/sunriseToSunset';
import SelectTour from 'components/panels/game/tourScreens/uniteAndThrive';
import TourList from 'components/panels/game/tourScreens/vitalRoutes';
import RouteList from 'components/panels/game/tourScreens/gatewayToWonder';
const TourDialog = ({ open, setOpen }) => {
  const [setSplash] = useState(true);
  const [step, setStep] = useState(1);
  const [stepType, setStepType] = useState('');
  const [uniteAndThriveStep, setUniteAndThriveStep] = useState(0);
  const [vitalRoutesSteps, setVitalRoutesSteps] = useState(0);
  const [gatewayRoutes, setGatewayRoutes] = useState(0);

  const [
    checkUserStatusForCongratulationScreen,
    setCheckUserStatusForCongratulationScreen,
  ] = useState(false);

  const [showContinueButton, setShowContinueButton] = useState(false);

  const handleReturnToHub = () => {
    if (window.gameClient) {
      window.gameClient.returnToHubFromVQ();
      setOpen(false);
    } else {
      console.log('Please try again');
    }
  };

  const setStepHandler = (step) => {
    setStep(step);
  };
  const setStepHandlerUnite = (step) => {
    setUniteAndThriveStep(step);
  };
  const setStepHandlerVital = (step) => {
    setVitalRoutesSteps(step);
  };
  const setStepHandlerGatewayToWonder = (step) => {
    setGatewayRoutes(step);
  };

  const TourPackagesScreen = () => {
    return (
      <Screen3
        open={open}
        step={step}
        setStep={setStep}
        setOpen={setOpen}
        setStepType={setStepType}
        stepType={stepType}
        uniteAndThriveStep={uniteAndThriveStep}
        vitalRoutesSteps={vitalRoutesSteps}
        setVitalRoutesSteps={setVitalRoutesSteps}
        setGatewayRoutes={setGatewayRoutes}
        setUniteAndThriveStep={setUniteAndThriveStep}
        setStepHandler={setStepHandler}
        setCheckUserStatusForCongratulationScreen={
          setCheckUserStatusForCongratulationScreen
        }
        setShowContinueButton={setShowContinueButton}
      />
    );
  };
  const sunriseToSunsetScreens = (screenStep) => {
    switch (screenStep) {
      case 1:
        return (
          <Screen1
            open={open}
            step={step}
            setStep={setStep}
            setOpen={setOpen}
          />
        );
      case 3:
        return <TourPackagesScreen />;
      case 4:
        return (
          <Screen4
            open={open}
            step={step}
            setStep={setStep}
            setStepHandler={setStepHandler}
            setOpen={setOpen}
            setUniteAndThriveStep={setUniteAndThriveStep}
            setStepType={setStepType}
            setCheckUserStatusForCongratulationScreen={
              setCheckUserStatusForCongratulationScreen
            }
            checkUserStatusForCongratulationScreen={checkUserStatusForCongratulationScreen}
            setShowContinueButton={setShowContinueButton}
            showContinueButton={showContinueButton}
          />
        );
    }
  };
  const uniteAndThriveScreens = (currentStep) => {
    switch (currentStep) {
      case 1:
        return (
          <Screen1
            open={open}
            step={step}
            setStep={setStep}
            setOpen={setOpen}
          />
        );
      case 3:
        return <TourPackagesScreen />;
      case 4:
        return (
          <SelectTour
            open={open}
            setOpen={setOpen}
            setStepHandler={setStepHandlerUnite}
            setStep={setStep}
            step={step}
            uniteAndThriveStep={uniteAndThriveStep}
            setUniteAndThriveStep={setUniteAndThriveStep}
            setStepType={setStepType}
            setVitalRoutesSteps={setVitalRoutesSteps}
            setCheckUserStatusForCongratulationScreen={
              setCheckUserStatusForCongratulationScreen
            }
            checkUserStatusForCongratulationScreen={checkUserStatusForCongratulationScreen}
            showContinueButton={showContinueButton}
            setShowContinueButton={setShowContinueButton}
          />
        );

      default:
        return <div></div>;
    }
  };
  const vitalRoutesScreens = (vitalRoutesSteps) => {
    switch (vitalRoutesSteps) {
      case 1:
        return (
          <Screen1
            open={open}
            step={step}
            setStep={setStep}
            setOpen={setOpen}
          />
        );
      case 3:
        return <TourPackagesScreen />;
      case 4:
        return (
          <TourList
            open={open}
            setOpen={setOpen}
            setVitalRoutesSteps={setVitalRoutesSteps}
            vitalRoutesSteps={vitalRoutesSteps}
            setStep={setStep}
            step={step}
            setStepHandler={setStepHandlerVital}
            setStepType={setStepType}
            setGatewayRoutes={setGatewayRoutes}
            setCheckUserStatusForCongratulationScreen={
              setCheckUserStatusForCongratulationScreen
            }
            checkUserStatusForCongratulationScreen={checkUserStatusForCongratulationScreen}
            showContinueButton={showContinueButton}
            setShowContinueButton={setShowContinueButton}
          />
        );
    }
  };
  const gatewayToWonderScreens = (gatewayRoutesSteps) => {
    switch (gatewayRoutesSteps) {
      case 1:
        return (
          <Screen1
            open={open}
            step={step}
            setStep={setStep}
            setOpen={setOpen}
          />
        );
      case 3:
        return <TourPackagesScreen />;
      case 4:
        return (
          <RouteList
            open={open}
            setOpen={setOpen}
            setGatewayRoutes={setGatewayRoutes}
            gatewayRoutes={gatewayRoutes}
            checkUserStatusForCongratulationScreen={
              checkUserStatusForCongratulationScreen
            }
            setStep={setStep}
            step={step}
            setStepHandler={setStepHandlerGatewayToWonder}
            setCheckUserStatusForCongratulationScreen={
              setCheckUserStatusForCongratulationScreen
            }
          
            showContinueButton={showContinueButton}
            setShowContinueButton={setShowContinueButton}
          />
        );
    }
  };
  return (
    <Dialog
      dialogContentProps={{ titleProps: { style: { display: 'none' } } }}
      minWidth={'100%'}
      hidden={!open}
      onDismiss={handleReturnToHub}
      modalProps={{ containerClassName: 'tourSplashModal' }}
    >
      {stepType === '' || stepType === 'Sunrise to sunset'
        ? sunriseToSunsetScreens(step)
        : stepType === 'Unite and thrive'
        ? uniteAndThriveScreens(uniteAndThriveStep)
        : stepType === 'Vital routes'
        ? vitalRoutesScreens(vitalRoutesSteps)
        : stepType === 'Gateway to wonder'
        ? gatewayToWonderScreens(gatewayRoutes)
        : ''}
    </Dialog>
  );
};

export default TourDialog;
