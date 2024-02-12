import { useEffect } from "react";
import { Profile } from "."
import { LanguageSetting } from "../settings/LanguageSetting"
import { SoundSetting } from "../settings/SoundSetting"
import { useDispatch, useSelector } from 'react-redux';
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { CameraAndMicSettings } from "../settings/CameraAndMicSetting";
import { StreamSettings } from "../settings/StreamSettings"

export const ProfileMain = () => {

    const panel = useSelector((state) => state.panel)

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setEventPanelSectionStack(['main']))
    }, [])
    return (
        <>
            {
                panel.eventPanelSectionStack ?
                    panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'main' ?
                        <Profile />
                        : panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'lang' ?
                            <LanguageSetting />
                            : panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === "sound" ?
                                <SoundSetting />
                                : panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === "stream" ?
                                    <StreamSettings />
                                    : panel.eventPanelSectionStack[panel.eventPanelSectionStack.length - 1] === 'camera' ?
                                        <CameraAndMicSettings />
                                        : <></>
                    : <></>
            }
        </>
    )
}