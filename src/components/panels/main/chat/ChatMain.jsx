import { ChannelChat, PrivateChat } from "components/panels/extra/chat"
import { Chat } from "./Chat"
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import { setPanelBackButton } from 'store/reducers/panel';

export const ChatMain = () => {
    const panel = useSelector((state) => state.panel);
    const dispatch = useDispatch();

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
                                <Chat /> :
                                panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'private' ?
                                    <PrivateChat /> : <ChannelChat />
                        }
                    </>
                    : <></>

            }
        </>
    )
}