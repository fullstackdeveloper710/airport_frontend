import { useEffect } from "react";
import { Icon } from "@fluentui/react";
import { useDispatch, useSelector } from 'react-redux';
import { setEventPanelSectionStack } from 'store/reducers/panel';

const RenderContent = ({ content, t }) => {
    return content.map((item, index) => {
        const key = Object.keys(item)[0];
        const value = item[key];

        if (Array.isArray(value)) {
            // If the value is an array, recursively render its content            
            const Tag = key.toLowerCase();
            return (
                <Tag>
                    {value.map((subItem, subIndex) => (
                        <RenderContent content={[subItem]} t={t} />
                    ))}
                </Tag>
            );
        } else if (typeof value === 'object') {
            // If the value is an object, recursively render its content          
            const Tag = key.toLowerCase();
            return (
                <Tag>
                    {
                        Object.keys(value).map(key => {
                            const Tag = key.toLowerCase()
                            if (typeof value[key] === "string") {
                                return (
                                    <Tag>{value[key]}</Tag>
                                )
                            }
                            else {
                                return (
                                    <Tag>
                                        <RenderContent content={Array.isArray(value[key]) ? value[key] : [value[key]]} />
                                    </Tag>
                                )
                            }
                        })
                    }
                </Tag>
            );
        } else {
            // If the value is a string, render the corresponding HTML tag
            const Tag = key.toLowerCase();
            return <Tag key={index}>{value}</Tag>;
        }
    });
};
export const HelpContent = ({ helpContent, headerText }) => {


    const panel = useSelector((state) => state.panel)
    const dispatch = useDispatch();
    const handleMovingBack = () => {
        let tempStack = [...panel.eventPanelSectionStack]
        const currentPage = tempStack.pop()
        document.getElementById('help-' + currentPage)?.classList.remove('show')
        setTimeout(() => {
            dispatch(setEventPanelSectionStack(tempStack))
        }, 300);
    }
    useEffect(() => {
        setTimeout(() => {
            document.getElementById('help-content')?.classList.add('show')
        }, 100)
    }, [])
    return <div className="tutorialWrapper" id="help-content">

        <div className="helpContainer">
            <h1 className="helpContentHeader"><Icon className='icon' onClick={handleMovingBack} iconName='ChromeBack' />{headerText}</h1>
            <div className="helpContent">
                {console.log(helpContent)}
                <RenderContent content={helpContent} />
            </div>
        </div>
    </div>
}