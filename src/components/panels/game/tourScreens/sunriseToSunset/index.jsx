import React, { useEffect, useMemo, useState } from 'react';
import HeaderNavigators from '../HeaderNavigators';
import SunsetIcon from 'assets/images/icons/sunsetIcon';
import FahidiFortStep3 from './afidiFortScreens';
import JumeriahStep1 from './jumeriahScreens/jumeriahStep1';
import JumeriahStep2 from './jumeriahScreens/jumeriahStep2';
import JumeriahStep3 from './jumeriahScreens/jumeriahStep3';
import JumeriahStep4 from './jumeriahScreens/jumeriahStep4';
import JumeriahStep5 from './jumeriahScreens/jumeriahStep5';
import TourSection from '../components/TourSection';
import CheckStepComplete from '../components/CheckStepComplete';
import CompleteQuest from '../components/CompleteQuest';
import Landmark1 from './burjKhalifaScreens/landmarkStep1';
import LandmarkStep4 from './burjKhalifaScreens/landmarkStep4';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
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
const Screen4 = ({
  open,
  step,
  setStep,
  setOpen,
  setUniteAndThriveStep,
  setStepHandler,
  setStepType,
  checkUserStatusForCongratulationScreen,
  setCheckUserStatusForCongratulationScreen,
  showContinueButton,
}) => {
  const [subQuests, setAllSubQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attractionSteps, setAttractionSteps] = useState(0);
  const [beachesSteps, setBeachesSteps] = useState(0);
  const [dubaiParksSteps, setDubaiParkSteps] = useState(0);
  const [dubaiFrameSteps, setDubaiFrameSteps] = useState(0);
  const [clockTowerSteps, setClockTowerSteps] = useState(0);
  const [jumeriahSteps, setJumeriahSteps] = useState(0);
  const [fahidiFortStep, setFahidiFortStep] = useState(0);
  const [isShowContinueButton, setIsShowContinueButton] = useState(false);
  const [museumSteps, setMuseumSteps] = useState(0);
  const [uniteStep, setUniteStep] = useState(0);
  const [dubaiMallSteps, setDubaiMallSteps] = useState(0);
  const [burjKhalifaSteps, setBurjKhalifaSteps] = useState(0);
  const [contentType, setContentType] = useState('');
  const [subId, setSubId] = useState('');
  let virtualMainQuest = new VirtualQuestService();
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();

  const GetAllSubQuests = async () => {
    const response = await virtualMainQuest.getAllSubQuestByUserId(1);
    if (response.length > 0) {
      const jsonData = response.map((x) => {
        return { ...x, landmarkImage: getImages(x.title) };
      });
      const nestedData = {};
      jsonData.forEach((item) => {
        const { virtualSubQuestCategory, ...rest } = item;
        const categoryTitle = virtualSubQuestCategory.title;

        if (!nestedData[categoryTitle]) {
          nestedData[categoryTitle] = [];
        }

        nestedData[categoryTitle].push(rest);
      });
      const resultArray = Object.entries(nestedData).map(
        ([categoryTitle, items]) => ({
          categoryTitle,
          items,
        })
      );
      let emptyAray = [];
      resultArray.forEach((x) => {
        emptyAray.push(...x.items);
      });
      console.log(emptyAray, 'emptyAray');
      const lastFlag = emptyAray.filter(
        (x) => x.userVirtualSubQuestStatus === false
      );
      if (lastFlag.length === 1) {
        setIsShowContinueButton(true);
      }
      setAllSubQuests(resultArray);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAllSubQuests();
  }, []);

  useEffect(() => {
    if (
      uniteStep === 0 &&
      burjKhalifaSteps === 0 &&
      dubaiMallSteps === 0 &&
      museumSteps === 0 &&
      fahidiFortStep === 0 &&
      jumeriahSteps === 0 &&
      clockTowerSteps === 0 &&
      dubaiFrameSteps === 0 &&
      dubaiParksSteps === 0 &&
      beachesSteps === 0 &&
      attractionSteps === 0
    ) {
      if (window.gameClient) {
        window.gameClient.setVQMenu();
      } else {
        console.log('Game sequence could not go to initial state');
      }
    }
  }, [
    uniteStep,
    burjKhalifaSteps,
    dubaiMallSteps,
    museumSteps,
    fahidiFortStep,
    jumeriahSteps,
    clockTowerSteps,
    dubaiFrameSteps,
    dubaiParksSteps,
    beachesSteps,
    attractionSteps,
  ]);
  const handleLandmarkClick = (title) => {
    if (title == subQuests[0].items[0].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Burj');
      }
      setBurjKhalifaSteps(1);
      setContentType('Burj Khalifa');
    } else if (title === subQuests[0].items[1].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Fountain');
      }
      setUniteStep(1);
      setContentType('Dubai Fountain');
    } else if (title === subQuests[0].items[2].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Mall');
      }
      setDubaiMallSteps(1);
      setContentType('Dubai Mall');
    } else if (title === subQuests[0].items[3].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Museum');
      }
      setMuseumSteps(1);
      setContentType('Museum of the Future');
    } else if (title === subQuests[1].items[0].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Fort');
      }
      setFahidiFortStep(1);
      setContentType('Al Fahidi Fort');
    } else if (title === subQuests[1].items[1].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Mosque');
      }
      setJumeriahSteps(1);
      setContentType('Jumeriah Mosque');
    } else if (title === subQuests[1].items[2].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('ClockTower');
      }
      setClockTowerSteps(1);
      setContentType('Deira Clock Tower');
    } else if (title === subQuests[1].items[3].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Frame');
      }
      setDubaiFrameSteps(1);
      setContentType('Dubai Frame');
    } else if (title === subQuests[2].items[0].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Parks');
      }
      setContentType('Parks');
      setDubaiParkSteps(1);
    } else if (title === subQuests[2].items[1].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Beaches');
      }
      setBeachesSteps(1);
      setContentType('Beaches');
    } else if (title === subQuests[2].items[2].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Wonders');
      }
      setAttractionSteps(1);
      setContentType('Attractions');
    }
  };
  const [activeTab, setActiveTab] = useState(0);

  console.log(
    isShowContinueButton,
    checkUserStatusForCongratulationScreen,
    'states'
  );
  const CheckStepAndTour = ({ steps, setSteps, onClick }) => {
    return (
      <CompleteQuest
        open={open}
        setStepHandler={setStepHandler}
        setOpen={setOpen}
        step={steps}
        setStep={setSteps}
        title={'Sunrise to sunset'}
        icon={<SunsetIcon />}
        secondaryText={'Life style in dubai'}
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
                  setStepType('Unite and thrive');
                  setUniteAndThriveStep(4);
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
  let tourPlaces = ls.tour1.screen4.tourPlaces;
  const renderUniteScreens = (
    dubaiFountainSteps,
    dubaiSteps,
    museumSteps,
    fahidiFortStep,
    jumeriahSteps,
    clockTowerSteps,
    dubaiFrameSteps,
    dubaiParksSteps,
    beachesSteps,
    attractionSteps,
    burjKhalifaSteps
  ) => {
    if (contentType === 'Burj Khalifa') {
      switch (burjKhalifaSteps) {
        case 1:
        case 2:
          return (
            <Landmark1
              mainQuestId={1}
              open={open}
              steps={burjKhalifaSteps}
              setStep={setBurjKhalifaSteps}
              setOpen={setOpen}
              title={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`].title
              }
              content={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`]
                  .content
              }
              footerButtonText={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`].video
              }
              imageUrl={
                tourPlaces.burjKhalifaSteps[`landmark${burjKhalifaSteps}`].image
              }
            />
          );
        case 3:
          return (
            <LandmarkStep4
              open={open}
              steps={burjKhalifaSteps}
              setStep={setBurjKhalifaSteps}
              setOpen={setOpen}
              subId={subId}
            />
          );
        case 4: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={burjKhalifaSteps}
              setStep={setBurjKhalifaSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setBurjKhalifaSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }
        case 5:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              steps={burjKhalifaSteps}
              setStep={setBurjKhalifaSteps}
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

        case 6:
          return (
            <ScanQR
              mainQuestId={1}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={burjKhalifaSteps}
              setStep={setBurjKhalifaSteps}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Dubai Fountain') {
      switch (dubaiFountainSteps) {
        case 1:
        case 2:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'dubaiFountain'}
              open={open}
              setOpen={setOpen}
              steps={uniteStep}
              title={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`].title
              }
              content={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`]
                  .content
              }
              footerButtonText={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`]
                  .footerButtonText
              }
              setStep={setUniteStep}
              subId={subId}
              shouldPrev={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`].video
              }
              imageUrl={
                tourPlaces.dubaiFountainSteps[`step${dubaiFountainSteps}`].image
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
              steps={uniteStep}
              setStep={setUniteStep}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setUniteStep(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 4:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              steps={uniteStep}
              setStep={setUniteStep}
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
              mainQuestId={1}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={uniteStep}
              setStep={setUniteStep}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Dubai Mall') {
      switch (dubaiSteps) {
        case 1:
        case 2:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'dubaiMall'}
              open={open}
              step={dubaiMallSteps}
              subId={subId}
              setStep={setDubaiMallSteps}
              setOpen={setOpen}
              title={tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].title}
              content={tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].content}
              footerButtonText={
                tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].footerButtonText
              }
              shouldPrev={
                tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].shouldNext
              }
              video={tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].video}
              imageUrl={tourPlaces.dubaiMallSteps[`step${dubaiSteps}`].image}
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
              steps={dubaiMallSteps}
              setSteps={setDubaiMallSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDubaiMallSteps(4); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 4:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              uniteStep={dubaiMallSteps}
              setUniteStep={setDubaiMallSteps}
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
              mainQuestId={1}
              subId={subId}
              open={open}
              setOpen={setOpen}
              uniteStep={dubaiMallSteps}
              setUniteStep={setDubaiMallSteps}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Museum of the Future') {
      switch (museumSteps) {
        case 1:
        case 2:
        case 3:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'museumFuture'}
              open={open}
              step={museumSteps}
              setStep={setMuseumSteps}
              subId={subId}
              setOpen={setOpen}
              title={tourPlaces.museumSteps[`step${museumSteps}`].title}
              content={tourPlaces.museumSteps[`step${museumSteps}`].content}
              footerButtonText={
                tourPlaces.museumSteps[`step${museumSteps}`].footerButtonText
              }
              shouldPrev={
                tourPlaces.museumSteps[`step${museumSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.museumSteps[`step${museumSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.museumSteps[`step${museumSteps}`].shouldNext
              }
              video={tourPlaces.museumSteps[`step${museumSteps}`].video}
              imageUrl={tourPlaces.museumSteps[`step${museumSteps}`].image}
            />
          );
        case 4: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={museumSteps}
              setStep={setMuseumSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setMuseumSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              step={museumSteps}
              setStep={setMuseumSteps}
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

        case 6:
          return (
            <ScanQR
              mainQuestId={1}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={museumSteps}
              setStep={setMuseumSteps}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Al Fahidi Fort') {
      switch (fahidiFortStep) {
        case 1:
        case 2:
        case 3:
          return (
            <Landmark1
              mainQuestId={1}
              open={open}
              steps={fahidiFortStep}
              setStep={setFahidiFortStep}
              subId={subId}
              setOpen={setOpen}
              title={tourPlaces.afidiFortSteps[`step${fahidiFortStep}`].title}
              content={
                tourPlaces.afidiFortSteps[`step${fahidiFortStep}`].content
              }
              footerButtonText={
                tourPlaces.afidiFortSteps[`step${fahidiFortStep}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.afidiFortSteps[`step${fahidiFortStep}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.afidiFortSteps[`step${fahidiFortStep}`].isCurrGame
              }
              shouldNext={
                tourPlaces.afidiFortSteps[`step${fahidiFortStep}`].shouldNext
              }
              video={tourPlaces.afidiFortSteps[`step${fahidiFortStep}`].video}
              imageUrl={
                tourPlaces.afidiFortSteps[`step${fahidiFortStep}`].image
              }
            />
          );
        case 4:
          return (
            <FahidiFortStep3
              open={open}
              setOpen={setOpen}
              fahidiFortStep={fahidiFortStep}
              setFahidiFortStep={setFahidiFortStep}
            />
          );

        case 5: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              fahidiFortStep={fahidiFortStep}
              setFahidiFortStep={setFahidiFortStep}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setMuseumSteps(6); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 6:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              fahidiFortStep={fahidiFortStep}
              setFahidiFortStep={setFahidiFortStep}
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

        case 7:
          return (
            <ScanQR
              mainQuestId={1}
              subId={subId}
              open={open}
              setOpen={setOpen}
              fahidiFortStep={fahidiFortStep}
              setFahidiFortStep={setFahidiFortStep}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Jumeriah Mosque') {
      switch (jumeriahSteps) {
        case 1:
          return (
            <JumeriahStep1
              open={open}
              setOpen={setOpen}
              jumeriahSteps={jumeriahSteps}
              setJumeriahSteps={setJumeriahSteps}
              shouldPrev={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldNext
              }
            />
          );

        case 2:
          return (
            <JumeriahStep2
              open={open}
              setOpen={setOpen}
              jumeriahSteps={jumeriahSteps}
              setJumeriahSteps={setJumeriahSteps}
              shouldPrev={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldNext
              }
            />
          );
        case 3:
          return (
            <JumeriahStep3
              open={open}
              setOpen={setOpen}
              jumeriahSteps={jumeriahSteps}
              setJumeriahSteps={setJumeriahSteps}
              shouldPrev={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldNext
              }
            />
          );
        case 4:
          return (
            <JumeriahStep4
              open={open}
              setOpen={setOpen}
              jumeriahSteps={jumeriahSteps}
              setJumeriahSteps={setJumeriahSteps}
              shouldPrev={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldNext
              }
            />
          );
        case 5:
          return (
            <JumeriahStep5
              subId={subId}
              open={open}
              setOpen={setOpen}
              jumeriahSteps={jumeriahSteps}
              setJumeriahSteps={setJumeriahSteps}
              shouldPrev={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.jumeriahSteps[`step${jumeriahSteps}`].shouldNext
              }
            />
          );

        case 6: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={jumeriahSteps}
              setStep={setJumeriahSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setJumeriahSteps(7); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 7:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              step={jumeriahSteps}
              setStep={setJumeriahSteps}
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

        case 8:
          return (
            <ScanQR
              mainQuestId={1}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={jumeriahSteps}
              setStep={setJumeriahSteps}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Deira Clock Tower') {
      switch (clockTowerSteps) {
        case 1:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'deiraClock'}
              open={open}
              step={clockTowerSteps}
              setStep={setClockTowerSteps}
              setOpen={setOpen}
              title={tourPlaces.clockTowerSteps[`step${clockTowerSteps}`].title}
              subId={subId}
              content={
                tourPlaces.clockTowerSteps[`step${clockTowerSteps}`].content
              }
              footerButtonText={
                tourPlaces.clockTowerSteps[`step${clockTowerSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.clockTowerSteps[`step${clockTowerSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.clockTowerSteps[`step${clockTowerSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.clockTowerSteps[`step${clockTowerSteps}`].shouldNext
              }
              video={tourPlaces.clockTowerSteps[`step${clockTowerSteps}`].video}
              imageUrl={
                tourPlaces.clockTowerSteps[`step${clockTowerSteps}`].image
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
              steps={clockTowerSteps}
              setStep={setClockTowerSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setClockTowerSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              step={clockTowerSteps}
              setStep={setClockTowerSteps}
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
              mainQuestId={1}
              subId={subId}
              open={open}
              step={clockTowerSteps}
              setStep={setClockTowerSteps}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Dubai Frame') {
      switch (dubaiFrameSteps) {
        case 1:
        case 2:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'dubaiFrame'}
              open={open}
              steps={dubaiFrameSteps}
              setStep={setDubaiFrameSteps}
              subId={subId}
              setOpen={setOpen}
              title={tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`].title}
              content={
                tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`].content
              }
              footerButtonText={
                tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`].shouldNext
              }
              video={tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`].video}
              imageUrl={
                tourPlaces.dubaiFrameSteps[`step${dubaiFrameSteps}`].image
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
              steps={dubaiFrameSteps}
              setStep={setDubaiFrameSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDubaiFrameSteps(4); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 4:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              step={dubaiFrameSteps}
              setStep={setDubaiFrameSteps}
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
              mainQuestId={1}
              subId={subId}
              open={open}
              step={dubaiFrameSteps}
              setStep={setDubaiFrameSteps}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
    if (contentType === 'Parks') {
      switch (dubaiParksSteps) {
        case 1:
        case 2:
        case 3:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'parks'}
              open={open}
              step={dubaiParksSteps}
              setStep={setDubaiParkSteps}
              subId={subId}
              setOpen={setOpen}
              title={tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`].title}
              content={
                tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`].content
              }
              footerButtonText={
                tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`].shouldNext
              }
              video={tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`].video}
              imageUrl={
                tourPlaces.dubaiParksSteps[`step${dubaiParksSteps}`].image
              }
            />
          );

        case 4: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepAndTour
              steps={dubaiParksSteps}
              setStep={setDubaiParkSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDubaiParkSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              step={dubaiParksSteps}
              setStep={setDubaiParkSteps}
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

        case 6:
          return (
            <ScanQR
              mainQuestId={1}
              subId={subId}
              open={open}
              step={dubaiParksSteps}
              setStep={setDubaiParkSteps}
              setStepHandler={setStepHandler}
            />
          );

        default:
          return <div></div>;
      }
    }
    if (contentType === 'Beaches') {
      switch (beachesSteps) {
        case 1:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'beaches'}
              open={open}
              step={beachesSteps}
              setStep={setBeachesSteps}
              subId={subId}
              setOpen={setOpen}
              title={tourPlaces.beachesSteps[`step${beachesSteps}`].title}
              content={tourPlaces.beachesSteps[`step${beachesSteps}`].content}
              footerButtonText={
                tourPlaces.beachesSteps[`step${beachesSteps}`].footerButtonText
              }
              shouldPrev={
                tourPlaces.beachesSteps[`step${beachesSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.beachesSteps[`step${beachesSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.beachesSteps[`step${beachesSteps}`].shouldNext
              }
              video={tourPlaces.beachesSteps[`step${beachesSteps}`].video}
              imageUrl={tourPlaces.beachesSteps[`step${beachesSteps}`].image}
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
              steps={beachesSteps}
              setStep={setBeachesSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setBeachesSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              step={beachesSteps}
              setStep={setBeachesSteps}
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
              mainQuestId={1}
              subId={subId}
              open={open}
              step={beachesSteps}
              setStep={setBeachesSteps}
              setStepHandler={setStepHandler}
            />
          );

        default:
          return <div></div>;
      }
    }
    if (contentType === 'Attractions') {
      switch (attractionSteps) {
        case 1:
          return (
            <Landmark1
              mainQuestId={1}
              completeStepsCheck={'attractions'}
              open={open}
              step={attractionSteps}
              setStep={setAttractionSteps}
              subId={subId}
              setOpen={setOpen}
              title={
                tourPlaces.attractionsSteps[`step${attractionSteps}`].title
              }
              content={
                tourPlaces.attractionsSteps[`step${attractionSteps}`].content
              }
              footerButtonText={
                tourPlaces.attractionsSteps[`step${attractionSteps}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.attractionsSteps[`step${attractionSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.attractionsSteps[`step${attractionSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.attractionsSteps[`step${attractionSteps}`].shouldNext
              }
              video={
                tourPlaces.attractionsSteps[`step${attractionSteps}`].video
              }
              imageUrl={
                tourPlaces.attractionsSteps[`step${attractionSteps}`].image
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
              steps={attractionSteps}
              setStep={setAttractionSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setAttractionSteps(3); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 3:
          return (
            <Landmark1
              mainQuestId={1}
              subId={subId}
              step={attractionSteps}
              setStep={setAttractionSteps}
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
              mainQuestId={1}
              subId={subId}
              open={open}
              step={attractionSteps}
              setStep={setAttractionSteps}
              setStepHandler={setStepHandler}
            />
          );
        default:
          return <div></div>;
      }
    }
  };
  return uniteStep === 0 &&
    burjKhalifaSteps === 0 &&
    dubaiMallSteps === 0 &&
    museumSteps === 0 &&
    fahidiFortStep === 0 &&
    jumeriahSteps === 0 &&
    clockTowerSteps === 0 &&
    dubaiFrameSteps === 0 &&
    dubaiParksSteps === 0 &&
    beachesSteps === 0 &&
    attractionSteps === 0 ? (
    <div className="tourSplash">
      {loading ? (
        <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
      ) : (
        <>
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
            <div className="desktopView">
              {subQuests.map((subQuest, index) => {
                return (
                  <TourSection
                    key={index}
                    onClick={handleLandmarkClick}
                    item={subQuest.items}
                    setSubId={setSubId}
                    title={subQuest.categoryTitle}
                  />
                );
              })}
            </div>
            <div className="mobileView">
              <div className="tabMenuWrapper">
                <div className="tabMenu">
                  {subQuests.map((x, i) => {
                    return (
                      <span
                        className="tabmenuLink"
                        style={{ opacity: i === activeTab ? '1' : '0.2' }}
                        onClick={() => setActiveTab(i)}
                      >
                        {x.categoryTitle}
                      </span>
                    );
                  })}
                </div>

                <div className="tabContent">
                  {(() => {
                    switch (activeTab) {
                      case 0:
                        return subQuests[0].items.map((subItem, index) => (
                          <CheckedTour
                            key={index}
                            isCompleted={subItem.userVirtualSubQuestStatus}
                            onClick={() => handleLandmarkClick(subItem.title)}
                            landmarkImage={subItem.landmarkImage}
                            title={ls.tour1.screen4.tourPlaces.title(
                              subItem.title
                            )}
                          />
                        ));

                      case 1:
                        return subQuests[1].items.map((subItem, index) => (
                          <CheckedTour
                            key={index}
                            isCompleted={subItem.userVirtualSubQuestStatus}
                            onClick={() => handleLandmarkClick(subItem.title)}
                            landmarkImage={subItem.landmarkImage}
                            title={ls.tour1.screen4.tourPlaces.title(
                              subItem.title
                            )}
                          />
                        ));
                      case 2:
                        return subQuests[2].items.map((subItem, index) => (
                          <CheckedTour
                            key={index}
                            isCompleted={subItem.userVirtualSubQuestStatus}
                            onClick={() => handleLandmarkClick(subItem.title)}
                            landmarkImage={subItem.landmarkImage}
                            title={ls.tour1.screen4.tourPlaces.title(
                              subItem.title
                            )}
                          />
                        ));
                    }
                  })()}
                </div>
              </div>
            </div>
          </InitiateTourScreen>
        </>
      )}
    </div>
  ) : (
    renderUniteScreens(
      uniteStep,
      dubaiMallSteps,
      museumSteps,
      fahidiFortStep,
      jumeriahSteps,
      clockTowerSteps,
      dubaiFrameSteps,
      dubaiParksSteps,
      beachesSteps,
      attractionSteps,
      burjKhalifaSteps
    )
  );
};

export default Screen4;
