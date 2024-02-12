import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    enableCameraAccess,
    enableMicAccess,
    enablePresenterCameraAccess,
    enablePresenterMicAccess,
} from 'utils/eventVariables';
import { DeviceSelection } from 'components/common';
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { Icon } from '@fluentui/react';
export const CameraAndMicSettings = () => {

    const dispatch = useDispatch();

    const { panel, user } = useSelector(
        (state) => state
    );
    const [selectedMicrophone, setSelectedMicrophone] = useState(
        (window.agoraClientPrimary &&
            window.agoraClientPrimary.getSelectedMicrophone()) ||
        'null'
    );
    const [selectedCamera, setSelectedCamera] = useState(
        (window.agoraClientPrimary &&
            window.agoraClientPrimary.getSelectedCamera()) ||
        'null'
    );

    const handleChangeCamera = (camera) => {
        setSelectedCamera(camera);
    };

    const handleChangeMicrophone = (microphone) => {
        setSelectedMicrophone(microphone);
    };

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
            document.getElementById('profile-camera')?.classList.add('show')
        }, 300)
    }, [])

    return (
        <div className="settingsContainer" id='profile-camera'>
            <h1><Icon className='icon' onClick={handleMovingBack} iconName='ChromeBack' />Camera and Microphone</h1>
            {(enableCameraAccess ||
                enableMicAccess ||
                ((enablePresenterCameraAccess || enablePresenterMicAccess) &&
                    user?.current?.roles?.includes('ROLE_PRESENTER'))) && (
                    <DeviceSelection
                        defaultCamera={selectedCamera}
                        defaultMicrophone={selectedMicrophone}
                        onChangeCamera={handleChangeCamera}
                        onChangeMicrophone={handleChangeMicrophone}
                    />
                )}
        </div>
    )
}