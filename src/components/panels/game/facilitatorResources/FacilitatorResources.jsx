import React, { Fragment, useState } from 'react';
import { ActionButton } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setShowFacilitatorResources,
  setDialogOpen,
  setShowFacilitatorResourcesMinimizeOpts,
  setFacilitatorResourcesActive,
} from 'store/reducers/smartScreen';
import { ClassesMenu } from './ClassesMenu';
import { ClassesResources } from './ClassesResources';
import { PublishedResource } from './PublishedResource';

const actionButtonStyles = {
  root: {
    fontSize: 24,
    border: `1px solid var(--sr-color-white)`,
    margin: '8px 32px',
    padding: '8px 0',
    height: 50,
  },
  rootHovered: {
    backgroundColor: 'var(--sr-color-primary)',
    color: 'var(--sr-color-white)',
  },
  icon: {
    color: 'var(--sr-color-white)',
    marginRight: 8,
    paddingTop: 2,
  },
  iconHovered: {
    color: 'var(--sr-color-white)',
  },
  iconPressed: {
    color: 'var(--sr-color-white)',
  },
  textContainer: {
    fontFamily: 'var(--sr-font-secondary)',
  },
};

export const FacilitatorResources = () => {
  const [stage, setStage] = useState('CLASS_MENU');
  const [currClass, setCurrClass] = useState('');
  const [currPublishedResourceLink, setCurrPublishedResourceLink] =
    useState('');
  const [currPublishedResourceType, setCurrPublishedResourceType] =
    useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const { showFacilitatorResources, showFacilitatorResourcesMinimizeOpts } =
    useSelector((state) => state.smartScreen);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(setShowFacilitatorResources(false));
    dispatch(setFacilitatorResourcesActive(false));
    setCurrClass('');
    setCurrPublishedResourceLink('');
    setCurrPublishedResourceType('');
    setStage('CLASS_MENU');
    window.gameClient.setActiveSmartScreenMode('Idle');
    dispatch(setDialogOpen(true));
  };

  const handleBack = () => {
    switch (stage) {
      case 'PUBLISHED_RESOURCE': {
        setStage('CLASS_RESOURCES');
        break;
      }
      case 'CLASS_RESOURCES': {
        setStage('CLASS_MENU');
        break;
      }
      default: {
        handleClose();
      }
    }
  };

  const handleMinimize = () => {
    dispatch(setShowFacilitatorResources(false));
    dispatch(setShowFacilitatorResourcesMinimizeOpts(true));
    window?.gameClient?.emitUIInteraction({
      method: 'ToggleSmartScreenView',
      payload: {
        state: false,
      },
    });
  };

  const handleMaximize = () => {
    dispatch(setShowFacilitatorResources(true));
    dispatch(setShowFacilitatorResourcesMinimizeOpts(false));
    window?.gameClient?.emitUIInteraction({
      method: 'ToggleSmartScreenView',
      payload: {
        state: true,
      },
    });
  };

  const toggleFullscreen = () => {
    //Handle Fullscreen
    setFullscreen(!fullscreen);
  };

  return (
    <Fragment>
      <div
        className="smartScreenFacilitatorResources"
        style={showFacilitatorResources ? {} : { display: 'none' }}
      >
        <div className="facilitatorResources-btn-grp">
          <ActionButton
            className="ms-motion-fadeIn exit-btn facilitatorResources-back-btn"
            iconProps={{ iconName: 'Back' }}
            onClick={handleBack}
          />
          <div className="facilitatorResources-btn-grp-inner">
            <ActionButton
              className="ms-motion-fadeIn exit-btn facilitatorResources-inner-btn"
              iconProps={{ iconName: 'ChromeMinimize' }}
              onClick={handleMinimize}
            />
            <ActionButton
              className="ms-motion-fadeIn exit-btn facilitatorResources-inner-btn"
              iconProps={{
                iconName: fullscreen ? 'BackToWindow' : 'ChromeFullScreen',
              }}
              onClick={toggleFullscreen}
            />
            <ActionButton
              className="ms-motion-fadeIn exit-btn facilitatorResources-inner-btn"
              iconProps={{ iconName: 'Cancel' }}
              onClick={handleClose}
            />
          </div>
        </div>

        {stage === 'CLASS_MENU' ? (
          <ClassesMenu setStage={setStage} setCurrclassName={setCurrClass} />
        ) : stage === 'CLASS_RESOURCES' ? (
          <ClassesResources
            setStage={setStage}
            currclassName={currClass}
            setCurrPublishedResourceLink={setCurrPublishedResourceLink}
            setCurrPublishedResourceType={setCurrPublishedResourceType}
          />
        ) : (
          <PublishedResource
            selectedResourceLink={currPublishedResourceLink}
            selectedResourceType={currPublishedResourceType}
          />
        )}
      </div>
      <div className="lecture">
        {showFacilitatorResourcesMinimizeOpts && (
          <div className="gamePanel roundPanel ms-Flex ms-Flex-column">
            <div className="ms-Flex ms-Flex-column">
              <ActionButton
                className="ms-Flex ms-Flex-justify-content-center continue-lecture-btn"
                styles={actionButtonStyles}
                iconProps={{ iconName: 'ScreenCast' }}
                text="Continue"
                onClick={handleMaximize}
              />
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
};
