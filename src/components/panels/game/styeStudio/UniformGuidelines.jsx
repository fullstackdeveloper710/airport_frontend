import React, {useState, useEffect} from "react"
import { BorderedButton } from "components/common/BorderedButton"
import { UniformAccordionGroup } from "./UniformAccordion";
import { setPodiumCompletion } from "store/reducers/styleStudio";
import { useSelector, useDispatch } from 'react-redux';

export const UniformGuidelines = ({ itemId, isPodium, setOnPodium, setNextEligible }) => {
    const [isAlreadyOn, setIsAlreadyOn] = useState(false)
    const {
        podiumCompletion
    } = useSelector((state) => state.styleStudio);

    const dispatch = useDispatch()

    useEffect(()=>{
        if(isPodium){
            const checkIsOn = podiumCompletion[itemId]
            setIsAlreadyOn(checkIsOn)
        }
    },[itemId, isPodium])

    const handleTryOnUniform = () => {
        if(window.gameClient){
            window.gameClient.tryUniform(itemId)
            setOnPodium(true)
            let completionData = {}
            completionData[itemId] = true
            dispatch(setPodiumCompletion({
                ...completionData
            }))
            setNextEligible(true)
        }
    }

    return (
        <>
            <div className="container">
                <div className="tutorial show">
                    <UniformAccordionGroup isPodium={isPodium} itemId={itemId} />
                </div>
            </div>
            {
                isPodium && !isAlreadyOn && (
                    <div className="tryOnBtn">
                        <BorderedButton onClick={handleTryOnUniform}>Try it on</BorderedButton>
                    </div>
                )
            }
        </>
    )
}