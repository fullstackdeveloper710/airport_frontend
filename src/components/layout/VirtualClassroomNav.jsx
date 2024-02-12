import React, { Fragment, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nav } from '@fluentui/react';
import { registerIcons } from '@fluentui/react';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import SvgBreakoutIcon from 'assets/images/icons/BreakoutIcon';
import SvgMuteAllIcon from 'assets/images/icons/MuteAllIcon';
import SvgParticipantsIcon from 'assets/images/icons/ParticipantsIcon';
import SvgPresentIcon from 'assets/images/icons/PresentIcon';
import SvgQuizPollIcon from 'assets/images/icons/QuizPollIcon';
import SvgRaiseHandIcon from 'assets/images/icons/RaiseHandIcon';
import { openSidePanel, setClassroomPanelOpen, setSidePanelKey, setSidePanelName } from 'store/reducers/sidePanel';
import quiz from 'store/reducers/quiz';
import { openPanel, setPanelName } from 'store/reducers/panel';

const navStyles = {
  link: {
    padding: '0.5rem 0',
    height: 64,
  },
};

registerIcons({
  icons: {
    BreakoutIcon: <SvgBreakoutIcon />,
    ParticipantsIcon: <SvgParticipantsIcon />,
    QuizPollIcon: <SvgQuizPollIcon />,
    MuteAllIcon: <SvgMuteAllIcon />,
    PresentIcon: <SvgPresentIcon />,
    RaiseHandIcon: <SvgRaiseHandIcon />
  }
});

