import { useState, useEffect } from "react"
import { Folders } from "./Folders"
import { Files } from "./Files"
import { useDispatch, useSelector } from 'react-redux';
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { setPanelBackButton } from 'store/reducers/panel';

export const KioskMain = () => {
    const panel = useSelector((state) => state.panel)
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPanelBackButton(panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] !== 'folders'))
    }, [panel.eventPanelSectionStack])

    useEffect(() => {
        dispatch(setEventPanelSectionStack(['folders']))
    }, [])
    return (
        <>
            {
                panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'folders' ?
                    <Folders /> :
                    panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'files' ?
                        <Files /> :
                        < ></>
            }
        </>
    )
}