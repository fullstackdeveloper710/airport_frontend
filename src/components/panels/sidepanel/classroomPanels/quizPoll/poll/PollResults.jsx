import React, { Fragment, useEffect, useState } from 'react';
import { ResultsProgressIndicator } from 'components/common/ResultsProgressIndicator';
import classroomService from 'services/classroomService';
import { BorderedButton } from 'components/common/BorderedButton';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentPoll } from 'store/reducers/polls';
import { useLabelsSchema } from 'i18n/useLabelsSchema';
import { openSidePanel, setClassroomPanelOpen, setSidePanelKey, setSidePanelName } from 'store/reducers/sidePanel';

const participantCount = 12

export const PollResults = () => {

    const [pollResults, setPollsResults] = useState(null)
    const { user, polls } = useSelector(state => state)
    const {
        components: {
            layout: { navigation: ls },
        },
    } = useLabelsSchema();
    const dispatch = useDispatch()
    const handleClosePoll = async () => {
        const res = await classroomService.updatePollStatus(70, polls.currentPoll.id, "CLOSED")
        dispatch(setCurrentPoll(null))
        dispatch(setSidePanelKey('pollResults'))
        dispatch(setSidePanelName(ls.listNav["pollResults"]))
        dispatch(openSidePanel(false))
        dispatch(setClassroomPanelOpen(false))
    }

    useEffect(() => {
        const getPollsResults = async (pollId) => {
            const agendaId = 70
            const pollResults = await classroomService.getPollsResults(agendaId, pollId)
            const results = {
                id: pollResults.pollId,
                text: "This is a question",
                options: pollResults.pollOptions.map(result => {
                    return {
                        id: result.id,
                        text: result.optionName,
                        pollCount: result.userSelectedOptionCount,
                    }
                })
            }
            setPollsResults(results)
        }
        if (polls?.currentPoll) {
            getPollsResults(polls?.currentPoll.id)
        }
    }, [polls?.currentPoll])
    return (
        <Fragment>
            <div className='virtualClassroom-poll-results-container'>
                <div className='virtualClassroom-poll-question'>
                    {pollResults?.text}
                </div>
                <div className='virtualClassroom-progress-grp'>
                    {
                        pollResults?.options.map((poll) => {
                            return (
                                <div className='virtualClassroom-progress-container' key={poll.id}>
                                    <div className='virtualClassroom-progress-label'>
                                        <div className='virtualClassroom-progress-opt'>
                                            {poll.text}
                                        </div>
                                        <div className='virtualClassroom-progress-percent'>
                                            {'(' + poll.pollCount + ')' + ` ${(poll.pollCount * 100) / participantCount}` + '%'}
                                        </div>
                                    </div>
                                    <div className='virtualClassroom-progress-meter'>
                                        <ResultsProgressIndicator percentComplete={(poll.pollCount) / participantCount} />
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                {
                    user?.current?.roles?.find(role => role === "ROLE_PRESENTER") &&
                    <div className='virtualClassroom-confirm-btn'>
                        <BorderedButton onClick={handleClosePoll}>Confirm</BorderedButton>
                    </div>
                }
            </div>
        </Fragment>
    );
};