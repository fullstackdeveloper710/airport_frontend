import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreateEventForm } from './CreateEventForm';
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { createAgenda } from 'store/reducers/agenda';
import { EventItem } from './EventItem';
import { BorderedButton } from 'components/common/BorderedButton';
import moment from 'moment';
moment.locale('en');

//TEMPORARY
const agendaSample = {
    "Facilitator": [
        {
            "agendaType": "CLASSROOM",
            "id": "64",
            "isPrivate": "false",
            "title": "Test Title agenda"
        }
    ],
    "Trainee": [
        {
            "agendaType": "CLASSROOM",
            "id": "65",
            "isPrivate": "false",
            "title": "Test Title agenda"
        }
    ]
}

const AVAILABLE_CHOICES = {
  SHOW: 'show',
  CREATE: 'create'
}

export const EventList = ({ locations, setData }) => {
  // const [refreshEventList, setRefreshEventList] = useState(0)
  const [activeItem, SetActiveItem] = useState(null);
  const [agendaList, setAgendaList] = useState([])
  const [showEventScheduler, setShowEventScheduler] = useState(false);
  const [choice, setChoice] = useState(AVAILABLE_CHOICES.SHOW)
  const [device, setDevice] = useState(window.innerWidth > 840 ? "desktop" : "mobile")
  const { panel, user, usersList, agenda } = useSelector(
    (state) => state
  );
  const dispatch = useDispatch();
  // let _clearTimeout = null


  //REFRESH AGENDA LOGIC
  // useEffect(() => {
  //   if (refreshEventList !== 0) {
  //     dispatch(getEventAgendaList(user.eventID));
  //   }
  // }, [refreshEventList]);
  useEffect(() => {
    setAgendaList(agenda.list)
  },[agenda.list])

  useEffect(()=>{
    window.addEventListener('resize', () => {
      setDevice(window.innerWidth > 840 ? "desktop" : "mobile")
    })
  },[])

  useEffect(() => {
    setTimeout(() => {
      document.getElementById('event-list')?.classList.add('show')
    }, 300)
  }, [device])

  const handleCreateAgenda = (values) => {
    let attendees = values.attendees.map((item) => ({
      status: '',
      user: item,
    }));
    attendees.push({
      user: user.current.id,
      status: 'accepted',
    });

    dispatch(
      createAgenda(user.eventID, {
        title: values.title,
        startTime: values.startTime,
        endTime: values.endTime,
        attendees: attendees,
        ...locations[values.location],
        isPrivate: panel.panelTabName !== 'event' ? true : false,
      })
    );
    setShowEventScheduler(false);
  };
  
  const handleSectionChange = (section) => {
    document.getElementById('event-list')?.classList.remove('show')
    setTimeout(() => {
      dispatch(setEventPanelSectionStack([...panel.eventPanelSectionStack, section]))
    }, 300);
  }

  const handleSetChoice = (userChoice) => {
    document.getElementById('event-' + choice)?.classList.remove('show')
    setTimeout(() => {
      setChoice(userChoice)
    }, 300)
  }

  //REFRESH AGENDA LOGIC 
  // const handleRefreshEventList = () => {
  //   setRefreshEventList(1)
  //   if (!_clearTimeout) {
  //     _clearTimeout = setTimeout(() => {
  //       setRefreshEventList(0)
  //       _clearTimeout = null
  //     }, 500);
  //   }
  // }
  
  return (
    <>
      {
        device === "desktop" ?
          <div className='panelContainer eventListPanel desktop' id="event-list">
            <div className="content">
              <div className="leftSection">
                <div className="heading">Schedule {panel.panelTabName}</div>
                <div className="selectionText">Make a selection</div>
                <BorderedButton onClick={() => handleSetChoice(AVAILABLE_CHOICES.SHOW)} active={choice === AVAILABLE_CHOICES.SHOW}>Today's schedule</BorderedButton>
                <BorderedButton onClick={() => handleSetChoice(AVAILABLE_CHOICES.CREATE)} active={choice === AVAILABLE_CHOICES.CREATE}>Schedule a meet-up</BorderedButton>
              </div>
              <div className="rightSection">
                {
                  choice === AVAILABLE_CHOICES.SHOW ?
                    <div className={`showEvent ${choice === AVAILABLE_CHOICES.SHOW ? " show" : ""}`}  id='event-show'>
                      <div className="listHeading">Today's schedule</div>
                      <div className="meetingsWrapper">
                        <div className='meetingsList'>
                          {
                            agendaList?.map((agenda, index) => {
                              return (
                                <EventItem
                                  setData={setData}
                                  handleSectionChange={handleSectionChange}
                                  data={agenda}
                                  key={agenda.id}
                                  active={agenda.id === activeItem || (!activeItem && index === 0)}
                                  setActive={SetActiveItem}
                                  locations={locations}
                                />
                              )
                            })}
                        </div>
                      </div>
                    </div> :
                    <>
                      {
                        choice === AVAILABLE_CHOICES.CREATE ?
                          <div className={`createEvent ${choice === AVAILABLE_CHOICES.CREATE ? " show" : ""}`}  id='event-create'>
                            <div className="listHeading">Schedule a meet-up</div>
                            <CreateEventForm
                              open={showEventScheduler}
                              agenda={null}
                              onDismiss={() => setShowEventScheduler(false)}
                              onConfirm={handleCreateAgenda}
                              enableInvite={true}
                              usersList={usersList.list.filter((item) => item.id !== user.current.id)}
                            />
                          </div> :
                          <></>
                      }
                    </>
                }
              </div>
            </div>
            {
              choice === AVAILABLE_CHOICES.SHOW ?
                <div className="buttonSection">
                  <BorderedButton onClick={() => {
                    handleSectionChange("pastSessions")
                  }}>View Past Sessions</BorderedButton>
                </div> : <></>
            }
          </div>
          :
          <div className='panelContainer eventListPanel mobile' id="event-list">

            <div className="heading">
              <div className={`eventOption${choice === AVAILABLE_CHOICES.SHOW ? " active" : ""}`} onClick={() => handleSetChoice(AVAILABLE_CHOICES.SHOW)}>Today's schedule</div>
              <div className={`eventOption${choice === AVAILABLE_CHOICES.CREATE ? " active" : ""}`} onClick={() => handleSetChoice(AVAILABLE_CHOICES.CREATE)}>Schedule a meet-up</div>
            </div>
            <div className="content">
              <div className="rightSection">
                {
                  choice === AVAILABLE_CHOICES.SHOW ?
                    <div className={`showEvent ${choice === AVAILABLE_CHOICES.SHOW ? " show" : ""}`} id='event-show'>
                      <div className="meetingsWrapper">
                        <div className='meetingsList'>
                          {
                            agendaList?.map((agenda, index) => {
                              return (
                                <EventItem
                                  setData={setData}
                                  handleSectionChange={handleSectionChange}
                                  data={agenda}
                                  key={agenda.id}
                                  active={agenda.id === activeItem || (!activeItem && index === 0)}
                                  setActive={SetActiveItem}
                                  locations={locations}
                                />
                              )
                            })}
                        </div>
                      </div>
                    </div> :
                    <>
                      {
                        choice === AVAILABLE_CHOICES.CREATE ?
                          <div className={`createEvent ${choice === AVAILABLE_CHOICES.CREATE ? " show" : ""}`}  id='event-create'>
                            <CreateEventForm
                              open={showEventScheduler}
                              agenda={null}
                              onDismiss={() => setShowEventScheduler(false)}
                              onConfirm={handleCreateAgenda}
                              enableInvite={true}
                              usersList={usersList.list.filter((item) => item.id !== user.current.id)}
                            />
                          </div> :
                          <></>
                      }
                    </>
                }
              </div>
            </div>
            {
              choice === AVAILABLE_CHOICES.SHOW ?
                <div className="buttonSection">
                  <BorderedButton onClick={() => {
                    handleSectionChange("pastSessions")
                  }}>View Past Sessions</BorderedButton>
                </div> : <></>
            }
          </div>
      }

    </>
  );
};
