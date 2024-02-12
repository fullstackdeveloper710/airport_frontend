import { Icon } from "@fluentui/react"
import { Instructions } from "./Instructions"
import { useEffect, useState } from "react"
import { BorderedButton } from "components/common/BorderedButton"

export const Tutorial = ({ tutorialData, active, handleNextClick }) => {

    const [instructionIndex, setInstructionIndex] = useState(0)
    const [showActive, setShowActive] = useState(true)
    const [showLine, setShowLine] = useState(false)

    useEffect(() => {
        setInstructionIndex(0)
    }, [tutorialData])

    useEffect(() => {
        setTimeout(() => {
            setShowLine(active)
        }, 200);
    }, [])

    return (
        <>
            {
                tutorialData.instructions[instructionIndex] &&
                <div className="container">
                    <div className="tutorial show">
                        {
                            tutorialData.instructions[instructionIndex].heading ?
                                <>
                                    <div className="heading">{tutorialData.instructions[instructionIndex].heading}</div>
                                    <div className={`bottomLine${showLine ? " show" : ""}`}></div>
                                </>
                                : <></>
                        }
                        <div className={`scrollableContent${showLine ? " show" : ""}`}>
                            <div className={`content ${tutorialData.instructions[instructionIndex].description?.bulletPoints ? "lg" : "sm"}`}>
                                {
                                    tutorialData.instructions[instructionIndex].description?.text &&
                                    <div className="description">{tutorialData.instructions[instructionIndex].description.text}</div>
                                }
                                {
                                    tutorialData.instructions[instructionIndex].description?.bulletPoints &&
                                    <ul className="description">
                                        {
                                            tutorialData.instructions[instructionIndex].description.bulletPoints?.map(point => {
                                                return <li>{point}</li>
                                            })
                                        }
                                    </ul>
                                }
                            </div>
                            {
                                (tutorialData.instructions[instructionIndex].image || tutorialData.instructions[instructionIndex].text || tutorialData.instructions[instructionIndex].video) &&
                                <div className="instructionsContainer">
                                    <div className="controls">
                                        {
                                            instructionIndex > 0 &&
                                            <div className="control" onClick={() => {
                                                setTimeout(() => {
                                                    setShowActive(true)
                                                    setInstructionIndex(instructionIndex - 1)
                                                }, 300);
                                                setShowActive(false)
                                            }} >
                                                <Icon iconName="ChevronLeftSmall" />
                                            </div>
                                        }
                                    </div>
                                    <div className="instructionsSlider">
                                        <div className="instructions">
                                            <Instructions showVideo={true} instruction={tutorialData.instructions[instructionIndex]} active={showActive} />
                                            {
                                                tutorialData.instructions.map((instruction, index) => {
                                                    return <Instructions showVideo={false} instruction={instruction} />
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="controls">
                                        {
                                            instructionIndex < tutorialData.instructions.length - 1 &&
                                            <div className="control" onClick={() => {
                                                setTimeout(() => {
                                                    setShowActive(true)
                                                    setInstructionIndex(instructionIndex + 1)
                                                }, 300);
                                                setShowActive(false)
                                            }} >
                                                <Icon iconName="ChevronRightSmall" />
                                            </div>
                                        }
                                    </div>
                                </div>
                            }
                            {
                                tutorialData.instructions[instructionIndex].button && <BorderedButton onClick={handleNextClick}>{tutorialData.instructions[instructionIndex].button?.buttonText}</BorderedButton>
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    )
}