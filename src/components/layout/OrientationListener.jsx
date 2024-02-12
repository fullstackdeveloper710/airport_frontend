import React from 'react';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

export const OrientationListener = () => {
  const {
    components: {
      layout: { orientationListener: ls },
    },
  } = useLabelsSchema();

  return (
    <div className="portrait-alert">
      <h4>{ls.landscapeMode}</h4>
      <FontIcon
        aria-label="Orientation2"
        iconName="Orientation2"
        style={{ fontSize: 35, color: 'var(--sr-color-white)' }}
      />
    </div>
  );
};
