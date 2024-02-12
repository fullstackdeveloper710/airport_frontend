import React, { useEffect, useState } from 'react';
import { Icon } from '@fluentui/react';

export const Loading = () => {
  // const currUser = useSelector((state) => state.user.current)
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    // Simulating progress with a timer
    const timer = setInterval(() => {
      if (percentage < 90) {
        setPercentage((prevPercentage) => prevPercentage + Math.ceil(Math.random() * 20));
      } else {
        clearInterval(timer);
      }
    }, 1000);

    // Cleanup the timer on component unmount
    return () => clearInterval(timer);
  }, [percentage]);

  const loadingBarStyle = {
    width: `${percentage}%`
  }

  return (
    <div className="fullScreenPanel loadingPanel ms-Flex ms-Flex-align-items-center ms-Flex-justify-content-center">
      <div className="ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-between">
        <div className="loading-Container ms-mb-5 ms-Flex ms-Flex-column ms-Flex-justify-content-center">
          <div className="loader">
            <div className="bar" style={loadingBarStyle}></div>
            <div className="complete"></div>
          </div>
          <div className="loadingText">Preparing your next destination</div>
        </div>
        <div className="tips-Container ms-Flex ms-Flex-column ms-Flex-align-items-center">
          <div className="tips-Content">
            <Icon
              iconName='Headset'
              className="tips-Icon"
            />
            To fully immerse yourself turn your volume up and put headphones on.
          </div>
        </div>
      </div>
    </div>
  );
};
