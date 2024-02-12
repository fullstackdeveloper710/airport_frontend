import { Dropdown, FontIcon, TextField } from "@fluentui/react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { setEventPanelSectionStack } from 'store/reducers/panel';
import { CheckBox, TextInput } from 'components/common';

export const Files = () => {
    const panel = useSelector((state) => state.panel)
    const dispatch = useDispatch();

    const [resources, setResources] = useState([
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
        {
            "file": "Lunch Service",
            "time": "21 Aug 2023, 21:12"
        },
    ])
    const room1 = [
        { key: 'room1', text: 'Room 1' },
        { key: 'room2', text: 'Room 2' },
        { key: 'room3', text: 'Room 3' }
    ];
    const sortbyVideo = [
        { text: 'Video name A - Z', key: 'a-z' },
        { text: 'Video name Z - A', key: 'z-a' }
    ];
    const sortbyDate = [
        { text: 'Video name A - Z', key: 'a-z' },
        { text: 'Video name Z - A', key: 'z-a' }
    ];
    const sortbyDuration = [
        { text: 'Duration short', key: 'a-z' },
        { text: 'Video name Z - A', key: 'z-a' }
    ];
    const stopPropagation = (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
    };
    useEffect(() => {
        setTimeout(() => {
            document.getElementById('resource-files')?.classList.add('show')
        }, 300)
    }, [])

    return (
        <div className="panelContainer filesContainer" id="resource-files">
            <div className="heading">
                <div className="header">CST recordings</div>
                <div className="subHeading">
                    <div className="dropdownContainer">
                        <TextField label="Search" placeholder="Type here..." iconProps={{ iconName: "Search" }} />
                    </div>
                    <div className="dropdownContainer">
                        <Dropdown
                            onChange={console.log("Here")}
                            options={sortbyVideo}
                            placeholder="Select sort"
                            label="Sort by video"
                        />
                    </div>
                    <div className="dropdownContainer">
                        <Dropdown
                            onChange={console.log("Here")}
                            options={sortbyDate}
                            placeholder="Select sort"
                            label="Sort by date"
                        />
                    </div>
                    <div className="dropdownContainer">
                        <Dropdown
                            onChange={console.log("Here")}
                            options={sortbyDuration}
                            placeholder="Select sort"
                            label="Sort by duration"
                        />
                    </div>
                </div>
            </div>
            <div className="content resourceGrid">
                {
                    resources.map(resource => {
                        return (
                            <div className="resource">
                                <div className="name">{resource.file}<FontIcon className="icon" iconName="ChromeBackMirrored" /></div>
                                <div className="time">{resource.time}</div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}