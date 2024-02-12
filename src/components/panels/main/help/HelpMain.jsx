import { useState, useEffect } from "react"
import { Help } from "."
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { useDispatch, useSelector } from 'react-redux';
import { HelpContent } from "./HelpContent";

export const HelpMain = () => {
    const [helpContent, setHelpContent] = useState([])
    const [headerText, setHeaderText] = useState("")

    const panel = useSelector((state) => state.panel)
    const dispatch = useDispatch();

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
                                <Help
                                    setHeaderText={setHeaderText}
                                    setHelpContent={setHelpContent}
                                />
                                : <HelpContent
                                    helpContent={helpContent}
                                    headerText={headerText}
                                />
                        }
                    </>
                    : <></>
            }
        </>
    )
}