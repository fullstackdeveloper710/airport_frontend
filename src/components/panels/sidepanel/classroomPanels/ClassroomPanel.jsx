import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openSidePanel, setClassroomPanelOpen, setSidePanelKey, setSidePanelName } from 'store/reducers/sidePanel';
import { SidePanel } from 'components/panels/sidepanel/SidePanel';
import { BreakoutPanel } from './breakout/BreakoutPanel';
import { QuizPollPanel } from './quizPoll/QuizPollPanel';
import { PollQuestionPanel } from './quizPoll/poll/PollQuestion';
import { QuizQuestionPanel } from './quizPoll/quiz/QuizQuestion';
import { PollResults } from './quizPoll/poll/PollResults';
import { QuizResults } from './quizPoll/quiz/QuizResults';
import { ParticipantsPanel } from './participants/ParticipantsPanel';
import { getAgendaPollsList, setCurrentPoll } from 'store/reducers/polls';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import classroomService from 'services/classroomService';
import { setCurrentQuiz } from 'store/reducers/quiz';
import { openPanel, setPanelName } from 'store/reducers/panel';

export const ClassroomPanel = () => {
    const {
        isSidePanelOpen,
        sidePanelName,
        sidePanelKey,
        isClassroomPanelOpen
    } = useSelector((state) => state.sidePanel);

    const {
        components: {
            layout: { navigation: ls },
        },
    } = useLabelsSchema();
    const { polls, quiz, user, agenda } = useSelector(state => state)
    const dispatch = useDispatch();

    const handleCloseSidePanel = () => {
        dispatch(openSidePanel(false))
        dispatch(setSidePanelKey(null))
        dispatch(setClassroomPanelOpen(false))
    }

    useEffect(() => {
        console.log("CURRENT AGENDA", agenda)
    }, [])

    useEffect(() => {
        const checkForActivePollOrQuiz = async () => {
            const agendaId = 70
            try {
                const polls = await classroomService.getPollsByAgenda(agendaId)
                const activePoll = polls.find(poll => poll.pollStatus === "CREATED")
                if (activePoll) {
                    dispatch(setCurrentPoll(activePoll))
                    return
                }
                else {
                    dispatch(setCurrentPoll(null))
                }
            }
            catch (e) {
                console.log(e)
            }

            try {
                const quizzes = await classroomService.getQuizzesByAgenda(1, agendaId)
                const activeQuizz = quizzes.find(quiz => quiz.quizLoadStatus === "CREATED")
                if (activeQuizz) {
                    dispatch(setCurrentQuiz({
                        quizLoadId : activeQuizz?.id,
                        quizId: activeQuizz?.quiz?.id,
                        programId: activeQuizz?.quiz?.program?.id
                    }))
                    return
                }
                else {
                    dispatch(setCurrentQuiz(null))
                }
            }
            catch (e) {
                console.log(e)
            }

        }
        checkForActivePollOrQuiz()
    }, [])

    const getUserQuizSubmitStatus = async () => {
        const status = await classroomService.getQuizSubmitStatus(1, 2, 11)
        return status
    }
    const getUserPollSubmitStatus = async (pollId) => {
        const agendaId = 70
        const status = await classroomService.getPollSubmitStatus(agendaId, pollId)
        return status
    }
    const initializeSidePanel = (key, name) => {
        dispatch(setSidePanelKey(key))
        dispatch(setSidePanelName(name))
        dispatch(openSidePanel(true))
        dispatch(setClassroomPanelOpen(true))
    }
    useEffect(() => {
        if (polls?.currentPoll) {
            if (user?.current?.roles?.find(role => role === "ROLE_PRESENTER")) {
                initializeSidePanel("pollResults", ls.listNav["pollResults"])
            }
            else if (user?.current?.roles?.find(role => role === "ROLE_ATTENDEE")) {
                const status = getUserPollSubmitStatus(polls.currentPoll.id)
                if (!status.userSubmittedOpinion) {
                    initializeSidePanel("pollQuestion", ls.listNav["pollQuestion"])
                }
                else {
                    initializeSidePanel("pollResults", ls.listNav["pollResults"])
                }
            }
        }
        else if (quiz?.currentQuiz) {
            if (user?.current?.roles?.find(role => role === "ROLE_PRESENTER")) {
                dispatch(setPanelName('quiz_results'));
                dispatch(openPanel(true));
            }
            else if (user?.current?.roles?.find(role => role === "ROLE_ATTENDEE")) {
                const status = getUserQuizSubmitStatus()
                if (status.userSubmittedOpinion) {
                    initializeSidePanel("quizQuestion", ls.listNav["quizQuestion"])
                }
                else {
                    initializeSidePanel("quizResults", ls.listNav["quizResults"])
                }
            }
        }
    }, [polls?.currentPoll, quiz?.currentQuiz])

    return (
        <Fragment>
            <SidePanel title={sidePanelName} handleDismiss={handleCloseSidePanel} open={isSidePanelOpen && isClassroomPanelOpen}>

                {
                    sidePanelKey === "breakout"
                        ? (
                            <BreakoutPanel />
                        )
                        : (
                            sidePanelKey === "quizPoll"
                                ? (
                                    <QuizPollPanel />
                                )
                                : (
                                    sidePanelKey === "participantList"
                                        ? (
                                            <ParticipantsPanel />
                                        )
                                        : (
                                            sidePanelKey === "pollResults"
                                                ? (
                                                    <PollResults />
                                                )
                                                : (
                                                    sidePanelKey === "quizResults"
                                                        ? (
                                                            <QuizResults />
                                                        )
                                                        : (
                                                            sidePanelKey === "pollQuestion"
                                                                ? (
                                                                    <PollQuestionPanel />
                                                                )
                                                                : (
                                                                    sidePanelKey === "quizQuestion"
                                                                        ? (
                                                                            <QuizQuestionPanel />
                                                                        )
                                                                        : (
                                                                            <></>
                                                                        )
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                }
            </SidePanel>
        </Fragment>
    );
};