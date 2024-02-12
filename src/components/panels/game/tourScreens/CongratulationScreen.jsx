import React from 'react';
import HeaderNavigators from './HeaderNavigators';

const CongratulationScreen = ({ open, setOpen, steps, setStep }) => {
  return (
    <div className="tourSplash">
      <div className="tourSplash__Overlay blur"></div>

      <HeaderNavigators
        open={open}
        step={steps}
        setStep={setStep}
        setOpen={setOpen}
        showNextButton={true}
      />
    </div>
  );
};

export default CongratulationScreen;
