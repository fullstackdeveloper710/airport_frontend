import React from 'react';
// import { ReactComponent as DoneIcon } from '../../../../assets/images/icons/done.svg'

export const EventAttendee = (props) => {
  const { attendee } = props
  return <div className='attendee'>
    <div className={`attendeeName${attendee?.status !== "" ? " accepted" : ""}`}>{attendee?.surrealUsers?.firstName} {attendee?.surrealUsers?.lastName[0]}.</div>
    {/* <DoneIcon className='doneIcon' /> */}
  </div>
}