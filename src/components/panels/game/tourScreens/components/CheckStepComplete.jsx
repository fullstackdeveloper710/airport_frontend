import HeaderNavigators from '../HeaderNavigators';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import InitiateTourScreen from './InitiateTourScreen';
import CheckedTour from './CheckedTour';
import TourSection from './TourSection';
import { useEffect, useState } from 'react';
import VirtualQuestService from 'services/virtualQuestService';
import { getImages } from 'utils/getVirtualQuestsImages';
import { Spinner, SpinnerSize } from '@fluentui/react';
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
const CheckStepComplete = ({
  open,
  step,
  setStep,
  setOpen,
  onClick,
  showNextButton,
  setStepHandler,
  checkType,
  setSubId,
  subId,
}) => {
  const {
    components: {
      dialogs: { virtualQuestDialog: ls },
    },
  } = useLabelsSchema();
  const [updatedVirtualQuests, setUpdatedVirtualQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const virtualQuest = new VirtualQuestService();
  const RefreshVitrualQuest = async () => {
    setLoading(true);
    const response = await virtualQuest.getAllSubQuestByUserId(
      checkType === 'sunriseToSunset'
        ? 1
        : checkType === 'uniteAndThrive'
        ? 2
        : checkType === 'vitalRoutes'
        ? 3
        : 4
    );

    if (response.length > 0) {
      if (checkType === 'sunriseToSunset') {
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
        setUpdatedVirtualQuests(resultArray);
      } else {
        setUpdatedVirtualQuests(
          response.map((x) => {
            return { ...x, landmarkImage: getImages(x.title) };
          })
        );
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    RefreshVitrualQuest();
  }, [subId, checkType]);
  const RenderPlaces = ({ onClick, img, title, isCompleted, id }) => {
    return (
      <CheckedTour
        isCompleted={isCompleted}
        onClick={() => {
          onClick(title);
          setSubId(id);
        }}
        landmarkImage={img}
        title={title}
      />
    );
  };
  return (
    <div className="tourSplash">
      {loading ? (
        <Spinner styles={spinnerStyles} size={SpinnerSize.large} />
      ) : (
        <>
          <div className="tourSplash__Overlay blur"></div>
          <HeaderNavigators
            open={open}
            step={step}
            setStep={setStep}
            setOpen={setOpen}
            showNextButton={showNextButton}
            setStepHandler={setStepHandler}
          />
          <InitiateTourScreen>
            {checkType === 'sunriseToSunset' ? (
              updatedVirtualQuests.map((land, index) => {
                return (
                  <TourSection
                    setSubId={setSubId}
                    onClick={onClick}
                    item={land.items}
                    title={land.title}
                    step={step}
                    key={index}
                    checkType={checkType}
                  />
                );
              })
            ) : checkType === 'uniteAndThrive' ? (
              <div className="tourBlock">
                <h2 className="tourBlock__heading">{ls.tour2.heading}</h2>
                <div className="tourBlock__row ">
                  {updatedVirtualQuests.map((x, i) => {
                    return (
                      <RenderPlaces
                        img={x?.landmarkImage}
                        isCompleted={x?.userVirtualSubQuestStatus}
                        key={i}
                        onClick={onClick}
                        title={x?.title}
                        id={x.id}
                      />
                    );
                  })}
                </div>
              </div>
            ) : checkType === 'vitalRoutes' ? (
              <div className="tourBlock">
                <h2 className="tourBlock__heading">{ls.tour2.heading}</h2>
                <div className="tourBlock__row ">
                  {updatedVirtualQuests.map((x, i) => {
                    return (
                      <RenderPlaces
                        img={x?.landmarkImage}
                        isCompleted={x?.userVirtualSubQuestStatus}
                        key={i}
                        onClick={onClick}
                        title={x?.title}
                        id={x.id}
                      />
                    );
                  })}
                </div>
              </div>
            ) : checkType === 'gatewayToWonder' ? (
              <div className="tourBlock">
                <h2 className="tourBlock__heading">{ls.tour2.heading}</h2>
                <div className="tourBlock__row ">
                  {updatedVirtualQuests.map((x, i) => {
                    return (
                      <RenderPlaces
                        img={x?.landmarkImage}
                        isCompleted={x?.userVirtualSubQuestStatus}
                        key={i}
                        onClick={onClick}
                        title={x?.title}
                        id={x.id}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </InitiateTourScreen>
        </>
      )}
    </div>
  );
};

export default CheckStepComplete;
