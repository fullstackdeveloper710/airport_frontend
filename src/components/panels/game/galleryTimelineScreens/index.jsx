import { useState } from 'react';
import CloseIcon from 'assets/images/icons/Close';
import blackModel from '../../../../assets/images/black-modal.png';
import whiteBack from '../../../../assets/images/modal-bg-sec.png';
import GoldLine from '../../../../assets/images/gold-line.png';
import TimelineSlider from './components/TimelineSlider';
import playIcon from '../../../../assets/images/playIcon.png';
import vdoFrame from '../../../../assets/images/vdoFrame.png';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import FooterButton from '../tourScreens/components/FooterButon';

const TimelineScreens = () => {
  let SCREEN_TYPES = {
    LAUNCH: 'LAUNCH',
    PLAY_VIDEO: 'PlayVideo',
    YEAR: 'year',
  };
  const {
    components: {
      dialogs: { galleryTimelineDialog: ls },
    },
  } = useLabelsSchema();
  const [isActive, setIsActive] = useState(SCREEN_TYPES.LAUNCH);
  const [year, setYear] = useState('');
  const Header = () => {
    return (
      <div>
        <div />
        <div className="close-btn-wrapper">
          <button
            className="stepBtn btnClose"
            onClick={() => setIsActive(SCREEN_TYPES.LAUNCH)}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
    );
  };
  const PlayVideo = () => {
    return (
      <div className="video_block">
        <img src={vdoFrame} className="video_frame" />
        <div
          className="video_close"
          onClick={() => setIsActive(SCREEN_TYPES.YEAR)}
        >
          <CloseIcon />
        </div>
        <video
          preload="auto"
          playsinline=""
          muted=""
          src="https://emirates-media-files.s3.amazonaws.com/videos/food.mp4"
          seek="0"
          className="nzarK4Wo"
          loop
          autoPlay
        />
      </div>
    );
  };
  const YearContent = ({ year, vedio }) => {
    return (
      <>
        <img src={whiteBack} className="card-bg-sec" />
        <div
          className={
            isActive === SCREEN_TYPES.PLAY_VIDEO
              ? null
              : 'all-modal-content fadeInfadeOut'
          }
        >
          {isActive === SCREEN_TYPES.PLAY_VIDEO ? (
            <PlayVideo />
          ) : (
            <>
              <div className="year-content">
                <h2 className="year-data">{year}</h2>
                <h1>{ls.yearScreen.title}</h1>

                <div className="modal-description-content">
                  <div
                    className="vedio-thumbnail"
                    onClick={() => setIsActive(SCREEN_TYPES.PLAY_VIDEO)}
                  >
                    <img className="btn-play" src={playIcon} alt="play" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  };
  const IntroScreen = () => {
    return (
      <div
        className={`black-modal ${
          isActive === SCREEN_TYPES.LAUNCH
            ? 'fadeInfadeOut'
            : isActive === SCREEN_TYPES.YEAR
            ? 'fadeInfadeOut'
            : ''
        }`}
      >
        <img src={blackModel} className="card-bg-sec" />
        <div
          className={
            isActive === SCREEN_TYPES.PLAY_VIDEO
              ? null
              : 'all-modal-content fadeInfadeOut'
          }
        >
          {isActive === SCREEN_TYPES.LAUNCH ? (
            <div className="emirates-content text-center ">
              <h2 className="text-white">{ls.introScreen.title}</h2>
              <div className="modal-description-content">
                <p className="text-white">{ls.introScreen.secondaryText}</p>
                <p className="text-white">{ls.introScreen.secondaryText}</p>
                <p className="text-white">{ls.introScreen.secondaryText}</p>
                <p className="text-white">{ls.introScreen.secondaryText}</p>
              </div>
              <div className="landmark__bottom">
                <FooterButton
                  onClick={() => setIsActive('milestone')}
                  title={ls.introScreen.buttonText}
                />
              </div>
            </div>
          ) : isActive === 'milestone' ? (
            <div className="emirates-content-2 text-center">
              <h2 className="text-white">{ls.milestoneScreen.title}</h2>
              <div className="border-gradient-line">
                <img src={GoldLine} alt="border-line" />
              </div>
              <p>{ls.milestoneScreen.secondaryText}</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  };
  const renderTimelines = (_y) => {
    switch (_y) {
      case SCREEN_TYPES.PLAY_VIDEO:
        return (
          <>
            <div
              className={
                isActive === SCREEN_TYPES.PLAY_VIDEO
                  ? null
                  : 'all-modal-content'
              }
            >
              <PlayVideo />
            </div>
          </>
        );
      case SCREEN_TYPES.LAUNCH:
        return <IntroScreen />;
      case SCREEN_TYPES.YEAR:
        return <YearContent vedio={'2000'} year={year} />;
      default:
        return <IntroScreen />;
    }
  };
  return (
    <div className="main-bg">
      {isActive === SCREEN_TYPES.LAUNCH ? null : <Header />}
      <div className="large-container">
        <div className="main-content">
          <div className="gallery-row">
            {/* {isActive === SCREEN_TYPES.LAUNCH && ( */}
            <div className="gallery-left-content" />
            {/* )} */}
            <div
              className={`gallery-right-modal ${
                isActive === SCREEN_TYPES.LAUNCH
                  ? 'small-in-size'
                  : 'small-in-size scale-animation'
              }`}
            >
              <div className="modal-sec-content">
                {renderTimelines(isActive)}
              </div>
              {isActive === SCREEN_TYPES.LAUNCH ? null : (
                <TimelineSlider
                  isActive={isActive}
                  setIsActive={setIsActive}
                  setYear={setYear}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TimelineScreens;
