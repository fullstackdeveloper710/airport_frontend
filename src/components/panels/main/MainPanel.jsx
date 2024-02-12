import React, { useEffect, useMemo, useState } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { useDispatch, useSelector } from 'react-redux';

import { openPanel, setEventPanelSectionStack, setPanelName } from 'store/reducers/panel';
import { openSidePanel, setSidePanelKey } from 'store/reducers/sidePanel';
import { Map } from './map';
import { Emotes } from './emotes';
import { Event } from './event';
import { Settings } from './settings';
import { GroupCall } from './group-call';
import { setBoldToChannel } from 'store/reducers/channel';
import { MouseKeyControlDialog } from '../../dialogs/MouseKeyControlDialog';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { PollsMain } from './polls/PollsMain';
import { LoadVideo } from './loadvideo/LoadVideo';
import { LoadQuiz } from './loadQuiz/LoadQuiz';
import { BreakoutMain } from './breakoutControl/BreakoutMain';
import { KioskMain } from './kiosk/KioskMain';
import { PanelNavigation } from './navigation/PanelNavigation';
import { ProfileMain } from './profile/ProfileMain';
import { HelpMain } from './help/HelpMain';
import { SidePanel } from '../sidepanel/SidePanel';
import { ChatMain } from './chat/ChatMain';
import { PrivateChatHeader } from '../extra/chat/PrivateChatHeader';

const defaultWidth = '500px';

const panelStyles = {
  subComponentStyles: {
    closeButton: {
      rootHovered: {
        background: 'var(--sr-color-transparent)',
      },
      rootPressed: {
        background: 'var(--sr-color-transparent)',
      },
      iconHovered: {
        color: 'var(--sr-color-primary)',
      },
      iconPressed: {
        color: 'var(--sr-color-primary)',
      },
    },
  },
};

