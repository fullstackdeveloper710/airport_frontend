import React from 'react';
import { ProgressIndicator } from 'office-ui-fabric-react';

export const ResultsProgressIndicator = ({percentComplete}) => {
    console.log("PERCENT COMPLETED", percentComplete)
  return (
    <ProgressIndicator percentComplete={percentComplete} />
  );
};