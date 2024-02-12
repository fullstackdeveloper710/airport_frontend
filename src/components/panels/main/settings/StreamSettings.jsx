import { Icon, Toggle } from "@fluentui/react"
import { useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { useLabelsSchema } from "i18n/useLabelsSchema";
import { setEventPanelSectionStack } from 'store/reducers/panel';

import { setShowStreamStats } from 'store/reducers/game';
export const StreamSettings = () => {
    const {
        components: {
            panels: {
                main: { settings: ls1 },
            },
        },
    } = useLabelsSchema();

    const { panel } = useSelector(
        (state) => state
    );
    const { showStreamStats, streamStats } =
        useSelector((state) => state.game);

    const toggleButtonStyles = {
        root: {
            margin: 0,
        },
        pill: {
            background: 'var(--sr-color-white)',
            '&:hover': {
                background: 'var(--sr-color-white)',
            },
        },
    };
    const dispatch = useDispatch();

    const handleMovingBack = () => {
        let tempStack = [...panel.eventPanelSectionStack]
        const currentPage = tempStack.pop()
        document.getElementById('profile-' + currentPage)?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack(tempStack))
        }, 300);
    }

    const handleToggleShowStreamStats = (e, checked) => {

        window?.gameClient?.logUserAction?.({
            eventName: 'SETTINGS_SHOW_STATISTICS',
            eventSpecificData: JSON.stringify({ streamStats }),
            beforeState: !checked,
            afterState: checked,
        });

        dispatch(setShowStreamStats(checked));
    };

    useEffect(() => {
        setTimeout(() => {
            document.getElementById('profile-stream')?.classList.add('show')
        }, 300)
    }, [])
    return (
        <div className="settingsContainer" id="profile-stream">
            <h1><Icon className='icon' onClick={handleMovingBack} iconName='ChromeBack' />Stream</h1>
            <br />
            <label htmlFor="streamStats">{ls1.checkboxStreamStatsLabel}</label>
            <br />
            <br />
            <Toggle
                name="streamStats"
                onText="On"
                offText="Off"
                onChange={handleToggleShowStreamStats}
                styles={toggleButtonStyles}
                defaultChecked={showStreamStats}
                role="checkbox"
            />
        </div>
    )
}
