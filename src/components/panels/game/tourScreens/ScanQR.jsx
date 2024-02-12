import React from 'react';
import HeaderNavigators from './HeaderNavigators';
import InitiateTourScreen from './components/InitiateTourScreen';
import QRCode from 'assets/images/Qr.png';
const ScanQR = ({ open, setOpen, steps, setStep ,   setStepHandler }) => {
  return (
    <div className="tourSplash">
      <div className="tourSplash__Overlay blur"></div>
      <HeaderNavigators
        open={open}
        step={steps}
        setStep={setStep}
        setOpen={setOpen}
        showNextButton={true}
        setStepHandler={setStepHandler}
      />
      <InitiateTourScreen>
        <div className="transparent-card">
          <div className="white_card">
            <p>Scan the code with your mobile device and tablet</p>

            <img src={QRCode} />
          </div>
          <div className="centered_container">
            <div className="vertical_line" />
            <span>OR</span>
            <div className="vertical_line" />
          </div>
          <p className="last_p">
            Visit emiratesixr.com on your mobile device or tablet
          </p>
        </div>
      </InitiateTourScreen>
    </div>
  );
};
export default ScanQR;
