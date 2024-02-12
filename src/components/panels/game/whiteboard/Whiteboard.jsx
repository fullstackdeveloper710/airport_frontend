import React, { Fragment } from 'react';
import { ActionButton } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { setWhiteBoardOpen, setWhiteBoardURL, setDialogOpen } from 'store/reducers/smartScreen';

export const Whiteboard = () => {
    const whiteBoardOpen = useSelector((state) => state.smartScreen.whiteboardOpen);
    const whiteBoardURL = useSelector((state) => state.smartScreen.whiteboardURL);
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(setWhiteBoardOpen(false))
        dispatch(setWhiteBoardURL(''))
        window.gameClient.setActiveSmartScreenMode('Idle');
        dispatch(setDialogOpen(true))
    }

    return (
        <Fragment>
            <div className='smartScreenWhiteboard' style={whiteBoardOpen ? {} : {display: "none"}}>
                <ActionButton
                    className="ms-motion-fadeIn exit-btn whiteboard-exit-btn"
                    iconProps={{ iconName: 'Cancel' }}
                    onClick={handleClose}
                />
                <iframe style={{width: "100%", height: "100%"}} src={whiteBoardURL} title="whiteboard"></iframe>
            </div>
        </Fragment>
    );
};