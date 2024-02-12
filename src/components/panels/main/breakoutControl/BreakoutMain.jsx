import { Dropdown, FontIcon, Icon, TooltipHost } from "@fluentui/react";
import { BorderedButton } from "components/common/BorderedButton";
import React, { useEffect, useState, useCallback } from "react";
import EnterIcon from '../../../../assets/images/icons/Vector.svg'
import { sample } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { setMessage } from "store/reducers/message";
import classroomService from "services/classroomService";
const dropdownStyles = { dropdown: { width: '50px' } };

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
]

const calloutProps = { gapSpace: 0 }

const hostStyles = {
    styles: {
        content: { color: 'var(--sr-color-primary-text)' },
    },
    calloutProps: {
        styles: {
            beak: { background: 'var(--sr-color-transparent)' },
            beakCurtain: { background: 'var(--sr-color-background-beakCurtain)' },
        },
    },
};

export const BreakoutMain = ({ dismissPanel }) => {
    const [rooms, setRooms] = useState(null)
    const [agendaTopics, setAgendaTopics] = useState([])
    const [roomCol1, setRoomCol1] = useState([])
    const [roomCol2, setRoomCol2] = useState([])
    const [roomCol3, setRoomCol3] = useState([])
    const [breakoutDuration, setBreakoutDuration] = useState(0)
    const [draggedMember, setDraggedMember] = useState()
    const [breakoutStarted, setBreakoutStarted] = useState(false)
    const [userDetailsMapping, setUserDetailsMapping] = useState(null)
    const [mergeRoomOptions, setMergeRoomOptions] = useState(null)
    const [mergeRoomOption1, setMergeRoomOption1] = useState(null)
    const [mergeRoomOption2, setMergeRoomOption2] = useState(null)

    const { breakout } = useSelector(state => state)
    const dispatch = useDispatch()


    const swapOrMoveMember = (room1Index, room2Index, member1, member2) => {
        const roomsArray = [...rooms]
        const room1 = roomsArray[room1Index]
        const room2 = roomsArray[room2Index]

        let room1Members = room1.breakoutRoomUserIds
        let room2Members = room2.breakoutRoomUserIds

        if (member2) {
            const member1Index = room1Members.indexOf(member1)
            room1Members[member1Index] = member2
        }
        else {
            if (room2Members.length < MAX_MEMBER_PER_BREAKOUT) {
                room1Members = room1Members.filter(member => member != member1)
            }
        }
        room1.breakoutRoomUserIds = room1Members

        if (member2) {
            const member2Index = room2Members.indexOf(member2)
            room2Members[member2Index] = member1
        }
        else {
            if (room2Members.length < MAX_MEMBER_PER_BREAKOUT)
                room2Members.push(member1)
            else
                dispatch(
                    setMessage(
                        {
                            message: "Room members count cannot exceed 8",
                            type: 'error',
                            timeout: 5000,
                        }
                    )
                )
        }
        room2.breakoutRoomUserIds = room2Members

        roomsArray[room1Index] = room1
        roomsArray[room2Index] = room2
        setRooms(roomsArray)
    }

    const shuffleAttendees = (attendees) => {
        for (let i = attendees.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [attendees[i], attendees[j]] = [attendees[j], attendees[i]];
        }
        return attendees;
    }

    const updateDropdownRoomOptions = () => {
        const roomOptions = rooms?.map((room, index) => {
            return {
                key: index,
                text: room.name
            }
        })
        setMergeRoomOptions(roomOptions)
        setMergeRoomOption1(0)
        setMergeRoomOption2(rooms?.length > 1 ? 1 : 0)
    }

    const assignRooms = (attendees) => {
        const roomsInit = []
        for (let i = 0; i < breakout.roomCount; i++) {
            roomsInit.push(
                {
                    topicId: null,
                    name: `Room ${i + 1}`,
                    breakoutRoomUserIds: []
                },
            )
        }
        attendees.forEach((attendee, index) => {
            const roomIndex = index % breakout.roomCount
            roomsInit[roomIndex].breakoutRoomUserIds.push(attendee.id)
        })
        return roomsInit
    }

    useEffect(() => {
        const roomset1 = []
        const roomset2 = []
        const roomset3 = []
        rooms?.forEach((room, index) => {
            switch (index % 3) {
                case 0: roomset1.push(room); break;
                case 1: roomset2.push(room); break;
                case 2: roomset3.push(room); break;
                default: break
            }
        })
        setRoomCol1(roomset1)
        setRoomCol2(roomset2)
        setRoomCol3(roomset3)
        updateDropdownRoomOptions()
    }, [rooms])

    useEffect(() => {
        const generateAttendeesMapping = () => {
            let attendees = sampleData
            attendees = attendees.map(invitee => {
                return {
                    id: invitee.surrealUsers.id,
                    firstName: invitee.surrealUsers.firstName,
                    lastName: invitee.surrealUsers.lastName,
                    roles: JSON.parse(invitee.surrealUsers.roles.replace(/'/g, '"')),
                }
            })

            const userInfoMapping = {}
            attendees.forEach(attendee => {
                const { id, ...otherAttendeeInfo } = attendee
                userInfoMapping[id] = otherAttendeeInfo
            })

            if (breakout.type === "assignRandom") {
                attendees = shuffleAttendees(attendees)
            }
            const roomsInit = assignRooms(attendees)


            setRooms(roomsInit)
            setUserDetailsMapping(userInfoMapping)
        }
        generateAttendeesMapping()
    }, [])

    useEffect(() => {
        const getTopics = async () => {
            const programId = 1
            let topics = await classroomService.getTopics(programId)
            topics = [
                {
                    "id": 2,
                    "name": "This is Topic 1",
                    "description": "description 1",
                    "agenda": {
                        "id": 11,
                        "title": "title agenda testing",
                        "description": "description",
                        "startTime": "2023-11-06T06:17:37Z",
                        "endTime": "2023-10-20T06:17:37Z",
                        "location": "blanditiis Diesel",
                        "levelName": "yellow Dollar actuating",
                        "groupName": "boohoo Reichel Bicycle",
                        "notified": true,
                        "isPrivate": true,
                        "agendaType": "CLASSROOM"
                    }
                },
                {
                    "id": 3,
                    "name": "This is Topic 2",
                    "description": "description 1",
                    "agenda": {
                        "id": 11,
                        "title": "title agenda testing",
                        "description": "description",
                        "startTime": "2023-11-06T06:17:37Z",
                        "endTime": "2023-10-20T06:17:37Z",
                        "location": "blanditiis Diesel",
                        "levelName": "yellow Dollar actuating",
                        "groupName": "boohoo Reichel Bicycle",
                        "notified": true,
                        "isPrivate": true,
                        "agendaType": "CLASSROOM"
                    }
                },
                {
                    "id": 4,
                    "name": "This is Topic 3",
                    "description": "description 1",
                    "agenda": {
                        "id": 11,
                        "title": "title agenda testing",
                        "description": "description",
                        "startTime": "2023-11-06T06:17:37Z",
                        "endTime": "2023-10-20T06:17:37Z",
                        "location": "blanditiis Diesel",
                        "levelName": "yellow Dollar actuating",
                        "groupName": "boohoo Reichel Bicycle",
                        "notified": true,
                        "isPrivate": true,
                        "agendaType": "CLASSROOM"
                    }
                },
                {
                    "id": 5,
                    "name": "This is Topic 4",
                    "description": "description 1",
                    "agenda": {
                        "id": 11,
                        "title": "title agenda testing",
                        "description": "description",
                        "startTime": "2023-11-06T06:17:37Z",
                        "endTime": "2023-10-20T06:17:37Z",
                        "location": "blanditiis Diesel",
                        "levelName": "yellow Dollar actuating",
                        "groupName": "boohoo Reichel Bicycle",
                        "notified": true,
                        "isPrivate": true,
                        "agendaType": "CLASSROOM"
                    }
                },
                {
                    "id": 6,
                    "name": "This is Topic 5",
                    "description": "description 1",
                    "agenda": {
                        "id": 11,
                        "title": "title agenda testing",
                        "description": "description",
                        "startTime": "2023-11-06T06:17:37Z",
                        "endTime": "2023-10-20T06:17:37Z",
                        "location": "blanditiis Diesel",
                        "levelName": "yellow Dollar actuating",
                        "groupName": "boohoo Reichel Bicycle",
                        "notified": true,
                        "isPrivate": true,
                        "agendaType": "CLASSROOM"
                    }
                }
            ]
            setAgendaTopics(topics)
        }
        getTopics()
    }, [])

    const handleSelectTopic = (event, roomIndex, topicId) => {
        const updatedRooms = [...rooms]
        const room = updatedRooms[roomIndex]
        room.topicId = topicId
        updatedRooms[roomIndex] = room
        event.target?.parentNode?.classList.remove('show')
        setRooms(updatedRooms)
    }

    const handleShowTopicList = (event) => {
        const topicIcon = event.target
        if (topicIcon?.nextSibling?.classList.contains('show'))
            topicIcon?.nextSibling?.classList.remove('show')
        else
            topicIcon?.nextSibling?.classList.add('show')
    }

    const handleOnDragStart = (memberName) => {
        setDraggedMember(memberName)
    }

    const handleDragOver = (event) => {
        event.preventDefault()
    }

    const handleStartBreakout = async () => {
        const agendaId = 70
        const breakoutAPIBody = {
            name: agendaId + " Breakout",
            breakoutRooms: rooms
        }
        const res = await classroomService.startBreakout(agendaId, breakoutAPIBody)
        setBreakoutStarted(!breakoutStarted)
    }

    const handleDrop = (event, swapMember) => {
        let roomStateBefore = [...rooms]
        let member1, member2

        member1 = draggedMember
        if (swapMember) {
            member2 = Number(event.currentTarget.getAttribute('id'))
        }

        const room1Index = roomStateBefore.findIndex(room =>
            room.breakoutRoomUserIds.includes(draggedMember)
        )
        const room2Index = Number(event.target.closest('.room').firstChild.getAttribute('id'))

        swapOrMoveMember(room1Index, room2Index, member1, member2)
    }

    const handleShowMembers = (event) => {
        let memberDiv = event.target.parentNode.nextElementSibling
        if (memberDiv?.classList.contains('show')) {
            memberDiv?.classList.remove('show')
            event.target?.classList.remove('up')
        }
        else {
            memberDiv?.classList.add('show')
            event.target?.classList.add('up')
        }
    }

    const handleBreakoutDurationChange = (e) => {
        // Allow only numeric input
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        setBreakoutDuration(Number(numericValue));
    };

    const handleIncreaseBreakoutTime = () => {
        setBreakoutDuration(breakoutDuration + 1)
    }

    const handleDecreaseBreakoutTime = () => {
        if (breakoutDuration > 0)
            setBreakoutDuration(breakoutDuration - 1)
    }

    const handleChangeRoomOption1 = useCallback((ev, option) => {
        setMergeRoomOption1(option.key);
    }, []);

    const handleChangeRoomOption2 = useCallback((ev, option) => {
        setMergeRoomOption2(option.key);
    }, []);

    const handleMergeRooms = () => {
        if (mergeRoomOption1 !== mergeRoomOption2) {
            const updatedRooms = [...rooms]
            console.log(updatedRooms)
            const room1 = updatedRooms[mergeRoomOption1]
            const room2 = updatedRooms[mergeRoomOption2]

            if (room1.breakoutRoomUserIds.length + room2.breakoutRoomUserIds.length <= MAX_MEMBER_PER_BREAKOUT) {
                room1.breakoutRoomUserIds = [...room1.breakoutRoomUserIds, ...room2.breakoutRoomUserIds]
                updatedRooms[mergeRoomOption1] = room1
                updatedRooms.splice(mergeRoomOption2, 1)
                console.log(updatedRooms)
                setRooms(updatedRooms)
            }
            else {
                dispatch(setMessage({
                    message: "Merged room member count cannot exceed 8"
                }))
            }
        }
        else {
            dispatch(setMessage({
                message: "Select distinct rooms"
            }))
        }
    }

    return (
        <div className="panelContainer breakout">
            <div className="heading">
                <div className="header">
                    Breakout
                    <div className="time">
                        {
                            !breakoutStarted ? "Join a room. The facilitator will start the breakout sessions shortly." : "Time remaining - 01:21"
                        }
                    </div>
                </div>
                {
                    !breakoutStarted ?
                        <div className="leftHeader">
                            <p>*Max. 8 users per room</p>
                            <div className="mergeDropdowns">
                                <div className="breakoutDuration">
                                    <p>Room close after</p>
                                    <div className="breakoutTimeInput">
                                        <input type="text" value={breakoutDuration} onChange={handleBreakoutDurationChange} />
                                        <div className="controls">
                                            <Icon iconName="ChevronUp" onClick={handleIncreaseBreakoutTime} />
                                            <Icon iconName="ChevronDown" onClick={handleDecreaseBreakoutTime} />
                                        </div>
                                    </div>
                                    <p>minutes</p>
                                </div>
                                {
                                    mergeRoomOptions &&
                                    <>
                                        <Dropdown
                                            onChange={handleChangeRoomOption1}
                                            options={mergeRoomOptions}
                                            styles={dropdownStyles}
                                            defaultSelectedKey={mergeRoomOption1}

                                        />
                                        <Dropdown
                                            onChange={handleChangeRoomOption2}
                                            options={mergeRoomOptions}
                                            styles={dropdownStyles}
                                            defaultSelectedKey={mergeRoomOption2}
                                        />
                                    </>
                                }
                                <BorderedButton onClick={handleMergeRooms}>Merge</BorderedButton>
                            </div>
                        </div>
                        : <></>
                }
            </div>
            <div className="content">
                <div className="rooms">
                    <div className="roomsColumn">
                        {roomCol1.map((room, index) => {
                            return <div className="room">
                                <div className="roomHeading" onDragOver={handleDragOver} onDrop={handleDrop} id={index * 3}>
                                    <div className="roomName">
                                        {room.name}
                                        {
                                            breakoutStarted ?
                                                <img src={EnterIcon} className="enterIcon" /> :
                                                <div className="topics" >
                                                    <TooltipHost
                                                        content={"Tooltip text"}
                                                        calloutProps={calloutProps}
                                                        tooltipProps={hostStyles}
                                                    >
                                                        <Icon className="icon" iconName="AddNotes" onClick={handleShowTopicList} />
                                                    </TooltipHost>
                                                    <div className="topicList">
                                                        {
                                                            agendaTopics?.map(topic => {
                                                                return <div className={`topic${room.topicId === topic.id ? " active" : ""}`} onClick={(event) => handleSelectTopic(event, index * 3, topic.id)}>
                                                                    {topic.name}
                                                                </div>
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                    <FontIcon iconName="ChevronDownSmall" onClick={handleShowMembers} />
                                </div>
                                <div className="members">
                                    {
                                        room.breakoutRoomUserIds.map((member, index) => {
                                            return <div className="member" draggable={!breakoutStarted} onDragStart={() => handleOnDragStart(member)} onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, true)} id={member}>{`${userDetailsMapping[member]?.firstName} ${userDetailsMapping[member]?.lastName[0]}. `}<FontIcon iconName="Move" /></div>
                                        })
                                    }
                                </div>
                            </div>
                        })}
                    </div>
                    <div className="roomsColumn">
                        {roomCol2.map((room, index) => {
                            return <div className="room">
                                <div className="roomHeading" onDragOver={handleDragOver} onDrop={handleDrop} id={index * 3 + 1}>
                                    <div className="roomName">
                                        {room.name}
                                        {
                                            breakoutStarted ?
                                                <img src={EnterIcon} className="enterIcon" /> :
                                                <div className="topics" >
                                                    <Icon className="icon" iconName="AddNotes" onClick={handleShowTopicList} />
                                                    <div className="topicList">
                                                        {
                                                            agendaTopics?.map(topic => {
                                                                return <div className={`topic${room.topicId === topic.id ? " active" : ""}`} onClick={(event) => handleSelectTopic(event, index * 3, topic.id)}>
                                                                    {topic.name}
                                                                </div>
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                    <FontIcon iconName="ChevronDownSmall" onClick={handleShowMembers} />
                                </div>
                                <div className="members">
                                    {
                                        room.breakoutRoomUserIds.map((member, index) => {
                                            return <div className="member" draggable={!breakoutStarted} onDragStart={() => handleOnDragStart(member)} onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, true)} id={member}>{`${userDetailsMapping[member]?.firstName} ${userDetailsMapping[member]?.lastName[0]}. `}<FontIcon iconName="Move" /></div>
                                        })
                                    }
                                </div>
                            </div>
                        })}
                    </div>
                    <div className="roomsColumn">
                        {roomCol3.map((room, index) => {
                            return <div className="room">
                                <div className="roomHeading" onDragOver={handleDragOver} onDrop={handleDrop} id={index * 3 + 2}>
                                    <div className="roomName">
                                        {room.name}
                                        {
                                            breakoutStarted ?
                                                <img src={EnterIcon} className="enterIcon" /> :
                                                <div className="topics" >
                                                    <Icon className="icon" iconName="AddNotes" onClick={handleShowTopicList} />
                                                    <div className="topicList">
                                                        {
                                                            agendaTopics?.map(topic => {
                                                                return <div className={`topic${room.topicId === topic.id ? " active" : ""}`} onClick={(event) => handleSelectTopic(event, index * 3, topic.id)}>
                                                                    {topic.name}
                                                                </div>
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                    <FontIcon iconName="ChevronDownSmall" onClick={handleShowMembers} />
                                </div>
                                <div className="members">
                                    {
                                        room.breakoutRoomUserIds.map((member, index) => {
                                            return <div className="member" draggable={!breakoutStarted} onDragStart={() => handleOnDragStart(member)} onDragOver={handleDragOver} onDrop={(event) => handleDrop(event, true)} id={member}>{`${userDetailsMapping[member]?.firstName} ${userDetailsMapping[member]?.lastName[0]}. `}<FontIcon iconName="Move" /></div>
                                        })
                                    }
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
            <div className="buttonSection">
                {
                    !breakoutStarted ?
                        <BorderedButton active={true} onClick={handleStartBreakout}>Start breakout</BorderedButton>
                        : <BorderedButton onClick={dismissPanel}>Close rooms</BorderedButton>

                }
            </div>
        </div>
    )
}