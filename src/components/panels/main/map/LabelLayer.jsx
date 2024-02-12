import { useState, useEffect } from "react"
import { useDispatch } from "react-redux";
import { openPanel } from 'store/reducers/panel';
import { generateUuid, getMapData } from 'utils/common';
import { setMessage } from 'store/reducers/message';

export const LabelLayer = ({ level }) => {
    const [labels, setlabels] = useState([
        {
            id: 'L1_Globe_Highlight',
            roomName: "Globe",
            displayName: "The globe",
            position: 'left',
            defaultRoomTypeForMap: 'Hub',
            canNavigate: true,
            level: 1,
            children: []
        },
        {
            id: 'L1_MainLounge_Highlight',
            roomName: "MainHub",
            displayName: "The main lounge",
            position: 'left',
            defaultRoomTypeForMap: 'Hub',
            canNavigate: true,
            level: 1,
            children: []
        },
        {
            id: 'L1_TimelineGallery_Highlight',
            roomName: "MainHub",
            displayName: "The timeline gallery",
            position: 'right',
            defaultRoomTypeForMap: 'Hub',
            canNavigate: true,
            level: 1,
            children: []
        },
        {
            id: 'L1_Terrace_Highlight',
            roomName: "MainHub",
            displayName: "The terrace",
            position: 'left',
            defaultRoomTypeForMap: 'Hub',
            canNavigate: true,
            level: 1,
            children: []
        },
        {
            id: 'L1_Auditorium_Highlight',
            roomName: "MainHub",
            displayName: "The auditorium",
            position: 'left',
            defaultRoomTypeForMap: 'Hub',
            canNavigate: true,
            level: 1,
            children: []
        },
        {
            id: 'L2_StyleStudio_Highlight',
            roomName: "StyleStudio",
            displayName: "The style studio",
            position: 'right',
            defaultRoomTypeForMap: 'None',
            canNavigate: true,
            level: 2,
            children: []
        },
        {
            id: 'L2_Classroom_Highlight',
            roomName: "ClassroomLobby",
            displayName: "The classroom",
            position: 'right',
            defaultRoomTypeForMap: 'Meeting',
            canNavigate: true,
            level: 2,
            children: []
        },
        {
            id: 'L2_LearningLounge_Highlight',
            roomName: "LearningLounge",
            displayName: "The learning lounge",
            position: 'left',
            defaultRoomTypeForMap: 'Meeting',
            canNavigate: true,
            level: 2,
            children: []
        },
        {
            id: 'Aircraft_Highlight',
            roomName: "Aircraft",
            displayName: "The Aircraft",
            position: 'left',
            defaultRoomTypeForMap: 'Meeting',
            canNavigate: false,
            level: 3,
            children: []
        },
    ])

    const dispatch = new useDispatch()

    const onClickLevel = async (level) => {
        // if (
        //   !level.children.length &&
        //   level.roomName === game.currentRoom?.nextMapName
        // ) {
        //   return;
        // }
        if (level.canNavigate) {
            if (level.children && level.children.length) {
                setChildMap(level.children);
            } else {
                if (window.gameClient) {
                    if (window.followRequestActive && !is_presenter) {
                        return dispatch(
                            setMessage({
                                message: ls.errorsCantTeleport,
                            })
                        );
                    }
                    if (window.agoraScreenShare) {
                        window.agoraScreenShare.stopScreen();
                    }
                    if (level.defaultRoomTypeForMap === 'Meeting') {
                        const meetingRoomName = `${level.roomName}.Default.${generateUuid()}`;
                        window.gameClient.teleportUserToMeetingRoom(meetingRoomName);
                    } else {
                        window.gameClient.joinLevelNew(level.roomName, level.groupName);
                    }
                    window.gameClient.userGotIntoVTDFromMap =
                        level.roomName === 'VolcanoIsland';
                    dispatch(openPanel(false));
                }
            }
        }
    };
    const applyLabelCoordinates = () => {
        const parentCoordinates = document.querySelector('#map').getBoundingClientRect()
        labels.forEach(item => {
            if (item.level === level) {
                let labelGroup = document.querySelector(`#${item.id}`)
                let coordinates = labelGroup.getBoundingClientRect()
                let mapLabel = document.querySelector(`#label-${item.id}`)
                if (mapLabel) {
                    mapLabel.style.top = `${coordinates.top - parentCoordinates.top + coordinates.height / 2}px`
                    mapLabel.style.left = `${coordinates.left - parentCoordinates.left + coordinates.width / 2}px`
                    mapLabel.style.position = "absolute"
                }
            }
        })
    }

    useEffect(() => {
        window.removeEventListener('resize', () => applyLabelCoordinates())
        applyLabelCoordinates()
        window.addEventListener('resize', () => applyLabelCoordinates())

    }, [level])

    return (
        <div className="labelLayer">
            {
                labels.map(label => {
                    return (
                        <>
                            {
                                level === label.level ?
                                    <div onClick={() => onClickLevel(label)} className={`location-label ${label.position}`} id={`label-${label.id}`}>{label.displayName}</div> : <></>
                            }
                        </>
                    )
                })
            }
        </div>
    )
}