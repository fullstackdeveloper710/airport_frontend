import moment from 'moment';
import React, { useEffect, useRef } from 'react';
const Timer = ({
  codeGenerateTime,
  codeExpiryTime,
  remainingTime,
  setRemainingTime,
  setIsExpired,
}) => {
  const intervalRef = useRef(null);
  useEffect(() => {
    const checkExpiration = () => {
      const verificationCodeGenerate = moment(codeGenerateTime);
      const verificationCodeExpired = moment(codeExpiryTime);
      const current = moment();
      const timeDifference = current.diff(verificationCodeGenerate);
      if (
        timeDifference > 0 &&
        timeDifference < verificationCodeExpired.diff(verificationCodeGenerate)
      ) {
        const remainingSeconds = Math.floor(
          verificationCodeExpired.diff(current) / 1000
        );
        setRemainingTime(remainingSeconds);
        setIsExpired(false);
      } else {
        setRemainingTime(null);
        setIsExpired(true);
      }
    };
    intervalRef.current = setInterval(checkExpiration, 1000);
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [codeGenerateTime, codeExpiryTime, setRemainingTime, setIsExpired]);
  const duration = moment.duration(remainingTime, 'seconds');
  const formattedTime = moment.utc(duration.asMilliseconds()).format('mm:ss');
  return <>{remainingTime !== null && <>{formattedTime}</>}</>;
};
export default Timer;
