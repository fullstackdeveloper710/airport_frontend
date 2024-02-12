import React, { useEffect, useState } from 'react';
import { ProgressIndicator } from 'office-ui-fabric-react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const intervalDelay = 100;
const intervalIncrement = 0.01;

export const Progress = () => {
  const {
    components: {
      common: { progressIndicator: ls },
    },
  } = useLabelsSchema();
  const [percentComplete, setPercentComplete] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPercentComplete((intervalIncrement + percentComplete) % 1);
    }, intervalDelay);

    return () => {
      clearInterval(id);
    };
  });

  return (
    <ProgressIndicator label={ls.label} percentComplete={percentComplete} />
  );
};
