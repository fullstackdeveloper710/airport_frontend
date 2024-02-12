import React, { Fragment, useEffect, useState } from 'react';
import { BorderedButton } from 'components/common/BorderedButton';
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';
import { useDispatch, useSelector } from 'react-redux';
import { setSidePanelKey, setSidePanelName } from 'store/reducers/sidePanel'
import { useLabelsSchema } from 'i18n/useLabelsSchema';

const pollExample = {
    id: 1,
    text: "This is the first question",
    options: [
        {
            key: "opt_1",
            text: "Option 1"
        },
        {
            key: "opt_2",
            text: "Option 2"
        },
        {
            key: "opt_3",
            text: "Option 3"
        },
        {
            key: "opt_4",
            text: "Option 4"
        }
    ]
}

export const PollQuestionPanel = () => {
    const {
        components: {
            layout: { navigation: ls },
        },
    } = useLabelsSchema();
    const [choiceValue, setChoiceValue] = useState(null)
    const [poll, setPoll] = useState([])

    const { polls } = useSelector(state => state)
    const dispatch = useDispatch()

    const handleChoiceChange = (ev, option) => {
        setChoiceValue(option.key)
    }

    const handleSubmitPoll = () => {
        console.log("POLL ANSWER", choiceValue)
        dispatch(setSidePanelKey("pollResults"))
        dispatch(setSidePanelName(ls.listNav["pollResults"]))
    }

    useEffect(() => {
        const currentPoll = {
            question: polls.currentPoll.question,
            pollOptions: polls.currentPoll.pollOptions.map(option => {
                return {
                    key: option.id,
                    text: option.optionName
                }
            })
        }
        setPoll(currentPoll)
    }, [])
    return (
        <Fragment>
            <div className='virtualClassroom-poll-question'>
                {polls.currentPoll.question}
            </div>
            <div className='virtualClassroom-choice-grp'>
                <ChoiceGroup
                    onChange={handleChoiceChange}
                    selectedKey={choiceValue}
                    options={poll.pollOptions}
                />
            </div>
            <div className='virtualClassroom-confirm-btn'>
                <BorderedButton onClick={handleSubmitPoll}>Submit</BorderedButton>
            </div>
        </Fragment>
    );
};