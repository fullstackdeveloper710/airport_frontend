import React, { useEffect } from 'react';
import { IconButton } from '@fluentui/react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const addonButtonStyles = {
  root: {
    background: 'var(--sr-color-transparent)',
  },
  rootHovered: {
    background: 'rgba(0,0,0,0.3)',
    color: 'var(--sr-color-white)',
  },
  rootPressed: {
    background: 'rgba(0,0,0,0.3)',
    color: 'var(--sr-color-white)',
  },
  iconHovered: {
    color: 'var(--sr-color-white)',
  },
};

export const NavCollapseButton = ({
  open,
  setOpen,
  showMouseKeyControlDialog,
}) => {
  const {
    components: {
      layout: { navCollapseButton: ls },
    },
  } = useLabelsSchema();
  useEffect(() => {
    if (showMouseKeyControlDialog) {
      const element = document.getElementById('helptext-expand');
      if (element) return;
      var elemDiv = document.createElement('div');
      elemDiv.innerText =  ls.helptextExpand;
      elemDiv.id = `helptext-expand`;
      elemDiv?.classList.add('helptext');
      elemDiv.style.cssText = `position:fixed;left:85px;color:white;display:flex;align-items:center;`;
      document.body.appendChild(elemDiv);
    }
  }, [showMouseKeyControlDialog]);

  useEffect(() => {
    if (open) {
      window?.gameClient?.logUserAction?.({
        eventName: 'NAVBAR_EXTEND',
        eventSpecificData: null,
        beforeState: null,
        afterState: null,
      });
    }
  }, [open]);

  return (
    <div className="nav-area-toggler">
      <div className={`navCollpaseButton`}>
        <div
          onClick={() => setOpen((p) => !p)}
          id={'nav-expand'}
          className={`ms-Flex ms-Flex-column ms-Flex-justify-content-center ms-Flex-align-items-center cursor`}
        >
          <IconButton
            styles={addonButtonStyles}
            iconProps={{
              iconName: open ? 'ChevronRightSmall' : 'ChevronLeftSmall',
            }}
            aria-label="ChevronUpSmall"
          />
          {/* <span className="button-text" style={{ fontSize: 10 }}  data-bold="true">
            { open  ? ls.navExpand.textCollapse : ls.navExpand.textExpand}
          </span> */}
        </div>
      </div>
    </div>
  );
};
