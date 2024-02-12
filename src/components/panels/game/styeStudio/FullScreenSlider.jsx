import { Icon } from "@fluentui/react"
import { BorderedButton } from "components/common/BorderedButton"
import { setMagicMirrorCompletion } from "store/reducers/styleStudio";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from "react"

export const FullScreenSlider = ({ fullScreenSlider, active, setNextEligible }) => {
    const [sliderIndex, setSliderIndex] = useState(0)
    const [showLine, setShowLine] = useState(false)
    const {
        magicMirrorCompletion
    } = useSelector((state) => state.styleStudio);

    const dispatch = useDispatch()

    useEffect(() => {
        if(magicMirrorCompletion && magicMirrorCompletion[fullScreenSlider.tryoutID] && magicMirrorCompletion[fullScreenSlider.tryoutID].completed){
            const currIndex = fullScreenSlider?.hairOptions.findIndex(option => option.avatarItem === magicMirrorCompletion[fullScreenSlider.tryoutID].mainSelection);
            setSliderIndex(currIndex)
        }else{
            if(window.gameClient){
                window.gameClient.setAvatarMakeupItem(fullScreenSlider.hairOptions[0]?.avatarItem)
            }
            setSliderIndex(0)
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            setShowLine(active)
        }, 200);
    }, [])

    const handleHairStyleConfirm = () => {
        if(fullScreenSlider?.hairOptions[sliderIndex]?.avatarItem){
            const currentHairStyleValue = fullScreenSlider.hairOptions[sliderIndex]?.avatarItem
            let completionData = {}
            completionData[fullScreenSlider.tryoutID] = {
                completed : true,
                mainSelection : currentHairStyleValue,
                subSelection : null,
            }
            dispatch(setMagicMirrorCompletion({
                ...completionData
            }))
            setNextEligible(true)
        }
    }

    return (
        <div className="hairstyle">
            <div className="container">
                <div className={`tutorial${showLine ? " show" : ""}`}>
                    {
                        fullScreenSlider.hairOptions[sliderIndex]?.heading &&
                        <>
                            <div className="heading">{fullScreenSlider.hairOptions[sliderIndex]?.heading}</div>
                            <div className={`bottomLine${showLine ? " show" : ""}`}></div>
                        </>
                    }
                    <div className={`scrollableContent${showLine ? " show" : ""}`}>
                        <div className="content">
                            <div className="description">{fullScreenSlider.hairOptions[sliderIndex]?.description}</div>
                            <br /><br />
                            <BorderedButton onClick={handleHairStyleConfirm}>Confirm</BorderedButton>
                        </div>
                    </div>
                </div>
            </div>
            <div className="controls">
                {
                    sliderIndex != 0 &&
                    <div className="control left" onClick={() => {
                        setTimeout(() => {
                            setShowLine(true)
                            if(window.gameClient){
                                window.gameClient.setAvatarMakeupItem(fullScreenSlider.hairOptions[sliderIndex - 1]?.avatarItem)
                            }
                            setSliderIndex(sliderIndex - 1)
                        }, 200);
                        setShowLine(false)
                    }}>
                        <Icon iconName="ChevronLeftSmall" />
                    </div>
                }
                {
                    sliderIndex !== fullScreenSlider.hairOptions.length - 1 &&
                    <div className="control right" onClick={() => {
                        setTimeout(() => {
                            setShowLine(true)
                            if(window.gameClient){
                                window.gameClient.setAvatarMakeupItem(fullScreenSlider.hairOptions[sliderIndex + 1]?.avatarItem)
                            }
                            setSliderIndex(sliderIndex + 1)
                        }, 200);
                        setShowLine(false)
                    }}>
                        <Icon iconName="ChevronRightSmall" />
                    </div>
                }
            </div>
        </div>
    )
}