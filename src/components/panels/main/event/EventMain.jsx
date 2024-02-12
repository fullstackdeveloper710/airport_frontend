import React, { useEffect, useState } from 'react';
import { EventList } from './EventList';
import { EventInfo } from './EventInfo';
import { getMapData } from 'utils/common';

import { useDispatch, useSelector } from 'react-redux';

import { setPanelBackButton } from 'store/reducers/panel';
import { EventResources } from './EventResources';
import { PastSessionsList } from './PastSessionsList';
import { PastSessionInfo } from './PastSessionInfo';
import { setEventPanelSectionStack } from 'store/reducers/panel';

export const EventMain = () => {
    const [data, setData] = useState({})
    const [locations, setLocations] = useState({});
    const { event, panel } = useSelector(
        (state) => state
    );
    const dispatch = useDispatch();

    useEffect(() => {
        const map = getMapData(event.map);
    
        let tempLocation = {};
        if (map !== undefined) {
          for (let mapItem of map) {
            if (mapItem.children && mapItem.children.length) {
              for (let item of mapItem.children) {
                tempLocation[item.displayName] = {
                  location: item.displayName,
                  defaultRoomTypeForMap: item.defaultRoomTypeForMap,
                  eventLevelName: item.roomName,
                  eventGroupName: item.groupName,
                };
              }
            } else {
              tempLocation[mapItem.displayName] = {
                location: mapItem.displayName,
                defaultRoomTypeForMap: mapItem.defaultRoomTypeForMap,
                eventLevelName: mapItem.roomName,
              };
            }
          }
        }
        setLocations(tempLocation);
      }, []);

    useEffect(() => {
        dispatch(setPanelBackButton(panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] !== 'list'))
    }, [panel.eventPanelSectionStack])

    useEffect(() => {
        dispatch(setEventPanelSectionStack(['list']))
    }, [])

    return (
        <>
            {
                panel.eventPanelSectionStack ?
                    <>
                        {
                            panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'list' ?
                                <EventList locations={locations} setData={setData} /> :
                                panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'detail' ?
                                    <EventInfo locations={locations} data={data} /> :
                                    panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'resources' ?
                                        <EventResources data={data} /> :
                                        panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'pastSessions' ?
                                            <PastSessionsList setData={setData} />
                                            :
                                            panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'pastSessionDetail' ?
                                                <PastSessionInfo data={data} />
                                                : <></>
                        }
                    </> : <></>
            }
        </>
    )
}