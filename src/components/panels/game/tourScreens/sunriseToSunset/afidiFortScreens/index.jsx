
import HeaderNavigators from '../../HeaderNavigators';

const FahidiFortStep3 = ({
  open,
  setOpen,
  fahidiFortStep,
  setFahidiFortStep,
}) => {
  return (
    <div className="tourSplash flex-left">
      <HeaderNavigators
        open={open}
        setOpen={setOpen}
        step={fahidiFortStep}
        setStep={setFahidiFortStep}
        shouldPrev={false}
        shouldNext={false}
      />
      <div className="tourSplash__Overlay overlay-1"></div>
      <div className="videoBlock">
        <video
          preload="auto"
          playsinline=""
          muted=""
          src="https://emirates-media-files.s3.amazonaws.com/videos/sunriseToSunsetAssets/AlFahidiFort.mp4"
          seek="0"
          className="nzarK4Wo"
          loop
          autoPlay
        ></video>
      </div>
    </div>
  );
};

export default FahidiFortStep3;
