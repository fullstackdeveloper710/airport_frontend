import React from "react";
import { Dropdown } from "@fluentui/react";
import { BorderedButton } from "components/common/BorderedButton";
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup';

const { useState, useCallback } = require("react");
const dropdownStyles = { dropdown: { width: 200 } };

const filter = [
    { key: 'recent', text: 'Recent' },
    { key: 'a-z', text: 'A - Z' },
    { key: 'z-a', text: 'Z - A' }
];
export const LoadVideo = ({dismissPanel}) => {
    return (
        <div className="panelContainer load">
            <div className="heading">
                <div className="header">Share in-session materials</div>
                <div className="filter">
                    <Dropdown
                        onChange={console.log("Here")}
                        placeholder="Select an option"
                        options={filter}
                        styles={dropdownStyles}
                        defaultSelectedKey="recent"

                    />
                </div>
            </div>
            <div className="list">
                <ChoiceGroupControlledExample />
            </div>
            <div className="buttonSection">
                <BorderedButton onClick={dismissPanel}>Cancel</BorderedButton>
                <BorderedButton active={true}>Load</BorderedButton>
            </div>
        </div>
    )
}
const options = [
    { key: 'p1', text: 'Powerpoint 1' },
    { key: 'p2', text: 'Powerpoint 2' },
    { key: 'v1', text: 'Video 1' },
    { key: 'v2', text: 'Video 2' },
    { key: 'v3', text: 'Video 3' },
    { key: 'v4', text: 'Video 4' }
];

export const ChoiceGroupControlledExample = () => {
    const [selectedKey, setSelectedKey] = useState('B');

    const onChange = useCallback((ev, option) => {
        setSelectedKey(option.key);
    }, []);

    return <ChoiceGroup selectedKey={selectedKey} options={options} onChange={onChange} />;
};
