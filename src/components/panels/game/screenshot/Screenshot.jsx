import React from 'react';
import {
  PrimaryButton,
  Spinner,
  SpinnerSize,
  IconButton,
} from 'office-ui-fabric-react';
import { setScreenshot } from 'store/reducers/game';
import { useDispatch } from 'react-redux';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { enhancedSocialShare } from 'utils/eventVariables';
import {SocialShare} from 'components/common'
const spinnerStyles = {
  circle: {
    color: 'var(--sr-color-primary)',
  },
  root: {
    margin: '10px 0',
  },
};

export const Screenshot = ({ screenshot, onShare, loading }) => {
  const {
    components: {
      panels: {
        game: { screenShot: ls },
      },
    },
  } = useLabelsSchema();
  const dispatch = useDispatch();
  const closePreview = () => {
    dispatch(setScreenshot(null));
  };
  return (
    <div className="roundPanel screenshotPanel ms-Flex ms-Flex-column ms-Flex-align-items-center ms-p-1">
      <IconButton
        className="close-button"
        iconProps={{ iconName: 'Clear' }}
        onClick={closePreview}
      />
      <img className="screenshot" src={screenshot} />
      {enhancedSocialShare ? (
        <SocialShare />
      ) : !loading ? (
        <PrimaryButton
          className="ms-mt-1"
          text={ls.shareOnTwitterText}
          onClick={onShare}
        />
      ) : (
        <Spinner size={SpinnerSize.large} styles={spinnerStyles} />
      )}
    </div>
  );
};
