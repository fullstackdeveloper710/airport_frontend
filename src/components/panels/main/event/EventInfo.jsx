import { BorderedButton } from 'components/common/BorderedButton';
import React, { useState, useEffect } from 'react';
import { EventAttendee } from './EventAttendee';
import { ReactComponent as ClockIcon } from '../../../../assets/images/icons/clock.svg'
import { ReactComponent as LocationIcon } from '../../../../assets/images/icons/location.svg'
import { ReactComponent as UserIcon } from '../../../../assets/images/icons/user.svg'
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { useDispatch, useSelector } from 'react-redux';
import { openPanel } from 'store/reducers/panel';
import vcWebSocketClient from 'lib/vcWebsocketClient';
import { setMessage } from 'store/reducers/message';
import { setCurrent, setAgendaRole } from 'store/reducers/agenda';
import agendaService from 'services/agendaService';

export const EventInfo = ({ data, locations }) => {
    const [agendaInfo, setAgendaInfo] = useState({})
    const { panel, user, game } = useSelector(
        (state) => state
    );
    const is_presenter = user?.current?.roles.includes('ROLE_PRESENTER');
    const dispatch = useDispatch();

    useEffect(() => {
        const getAgendaInfo = async () => {
            const agendaInfoRes = await agendaService.getAgendaById(data.id)
            if(agendaInfoRes){
                console.log("Agenda info", agendaInfoRes)
                setAgendaInfo(agendaInfoRes)
            }
        }
        getAgendaInfo()
    }, [])

    useEffect(() => {
        setTimeout(() => {
            document.getElementById('event-detail')?.classList.add('show')
        }, 300)
    }, [])

    //Utility functions
    const getTimeDifference = (startTime, endTime) => {
        const startDateObj = new Date(startTime)
        const endDateObj = new Date(endTime)

        const difference = endDateObj - startDateObj
        console.log(startDateObj, endDateObj, difference)

        let hoursDifference = Math.floor(difference / (1000 * 60 * 60));
        let minutesDifference = Math.floor((difference - hoursDifference * 60 * 60 * 1000) / (1000 * 60));

        hoursDifference = hoursDifference >= 1 ? hoursDifference + "h  " : ""
        minutesDifference = minutesDifference >= 1 ? minutesDifference + "m" : ""

        const duration = hoursDifference + minutesDifference
        return duration
    }

    function formatDateTime(inputDateTime) {
        // Parse the input date-time string into a Date object
        const date = new Date(inputDateTime);

        // Define an array of month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Get the day of the week, day of the month, month, and time
        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
        const dayOfMonth = date.getDate();
        const month = monthNames[date.getMonth()];
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // Convert the time to AM/PM format
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight

        // Create the formatted date-time string
        const formattedDateTime = `${dayOfWeek} ${dayOfMonth} ${month}, ${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        return formattedDateTime;
    }

    //Handler Functions
    const handleEnterLocation = async () => {
        try{
            const location = locations[agendaInfo.location];
            if (window.followRequestActive && !is_presenter) {
                return dispatch(
                  setMessage({ message: ls.unableToTeleportWhileInMeeting })
                );
            } else {
                switch("CLASSROOM"){
                    case "CLASSROOM": {
                        const response = await vcWebSocketClient.startConnection();
                        if (response === 'CONNECTED') {
                            dispatch(openPanel(false))
                            console.log("WEBSOCKET CONNECTED")
                            dispatch(setCurrent(agendaInfo))
                            if(agendaInfo.createdBy.id === user?.current?.id){
                                dispatch(setAgendaRole("TRAINER"))
                            }else{
                                dispatch(setAgendaRole("TRAINEE"))
                            }
                            //Create Meeting Room and send teleport user to meeting room
                            const meetingRoomName = `ClassroomLobby.Default.${agendaInfo.id}`;
                            window.gameClient.teleportUserToMeetingRoom(meetingRoomName);
                        } else {
                            dispatch(
                                setMessage({
                                    message: 'There is a Problem with your internet',
                                })
                            );
                        }
                        break
                    }
                    case "VR_SESSION": {
                        //Go to 6 digit code screen
                        break
                    }
                    default: {
                        if(game?.currentRoom?.nextMapName === location.eventLevelName) {
                            dispatch(
                              setMessage({ message: "You are already at the location" })
                            );
                          }else{
                            window.gameClient.joinLevelNew(
                              location.eventLevelName,
                              location.eventGroupName
                            );
                          }
                    }
                }
            }
        }catch(error){
            console.log("Error entering classroom", error)
        }
    }

    const handleSectionChange = () => {
        document.getElementById('event-detail')?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack([...panel.eventPanelSectionStack, 'resources']))
        }, 300);
    }
    
    return (
        <div className="panelContainer event" id='event-detail'>
            <div className="eventInfo">
                <div className="heading">
                    <div className="header">{agendaInfo?.title}</div>
                    <div className="subHeading">
                        <div className="time">{formatDateTime(agendaInfo?.startTime)}</div>
                        <div className="otherInfo">
                            <span className="duration"><ClockIcon className='headerIcon' />{getTimeDifference(agendaInfo?.startTime, agendaInfo?.endTime)}</span>
                            <span className="location"><LocationIcon className='headerIcon' />{agendaInfo?.location}</span>
                            <span className="facilitator"><UserIcon className='headerIcon' />{agendaInfo?.createdBy?.firstName} {agendaInfo?.createdBy?.lastName}</span>
                        </div>
                    </div>
                </div>
                <div className='content attendeesSection'>
                    {/* <div className="attendeeHeading">Attendees<div>Pre-requisites read: <Icon iconName='Accept' /> / <Icon iconName='Cancel' /></div></div> */}
                    <div className="attendeesGrid">
                        {
                            agendaInfo?.invitees?.map((attendee, index) => {
                                return <EventAttendee attendee={attendee} />
                            })
                        }
                    </div>
                </div>
            </div>
            <div className='buttonSection'>
                <BorderedButton active={true} onClick={handleEnterLocation}>Enter Location</BorderedButton>
            </div>
            <div className='buttonSection'>
                <BorderedButton active={false} onClick={() => handleSectionChange()}>Session resources</BorderedButton>
            </div>
        </div>
    )
}