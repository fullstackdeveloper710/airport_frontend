import React from 'react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export default () => {
  const {
    pages: {
      error: { page404: ls },
    },
  } = useLabelsSchema();
  return (
    <div>
      <h1>{ls.notFoundText}</h1>
      <p>{ls.message}</p>
    </div>
  );
};