import { FontIcon, Icon } from "@fluentui/react"
import { useEffect, useState } from "react"
import moment from 'moment';
import { BorderedButton } from "components/common/BorderedButton";
moment.locale('en');

export const EventResources = ({ data }) => {
    const [prereqResources, setPrereqResources] = useState(["Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf"])
    const [inSessionResources, setInSessionResources] = useState(["Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf"])
    const [extraResources, setExtraResources] = useState(["Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf", "Beginnings.pdf"])
    const [quizes, setQuizes] = useState(["Beginnings.pdf"])

    useEffect(() => {
        setTimeout(() => {
            document.getElementById('event-resources')?.classList.add('show')
        }, 300)
    }, [])
    return (
        <div className="panelContainer resourcesSection" id="event-resources">
            <div className="heading">
                <div className="header">{data?.title} > Resources</div>
                <div className="subHeading">{moment(data?.startTime).format('ddd D MMMM, h:mm a')}</div>
            </div>
            <div className="content resoucesGrid">
                <div className="resoucesCol">
                    <div className="title">Pre-requisites</div>
                    <div className="resoucesContainer">
                        {
                            prereqResources.map(res => {
                                return <div className="resource">{res}</div>
                            })
                        }
                    </div>
                </div>
                <div className="resoucesCol">
                    <div className="title">In-Session materials</div>
                    <div className="resoucesContainer">
                        {
                            extraResources.map(res => {
                                return <div className="resource">{res}</div>
                            })
                        }
                    </div>
                </div>
                <div className="resoucesCol">
                    <div className="title">Extra resources</div>
                    <div className="resoucesContainer">
                        {
                            quizes.map(res => {
                                return <div className="resource">{res}</div>
                            })
                        }
                    </div>
                </div>
                <div className="resoucesCol">
                    <div className="title">Quiz</div>
                    <div className="resoucesContainer">
                        {
                            inSessionResources.map(res => {
                                return <div className="resource">{res}</div>
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="buttonSection">
                <BorderedButton>Save</BorderedButton>
            </div>
        </div>
    )
}