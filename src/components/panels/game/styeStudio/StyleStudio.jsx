import React, { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Tutorial } from "./Tutorial";
import { TryOut } from "./Tryout";
import { UniformGuidelines } from "./UniformGuidelines";
import { useSelector, useDispatch } from "react-redux";
import { FullScreenSlider } from "./FullScreenSlider";
import { setStudioType, setIsPodium, openStyleStudio, setItemId, setMagicMirrorCompletion, setPodiumCompletion } from "store/reducers/styleStudio";
import { data } from './config'
import { uniformFlow } from "./uniformConfig";

const sendGameSignals = (signalArray) => {
    if(signalArray && Array.isArray(signalArray)){
        signalArray.forEach((item) => {
            if(item.type === "Camera"){
                if(window.gameClient){
                    window.gameClient.changeCameraAngle(item.value)
                }
            }else if(item.type === "Avatar"){
                if(window.gameClient){
                    window.gameClient.setAvatarMakeupItem(item.value)
                }
            }
        });
    }else{
        console.log("Signal array not present in correct format")
    }
    
}

export const StyleStudio = () => {
    const [isTryout, setIsTryout] = useState(false)
    const [onPodium, setOnPodium] = useState(false)
    const [isTutorial, setIsTutorial] = useState(false)
    const [isUniformGuidelines, setIsUniformGuidelines] = useState(false)
    const [isFullScreenSlider, setIsFullScreenSlider] = useState(false)
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [currentFlow, setCurrentFlow] = useState()
    const [nextEligible, setNextEligible] = useState(true)
    const [showSection, setShowSection] = useState(true)
    // const [gender, setGender] = useState("male")
    const {
        studioType,
        isPodium,
        itemId,
        magicMirrorCompletion,
        podiumCompletion
    } = useSelector((state) => state.styleStudio);
    const { gender } = useSelector((state) => state.user.current);

    const dispatch = useDispatch()

    useEffect(() => {
        if (studioType === "MAGIC_MIRROR") {
            setIsTutorial(true)
        } else if (studioType === "UNIFORM_GUIDELINES") {
            let itemIndex
            if(isPodium){
                itemIndex = uniformFlow.tryon[gender].indexOf(itemId)
                setCurrentFlow(uniformFlow.tryon[gender])
                setNextButtonEligibility(itemId)
            }else{
                itemIndex = uniformFlow.uniform_gallery[gender].indexOf(itemId)
                setCurrentFlow(uniformFlow.uniform_gallery[gender])
                setNextButtonEligibility(null)
            }
            setCurrentSectionIndex(itemIndex)
            setIsUniformGuidelines(true)
        } else {
            console.log("THIS STUDIO TYPE HAS NOT BEEN DEFINED")
        }
    }, [studioType, isPodium, onPodium])

    const setNextButtonEligibility = (completedID) => {
        if(completedID){
            if (studioType === "MAGIC_MIRROR"){
                if(magicMirrorCompletion[completedID] && magicMirrorCompletion[completedID].completed){
                    setNextEligible(true)
                }else{
                    setNextEligible(false)
                }
            }else if (studioType === "UNIFORM_GUIDELINES"){
                if(podiumCompletion[completedID]){
                    setNextEligible(true)
                }else{
                    setNextEligible(false)
                }
            }else{
                console.log("NEXT ELIGIBILITY CHECK NOT AVAILABLE FOR THIS STUDIO TYPE")
            }
        }else{
            setNextEligible(true)
        }
    }

    const handleNextClick = () => {
        if (studioType === "MAGIC_MIRROR") {
            if(isTutorial && data[gender][currentSectionIndex]?.tutorial?.nextGameSignals){
                sendGameSignals(data[gender][currentSectionIndex]?.tutorial?.nextGameSignals)
            }else if(isTryout && data[gender][currentSectionIndex]?.tryoutContent?.nextGameSignals){
                sendGameSignals(data[gender][currentSectionIndex]?.tryoutContent?.nextGameSignals)
            }else if(isFullScreenSlider && data[gender][currentSectionIndex]?.fullScreenSlider?.nextGameSignals){
                sendGameSignals(data[gender][currentSectionIndex]?.fullScreenSlider?.nextGameSignals)
            }else{
                console.log("Cannot determine the section to be shown")
            }
            setTimeout(() => {
                setShowSection(true)
                if (currentSectionIndex < data[gender].length - 1 || (isTutorial && data[gender][currentSectionIndex].tryoutContent || isTryout && data[gender][currentSectionIndex].fullScreenSlider)) {
                    if (isTutorial && data[gender][currentSectionIndex].tryoutContent) {
                        const currTryOutID = data[gender][currentSectionIndex].tryoutContent.tryoutID
                        setIsTryout(true)
                        setIsTutorial(false)
                        setIsFullScreenSlider(false)
                        setNextButtonEligibility(currTryOutID)
                    }
                    else if (isTutorial && data[gender][currentSectionIndex].fullScreenSlider) {
                        const currTryOutID = data[gender][currentSectionIndex].fullScreenSlider.tryoutID
                        setIsTryout(false)
                        setIsTutorial(false)
                        setIsFullScreenSlider(true)
                        setNextButtonEligibility(currTryOutID)
                    }
                    else {
                        if (data[gender][currentSectionIndex + 1].tutorial) {
                            setIsTutorial(true)
                            setIsTryout(false)
                            setIsFullScreenSlider(false)
                            setNextButtonEligibility(null)
                        }
                        else if (data[gender][currentSectionIndex + 1].tryoutContent) {
                            const currTryOutID = data[gender][currentSectionIndex + 1].tryoutContent.tryoutID
                            setIsTryout(true)
                            setIsTutorial(false)
                            setIsFullScreenSlider(false)
                            setNextButtonEligibility(currTryOutID)
                        }
                        else if (data[gender][currentSectionIndex + 1].fullScreenSlider) {
                            const currTryOutID = data[gender][currentSectionIndex + 1].fullScreenSlider.tryoutID
                            setIsTryout(false)
                            setIsTutorial(false)
                            setIsFullScreenSlider(true)
                            setNextButtonEligibility(currTryOutID)
                        }
                        setCurrentSectionIndex(currentSectionIndex + 1)
                    }
                }
            }, 300);
        } else if (studioType === "UNIFORM_GUIDELINES") {
            setTimeout(() => {
                setShowSection(true)
                if(currentSectionIndex < currentFlow.length - 1){
                    // if(window.gameClient){
                    //     window.gameClient.nextUniformItem()
                    // }
                    dispatch(setItemId(currentFlow[currentSectionIndex + 1]))
                    setCurrentSectionIndex(currentSectionIndex + 1)
                    if(isPodium){
                        setNextButtonEligibility(currentFlow[currentSectionIndex + 1])
                    }else{
                        setNextButtonEligibility(null)
                    }
                }
            }, 300);
        } else {
            console.log("NEXT OPTION NOT AVAILABLE FOR THIS STUDIO TYPE")
        }
        setShowSection(false)
    }

    const handleBackClick = () => {
        if (studioType === "MAGIC_MIRROR") {
            if(isTutorial && data[gender][currentSectionIndex]?.tutorial?.prevGameSignals){
                sendGameSignals(data[gender][currentSectionIndex]?.tutorial?.prevGameSignals)
            }else if(isTryout && data[gender][currentSectionIndex]?.tryoutContent?.prevGameSignals){
                sendGameSignals(data[gender][currentSectionIndex]?.tryoutContent?.prevGameSignals)
            }else if(isFullScreenSlider && data[gender][currentSectionIndex]?.fullScreenSlider?.prevGameSignals){
                sendGameSignals(data[gender][currentSectionIndex]?.fullScreenSlider?.prevGameSignals)
            }else{
                console.log("Cannot determine the section to be shown")
            }
            setTimeout(() => {
                setShowSection(true)
                if (currentSectionIndex > 0 || (isTryout && data[gender][currentSectionIndex].tutorial || isFullScreenSlider && data[gender][currentSectionIndex].tutorial)) {
                    if ((isTryout || isFullScreenSlider) && data[gender][currentSectionIndex].tutorial) {
                        setIsTryout(false)
                        setIsTutorial(true)
                        setIsFullScreenSlider(false)
                        setNextButtonEligibility(null)
                    }
                    else {
                        setCurrentSectionIndex(currentSectionIndex - 1)
                        if (data[gender][currentSectionIndex - 1].tryoutContent) {
                            const currTryOutID = data[gender][currentSectionIndex - 1].tryoutContent.tryoutID
                            setIsTutorial(false)
                            setIsTryout(true)
                            setIsFullScreenSlider(false)
                            setNextButtonEligibility(currTryOutID)
                        }
                        else if (data[gender][currentSectionIndex - 1].fullScreenSlider) {
                            const currTryOutID = data[gender][currentSectionIndex - 1].fullScreenSlider.tryoutID
                            setIsTryout(false)
                            setIsTutorial(false)
                            setIsFullScreenSlider(true)
                            setNextButtonEligibility(currTryOutID)
                        }
                        else if (data[gender][currentSectionIndex - 1].tutorial) {
                            setIsTryout(false)
                            setIsTutorial(true)
                            setIsFullScreenSlider(false)
                            setNextButtonEligibility(null)
                        }
                    }
                }
            }, 300);
        } else if (studioType === "UNIFORM_GUIDELINES") {
            setTimeout(() => {
                setShowSection(true)
                if(currentSectionIndex > 0){
                    // if(window.gameClient){
                    //     window.gameClient.previousUniformItem()
                    // }
                    dispatch(setItemId(currentFlow[currentSectionIndex - 1]))
                    setCurrentSectionIndex(currentSectionIndex - 1)
                    if(isPodium){
                        setNextButtonEligibility(currentFlow[currentSectionIndex - 1])
                    }else{
                        setNextButtonEligibility(null)
                    }
                }
            }, 300);
        } else {
            console.log("BACK OPTION NOT AVAILABLE FOR THIS STUDIO TYPE")
        }
        setShowSection(false)
    }

    const handleDismiss = () => {
        if (window.gameClient) {
            if (studioType === "MAGIC_MIRROR") {
                console.log("Game signal to close magic mirror")
                if(window.gameClient){
                    window.gameClient.closeMagicMirror()
                }
            } else if (studioType === "UNIFORM_GUIDELINES") {
                if(window.gameClient){
                    window.gameClient.closeUniformViewer()
                }
            } else {
                console.log("GAME SIGNAL NOT AVAILABLE FOR THIS STUDIO TYPE")
            }
        } else {
            console.log("Game signal could not be executed since there is no game client")
        }
        dispatch(setItemId(null))
        dispatch(setMagicMirrorCompletion(null))
        dispatch(setPodiumCompletion(null))
        dispatch(openStyleStudio(false))
        dispatch(setStudioType(null))
        dispatch(setIsPodium(false))
        setShowSection(false)
    }

    return <div className="studio">
        <Navigation 
            isFirst={currentSectionIndex === 0} 
            isLast={
                studioType === "MAGIC_MIRROR"
                ? (
                    currentSectionIndex === data[gender].length - 1
                ) : (
                    studioType === "UNIFORM_GUIDELINES"
                    ? (
                        isPodium
                        ? (
                            currentSectionIndex === uniformFlow.tryon[gender].length - 1
                        ) : (
                            currentSectionIndex === uniformFlow.uniform_gallery[gender].length - 1
                        )
                    ) : (
                        false
                    )
                )
            } 
            isNextDisabled={!nextEligible}
            handleNextClick={handleNextClick} 
            handleBackClick={handleBackClick} 
            handleDismiss={handleDismiss} 
            setOnPodium={setOnPodium}
            onPodium={onPodium}
        />
        {
            !onPodium && (
                <div className={`section ${showSection ? "show" : ""}`}>
                    {
                        isTryout && data[gender][currentSectionIndex].tryoutContent && showSection &&
                        <TryOut 
                            active={showSection} 
                            tryoutData={data[gender][currentSectionIndex].tryoutContent} 
                            setNextEligible={setNextEligible} 
                        />
                    }
                    {
                        isTutorial && data[gender][currentSectionIndex].tutorial && showSection &&
                        <Tutorial 
                            active={showSection} 
                            tutorialData={data[gender][currentSectionIndex].tutorial} 
                            handleNextClick={handleNextClick} 
                        />
                    }
                    {
                        isFullScreenSlider && data[gender][currentSectionIndex].fullScreenSlider && showSection &&
                        <FullScreenSlider 
                            active={showSection} 
                            fullScreenSlider={data[gender][currentSectionIndex].fullScreenSlider} 
                            setNextEligible={setNextEligible} 
                        />
                    }
                    {
                        isUniformGuidelines &&
                        <UniformGuidelines 
                            itemId={itemId} 
                            isPodium={isPodium} 
                            setOnPodium={setOnPodium}
                            setNextEligible={setNextEligible}
                        />
                    }
                </div>
            )
        }
    </div>
}