import React from "react"

import chartImage from 'assets/images/character.png'
import EmiratesBadge from 'assets/images/emiratesredlogobadge.png'
export const LandingTemplate = ({ heading, children, description }) => {
    return (
        <div className="welcome-Wrapper">
            <div className="leftImage ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-center ms-Flex-justify-content-end">
                <img
                    src={chartImage}
                    alt="Surreal"
                    style={{ aspectRatio: "1/1" }}
                />
            </div>
            <div className="sideContent ms-h-100 ms-Flex ms-Flex-column ms-Flex-align-items-end">
                <div className="badge">
                    <img
                        src={EmiratesBadge}
                        alt=""
                    />
                </div>
                <div className="welcome-Container ms-Flex ms-Flex-column">
                    <h3 className="welcome-Title">{heading}</h3>
                    <p className="welcome-Description">
                        {description}
                    </p>
                    {children}
                </div>
            </div>
        </div>
    )
}