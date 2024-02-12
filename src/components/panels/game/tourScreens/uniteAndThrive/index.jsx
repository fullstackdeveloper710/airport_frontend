import React, { useEffect, useState } from 'react';
import HeaderNavigators from '../HeaderNavigators';
import DeiraSteps1 from './deiraSteps';
import ThriveIcon from 'assets/images/icons/thriveIcon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import CompleteQuest from '../components/CompleteQuest';
import FooterButton from '../components/FooterButon';
import CheckStepComplete from '../components/CheckStepComplete';
import Landmark1 from '../sunriseToSunset/burjKhalifaScreens/landmarkStep1';
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
const SelectTour = ({
  open,
  setOpen,
  setUniteAndThriveStep,
  uniteAndThriveStep,
  setStepHandler,
  setStepType,
  setVitalRoutesSteps,
  setCheckUserStatusForCongratulationScreen,
  setShowContinueButton,
  checkUserStatusForCongratulationScreen,
  showContinueButton,
}) => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subId, setSubId] = useState('');
  const [isShowContinueButton, setIsShowContinueButton] = useState(false);
  const virtualMainQuest = new VirtualQuestService();

  const GetUniteAndThriveData = async () => {
    setLoading(true);
    const response = await virtualMainQuest.getAllSubQuestByUserId(2);
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
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();
  const tourPlaces = ls.tour2.tourPlaces;
  const [subStepsContentType, setSubStepsContentType] = useState('');
  const [downtownDubaiScreenSteps, setDowntownDubaiScreenSteps] = useState(0);
  const [DIFCScreenSteps, setDIFCScreenSteps] = useState(0);
  const [burDubaiScreenSteps, setBurDubaiScreenSteps] = useState(0);
  const [alNahdaSteps, setAlNahdaSteps] = useState(0);
  const [meydanScreenSteps, setMeydanScreenSteps] = useState(0);
  const [palmJumeirahSteps, setPalmJumeirahSteps] = useState(0);
  const [dubaiMarinaSteps, setDubaiMarinaSteps] = useState(0);
  const [dubaiSportsCitySteps, setDubaiSportsCitySteps] = useState(0);
  const [gatedCommunitiesSteps, setGatedCommunitiesSteps] = useState(0);
  const [suburbanLivingScreenSteps, setSuburbanLivingScreenSteps] = useState(0);
  const [deiraSteps, setDeiraSteps] = useState(0);
  const [jumeriahSteps, setJumeriahSteps] = useState(0);
  const handleClickTour = (title) => {
    if (title === quests[0].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Deira");
      // }
      setDeiraSteps(1);
      setSubStepsContentType('Deira');
    } else if (title === quests[1].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("AlNahda");
      // }
      setSubStepsContentType('Al Nahda');
      setAlNahdaSteps(1);
    } else if (title === quests[2].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("BurDubai");
      // }
      setBurDubaiScreenSteps(1);
      setSubStepsContentType('Bur Dubai');
    } else if (title === quests[3].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("DowntownDubai");
      // }
      setDowntownDubaiScreenSteps(1);
      setSubStepsContentType('Downtown Dubai');
    } else if (title === quests[4].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("DIFC");
      // }
      setDIFCScreenSteps(1);
      setSubStepsContentType('Dubai International Financial Centre (DIFC)');
    } else if (title === quests[5].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Jumeirah");
      // }
      setJumeriahSteps(1);
      setSubStepsContentType('Jumeirah');
    } else if (title === quests[6].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("Meydan");
      // }
      setSubStepsContentType('Meydan');
      setMeydanScreenSteps(1);
    } else if (title === quests[7].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("PalmJumeriah");
      // }
      setPalmJumeirahSteps(1);
      setSubStepsContentType('Palm Jumeriah');
    } else if (title === quests[8].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("DubaiMarina");
      // }
      setDubaiMarinaSteps(1);
      setSubStepsContentType('Dubai Marina');
    } else if (title === quests[9].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("DubaiSportsCity");
      // }
      setDubaiSportsCitySteps(1);
      setSubStepsContentType('Dubai Sports City');
    } else if (title === quests[10].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("GatedCommunities");
      // }
      setGatedCommunitiesSteps(1);
      setSubStepsContentType('Gated Communities');
    } else if (title === quests[11].title) {
      // if (window.gameClient) {
      //   window.gameClient.selectBuilding("SuburbanLiving");
      // }
      setSuburbanLivingScreenSteps(1);
      setSubStepsContentType('Suburban Living');
    }
  };
  useEffect(() => {
    GetUniteAndThriveData();
  }, []);

  useEffect(() => {
    if (
      deiraSteps === 0 &&
      alNahdaSteps === 0 &&
      burDubaiScreenSteps === 0 &&
      downtownDubaiScreenSteps === 0 &&
      DIFCScreenSteps === 0 &&
      jumeriahSteps === 0 &&
      meydanScreenSteps === 0 &&
      palmJumeirahSteps === 0 &&
      dubaiMarinaSteps === 0 &&
      dubaiSportsCitySteps === 0 &&
      gatedCommunitiesSteps === 0 &&
      suburbanLivingScreenSteps === 0
    ) {
      if (window.gameClient) {
        window.gameClient.setVQMenu();
      } else {
        console.log('Game sequence could not go to initial state');
      }
    }
  }, [
    deiraSteps,
    alNahdaSteps,
    burDubaiScreenSteps,
    downtownDubaiScreenSteps,
    DIFCScreenSteps,
    jumeriahSteps,
    meydanScreenSteps,
    palmJumeirahSteps,
    dubaiMarinaSteps,
    dubaiSportsCitySteps,
    gatedCommunitiesSteps,
    suburbanLivingScreenSteps,
  ]);
  const CheckStepORTour = ({ step, setStep, onClick }) => {
    return (
      <CompleteQuest
        open={open}
        setStepHandler={setStepHandler}
        setOpen={setOpen}
        step={step}
        setStep={setStep}
        title={'Unite And Thrive'}
        icon={<ThriveIcon />}
        secondaryText={'Vibrant Communities'}
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
                  setStepType('Vital routes');
                  setVitalRoutesSteps(4);
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

  const renderSubStepsScreens = (
    deiraSteps,
    alNahdaSteps,
    burDubaiScreenSteps,
    downtownDubaiScreenSteps,
    DIFCScreenSteps,
    jumeriahSteps,
    meydanScreenSteps,
    palmJumeirahSteps,
    dubaiMarinaSteps,
    dubaiSportsCitySteps,
    gatedCommunitiesSteps,
    suburbanLivingScreenSteps
  ) => {
    if (subStepsContentType === 'Deira') {
      switch (deiraSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'deira'}
              open={open}
              steps={deiraSteps}
              setStep={setDeiraSteps}
              title={tourPlaces.deiraSteps[`step${deiraSteps}`].title}
              content={tourPlaces.deiraSteps[`step${deiraSteps}`].content}
              menus={['Heritage', 'Dining', 'Shopping', 'Souks', 'Creek']}
              setOpen={setOpen}
              shouldPrev={tourPlaces.deiraSteps[`step${deiraSteps}`].shouldPrev}
              isCurrGame={tourPlaces.deiraSteps[`step${deiraSteps}`].isCurrGame}
              shouldNext={tourPlaces.deiraSteps[`step${deiraSteps}`].shouldNext}
              video={tourPlaces.deiraSteps[`step${deiraSteps}`].video}
              imageUrl={tourPlaces.deiraSteps[`step${deiraSteps}`].image}
            />
          );
        case 2:
        case 3:
          return (
            <Landmark1
              open={open}
              steps={deiraSteps}
              setStep={setDeiraSteps}
              title={tourPlaces.deiraSteps[`step${deiraSteps}`].title}
              mainQuestId={2}
              subId={subId}
              content={tourPlaces.deiraSteps[`step${deiraSteps}`].content}
              footerButtonText={
                tourPlaces.deiraSteps[`step${deiraSteps}`].footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={tourPlaces.deiraSteps[`step${deiraSteps}`].shouldPrev}
              isCurrGame={tourPlaces.deiraSteps[`step${deiraSteps}`].isCurrGame}
              shouldNext={tourPlaces.deiraSteps[`step${deiraSteps}`].shouldNext}
              video={tourPlaces.deiraSteps[`step${deiraSteps}`].video}
              imageUrl={tourPlaces.deiraSteps[`step${deiraSteps}`].image}
            />
          );
        case 4: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepORTour
              steps={deiraSteps}
              setStep={setDeiraSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDeiraSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={deiraSteps}
              setStep={setDeiraSteps}
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
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={deiraSteps}
              setStep={setDeiraSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Al Nahda') {
      switch (alNahdaSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'nhada'}
              open={open}
              steps={alNahdaSteps}
              setStep={setAlNahdaSteps}
              title={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].title}
              content={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].content}
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.NhadaSteps[`step${alNahdaSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.NhadaSteps[`step${alNahdaSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.NhadaSteps[`step${alNahdaSteps}`].shouldNext
              }
              video={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].video}
              imageUrl={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].image}
            />
          );
        case 2:
        case 3:
          return (
            <Landmark1
              open={open}
              steps={alNahdaSteps}
              subId={subId}
              mainQuestId={2}
              setStep={setAlNahdaSteps}
              title={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].title}
              content={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].content}
              footerButtonText={
                tourPlaces.NhadaSteps[`step${alNahdaSteps}`].footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.NhadaSteps[`step${alNahdaSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.NhadaSteps[`step${alNahdaSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.NhadaSteps[`step${alNahdaSteps}`].shouldNext
              }
              video={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].video}
              imageUrl={tourPlaces.NhadaSteps[`step${alNahdaSteps}`].image}
            />
          );
        case 4: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepORTour
              step={alNahdaSteps}
              setStep={setAlNahdaSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setAlNahdaSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              step={alNahdaSteps}
              setStep={setAlNahdaSteps}
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
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={alNahdaSteps}
              setStep={setAlNahdaSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Bur Dubai') {
      switch (burDubaiScreenSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'burDubai'}
              open={open}
              steps={burDubaiScreenSteps}
              setStep={setBurDubaiScreenSteps}
              title={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].title
              }
              content={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].content
              }
              menus={[
                'Dining',
                'Heritage & Museums',
                'Shopping',
                'Souks',
                'Creek',
              ]}
              footerButtonText={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].video
              }
              imageUrl={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].image
              }
            />
          );
        case 2:
        case 3:
          return (
            <Landmark1
              open={open}
              steps={burDubaiScreenSteps}
              setStep={setBurDubaiScreenSteps}
              title={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].title
              }
              content={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].content
              }
              subId={subId}
              mainQuestId={2}
              footerButtonText={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .isCurrGame
              }
              video={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].video
              }
              imageUrl={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`].image
              }
              shouldNext={
                tourPlaces.BurDubaiSteps[`step${burDubaiScreenSteps}`]
                  .shouldNext
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
            <CheckStepORTour
              step={burDubaiScreenSteps}
              setStep={setBurDubaiScreenSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setBurDubaiScreenSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              steps={burDubaiScreenSteps}
              setStep={setBurDubaiScreenSteps}
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
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              steps={burDubaiScreenSteps}
              setStep={setBurDubaiScreenSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Downtown Dubai') {
      switch (downtownDubaiScreenSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'downtownDubai'}
              open={open}
              steps={downtownDubaiScreenSteps}
              setStep={setDowntownDubaiScreenSteps}
              title={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .title
              }
              content={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .content
              }
              menus={[
                'Shopping',
                'Skyscrapers',
                'Dining',
                'Entertainment',
                'Luxury',
              ]}
              footerButtonText={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .video
              }
              imageUrl={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .image
              }
            />
          );
        case 2:
        case 3:
        case 4:
          return (
            <Landmark1
              open={open}
              steps={downtownDubaiScreenSteps}
              setStep={setDowntownDubaiScreenSteps}
              title={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .title
              }
              content={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .content
              }
              subId={subId}
              mainQuestId={2}
              footerButtonText={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .video
              }
              imageUrl={
                tourPlaces.DowntownDubaiSteps[`step${downtownDubaiScreenSteps}`]
                  .image
              }
            />
          );
        case 5: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepORTour
              step={downtownDubaiScreenSteps}
              setStep={setDowntownDubaiScreenSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDowntownDubaiScreenSteps(6); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 6:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              step={downtownDubaiScreenSteps}
              setStep={setDowntownDubaiScreenSteps}
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
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={downtownDubaiScreenSteps}
              setStep={setDowntownDubaiScreenSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Dubai International Financial Centre (DIFC)') {
      switch (DIFCScreenSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'dubaiInternational'}
              open={open}
              steps={DIFCScreenSteps}
              setStep={setDIFCScreenSteps}
              title={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].title}
              content={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].content}
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].shouldNext
              }
              video={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].video}
              imageUrl={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].image}
            />
          );
        case 2:
        case 3:
          return (
            <Landmark1
              open={open}
              steps={DIFCScreenSteps}
              setStep={setDIFCScreenSteps}
              title={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].title}
              content={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].content}
              footerButtonText={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].footerButtonText
              }
              subId={subId}
              mainQuestId={2}
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].shouldNext
              }
              video={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].video}
              imageUrl={tourPlaces.DIFCSteps[`step${DIFCScreenSteps}`].image}
            />
          );

        case 4: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepORTour
              step={DIFCScreenSteps}
              setStep={setDIFCScreenSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDIFCScreenSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              step={DIFCScreenSteps}
              setStep={setDIFCScreenSteps}
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
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={DIFCScreenSteps}
              setStep={setDIFCScreenSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Jumeirah') {
      switch (jumeriahSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'jumeriah'}
              open={open}
              steps={jumeriahSteps}
              setStep={setJumeriahSteps}
              title={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].title}
              content={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].content}
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].shouldNext
              }
              video={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].video}
              imageUrl={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].image}
            />
          );
        case 2:
        case 3:
          return (
            <Landmark1
              open={open}
              steps={jumeriahSteps}
              setStep={setJumeriahSteps}
              title={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].title}
              content={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].content}
              footerButtonText={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`]
                  .footerButtonText
              }
              subId={subId}
              mainQuestId={2}
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].shouldNext
              }
              video={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].video}
              imageUrl={tourPlaces.JumeriahSteps[`step${jumeriahSteps}`].image}
            />
          );

        case 4: {
          if (window.gameClient) {
            window.gameClient.setVQMenu();
          } else {
            console.log('Game sequence could not go to initial state');
          }
          return (
            <CheckStepORTour
              step={jumeriahSteps}
              setStep={setJumeriahSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setJumeriahSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={3}
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

        case 6:
          return (
            <ScanQR
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={jumeriahSteps}
              setStep={setJumeriahSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Meydan') {
      switch (meydanScreenSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'meydan'}
              open={open}
              steps={meydanScreenSteps}
              setStep={setMeydanScreenSteps}
              title={tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].title}
              content={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].content
              }
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].shouldNext
              }
              video={tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].video}
              imageUrl={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].image
              }
            />
          );
        case 2:
        case 3:
          return (
            <Landmark1
              open={open}
              steps={meydanScreenSteps}
              setStep={setMeydanScreenSteps}
              title={tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].title}
              content={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].content
              }
              subId={subId}
              mainQuestId={2}
              footerButtonText={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].shouldPrev
              }
              isCurrGame={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].isCurrGame
              }
              shouldNext={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].shouldNext
              }
              video={tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].video}
              imageUrl={
                tourPlaces.MeydanSteps[`step${meydanScreenSteps}`].image
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
            <CheckStepORTour
              step={meydanScreenSteps}
              setStep={setMeydanScreenSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setMeydanScreenSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }

        case 5:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              step={meydanScreenSteps}
              setStep={setMeydanScreenSteps}
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
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={meydanScreenSteps}
              setStep={setMeydanScreenSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Palm Jumeriah') {
      switch (palmJumeirahSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'palmJumeriah'}
              open={open}
              steps={palmJumeirahSteps}
              setStep={setPalmJumeirahSteps}
              title={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].title
              }
              content={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].content
              }
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].video
              }
              imageUrl={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].image
              }
            />
          );
        case 2:
        case 3:
          return (
            <Landmark1
              open={open}
              steps={palmJumeirahSteps}
              setStep={setPalmJumeirahSteps}
              title={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].title
              }
              content={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].content
              }
              subId={subId}
              mainQuestId={2}
              footerButtonText={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].video
              }
              imageUrl={
                tourPlaces.PalmJumeriahSteps[`step${palmJumeirahSteps}`].image
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
            <CheckStepORTour
              step={palmJumeirahSteps}
              setStep={setPalmJumeirahSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setPalmJumeirahSteps(5); // return to congratulations screen
                }
              }}
            />
          );
        }
        case 5:
          return (
            <Landmark1
              mainQuestId={3}
              subId={subId}
              step={palmJumeirahSteps}
              setStep={setPalmJumeirahSteps}
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
              mainQuestId={3}
              subId={subId}
              open={open}
              setOpen={setOpen}
              step={palmJumeirahSteps}
              setStepHandler={setStepHandler}
              setStep={setPalmJumeirahSteps}
            />
          );
      }
    }
    if (subStepsContentType === 'Dubai Marina') {
      switch (dubaiMarinaSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'dubaiMarina'}
              open={open}
              subId={subId}
              mainQuestId={2}
              steps={dubaiMarinaSteps}
              setStep={setDubaiMarinaSteps}
              title={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].title
              }
              content={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].content
              }
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].video
              }
              imageUrl={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].image
              }
            />
          );
        case 2:
          return (
            <Landmark1
              open={open}
              steps={dubaiMarinaSteps}
              setStep={setDubaiMarinaSteps}
              title={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].title
              }
              content={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].content
              }
              subId={subId}
              mainQuestId={2}
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].video
              }
              imageUrl={
                tourPlaces.DubaiMarineSteps[`step${dubaiMarinaSteps}`].image
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
            <CheckStepORTour
              step={dubaiMarinaSteps}
              setStep={setDubaiMarinaSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDubaiMarinaSteps(4); // return to congratulations screen
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
              step={dubaiMarinaSteps}
              setStep={setDubaiMarinaSteps}
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
              setOpen={setOpen}
              step={dubaiMarinaSteps}
              setStep={setDubaiMarinaSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Dubai Sports City') {
      switch (dubaiSportsCitySteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'dubaiSportsCity'}
              open={open}
              steps={dubaiSportsCitySteps}
              setStep={setDubaiSportsCitySteps}
              title={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .title
              }
              content={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .content
              }
              subId={subId}
              mainQuestId={2}
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .video
              }
              imageUrl={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .image
              }
            />
          );
        case 2:
          return (
            <Landmark1
              open={open}
              steps={dubaiSportsCitySteps}
              setStep={setDubaiSportsCitySteps}
              title={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .title
              }
              content={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .content
              }
              subId={subId}
              mainQuestId={2}
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .video
              }
              imageUrl={
                tourPlaces.DubaiSportsCitySteps[`step${dubaiSportsCitySteps}`]
                  .image
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
            <CheckStepORTour
              step={dubaiSportsCitySteps}
              setStep={setDubaiSportsCitySteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setDubaiSportsCitySteps(4); // return to congratulations screen
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
              step={dubaiSportsCitySteps}
              setStep={setDubaiSportsCitySteps}
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
              setOpen={setOpen}
              step={dubaiSportsCitySteps}
              setStep={setDubaiSportsCitySteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Gated Communities') {
      switch (gatedCommunitiesSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'gatedCommunities'}
              open={open}
              steps={gatedCommunitiesSteps}
              setStep={setGatedCommunitiesSteps}
              title={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .title
              }
              content={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .content
              }
              subId={subId}
              mainQuestId={2}
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .video
              }
              imageUrl={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .image
              }
            />
          );
        case 2:
          return (
            <Landmark1
              open={open}
              steps={gatedCommunitiesSteps}
              setStep={setGatedCommunitiesSteps}
              title={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .title
              }
              content={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .content
              }
              subId={subId}
              mainQuestId={2}
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .shouldPrev
              }
              isCurrGame={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .isCurrGame
              }
              shouldNext={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .shouldNext
              }
              video={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .video
              }
              imageUrl={
                tourPlaces.GatedCommunitiesSteps[`step${gatedCommunitiesSteps}`]
                  .image
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
            <CheckStepORTour
              step={gatedCommunitiesSteps}
              setStep={setGatedCommunitiesSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setGatedCommunitiesSteps(4); // return to congratulations screen
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
              step={gatedCommunitiesSteps}
              setStep={setGatedCommunitiesSteps}
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
              setOpen={setOpen}
              step={gatedCommunitiesSteps}
              setStep={setGatedCommunitiesSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
    if (subStepsContentType === 'Suburban Living') {
      switch (suburbanLivingScreenSteps) {
        case 1:
          return (
            <DeiraSteps1
              checkCompleteSteps={'suburbanLiving'}
              open={open}
              steps={suburbanLivingScreenSteps}
              setStep={setSuburbanLivingScreenSteps}
              title={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].title
              }
              content={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].content
              }
              subId={subId}
              mainQuestId={2}
              menus={[
                'Lifestyle',
                'Parks',
                'Healthcare',
                'Education',
                'Shopping',
              ]}
              footerButtonText={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].footerButtonText
              }
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].shouldPrev
              }
              isCurrGame={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].isCurrGame
              }
              shouldNext={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].shouldNext
              }
              video={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].video
              }
              imageUrl={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].image
              }
            />
          );
        case 2:
          return (
            <Landmark1
              open={open}
              steps={suburbanLivingScreenSteps}
              setStep={setSuburbanLivingScreenSteps}
              title={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].title
              }
              content={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].content
              }
              subId={subId}
              mainQuestId={2}
              setOpen={setOpen}
              shouldPrev={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].shouldPrev
              }
              isCurrGame={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].isCurrGame
              }
              shouldNext={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].shouldNext
              }
              video={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].video
              }
              imageUrl={
                tourPlaces.subarbanLivingSteps[
                  `step${suburbanLivingScreenSteps}`
                ].image
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
            <CheckStepORTour
              step={suburbanLivingScreenSteps}
              setStep={setSuburbanLivingScreenSteps}
              onClick={() => {
                if (
                  isShowContinueButton === false &&
                  checkUserStatusForCongratulationScreen === false
                ) {
                  setStepHandler(3); // returnn to main menu
                } else {
                  setSuburbanLivingScreenSteps(4); // return to congratulations screen
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
              step={suburbanLivingScreenSteps}
              setStep={setSuburbanLivingScreenSteps}
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
              setOpen={setOpen}
              step={suburbanLivingScreenSteps}
              setStep={setSuburbanLivingScreenSteps}
              setStepHandler={setStepHandler}
            />
          );
      }
    }
  };
  return deiraSteps === 0 &&
    alNahdaSteps === 0 &&
    burDubaiScreenSteps === 0 &&
    downtownDubaiScreenSteps === 0 &&
    DIFCScreenSteps === 0 &&
    jumeriahSteps === 0 &&
    meydanScreenSteps === 0 &&
    palmJumeirahSteps === 0 &&
    dubaiMarinaSteps === 0 &&
    dubaiSportsCitySteps === 0 &&
    gatedCommunitiesSteps === 0 &&
    suburbanLivingScreenSteps === 0 ? (
    <div className="tourSplash  tourSplash__col__6">
      {loading ? (
        <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
      ) : (
        <>
          <div className="tourSplash__Overlay blur"></div>
          <HeaderNavigators
            open={open}
            step={uniteAndThriveStep}
            setStep={setUniteAndThriveStep}
            setOpen={setOpen}
            showNextButton={true}
            setStepHandler={setStepHandler}
          />
          <InitiateTourScreen>
            <div className="desktopView__selectTour">
              <div className="tourBlock">
                <h2 className="tourBlock__heading">{ls.tour2.heading}</h2>
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
    renderSubStepsScreens(
      deiraSteps,
      alNahdaSteps,
      burDubaiScreenSteps,
      downtownDubaiScreenSteps,
      DIFCScreenSteps,
      jumeriahSteps,
      meydanScreenSteps,
      palmJumeirahSteps,
      dubaiMarinaSteps,
      dubaiSportsCitySteps,
      gatedCommunitiesSteps,
      suburbanLivingScreenSteps
    )
  );
};

export default SelectTour;
