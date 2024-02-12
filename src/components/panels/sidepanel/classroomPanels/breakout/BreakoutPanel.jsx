import React, { Fragment, useEffect, useState } from 'react';
import { BorderedButton } from 'components/common/BorderedButton';
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePanel } from 'store/reducers/virtualClassroom';
import { setPanelName, openPanel } from 'store/reducers/panel';
import { openSidePanel } from 'store/reducers/sidePanel';
import { Icon } from '@fluentui/react';
import { setBreakoutType, setRoomCount, setRoomsCount } from 'store/reducers/breakout';

const MAX_MEMBER_PER_BREAKOUT = 8

const sampleData = [
    {
        surrealUsers: {
            id: 26,
            firstName: "Tarang",
            lastName: "Padia",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 27,
            firstName: "John",
            lastName: "Doe",
            roles: '["ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 28,
            firstName: "Jane",
            lastName: "Smith",
            roles: '["ROLE_ATTENDEE", "ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 29,
            firstName: "Alice",
            lastName: "Johnson",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 30,
            firstName: "Bob",
            lastName: "Williams",
            roles: '["ROLE_ORGANIZER"]'
        }
    },
    {
        surrealUsers: {
            id: 31,
            firstName: "Eva",
            lastName: "Miller",
            roles: '["ROLE_ATTENDEE", "ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 32,
            firstName: "Alex",
            lastName: "Turner",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 33,
            firstName: "Olivia",
            lastName: "Brown",
            roles: '["ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 34,
            firstName: "David",
            lastName: "Garcia",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 35,
            firstName: "Sophie",
            lastName: "Clark",
            roles: '["ROLE_ATTENDEE", "ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 36,
            firstName: "Charlie",
            lastName: "Cooper",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 37,
            firstName: "Emma",
            lastName: "Wilson",
            roles: '["ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 38,
            firstName: "Daniel",
            lastName: "White",
            roles: '["ROLE_ATTENDEE", "ROLE_ORGANIZER"]'
        }
    },
    {
        surrealUsers: {
            id: 39,
            firstName: "Grace",
            lastName: "Anderson",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 40,
            firstName: "Harry",
            lastName: "Hill",
            roles: '["ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 41,
            firstName: "Ivy",
            lastName: "Adams",
            roles: '["ROLE_ATTENDEE", "ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 42,
            firstName: "Jack",
            lastName: "Jones",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 43,
            firstName: "Katherine",
            lastName: "King",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 44,
            firstName: "Leo",
            lastName: "Lopez",
            roles: '["ROLE_SPEAKER"]'
        }
    },
    {
        surrealUsers: {
            id: 45,
            firstName: "Mia",
            lastName: "Moore",
            roles: '["ROLE_ATTENDEE"]'
        }
    },
    {
        surrealUsers: {
            id: 46,
            firstName: "Noah",
            lastName: "Nelson",
            roles: '["ROLE_ATTENDEE", "ROLE_SPEAKER"]'
        }
    }
    // ... Add more as needed
];

export const BreakoutPanel = () => {
    const [choiceValue, setChoiceValue] = useState("breakout_assignRandom")
    const [roomCount, setRoomCount] = useState(0)
    const [attendeesCount, setAttendeesCount] = useState(null)
    const [loading, setLoading] = useState(true)

    const dispatch = useDispatch()

    const options = [
        { key: 'breakout_assignRandom', text: 'Assign randomly' },
        { key: 'breakout_assignVerbal', text: 'Assign verbally' }
    ];

    const handleChoiceChange = (ev, option) => {
        setChoiceValue(option.key)
    }

    const handleConfirmBreakoutOpt = () => {
        const selectedOpt = choiceValue
        const splitOpts = selectedOpt.split('_')
        dispatch(setBreakoutType(splitOpts[1]))
        dispatch(setRoomsCount(roomCount))
        dispatch(setActivePanel({
            utility: splitOpts[0],
            option: splitOpts[1]
        }))
        dispatch(setPanelName(choiceValue))
        dispatch(openPanel(true))
        dispatch(openSidePanel(false))
    }
    const handleBreakoutRoomCountChange = (e) => {
        // Allow only numeric input
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        if (Number(numericValue) >= attendeesCount)
            setRoomCount(attendeesCount);
        else if (Number(numericValue) <= Math.ceil(attendeesCount / MAX_MEMBER_PER_BREAKOUT))
            setRoomCount(Math.ceil(attendeesCount / MAX_MEMBER_PER_BREAKOUT))
    };

    const handleIncreaseRoomCount = () => {
        if (roomCount < attendeesCount)
            setRoomCount(roomCount + 1)
    }
    const handleDecreaseRoomCount = () => {
        if (roomCount > Math.ceil(attendeesCount / MAX_MEMBER_PER_BREAKOUT))
            setRoomCount(roomCount - 1)
    }

    useEffect(() => {
        const getAttendees = async () => {
            // const invitees = agenda.invitees
            setAttendeesCount(sampleData.length)
            setRoomCount(Math.ceil(sampleData.length / MAX_MEMBER_PER_BREAKOUT))
            setLoading(false)
        }
        getAttendees()
    }, [])
    return (
        <Fragment>
            {!loading &&
                <>
                    <div className="breakoutCount">
                        <p>Create rooms</p>
                        <div className="breakoutTimeInput">
                            <input type="text" value={roomCount} onChange={handleBreakoutRoomCountChange} />
                            <div className="controls">
                                <Icon iconName="ChevronUp" onClick={handleIncreaseRoomCount} />
                                <Icon iconName="ChevronDown" onClick={handleDecreaseRoomCount} />
                            </div>
                        </div>
                    </div>
                    <div className='virtualClassroom-choice-grp'>
                        <ChoiceGroup
                            onChange={handleChoiceChange}
                            selectedKey={choiceValue}
                            options={options}
                        />
                    </div>
                    <div className='virtualClassroom-confirm-btn'>
                        <BorderedButton onClick={handleConfirmBreakoutOpt}>Confirm</BorderedButton>
                    </div>
                </>
            }
        </Fragment>
    );
};