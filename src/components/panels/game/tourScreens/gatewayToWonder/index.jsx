import React, { useEffect, useState } from 'react';
import GatewayIcon from 'assets/images/icons/gatewayIcon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import HeaderNavigators from '../HeaderNavigators';
import CheckStepComplete from '../components/CheckStepComplete';
import CompleteQuest from '../components/CompleteQuest';
import FooterButton from '../components/FooterButon';
import Landmark1 from '../sunriseToSunset/burjKhalifaScreens/landmarkStep1';
import CheckedTour from '../components/CheckedTour';
import VirtualQuestService from 'services/virtualQuestService';
import { Spinner, SpinnerSize } from '@fluentui/react';
import { getImages } from 'utils/getVirtualQuestsImages';
import CongratulationScreen from '../CongratulationScreen';
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
const RouteList = ({
  open,
  setOpen,
  setGatewayRoutes,
  gatewayRoutes,
  setStep,
  step,
  setStepHandler,
  checkUserStatusForCongratulationScreen,
  setCheckUserStatusForCongratulationScreen,
  showContinueButton,
  setShowContinueButton,
}) => {
  const [airportSteps, setAirportSteps] = useState(0);
  const [headquarters, setHeadquatersSteps] = useState(0);
  const [contentType, setContentType] = useState('');
  const [subId, setSubId] = useState('');
  const [isShowContinueButton, setIsShowContinueButton] = useState(false);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log(
    checkUserStatusForCongratulationScreen,
    'checkUserStatusForCongratulationScreen'
  );

  const virtualMainQuest = new VirtualQuestService();
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();
  let tourPlaces = ls.tour4.tourPlaces;
  const GetGatewayToWonderData = async () => {
    setLoading(true);
    let response = await virtualMainQuest.getAllSubQuestByUserId(4);
    const lastFlag = response.filter(
      (x) => x.userVirtualSubQuestStatus === false
    );

    if (lastFlag.length === 1) {
      setIsShowContinueButton(true);
    }

    console.log(response, 'response');
    if (response.length > 0) {
      setQuests(
        response.map((x) => {
          return { ...x, landmarkImage: getImages(x.title) };
        })
      );
    }
    setLoading(false);
  };
  useEffect(() => {
    GetGatewayToWonderData();
  }, []);
  useEffect(() => {
    if (airportSteps === 0 && headquarters === 0) {
      if (window.gameClient) window.gameClient.setVQMenu();
      else console.log('Game sequence could not go to initial state');
    }
  }, [airportSteps, headquarters]);
  const handleClickTour = (title) => {
    if (title === quests[0].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('Airport');
      }
      setContentType('Dubai International Airport');
      setAirportSteps(1);
    } else if (title === quests[1].title) {
      if (window.gameClient) {
        window.gameClient.selectBuilding('EmiratesHQ');
      }
      setContentType('Emirates Group Headquarters');
      setHeadquatersSteps(1);
    }
  };

  const QuestCompletedCheck = ({ steps, setSteps, onClick }) => {
    return (
      <CompleteQuest
        open={open}
        setStepHandler={setStepHandler}
        setOpen={setOpen}
        step={steps}
        setStep={setSteps}
        title={'Gateway to wonder'}
        icon={<GatewayIcon />}
        secondaryText={'upon your arrival'}
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
  const renderScreenSteps = (airportSteps, headquarters) => {
    if (contentType === 'Dubai International Airport') {
      switch (airportSteps) {
        case 1:
        case 2:
          return (
            <Landmark1
              mainQuestId={4}
              subId={subId}
              completeStepsCheck={'international'}
              open={open}
              setOpen={setOpen}
              steps={airportSteps}
              setStep={setAirportSteps}
              title={tourPlaces.dubaiAirport[`step${airportSteps}`].title}
              content={tourPlaces.dubaiAirport[`step${airportSteps}`].content}
              footerButtonText={
                tourPlaces.dubaiAirport[`step${airportSteps}`].footerButtonText
              }
              shouldPrev={
                tourPlaces.dubaiAirport[`step${airportSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.dubaiAirport[`step${airportSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.dubaiAirport[`step${airportSteps}`].shouldNext
              }
              video={tourPlaces.dubaiAirport[`step${airportSteps}`].video}
              imageUrl={tourPlaces.dubaiAirport[`step${airportSteps}`].image}
            />
          );

        case 3: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <QuestCompletedCheck
              steps={airportSteps}
              setSteps={setAirportSteps}
              onClick={() => {
                if (
                  checkUserStatusForCongratulationScreen === false &&
                  isShowContinueButton === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setAirportSteps(4); // return to congratulations screen
                }
              }}
            />
            // <CheckStepComplete
            //   open={open}
            //   step={airportSteps}
            //   setStep={setAirportSteps}
            //   setOpen={setOpen}
            //   onClick={handleClickTour}
            //   showNextButton={true}
            //   setStepHandler={setStepHandler}
            //   checkType={'gatewayToWonder'}
            //   dataType={quests}
            // />
          );
        }

        case 4:
          return (
            <Landmark1
              mainQuestId={4}
              subId={subId}
              completeStepsCheck={'international'}
              open={open}
              setOpen={setOpen}
              steps={airportSteps}
              setStep={setAirportSteps}
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
              mainQuestId={4}
              subId={subId}
              completeStepsCheck={'international'}
              open={open}
              setOpen={setOpen}
              steps={airportSteps}
              setStep={setAirportSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (contentType === 'Emirates Group Headquarters') {
      switch (headquarters) {
        case 1:
        case 2:
          return (
            <Landmark1
              mainQuestId={4}
              subId={subId}
              completeStepsCheck={'headquaters'}
              open={open}
              setOpen={setOpen}
              steps={headquarters}
              setStep={setHeadquatersSteps}
              title={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].title
              }
              content={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
                  .content
              }
              footerButtonText={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
                  .footerButtonText
              }
              shouldPrev={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`]
                  .shouldNext
              }
              video={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].video
              }
              imageUrl={
                tourPlaces.emiratesGroupHeadquaters[`step${headquarters}`].image
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
            <QuestCompletedCheck
              steps={headquarters}
              setSteps={setHeadquatersSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3);
                } else {
                  setHeadquatersSteps(4);
                }
              }}
            />
          );
        }

        case 4:
          return (
            <Landmark1
              mainQuestId={4}
              subId={subId}
              completeStepsCheck={'headquaters'}
              open={open}
              setOpen={setOpen}
              steps={headquarters}
              setStep={setHeadquatersSteps}
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
            // )
          );
        case 5:
          return (
            <ScanQR
              mainQuestId={4}
              subId={subId}
              completeStepsCheck={'headquaters'}
              open={open}
              setOpen={setOpen}
              steps={headquarters}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
  };
  return airportSteps === 0 && headquarters === 0 ? (
    <div className="tourSplash  tourSplash__col__6">
      {loading ? (
        <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
      ) : (
        <>
          <div className="tourSplash__Overlay blur"></div>
          <HeaderNavigators
            open={open}
            step={gatewayRoutes}
            setStep={setGatewayRoutes}
            setOpen={setOpen}
            showNextButton={true}
            setStepHandler={setStepHandler}
          />
          <div className="tourSplash__scrollbar">
            <div className="tourSplash__container upon_arrival">
              <div className="tourSplash__inner">
                <div className="desktopView__selectTour">
                  <div className="tourBlock">
                    <h2 className="tourBlock__heading">{ls.tour4.heading}</h2>
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
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  ) : (
    renderScreenSteps(airportSteps, headquarters)
  );
};

export default RouteList;
