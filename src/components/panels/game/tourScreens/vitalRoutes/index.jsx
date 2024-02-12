import React, { useEffect, useState } from 'react';
import RoutesIcon from 'assets/images/icons/routesIcon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import HeaderNavigators from '../HeaderNavigators';
import Landmark1 from '../sunriseToSunset/burjKhalifaScreens/landmarkStep1';
import CheckStepComplete from '../components/CheckStepComplete';
import CompleteQuest from '../components/CompleteQuest';
import FooterButton from '../components/FooterButon';
import InitiateTourScreen from '../components/InitiateTourScreen';
import CheckedTour from '../components/CheckedTour';
import VirtualQuestService from 'services/virtualQuestService';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { getImages } from 'utils/getVirtualQuestsImages';
import ScanQR from '../ScanQR';
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
const TourList = ({
  open,
  setOpen,
  setVitalRoutesSteps,
  vitalRoutesSteps,
  setStepHandler,
  setStepType,
  setGatewayRoutes,
  setCheckUserStatusForCongratulationScreen,
  checkUserStatusForCongratulationScreen,
  setShowContinueButton,
  showContinueButton,
}) => {
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();
  let tourPlaces = ls.tour3.tourPlaces;
  const [subId, setSubId] = useState('');
  const [quests, setQuests] = useState([]);
  const [isShowContinueButton, setIsShowContinueButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const virtualMainQuest = new VirtualQuestService();

  const GetVitalRoutesData = async () => {
    setLoading(true);
    const response = await virtualMainQuest.getAllSubQuestByUserId(3);
    if (
      response.filter((x) => x.userVirtualSubQuestStatus === false).length === 1
    ) {
      setIsShowContinueButton(true);
    }
    if (response.length > 0) {
      setQuests(
        response.map((x) => {
          return { ...x, landmarkImage: getImages(x.title) };
        })
      );
    }
    setLoading(false);
  };
  const [stepType, setStepTitle] = useState('');
  const [worldCitySteps, setWorldCitySteps] = useState(0);
  const [travelSteps, setTravelSteps] = useState(0);
  const [metroSteps, setMetroSteps] = useState(0);
  const [busSteps, setBusSteps] = useState(0);
  const [taxiAndRideSteps, setTaxiAndRideSteps] = useState(0);
  const [marineSteps, setMarineSteps] = useState(0);
  const [driveSteps, setDriveSteps] = useState(0);
  const [bikesAndScooterSteps, setBikesAndScooterSteps] = useState(0);

  useEffect(() => {
    GetVitalRoutesData();
  }, []);

  useEffect(() => {
    if (
      worldCitySteps === 0 &&
      travelSteps === 0 &&
      metroSteps === 0 &&
      busSteps === 0 &&
      taxiAndRideSteps === 0 &&
      marineSteps === 0 &&
      driveSteps === 0 &&
      bikesAndScooterSteps === 0
    ) {
      if (window.gameClient) {
        window.gameClient.setVQMenu();
      } else {
        console.log('Game sequence could not go to initial state');
      }
    }
  }, [
    worldCitySteps,
    travelSteps,
    metroSteps,
    busSteps,
    taxiAndRideSteps,
    marineSteps,
    driveSteps,
    bikesAndScooterSteps,
  ]);
  const CheckStepAndTour = ({ steps, setStep, onClick }) => {
    return (
      <CompleteQuest
        open={open}
        setStepHandler={setStepHandler}
        setOpen={setOpen}
        step={steps}
        setStep={setStep}
        title={'Vital Routes'}
        icon={<RoutesIcon />}
        secondaryText={'Access and wellbeing'}
        footer={
          isShowContinueButton === false ||
          checkUserStatusForCongratulationScreen === false ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <FooterButton
                onClick={() => setStepHandler(3)}
                title={'Return to quest menu'}
              />
              <FooterButton
                onClick={() => {
                  setStepType('Gateway to wonder');
                  setGatewayRoutes(4);
                }}
                title={'Next quest'}
              />
            </div>
          ) : (
            <FooterButton onClick={onClick} title={'Continue'} />
          )
        }
      />
    );
  };
  const handleClickTour = (title) => {
    if (title === quests[0].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("WorldsHappiestCity");
      // }
      setStepTitle(`World's happiest city`);
      setWorldCitySteps(1);
    } else if (title === quests[1].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("TravelCompanion");
      // }
      setStepTitle(`Travel companion`);
      setTravelSteps(1);
    } else if (title === quests[2].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Metro");
      // }
      setStepTitle(`Metro`);
      setMetroSteps(1);
    } else if (title === quests[3].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Bus");
      // }
      setStepTitle(`Bus`);
      setBusSteps(1);
    } else if (title === quests[4].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Taxi");
      // }
      setTaxiAndRideSteps(1);
      setStepTitle(`Taxi and ride hail`);
    } else if (title === quests[5].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("MarineTransport");
      // }
      setStepTitle(`Marine transport`);
      setMarineSteps(1);
    } else if (title === quests[6].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Drive");
      // }
      setStepTitle(`Drive`);
      setDriveSteps(1);
    } else if (title === quests[7].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Bike");
      // }
      setStepTitle(`Bikes and scooter`);
      setBikesAndScooterSteps(1);
    }
  };
  const renderScreenSteps = (
    worldCitySteps,
    travelSteps,
    busSteps,
    metroSteps,
    taxiAndRideSteps,
    marineSteps,
    driveSteps,
    bikesAndScooterSteps
  ) => {
    if (stepType === `World's happiest city`) {
      switch (worldCitySteps) {
        case 1:
        case 2:
          return (
            <Landmark1
              completeStepsCheck={'happiestCity'}
              open={open}
              setOpen={setOpen}
              mainQuestId={3}
              subId={subId}
              steps={worldCitySteps}
              setStep={setWorldCitySteps}
              title={tourPlaces.worldCitySteps[`step${worldCitySteps}`].title}
              content={
                tourPlaces.worldCitySteps[`step${worldCitySteps}`].content
              }
              footerButtonText={
                tourPlaces.worldCitySteps[`step${worldCitySteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.worldCitySteps[`step${worldCitySteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.worldCitySteps[`step${worldCitySteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.worldCitySteps[`step${worldCitySteps}`].shouldNext
              }
              video={tourPlaces.worldCitySteps[`step${worldCitySteps}`].video}
              imageUrl={
                tourPlaces.worldCitySteps[`step${worldCitySteps}`].image
              }
            />
          );
        case 3: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={worldCitySteps}
              setStep={setWorldCitySteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setWorldCitySteps(4); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 4:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              step={worldCitySteps}
              setStep={setWorldCitySteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 5:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              step={worldCitySteps}
              setStep={setWorldCitySteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    } else if (stepType === 'Travel companion') {
      switch (travelSteps) {
        case 1:
          return (
            <Landmark1
              completeStepsCheck={'travel'}
              open={open}
              mainQuestId={3}
              subId={subId}
              setOpen={setOpen}
              isRenderedQRCode={true}
              steps={travelSteps}
              setStep={setTravelSteps}
              title={tourPlaces.travelCompanion[`step${travelSteps}`].title}
              content={tourPlaces.travelCompanion[`step${travelSteps}`].content}
              footerButtonText={
                tourPlaces.travelCompanion[`step${travelSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.travelCompanion[`step${travelSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.travelCompanion[`step${travelSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.travelCompanion[`step${travelSteps}`].shouldNext
              }
              video={tourPlaces.travelCompanion[`step${travelSteps}`].video}
              imageUrl={tourPlaces.travelCompanion[`step${travelSteps}`].image}
            />
          );

        case 2: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={travelSteps}
              setStep={setTravelSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setTravelSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={travelSteps}
              setStep={setTravelSteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 4:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={travelSteps}
              setStep={setTravelSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    } else if (stepType === 'Metro') {
      switch (metroSteps) {
        case 1:
          return (
            <Landmark1
              completeStepsCheck={'metro'}
              open={open}
              setOpen={setOpen}
              steps={metroSteps}
              mainQuestId={3}
              subId={subId}
              setStep={setMetroSteps}
              title={tourPlaces.metroSteps[`step${metroSteps}`].title}
              content={tourPlaces.metroSteps[`step${metroSteps}`].content}
              footerButtonText={
                tourPlaces.metroSteps[`step${metroSteps}`].footerButtonText
              }
              shouldPrev={tourPlaces.metroSteps[`step${metroSteps}`].shouldPrev}
              isCurrGame={tourPlaces.metroSteps[`step${metroSteps}`].isCurrGame}
              shouldNext={tourPlaces.metroSteps[`step${metroSteps}`].shouldNext}
              video={tourPlaces.metroSteps[`step${metroSteps}`].video}
              imageUrl={tourPlaces.metroSteps[`step${metroSteps}`].image}
            />
          );
        case 2: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={metroSteps}
              setStep={setMetroSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setMetroSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={metroSteps}
              setStep={setMetroSteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 4:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={metroSteps}
              setStep={setMetroSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    } else if (stepType === 'Bus') {
      switch (busSteps) {
        case 1:
          return (
            <Landmark1
              completeStepsCheck={'bus'}
              open={open}
              setOpen={setOpen}
              mainQuestId={3}
              subId={subId}
              steps={busSteps}
              setStep={setBusSteps}
              title={tourPlaces.busSteps[`step${busSteps}`].title}
              content={tourPlaces.busSteps[`step${busSteps}`].content}
              footerButtonText={
                tourPlaces.busSteps[`step${busSteps}`].footerButtonText
              }
              shouldPrev={tourPlaces.busSteps[`step${busSteps}`].shouldPrev}
              isCurrGame={tourPlaces.busSteps[`step${busSteps}`].isCurrGame}
              shouldNext={tourPlaces.busSteps[`step${busSteps}`].shouldNext}
              video={tourPlaces.busSteps[`step${busSteps}`].video}
              imageUrl={tourPlaces.busSteps[`step${busSteps}`].image}
            />
          );

        case 2: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={busSteps}
              setStep={setBusSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setBusSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={busSteps}
              setStep={setBusSteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 4:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={busSteps}
              setStep={setBusSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    } else if (stepType === 'Taxi and ride hail') {
      switch (taxiAndRideSteps) {
        case 1:
          return (
            <Landmark1
              completeStepsCheck={'taxi'}
              open={open}
              setOpen={setOpen}
              isRenderTwoQRCodes={true}
              mainQuestId={3}
              subId={subId}
              steps={taxiAndRideSteps}
              QRCodeLeft={tourPlaces.taxiAndRideHailSteps.step1.QRTitleLeft}
              QRCodeRight={tourPlaces.taxiAndRideHailSteps.step1.QRTitleRight}
              setStep={setTaxiAndRideSteps}
              title={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`].title
              }
              content={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`]
                  .content
              }
              footerButtonText={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`].video
              }
              imageUrl={
                tourPlaces.taxiAndRideHailSteps[`step${taxiAndRideSteps}`].image
              }
            />
          );

        case 2: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              step={taxiAndRideSteps}
              setStep={setTaxiAndRideSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setTaxiAndRideSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={taxiAndRideSteps}
              setStep={setTaxiAndRideSteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 4:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={taxiAndRideSteps}
              setStep={setTaxiAndRideSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    } else if (stepType === 'Marine transport') {
      switch (marineSteps) {
        case 1:
          return (
            <Landmark1
              completeStepsCheck={'marine'}
              open={open}
              setOpen={setOpen}
              mainQuestId={3}
              subId={subId}
              steps={marineSteps}
              setStep={setMarineSteps}
              title={
                tourPlaces.marineTransportSteps[`step${marineSteps}`].title
              }
              content={
                tourPlaces.marineTransportSteps[`step${marineSteps}`].content
              }
              footerButtonText={
                tourPlaces.marineTransportSteps[`step${marineSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.marineTransportSteps[`step${marineSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.marineTransportSteps[`step${marineSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.marineTransportSteps[`step${marineSteps}`].shouldNext
              }
              video={
                tourPlaces.marineTransportSteps[`step${marineSteps}`].video
              }
              imageUrl={
                tourPlaces.marineTransportSteps[`step${marineSteps}`].image
              }
            />
          );
        case 2: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              step={marineSteps}
              setStep={setMarineSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setMarineSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }
        case 3:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={marineSteps}
              setStep={setMarineSteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 4:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={marineSteps}
              setStep={setMarineSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    } else if (stepType === 'Drive') {
      switch (driveSteps) {
        case 1:
          return (
            <Landmark1
              completeStepsCheck={'drive'}
              open={open}
              setOpen={setOpen}
              steps={driveSteps}
              setStep={setDriveSteps}
              mainQuestId={3}
              subId={subId}
              title={tourPlaces.driveSteps[`step${driveSteps}`].title}
              content={tourPlaces.driveSteps[`step${driveSteps}`].content}
              footerButtonText={
                tourPlaces.driveSteps[`step${driveSteps}`].footerButtonText
              }
              shouldPrev={tourPlaces.driveSteps[`step${driveSteps}`].shouldPrev}
              isCurrGame={tourPlaces.driveSteps[`step${driveSteps}`].isCurrGame}
              shouldNext={tourPlaces.driveSteps[`step${driveSteps}`].shouldNext}
              video={tourPlaces.driveSteps[`step${driveSteps}`].video}
              imageUrl={tourPlaces.driveSteps[`step${driveSteps}`].image}
            />
          );
        case 2: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              step={driveSteps}
              setStep={setDriveSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDriveSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }
        case 3:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={driveSteps}
              setStep={setDriveSteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 4:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={driveSteps}
              setStep={setDriveSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    } else if (stepType === 'Bikes and scooter') {
      switch (bikesAndScooterSteps) {
        case 1:
          return (
            <Landmark1
              completeStepsCheck={'bikes'}
              open={open}
              setOpen={setOpen}
              steps={bikesAndScooterSteps}
              setStep={setBikesAndScooterSteps}
              mainQuestId={3}
              subId={subId}
              title={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .title
              }
              content={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .content
              }
              footerButtonText={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .video
              }
              imageUrl={
                tourPlaces.bikesAndSkooterSteps[`step${bikesAndScooterSteps}`]
                  .image
              }
            />
          );
        case 2: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              step={bikesAndScooterSteps}
              setStep={setBikesAndScooterSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setBikesAndScooterSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={bikesAndScooterSteps}
              setStep={setBikesAndScooterSteps}
              open={open}
              title={'Congratulations'}
              content={
                <>
                  <p>
                    You are now prepared for your new life in Dubai. We
                    encourage you to revisit the Discovery Quest at anytime.
                  </p>
                  <p>
                    Click continue to unlock your reward and celebrate this
                    achievement with us.
                  </p>
                </>
              }
              footerButtonText={'Continue'}
              // shouldPrev={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldPrev
              // }
              // isCurrGame={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .isCurrGame
              // }
              // shouldNext={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
              //     .shouldNext
              // }
              // video={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              // }
              // imageUrl={
              //   tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
              // }
            />
          );

        case 4:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={bikesAndScooterSteps}
              setStep={setBikesAndScooterSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
  };
  return worldCitySteps === 0 &&
    travelSteps === 0 &&
    metroSteps === 0 &&
    busSteps === 0 &&
    taxiAndRideSteps === 0 &&
    marineSteps === 0 &&
    driveSteps === 0 &&
    bikesAndScooterSteps === 0 ? (
    <div className="tourSplash  tourSplash__col__6">
      {loading ? (
        <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
      ) : (
        <>
          <div className="tourSplash__Overlay blur"></div>
          <HeaderNavigators
            open={open}
            step={vitalRoutesSteps}
            setStep={setVitalRoutesSteps}
            setOpen={setOpen}
            showNextButton={true}
            setStepHandler={setStepHandler}
          />
          <InitiateTourScreen>
            <div className="desktopView__selectTour">
              <div className="tourBlock">
                <h2 className="tourBlock__heading">{ls.tour3.heading}</h2>
                <div className="tourBlock__row">
                  {quests.map((x, i) => {
                    return (
                      <CheckedTour
                        key={i}
                        isCompleted={x.userVirtualSubQuestStatus}
                        onClick={() => {
                          handleClickTour(x.title);
                          setSubId(x.id);
                        }}
                        landmarkImage={x.landmarkImage}
                        title={x.title}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </InitiateTourScreen>
        </>
      )}
    </div>
  ) : (
    renderScreenSteps(
      worldCitySteps,
      travelSteps,
      busSteps,
      metroSteps,
      taxiAndRideSteps,
      marineSteps,
      driveSteps,
      bikesAndScooterSteps
    )
  );
};

export default TourList;
