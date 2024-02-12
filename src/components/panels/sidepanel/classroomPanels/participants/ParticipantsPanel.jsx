import React, { Fragment } from 'react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { ParticipantItem } from './ParticipantItem';
import { Icon } from '@fluentui/react/lib/Icon';

const dropdownStyles = { dropdown: { width: '100%' } };


const dropdownControlledExampleOptions = [
    { key: 'default', text: 'Default' },
    { key: 'prerequisitesRead', text: 'Pre-requisites Read' },
    { key: 'active', text: 'Active' },
    { key: 'attendance', text: 'Attendance' },
    { key: 'handRaise', text: 'Hand Raise' },
];

const participantsList = [
    {
        "name": "Noah D.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Ethan J.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": false,
        "isPresent": true,
        "isActive": false
    },
    {
        "name": "Ava B.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": false,
        "isPresent": false,
        "isActive": false
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": true,
        "isPrerequisiteDone": false,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Noah D.",
        "isMicOn": true,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Ethan J.",
        "isMicOn": false,
        "isHandRaised": true,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Ava B.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": false,
        "isActive": false
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": false,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Noah D.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Ethan J.",
        "isMicOn": false,
        "isHandRaised": true,
        "isPrerequisiteDone": false,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Ava B.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": true,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Noah D.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Ethan J.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Ava B.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": false,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": false,
        "isPresent": false,
        "isActive": false
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": false
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": false,
        "isActive": false
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    },
    {
        "name": "Liam A.",
        "isMicOn": false,
        "isHandRaised": false,
        "isPrerequisiteDone": true,
        "isPresent": true,
        "isActive": true
    }
]

export const ParticipantsPanel = () => {
    return (
        <Fragment>
            <div className='participants-info-header'>
                <hr className='participants-info-separator'></hr>
                <div className='participants-info-item'>
                    <span className='participants-info-item-label'>
                        Active : 
                    </span>
                    <span className='participants-info-item-indicator'>
                        <span className='participants-info-active-indicator-true'></span>
                        /
                        <span className='participants-info-active-indicator-false'></span>
                    </span>
                </div>
                <div className='participants-info-item'>
                    <span className='participants-info-item-label'>
                        Pre-requisites read : 
                    </span>
                    <span className='participants-info-item-indicator'>
                        <span className='participants-info-prerequisites-indicator-true'>
                            <Icon iconName="Accept" />
                        </span>
                        /
                        <span className='participants-info-prerequisites-indicator-false'>
                            <Icon iconName="CalculatorMultiply" />
                        </span>
                    </span>
                </div>
                <div className='participants-info-item'>
                    <span className='participants-info-item-label'>
                        Attendance :
                    </span>
                    <span className='participants-info-item-indicator'>
                        <span className='participants-info-attendance-indicator-true'>Present</span>
                        /
                        <span className='participants-info-attendance-indicator-false'>Absent</span>
                    </span>
                </div>
                <hr className='participants-info-separator'></hr>
            </div>
            <div className='participants-sort-dropdown'>
                <Dropdown
                    onChange={console.log("Here")}
                    placeholder="Select an option"
                    options={dropdownControlledExampleOptions}
                    styles={dropdownStyles}
                    defaultSelectedKey="default"
                />
            </div>
            <div className='participants-list'>
                {
                    participantsList.map((item, index) => {
                        return (
                            <ParticipantItem 
                                key={index}
                                participantName={item.name} 
                                isMicOn={item.isMicOn} 
                                isHandRaised={item.isHandRaised} 
                                isPrerequisiteDone={item.isPrerequisiteDone} 
                                isPresent={item.isPresent} 
                                isActive={item.isActive}
                            />
                        )
                    })
                }
            </div>
        </Fragment>
    );
};