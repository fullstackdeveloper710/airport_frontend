import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setEventPanelSectionStack } from 'store/reducers/panel';
import { ReactComponent as ArrowRight } from '../../../../assets/images/icons/right-arrow.svg'
import { useEffect } from 'react';

export const KioskHeader = () => {

    const { panel } = useSelector(
        (state) => state
    );

    const dispatch = useDispatch()
    const handleMovingBack = () => {

        let tempStack = [...panel.eventPanelSectionStack]
        const currentPage = tempStack.pop()
        document.getElementById('resource-' + currentPage)?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack(tempStack))
        }, 300);
    }

    useEffect(() => {
        document.querySelector('.ms-Panel-closeButton').addEventListener('click', () => {
            dispatch(setEventPanelSectionStack(['list']))
        })
    }, [])
    return (
        <div className="ms-Panel-header ms-ml-2 ms-w-100 ms-Flex ms-Flex-column" onClick={handleMovingBack}>
            <div className="backButton">
                {panel.showBackButton ? <><ArrowRight /> Back</> : <></>}
            </div>
        </div>
    );
};
