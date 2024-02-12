import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    enableVOG
} from 'utils/eventVariables';
import { Icon, Slider } from '@fluentui/react';
import { setEventPanelSectionStack } from 'store/reducers/panel';


export const SoundSetting = () => {

    // sound settings
    const sliderStyles = {
        activeSection: {
            backgroundColor: 'var(--sr-color-primary)' ?? 'var(--sr-color-primary)',
        },
        inactiveSection: {
            backgroundColor: 'var(--sr-color-sliderStyles-inactiveSection)',
        },
        valueLabel: {
            width: 24,
        },
    };

    const [gameAudioVolume, setGameAudioVolume] = useState(
        window.gameClient ? window.gameClient.getAudioVolume() : 100
    );
    const [gameEffectVolume, setGameEffectVolume] = useState(
        window.gameClient ? window.gameClient.getEffectVolume() : 100
    );
    const [channelVolume, setChannelVolume] = useState(
        window.agoraClientPrimary ? window.agoraClientPrimary.getVolume() : 100
    );

    const { panel } = useSelector(
        (state) => state
    );

    const dispatch = useDispatch()
    const handleChangeGameAudioVolume = (value) => {
        window?.gameClient?.logUserAction?.({
            eventName: 'SETTINGS_MEDIA_VOLUME',
            eventSpecificData: null,
            beforeState: gameAudioVolume,
            afterState: value,
        });

        setGameAudioVolume(value);
    };

    const handleChangeGameEffectVolume = (value) => {
        window?.gameClient?.logUserAction?.({
            eventName: 'SETTINGS_SOUNDS_EFFECTS_VOLUME',
            eventSpecificData: null,
            beforeState: gameEffectVolume,
            afterState: value,
        });

        setGameEffectVolume(value);
    };

    const handleChannelVolume = (value) => {
        window?.gameClient?.logUserAction?.({
            eventName: 'SETTINGS_VOICE_CHAT_VOLUME',
            eventSpecificData: null,
            beforeState: channelVolume,
            afterState: value,
        });

        setChannelVolume(value);
    }; useEffect(() => {
        if (window.gameClient) {
            window.gameClient.setAudioVolume(gameAudioVolume);
        }
    }, [gameAudioVolume]);

    useEffect(() => {
        if (window.gameClient) {
            window.gameClient.setEffectVolume(gameEffectVolume);
        }
    }, [gameEffectVolume]);

    useEffect(() => {
        if (window.agoraClientPrimary) {
            window.agoraClientPrimary.setVolume(channelVolume);
        }
        if (enableVOG && window.agoraClientSecondary) {
            window.agoraClientSecondary.setVolume(channelVolume);
        }
        if (window.agoraClientThird) {
            window.agoraClientThird.setVolume(channelVolume);
        }
    }, [channelVolume]);

    const handleMovingBack = () => {
        let tempStack = [...panel.eventPanelSectionStack]
        const currentPage = tempStack.pop()
        document.getElementById('profile-' + currentPage)?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack(tempStack))
        }, 300);
    }

    useEffect(() => {
        setTimeout(() => {
            document.getElementById('profile-sound')?.classList.add('show')
        }, 300)
    }, [])
    return (

        <div className="settingsContainer" id='profile-sound'>
            <h1><Icon className='icon' onClick={handleMovingBack} iconName='ChromeBack' />Sound</h1>
            <div className="ms-w-100 ms-my-1">
                <Slider
                    label="Media Volume"
                    min={0}
                    max={100}
                    step={1}
                    showValue
                    styles={sliderStyles}
                    value={gameAudioVolume}
                    onChange={handleChangeGameAudioVolume}
                />
            </div>
            <div className="ms-w-100 ms-mb-1">
                <Slider
                    label="Sound Effects Volume"
                    min={0}
                    max={100}
                    step={1}
                    showValue
                    styles={sliderStyles}
                    value={gameEffectVolume}
                    onChange={handleChangeGameEffectVolume}
                />
            </div>
            <div className="ms-w-100 ms-mb-1">
                <Slider
                    label="Voice Chat Volume"
                    min={0}
                    max={100}
                    step={1}
                    showValue
                    styles={sliderStyles}
                    value={channelVolume}
                    onChange={handleChannelVolume}
                />
            </div>
        </div>
    )

}