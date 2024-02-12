import { Dropdown, FontIcon } from "@fluentui/react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { setEventPanelSectionStack } from 'store/reducers/panel';

export const Folders = () => {
    const panel = useSelector((state) => state.panel)
    const [foldersList, setFoldersList] = useState([
        "CST recordings",
        "Classroom resources",
        "Miscellaneous"
    ])
    const dispatch = useDispatch();
    useEffect(() => {
        setTimeout(() => {
            document.getElementById('resource-folders')?.classList.add('show')
        }, 300)
    }, [])
    const sortByFolder = [
        { key: 'a-z', text: 'Folder name A - Z' },
        { key: 'z-a', text: 'Folder name Z - A' }
    ];

    const handleSectionChange = (section) => {
        document.getElementById('resource-folders')?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack([...panel.eventPanelSectionStack, section]))
        }, 300);
    }
    return (
        <div className="panelContainer foldersContainer" id="resource-folders">
            <div className="leftSection">
                <div className="header"><div className="title">Resources</div></div>
                <div className="text"></div>
            </div>
            <div className="rightSection">
                <div className="header"><div className="title">List of folders</div>
                    <div className="dropdownContainer">
                        <Dropdown
                            onChange={console.log("Here")}
                            options={sortByFolder}
                            placeholder="Select sort"
                            label="Sort by folder name"
                        />
                    </div>
                </div>
                <div className="foldersList">
                    {
                        foldersList.map(folder => {
                            return (
                                <div className="folder" onClick={() => { handleSectionChange('files') }}>
                                    <div className="folderName">{folder}</div><FontIcon className="icon" iconName="ChromeBackMirrored" />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}