export const VirtualClassroomNav = () => {
  const {
    components: {
      layout: { navigation: ls },
    },
  } = useLabelsSchema();
  const { sidePanelKey } = useSelector((state) => state.sidePanel);
  const currentUser = useSelector((store) => store.user.current);
  const { game, quiz, polls, user } = useSelector((state) => state);
  const dispatch = useDispatch();
  const isPresenter = currentUser.roles.indexOf('ROLE_PRESENTER') !== -1;
  let links

  const sidePanelKeyRef = useRef(null);

  useEffect(() => {
    sidePanelKeyRef.current = sidePanelKey;
  }, [sidePanelKey]);

  useEffect(() => {
    document.addEventListener('keydown', function (event) {
      const key = event.key.toLowerCase();
      if (!isPresenter && game?.currentRoom && game?.currentRoom?.nextMapName.includes("Classroom")) {
        if (key === 'm') {
          if (sidePanelKeyRef?.current === "quizQuestion") {
            dispatch(setSidePanelKey(null))
            dispatch(setSidePanelName(null))
            dispatch(openSidePanel(false))
          } else {
            dispatch(setSidePanelKey("quizQuestion"))
            dispatch(setSidePanelName(ls.listNav["quizQuestion"]))
            dispatch(openSidePanel(true))
            dispatch(setClassroomPanelOpen(true))
          }
        }
        if (key === 'n') {
          if (sidePanelKeyRef?.current === "pollQuestion") {
            dispatch(setSidePanelKey(null))
            dispatch(setSidePanelName(null))
            dispatch(openSidePanel(false))
          } else {
            dispatch(setSidePanelKey("pollQuestion"))
            dispatch(setSidePanelName(ls.listNav["pollQuestion"]))
            dispatch(openSidePanel(true))
            dispatch(setClassroomPanelOpen(true))
          }
        }
      }
    });
    return () => {
      document.removeEventListener('keydown', function (event) {
        const key = event.key.toLowerCase();
        if (!isPresenter && game?.currentRoom && game?.currentRoom?.nextMapName.includes("Classroom")) {
          if (key === 'm') {
            if (sidePanelKeyRef?.current === "quizQuestion") {
              dispatch(setSidePanelKey(null))
              dispatch(setSidePanelName(null))
              dispatch(openSidePanel(false))
            } else {
              dispatch(setSidePanelKey("quizQuestion"))
              dispatch(setSidePanelName(ls.listNav["quizQuestion"]))
              dispatch(openSidePanel(true))
              dispatch(setClassroomPanelOpen(true))
            }
          }
          if (key === 'n') {
            if (sidePanelKeyRef?.current === "pollQuestion") {
              dispatch(setSidePanelKey(null))
              dispatch(setSidePanelName(null))
              dispatch(openSidePanel(false))
            } else {
              dispatch(setSidePanelKey("pollQuestion"))
              dispatch(setSidePanelName(ls.listNav["pollQuestion"]))
              dispatch(openSidePanel(true))
              dispatch(setClassroomPanelOpen(true))
            }
          }
        }
      });
    }
  }, [])


  //Facilitator additional options
  const facilitatorNav = [
    {
      key: 'muteAll',
      iconProps: {
        iconName: 'MuteAllIcon',
      },
      info: ls.listNav.chatInfo,
      title: ls.listNav.chatInfo,
    },
    {
      key: 'quizPoll',
      iconProps: {
        iconName: 'QuizPollIcon',
      },
      info: ls.listNav.agendaInfo,
      title: ls.listNav.agendaInfo,
    },
    {
      key: 'breakout',
      iconProps: {
        iconName: 'BreakoutIcon'
      },
      info: ls.listNav.profileInfo,
      title: ls.listNav.profileInfo,
    }
  ]

  //Learner additional options
  const learnerNav = [
    {
      key: 'raiseHand',
      iconProps: {
        iconName: 'RaiseHandIcon'
      },
      info: ls.listNav.profileInfo,
      title: ls.listNav.profileInfo,
    },
  ]

  //Default options (common for facilitator and learner)
  const listNav = [
    {
      key: 'participantList',
      iconProps: {
        iconName: 'ParticipantsIcon',
      },
      info: ls.listNav.mapInfo,
      title: ls.listNav.mapInfo,
    },
    {
      key: 'presentScreen',
      iconProps: {
        iconName: 'PresentIcon',
      },
      info: ls.listNav.videoInfo,
      title: ls.listNav.videoInfo,
    }
  ];

  const initSidePanel = (currKey, key) => {
    if (currKey === key) {
      dispatch(setSidePanelKey(null))
      dispatch(setSidePanelName(null))
      dispatch(openSidePanel(false))
    } else {
      if (key === "quizPoll") {
        if (user?.current?.roles?.find(role => role === "ROLE_PRESENTER")) {
          if (quiz?.currentQuiz) {
            key = "quiz_results"
            dispatch(setPanelName(key));
            dispatch(openPanel(true));
            return
          }
          else if (polls?.currentPoll) {
            key = "pollResults"
          }
        }
      }
      dispatch(setSidePanelKey(key))
      dispatch(setSidePanelName(ls.listNav[key]))
      dispatch(openSidePanel(true))
      dispatch(setClassroomPanelOpen(true))
    }
  }

  const toggleMuteAll = () => {
    console.log("Toggle MuteAll")
  };

  const initPresentScreen = () => {
    console.log("Initiate Presentation Screen")
  };

  const initRaiseHand = () => {
    console.log("Initiate Raise Hand")
  };

  const onLinkClick = (_ev, item) => {
    let currKey = sidePanelKey
    switch (item.key) {
      case "muteAll": {
        return toggleMuteAll();
      }
      case "presentScreen": {
        return initPresentScreen();
      }
      case "raiseHand": {
        return initRaiseHand();
      }
      default: {
        return initSidePanel(currKey, item.key)
      }
    }
  };
  if (isPresenter) {
    links = [...listNav, ...facilitatorNav]
  } else {
    links = [...listNav, ...learnerNav]
  }
  return (
    <Fragment>
      <Nav
        groups={[
          {
            links,
          },
        ]}
        className='show-nav'
        styles={navStyles}
        onLinkClick={onLinkClick}
        selectedKey={sidePanelKey}
      />
    </Fragment>
  );
};
