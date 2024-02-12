import React from 'react';
import { Spinner } from 'office-ui-fabric-react';

import { Placeholder } from '../placeholder';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const spinnerStyles = {
  root: {
    marginRight: '1rem',
  },
  circle: {
    borderWidth: 2,
    width: 24,
    height: 24,
  },
};

export const NoServers = ({ sleepingServers }) => {
  const {
    components: {
      panels: {
        game: { noServers: ls },
      },
    },
  } = useLabelsSchema();
  return (
    <Placeholder
      icon="HourGlass"
      text={
        sleepingServers
          ? ls.preparingYourExperienceText
          : ls.noServersAvailableText
      }
    >
      <div className="ms-m-2 ms-Flex ms-Flex-align-items-center">
        <Spinner styles={spinnerStyles} />
        <p>{ls.lookingForServersText}</p>
      </div>
    </Placeholder>
  );
};
