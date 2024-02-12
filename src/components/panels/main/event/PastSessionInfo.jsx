import { useEffect, useState } from "react"
import { ReactComponent as ClockIcon } from '../../../../assets/images/icons/clock.svg'
import { ReactComponent as LocationIcon } from '../../../../assets/images/icons/location.svg'
import { ReactComponent as UserIcon } from '../../../../assets/images/icons/user.svg'

export const PastSessionInfo = (props) => {
    const { data } = props
    const [resources, setResources] = useState([
        { "filename": "pre_req_guide_1.pdf", "type": "Pre-requisite" },
        { "filename": "pre_req_guide_2.pdf", "type": "Pre-requisite" },
        { "filename": "pre_req_guide_3.pdf", "type": "Pre-requisite" },
        { "filename": "pre_req_guide_4.pdf", "type": "Pre-requisite" },
        { "filename": "intro_video_1.mp4", "type": "Pre-requisite" },
        { "filename": "intro_video_2.mp4", "type": "Pre-requisite" },
        { "filename": "intro_video_3.mp4", "type": "Pre-requisite" },
        { "filename": "intro_video_4.mp4", "type": "Pre-requisite" },
        { "filename": "advanced_topics_1.pdf", "type": "Pre-requisite" },
        { "filename": "advanced_topics_2.pdf", "type": "Pre-requisite" },
        { "filename": "advanced_topics_3.pdf", "type": "Pre-requisite" },
        { "filename": "advanced_topics_4.pdf", "type": "Pre-requisite" },
        { "filename": "session_notes_1.docx", "type": "Post-session" },
        { "filename": "session_notes_2.docx", "type": "Post-session" },
        { "filename": "session_notes_3.docx", "type": "Post-session" },
        { "filename": "session_notes_4.docx", "type": "Post-session" },
        { "filename": "wrap-up_video_1.mp4", "type": "Post-session" },
        { "filename": "wrap-up_video_2.mp4", "type": "Post-session" },
        { "filename": "wrap-up_video_3.mp4", "type": "Post-session" },
        { "filename": "wrap-up_video_4.mp4", "type": "Post-session" },
        { "filename": "post_session_quiz_1.json", "type": "Quiz" },
        { "filename": "post_session_quiz_2.json", "type": "Quiz" },
        { "filename": "post_session_quiz_3.json", "type": "Quiz" },
        { "filename": "post_session_quiz_4.json", "type": "Quiz" },
        { "filename": "final_quiz_1.json", "type": "Quiz" },
        { "filename": "final_quiz_2.json", "type": "Quiz" },
        { "filename": "final_quiz_3.json", "type": "Quiz" },
        { "filename": "final_quiz_4.json", "type": "Quiz" }
    ])
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
    useEffect(() => {
        setTimeout(() => {
            document.getElementById('event-pastSessionDetail')?.classList.add('show')
        }, 300)
    }, [])
    return (
        <div className="panelContainer pastSessionInfo" id="event-pastSessionDetail">
            <div className="heading">
                <div className="header">Session > Past sessions > {data.title}</div>
                <div className="subHeading">
                    <div className="time">{formatDateTime(data?.startTime)}</div>
                    <span className="duration"><ClockIcon className='headerIcon' />{getTimeDifference(data?.startTime, data?.endTime)}</span>
                    <span className="location"><LocationIcon className='headerIcon' />{data?.location}</span>
                    <span className="facilitator"><UserIcon className='headerIcon' />{data?.createdBy?.firstName} {data?.createdBy?.lastName}</span>
                </div>
            </div>
            <div className="content resourceGrid">
                {
                    resources.map(resource => {
                        return <div className="resource"><div className="name">{resource.filename}</div><div className="type">{resource.type}</div></div>
                    })
                }
            </div>
        </div>
    )
}