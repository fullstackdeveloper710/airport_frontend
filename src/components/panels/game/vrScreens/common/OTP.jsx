import React, { useEffect, useState } from 'react';
import RefreshIcon from 'assets/images/icons/RefreshIcon';
import { ReactComponent as ClockIcon } from '../../../../../assets/images/icons/clock.svg';
import Timer from './OTPCountdown';
const OTP = ({
  ls,
  code,
  codeGenerateTime,
  codeExpiryTime,
  handleGenerateVerificationOTP,
}) => {
  const [remaingTime, setRemainingTime] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const handleRegenrateOTP = () => {
    handleGenerateVerificationOTP();
  };
  return (
    <div className="guideItem-caption">
      <div className="captcha-wrapper">
        <b>{ls.dialogContentProps.step3.enterOTP}</b>
        <div className="captcha-inner">
          <div className="captcha-code">{code}</div>
          {isExpired && (
            <span className="refreshIcon" onClick={handleRegenrateOTP}>
              <RefreshIcon />
            </span>
          )}
        </div>
        <p>{ls.dialogContentProps.step3.regenerateOTP}</p>
        <div className="captcha-time">
          <ClockIcon />
          <Timer
            codeGenerateTime={codeGenerateTime}
            codeExpiryTime={codeExpiryTime}
            remainingTime={remaingTime}
            setRemainingTime={setRemainingTime}
            setIsExpired={setIsExpired}
          />
        </div>
      </div>
    </div>
  );
};

export default OTP;
