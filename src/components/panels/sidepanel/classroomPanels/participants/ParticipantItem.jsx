import React from 'react';
import microphoneOn from 'assets/images/icons/MicrophoneOnParticipants.svg'
import microphoneOff from 'assets/images/icons/MicrophoneOffParticipants.svg'
import raiseHand from 'assets/images/icons/RaiseHandIconParticipants.svg'
import { Icon } from '@fluentui/react/lib/Icon';

export const ParticipantItem = ({participantName, isMicOn, isHandRaised, isPrerequisiteDone, isPresent, isActive}) => {
    return (
        <div className='participant-item'>
            <div className='participant-activity'>
                <span className={`participant-${(isPresent && isActive) ? 'active' : 'inactive'}`}>
                </span>
                <span className={'participant-name' + (isPresent ? ' present' : ' absent')}>
                    { participantName }
                </span>
            </div>
            <div className='participant-status-grp'>
                <div className='participant-status-icon'>
                    {
                        isPrerequisiteDone 
                        ? (
                            <Icon iconName="Accept" />
                        )
                        : (
                            <Icon iconName="CalculatorMultiply" />
                        )
                    }
                </div>
                {
                    isPresent && (
                        <div className='participant-status-icon'>
                            {
                                isMicOn 
                                ? (
                                    <img src={microphoneOn} alt='microphoneOn' />
                                )
                                : (
                                    <img src={microphoneOff} alt='microphoneOff' />
                                )
                            }
                        </div>
                    )
                }
                {
                    (isPresent && isHandRaised) && 
                    <div className='participant-status-icon'>
                        <img src={raiseHand} alt='raiseHand' />
                    </div>
                }
            </div>
        </div>
    );
};