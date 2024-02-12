import ArrowLeft from 'assets/images/icons/Arraow-left';
import CloseIcon from 'assets/images/icons/Close';
import React from 'react';
const StepsHeader = ({ steps, setOpen, setSteps, screenType }) => {
  const onPressBackButton = () => {
    if (steps == 5 && screenType == 'inviteFriend') {
      setSteps(2);
    } else if (steps == 3 && screenType == 'inviteFriend') {
      setSteps(5);
    } else if (steps == 4 || steps == 6 || steps == 7) {
      setSteps(1);
    } else if (steps == 3) {
      setSteps(2);
    } else if (steps == 2) {
      setSteps(1);
    }
  };
  return (
    <div className="stepheader">
      {steps == 1 ? (
        <div></div>
      ) : (
        <button className="stepheader-backBtn" onClick={onPressBackButton}>
          <ArrowLeft /> Back
        </button>
      )}
      <button className="stepheader-closeBtn" onClick={() => setOpen(false)}>
        <CloseIcon />
      </button>
    </div>
  );
};

export default StepsHeader;
