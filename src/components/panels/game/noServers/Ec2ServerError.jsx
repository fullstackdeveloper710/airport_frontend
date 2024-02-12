import React from 'react';
import { Placeholder } from '../placeholder';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export const Ec2ServerError = () => {
  const {
    components: {
      panels: {
        game: { ec2ServerError: ls },
      },
    },
  } = useLabelsSchema();
  return <Placeholder icon="DefectSolid" text={ls.ec2ServerError} />;
};

export const HangTight = () => {
  const {
    components: {
      panels: {
        game: { ec2ServerError: ls },
      },
    },
  } = useLabelsSchema();
  return <Placeholder icon="HourGlass" text={ls.hangTight} />;
};

export const DuplicateSession = () => {
  const {
    components: {
      panels: {
        game: { ec2ServerError: ls },
      },
    },
  } = useLabelsSchema();
  return (
    <div>
      <Placeholder icon="DuplicateRow" text={ls.duplicateSession} />
    </div>
  );
};
