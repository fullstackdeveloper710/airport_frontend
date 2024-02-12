import React, { Fragment, useState } from 'react';
import { BorderedButton } from 'components/common/BorderedButton';
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';
import { useDispatch } from 'react-redux';
import { setActivePanel } from 'store/reducers/virtualClassroom';
import { setPanelName, openPanel } from 'store/reducers/panel';
import { openSidePanel } from 'store/reducers/sidePanel';

export const QuizPollPanel = () => {
    const [choiceValue, setChoiceValue] = useState("poll_create")
    const dispatch = useDispatch()
    const options = [
        { key: 'poll_create', text: 'Create Poll' },
        { key: 'quiz_load', text: 'Load Quiz' }
    ];

    const handleChoiceChange = (ev, option) => {
        setChoiceValue(option.key)
    }

    const handleConfirmQuizPollOpt = () => {
        const selectedOpt = choiceValue
        const splitOpts = selectedOpt.split('_') 
        dispatch(setActivePanel({
            utility : splitOpts[0],
            option : splitOpts[1]
        }))
        dispatch(setPanelName(choiceValue))
        dispatch(openPanel(true))
        dispatch(openSidePanel(false))
    }

    return (
        <Fragment>
            <div className='virtualClassroom-choice-grp'>
                <ChoiceGroup
                    onChange={handleChoiceChange}
                    selectedKey={choiceValue}
                    options={options}
                />
            </div>
            <div className='virtualClassroom-confirm-btn'>
                <BorderedButton onClick={handleConfirmQuizPollOpt}>Confirm</BorderedButton>
            </div>
        </Fragment>
    );
};