export const MainPanel = () => {
  const {
    components: {
      panels: {
        main: {
          mainPanel: { panels: ls, closeButtonAriaLabel },
        },
      },
    },
    activeLocale,
  } = useLabelsSchema();
  const {
    isSidePanelOpen,
    sidePanelName,
    sidePanelKey
  } = useSelector((state) => state.sidePanel);

  const dispatch = useDispatch();
  const panel = useSelector((state) => state.panel);
  const channel = useSelector((state) => state.channel);
  const currentUser = useSelector((state) => state.user.current);
  const agora = useSelector((state) => state.agora);
  const [scrolled, setScrolled] = useState(false);

  const dismissPanel = () => {
    closeOngoingMediaTracks();
    dispatch(openPanel(false));
  };
  const emptyPageStack = () => {
    dispatch(setEventPanelSectionStack([]))
  }
  const panels = useMemo(
    () => ({
      map: {
        key: 'map',
        headerText: ls.map.headerText,
        className: 'map fullWidth',
        type: PanelType.customNear,
        panelContent: <Map />,
      },
      chat: {
        key: 'chat',
        headerText: <PrivateChatHeader />,
        sidePanel: true,
        className: 'chatsSide',
        type: PanelType.customNear,
        size: defaultWidth,
        panelContent: <ChatMain />,
      },
      agenda: {
        key: 'agenda',
        onRenderHeader: () => <PanelNavigation component="event" />,
        className: 'events fullWidth',
        type: PanelType.customNear,
        panelContent: <Event dismissPanel={dismissPanel} />
      },
      profile: {
        key: 'profile',
        headerText: ls.profile.headerText,
        className: 'smPanel',
        type: PanelType.customNear,
        size: defaultWidth,
        panelContent: <ProfileMain />,
      },
      resources: {
        key: 'resources',
        onRenderHeader: () => <PanelNavigation component="resource" />,
        className: 'polls fullWidth',
        type: PanelType.customNear,
        panelContent: <KioskMain />,
      },
      breakout_assignVerbal: {
        key: 'breakout_assignVerbal',
        className: 'polls fullWidth',
        type: PanelType.customNear,
        panelContent: <BreakoutMain dismissPanel={dismissPanel} />,
      },
      breakout_assignRandom: {
        key: 'breakout_assignRandom',
        className: 'polls fullWidth',
        type: PanelType.customNear,
        panelContent: <BreakoutMain dismissPanel={dismissPanel} />,
      },
      materials_load: {
        key: 'materials_load',
        className: 'polls fullWidth',
        type: PanelType.customNear,
        panelContent: <LoadVideo dismissPanel={dismissPanel} />,
      },
      quiz_load: {
        key: 'quiz_load',
        className: 'polls fullWidth',
        type: PanelType.customNear,
        panelContent: <LoadQuiz dismissPanel={dismissPanel} />,
      },
      poll_create: {
        key: 'poll_create',
        className: 'polls fullWidth',
        type: PanelType.customNear,
        panelContent: <PollsMain section="createPoll" dismissPanel={dismissPanel} />,
      },
      quiz_results: {
        key: 'quiz_results',
        className: 'polls fullWidth',
        type: PanelType.customNear,
        panelContent: <PollsMain section="quizResults" dismissPanel={dismissPanel} />,
      },
      settings: {
        key: 'settings',
        headerText: ls.settings.headerText,
        type: PanelType.customNear,
        size: defaultWidth,
        panelContent: <Settings />,
      },
      help: {
        key: 'help',
        headerText: ls.help.headerText,
        className: 'smPanel',
        type: PanelType.customNear,
        size: defaultWidth,
        panelContent: <HelpMain />,
      },
      emotes: {
        key: 'emotes',
        headerText: 'Emote',
        className: 'smPanel',
        type: PanelType.smallFluid,
        size: defaultWidth,
        panelContent: <Emotes />,
      },
      group_call: {
        key: 'group_call',
        headerText: ls.groupCall.headerText,
        className: 'groupCallPanel',
        type: PanelType.custom,
        size: defaultWidth,
        panelContent: <GroupCall />,
      },
      info: {
        key: 'info',
        notPanel: true,
        className: 'fullWidth',
        type: PanelType.custom,
        panelContent: <MouseKeyControlDialog />,
      }
    }),
    [ls, activeLocale]
  );

  useEffect(() => {
    if (!panel?.panelName || panels?.[panel?.panelName]?.notPanel) return;
    const panelBody = document.querySelector('.ms-Panel-scrollableContent');
    const onPanelBodyScrollHandler = () => {
      if (panelBody.scrollTop > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    panelBody?.addEventListener('scroll', onPanelBodyScrollHandler);
    return () => {
      panelBody?.removeEventListener('scroll', onPanelBodyScrollHandler);
    };
  }, [panel?.panelName, panels?.[panel?.panelName]?.notPanel]);

  const closeOngoingMediaTracks = () => {
    if (agora.ongoingStream?.current?.video) {
      agora.ongoingStream?.current?.video.close();
    }
    if (agora.ongoingStream?.current?.audio) {
      agora.ongoingStream?.current?.audio.close();
    }
  };

  useEffect(() => {
    if (channel.list.length) {
      if (channel.list?.some((c) => c.isBold)) {
        channel.list.forEach((c) => {
          if (c.isBold) {
            dispatch(setBoldToChannel(c));
          }
        });
      }
    }
  }, [channel.listLoading, channel.list?.some((c) => c.isBold)]);

  useEffect(() => {
    if (panel?.key !== 'setting') {
      closeOngoingMediaTracks();
    }
  }, [panel.panelName]);


  const handleCloseSidePanel = () => {
    dispatch(openPanel(false))
    dispatch(setPanelName(null))
    dispatch(openSidePanel(false))
    dispatch(setSidePanelKey(null))
  }
  return (
    <>
      {
        panel?.panelName && (
          <>
            {panels?.[panel?.panelName]?.notPanel ? (
              panels?.[panel?.panelName]?.panelContent
            ) : (
              panels?.[panel?.panelName]?.sidePanel ?
                <SidePanel
                  className={`${panels?.[panel?.panelName]?.className}`}
                  handleDismiss={handleCloseSidePanel}
                  title={panels?.[panel?.panelName]?.headerText}
                  open={isSidePanelOpen}
                >
                  {panels?.[panel?.panelName]?.panelContent}
                </SidePanel>
                :
                <Panel
                  headerText={panels?.[panel?.panelName]?.headerText}
                  onRenderHeader={panels?.[panel?.panelName]?.onRenderHeader}
                  className={`${panels?.[panel?.panelName]?.className}${scrolled ? ' scrolled' : ''
                    }`}
                  isOpen={panel.isOpen}
                  onDismiss={dismissPanel}
                  onDismissed={emptyPageStack}
                  isBlocking={false}
                  closeButtonAriaLabel={closeButtonAriaLabel}
                  type={panels?.[panel?.panelName]?.type}
                  customWidth={
                    panels?.[panel?.panelName]?.type === PanelType.custom ||
                      panels?.[panel?.panelName]?.type === PanelType.customNear
                      ? panels?.[panel?.panelName]?.size
                      : undefined
                  }
                  styles={panelStyles}
                >
                  {console.log("Created main panel")}
                  {panels?.[panel?.panelName]?.panelContent}
                </Panel>
            )}
          </>
        )}
    </>
  );
};
